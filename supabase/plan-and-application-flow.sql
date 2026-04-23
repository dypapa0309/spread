-- Supabase SQL Editor에서 1회 실행하세요.
-- 신청 중복 방지, 채널 upsert, 광고주 플랜 한도 컬럼을 추가합니다.

do $$ begin
  create type public.brand_plan as enum ('basic', 'standard', 'pro');
exception
  when duplicate_object then null;
end $$;

alter table public.brands
  add column if not exists plan public.brand_plan not null default 'basic',
  add column if not exists plan_started_at timestamptz default now(),
  add column if not exists plan_renews_at timestamptz;

with ranked as (
  select id, row_number() over (partition by campaign_id, user_id, channel_type order by applied_at asc, id asc) as rn
  from public.campaign_applications
)
delete from public.campaign_applications
where id in (select id from ranked where rn > 1);

with ranked as (
  select id, row_number() over (partition by user_id, channel_type order by created_at asc, id asc) as rn
  from public.user_channels
)
delete from public.user_channels
where id in (select id from ranked where rn > 1);

with ranked as (
  select id, row_number() over (partition by campaign_id, user_id, channel_type order by submitted_at asc, id asc) as rn
  from public.submissions
)
delete from public.submissions
where id in (select id from ranked where rn > 1);

do $$ begin
  alter table public.campaign_applications
    add constraint campaign_applications_campaign_user_channel_key
    unique (campaign_id, user_id, channel_type);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.user_channels
    add constraint user_channels_user_channel_key
    unique (user_id, channel_type);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.submissions
    add constraint submissions_campaign_user_channel_key
    unique (campaign_id, user_id, channel_type);
exception
  when duplicate_object then null;
end $$;

drop policy if exists "applications: 본인 등록" on public.campaign_applications;
create policy "applications: 본인 등록" on public.campaign_applications
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_channels: 본인 등록" on public.user_channels;
create policy "user_channels: 본인 등록" on public.user_channels
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_channels: 본인 수정" on public.user_channels;
create policy "user_channels: 본인 수정" on public.user_channels
  for update using (auth.uid() = user_id);
