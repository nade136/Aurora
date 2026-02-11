import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

const truthy = (v?: string) => {
  if (!v) return false;
  const vv = v.trim().toLowerCase();
  return vv === "true" || vv === "1" || vv === "yes";
};

async function requireAdmin(req: Request) {
  const adminEnabled =
    truthy(process.env.ADMIN_ENABLED) ||
    truthy(process.env.NEXT_PUBLIC_ADMIN_ENABLED);
  if (!adminEnabled) {
    return { ok: false, response: new NextResponse(null, { status: 404 }) };
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getSession();
  if (error || !data?.session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowedEmail =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (allowedEmail && data.session.user.email !== allowedEmail) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function GET(req: Request) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return adminCheck.response!;

  const admin = getAdminSupabase();
  const { data, error } = await admin
    .from("payment_settings")
    .select("id, updated_at, amount, currency, current_cohort")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data?.[0] || null });
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return adminCheck.response!;

  let payload: {
    amount?: number;
    currency?: string;
    current_cohort?: string | null;
  };
  try {
    payload = (await req.json()) as {
      amount?: number;
      currency?: string;
      current_cohort?: string | null;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(payload.amount || 0);
  const currency = (payload.currency || "NGN").toUpperCase();
  const current_cohort = (payload.current_cohort || "").trim() || null;

  const admin = getAdminSupabase();
  const { data: existing, error: readError } = await admin
    .from("payment_settings")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (readError) {
    return NextResponse.json(
      { error: readError.message || "Failed to load settings" },
      { status: 500 }
    );
  }

  const id = existing?.[0]?.id as string | undefined;
  if (id) {
    const { data, error } = await admin
      .from("payment_settings")
      .update({
        amount,
        currency,
        current_cohort,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, updated_at, amount, currency, current_cohort")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await admin
    .from("payment_settings")
    .insert({ amount, currency, current_cohort })
    .select("id, updated_at, amount, currency, current_cohort")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
