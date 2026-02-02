import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

const truthy = (v?: string) => {
  if (!v) return false;
  const vv = v.trim().toLowerCase();
  return vv === "true" || vv === "1" || vv === "yes";
};

export async function GET(req: Request) {
  const adminEnabled =
    truthy(process.env.ADMIN_ENABLED) ||
    truthy(process.env.NEXT_PUBLIC_ADMIN_ENABLED);
  if (!adminEnabled) {
    return new NextResponse(null, { status: 404 });
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getSession();
  if (error || !data?.session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const allowedEmail =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (allowedEmail && data.session.user.email !== allowedEmail) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || "100");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 500)
    : 100;

  const admin = getAdminSupabase();
  const { data: rows, error: dbError } = await admin
    .from("payments")
    .select(
      "id, created_at, registration_id, amount, currency, provider, reference, status, paid_at, registrations(*)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (dbError) {
    return NextResponse.json(
      { error: dbError.message || "Failed to load payments" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: rows || [] });
}
