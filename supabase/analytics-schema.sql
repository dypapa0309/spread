-- Supabase SQL Editor에서 실행하세요.
-- SPREAD 내부 분석용 테이블과 인덱스를 추가합니다.
-- 원본 이벤트 보관 기준: 12개월

begin;

create table if not exists public.analytics_visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null unique,
  user_id uuid references public.users(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  first_referrer text,
  first_landing_path text not null default '/',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  visitor_id text not null,
  user_id uuid references public.users(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now(),
  landing_path text not null default '/',
  referrer text,
  device_type text,
  browser text,
  os text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in (
      'page_view',
      'sign_up_completed',
      'login_completed',
      'campaign_viewed',
      'campaign_applied',
      'application_selected',
      'submission_started',
      'submission_completed',
      'channel_saved'
    )
  ),
  visitor_id text not null,
  session_id text not null,
  user_id uuid references public.users(id) on delete set null,
  user_role text check (user_role in ('member', 'admin', 'brand')),
  path text not null,
  route_pattern text not null,
  referrer text,
  campaign_id uuid references public.campaigns(id) on delete set null,
  channel_type text check (channel_type in ('threads', 'x', 'wordpress', 'kakao')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists analytics_visitors_last_seen_at_idx on public.analytics_visitors(last_seen_at desc);
create index if not exists analytics_visitors_user_id_idx on public.analytics_visitors(user_id);

create index if not exists analytics_sessions_started_at_idx on public.analytics_sessions(started_at desc);
create index if not exists analytics_sessions_user_id_idx on public.analytics_sessions(user_id);
create index if not exists analytics_sessions_visitor_id_idx on public.analytics_sessions(visitor_id);

create index if not exists analytics_events_occurred_at_idx on public.analytics_events(occurred_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_visitor_id_idx on public.analytics_events(visitor_id);
create index if not exists analytics_events_session_id_idx on public.analytics_events(session_id);
create index if not exists analytics_events_campaign_id_idx on public.analytics_events(campaign_id);
create index if not exists analytics_events_channel_type_idx on public.analytics_events(channel_type);

alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "analytics visitors: admin read" on public.analytics_visitors;
create policy "analytics visitors: admin read" on public.analytics_visitors
  for select using (public.current_user_role() = 'admin');

drop policy if exists "analytics sessions: admin read" on public.analytics_sessions;
create policy "analytics sessions: admin read" on public.analytics_sessions
  for select using (public.current_user_role() = 'admin');

drop policy if exists "analytics events: admin read" on public.analytics_events;
create policy "analytics events: admin read" on public.analytics_events
  for select using (public.current_user_role() = 'admin');

comment on table public.analytics_events is 'SPREAD 내부 분석 이벤트 원본. 12개월 이후 raw 이벤트는 삭제하거나 rollup만 남기는 것을 권장합니다.';

commit;
