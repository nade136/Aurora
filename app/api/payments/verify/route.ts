import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export async function GET(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  console.log("[payments/verify] incoming", { reference });
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }
  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}` , {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    });
    const verifyJson = await verifyRes.json();
    console.log("[payments/verify] paystack response", {
      ok: verifyRes.ok,
      status: verifyRes.status,
      ref: reference,
    });
    if (!verifyRes.ok || !verifyJson?.status) {
      return NextResponse.json({ error: verifyJson?.message || "Failed to verify" }, { status: 400 });
    }

    const data = verifyJson.data;
    const status: string = data.status; // success | failed | abandoned
    const paid_at: string | null = data.paid_at || null;
    const amountKobo: number = data.amount || 0;
    const amount = Math.round(amountKobo) / 100;
    const currency: string = data.currency || "NGN";
    const email: string | null = data.customer?.email || data?.metadata?.email || null;
    const metadata = data.metadata || {};

    const supabase = getAdminSupabase();

    // Find or create registration by email
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
        if (insertRes.data?.id) {
          registrationId = insertRes.data.id as string;
        }
      }
    }

    // Upsert payment by reference
    await supabase.from("payments").upsert(
      {
        reference,
        amount,
        currency,
        status,
        paid_at,
        provider: "paystack",
        registration_id: registrationId,
        raw: verifyJson,
      },
      { onConflict: "reference" }
    );

    return NextResponse.json({ ok: true, status, paid_at, amount, currency });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
