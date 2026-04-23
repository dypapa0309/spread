import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import { getChannelMissingFields } from "@/services/channel-validation";
import type { ChannelType, UserChannel } from "@/types/spread";

export const dynamic = "force-dynamic";

type UserChannelPayload = {
  channelType?: ChannelType;
  handle?: string;
  channelUrl?: string;
  followerCount?: number;
  friendCount?: number;
  verificationScreenshotUrl?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UserChannelPayload;
    const channelType = payload.channelType;

    if (!channelType || !["threads", "x", "wordpress", "kakao"].includes(channelType)) {
      return NextResponse.json({ ok: false, message: "채널을 선택해 주세요." }, { status: 400 });
    }

    const draft: Pick<UserChannel, "handle" | "channelUrl" | "followerCount" | "friendCount" | "verificationScreenshotUrl" | "isActive"> = {
      handle: payload.handle?.trim() ?? "",
      channelUrl: payload.channelUrl?.trim() || undefined,
      followerCount: Number(payload.followerCount) || 0,
      friendCount: payload.friendCount === undefined ? undefined : Number(payload.friendCount) || 0,
      verificationScreenshotUrl: payload.verificationScreenshotUrl?.trim() || undefined,
      isActive: true
    };
    const missingFields = getChannelMissingFields(channelType, draft);
    if (missingFields.length) {
      return NextResponse.json(
        { ok: false, message: `필수 정보를 입력해 주세요: ${missingFields.join(", ")}`, missingFields },
        { status: 400 }
      );
    }

    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });

    const adminSupabase = createAdminClient();
    const payloadForDb = {
      user_id: user.id,
      channel_type: channelType,
      channel_name: draft.handle,
      channel_url: channelType === "kakao" ? null : draft.channelUrl ?? null,
      handle: draft.handle,
      follower_count: channelType === "kakao" ? 0 : draft.followerCount,
      friend_count: channelType === "kakao" ? draft.friendCount ?? 0 : null,
      verification_screenshot_url: draft.verificationScreenshotUrl ?? null,
      verification_status: "pending",
      is_verified: false,
      is_active: true
    };

    const { data: existing } = await adminSupabase
      .from("user_channels")
      .select("id")
      .eq("user_id", user.id)
      .eq("channel_type", channelType)
      .maybeSingle();

    const { data, error } = existing?.id
      ? await adminSupabase
          .from("user_channels")
          .update(payloadForDb)
          .eq("id", existing.id)
          .select("id")
          .single()
      : await adminSupabase
          .from("user_channels")
          .insert(payloadForDb)
          .select("id")
          .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: `채널 저장 실패: ${error?.message ?? "알 수 없는 오류"}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true, channelId: data.id, message: "채널 정보가 저장되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "채널 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
