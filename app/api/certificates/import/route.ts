import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { generateCertificateCode } from "@/lib/certificates/code";

export type ImportRow = {
  name: string;
  email: string;
  issuedAt: string; // yyyy-MM-dd or parseable
  position?: string;
  fileName?: string; // optional prefill for display name
};

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function normalizeDate(input: string): string | null {
  // accept yyyy-MM-dd or other parseables, then output yyyy-MM-dd
  const d = new Date(input.includes("T") ? input : `${input}T00:00:00Z`);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }
    let body: { cohort?: string; rows?: ImportRow[]; batchId?: string };
    try {
      body = (await req.json()) as { cohort?: string; rows?: ImportRow[]; batchId?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const cohort = (body.cohort || "").trim();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!cohort) return NextResponse.json({ error: "cohort is required" }, { status: 400 });
    if (rows.length === 0) return NextResponse.json({ error: "rows is required" }, { status: 400 });

    const sb = getAdminSupabase();
    const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? "service" : "anon";
    const supabaseUrlUsed = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const batchId = (body.batchId && String(body.batchId).trim())
      ? String(body.batchId).trim()
      : ((globalThis as any).crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    const results: Array<{ index: number; status: "inserted" | "updated" | "skipped"; error?: string }> = [];
    let inserted = 0, updated = 0, skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = (r?.name || "").trim();
      const email = (r?.email || "").trim();
      const issuedAtNorm = normalizeDate(String(r?.issuedAt || ""));
      const position = (r?.position || "").trim() || null;
      const fileDisplayName = (r?.fileName || "").trim() || null;

      if (!name || !email || !issuedAtNorm) {
        results.push({ index: i, status: "skipped", error: "Missing required fields (name/email/issuedAt)" });
        skipped++; continue;
      }
      if (!isValidEmail(email)) {
        results.push({ index: i, status: "skipped", error: "Invalid email" });
        skipped++; continue;
      }

      try {
        // Check if row exists by (email, cohort, issued_at)
        const { data: existingSameKey } = await sb
          .from("students")
          .select("id")
          .eq("email", email)
          .eq("cohort", cohort)
          .eq("issued_at", issuedAtNorm)
          .maybeSingle();

        const issuedAtDate = new Date(`${issuedAtNorm}T00:00:00Z`);
        // Compute initial seq and cert_code
        let seq = 1;
        let cert_code = generateCertificateCode({ companyPrefix: "AURORA", cohort, fullName: name, issuedAt: issuedAtDate, seq });

        // Ensure unique cert_code by bumping seq up to 20 attempts (same as save route)
        for (let j = 0; j < 20; j++) {
          const { data: existingCode, error: codeErr } = await sb
            .from("students")
            .select("id")
            .eq("cert_code", cert_code)
            .maybeSingle();
          if (codeErr) break;
          if (!existingCode) break;
          seq += 1;
          cert_code = generateCertificateCode({ companyPrefix: "AURORA", cohort, fullName: name, issuedAt: issuedAtDate, seq });
        }

        if (existingSameKey?.id) {
          const updatePayload: any = {
            name,
            email,
            position,
            cohort,
            issued_at: issuedAtNorm,
            seq,
            cert_code,
            status: "active",
            import_batch_id: batchId,
          };
          if (fileDisplayName) updatePayload.file_display_name = fileDisplayName;

          const { error } = await sb
            .from("students")
            .update(updatePayload)
            .eq("id", existingSameKey.id);
          if (error) throw new Error(error.message);
          results.push({ index: i, status: "updated" });
          updated++;
        } else {
          const insertPayload: any = {
            name,
            email,
            position,
            cohort,
            issued_at: issuedAtNorm,
            seq,
            cert_code,
            status: "active",
            import_batch_id: batchId,
          };
          if (fileDisplayName) insertPayload.file_display_name = fileDisplayName;

          const { error } = await sb
            .from("students")
            .insert(insertPayload);
          if (error) throw new Error(error.message);
          results.push({ index: i, status: "inserted" });
          inserted++;
        }
      } catch (e: any) {
        results.push({ index: i, status: "skipped", error: e?.message || String(e) });
        skipped++;
      }
    }

    // Load rows for this batch for immediate preview on client
    const { data: batchRows, error: loadErr } = await sb
      .from("students")
      .select("id,name,email,cohort,issued_at,cert_code,file_display_name")
      .eq("import_batch_id", batchId)
      .order("created_at", { ascending: true });
    // Even if load fails, still return summary; client can fall back
    const payload: any = { summary: { inserted, updated, skipped }, results, batchId, keyType, supabaseUrlUsed };
    if (!loadErr && Array.isArray(batchRows)) payload.batchRows = batchRows;
    return NextResponse.json(payload);
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
