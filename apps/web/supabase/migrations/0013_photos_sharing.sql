-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- ───────── 증명사진 ─────────
-- 사진 파일은 Storage 의 wmto-avatars 버킷(공개 읽기)에 서버가 올리고, 주소만 members.photo_url 에 저장합니다.
alter table members add column if not exists photo_url text;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values ('wmto-avatars', 'wmto-avatars', true) on conflict (id) do nothing;
  end if;
end $$;

-- ───────── 멘토링 기록 공유 ─────────
-- 기본은 공유(같은 선교사를 돕는 다른 멘토도 볼 수 있음). shared = false 이면 쓴 멘토와 그 선교사만 봅니다.
alter table mentoring_logs add column if not exists shared boolean not null default true;

-- 내가 볼 수 있는 멘토링 기록: 내 동행의 모든 기록 + (사업가는) 내가 돕는 선교사에 대해 다른 멘토가 공유한 기록
create or replace function mentoring_feed() returns table (
  id uuid, matching_id uuid, partner_id uuid, partner_name text, partner_photo text,
  author_id uuid, author_name text, author_photo text,
  held_at timestamptz, duration_min int, content text, next_steps text, prayer_topics text,
  shared boolean, mine boolean
) language sql stable security definer set search_path = wmto as $$
  select l.id, l.matching_id, x.partner_id, p.name, p.photo_url,
         l.created_by, a.name, a.photo_url,
         l.held_at, l.duration_min, l.content, l.next_steps, l.prayer_topics,
         l.shared, (l.created_by = current_member_id())
  from mentoring_logs l
  join matchings x on x.id = l.matching_id
  join members p on p.id = x.partner_id
  left join members a on a.id = l.created_by
  where current_member_id() is not null and (
        x.mentor_id = current_member_id()
     or x.partner_id = current_member_id()
     or (l.shared and current_member_role() = 'mentor'
         and x.partner_id in (select partner_id from matchings where mentor_id = current_member_id())))
  order by l.held_at desc
  limit 200;
$$;
revoke all on function mentoring_feed() from public, anon;
grant execute on function mentoring_feed() to authenticated;

-- ───────── 사업가 찾기에 사진 ─────────
drop function if exists mentor_directory();
create function mentor_directory() returns table (
  id uuid, name text, industry text, business_name text,
  country text, region text, district text, chapter text,
  contribution_types text[], stage text, mentee_count int, joined_at timestamptz, photo_url text
) language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, mp.industry, mp.business_name,
         m.country, coalesce(nullif(m.region, ''), m.country), m.district, coalesce(c.name, m.chapter),
         mp.contribution_types::text[], mp.stage::text,
         (select count(*)::int from matchings x where x.mentor_id = m.id),
         m.created_at, m.photo_url
  from members m
  join mentor_profiles mp on mp.member_id = m.id
  left join chapters c on c.id = m.chapter_id
  where m.role = 'mentor' and m.status = 'active'
    and current_member_role() = 'mentor' and m.id <> current_member_id()
  order by m.name;
$$;
revoke all on function mentor_directory() from public, anon;
grant execute on function mentor_directory() to authenticated;

-- ───────── 텐트 구성원에 사진 ─────────
create or replace function tent_overview(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare out jsonb;
begin
  if not is_tent_member(p_chapter) then return null; end if;
  select jsonb_build_object(
    'tent', (select to_jsonb(c) - 'created_at' from chapters c where c.id = p_chapter),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'name', x.name, 'photo_url', x.photo_url, 'role', x.role, 'country', x.country, 'joined_at', x.created_at,
        'industry', mp.industry, 'business_name', mp.business_name, 'contribution_types', mp.contribution_types,
        'mission_field', pp.mission_field, 'business_idea', pp.business_idea,
        'stage', coalesce(mp.stage::text, pp.stage::text), 'via', x.via,
        'mentee_count', (select count(*) from matchings q where q.mentor_id = x.id)
      ) order by x.role, x.name)
      from (
        select m.id, m.name, m.role, m.country, m.created_at, m.photo_url, 'own' as via from members m
          where m.chapter_id = p_chapter and m.status = 'active'
        union
        select m.id, m.name, m.role, m.country, m.created_at, m.photo_url, 'mentor' from members m
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
