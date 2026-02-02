import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
  }

  const signature = req.headers.get("x-paystack-signature") || "";
  const rawBody = await req.text();

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = getAdminSupabase();

  try {
    if (event?.event === "charge.success") {
      const data = event.data || {};
      const reference: string = data.reference;
      const status: string = data.status; // success
      const paid_at: string | null = data.paid_at || null;
      const amountKobo: number = data.amount || 0;
      const amount = Math.round(amountKobo) / 100;
      const currency: string = data.currency || "NGN";
      const email: string | null = data.customer?.email || data?.metadata?.email || null;
      const metadata = data.metadata || {};

      // ensure registration
      let registrationId: string | null = null;
      if (email) {
        const { data: existing } = await supabase
          .from("registrations")
          .select("id")
          .eq("email", email)
          .limit(1);
        if (existing && existing[0]?.id) {
          registrationId = existing[0].id as string;
        } else {
          const insertRes = await supabase
            .from("registrations")
            .insert({
              cohort: metadata?.cohort || null,
              first_name: metadata?.first_name || null,
              last_name: metadata?.last_name || null,
              email,
              institution: metadata?.institution || null,
              current_position: metadata?.current_position || null,
              role_category: metadata?.role_category || null,
              social_url: metadata?.social_url || null,
            })
            .select("id")
            .single();
          if (insertRes.data?.id) registrationId = insertRes.data.id as string;
        }
      }

      await supabase.from("payments").upsert(
        {
          reference,
          amount,
          currency,
          status,
          paid_at,
          provider: "paystack",
          registration_id: registrationId,
          raw: event,
        },
        { onConflict: "reference" }
      );
    }
  } catch (e) {
    // swallow to allow Paystack to retry later
  }

  return NextResponse.json({ received: true });
}
