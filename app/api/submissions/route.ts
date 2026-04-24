import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import { trackServerAnalyticsEvent } from "@/services/analytics-service";
import { normalizeSubmissionUrl, validateSubmissionUrl } from "@/services/submission-auto-check";
import type { ChannelType, SubmissionStatus } from "@/types/spread";

export const dynamic = "force-dynamic";

type ChannelSubmissionPayload = {
  channelType: ChannelType;
  postUrl?: string;
  postText?: string;
  screenshotUrl?: string;
  postedAt?: string;
};

type SubmitPayload = {
  campaignId?: string;
  submissions?: ChannelSubmissionPayload[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmitPayload;
    const campaignId = payload.campaignId?.trim();
    const submissions = payload.submissions ?? [];

    if (!campaignId) return NextResponse.json({ ok: false, message: "캠페인 정보가 없습니다." }, { status: 400 });
    if (!submissions.length) return NextResponse.json({ ok: false, message: "제출할 채널 정보가 없습니다." }, { status: 400 });

    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: campaign } = await adminSupabase
      .from("campaigns")
      .select("id, review_mode, campaign_channels(channel_type), campaign_guidelines(*)")
      .eq("id", campaignId)
      .maybeSingle();
    if (!campaign) return NextResponse.json({ ok: false, message: "캠페인을 찾을 수 없습니다." }, { status: 404 });

    const requiredChannels = ((campaign.campaign_channels ?? []) as { channel_type: ChannelType }[]).map((item) => item.channel_type);
    const submittedChannels = submissions.map((item) => item.channelType);
    const missingChannels = requiredChannels.filter((channelType) => !submittedChannels.includes(channelType));
    if (missingChannels.length) {
      return NextResponse.json({ ok: false, message: "모든 필수 채널을 제출해 주세요.", missingChannels }, { status: 400 });
    }

    const { data: selectedApplications } = await adminSupabase
      .from("campaign_applications")
      .select("channel_type, status")
      .eq("campaign_id", campaignId)
      .eq("user_id", user.id)
      .eq("status", "selected");
    const selectedChannels = (selectedApplications ?? []).map((item) => item.channel_type as ChannelType);
    const notSelected = requiredChannels.filter((channelType) => !selectedChannels.includes(channelType));
    if (notSelected.length) {
      return NextResponse.json({ ok: false, message: "선정된 필수 채널만 제출할 수 있습니다.", notSelected }, { status: 403 });
    }

    const { data: existingSubmissions } = await adminSupabase
      .from("submissions")
      .select("channel_type")
      .eq("campaign_id", campaignId)
      .eq("user_id", user.id)
      .in("channel_type", requiredChannels);
    if (existingSubmissions?.length) {
      return NextResponse.json({
        ok: false,
        message: `이미 제출한 채널이 있습니다: ${existingSubmissions.map((item) => item.channel_type).join(", ")}`
      }, { status: 400 });
    }

    const guideline = Array.isArray(campaign.campaign_guidelines) ? campaign.campaign_guidelines[0] : undefined;
    const minTextLength = Number(guideline?.min_text_length ?? 80);
    const prohibitedExpressions = (guideline?.prohibited_expressions ?? []) as string[];
    const now = new Date().toISOString();

    const rows = submissions.map((item) => {
      const text = item.postText?.trim() ?? "";
      const normalizedUrl = normalizeSubmissionUrl(item.postUrl);
      const urlCheck = validateSubmissionUrl(item.channelType, normalizedUrl);
      const hasProhibitedExpression = prohibitedExpressions.some((word) => text.toLowerCase().includes(word.toLowerCase()));
      const needsScreenshot = item.channelType === "kakao" && !item.screenshotUrl?.trim();
      const meetsMinLength = text.length >= minTextLength;
      const status: SubmissionStatus =
        hasProhibitedExpression || needsScreenshot || !meetsMinLength || !urlCheck.ok
          ? "needs_review"
          : campaign.review_mode === "auto"
            ? "auto_approved"
            : "needs_review";
      const score = [!hasProhibitedExpression, !needsScreenshot, meetsMinLength, urlCheck.ok].filter(Boolean).length * 25;

      return {
        campaign_id: campaignId,
        user_id: user.id,
        channel_type: item.channelType,
        post_url: normalizedUrl ?? null,
        post_text: text,
        screenshot_url: item.screenshotUrl?.trim() || null,
        posted_at: item.postedAt ? new Date(item.postedAt).toISOString() : now,
        submitted_at: now,
        status,
        auto_check_score: score,
        auto_check_result: {
          isValidUrl: urlCheck.ok,
          isAllowedChannel: requiredChannels.includes(item.channelType),
          isDuplicate: false,
          isPublicLikely: urlCheck.isPublicLikely,
          hasRequiredKeywords: true,
          hasProhibitedExpression,
          meetsMinLength,
          needsScreenshot,
          score,
          issues: []
        }
      };
    });

    const { data, error } = await adminSupabase.from("submissions").insert(rows).select("id");
    if (error) return NextResponse.json({ ok: false, message: `제출 저장 실패: ${error.message}` }, { status: 400 });

    await Promise.all(
      submissions.map((item) =>
        trackServerAnalyticsEvent({
          eventName: "submission_completed",
          path: `/member/submit/${campaignId}`,
          campaignId,
          channelType: item.channelType,
          userId: user.id,
          userRole: "member"
        })
      )
    );

    return NextResponse.json({ ok: true, submissionIds: (data ?? []).map((item) => item.id), message: "제출이 저장되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "제출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
