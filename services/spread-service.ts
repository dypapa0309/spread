import {
  brands,
  campaignApplications,
  currentAdmin,
  currentMember,
  campaigns,
  fulfillmentInfos,
  getCampaignViews,
  getSubmissionViews,
  userPenalties,
  users,
  userChannels
} from "@/lib/mock-data";
import type {
  ApplicationStatus,
  CampaignDraftPreset,
  CampaignApplicationView,
  CampaignStatus,
  ChannelType,
  FulfillmentInfo,
  SubmissionChecklistItem,
  SubmissionStatus,
  UserPenalty
} from "@/types/spread";

export const appMode = process.env.NEXT_PUBLIC_APP_MODE ?? "mock";

export async function listCampaigns(filters?: {
  query?: string;
  status?: CampaignStatus | "all";
  channel?: string;
  format?: string;
}) {
  const campaigns = getCampaignViews();
  return campaigns.filter((campaign) => {
    const queryMatch = filters?.query
      ? `${campaign.title} ${campaign.brand.name} ${campaign.summary}`.toLowerCase().includes(filters.query.toLowerCase())
      : true;
    const statusMatch = !filters?.status || filters.status === "all" ? true : campaign.status === filters.status;
    const channelMatch = !filters?.channel || filters.channel === "all" ? true : campaign.channels.includes(filters.channel as never);
    const formatMatch = !filters?.format || filters.format === "all" ? true : campaign.formats.includes(filters.format as never);
    return queryMatch && statusMatch && channelMatch && formatMatch;
  });
}

export async function getCampaign(id: string) {
  return getCampaignViews().find((campaign) => campaign.id === id || campaign.slug === id) ?? null;
}

export async function listMemberSubmissions(userId = currentMember.id) {
  return getSubmissionViews().filter((submission) => submission.userId === userId);
}

export function getActivePenalty(userId = currentMember.id, at = new Date("2026-04-23T02:00:00.000Z")): UserPenalty | undefined {
  return userPenalties.find((penalty) => {
    const startsAt = new Date(penalty.startsAt);
    const endsAt = new Date(penalty.endsAt);
    return penalty.userId === userId && startsAt <= at && endsAt > at;
  });
}

export async function listMemberApplications(userId = currentMember.id) {
  return campaignApplications.filter((application) => application.userId === userId);
}

export async function listCampaignApplications(campaignId: string): Promise<CampaignApplicationView[]> {
  return campaignApplications
    .filter((application) => application.campaignId === campaignId)
    .map((application) => {
      const campaign = campaigns.find((item) => item.id === application.campaignId)!;
      const user = users.find((item) => item.id === application.userId)!;
      const userSubmissions = getSubmissionViews().filter((submission) => submission.userId === user.id);
      const approved = userSubmissions.filter((submission) =>
        ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(submission.status)
      ).length;

      return {
        ...application,
        campaign,
        brand: brands.find((brand) => brand.id === campaign.brandId)!,
        user,
        channel: userChannels.find(
          (channel) => channel.userId === user.id && channel.channelType === application.channelType
        ),
        approvalRate: userSubmissions.length ? Math.round((approved / userSubmissions.length) * 100) : 0,
        activePenalty: getActivePenalty(user.id),
        fulfillment: fulfillmentInfos.find((info) => info.applicationId === application.id)
      };
    });
}

export async function listBrandCampaigns(brandId = "brand-1") {
  return getCampaignViews().filter((campaign) => campaign.brandId === brandId);
}

export async function getBrandCampaignLimitState(brandId = "brand-1") {
  const brandCampaigns = await listBrandCampaigns(brandId);
  const activeStatuses: CampaignStatus[] = ["draft", "open", "paused"];
  const activeCount = brandCampaigns.filter((campaign) => activeStatuses.includes(campaign.status)).length;

  return {
    activeCount,
    limit: 2,
    canCreate: activeCount < 2,
    message:
      activeCount < 2
        ? `동시 진행 캠페인 ${activeCount}/2개`
        : "동시 진행 캠페인은 최대 2개까지 등록할 수 있습니다."
  };
}

export async function getCampaignDraftPresets(brandId = "brand-1"): Promise<CampaignDraftPreset[]> {
  const brandCampaigns = await listBrandCampaigns(brandId);

  return brandCampaigns.map((campaign) => ({
    sourceCampaignId: campaign.id,
    title: campaign.title,
    experienceType: campaign.experienceType,
    industry: campaign.industry,
    category: campaign.category,
    offerTitle: campaign.offerTitle,
    offerDescription: campaign.offerDescription,
    offerValueLabel: campaign.offerValueLabel,
    channels: campaign.channels,
    formats: campaign.formats,
    keyMessage: campaign.guideline.keyMessage
  }));
}

