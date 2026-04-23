create type user_role as enum ('member', 'admin', 'brand');
create type channel_type as enum ('threads', 'x', 'wordpress', 'kakao');
create type format_type as enum ('one_line', 'story', 'comparison', 'question', 'recommendation', 'debate');
create type campaign_status as enum ('draft', 'open', 'closed', 'paused', 'completed');
create type review_mode as enum ('manual', 'semi_auto', 'auto');
create type submission_status as enum ('submitted', 'processing', 'needs_review', 'auto_approved', 'auto_rejected', 'approved', 'rejected', 'fulfillment_pending', 'completed', 'revoked');
create type application_status as enum ('applied', 'selected', 'rejected', 'cancelled');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type experience_type as enum ('product', 'local');
create type brand_plan as enum ('basic', 'standard', 'pro');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  role user_role not null default 'member',
  nickname text not null,
  name text not null,
  email text not null unique,
  profile_image_url text,
  bio text default '',
  level int default 1,
  score int default 0,
  completed_missions int default 0,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  channel_type channel_type not null,
  channel_name text not null,
  channel_url text,
  handle text not null,
  follower_count int default 0,
  friend_count int,
  verification_screenshot_url text,
  verification_status verification_status default 'pending',
  verified_at timestamptz,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (user_id, channel_type)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  website_url text,
  logo_url text,
  contact_name text,
  contact_email text,
  plan brand_plan not null default 'basic',
  plan_started_at timestamptz default now(),
  plan_renews_at timestamptz,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id),
  title text not null,
  slug text not null unique,
  summary text not null,
  description text not null,
  cover_image_url text,
  product_name text not null,
  experience_type experience_type not null default 'product',
  industry text not null default '생활',
  category text not null default '생활용품',
  offer_title text not null default '',
  offer_description text not null default '',
  offer_value_label text not null default '제품 제공',
  region_province text,
  region_district text,
  venue_address text,
  venue_name text,
  privacy_retention_days int default 30,
  start_at timestamptz,
  end_at timestamptz,
  apply_end_at timestamptz,
  submission_due_at timestamptz,
  recruit_limit int,
  status campaign_status default 'draft',
  review_mode review_mode default 'semi_auto',
  visibility text default 'public',
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.campaign_channels (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  channel_type channel_type not null
);

create table public.campaign_formats (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  format_type format_type not null
);

create table public.campaign_guidelines (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  key_message text not null,
  required_points text[] default '{}',
  prohibited_expressions text[] default '{}',
  required_hashtags text[] default '{}',
  required_links text[] default '{}',
  content_retention_months int default 6,
  min_text_length int default 80,
  required_keyword_count int default 2,
  allow_private_account boolean default false,
  auto_approval_enabled boolean default false,
  auto_rejection_enabled boolean default true,
  extra_note text default ''
);

create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  channel_type channel_type not null,
  message text default '',
  status application_status default 'applied',
  application_privacy_agreed boolean default false,
  application_privacy_agreed_at timestamptz,
  applied_at timestamptz default now(),
  decided_at timestamptz,
  decided_by uuid references public.users(id),
  admin_note text,
  unique (campaign_id, user_id, channel_type)
);

create table public.fulfillment_infos (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  application_id uuid references public.campaign_applications(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  type experience_type not null,
  product_info jsonb,
  local_info jsonb,
  privacy_agreed boolean default false,
  privacy_agreed_at timestamptz,
  retention_until timestamptz not null,
  created_at timestamptz default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id),
  user_id uuid references public.users(id),
  channel_type channel_type not null,
  format_type format_type not null,
  post_url text,
  post_text text not null,
  screenshot_url text,
  posted_at timestamptz,
  submitted_at timestamptz default now(),
  status submission_status default 'submitted',
  review_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  extracted_title text,
  extracted_text text,
  auto_check_score int default 0,
  auto_check_result jsonb default '{}'::jsonb,
  unique (campaign_id, user_id, channel_type)
);

create table public.user_penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  submission_id uuid references public.submissions(id),
  campaign_id uuid references public.campaigns(id),
  reason text not null,
  days_late int default 0,
  suspension_days int default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz default now()
);

create table public.submission_metrics (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete cascade,
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  clicks_count int default 0,
  saves_count int default 0,
  views_count int default 0,
  engagement_score int default 0,
  conversion_count int default 0,
  captured_at timestamptz default now()
);
