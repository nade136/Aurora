import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const code = (params?.code || "").trim();
  if (!code) {
    return NextResponse.redirect(new URL("/book-slot", request.url));
  }

  const supabase = await supabaseServer();

  // Look up active referral (case-insensitive)
  const { data: ref } = await supabase
    .from("referral_links")
    .select("id, code, active")
    .ilike("code", code)
    .eq("active", true)
    .maybeSingle();

  const finalCode = ref?.code || code.toUpperCase();

  // Log click (best-effort)
  if (ref?.id) {
    try {
      const ip = request.headers.get("x-forwarded-for") || '';
      const ua = request.headers.get("user-agent") || "";
      await supabase.from("referral_clicks").insert({ 
        referral_id: ref.id, 
        code: ref.code, 
        ip, 
        user_agent: ua 
      });
    } catch (error) {
      console.error('Failed to log referral click:', error);
    }
  }

  // Set cookie for 30 days
  const url = new URL("/book-slot", request.url);
  url.searchParams.set("ref", finalCode);
  const res = NextResponse.redirect(url);
  res.cookies.set("ref", finalCode, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
