-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 12단계: 새 회원 첫 90일 동행 (docs/13)
-- 입회 90일 안의 새 회원에게 "동행 짝"(같은 텐트의 기존 회원)을 정해 주고, 일곱 가지 "첫걸음"을 자동으로 확인해 보여 준다.
-- 짝이 되면 섬김 점수가 오른다. 텐트장은 텐트 현황에서 새 회원의 걸음과 짝 지정 여부를 본다.
create table if not exists companions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  newcomer_id uuid not null references members(id) on delete cascade,
  buddy_id uuid not null references members(id) on delete cascade,
  assigned_by uuid references members(id),
  started_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'done', 'ended')),
  check (newcomer_id <> buddy_id)
);
create unique index if not exists companions_one_active on companions (newcomer_id) where status = 'active';
create index if not exists companions_buddy_idx on companions (buddy_id, started_at desc);
alter table companions enable row level security;
drop policy if exists companions_party_read on companions;
create policy companions_party_read on companions for select using (newcomer_id = current_member_id() or buddy_id = current_member_id() or is_admin() or is_chapter_leader(chapter_id));
drop policy if exists companions_admin on companions;
create policy companions_admin on companions for all using (is_admin()) with check (is_admin());

-- 첫걸음 7가지(입회일부터): 프로필, 짝과 1:1, 다른 사업가와 1:1 2회, 첫 소개, 손님 초대, 배움 2단위, 모임 3회
create or replace function first90_steps(p_member uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare m members; mp mentor_profiles; buddy uuid; steps jsonb := '[]'::jsonb;
  prof boolean; o_buddy boolean; o_cnt int; refs int; vis int; lrn numeric; att int;
begin
  select * into m from members where id = p_member;
  select * into mp from mentor_profiles where member_id = p_member;
  select buddy_id into buddy from companions where newcomer_id = p_member and status = 'active';
  prof := m.photo_url is not null and m.phone is not null and mp.business_name is not null and mp.category_id is not null and coalesce(btrim(mp.intro), '') <> '';
  select count(*) into o_cnt from one_to_ones o where o.status = 'confirmed' and (o.member_a = p_member or o.member_b = p_member) and (buddy is null or not (o.member_a = buddy or o.member_b = buddy));
  o_buddy := buddy is not null and exists (select 1 from one_to_ones o where o.status = 'confirmed' and ((o.member_a = p_member and o.member_b = buddy) or (o.member_b = p_member and o.member_a = buddy)));
  select count(*) into refs from referrals where giver_id = p_member;
  select count(*) into vis from visitors where invited_by = p_member and kind = 'guest';
  select (select count(*) from academy_completions where member_id = p_member)
       + coalesce((select sum(qty * case kind when 'scripture' then 1 else 2 end) from learning_logs where member_id = p_member), 0) into lrn;
  select count(*) into att from attendance where member_id = p_member;
  return jsonb_build_array(
    jsonb_build_object('key', 'profile', 'done', prof, 'actual', case when prof then 1 else 0 end, 'target', 1),
    jsonb_build_object('key', 'buddy', 'done', o_buddy, 'actual', case when o_buddy then 1 else 0 end, 'target', 1),
    jsonb_build_object('key', 'one_to_one', 'done', o_cnt >= 2, 'actual', least(o_cnt, 2), 'target', 2),
    jsonb_build_object('key', 'referral', 'done', refs >= 1, 'actual', least(refs, 1), 'target', 1),
    jsonb_build_object('key', 'visitor', 'done', vis >= 1, 'actual', least(vis, 1), 'target', 1),
    jsonb_build_object('key', 'learning', 'done', lrn >= 2, 'actual', least(lrn, 2), 'target', 2),
    jsonb_build_object('key', 'attendance', 'done', att >= 3, 'actual', least(att, 3), 'target', 3));
end $$;
revoke all on function first90_steps(uuid) from public, anon, authenticated;

-- 내 첫 90일(입회 90일이 지나면 null)
create or replace function my_first90() returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); m members; bname text; bid uuid; day int;
begin
  if me is null or current_member_role() <> 'mentor' then return null; end if;
  select * into m from members where id = me;
  day := floor(extract(epoch from (now() - m.created_at)) / 86400)::int;
  if day >= 90 then return null; end if;
  select c.buddy_id, b.name into bid, bname from companions c join members b on b.id = c.buddy_id where c.newcomer_id = me and c.status = 'active';
  return jsonb_build_object('day', day + 1, 'days_left', 90 - day, 'buddy_id', bid, 'buddy_name', bname, 'steps', first90_steps(me));
end $$;

-- 텐트장·운영진: 입회 90일 안의 새 회원과 걸음, 짝
create or replace function chapter_newcomers(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name, 'day', floor(extract(epoch from (now() - m.created_at)) / 86400)::int + 1,
      'buddy_id', c.buddy_id, 'buddy_name', b.name,
      'done', (select count(*) from jsonb_array_elements(first90_steps(m.id)) s where (s->>'done')::boolean), 'total', 7) order by m.created_at desc)
    from members m
    left join companions c on c.newcomer_id = m.id and c.status = 'active'
    left join members b on b.id = c.buddy_id
    where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active' and m.created_at > now() - interval '90 days'), '[]'::jsonb);
