-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 텐트 모임: 지역(또는 온라인)별 모임. 테이블은 기존 chapters 를 그대로 씁니다.
--  · 사업가·후원자: 자기 텐트(members.chapter_id)
--  · 선교사: 자기 텐트 + 동행하는 멘토들의 텐트(자동 합류)

create table if not exists tent_posts (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  author_id uuid references members(id) on delete set null,
  kind text not null default 'notice' check (kind in ('notice', 'recap')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists tent_posts_chapter_idx on tent_posts (chapter_id, created_at desc);
alter table tent_posts enable row level security;

create or replace function my_tent_ids() returns setof uuid
language sql stable security definer set search_path = wmto as $$
  select chapter_id from members where id = current_member_id() and chapter_id is not null
  union
  select mm.chapter_id from matchings x join members mm on mm.id = x.mentor_id
  where x.partner_id = current_member_id() and mm.chapter_id is not null;
$$;

-- 이 텐트의 구성원인가? (관리자는 모두 볼 수 있음)
create or replace function is_tent_member(p_chapter uuid) returns boolean
language sql stable security definer set search_path = wmto as $$
  select is_admin() or exists (select 1 from my_tent_ids() t where t = p_chapter);
$$;

drop policy if exists tent_posts_read on tent_posts;
create policy tent_posts_read on tent_posts for select using (is_tent_member(chapter_id));
drop policy if exists tent_posts_write on tent_posts;
create policy tent_posts_write on tent_posts for insert
  with check (is_admin() or (current_member_role() = 'mentor' and author_id = current_member_id() and chapter_id in (select my_tent_ids())));
drop policy if exists tent_posts_admin on tent_posts;
create policy tent_posts_admin on tent_posts for all using (is_admin()) with check (is_admin());
drop policy if exists viewas_no_insert on tent_posts;
drop policy if exists viewas_no_update on tent_posts;
drop policy if exists viewas_no_delete on tent_posts;
create policy viewas_no_insert on tent_posts as restrictive for insert with check (request_view_as() is null);
create policy viewas_no_update on tent_posts as restrictive for update using (request_view_as() is null);
create policy viewas_no_delete on tent_posts as restrictive for delete using (request_view_as() is null);

-- 내 텐트 목록 (own = 내가 속한 텐트, mentor = 멘토를 따라 합류한 텐트)
create or replace function my_tents() returns table (id uuid, name text, region text, via text)
language sql stable security definer set search_path = wmto as $$
  select c.id, c.name, c.region,
         case when c.id = (select chapter_id from members where id = current_member_id()) then 'own' else 'mentor' end
  from chapters c where c.id in (select my_tent_ids())
  order by 4, c.name;
$$;

-- 텐트 한 곳의 모임 화면 데이터. 연락처는 포함하지 않습니다.
create or replace function tent_overview(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare out jsonb;
begin
  if not is_tent_member(p_chapter) then return null; end if;
  select jsonb_build_object(
    'tent', (select to_jsonb(c) - 'created_at' from chapters c where c.id = p_chapter),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'name', x.name, 'role', x.role, 'country', x.country, 'joined_at', x.created_at,
        'industry', mp.industry, 'business_name', mp.business_name, 'contribution_types', mp.contribution_types,
        'mission_field', pp.mission_field, 'business_idea', pp.business_idea,
        'stage', coalesce(mp.stage::text, pp.stage::text), 'via', x.via,
        'mentee_count', (select count(*) from matchings q where q.mentor_id = x.id)
      ) order by x.role, x.name)
      from (
        select m.id, m.name, m.role, m.country, m.created_at, 'own' as via from members m
          where m.chapter_id = p_chapter and m.status = 'active'
        union
        select m.id, m.name, m.role, m.country, m.created_at, 'mentor' from members m
          where m.status = 'active' and m.role = 'partner' and m.chapter_id is distinct from p_chapter
            and exists (select 1 from matchings q join members mm on mm.id = q.mentor_id where q.partner_id = m.id and mm.chapter_id = p_chapter)
      ) x
      left join mentor_profiles mp on mp.member_id = x.id
      left join partner_profiles pp on pp.member_id = x.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'type', e.type, 'title', e.title, 'start_at', e.start_at, 'location', e.location,
        'meeting_url', e.meeting_url,
        'attended', (select count(*) from attendance a where a.event_id = e.id),
        'me_attended', exists (select 1 from attendance a where a.event_id = e.id and a.member_id = current_member_id())
      ) order by e.start_at desc)
      from (select * from events where chapter_id = p_chapter order by start_at desc limit 12) e
    ), '[]'::jsonb),
    'posts', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'kind', p.kind, 'title', p.title, 'body', p.body,
                                          'created_at', p.created_at, 'author', a.name) order by p.created_at desc)
      from (select * from tent_posts where chapter_id = p_chapter order by created_at desc limit 8) p
      left join members a on a.id = p.author_id
    ), '[]'::jsonb),
    'activity', jsonb_build_object(
      'matchings', (select count(*) from matchings q join members mm on mm.id = q.mentor_id where mm.chapter_id = p_chapter and q.status = 'active'),
      'logs_30d', (select count(*) from mentoring_logs l join matchings q on q.id = l.matching_id join members mm on mm.id = q.mentor_id
                    where mm.chapter_id = p_chapter and l.held_at > now() - interval '30 days')
    )
  ) into out;
  return out;
end $$;

revoke all on function my_tents() from public, anon;
revoke all on function tent_overview(uuid) from public, anon;
revoke all on function my_tent_ids() from public, anon;
revoke all on function is_tent_member(uuid) from public, anon;
grant execute on function my_tents() to authenticated;
grant execute on function tent_overview(uuid) to authenticated;
grant execute on function my_tent_ids() to authenticated;
grant execute on function is_tent_member(uuid) to authenticated;
