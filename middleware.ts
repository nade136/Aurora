import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Hard block admin/auth unless explicitly enabled
  const adminEnabled = process.env.ADMIN_ENABLED === "true";
  const path = req.nextUrl.pathname;
  if (!adminEnabled && (path.startsWith("/admin") || path.startsWith("/auth"))) {
    // Return 404 to avoid exposing auth surface in production when disabled
    return new NextResponse(null, { status: 404 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
    const allowedEmail = process.env.ADMIN_EMAIL;
    if (allowedEmail && session.user.email !== allowedEmail) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("error", "not_authorized");
      return NextResponse.redirect(signInUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
