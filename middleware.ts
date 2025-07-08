import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/facilities"];

  // Check if the current route is a public route or a dynamic facility detail page
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/facilities/") ||
    pathname.startsWith("/_next/") || // Next.js internal files
    pathname.startsWith("/api/") || // API routes
    /\.(.*)$/.test(pathname); // static files

  if (!user && !isPublicRoute) {
    // If not logged in and not on a public route, redirect to auth
    return NextResponse.redirect(`${origin}/auth`);
  }

  if (user && pathname === "/auth") {
    // If logged in and on the auth page, redirect to the landing page
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
