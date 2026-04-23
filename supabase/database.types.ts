import type {
  Brand,
  Campaign,
  CampaignChannel,
  CampaignFormat,
  CampaignGuideline,
  Reward,
  Submission,
  SubmissionMetrics,
  User,
  UserChannel
} from "@/types/spread";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      user_channels: { Row: UserChannel; Insert: Partial<UserChannel>; Update: Partial<UserChannel> };
      brands: { Row: Brand; Insert: Partial<Brand>; Update: Partial<Brand> };
      campaigns: { Row: Campaign; Insert: Partial<Campaign>; Update: Partial<Campaign> };
      campaign_channels: { Row: CampaignChannel; Insert: Partial<CampaignChannel>; Update: Partial<CampaignChannel> };
      campaign_formats: { Row: CampaignFormat; Insert: Partial<CampaignFormat>; Update: Partial<CampaignFormat> };
      campaign_guidelines: { Row: CampaignGuideline; Insert: Partial<CampaignGuideline>; Update: Partial<CampaignGuideline> };
      submissions: { Row: Submission; Insert: Partial<Submission>; Update: Partial<Submission> };
      submission_metrics: { Row: SubmissionMetrics; Insert: Partial<SubmissionMetrics>; Update: Partial<SubmissionMetrics> };
      rewards: { Row: Reward; Insert: Partial<Reward>; Update: Partial<Reward> };
    };
  };
};