export async function cloneCampaignDraft(sourceCampaignId: string): Promise<CampaignDraftPreset | null> {
  const presets = await getCampaignDraftPresets();
  return presets.find((preset) => preset.sourceCampaignId === sourceCampaignId) ?? null;
}

export async function listBrandCampaignApplications(campaignId: string, brandId = "brand-1") {
  const campaign = campaigns.find((item) => item.id === campaignId && item.brandId === brandId);
  if (!campaign) return [];
  return listCampaignApplications(campaignId);
}

export function getFulfillmentForApplication(applicationId: string): FulfillmentInfo | undefined {
  return fulfillmentInfos.find((info) => info.applicationId === applicationId);
}

export async function getCampaignApplicationSummary(campaignId: string) {
  const applications = await listCampaignApplications(campaignId);
  return {
    applications,
    applied: applications.filter((item) => item.status === "applied").length,
    selected: applications.filter((item) => item.status === "selected").length,
    rejected: applications.filter((item) => item.status === "rejected").length
  };
}

export async function listAdminSubmissions(status?: SubmissionStatus | "all") {
  const views = getSubmissionViews();
  return !status || status === "all" ? views : views.filter((submission) => submission.status === status);
}

export async function getMemberProfile() {
  const submissions = await listMemberSubmissions(currentMember.id);
  const applications = await listMemberApplications(currentMember.id);
  const approved = submissions.filter((submission) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(submission.status)
  ).length;

  return {
    user: currentMember,
    channels: userChannels.filter((channel) => channel.userId === currentMember.id),
    applications,
    activePenalty: getActivePenalty(currentMember.id),
    stats: {
      totalSubmissions: submissions.length,
      totalApplications: applications.length,
      approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
      preferredChannel: "Threads",
      strongestFormat: "질문/한줄 반응"
    }
  };
}

export async function getAdminSummary() {
  const campaigns = getCampaignViews();
  const submissions = getSubmissionViews();
  const todaySubmissions = submissions.filter((submission) => submission.submittedAt.startsWith("2026-04-22")).length;
  const approved = submissions.filter((submission) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(submission.status)
  ).length;

  return {
    admin: currentAdmin,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "open").length,
    todaySubmissions,
    approvalRate: Math.round((approved / submissions.length) * 100),
    autoApproved: submissions.filter((submission) => submission.status === "auto_approved").length,
    needsReview: submissions.filter((submission) => submission.status === "needs_review").length,
    applicationPending: campaignApplications.filter((application) => application.status === "applied").length,
    recentSubmissions: submissions.slice(0, 6),
    recentCampaigns: campaigns.slice(0, 5)
  };
}

export function getApplicationCta(status?: ApplicationStatus, hasPenalty = Boolean(getActivePenalty())) {
  if (hasPenalty) {
    return { label: "사용 제한 중", href: "/member/profile", disabled: true };
  }

  if (!status) {
    return { label: "신청하기", href: "", disabled: false };
  }

  if (status === "selected") {
    return { label: "제출하기", href: "", disabled: false };
  }

  if (status === "applied") {
    return { label: "신청 검토 중", href: "/member/profile", disabled: true };
  }

  if (status === "rejected") {
    return { label: "선정되지 않음", href: "/member/profile", disabled: true };
  }

  return { label: "신청 취소됨", href: "/member/profile", disabled: true };
}

export function getSubmissionChecklist(channelType: ChannelType): SubmissionChecklistItem[] {
  const common: SubmissionChecklistItem[] = [
    {
      id: "body",
      label: "본문을 붙여넣었습니다",
      required: true,
      channelTypes: ["threads", "x", "wordpress", "kakao"],
      checked: false
    },
    {
      id: "retention",
      label: "게시물 유지 시간을 확인했습니다",
      required: true,
      channelTypes: ["threads", "x", "wordpress", "kakao"],
      checked: false
    }
  ];

  if (channelType === "kakao") {
    return [
      {
        id: "screenshot",
        label: "KakaoTalk 피드 캡처를 준비했습니다",
        required: true,
        channelTypes: ["kakao"],
        checked: false
      },
      {
        id: "kakao-profile",
        label: "닉네임/친구수 인증 정보와 같은 계정입니다",
        required: true,
        channelTypes: ["kakao"],
        checked: false
      },
      ...common
    ];
  }

  return [
    {
      id: "url",
      label: "게시글 링크를 입력했습니다",
      required: true,
      channelTypes: ["threads", "x", "wordpress"],
      checked: false
    },
    {
      id: "public",
      label: "공개 게시물 상태를 확인했습니다",
      required: true,
      channelTypes: ["threads", "x", "wordpress"],
      checked: false
    },
    {
      id: "required-tags",
      label: "필수 해시태그/링크를 확인했습니다",
      required: true,
      channelTypes: ["threads", "x", "wordpress"],
      checked: false
    },
    ...common
  ];
}
