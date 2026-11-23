-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 2단계: 손님(방문자) 초대 + 성장 지표 (docs/10)

-- ───────── 손님 초대 ─────────
create table if not exists visitors (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  invited_by uuid not null references members(id) on delete cascade,
  name text not null,
  contact text,
  category_id int references industry_categories(id),
  planned_at date,
  note text,
  status text not null default 'invited' check (status in ('invited', 'attended', 'joined', 'declined')),
  confirmed_by uuid references members(id),
  attended_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists visitors_chapter_idx on visitors (chapter_id, created_at desc);
create index if not exists visitors_inviter_idx on visitors (invited_by, created_at desc);
alter table visitors enable row level security;
drop policy if exists visitors_read on visitors;
create policy visitors_read on visitors for select using (invited_by = current_member_id() or is_chapter_leader(chapter_id));
drop policy if exists visitors_admin on visitors;
create policy visitors_admin on visitors for all using (is_admin()) with check (is_admin());

create or replace function invite_visitor(p_name text, p_contact text, p_category int, p_planned date, p_note text)
returns uuid language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ch uuid; new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select chapter_id into ch from members where id = me;
  if ch is null then raise exception 'no chapter'; end if;
  if coalesce(btrim(p_name), '') = '' then raise exception 'name required'; end if;
  insert into visitors (chapter_id, invited_by, name, contact, category_id, planned_at, note)
  values (ch, me, left(btrim(p_name), 100), nullif(left(btrim(coalesce(p_contact, '')), 200), ''), p_category, p_planned, nullif(left(btrim(coalesce(p_note, '')), 1000), ''))
  returning id into new_id;
  return new_id;
end $$;

-- 참석·입회 확인은 챕터 리더나 운영진만(점수 조작 방지). 초대한 사람은 취소(declined)만 가능.
create or replace function set_visitor_status(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = wmto as $$
declare v visitors; me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if p_status not in ('invited', 'attended', 'joined', 'declined') then raise exception 'bad status'; end if;
  select * into v from visitors where id = p_id for update;
  if not found then raise exception 'not found'; end if;
  if p_status in ('attended', 'joined') then
    if not is_chapter_leader(v.chapter_id) then raise exception 'forbidden'; end if;
    if v.invited_by = me and not is_admin() then raise exception 'cannot confirm own visitor'; end if;
    update visitors set status = p_status, confirmed_by = me, attended_at = coalesce(attended_at, now()) where id = p_id;
  else
    if v.invited_by <> me and not is_chapter_leader(v.chapter_id) then raise exception 'forbidden'; end if;
    update visitors set status = p_status where id = p_id;
  end if;
end $$;

-- ───────── 성장 지표 ─────────
-- 최근 90일을 매주 새로 계산. 항목 점수 = 만점 × min(1, 실제 ÷ 목표). 입회 90일 이내는 목표를 단계적으로 낮춤(새싹 기간).
-- 아직 데이터가 없는 항목(배움·감사 나눔)은 계산에서 빼고 100점으로 환산한다.
create or replace function growth_scores(p_member uuid, p_asof timestamptz default now())
returns table (k text, actual numeric, target numeric, max_points numeric, points numeric)
language plpgsql stable security definer set search_path = wmto as $$
declare
  ch uuid; joined timestamptz; scale numeric; win_start timestamptz;
  att_total numeric; att_me numeric; refs numeric; o2o numeric; vis numeric; svc numeric;
begin
  select chapter_id, created_at into ch, joined from members where id = p_member;
  if joined is null then return; end if;
  scale := greatest(0.3, least(1, (extract(epoch from (p_asof - joined)) / 86400.0) / 90.0));
  win_start := greatest(p_asof - interval '90 days', joined);

  select count(*) into att_total from events e where e.chapter_id = ch and e.start_at >= win_start and e.start_at < p_asof;
  select count(*) into att_me from attendance a join events e on e.id = a.event_id
   where a.member_id = p_member and e.chapter_id = ch and e.start_at >= win_start and e.start_at < p_asof;
  select count(*) into refs from referrals r where r.giver_id = p_member and r.created_at >= win_start and r.created_at < p_asof;
  select count(*) into o2o from one_to_ones o where o.status = 'confirmed' and (o.member_a = p_member or o.member_b = p_member) and o.held_at >= win_start and o.held_at < p_asof;
  select count(*) into vis from visitors v where v.invited_by = p_member and v.status in ('attended', 'joined') and v.attended_at >= win_start and v.attended_at < p_asof;
  select count(*) into svc from mentoring_logs l where l.created_by = p_member and l.held_at >= win_start and l.held_at < p_asof;
  svc := svc + (select count(*) * 2 from chapter_leaders where member_id = p_member);

  k := 'attendance'; actual := case when att_total = 0 then 1 else att_me / att_total end; target := 0.9; max_points := 15;
  points := max_points * least(1, actual / target); return next;
  k := 'referrals'; actual := refs; target := 12 * scale; max_points := 20; points := max_points * least(1, actual / target); return next;
  k := 'one_to_one'; actual := o2o; target := 9 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'visitors'; actual := vis; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'service'; actual := svc; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
end $$;

create or replace function growth_level(p_total numeric) returns text language sql immutable as $$
  select case when p_total >= 80 then 'lantern' when p_total >= 60 then 'canvas' when p_total >= 40 then 'pole' else 'peg' end;
$$;

-- 내 성장 지표: 지금 점수, 항목별 현황, 지난 12주 추이
create or replace function my_growth(p_weeks int default 12) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); items jsonb; total numeric; hist jsonb := '[]'::jsonb; i int; t numeric; avail numeric; sub_total numeric; avail2 numeric; joined timestamptz;
begin
  if me is null or current_member_role() <> 'mentor' then return null; end if;
  select created_at into joined from members where id = me;
  select jsonb_agg(jsonb_build_object('key', k, 'actual', round(actual, 2), 'target', round(target, 2), 'max', max_points, 'points', round(points, 1))), sum(points), sum(max_points)
    into items, sub_total, avail from growth_scores(me, now());
  total := case when avail > 0 then round(sub_total / avail * 100) else 0 end;
  for i in reverse greatest(1, least(p_weeks, 26)) - 1 .. 0 loop
    select sum(points), sum(max_points) into sub_total, avail2 from growth_scores(me, now() - make_interval(days => 7 * i));
    t := case when coalesce(avail2, 0) > 0 then round(sub_total / avail2 * 100) else 0 end;
    hist := hist || jsonb_build_object('weeks_ago', i, 'total', t);
  end loop;
  return jsonb_build_object('total', total, 'level', growth_level(total), 'items', coalesce(items, '[]'::jsonb), 'history', hist,
    'age_days', floor(extract(epoch from (now() - joined)) / 86400), 'grace', (now() - joined) < interval '90 days');
end $$;

-- 보기 모드에서는 쓰기 거부
do $$
declare t text;
begin
  foreach t in array array['visitors'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function invite_visitor(text, text, int, date, text) from public, anon;
revoke all on function set_visitor_status(uuid, text) from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
revoke all on function growth_level(numeric) from public, anon;
revoke all on function my_growth(int) from public, anon;
grant execute on function invite_visitor(text, text, int, date, text) to authenticated;
grant execute on function set_visitor_status(uuid, text) to authenticated;
grant execute on function growth_level(numeric) to authenticated;
grant execute on function my_growth(int) to authenticated;
revoke insert, update, delete on visitors from anon, authenticated;
