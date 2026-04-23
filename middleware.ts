import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/supabase/env";

type AuthRole = "member" | "admin" | "brand";

const PROTECTED = ["/member", "/admin", "/brand"];
const AUTH_PAGES = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PAGES.some((p) => pathname === p);

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  // mock 모드: 인증 없이 통과
  if (!hasSupabaseEnv()) return NextResponse.next();

  const { url, anonKey } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (isAuthPath) return response;

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await getRequestUserRole(supabase, user.id, user.user_metadata);

  if (isAuthPath) {
    return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
  }

  const allowedPath = getAllowedPath(pathname, role);
  if (allowedPath) {
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/login", "/member/:path*", "/admin/:path*", "/brand/:path*"]
};

async function getRequestUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  metadata: Record<string, unknown>
): Promise<AuthRole> {
  const fallback = metadata.role === "admin" || metadata.role === "brand" ? metadata.role : "member";
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = data?.role;
  return role === "admin" || role === "brand" || role === "member" ? role : fallback;
}

function getAllowedPath(pathname: string, role: AuthRole) {
  if (role === "admin") return null;
  if (pathname.startsWith("/admin")) return getRoleHomePath(role);
  if (pathname.startsWith("/brand") && role !== "brand") return getRoleHomePath(role);
  if (pathname.startsWith("/member") && role !== "member") return getRoleHomePath(role);
  return null;
}

function getRoleHomePath(role: AuthRole) {
  if (role === "admin") return "/admin";
  if (role === "brand") return "/brand";
  return "/member";
}
