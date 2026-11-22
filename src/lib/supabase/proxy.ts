import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifies the login token. Do not remove or move this line.
  const { data } = await supabase.auth.getClaims();
  const loggedIn = !!data?.claims;

  const { pathname } = request.nextUrl;
  const onAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!loggedIn && !onAuthPage) return redirectTo(request, supabaseResponse, "/login");
  if (loggedIn && onAuthPage) return redirectTo(request, supabaseResponse, "/dashboard");

  return supabaseResponse;
}

// Redirect while keeping the refreshed login cookies
function redirectTo(request: NextRequest, supabaseResponse: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  const response = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = supabaseResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  }
  return response;
}