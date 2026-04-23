import { createClient } from "@/supabase/server";
import {
  mapApplication,
  mapBrand,
  mapCampaign,
  mapFulfillment,
  mapGuideline,
  mapMetrics,
  mapPenalty,
  mapSubmission,
  mapUser,
  mapUserChannel
} from "@/lib/mappers";
import type {
  ApplicationStatus,
  BrandPlan,
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
import type { BrandRow, CampaignGuidelineRow, CampaignRow } from "@/supabase/database.types";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    acc[k] = acc[k] ?? [];
    acc[k].push(item);
    return acc;
  }, {});
}

const PLAN_LIMITS: Record<BrandPlan, { activeCampaignLimit: number; monthlySelectedLimit: number; label: string; priceLabel: string }> = {
  basic: { activeCampaignLimit: 2, monthlySelectedLimit: 20, label: "Basic", priceLabel: "무료" },
  standard: { activeCampaignLimit: 5, monthlySelectedLimit: 80, label: "Standard", priceLabel: "월 29,000원" },
  pro: { activeCampaignLimit: 15, monthlySelectedLimit: 250, label: "Pro", priceLabel: "월 99,000원" }
};

function uniqueCount<T>(items: T[], getKey: (item: T) => string) {
  return new Set(items.map(getKey)).size;
}

function resolveGroupedApplicationStatus(statuses: ApplicationStatus[]): ApplicationStatus | undefined {
  if (!statuses.length) return undefined;
  if (statuses.includes("selected")) return "selected";
  if (statuses.every((status) => status === "rejected")) return "rejected";
  if (statuses.every((status) => status === "cancelled")) return "cancelled";
  return "applied";
}

const emptyGuideline = {
  id: "",
  campaignId: "",
  keyMessage: "",
  requiredPoints: [],
  prohibitedExpressions: [],
  requiredHashtags: [],
  requiredLinks: [],
  contentRetentionMonths: 6,
  minTextLength: 80,
  requiredKeywordCount: 2,
  allowPrivateAccount: false,
  autoApprovalEnabled: false,
  autoRejectionEnabled: true,
  extraNote: ""
};

// ────────────────────────────────────────────────────────────────────────────
// Current user
// ────────────────────────────────────────────────────────────────────────────

export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (data) return mapUser(data);

  // public.users 레코드가 없으면 auth 메타데이터로 자동 생성
  // (이메일 인증 완료 후 callback이 실패했거나 RLS 미적용 상태에서 가입한 경우)
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName = String(meta.name ?? authUser.email?.split("@")[0] ?? "사용자");
  const fallbackNickname = String(meta.nickname ?? authUser.email?.split("@")[0] ?? "user");
  const role = (meta.role as "member" | "admin" | "brand") ?? "member";

  const { data: created } = await supabase
    .from("users")
    .upsert({
      id: authUser.id,
      role,
      name: fallbackName,
      nickname: fallbackNickname,
      email: authUser.email!,
      bio: "",
      level: 1,
      score: 0,
      completed_missions: 0,
      status: "active"
    })
    .select()
    .single();

  return created ? mapUser(created) : null;
}

// ────────────────────────────────────────────────────────────────────────────
// Campaigns
// ────────────────────────────────────────────────────────────────────────────

type CampaignWithRelations = CampaignRow & {
  brand: BrandRow;
  campaign_channels: { channel_type: string }[];
  campaign_guidelines: CampaignGuidelineRow[];
};

async function buildCampaignViews(
  rows: CampaignWithRelations[],
  userId?: string
): Promise<CampaignView[]> {
  if (!rows.length) return [];
  const supabase = await createClient();

  const ids = rows.map((r) => r.id);

  const [{ data: appData }, { data: subData }, { data: myApps }] = await Promise.all([
    supabase.from("campaign_applications").select("campaign_id, user_id, status").in("campaign_id", ids),
    supabase.from("submissions").select("campaign_id").in("campaign_id", ids),
    userId
      ? supabase
          .from("campaign_applications")
          .select("campaign_id, status")
          .in("campaign_id", ids)
          .eq("user_id", userId)
      : Promise.resolve({ data: [] as { campaign_id: string; status: string }[] })
  ]);

  const appsByCampaign = groupBy(appData ?? [], "campaign_id");
  const subsByCampaign = groupBy(subData ?? [], "campaign_id");
  const myAppsByCampaign = groupBy(myApps ?? [], "campaign_id");

  return rows.map((row) => {
    const apps = appsByCampaign[row.id] ?? [];
    const subs = subsByCampaign[row.id] ?? [];
    const guideline = row.campaign_guidelines[0]
      ? mapGuideline(row.campaign_guidelines[0])
      : { ...emptyGuideline, campaignId: row.id };

    return {
      ...mapCampaign(row),
      brand: mapBrand(row.brand),
      channels: row.campaign_channels.map((c) => c.channel_type as ChannelType),
      guideline,
      applicationsCount: uniqueCount(apps, (a) => a.user_id),
      selectedCount: uniqueCount(apps.filter((a) => a.status === "selected"), (a) => a.user_id),
      submissionsCount: subs.length,
      myApplicationStatus: resolveGroupedApplicationStatus(
        (myAppsByCampaign[row.id] ?? []).map((a) => a.status as ApplicationStatus)
      )
    };
  });
}

