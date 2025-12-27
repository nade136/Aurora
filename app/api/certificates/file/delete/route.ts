import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function extractPathFromPublicUrl(url: string, bucket: string): string | null {
  try {
    const u = new URL(url);
    const idx = u.pathname.indexOf(`/storage/v1/object/public/${bucket}/`);
    if (idx >= 0) {
      return u.pathname.slice(idx + `/storage/v1/object/public/${bucket}/`.length);
    }
    const alt = u.pathname.indexOf(`/object/public/${bucket}/`);
    if (alt >= 0) {
      return u.pathname.slice(alt + `/object/public/${bucket}/`.length);
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { studentId, fileUrl } = (await req.json()) as { studentId?: string; fileUrl?: string };
    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

    const sb = getAdminSupabase();
    const bucket = process.env.CERT_BUCKET || "certificates";

    if (fileUrl) {
      const path = extractPathFromPublicUrl(fileUrl, bucket);
      if (path) {
        await sb.storage.from(bucket).remove([path]);
      }
    }

    await sb.from("students").update({ file_url: null }).eq("id", studentId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
