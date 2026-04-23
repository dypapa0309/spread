"use server";

import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import type { ChannelType, ExperienceType, FormatType, Industry, ReviewMode } from "@/types/spread";

export type SaveCampaignInput = {
  title: string;
  productName: string;
  summary: string;
  description: string;
  coverImageUrl?: string;
  experienceType: ExperienceType;
  industry: Industry;
  category: string;
  offerTitle: string;
  offerDescription: string;
  offerValueLabel: string;
  regionProvince?: string;
  regionDistrict?: string;
  venueAddress?: string;
  venueName?: string;
  channels: ChannelType[];
  formats: FormatType[];
  keyMessage: string;
  requiredHashtags: string[];
  requiredPoints: string[];
  prohibitedExpressions: string[];
  recruitLimit: number;
  privacyRetentionDays: number;
  applyEndAt?: string;
  submissionDueAt?: string;
  reviewMode: ReviewMode;
  contentRetentionMonths: number;
  minTextLength: number;
};

export type SaveCampaignResult =
  | { ok: true; campaignId: string }
  | { ok: false; message: string };

export async function saveCampaign(input: SaveCampaignInput): Promise<SaveCampaignResult> {
  const userSupabase = await createClient();
  const {
    data: { user: authUser }
  } = await userSupabase.auth.getUser();

  if (!authUser) return { ok: false, message: "로그인이 필요합니다." };

  const { data: currentUser } = await userSupabase
    .from("users")
    .select("id, role, email, name, nickname")
    .eq("id", authUser.id)
    .single();

  if (!currentUser) {
    return {
      ok: false,
      message: "사용자 프로필이 없습니다. 로그인/회원가입을 다시 진행한 뒤 저장해 주세요."
    };
  }

  if (!["admin", "brand"].includes(currentUser.role)) {
    return { ok: false, message: "캠페인 등록은 관리자 또는 광고주 계정만 가능합니다." };
  }

  const adminSupabase = createAdminClient();
  const brandId = await resolveCampaignBrandId({
    supabase: adminSupabase,
    userEmail: currentUser.email ?? authUser.email ?? "",
    userName: currentUser.name ?? currentUser.nickname ?? "SPREAD 브랜드",
    role: currentUser.role
  });

  if (!brandId) {
    return {
      ok: false,
      message: "캠페인에 연결할 브랜드가 없습니다. 브랜드 계정으로 등록하거나 관리자 권한을 확인해 주세요."
    };
  }

  if (currentUser.role === "brand") {
    const { count, error: countError } = await adminSupabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .in("status", ["draft", "open", "paused"]);

    if (countError) return { ok: false, message: `캠페인 한도 확인 실패: ${countError.message}` };
    if ((count ?? 0) >= 2) {
      return { ok: false, message: "광고주는 동시 진행 캠페인을 최대 2개까지만 등록할 수 있습니다." };
    }
  }

  const now = new Date();
  const applyEndAt = toIsoDate(input.applyEndAt, addDays(now, 14));
  const submissionDueAt = toIsoDate(input.submissionDueAt, addDays(now, 21));
  const title = input.title.trim();
  const summary = input.summary.trim();
  const description = input.description.trim();
  const offerTitle = input.offerTitle.trim();
  const offerDescription = input.offerDescription.trim();

  if (!title || !summary || !description || !offerTitle || !offerDescription) {
    return { ok: false, message: "캠페인명, 요약, 설명, 제공 정보를 입력해 주세요." };
  }

  if (!input.channels.length) return { ok: false, message: "채널을 하나 이상 선택해 주세요." };
  if (!input.formats.length) return { ok: false, message: "미션 포맷을 하나 이상 선택해 주세요." };

  const { data: campaign, error: campaignError } = await adminSupabase
    .from("campaigns")
    .insert({
      brand_id: brandId,
      title,
      slug: makeSlug(title),
      summary,
      description,
      cover_image_url: input.coverImageUrl?.trim() || null,
      product_name: input.productName.trim() || offerTitle,
      experience_type: input.experienceType,
      industry: input.industry,
      category: input.category,
      offer_title: offerTitle,
      offer_description: offerDescription,
      offer_value_label: input.offerValueLabel.trim() || (input.experienceType === "product" ? "제품 배송" : "방문 체험"),
      region_province: input.experienceType === "local" ? input.regionProvince?.trim() || null : null,
      region_district: input.experienceType === "local" ? input.regionDistrict?.trim() || null : null,
      venue_address: input.experienceType === "local" ? input.venueAddress?.trim() || null : null,
      venue_name: input.experienceType === "local" ? input.venueName?.trim() || offerTitle : null,
      privacy_retention_days: clampNumber(input.privacyRetentionDays, 30, 1, 365),
      start_at: now.toISOString(),
      end_at: submissionDueAt,
      apply_end_at: applyEndAt,
      submission_due_at: submissionDueAt,
      recruit_limit: clampNumber(input.recruitLimit, 1, 1, 10000),
      status: "open",
      review_mode: input.reviewMode,
      visibility: "public",
      created_by: currentUser.id
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    return { ok: false, message: `캠페인 저장 실패: ${campaignError?.message ?? "알 수 없는 오류"}` };
  }

  const campaignId = campaign.id as string;

  const [{ error: channelsError }, { error: formatsError }, { error: guidelineError }] = await Promise.all([
    adminSupabase.from("campaign_channels").insert(input.channels.map((channelType) => ({
      campaign_id: campaignId,
      channel_type: channelType
    }))),
    adminSupabase.from("campaign_formats").insert(input.formats.map((formatType) => ({
      campaign_id: campaignId,
      format_type: formatType
    }))),
    adminSupabase.from("campaign_guidelines").insert({
      campaign_id: campaignId,
      key_message: input.keyMessage.trim() || title,
      required_points: input.requiredPoints,
      prohibited_expressions: input.prohibitedExpressions,
      required_hashtags: input.requiredHashtags,
      required_links: [],
      content_retention_months: clampNumber(input.contentRetentionMonths, 6, 1, 24),
      min_text_length: clampNumber(input.minTextLength, 80, 0, 5000),
      required_keyword_count: 0,
      allow_private_account: false,
      auto_approval_enabled: input.reviewMode === "auto",
      auto_rejection_enabled: input.reviewMode !== "manual",
      extra_note: ""
    })
  ]);

  const relationError = channelsError ?? formatsError ?? guidelineError;
  if (relationError) {
    await adminSupabase.from("campaigns").delete().eq("id", campaignId);
    return { ok: false, message: `캠페인 부가 정보 저장 실패: ${relationError.message}` };
  }

  return { ok: true, campaignId };
}

async function resolveCampaignBrandId({
  supabase,
  userEmail,
  userName,
  role
}: {
  supabase: ReturnType<typeof createAdminClient>;
  userEmail: string;
  userName: string;
  role: string;
}) {
  const { data: ownBrand } = await supabase
    .from("brands")
    .select("id")
    .eq("contact_email", userEmail)
    .maybeSingle();

  if (ownBrand?.id) return ownBrand.id as string;

  const { data: firstBrand } = await supabase
    .from("brands")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstBrand?.id) return firstBrand.id as string;
  if (!["admin", "brand"].includes(role)) return null;

  const { data: createdBrand } = await supabase
    .from("brands")
    .insert({
      name: "SPREAD 등록 브랜드",
      description: "관리자 캠페인 등록용 기본 브랜드",
      website_url: "",
      logo_url: null,
      contact_name: userName,
      contact_email: userEmail,
      status: "active"
    })
    .select("id")
    .single();

  return (createdBrand?.id as string | undefined) ?? null;
}

function makeSlug(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "campaign"}-${Date.now().toString(36)}`;
}

function toIsoDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function clampNumber(value: number, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}
