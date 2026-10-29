-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 리퍼럴 받을 사업가 디렉토리: 업종·지역·도움 방식·단계·동행 중인 선교사 수까지 보여 줍니다.
-- 연락처 같은 민감한 정보는 포함하지 않습니다.
drop function if exists mentor_directory();
create function mentor_directory() returns table (
  id uuid, name text, industry text, business_name text,
  country text, region text, chapter text,
  contribution_types text[], stage text, mentee_count int, joined_at timestamptz
) language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, mp.industry, mp.business_name,
         m.country, c.region, coalesce(c.name, m.chapter),
         mp.contribution_types::text[], mp.stage::text,
         (select count(*)::int from matchings x where x.mentor_id = m.id),
         m.created_at
  from members m
  join mentor_profiles mp on mp.member_id = m.id
  left join chapters c on c.id = m.chapter_id
  where m.role = 'mentor' and m.status = 'active'
    and current_member_role() = 'mentor' and m.id <> current_member_id()
  order by m.name;
$$;
revoke all on function mentor_directory() from public, anon;
grant execute on function mentor_directory() to authenticated;
