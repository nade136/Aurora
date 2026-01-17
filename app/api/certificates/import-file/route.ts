import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { generateCertificateCode } from "@/lib/certificates/code";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function toYmd(val: string): string | null {
  const s = String(val || "").trim();
  if (!s) return null;
  const d = new Date(s.includes("T") ? s : `${s}T00:00:00Z`);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s.*)?$/);
  if (m1) {
    const M = Number(m1[1]);
    const D = Number(m1[2]);
    const Y = Number(m1[3].length === 2 ? `20${m1[3]}` : m1[3]);
    const mm = String(M).padStart(2, "0");
    const dd = String(D).padStart(2, "0");
    return `${Y}-${mm}-${dd}`;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 415 });
    }
    const form = await req.formData();
    const cohort = String(form.get("cohort") || "").trim();
    const file = form.get("file") as File | null;
    if (!cohort || !file) {
      return NextResponse.json({ error: "cohort and file are required" }, { status: 400 });
    }

    // Optional mapping hints from the client
    const mapName = String(form.get("mapName") || "");
    const mapEmail = String(form.get("mapEmail") || "");
    const mapIssuedAt = String(form.get("mapIssuedAt") || "");
    const mapPosition = String(form.get("mapPosition") || "");
    const mapFileName = String(form.get("mapFileName") || "");

    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    // Parse CSV or XLSX
    let headers: string[] = [];
    let rows: string[][] = [];
    const lowerName = (file.name || "").toLowerCase();
    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      const wb = XLSX.read(buf, { type: "buffer" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rowsArrayRaw: unknown[] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
      const rowsArray: string[][] = (rowsArrayRaw as unknown[]).map((row) => {
        const arr = Array.isArray(row) ? (row as unknown[]) : [];
        return arr.map((cell) => String(cell ?? ""));
      });
      headers = (rowsArray[0] || []).map((h) => String(h || "").trim());
      rows = (rowsArray.slice(1) || []).map((r) => headers.map((_, i) => String(r[i] ?? "")));
    } else {
      const text = buf.toString("utf8");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
      const split = (l: string) => l.split(",").map((s) => s.replace(/^\"|\"$/g, "").trim());
      headers = split(lines[0]);
      rows = lines.slice(1).map(split);
    }

    const lower = headers.map((h) => h.toLowerCase());
    const findIdx = (name: string, fallback?: (s: string) => boolean) => {
      if (name) {
        const i = headers.indexOf(name);
        if (i >= 0) return i;
      }
      if (fallback) return lower.findIndex(fallback);
      return -1;
    };

    const idxName = findIdx(mapName, (s) => /^(name|full\s*name)$/.test(s));
    const idxEmail = findIdx(mapEmail, (s) => s.includes("email"));
    const idxIssued = findIdx(mapIssuedAt, (s) => s.includes("issued") || s.includes("date") || s.includes("time"));
    const idxPosition = findIdx(mapPosition, (s) => s.includes("position") || s.includes("title") || s.includes("role"));
    const idxFile = findIdx(mapFileName, (s) => s.includes("file") || s.includes("document") || s.includes("certificate"));

    const mapped: Array<{ name: string; email: string; issuedAt: string; position?: string; fileName?: string }> = [];
    for (const r of rows) {
      let name = idxName >= 0 ? (r[idxName] || "").trim() : "";
      if (!name) {
        const fIdx = lower.findIndex((s) => s.includes("first") || s.includes("given"));
        const lIdx = lower.findIndex((s) => s.includes("last") || s.includes("surname") || s.includes("family"));
        const first = fIdx >= 0 ? (r[fIdx] || "").trim() : "";
        const last = lIdx >= 0 ? (r[lIdx] || "").trim() : "";
        name = [first, last].filter(Boolean).join(" ");
      }
      const email = idxEmail >= 0 ? (r[idxEmail] || "").trim() : "";
      const issuedNorm = toYmd(idxIssued >= 0 ? r[idxIssued] || "" : "");
      const position = idxPosition >= 0 ? (r[idxPosition] || "").trim() : undefined;
      const fileName = idxFile >= 0 ? (r[idxFile] || "").trim() : undefined;
      if (!name || !email || !issuedNorm || !isValidEmail(email)) continue;
      mapped.push({ name, email, issuedAt: issuedNorm, position, fileName });
    }

    if (mapped.length === 0) {
      return NextResponse.json({ error: "No valid rows after parsing" }, { status: 400 });
    }

    const sb = getAdminSupabase();
    const batchId = ((globalThis as any).crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    let inserted = 0, updated = 0, skipped = 0;
    for (let i = 0; i < mapped.length; i++) {
      const r = mapped[i];
      try {
        const { data: existingSameKey } = await sb
          .from("students")
          .select("id")
          .eq("email", r.email)
          .eq("cohort", cohort)
          .eq("issued_at", r.issuedAt)
          .maybeSingle();

        const issuedAtDate = new Date(`${r.issuedAt}T00:00:00Z`);
        let seq = 1;
        let cert_code = generateCertificateCode({ companyPrefix: "AURORA", cohort, fullName: r.name, issuedAt: issuedAtDate, seq });
        for (let j = 0; j < 20; j++) {
          const { data: existingCode } = await sb
            .from("students")
            .select("id")
            .eq("cert_code", cert_code)
            .maybeSingle();
          if (!existingCode) break;
          seq += 1;
          cert_code = generateCertificateCode({ companyPrefix: "AURORA", cohort, fullName: r.name, issuedAt: issuedAtDate, seq });
        }

        if (existingSameKey?.id) {
          const updatePayload: any = {
            name: r.name,
            email: r.email,
            position: r.position || null,
            cohort,
            issued_at: r.issuedAt,
            seq,
            cert_code,
            status: "active",
            import_batch_id: batchId,
          };
          if (r.fileName) updatePayload.file_display_name = r.fileName;
          const { error } = await sb.from("students").update(updatePayload).eq("id", existingSameKey.id);
          if (error) throw new Error(error.message);
          updated++;
        } else {
          const insertPayload: any = {
            name: r.name,
            email: r.email,
            position: r.position || null,
            cohort,
            issued_at: r.issuedAt,
            seq,
            cert_code,
            status: "active",
            import_batch_id: batchId,
          };
          if (r.fileName) insertPayload.file_display_name = r.fileName;
          const { error } = await sb.from("students").insert(insertPayload);
          if (error) throw new Error(error.message);
          inserted++;
        }
      } catch (e: any) {
        skipped++;
      }
    }

    return NextResponse.json({ summary: { inserted, updated, skipped }, batchId });
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
