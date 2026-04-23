import type {
  Brand,
  Campaign,
  CampaignApplication,
  CampaignGuideline,
  FulfillmentInfo,
  Submission,
  SubmissionMetrics,
  User,
  UserChannel,
  UserPenalty
} from "@/types/spread";
import type {
  BrandRow,
  CampaignApplicationRow,
  CampaignGuidelineRow,
  CampaignRow,
  FulfillmentInfoRow,
  SubmissionMetricsRow,
  SubmissionRow,
  UserChannelRow,
  UserPenaltyRow,
  UserRow
} from "@/supabase/database.types";

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    role: row.role,
    nickname: row.nickname,
    name: row.name,
    email: row.email,
    profileImageUrl: row.profile_image_url ?? undefined,
    bio: row.bio,
    level: row.level,
    score: row.score,
    completedMissions: row.completed_missions,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapUserChannel(row: UserChannelRow): UserChannel {
  return {
    id: row.id,
    userId: row.user_id,
    channelType: row.channel_type,
    channelName: row.channel_name,
    channelUrl: row.channel_url ?? undefined,
    handle: row.handle,
    followerCount: row.follower_count,
    friendCount: row.friend_count ?? undefined,
    verificationScreenshotUrl: row.verification_screenshot_url ?? undefined,
    verificationStatus: row.verification_status,
    verifiedAt: row.verified_at ?? undefined,
    isVerified: row.is_verified,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    websiteUrl: row.website_url,
    logoUrl: row.logo_url ?? undefined,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    plan: row.plan ?? "basic",
    planStartedAt: row.plan_started_at ?? undefined,
    planRenewsAt: row.plan_renews_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    brandId: row.brand_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    coverImageUrl: row.cover_image_url ?? undefined,
    productName: row.product_name,
    experienceType: row.experience_type,
    industry: row.industry as Campaign["industry"],
    category: row.category as Campaign["category"],
    offerTitle: row.offer_title,
    offerDescription: row.offer_description,
    offerValueLabel: row.offer_value_label,
    regionProvince: row.region_province ?? undefined,
    regionDistrict: row.region_district ?? undefined,
    venueAddress: row.venue_address ?? undefined,
    venueName: row.venue_name ?? undefined,
    privacyRetentionDays: row.privacy_retention_days,
    startAt: row.start_at,
    endAt: row.end_at,
    applyEndAt: row.apply_end_at,
    submissionDueAt: row.submission_due_at,
    recruitLimit: row.recruit_limit,
    status: row.status,
    reviewMode: row.review_mode,
    visibility: row.visibility,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapGuideline(row: CampaignGuidelineRow): CampaignGuideline {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    keyMessage: row.key_message,
    requiredPoints: row.required_points,
    prohibitedExpressions: row.prohibited_expressions,
    requiredHashtags: row.required_hashtags,
    requiredLinks: row.required_links,
    contentRetentionMonths: row.content_retention_months,
    minTextLength: row.min_text_length,
    requiredKeywordCount: row.required_keyword_count,
    allowPrivateAccount: row.allow_private_account,
    autoApprovalEnabled: row.auto_approval_enabled,
    autoRejectionEnabled: row.auto_rejection_enabled,
    extraNote: row.extra_note
  };
}

export function mapApplication(row: CampaignApplicationRow): CampaignApplication {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    channelType: row.channel_type,
    message: row.message,
    status: row.status,
    applicationPrivacyAgreed: row.application_privacy_agreed,
    applicationPrivacyAgreedAt: row.application_privacy_agreed_at ?? undefined,
    appliedAt: row.applied_at,
    decidedAt: row.decided_at ?? undefined,
    decidedBy: row.decided_by ?? undefined,
    adminNote: row.admin_note ?? undefined
  };
}

export function mapSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    channelType: row.channel_type,
    postUrl: row.post_url ?? undefined,
    postText: row.post_text,
    screenshotUrl: row.screenshot_url ?? undefined,
    postedAt: row.posted_at,
    submittedAt: row.submitted_at,
    status: row.status,
    reviewNote: row.review_note ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    extractedTitle: row.extracted_title ?? undefined,
    extractedText: row.extracted_text ?? undefined,
    autoCheckScore: row.auto_check_score,
    autoCheckResult: row.auto_check_result as Submission["autoCheckResult"]
  };
}

export function mapPenalty(row: UserPenaltyRow): UserPenalty {
  return {
    id: row.id,
    userId: row.user_id,
    submissionId: row.submission_id ?? undefined,
    campaignId: row.campaign_id ?? undefined,
    reason: row.reason,
    daysLate: row.days_late,
    suspensionDays: row.suspension_days,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at
  };
}

export function mapFulfillment(row: FulfillmentInfoRow): FulfillmentInfo {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    applicationId: row.application_id,
    userId: row.user_id,
    type: row.type,
    productInfo: row.product_info as FulfillmentInfo["productInfo"],
    localInfo: row.local_info as FulfillmentInfo["localInfo"],
    privacyAgreed: row.privacy_agreed,
    privacyAgreedAt: row.privacy_agreed_at ?? undefined,
    retentionUntil: row.retention_until,
    createdAt: row.created_at
  };
}

export function mapMetrics(row: SubmissionMetricsRow): SubmissionMetrics {
  return {
    id: row.id,
    submissionId: row.submission_id,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    sharesCount: row.shares_count,
    clicksCount: row.clicks_count,
    savesCount: row.saves_count,
    viewsCount: row.views_count,
    engagementScore: row.engagement_score,
    conversionCount: row.conversion_count,
    capturedAt: row.captured_at
  };
}
