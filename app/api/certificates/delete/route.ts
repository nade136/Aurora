import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export type DeleteStudentBody = { id: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DeleteStudentBody;
    if (!body?.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const sb = getAdminSupabase();
    const { error } = await sb.from("students").delete().eq("id", body.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
