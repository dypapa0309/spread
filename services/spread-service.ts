import * as mock from "@/lib/mock-data";
import * as real from "@/services/supabase-service";
import { hasSupabaseEnv } from "@/supabase/env";
import type {
  ApplicationStatus,
  CampaignApplicationView,
  CampaignDraftPreset,
  CampaignStatus,
  CampaignView,
  ChannelType,
  FulfillmentInfo,
  SubmissionChecklistItem,
  SubmissionEligibility,
  SubmissionStatus,
  SubmissionView,
  User,
  UserPenalty
} from "@/types/spread";

// Supabase 환경 변수가 있으면 real 모드, 없으면 mock 모드
const isLive = hasSupabaseEnv();

// ────────────────────────────────────────────────────────────────────────────
// Current user
// ────────────────────────────────────────────────────────────────────────────

export async function getServerUser(): Promise<User | null> {
  if (isLive) return real.getServerUser();
  return mock.currentMember;
}

export async function getBrandIdForUser(userId: string): Promise<string | null> {
  if (isLive) return real.getBrandIdForUser(userId);
  return userId === "user-brand-1" ? "brand-1" : "brand-1";
}

// ────────────────────────────────────────────────────────────────────────────
// Campaigns
// ────────────────────────────────────────────────────────────────────────────

