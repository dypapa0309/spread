import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const meta = user.user_metadata as {
    name?: string;
    nickname?: string;
    channel_type?: string;
    channel_handle?: string;
    channel_name?: string;
    channel_url?: string;
    follower_count?: number;
    friend_count?: number;
  };

  // 이메일 인증 후 최초 로그인 시 public.users 레코드 생성
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existing && meta.name && meta.nickname) {
    await supabase.from("users").insert({
      id: user.id,
      role: "member",
      name: meta.name,
      nickname: meta.nickname,
      email: user.email!,
      bio: "",
      level: 1,
      score: 0,
      completed_missions: 0,
      status: "active"
    });

    if (meta.channel_type && meta.channel_handle) {
      await supabase.from("user_channels").insert({
        user_id: user.id,
        channel_type: meta.channel_type,
        channel_name: meta.channel_name ?? meta.channel_handle,
        channel_url: meta.channel_url ?? null,
        handle: meta.channel_handle,
        follower_count: meta.follower_count ?? 0,
        friend_count: meta.friend_count ?? null,
        verification_status: "pending",
        is_verified: false,
        is_active: true
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
