-- ============================================================
-- Supabase Dashboard SQL Editor에서 실행하세요
-- ============================================================

-- 모든 테이블 RLS 활성화
alter table public.users enable row level security;
alter table public.user_channels enable row level security;
alter table public.brands enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_channels enable row level security;
alter table public.campaign_formats enable row level security;
alter table public.campaign_guidelines enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.fulfillment_infos enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_metrics enable row level security;
alter table public.user_penalties enable row level security;

-- 역할 확인은 users 정책 안에서 users를 다시 조회하지 않도록 security definer 함수로 분리합니다.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role::text from public.users where id = auth.uid()
$$;

-- ────────────────────────────────────────────────────────────
-- users
-- ────────────────────────────────────────────────────────────
create policy "users: 본인 조회" on public.users
  for select using (auth.uid() = id);

create policy "users: 관리자 전체 조회" on public.users
  for select using (
    public.current_user_role() = 'admin'
  );

create policy "users: 본인 등록" on public.users
  for insert with check (auth.uid() = id);

create policy "users: 본인 수정" on public.users
  for update using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- user_channels
-- ────────────────────────────────────────────────────────────
create policy "user_channels: 본인 조회" on public.user_channels
  for select using (auth.uid() = user_id);

create policy "user_channels: 관리자 전체 조회" on public.user_channels
  for select using (
    public.current_user_role() in ('admin', 'brand')
  );

create policy "user_channels: 본인 등록" on public.user_channels
  for insert with check (auth.uid() = user_id);

create policy "user_channels: 본인 수정" on public.user_channels
  for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- brands
-- ────────────────────────────────────────────────────────────
create policy "brands: 인증 사용자 조회" on public.brands
  for select using (auth.uid() is not null);

create policy "brands: 관리자 등록/수정" on public.brands
  for all using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- campaigns (공개 캠페인은 로그인 사용자 누구나 조회)
-- ────────────────────────────────────────────────────────────
create policy "campaigns: 공개 캠페인 조회" on public.campaigns
  for select using (visibility = 'public' and auth.uid() is not null);

create policy "campaigns: 관리자 전체 조회/수정" on public.campaigns
  for all using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- campaign_channels, campaign_formats, campaign_guidelines
-- ────────────────────────────────────────────────────────────
create policy "campaign_channels: 인증 사용자 조회" on public.campaign_channels
  for select using (auth.uid() is not null);

create policy "campaign_formats: 인증 사용자 조회" on public.campaign_formats
  for select using (auth.uid() is not null);

create policy "campaign_guidelines: 인증 사용자 조회" on public.campaign_guidelines
  for select using (auth.uid() is not null);

create policy "campaign_channels: 관리자 수정" on public.campaign_channels
  for all using (public.current_user_role() = 'admin');

create policy "campaign_formats: 관리자 수정" on public.campaign_formats
  for all using (public.current_user_role() = 'admin');

create policy "campaign_guidelines: 관리자 수정" on public.campaign_guidelines
  for all using (public.current_user_role() = 'admin');

-- ────────────────────────────────────────────────────────────
-- campaign_applications
-- ────────────────────────────────────────────────────────────
create policy "applications: 본인 조회" on public.campaign_applications
  for select using (auth.uid() = user_id);

create policy "applications: 관리자/브랜드 전체 조회" on public.campaign_applications
  for select using (
    public.current_user_role() in ('admin', 'brand')
  );

create policy "applications: 본인 등록" on public.campaign_applications
  for insert with check (auth.uid() = user_id);

create policy "applications: 관리자 상태 변경" on public.campaign_applications
  for update using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- submissions
-- ────────────────────────────────────────────────────────────
create policy "submissions: 본인 조회" on public.submissions
  for select using (auth.uid() = user_id);

create policy "submissions: 관리자 전체 조회" on public.submissions
  for select using (
    public.current_user_role() = 'admin'
  );

create policy "submissions: 본인 등록" on public.submissions
  for insert with check (auth.uid() = user_id);

create policy "submissions: 관리자 수정" on public.submissions
  for update using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- fulfillment_infos
-- ────────────────────────────────────────────────────────────
create policy "fulfillment: 본인 조회" on public.fulfillment_infos
  for select using (auth.uid() = user_id);

create policy "fulfillment: 관리자/브랜드 조회" on public.fulfillment_infos
  for select using (
    public.current_user_role() in ('admin', 'brand')
  );

create policy "fulfillment: 본인 등록" on public.fulfillment_infos
  for insert with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- user_penalties
-- ────────────────────────────────────────────────────────────
create policy "penalties: 본인 조회" on public.user_penalties
  for select using (auth.uid() = user_id);

create policy "penalties: 관리자 전체" on public.user_penalties
  for all using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- submission_metrics
-- ────────────────────────────────────────────────────────────
create policy "metrics: 인증 사용자 조회" on public.submission_metrics
  for select using (auth.uid() is not null);

create policy "metrics: 관리자 수정" on public.submission_metrics
  for all using (
    public.current_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.set_updated_at();

create trigger brands_updated_at before update on public.brands
  for each row execute function public.set_updated_at();
