import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/supabase/env";
import { createAdminClient } from "@/supabase/admin";
import { trackServerAnalyticsEvent } from "@/services/analytics-service";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }
  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(`${origin}/login?error=missing_supabase_env`);
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        }
      }
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const user = data.user;
  const meta = (user.user_metadata ?? {}) as {
    name?: string;
    nickname?: string;
    role?: string;
    channel_type?: string;
    channel_handle?: string;
    channel_name?: string;
    channel_url?: string;
    follower_count?: number;
    friend_count?: number;
    verification_screenshot_url?: string;
    brand_name?: string;
    contact_name?: string;
  };

  const role = (meta.role === "brand" ? "brand" : "member") as "member" | "brand";

  const adminSupabase = createAdminClient();

  // 최초 인증 시 public.users 레코드 생성
  const { data: existing } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const name = meta.name ?? meta.contact_name ?? user.email!.split("@")[0];
    const nickname = meta.nickname ?? meta.brand_name ?? user.email!.split("@")[0];

    await adminSupabase.from("users").insert({
      id: user.id,
      role,
      name,
      nickname,
      email: user.email!,
      bio: "",
      level: 1,
      score: 0,
      completed_missions: 0,
      status: role === "brand" ? "pending" : "active"
    });

    // 멤버 채널 등록
    if (role === "member" && meta.channel_type && meta.channel_handle) {
      await adminSupabase.from("user_channels").insert({
        user_id: user.id,
        channel_type: meta.channel_type,
        channel_name: meta.channel_name ?? meta.channel_handle,
        channel_url: meta.channel_url ?? null,
        handle: meta.channel_handle,
        follower_count: meta.follower_count ?? 0,
        friend_count: meta.friend_count ?? null,
        verification_screenshot_url: meta.verification_screenshot_url ?? null,
        verification_status: "pending",
        is_verified: false,
        is_active: true
      });
    }

    await trackServerAnalyticsEvent({
      eventName: "sign_up_completed",
      path: "/auth/callback",
      userId: user.id,
      userRole: role
    });
  }

  // role에 따라 리다이렉트
  const effectiveRole = existing?.role ?? role;
  const redirectPath =
    effectiveRole === "admin" ? "/admin" :
    effectiveRole === "brand" ? "/brand" :
    "/member";

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
