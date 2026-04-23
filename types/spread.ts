export type UserRole = "member" | "admin" | "brand";
export type ChannelType = "threads" | "x" | "wordpress" | "kakao";
export type FormatType = "one_line" | "story" | "comparison" | "question" | "recommendation" | "debate";
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
  | "reward_pending"
  | "paid"
  | "revoked";
export type RewardStatus = "pending" | "approved" | "paid" | "cancelled";
export type EntityStatus = "active" | "inactive" | "blocked" | "pending";
export type ApplicationStatus = "applied" | "selected" | "rejected" | "cancelled";
export type VerificationStatus = "pending" | "verified" | "rejected";

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
  totalEarnings: number;
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
  startAt: string;
  endAt: string;
  applyEndAt: string;
  submissionDueAt: string;
  recruitLimit: number;
  baseReward: number;
  bonusRewardMax: number;
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

export type CampaignFormat = {
  id: string;
  campaignId: string;
  formatType: FormatType;
};

export type CampaignGuideline = {
  id: string;
  campaignId: string;
  keyMessage: string;
  requiredPoints: string[];
  prohibitedExpressions: string[];
  requiredHashtags: string[];
  requiredLinks: string[];
  minLiveHours: number;
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
  appliedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  adminNote?: string;
};

export type Submission = {
  id: string;
  campaignId: string;
  userId: string;
  channelType: ChannelType;
  formatType: FormatType;
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

export type Reward = {
  id: string;
  submissionId: string;
  userId: string;
  campaignId: string;
  baseReward: number;
  bonusReward: number;
  totalReward: number;
  status: RewardStatus;
  decidedAt?: string;
  paidAt?: string;
  createdAt: string;
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
  formats: FormatType[];
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
  reward?: Reward;
  metrics?: SubmissionMetrics;
  penalty?: UserPenalty;
};

export type CampaignApplicationView = CampaignApplication & {
  campaign: Campaign;
  brand: Brand;
  user: User;
  channel?: UserChannel;
  approvalRate: number;
  activePenalty?: UserPenalty;
};

export type SubmissionEligibility = {
  canSubmit: boolean;
  reason: "selected" | "not_applied" | "pending" | "rejected" | "penalty" | "campaign_missing";
  message: string;
  penalty?: UserPenalty;
};
