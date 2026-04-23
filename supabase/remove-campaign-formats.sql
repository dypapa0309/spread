-- Supabase SQL Editor에서 실행하세요.
-- SPREAD에서 "포맷" 개념을 완전히 제거합니다.

begin;

drop policy if exists "campaign_formats: 인증 사용자 조회" on public.campaign_formats;
drop policy if exists "campaign_formats: 관리자 수정" on public.campaign_formats;

alter table if exists public.submissions
  drop column if exists format_type;

drop table if exists public.campaign_formats;

do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'format_type'
  ) then
    drop type public.format_type;
  end if;
end $$;

commit;
