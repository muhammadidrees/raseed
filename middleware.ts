import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: Record<string, unknown>;
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicAdminPath =
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/auth/") ||
    path === "/admin/demo" ||
    path.startsWith("/admin/demo/");

  if (path.startsWith("/admin") && !isPublicAdminPath) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      // Preserve the originally-requested path so we can return after login
      const nextParam = path + (request.nextUrl.search || "");
      if (nextParam && nextParam !== "/admin") {
        loginUrl.searchParams.set("next", nextParam);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
