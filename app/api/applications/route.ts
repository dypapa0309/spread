import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import { getChannelMissingFields } from "@/services/channel-validation";
import type { ChannelType, UserChannel } from "@/types/spread";

export const dynamic = "force-dynamic";

type ApplyPayload = {
  campaignId?: string;
  message?: string;
  applicationPrivacyAgreed?: boolean;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ApplyPayload;
    const campaignId = payload.campaignId?.trim();
    const message = payload.message?.trim() ?? "";

    if (!campaignId) {
      return NextResponse.json({ ok: false, message: "캠페인 정보가 없습니다." }, { status: 400 });
    }
    if (!payload.applicationPrivacyAgreed) {
      return NextResponse.json({ ok: false, message: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
    }

    const userSupabase = await createClient();
    const { data: { user: authUser } } = await userSupabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("users")
      .select("id, role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profile?.role !== "member") {
      return NextResponse.json({ ok: false, message: "사용자 계정만 캠페인에 신청할 수 있습니다." }, { status: 403 });
    }

    const now = new Date();
    const { data: activePenalty } = await adminSupabase
      .from("user_penalties")
      .select("id, ends_at")
      .eq("user_id", authUser.id)
      .lte("starts_at", now.toISOString())
      .gt("ends_at", now.toISOString())
      .maybeSingle();

    if (activePenalty) {
      return NextResponse.json(
        { ok: false, message: `사용 제한 중입니다. ${new Date(activePenalty.ends_at as string).toLocaleDateString("ko-KR")} 이후 신청할 수 있습니다.` },
        { status: 403 }
      );
    }

    const { data: campaign } = await adminSupabase
      .from("campaigns")
      .select("id, status, apply_end_at, campaign_channels(channel_type)")
      .eq("id", campaignId)
      .maybeSingle();

    if (!campaign) return NextResponse.json({ ok: false, message: "캠페인을 찾을 수 없습니다." }, { status: 404 });
    if (campaign.status !== "open") {
      return NextResponse.json({ ok: false, message: "현재 신청 가능한 캠페인이 아닙니다." }, { status: 400 });
    }
    if (campaign.apply_end_at && new Date(campaign.apply_end_at as string).getTime() < now.getTime()) {
      return NextResponse.json({ ok: false, message: "신청 마감이 지난 캠페인입니다." }, { status: 400 });
    }

    const requiredChannels = ((campaign.campaign_channels ?? []) as { channel_type: ChannelType }[])
      .map((item) => item.channel_type);
    if (!requiredChannels.length) {
      return NextResponse.json({ ok: false, message: "캠페인 채널 설정이 없습니다." }, { status: 400 });
    }

    const { data: existing } = await adminSupabase
      .from("campaign_applications")
      .select("id, status")
      .eq("campaign_id", campaignId)
      .eq("user_id", authUser.id);

    if (existing?.length) {
      return NextResponse.json({
        ok: true,
        alreadyApplied: true,
        message: "이미 신청한 캠페인입니다.",
        applicationIds: existing.map((item) => item.id)
      });
    }

    const { data: channelRows } = await adminSupabase
      .from("user_channels")
      .select("*")
      .eq("user_id", authUser.id)
      .in("channel_type", requiredChannels);

    const channelMap = new Map(
      ((channelRows ?? []) as UserChannelRowLike[]).map((row) => [
        row.channel_type,
        {
          handle: row.handle,
          channelUrl: row.channel_url ?? undefined,
          followerCount: row.follower_count ?? 0,
          friendCount: row.friend_count ?? undefined,
          verificationScreenshotUrl: row.verification_screenshot_url ?? undefined,
          isActive: Boolean(row.is_active)
        } satisfies Pick<UserChannel, "handle" | "channelUrl" | "followerCount" | "friendCount" | "verificationScreenshotUrl" | "isActive">
      ])
    );

    const missingChannels = requiredChannels
      .map((channelType) => ({
        channelType,
        missingFields: getChannelMissingFields(channelType, channelMap.get(channelType))
      }))
      .filter((item) => item.missingFields.length > 0);

    if (missingChannels.length) {
      return NextResponse.json(
        { ok: false, message: "필수 채널 정보를 먼저 등록해 주세요.", missingChannels },
        { status: 400 }
      );
    }

    const agreedAt = now.toISOString();
    const { data: inserted, error } = await adminSupabase
      .from("campaign_applications")
      .insert(requiredChannels.map((channelType) => ({
        campaign_id: campaignId,
        user_id: authUser.id,
        channel_type: channelType,
        message,
        status: "applied",
        application_privacy_agreed: true,
        application_privacy_agreed_at: agreedAt
      })))
      .select("id");

    if (error) {
      return NextResponse.json({ ok: false, message: `신청 저장 실패: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      alreadyApplied: false,
      message: "신청이 접수되었습니다.",
      applicationIds: (inserted ?? []).map((item) => item.id)
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "신청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

type UserChannelRowLike = {
  channel_type: ChannelType;
  handle: string;
  channel_url: string | null;
  follower_count: number | null;
  friend_count: number | null;
  verification_screenshot_url: string | null;
  is_active: boolean | null;
};
