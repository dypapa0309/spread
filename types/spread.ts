export type UserRole = "member" | "admin" | "brand";
export type ChannelType = "threads" | "x" | "wordpress" | "kakao";
export type CampaignStatus = "draft" | "open" | "closed" | "paused" | "completed";
export type ReviewMode = "manual" | "semi_auto" | "auto";
export type SubmissionStatus =
  | "submitted"
  | "processing"
  | "needs_review"
  | "auto_approved"
  | "auto_rejected"
  | "approved"
  | "rejected"
  | "fulfillment_pending"
  | "completed"
  | "revoked";
export type EntityStatus = "active" | "inactive" | "blocked" | "pending";
export type ApplicationStatus = "applied" | "selected" | "rejected" | "cancelled";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ExperienceType = "product" | "local";
export type BrandPlan = "basic" | "standard" | "pro";
export type AnalyticsEventName =
  | "page_view"
  | "sign_up_completed"
  | "login_completed"
  | "campaign_viewed"
  | "campaign_applied"
  | "application_selected"
  | "submission_started"
  | "submission_completed"
  | "channel_saved";
export type Industry =
  | "뷰티"
  | "푸드"
  | "생활"
  | "패션"
  | "디지털"
  | "육아"
  | "반려"
  | "건강"
  | "여행"
  | "교육"
  | "문화"
  | "로컬서비스";
export type ProductCategory = "스킨케어" | "식품" | "생활용품" | "패션잡화" | "가전/디지털" | "도서/교육" | "반려용품";
export type LocalCategory = "맛집" | "카페" | "뷰티샵" | "피트니스" | "클래스" | "숙박" | "전시/공연" | "체험공간";
export type CampaignCategory = ProductCategory | LocalCategory;