export async function listCampaigns(filters?: {
  query?: string;
  status?: CampaignStatus | "all";
  channel?: string;
  format?: string;
}): Promise<CampaignView[]> {
  if (isLive) return real.listCampaigns(filters);

  const campaigns = mock.getCampaignViews();
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

export async function getCampaign(id: string): Promise<CampaignView | null> {
  if (isLive) return real.getCampaign(id);
  return mock.getCampaignViews().find((c) => c.id === id || c.slug === id) ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Member
// ────────────────────────────────────────────────────────────────────────────

export async function listMemberSubmissions(userId = mock.currentMember.id): Promise<SubmissionView[]> {
  if (isLive) return real.listMemberSubmissions(userId);
  return mock.getSubmissionViews().filter((s) => s.userId === userId);
}

export async function listMemberApplications(userId = mock.currentMember.id) {
  if (isLive) return real.listMemberApplications(userId);
  return mock.campaignApplications.filter((a) => a.userId === userId);
}

export async function listUserChannels(userId = mock.currentMember.id) {
  if (isLive) return real.listUserChannels(userId);
  return mock.userChannels.filter((channel) => channel.userId === userId);
}

export async function getActivePenalty(userId = mock.currentMember.id): Promise<UserPenalty | undefined> {
  if (isLive) return real.getActivePenalty(userId);
  const at = new Date();
  return mock.userPenalties.find((p) => {
    return p.userId === userId && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
  });
}

export async function getMemberProfile(userId = mock.currentMember.id) {
  if (isLive) return real.getMemberProfile(userId);

  const submissions = mock.getSubmissionViews().filter((s) => s.userId === userId);
  const applications = mock.campaignApplications.filter((a) => a.userId === userId);
  const at = new Date();
  const activePenalty = mock.userPenalties.find((p) => {
    return p.userId === userId && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
  });
  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  return {
    user: mock.users.find((u) => u.id === userId) ?? mock.currentMember,
    channels: mock.userChannels.filter((c) => c.userId === userId),
    applications,
    activePenalty,
    stats: {
      totalSubmissions: submissions.length,
      totalApplications: applications.length,
      approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
      preferredChannel: "Threads",
      strongestFormat: "질문/한줄 반응"
    }
  };
}

export async function checkSubmissionEligibility(
  campaignId: string,
  userId = mock.currentMember.id
): Promise<SubmissionEligibility> {
  if (isLive) return real.checkSubmissionEligibility(campaignId, userId);

  const activePenalty = await getActivePenalty(userId);
  if (activePenalty) {
    return {
      canSubmit: false,
      reason: "penalty",
      message: `패널티로 ${new Date(activePenalty.endsAt).toLocaleDateString("ko-KR")}까지 사용이 제한됩니다.`,
      penalty: activePenalty
    };
  }

  const application = mock.campaignApplications.find(
    (a) => a.campaignId === campaignId && a.userId === userId
  );
  if (!application) return { canSubmit: false, reason: "not_applied", message: "먼저 캠페인에 신청해야 합니다." };
  if (application.status === "applied") return { canSubmit: false, reason: "pending", message: "관리자 선정 후 제출할 수 있습니다." };
  if (application.status === "rejected") return { canSubmit: false, reason: "rejected", message: "선정되지 않았습니다." };
  if (application.status === "cancelled") return { canSubmit: false, reason: "not_applied", message: "취소된 신청입니다." };

  return { canSubmit: true, reason: "selected", message: "선정된 캠페인입니다." };
}

// ────────────────────────────────────────────────────────────────────────────
// Brand
// ────────────────────────────────────────────────────────────────────────────

export async function listBrandCampaigns(brandId = "brand-1"): Promise<CampaignView[]> {
  if (isLive) return real.listBrandCampaigns(brandId === "brand-1" ? undefined : brandId);
  return mock.getCampaignViews().filter((c) => c.brandId === brandId);
}

export async function getBrandCampaignLimitState(brandId = "brand-1") {
  if (isLive) return real.getBrandCampaignLimitState(brandId === "brand-1" ? undefined : brandId);

  const campaigns = await listBrandCampaigns(brandId);
  const activeStatuses: CampaignStatus[] = ["draft", "open", "paused"];
  const activeCount = campaigns.filter((c) => activeStatuses.includes(c.status)).length;
  const plan = brandId === "brand-3" ? "pro" : brandId === "brand-2" ? "standard" : "basic";
  const limits = {
    basic: { activeCampaignLimit: 2, monthlySelectedLimit: 20, label: "Basic", priceLabel: "무료" },
    standard: { activeCampaignLimit: 5, monthlySelectedLimit: 80, label: "Standard", priceLabel: "월 29,000원" },
    pro: { activeCampaignLimit: 15, monthlySelectedLimit: 250, label: "Pro", priceLabel: "월 99,000원" }
  }[plan];
  const selectedThisMonth = campaigns.reduce((sum, campaign) => sum + campaign.selectedCount, 0);

  return {
    activeCount,
    selectedThisMonth,
    plan,
    planLabel: limits.label,
    priceLabel: limits.priceLabel,
    limit: limits.activeCampaignLimit,
    monthlySelectedLimit: limits.monthlySelectedLimit,
    canCreate: activeCount < limits.activeCampaignLimit,
    canSelectMore: selectedThisMonth < limits.monthlySelectedLimit,
    message:
      activeCount < limits.activeCampaignLimit
        ? `${limits.label} · 동시 진행 ${activeCount}/${limits.activeCampaignLimit}개 · 월 선정 ${selectedThisMonth}/${limits.monthlySelectedLimit}명`
        : `${limits.label} 플랜은 동시 진행 캠페인 ${limits.activeCampaignLimit}개까지 등록할 수 있습니다.`
  };
}

export async function getCampaignDraftPresets(brandId = "brand-1"): Promise<CampaignDraftPreset[]> {
  if (isLive) return real.getCampaignDraftPresets(brandId);

  const campaigns = await listBrandCampaigns(brandId);
  return campaigns.map((c) => ({
    sourceCampaignId: c.id,
    title: c.title,
    experienceType: c.experienceType,
    industry: c.industry,
    category: c.category,
    offerTitle: c.offerTitle,
    offerDescription: c.offerDescription,
    offerValueLabel: c.offerValueLabel,
    channels: c.channels,
    formats: c.formats,
    keyMessage: c.guideline.keyMessage
  }));
}

export async function cloneCampaignDraft(sourceCampaignId: string): Promise<CampaignDraftPreset | null> {
  const presets = await getCampaignDraftPresets();
  return presets.find((p) => p.sourceCampaignId === sourceCampaignId) ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Admin
// ────────────────────────────────────────────────────────────────────────────

export async function listCampaignApplications(campaignId: string): Promise<CampaignApplicationView[]> {
  if (isLive) return real.listCampaignApplications(campaignId);
  return mock.campaignApplications
    .filter((a) => a.campaignId === campaignId)
    .map((application) => {
      const campaign = mock.campaigns.find((c) => c.id === application.campaignId)!;
      const user = mock.users.find((u) => u.id === application.userId)!;
      const userSubmissions = mock.getSubmissionViews().filter((s) => s.userId === user.id);
      const approved = userSubmissions.filter((s) =>
        ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
      ).length;
      const at = new Date();
      const activePenalty = mock.userPenalties.find((p) => {
        return p.userId === user.id && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
      });

      return {
        ...application,
        campaign,
        brand: mock.brands.find((b) => b.id === campaign.brandId)!,
        user,
        channel: mock.userChannels.find(
          (c) => c.userId === user.id && c.channelType === application.channelType
        ),
        approvalRate: userSubmissions.length ? Math.round((approved / userSubmissions.length) * 100) : 0,
        activePenalty,
        fulfillment: mock.fulfillmentInfos.find((f) => f.applicationId === application.id)
      };
    });
}

export async function listBrandCampaignApplications(campaignId: string, brandId = "brand-1") {
  if (isLive) return real.listBrandCampaignApplications(campaignId, brandId === "brand-1" ? await real.getCurrentUserBrandId() ?? "" : brandId);
  const campaign = mock.campaigns.find((c) => c.id === campaignId && c.brandId === brandId);
  if (!campaign) return [];
  return listCampaignApplications(campaignId);
}

export function getFulfillmentForApplication(applicationId: string): FulfillmentInfo | undefined {
  if (isLive) return undefined;
  return mock.fulfillmentInfos.find((f) => f.applicationId === applicationId);
}

export async function getCampaignApplicationSummary(campaignId: string) {
  const applications = await listCampaignApplications(campaignId);
  return {
    applications,
    applied: applications.filter((a) => a.status === "applied").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length
  };
}

export async function listAdminSubmissions(status?: SubmissionStatus | "all"): Promise<SubmissionView[]> {
  if (isLive) return real.listAdminSubmissions(status);
  const views = mock.getSubmissionViews();
  return !status || status === "all" ? views : views.filter((s) => s.status === status);
}

export async function getAdminSummary() {
  if (isLive) return real.getAdminSummary();

  const campaigns = mock.getCampaignViews();
  const submissions = mock.getSubmissionViews();
  const today = new Date().toISOString().slice(0, 10);
  const todaySubmissions = submissions.filter((s) => s.submittedAt.startsWith(today)).length;
  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  return {
    admin: mock.currentAdmin,
    activeCampaigns: campaigns.filter((c) => c.status === "open").length,
    todaySubmissions,
    approvalRate: Math.round((approved / submissions.length) * 100),
    autoApproved: submissions.filter((s) => s.status === "auto_approved").length,
    needsReview: submissions.filter((s) => s.status === "needs_review").length,
    applicationPending: mock.campaignApplications.filter((a) => a.status === "applied").length,
    recentSubmissions: submissions.slice(0, 6),
    recentCampaigns: campaigns.slice(0, 5)
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Shared helpers (mode 무관)
// ────────────────────────────────────────────────────────────────────────────

export function getApplicationCta(status?: ApplicationStatus, hasPenalty = false) {
  if (hasPenalty) return { label: "사용 제한 중", href: "/member/profile", disabled: true };
  if (!status) return { label: "신청하기", href: "", disabled: false };
  if (status === "selected") return { label: "제출하기", href: "", disabled: false };
  if (status === "applied") return { label: "신청 검토 중", href: "/member/profile", disabled: true };
  if (status === "rejected") return { label: "선정되지 않음", href: "/member/profile", disabled: true };
  return { label: "신청 취소됨", href: "/member/profile", disabled: true };
}

export function getSubmissionChecklist(channelType: ChannelType): SubmissionChecklistItem[] {
  return real.getSubmissionChecklist(channelType);
}
