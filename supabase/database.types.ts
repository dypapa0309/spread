// Supabase가 실제로 반환하는 snake_case DB 로우 타입

export type UserRow = {
  id: string;
  role: "member" | "admin" | "brand";
  nickname: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  bio: string;
  level: number;
  score: number;
  completed_missions: number;
  status: "active" | "inactive" | "blocked" | "pending";
  created_at: string;
  updated_at: string;
};

export type UserChannelRow = {
  id: string;
  user_id: string;
  channel_type: "threads" | "x" | "wordpress" | "kakao";
  channel_name: string;
  channel_url: string | null;
  handle: string;
  follower_count: number;
  friend_count: number | null;
  verification_screenshot_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verified_at: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type BrandRow = {
  id: string;
  name: string;
  description: string;
  website_url: string;
  logo_url: string | null;
  contact_name: string;
  contact_email: string;
  status: "active" | "inactive" | "blocked" | "pending";
  created_at: string;
  updated_at: string;
};

export type CampaignRow = {
  id: string;
  brand_id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  cover_image_url: string | null;
  product_name: string;
  experience_type: "product" | "local";
  industry: string;
  category: string;
  offer_title: string;
  offer_description: string;
  offer_value_label: string;
  region_province: string | null;
  region_district: string | null;
  venue_address: string | null;
  venue_name: string | null;
  privacy_retention_days: number;
  start_at: string;
  end_at: string;
  apply_end_at: string;
  submission_due_at: string;
  recruit_limit: number;
  status: "draft" | "open" | "closed" | "paused" | "completed";
  review_mode: "manual" | "semi_auto" | "auto";
  visibility: "public" | "private";
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CampaignGuidelineRow = {
  id: string;
  campaign_id: string;
  key_message: string;
  required_points: string[];
  prohibited_expressions: string[];
  required_hashtags: string[];
  required_links: string[];
  content_retention_months: number;
  min_text_length: number;
  required_keyword_count: number;
  allow_private_account: boolean;
  auto_approval_enabled: boolean;
  auto_rejection_enabled: boolean;
  extra_note: string;
};

export type CampaignApplicationRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  channel_type: "threads" | "x" | "wordpress" | "kakao";
  message: string;
  status: "applied" | "selected" | "rejected" | "cancelled";
  application_privacy_agreed: boolean;
  application_privacy_agreed_at: string | null;
  applied_at: string;
  decided_at: string | null;
  decided_by: string | null;
  admin_note: string | null;
};

export type SubmissionRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  channel_type: "threads" | "x" | "wordpress" | "kakao";
  format_type: "one_line" | "story" | "comparison" | "question" | "recommendation" | "debate";
  post_url: string | null;
  post_text: string;
  screenshot_url: string | null;
  posted_at: string;
  submitted_at: string;
  status: "submitted" | "processing" | "needs_review" | "auto_approved" | "auto_rejected" | "approved" | "rejected" | "fulfillment_pending" | "completed" | "revoked";
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  extracted_title: string | null;
  extracted_text: string | null;
  auto_check_score: number;
  auto_check_result: Record<string, unknown>;
};

export type UserPenaltyRow = {
  id: string;
  user_id: string;
  submission_id: string | null;
  campaign_id: string | null;
  reason: string;
  days_late: number;
  suspension_days: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

export type FulfillmentInfoRow = {
  id: string;
  campaign_id: string;
  application_id: string;
  user_id: string;
  type: "product" | "local";
  product_info: Record<string, unknown> | null;
  local_info: Record<string, unknown> | null;
  privacy_agreed: boolean;
  privacy_agreed_at: string | null;
  retention_until: string;
  created_at: string;
};

export type SubmissionMetricsRow = {
  id: string;
  submission_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  clicks_count: number;
  saves_count: number;
  views_count: number;
  engagement_score: number;
  conversion_count: number;
  captured_at: string;
};