export type User = {
  id: string;
  role: UserRole;
  nickname: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  bio: string;
  level: number;
  score: number;
  completedMissions: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserChannel = {
  id: string;
  userId: string;
  channelType: ChannelType;
  channelName: string;
  channelUrl?: string;
  handle: string;
  followerCount: number;
  friendCount?: number;
  verificationScreenshotUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
};

export type Brand = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  contactName: string;
  contactEmail: string;
  plan: BrandPlan;
  planStartedAt?: string;
  planRenewsAt?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: string;
  brandId: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImageUrl?: string;
  productName: string;
  experienceType: ExperienceType;
  industry: Industry;
  category: CampaignCategory;
  offerTitle: string;
  offerDescription: string;
  offerValueLabel: string;
  regionProvince?: string;
  regionDistrict?: string;
  venueAddress?: string;
  venueName?: string;
  privacyRetentionDays: number;
  startAt: string;
  endAt: string;
  applyEndAt: string;
  submissionDueAt: string;
  recruitLimit: number;
  status: CampaignStatus;
  reviewMode: ReviewMode;
  visibility: "public" | "private";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignChannel = {
  id: string;
  campaignId: string;
  channelType: ChannelType;
};

export type CampaignGuideline = {
  id: string;
  campaignId: string;
  keyMessage: string;
  requiredPoints: string[];
  prohibitedExpressions: string[];
  requiredHashtags: string[];
  requiredLinks: string[];
  contentRetentionMonths: number;
  minTextLength: number;
  requiredKeywordCount: number;
  allowPrivateAccount: boolean;
  autoApprovalEnabled: boolean;
  autoRejectionEnabled: boolean;
  extraNote: string;
};

export type CampaignApplication = {
  id: string;
  campaignId: string;
  userId: string;
  channelType: ChannelType;
  message: string;
  status: ApplicationStatus;
  applicationPrivacyAgreed: boolean;
  applicationPrivacyAgreedAt?: string;
  appliedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  adminNote?: string;
};

export type ProductFulfillmentInfo = {
  recipientName: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo?: string;
};

export type LocalFulfillmentInfo = {
  visitorName: string;
  phone: string;
  preferredVisitAt: string;
  companionCount: number;
  requestNote?: string;
};

export type FulfillmentInfo = {
  id: string;
  campaignId: string;
  applicationId: string;
  userId: string;
  type: ExperienceType;
  productInfo?: ProductFulfillmentInfo;
  localInfo?: LocalFulfillmentInfo;
  privacyAgreed: boolean;
  privacyAgreedAt?: string;
  retentionUntil: string;
  createdAt: string;
};

export type Submission = {
  id: string;
  campaignId: string;
  userId: string;
  channelType: ChannelType;
  postUrl?: string;
  postText: string;
  screenshotUrl?: string;
  postedAt: string;
  submittedAt: string;
  status: SubmissionStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  extractedTitle?: string;
  extractedText?: string;
  autoCheckScore: number;
  autoCheckResult: AutoCheckResult;
};

export type UserPenalty = {
  id: string;
  userId: string;
  submissionId?: string;
  campaignId?: string;
  reason: string;
  daysLate: number;
  suspensionDays: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type SubmissionMetrics = {
  id: string;
  submissionId: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  clicksCount: number;
  savesCount: number;
  viewsCount: number;
  engagementScore: number;
  conversionCount: number;
  capturedAt: string;
};

export type AutoCheckIssue = {
  code: string;
  label: string;
  severity: "pass" | "warn" | "fail";
};

export type AutoCheckResult = {
  isValidUrl: boolean;
  isAllowedChannel: boolean;
  isDuplicate: boolean;
  isPublicLikely: boolean;
  hasRequiredKeywords: boolean;
  hasProhibitedExpression: boolean;
  meetsMinLength: boolean;
  needsScreenshot: boolean;
  score: number;
  issues: AutoCheckIssue[];
};

export type CampaignView = Campaign & {
  brand: Brand;
  channels: ChannelType[];
  guideline: CampaignGuideline;
  submissionsCount: number;
  applicationsCount: number;
  selectedCount: number;
  myApplicationStatus?: ApplicationStatus;
};

export type SubmissionView = Submission & {
  campaign: Campaign;
  brand: Brand;
  user: User;
  metrics?: SubmissionMetrics;
  penalty?: UserPenalty;
};

export type CampaignApplicationView = CampaignApplication & {
  campaign: Campaign;
  brand: Brand;
  user: User;
  channel?: UserChannel;
  channels?: UserChannel[];
  channelTypes?: ChannelType[];
  applicationIds?: string[];
  approvalRate: number;
  activePenalty?: UserPenalty;
  fulfillment?: FulfillmentInfo;
};

export type SubmissionEligibility = {
  canSubmit: boolean;
  reason: "selected" | "not_applied" | "pending" | "rejected" | "penalty" | "campaign_missing";
  message: string;
  penalty?: UserPenalty;
};

export type CampaignDraftPreset = {
  sourceCampaignId: string;
  title: string;
  experienceType: ExperienceType;
  industry: Industry;
  category: CampaignCategory;
  offerTitle: string;
  offerDescription: string;
  offerValueLabel: string;
  channels: ChannelType[];
  keyMessage: string;
};

export type SubmissionChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  channelTypes: ChannelType[];
  checked: boolean;
};

export type AnalyticsVisitor = {
  id: string;
  visitorId: string;
  userId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  firstReferrer?: string;
  firstLandingPath?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsSession = {
  id: string;
  sessionId: string;
  visitorId: string;
  userId?: string;
  startedAt: string;
  endedAt?: string;
  landingPath: string;
  referrer?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsEventPayload = {
  eventName: AnalyticsEventName;
  visitorId: string;
  sessionId: string;
  path: string;
  routePattern?: string;
  referrer?: string;
  campaignId?: string;
  channelType?: ChannelType;
  userRole?: UserRole;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
};

export type AnalyticsEvent = {
  id: string;
  eventName: AnalyticsEventName;
  visitorId: string;
  sessionId: string;
  userId?: string;
  userRole?: UserRole;
  path: string;
  routePattern?: string;
  referrer?: string;
  campaignId?: string;
  channelType?: ChannelType;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
};

export type AnalyticsKpiSummary = {
  totalUsers: number;
  newUsersToday: number;
  newUsers7d: number;
  newUsers30d: number;
  visitorsToday: number;
  sessionsToday: number;
  pageViewsToday: number;
  dau: number;
  wau: number;
  mau: number;
  activeUsers7d: number;
  applicationConversionRate: number;
  submissionConversionRate: number;
};

export type AnalyticsTimeSeriesPoint = {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  signUps: number;
  applications: number;
  selected: number;
  submissions: number;
};

export type AnalyticsFunnelStep = {
  key: string;
  label: string;
  count: number;
  conversionFromPrevious?: number;
};

export type AnalyticsTopCampaignRow = {
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  views: number;
  applications: number;
  submissions: number;
  applicationConversionRate: number;
  submissionConversionRate: number;
};

export type AnalyticsTopPageRow = {
  path: string;
  routePattern: string;
  views: number;
  uniqueVisitors: number;
  avgViewsPerVisitor: number;
};

export type AnalyticsChannelActivityRow = {
  channelType: ChannelType;
  pageViews: number;
  applications: number;
  submissions: number;
};

export type AnalyticsUserActivityRow = {
  userId: string;
  nickname: string;
  role: UserRole;
  lastSeenAt: string;
  pageViews: number;
  applications: number;
  submissions: number;
  lastActionLabel: string;
};

export type AnalyticsRetentionPoint = {
  cohortDate: string;
  cohortSize: number;
  day1Rate: number;
  day7Rate: number;
  day30Rate: number;
};

export type AnalyticsActivityFeedRow = {
  id: string;
  occurredAt: string;
  eventName: AnalyticsEventName;
  label: string;
  path: string;
  nickname?: string;
  userRole?: UserRole;
};

export type AnalyticsFilters = {
  days: 1 | 7 | 30 | 90;
  role?: UserRole | "all";
  channel?: ChannelType | "all";
  campaignId?: string | "all";
};

export type AnalyticsDashboardData = {
  filters: AnalyticsFilters;
  summary: AnalyticsKpiSummary;
  timeSeries: AnalyticsTimeSeriesPoint[];
  funnel: AnalyticsFunnelStep[];
  topCampaigns: AnalyticsTopCampaignRow[];
  topPages: AnalyticsTopPageRow[];
  channelActivity: AnalyticsChannelActivityRow[];
  activeUsers: AnalyticsUserActivityRow[];
  recentActivity: AnalyticsActivityFeedRow[];
  retention: AnalyticsRetentionPoint[];
  campaigns: Pick<Campaign, "id" | "title">[];
};