const CAMPAIGN_SELECT = `
  *,
  brand:brands!brand_id(*),
  campaign_channels(channel_type),
  campaign_guidelines(*)
`;

export async function listCampaigns(filters?: {
  query?: string;
  status?: CampaignStatus | "all";
  channel?: string;
}): Promise<CampaignView[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,summary.ilike.%${filters.query}%`
    );
  }

  const { data } = await query;
  if (!data) return [];

  let rows = data as unknown as CampaignWithRelations[];

  if (filters?.channel && filters.channel !== "all") {
    rows = rows.filter((r) =>
      r.campaign_channels.some((c) => c.channel_type === filters.channel)
    );
  }
  return buildCampaignViews(rows, user?.id);
}

export async function getCampaign(id: string): Promise<CampaignView | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT)
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (!data) return null;
  const views = await buildCampaignViews([data as unknown as CampaignWithRelations], user?.id);
  return views[0] ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Member
// ────────────────────────────────────────────────────────────────────────────

export async function listMemberSubmissions(userId: string): Promise<SubmissionView[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("submissions")
    .select("*, campaign:campaigns(*, brand:brands!brand_id(*)), user:users(*)")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    ...mapSubmission(row as never),
    campaign: mapCampaign((row.campaign as Record<string, unknown>) as never),
    brand: mapBrand(((row.campaign as Record<string, unknown>).brand as Record<string, unknown>) as never),
    user: mapUser((row.user as Record<string, unknown>) as never)
  }));
}

export async function listMemberApplications(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_at", { ascending: false });

  return (data ?? []).map(mapApplication);
}

export async function listUserChannels(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_channels")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapUserChannel);
}

export async function getActivePenalty(userId: string): Promise<UserPenalty | undefined> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("user_penalties")
    .select("*")
    .eq("user_id", userId)
    .lte("starts_at", now)
    .gt("ends_at", now)
    .limit(1)
    .single();

  return data ? mapPenalty(data) : undefined;
}

export async function getMemberProfile(userId: string) {
  const supabase = await createClient();

  const [{ data: userRow }, { data: channelRows }] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).single(),
    supabase.from("user_channels").select("*").eq("user_id", userId)
  ]);

  if (!userRow) return null;

  const user = mapUser(userRow);
  const channels = (channelRows ?? []).map(mapUserChannel);
  const [submissions, applications, activePenalty] = await Promise.all([
    listMemberSubmissions(userId),
    listMemberApplications(userId),
    getActivePenalty(userId)
  ]);

  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  return {
    user,
    channels,
    applications,
    activePenalty,
    stats: {
      totalSubmissions: submissions.length,
      totalApplications: applications.length,
      approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
      preferredChannel: channels[0] ? channels[0].channelName : "-",
      strongestFormat: "-"
    }
  };
}

export async function checkSubmissionEligibility(
  campaignId: string,
  userId: string
): Promise<SubmissionEligibility> {
  const supabase = await createClient();

  const activePenalty = await getActivePenalty(userId);
  if (activePenalty) {
    return {
      canSubmit: false,
      reason: "penalty",
      message: `제출 기한 초과 패널티로 ${new Date(activePenalty.endsAt).toLocaleDateString("ko-KR")}까지 사용이 제한됩니다.`,
      penalty: activePenalty
    };
  }

  const { data: applications } = await supabase
    .from("campaign_applications")
    .select("status")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId);

  const statuses = (applications ?? []).map((application) => application.status as ApplicationStatus);
  const groupedStatus = resolveGroupedApplicationStatus(statuses);

  if (!groupedStatus) {
    return { canSubmit: false, reason: "not_applied", message: "먼저 캠페인에 신청해야 합니다." };
  }
  if (groupedStatus === "applied") {
    return { canSubmit: false, reason: "pending", message: "관리자 선정이 끝난 뒤 제출할 수 있습니다." };
  }
  if (groupedStatus === "rejected") {
    return { canSubmit: false, reason: "rejected", message: "이번 캠페인에는 선정되지 않았습니다." };
  }
  if (groupedStatus === "cancelled") {
    return { canSubmit: false, reason: "not_applied", message: "취소된 신청입니다. 다시 신청해 주세요." };
  }

  return { canSubmit: true, reason: "selected", message: "선정된 캠페인입니다. 제출할 수 있습니다." };
}

// ────────────────────────────────────────────────────────────────────────────
// Brand
// ────────────────────────────────────────────────────────────────────────────

export async function listBrandCampaigns(brandId?: string): Promise<CampaignView[]> {
  const supabase = await createClient();
  const resolvedBrandId = brandId ?? await getCurrentUserBrandId();
  if (!resolvedBrandId) return [];

  const { data } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT)
    .eq("brand_id", resolvedBrandId)
    .order("created_at", { ascending: false });

  if (!data) return [];
  return buildCampaignViews(data as unknown as CampaignWithRelations[]);
}

export async function getBrandIdForUser(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id")
    .eq("contact_email", (await supabase.from("users").select("email").eq("id", userId).single()).data?.email ?? "")
    .single();
  return data?.id ?? null;
}

export async function getCurrentUserBrandId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getBrandIdForUser(user.id);
}

export async function getBrandCampaignLimitState(brandId?: string) {
  const supabase = await createClient();
  const resolvedBrandId = brandId ?? await getCurrentUserBrandId();
  if (!resolvedBrandId) {
    return {
      activeCount: 0,
      selectedThisMonth: 0,
      plan: "basic" as BrandPlan,
      planLabel: PLAN_LIMITS.basic.label,
      priceLabel: PLAN_LIMITS.basic.priceLabel,
      limit: PLAN_LIMITS.basic.activeCampaignLimit,
      monthlySelectedLimit: PLAN_LIMITS.basic.monthlySelectedLimit,
      canCreate: false,
      canSelectMore: false,
      message: "브랜드 정보를 찾을 수 없습니다."
    };
  }

  const { data: brandRow } = await supabase
    .from("brands")
    .select("*")
    .eq("id", resolvedBrandId)
    .maybeSingle();
  const plan = (brandRow?.plan ?? "basic") as BrandPlan;
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.basic;
  const campaigns = await listBrandCampaigns(resolvedBrandId);
  const activeStatuses: CampaignStatus[] = ["draft", "open", "paused"];
  const activeCount = campaigns.filter((c) => activeStatuses.includes(c.status)).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { data: selectedRows } = await supabase
    .from("campaign_applications")
    .select("campaign_id, user_id, campaign:campaigns!campaign_id(brand_id)")
    .eq("status", "selected")
    .gte("decided_at", monthStart.toISOString());
  const selectedThisMonth = uniqueCount(
    (selectedRows ?? []).filter((row: Record<string, unknown>) => {
      const campaign = row.campaign as { brand_id?: string } | null;
      return campaign?.brand_id === resolvedBrandId;
    }),
    (row: Record<string, unknown>) => `${row.campaign_id}:${row.user_id}`
  );

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

export async function getCampaignDraftPresets(brandId: string): Promise<CampaignDraftPreset[]> {
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
    keyMessage: c.guideline.keyMessage
  }));
}

export async function listBrandCampaignApplications(
  campaignId: string,
  brandId: string
): Promise<CampaignApplicationView[]> {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();

  if (!campaign) return [];
  return listCampaignApplications(campaignId);
}

// ────────────────────────────────────────────────────────────────────────────
// Admin
// ────────────────────────────────────────────────────────────────────────────

export async function listCampaignApplications(campaignId: string): Promise<CampaignApplicationView[]> {
  const supabase = await createClient();

  const { data: appRows } = await supabase
    .from("campaign_applications")
    .select("*, user:users(*)")
    .eq("campaign_id", campaignId)
    .order("applied_at", { ascending: false });

  if (!appRows) return [];

  const { data: campaignRow } = await supabase
    .from("campaigns")
    .select("*, brand:brands!brand_id(*)")
    .eq("id", campaignId)
    .single();

  if (!campaignRow) return [];

  const campaign = mapCampaign(campaignRow as never);
  const brand = mapBrand((campaignRow as Record<string, unknown>).brand as never);
  const typedRows = appRows as Record<string, unknown>[];
  const userIds = [...new Set(typedRows.map((row) => String(row.user_id)))];
  const [{ data: channelRows }, { data: fulfillmentRows }] = await Promise.all([
    userIds.length
      ? supabase.from("user_channels").select("*").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    supabase.from("fulfillment_infos").select("*").eq("campaign_id", campaignId)
  ]);
  const channelsByUser = groupBy((channelRows ?? []).map(mapUserChannel), "userId");
  const fulfillmentsByUser = groupBy((fulfillmentRows ?? []).map(mapFulfillment), "userId");
  const rowsByUser = groupBy(typedRows, "user_id");

  return Promise.all(
    Object.values(rowsByUser).map(async (group) => {
      const row = group[0];
      const user = mapUser((row.user as Record<string, unknown>) as never);
      const userSubmissions = await listMemberSubmissions(user.id);
      const approved = userSubmissions.filter((s) =>
        ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
      ).length;
      const userChannels = channelsByUser[user.id] ?? [];
      const channelTypes = group.map((item) => item.channel_type as ChannelType);
      const applicationIds = group.map((item) => String(item.id));
      const groupedStatus = resolveGroupedApplicationStatus(
        group.map((item) => item.status as ApplicationStatus)
      ) ?? "applied";

      return {
        ...mapApplication(row as never),
        status: groupedStatus,
        campaign,
        brand,
        user,
        channel: userChannels.find((channel) => channel.channelType === row.channel_type),
        channels: userChannels.filter((channel) => channelTypes.includes(channel.channelType)),
        channelTypes,
        applicationIds,
        approvalRate: userSubmissions.length ? Math.round((approved / userSubmissions.length) * 100) : 0,
        activePenalty: await getActivePenalty(user.id),
        fulfillment: (fulfillmentsByUser[user.id] ?? [])[0]
      };
    })
  );
}

export async function listAdminSubmissions(status?: SubmissionStatus | "all") {
  const supabase = await createClient();

  let query = supabase
    .from("submissions")
    .select("*, campaign:campaigns(*, brand:brands!brand_id(*)), user:users(*)")
    .order("submitted_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    ...mapSubmission(row as never),
    campaign: mapCampaign((row.campaign as Record<string, unknown>) as never),
    brand: mapBrand(((row.campaign as Record<string, unknown>).brand as Record<string, unknown>) as never),
    user: mapUser((row.user as Record<string, unknown>) as never)
  })) as SubmissionView[];
}

export async function getAdminSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [campaigns, submissions] = await Promise.all([
    listCampaigns({ status: "all" }),
    listAdminSubmissions()
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todaySubmissions = submissions.filter((s) => s.submittedAt.startsWith(today)).length;
  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  const { data: appRows } = await supabase
    .from("campaign_applications")
    .select("status")
    .eq("status", "applied");

  let adminUser = null;
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    adminUser = data ? mapUser(data) : null;
  }

  return {
    admin: adminUser,
    activeCampaigns: campaigns.filter((c) => c.status === "open").length,
    todaySubmissions,
    approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
    autoApproved: submissions.filter((s) => s.status === "auto_approved").length,
    needsReview: submissions.filter((s) => s.status === "needs_review").length,
    applicationPending: (appRows ?? []).length,
    recentSubmissions: submissions.slice(0, 6),
    recentCampaigns: campaigns.slice(0, 5)
  };
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

export function getFulfillmentForApplication(applicationId: string): FulfillmentInfo | undefined {
  return undefined; // 실시간 조회로 대체됨
}

export function getSubmissionChecklist(channelType: ChannelType): SubmissionChecklistItem[] {
  const common: SubmissionChecklistItem[] = [
    { id: "body", label: "본문을 붙여넣었습니다", required: true, channelTypes: ["threads", "x", "wordpress", "kakao"], checked: false },
    { id: "retention", label: "게시물 6개월 유지 조건을 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress", "kakao"], checked: false }
  ];

  if (channelType === "kakao") {
    return [
      { id: "screenshot", label: "KakaoTalk 피드 캡처를 준비했습니다", required: true, channelTypes: ["kakao"], checked: false },
      { id: "kakao-profile", label: "닉네임/친구수 인증 정보와 같은 계정입니다", required: true, channelTypes: ["kakao"], checked: false },
      ...common
    ];
  }

  return [
    { id: "url", label: "게시글 링크를 입력했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    { id: "public", label: "공개 게시물 상태를 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    { id: "required-tags", label: "필수 해시태그/링크를 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    ...common
  ];
}
