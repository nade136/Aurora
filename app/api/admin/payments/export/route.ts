import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import * as XLSX from "xlsx";

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
    return { ok: false as const, response: new NextResponse(null, { status: 404 }) };
  }
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getSession();
  if (error || !data?.session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const allowedEmail =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (allowedEmail && data.session.user.email !== allowedEmail) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const };
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.response!;

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "csv").toLowerCase();

  const admin = getAdminSupabase();
  const { data: rows, error } = await admin
    .from("payments")
    .select(
      "id, created_at, registration_id, amount, currency, provider, reference, status, paid_at, registrations(id, first_name, last_name, email, cohort, institution, current_position, role_category, social_url)"
    )
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load payments" },
      { status: 500 }
    );
  }

  const mapped = (rows || []).map((r: any) => ({
    Date: r.created_at,
    Name: `${r.registrations?.first_name || ""} ${r.registrations?.last_name || ""}`.trim(),
    Email: r.registrations?.email || "",
    Cohort: r.registrations?.cohort || "",
    Institution: r.registrations?.institution || "",
    CurrentRole: r.registrations?.current_position || "",
    RoleCategory: r.registrations?.role_category || "",
    Social: r.registrations?.social_url || "",
    Amount: r.amount ?? 0,
    Currency: r.currency || "NGN",
    Status: r.status || "",
    Reference: r.reference || "",
    Provider: r.provider || "paystack",
  }));

  const fileBase = `payments_${new Date().toISOString().slice(0,10)}`;

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(mapped);
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=\"${fileBase}.xlsx\"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV default
  const header = Object.keys(mapped[0] || { Date: "", Name: "" });
  const lines = [
    header.join(","),
    ...mapped.map((row) =>
      header
        .map((key) => {
          const v = (row as any)[key] ?? "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(",")
    ),
  ];
  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${fileBase}.csv\"`,
      "Cache-Control": "no-store",
    },
  });
}
