import { campaignApplications, currentMember, getCampaignViews, submissions, userPenalties } from "@/lib/mock-data";
import type {
  AutoCheckIssue,
  AutoCheckResult,
  CampaignView,
  ChannelType,
  SubmissionEligibility,
  SubmissionStatus
} from "@/types/spread";

export type SubmissionAutoCheckInput = {
  campaignId: string;
  channelType: ChannelType;
  postUrl?: string;
  postText: string;
  screenshotUrl?: string;
};

const mockNow = new Date("2026-04-23T02:00:00.000Z");

const channelHosts: Record<ChannelType, string[]> = {
  threads: ["threads.net"],
  x: ["x.com", "twitter.com"],
  wordpress: [],
  kakao: ["story.kakao.com", "pf.kakao.com"]
};

export function normalizeSubmissionUrl(url?: string) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

export function validateSubmissionUrl(channelType: ChannelType, url?: string) {
  if (channelType === "kakao" && !url) {
    return { ok: true, isPublicLikely: false };
  }

  const normalized = normalizeSubmissionUrl(url);
  if (!normalized) return { ok: false, isPublicLikely: false };

  try {
    const parsed = new URL(normalized);
    const allowedHosts = channelHosts[channelType];
    const ok =
      channelType === "wordpress"
        ? Boolean(parsed.hostname.includes(".") && !parsed.hostname.includes("localhost"))
        : allowedHosts.some((host) => parsed.hostname.includes(host));

    return { ok, isPublicLikely: parsed.protocol === "https:" };
  } catch {
    return { ok: false, isPublicLikely: false };
  }
}

export function calculateEngagementScore(metrics: {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  clicksCount: number;
  savesCount: number;
  viewsCount: number;
}) {
  const weighted =
    metrics.likesCount * 1 +
    metrics.commentsCount * 3 +
    metrics.sharesCount * 4 +
    metrics.clicksCount * 2 +
    metrics.savesCount * 2.5;
  return Math.round((weighted / Math.max(metrics.viewsCount, 1)) * 1000);
}

export function determineSubmissionStatus(result: AutoCheckResult, campaign: CampaignView): SubmissionStatus {
  if (result.hasProhibitedExpression || !result.isAllowedChannel || result.isDuplicate) {
    return campaign.guideline.autoRejectionEnabled ? "auto_rejected" : "needs_review";
  }

  if (result.score >= 82 && campaign.guideline.autoApprovalEnabled && campaign.reviewMode === "auto") {
    return "auto_approved";
  }

  if (result.score >= 78 && campaign.guideline.autoApprovalEnabled && campaign.reviewMode === "semi_auto") {
    return "needs_review";
  }

  if (result.score < 50) {
    return campaign.guideline.autoRejectionEnabled ? "auto_rejected" : "needs_review";
  }

  return "needs_review";
}

export function calculateDeadlinePenalty(dueAt: string, submittedAt = mockNow) {
  const due = new Date(dueAt);
  const diffMs = submittedAt.getTime() - due.getTime();
  if (diffMs <= 0) return { daysLate: 0, suspensionDays: 0 };

  const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return { daysLate, suspensionDays: daysLate * 3 };
}

export function checkSubmissionEligibility(campaignId: string, userId = currentMember.id): SubmissionEligibility {
  const campaign = getCampaignViews().find((item) => item.id === campaignId);
  if (!campaign) {
    return { canSubmit: false, reason: "campaign_missing", message: "캠페인을 찾을 수 없습니다." };
  }

  const activePenalty = userPenalties.find((penalty) => {
    const startsAt = new Date(penalty.startsAt);
    const endsAt = new Date(penalty.endsAt);
    return penalty.userId === userId && startsAt <= mockNow && endsAt > mockNow;
  });

  if (activePenalty) {
    return {
      canSubmit: false,
      reason: "penalty",
      message: `제출 기한 초과 패널티로 ${new Date(activePenalty.endsAt).toLocaleDateString("ko-KR")}까지 사용이 제한됩니다.`,
      penalty: activePenalty
    };
  }

  const application = campaignApplications.find(
    (item) => item.campaignId === campaignId && item.userId === userId
  );

  if (!application) {
    return { canSubmit: false, reason: "not_applied", message: "먼저 캠페인에 신청해야 합니다." };
  }

  if (application.status === "applied") {
    return { canSubmit: false, reason: "pending", message: "관리자 선정이 끝난 뒤 제출할 수 있습니다." };
  }

  if (application.status === "rejected") {
    return { canSubmit: false, reason: "rejected", message: "이번 캠페인에는 선정되지 않았습니다." };
  }

  if (application.status === "cancelled") {
    return { canSubmit: false, reason: "not_applied", message: "취소된 신청입니다. 다시 신청해 주세요." };
  }

  return { canSubmit: true, reason: "selected", message: "선정된 캠페인입니다. 제출할 수 있습니다." };
}

