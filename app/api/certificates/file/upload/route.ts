import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const studentId = String(form.get("studentId") || "").trim();
    const file = form.get("file") as File | null;
    const cohort = String(form.get("cohort") || "").trim();
    const issuedAt = String(form.get("issuedAt") || "").trim();
    const displayName = String(form.get("displayName") || "").trim();
    if (!studentId || !file) {
      return NextResponse.json({ error: "studentId and file are required" }, { status: 400 });
    }

    const sb = getAdminSupabase();
    const bucket = process.env.CERT_BUCKET || "certificates";

    // Build a deterministic-ish path
    const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
    const folderParts = [cohort || "misc", issuedAt || "undated", studentId];
    const path = `${folderParts.join("/")}/${Date.now()}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await sb.storage.from(bucket).upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // Public URL (assuming bucket is public). If private, you can switch to signed URLs at view time.
    const { data: pub } = sb.storage.from(bucket).getPublicUrl(path);
    const fileUrl = pub.publicUrl;

    // Persist URL on student row if column exists
    try {
      const update: Record<string, unknown> = { file_url: fileUrl };
      if (displayName) update.file_display_name = displayName;
      await sb.from("students").update(update).eq("id", studentId);
    } catch {}

    return NextResponse.json({ fileUrl, path, displayName: displayName || null });
  } catch (e: unknown) {
    const msg = typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