end $$;

-- 짝 지정(이미 있으면 바꿈)
create or replace function assign_companion(p_newcomer uuid, p_buddy uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ch uuid; nn text; bn text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select chapter_id, name into ch, nn from members where id = p_newcomer and role = 'mentor' and status = 'active';
  if ch is null then raise exception 'bad newcomer'; end if;
  if not (is_admin() or is_chapter_leader(ch)) then raise exception 'forbidden'; end if;
  select name into bn from members where id = p_buddy and chapter_id = ch and role = 'mentor' and status = 'active' and id <> p_newcomer;
  if bn is null then raise exception 'bad buddy'; end if;
  update companions set status = 'ended' where newcomer_id = p_newcomer and status = 'active';
  insert into companions (chapter_id, newcomer_id, buddy_id, assigned_by) values (ch, p_newcomer, p_buddy, me);
  perform notify(p_buddy, 'companion_buddy', jsonb_build_object('name', nn), '/connect');
  perform notify(p_newcomer, 'companion_newcomer', jsonb_build_object('name', bn), '/connect');
end $$;

-- 성장 점수: 동행 짝이 되면 섬김에 1건
create or replace function growth_scores(p_member uuid, p_asof timestamptz default now())
returns table (k text, actual numeric, target numeric, max_points numeric, points numeric)
language plpgsql stable security definer set search_path = wmto as $$
declare
  ch uuid; joined timestamptz; scale numeric; win_start timestamptz;
  att_total numeric; att_me numeric; refs numeric; o2o numeric; vis numeric; svc numeric; lrn numeric; gra numeric;
begin
  select chapter_id, created_at into ch, joined from members where id = p_member;
  if joined is null then return; end if;
  scale := greatest(0.3, least(1, (extract(epoch from (p_asof - joined)) / 86400.0) / 90.0));
  win_start := greatest(p_asof - interval '90 days', joined);

  select count(*) into att_total from events e where e.chapter_id = ch and e.start_at >= win_start and e.start_at < p_asof
     and not (exists (select 1 from absence_notices n where n.member_id = p_member and n.event_id = e.id)
              and not exists (select 1 from attendance a2 where a2.member_id = p_member and a2.event_id = e.id));
  select count(*) into att_me from attendance a join events e on e.id = a.event_id
   where a.member_id = p_member and e.chapter_id = ch and e.start_at >= win_start and e.start_at < p_asof;
  select count(*) into refs from referrals r where r.giver_id = p_member and r.created_at >= win_start and r.created_at < p_asof;
  select count(*) into o2o from one_to_ones o where o.status = 'confirmed' and (o.member_a = p_member or o.member_b = p_member) and o.held_at >= win_start and o.held_at < p_asof;
  select count(*) into vis from visitors v where v.invited_by = p_member and v.kind = 'guest' and v.status in ('attended', 'joined') and v.attended_at >= win_start and v.attended_at < p_asof;
  select count(*) into svc from mentoring_logs l where l.created_by = p_member and l.held_at >= win_start and l.held_at < p_asof;
  select count(*) into lrn from academy_completions c where c.member_id = p_member and c.completed_at >= win_start and c.completed_at < p_asof;
  lrn := lrn + coalesce((select sum(l.qty * case l.kind when 'scripture' then 1 when 'discipleship' then 2 when 'business' then 2 when 'book' then 2 else 1 end)
                          from learning_logs l where l.member_id = p_member and l.held_on >= win_start::date and l.held_on < p_asof::date + 1), 0);
  select count(*) into gra from gratitude x where x.from_member = p_member and x.created_at >= win_start and x.created_at < p_asof;
  svc := svc + (select count(*) * 2 from chapter_leaders where member_id = p_member)
            + (select count(*) from companions where buddy_id = p_member and started_at >= win_start and started_at < p_asof);

  k := 'attendance'; actual := case when att_total = 0 then 1 else att_me / att_total end; target := 0.9; max_points := 15;
  points := max_points * least(1, actual / target); return next;
  k := 'referrals'; actual := refs; target := 12 * scale; max_points := 20; points := max_points * least(1, actual / target); return next;
  k := 'one_to_one'; actual := o2o; target := 9 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'visitors'; actual := vis; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'learning'; actual := lrn; target := 4 * scale; max_points := 10; points := max_points * least(1, actual / target); return next;
  k := 'gratitude'; actual := gra; target := 2 * scale; max_points := 10; points := max_points * least(1, actual / target); return next;
  k := 'service'; actual := svc; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
end $$;

do $$
declare t text;
begin
  foreach t in array array['companions'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function my_first90() from public, anon;
revoke all on function chapter_newcomers(uuid) from public, anon;
revoke all on function assign_companion(uuid, uuid) from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
grant execute on function my_first90() to authenticated;
grant execute on function chapter_newcomers(uuid) to authenticated;
grant execute on function assign_companion(uuid, uuid) to authenticated;
revoke insert, update, delete on companions from anon, authenticated;