export function runSubmissionAutoCheck(input: SubmissionAutoCheckInput): AutoCheckResult {
  const campaign = getCampaignViews().find((item) => item.id === input.campaignId);
  if (!campaign) {
    return failedResult("campaign_missing", "캠페인을 찾을 수 없습니다.");
  }

  const normalizedUrl = normalizeSubmissionUrl(input.postUrl);
  const urlCheck = validateSubmissionUrl(input.channelType, normalizedUrl);
  const text = input.postText.toLowerCase();
  const requiredTokens = [
    campaign.productName,
    ...campaign.guideline.requiredHashtags,
    ...campaign.guideline.requiredLinks
  ].filter(Boolean);

  const keywordHits = requiredTokens.filter((token) => text.includes(token.toLowerCase())).length;
  const hasRequiredKeywords = keywordHits >= Math.min(campaign.guideline.requiredKeywordCount, requiredTokens.length);
  const hasProhibitedExpression = campaign.guideline.prohibitedExpressions.some((word) =>
    text.includes(word.toLowerCase())
  );
  const isAllowedChannel = campaign.channels.includes(input.channelType);
  const isDuplicate = Boolean(normalizedUrl && submissions.some((submission) => normalizeSubmissionUrl(submission.postUrl) === normalizedUrl));
  const meetsMinLength = input.postText.trim().length >= campaign.guideline.minTextLength;
  const needsScreenshot = input.channelType === "kakao" && !input.screenshotUrl;

  const issues: AutoCheckIssue[] = [
    issue(urlCheck.ok, "url", "URL 형식"),
    issue(isAllowedChannel, "channel", "허용 채널"),
    issue(!isDuplicate, "duplicate", "중복 제출"),
    issue(urlCheck.isPublicLikely || input.channelType === "kakao", "public", "공개 링크 추정"),
    issue(hasRequiredKeywords, "keyword", "필수 키워드"),
    issue(!hasProhibitedExpression, "prohibited", "금지 표현"),
    issue(meetsMinLength, "length", "최소 길이"),
    issue(!needsScreenshot, "screenshot", "스크린샷 인증")
  ];

  const score = issues.reduce((sum, item) => {
    if (item.severity === "pass") return sum + 12.5;
    if (item.severity === "warn") return sum + 6;
    return sum;
  }, 0);

  return {
    isValidUrl: urlCheck.ok,
    isAllowedChannel,
    isDuplicate,
    isPublicLikely: urlCheck.isPublicLikely,
    hasRequiredKeywords,
    hasProhibitedExpression,
    meetsMinLength,
    needsScreenshot,
    score: Math.round(score),
    issues
  };
}

function issue(pass: boolean, code: string, label: string): AutoCheckIssue {
  return { code, label, severity: pass ? "pass" : "fail" };
}

function failedResult(code: string, label: string): AutoCheckResult {
  return {
    isValidUrl: false,
    isAllowedChannel: false,
    isDuplicate: false,
    isPublicLikely: false,
    hasRequiredKeywords: false,
    hasProhibitedExpression: false,
    meetsMinLength: false,
    needsScreenshot: false,
    score: 0,
    issues: [{ code, label, severity: "fail" }]
  };
}
