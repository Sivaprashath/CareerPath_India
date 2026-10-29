import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(req) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let session = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("[middleware] Supabase session error:", error.message);
    } else {
      session = data.session;
    }
  } catch (err) {
    console.warn("[middleware] Failed to get session:", err.message);
  }

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !session) {
    const redirectResponse = NextResponse.redirect(new URL("/login", req.url));
    req.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith("sb-")) {
        redirectResponse.cookies.delete(name);
      }
    });
    return redirectResponse;
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};