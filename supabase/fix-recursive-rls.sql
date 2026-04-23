-- Supabase SQL Editor에서 1회 실행하세요.
-- 기존 users 자기참조 RLS로 인한 "infinite recursion detected" / REST 500 오류를 수정합니다.

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role::text from public.users where id = auth.uid()
$$;

drop policy if exists "users: 관리자 전체 조회" on public.users;
create policy "users: 관리자 전체 조회" on public.users
  for select using (public.current_user_role() = 'admin');

drop policy if exists "user_channels: 관리자 전체 조회" on public.user_channels;
create policy "user_channels: 관리자 전체 조회" on public.user_channels
  for select using (public.current_user_role() in ('admin', 'brand'));

drop policy if exists "brands: 관리자 등록/수정" on public.brands;
create policy "brands: 관리자 등록/수정" on public.brands
  for all using (public.current_user_role() = 'admin');

drop policy if exists "campaigns: 관리자 전체 조회/수정" on public.campaigns;
create policy "campaigns: 관리자 전체 조회/수정" on public.campaigns
  for all using (public.current_user_role() = 'admin');

drop policy if exists "campaign_channels: 관리자 수정" on public.campaign_channels;
create policy "campaign_channels: 관리자 수정" on public.campaign_channels
  for all using (public.current_user_role() = 'admin');

drop policy if exists "campaign_formats: 관리자 수정" on public.campaign_formats;
create policy "campaign_formats: 관리자 수정" on public.campaign_formats
  for all using (public.current_user_role() = 'admin');

drop policy if exists "campaign_guidelines: 관리자 수정" on public.campaign_guidelines;
create policy "campaign_guidelines: 관리자 수정" on public.campaign_guidelines
  for all using (public.current_user_role() = 'admin');

drop policy if exists "applications: 관리자/브랜드 전체 조회" on public.campaign_applications;
create policy "applications: 관리자/브랜드 전체 조회" on public.campaign_applications
  for select using (public.current_user_role() in ('admin', 'brand'));

drop policy if exists "applications: 관리자 상태 변경" on public.campaign_applications;
create policy "applications: 관리자 상태 변경" on public.campaign_applications
  for update using (public.current_user_role() = 'admin');

drop policy if exists "submissions: 관리자 전체 조회" on public.submissions;
create policy "submissions: 관리자 전체 조회" on public.submissions
  for select using (public.current_user_role() = 'admin');

drop policy if exists "submissions: 관리자 수정" on public.submissions;
create policy "submissions: 관리자 수정" on public.submissions
  for update using (public.current_user_role() = 'admin');

drop policy if exists "fulfillment: 관리자/브랜드 조회" on public.fulfillment_infos;
create policy "fulfillment: 관리자/브랜드 조회" on public.fulfillment_infos
  for select using (public.current_user_role() in ('admin', 'brand'));

drop policy if exists "penalties: 관리자 전체" on public.user_penalties;
create policy "penalties: 관리자 전체" on public.user_penalties
  for all using (public.current_user_role() = 'admin');

drop policy if exists "metrics: 관리자 수정" on public.submission_metrics;
create policy "metrics: 관리자 수정" on public.submission_metrics
  for all using (public.current_user_role() = 'admin');
