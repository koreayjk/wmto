-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 10단계: 내부 분석 자료 반영 1차 (docs/13)
-- ① 소개 흐름(진행 상태 확장, 소개 온도, 미리 연결함, 성사 → 감사)  ② 손님 유형(손님·참관·대신 나옴)
-- ③ 학습 기록(종류 × 횟수)  ④ 프로필 질문(소개·키워드·신앙·사역)  ⑤ 내 활동 요약(기간별)
-- 용어·배점·표시는 모두 우리 것이다(원문 용어를 쓰지 않음).

-- ───────── ① 소개 ─────────
alter type referral_status add value if not exists 'won';       -- 성사
alter type referral_status add value if not exists 'no_deal';   -- 이번에는 성사되지 않음
alter table referrals add column if not exists warmth smallint not null default 2 check (warmth between 1 and 3);  -- 1 알아보는 중, 2 곧 필요, 3 바로 필요
alter table referrals add column if not exists pre_contacted boolean not null default false;                      -- 소개한 분이 미리 연락해 둠

create table if not exists gratitude (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null unique references referrals(id) on delete cascade,
  from_member uuid not null references members(id) on delete cascade,   -- 소개를 받아 성사된 사람
  to_member uuid not null references members(id) on delete cascade,     -- 소개해 준 사람
  message text not null check (length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists gratitude_from_idx on gratitude (from_member, created_at desc);
create index if not exists gratitude_to_idx on gratitude (to_member, created_at desc);
alter table gratitude enable row level security;
drop policy if exists gratitude_party_read on gratitude;
create policy gratitude_party_read on gratitude for select using (from_member = current_member_id() or to_member = current_member_id());
drop policy if exists gratitude_admin on gratitude;
create policy gratitude_admin on gratitude for all using (is_admin()) with check (is_admin());

create or replace function give_gratitude(p_referral uuid, p_message text) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); r referrals; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from referrals where id = p_referral;
  if not found or r.receiver_id <> me then raise exception 'forbidden'; end if;
  if r.status::text <> 'won' then raise exception 'not won yet'; end if;
  if coalesce(btrim(p_message), '') = '' then raise exception 'message required'; end if;
  insert into gratitude (referral_id, from_member, to_member, message) values (p_referral, me, r.giver_id, left(btrim(p_message), 2000));
  select name into nm from members where id = me;
  perform notify(r.giver_id, 'gratitude_received', jsonb_build_object('name', nm), '/connect/referrals');
end $$;

-- ───────── ② 손님 유형 ─────────
alter table visitors add column if not exists kind text not null default 'guest' check (kind in ('guest', 'observer', 'substitute'));
alter table visitors add column if not exists for_member uuid references members(id);   -- 대신 나온 경우, 대신하는 회원

drop function if exists invite_visitor(text, text, int, date, text);
create or replace function invite_visitor(p_name text, p_contact text, p_category int, p_planned date, p_note text, p_kind text default 'guest', p_for uuid default null)
returns uuid language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ch uuid; new_id uuid; k text := coalesce(p_kind, 'guest');
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  if k not in ('guest', 'observer', 'substitute') then raise exception 'bad kind'; end if;
  select chapter_id into ch from members where id = me;
  if ch is null then raise exception 'no chapter'; end if;
  if coalesce(btrim(p_name), '') = '' then raise exception 'name required'; end if;
  if k = 'substitute' and (p_for is null or p_for = me or not exists (select 1 from members where id = p_for and chapter_id = ch and status = 'active')) then raise exception 'bad substitute target'; end if;
  insert into visitors (chapter_id, invited_by, name, contact, category_id, planned_at, note, kind, for_member)
  values (ch, me, left(btrim(p_name), 100), nullif(left(btrim(coalesce(p_contact, '')), 200), ''), p_category, p_planned,
          nullif(left(btrim(coalesce(p_note, '')), 1000), ''), k, case when k = 'substitute' then p_for end)
  returning id into new_id;
  return new_id;
end $$;
revoke all on function invite_visitor(text, text, int, date, text, text, uuid) from public, anon;
grant execute on function invite_visitor(text, text, int, date, text, text, uuid) to authenticated;

-- ───────── ③ 학습 기록 ─────────
-- 종류별 단위: 말씀 묵상·성경 공부 1, 제자훈련 2, 비즈니스 강의·세미나 2, 책 읽기 2. 본인 기록이며 하루 최대 5회, 일주일 10건까지.
create table if not exists learning_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('scripture', 'discipleship', 'business', 'book', 'other')),
  qty int not null check (qty between 1 and 5),
  held_on date not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists learning_logs_idx on learning_logs (member_id, held_on desc);
alter table learning_logs enable row level security;
drop policy if exists learning_logs_self on learning_logs;
create policy learning_logs_self on learning_logs for select using (member_id = current_member_id());
drop policy if exists learning_logs_admin on learning_logs;
create policy learning_logs_admin on learning_logs for all using (is_admin()) with check (is_admin());

create or replace function log_learning(p_kind text, p_qty int, p_held_on date, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  if p_held_on is null or p_held_on > current_date or p_held_on < current_date - 90 then raise exception 'bad date'; end if;
  if (select count(*) from learning_logs where member_id = me and created_at > now() - interval '7 days') >= 10 then raise exception 'too many'; end if;
  insert into learning_logs (member_id, kind, qty, held_on, note) values (me, p_kind, p_qty, p_held_on, nullif(left(btrim(coalesce(p_note, '')), 300), ''));
end $$;

create or replace function delete_learning(p_id uuid) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  delete from learning_logs where id = p_id and member_id = current_member_id() and created_at > now() - interval '7 days';
end $$;

-- ───────── 성장 점수: 감사 항목 추가, 배움에 학습 기록 합산 ─────────
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

  select count(*) into att_total from events e where e.chapter_id = ch and e.start_at >= win_start and e.start_at < p_asof;
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
  svc := svc + (select count(*) * 2 from chapter_leaders where member_id = p_member);

  k := 'attendance'; actual := case when att_total = 0 then 1 else att_me / att_total end; target := 0.9; max_points := 15;
  points := max_points * least(1, actual / target); return next;
  k := 'referrals'; actual := refs; target := 12 * scale; max_points := 20; points := max_points * least(1, actual / target); return next;
  k := 'one_to_one'; actual := o2o; target := 9 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'visitors'; actual := vis; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'learning'; actual := lrn; target := 4 * scale; max_points := 10; points := max_points * least(1, actual / target); return next;
  k := 'gratitude'; actual := gra; target := 2 * scale; max_points := 10; points := max_points * least(1, actual / target); return next;
  k := 'service'; actual := svc; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
end $$;



-- ───────── ④ 프로필 질문 ─────────
alter table mentor_profiles add column if not exists intro text;              -- 하시는 일 소개
alter table mentor_profiles add column if not exists keywords text;           -- 찾기용 키워드(쉼표로 구분)
alter table mentor_profiles add column if not exists years_in_business int;
alter table mentor_profiles add column if not exists website text;
alter table mentor_profiles add column if not exists church text;             -- 섬기는 교회
alter table mentor_profiles add column if not exists faith_story text;        -- 신앙 한 줄 이야기
alter table mentor_profiles add column if not exists mission_heart text;      -- 선교·사역에 대한 마음
grant update (intro, keywords, years_in_business, website, church, faith_story, mission_heart) on mentor_profiles to authenticated;

-- ───────── ⑤ 내 활동 요약 (기간: 일수, 0이면 전체) ─────────
create or replace function my_activity(p_days int default 90) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); since timestamptz;
  rg int; rr int; rw int; o2o int; vis int; lrn numeric; gs int; gr int; att int;
begin
  if me is null or current_member_role() <> 'mentor' then return null; end if;
  since := case when coalesce(p_days, 0) <= 0 then '-infinity'::timestamptz else now() - make_interval(days => p_days) end;
  select count(*) into rg from referrals where giver_id = me and created_at >= since;
  select count(*) into rr from referrals where receiver_id = me and created_at >= since;
  select count(*) into rw from referrals where giver_id = me and status::text = 'won' and created_at >= since;
  select count(*) into o2o from one_to_ones where status = 'confirmed' and (member_a = me or member_b = me) and held_at >= since;
  select count(*) into vis from visitors where invited_by = me and kind = 'guest' and status in ('attended', 'joined') and attended_at >= since;
  select (select count(*) from academy_completions where member_id = me and completed_at >= since)
       + coalesce((select sum(qty * case kind when 'scripture' then 1 else 2 end) from learning_logs where member_id = me and held_on >= since::date), 0) into lrn;
  select count(*) into gs from gratitude where from_member = me and created_at >= since;
  select count(*) into gr from gratitude where to_member = me and created_at >= since;
  select count(*) into att from attendance where member_id = me and attended_at >= since;
  return jsonb_build_object('referrals_given', rg, 'referrals_received', rr, 'referrals_won', rw, 'one_to_one', o2o, 'visitors', vis,
    'learning', lrn, 'gratitude_sent', gs, 'gratitude_received', gr, 'attendance', att);
end $$;

-- ───────── 텐트 현황: 손님 집계는 '손님'만 ─────────
create or replace function chapter_dashboard(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare
  since timestamptz := now() - interval '90 days';
  weeks numeric := 90 / 7.0;
  n int; newm int; due int; ev int; att int; refs int; o2o int; vinv int; vatt int; vjoin int;
  open_cats jsonb; mem jsonb; lv jsonb; cname text;
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  select name into cname from chapters where id = p_chapter;
  if cname is null then raise exception 'not found'; end if;

  select count(*) into n from members where chapter_id = p_chapter and role = 'mentor' and status = 'active';
  select count(*) into newm from members where chapter_id = p_chapter and role = 'mentor' and status = 'active' and created_at >= now() - interval '180 days';
  select count(*) into due from members where chapter_id = p_chapter and role = 'mentor' and status = 'active' and term_end <= current_date + 60;
  select count(*) into ev from events where chapter_id = p_chapter and start_at >= since and start_at < now();
  select count(*) into att from attendance a join events e on e.id = a.event_id join members m on m.id = a.member_id
   where e.chapter_id = p_chapter and e.start_at >= since and e.start_at < now() and m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active';
  select count(*) into refs from referrals r join members m on m.id = r.giver_id
   where m.chapter_id = p_chapter and m.status = 'active' and r.created_at >= since;
  select count(*) into o2o from one_to_ones o join members m on m.id = o.member_a
   where m.chapter_id = p_chapter and o.status = 'confirmed' and o.held_at >= since;
  select count(*) filter (where created_at >= since), count(*) filter (where status in ('attended', 'joined') and attended_at >= since), count(*) filter (where status = 'joined' and attended_at >= since)
    into vinv, vatt, vjoin from visitors where chapter_id = p_chapter and kind = 'guest';

  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name_ko, 'group', g.name_ko) order by g.sort, c.sort, c.id), '[]'::jsonb) into open_cats
    from industry_categories c join industry_categories g on g.id = c.parent_id
   where c.active and not exists (
     select 1 from members m join mentor_profiles p on p.member_id = m.id
      where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active' and p.category_id = c.id);

  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'term_end', x.term_end, 'total', x.total, 'level', growth_level(x.total), 'weakest', x.weakest) order by x.total, x.name), '[]'::jsonb) into mem
    from (
      select m.id, m.name, m.term_end,
             coalesce(round((select sum(points) / nullif(sum(max_points), 0) * 100 from growth_scores(m.id))), 0) as total,
             (select k from growth_scores(m.id) order by points / max_points, k limit 1) as weakest
        from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active') x;

  select jsonb_build_object(
    'peg', count(*) filter (where (e->>'level') = 'peg'), 'pole', count(*) filter (where (e->>'level') = 'pole'),
    'canvas', count(*) filter (where (e->>'level') = 'canvas'), 'lantern', count(*) filter (where (e->>'level') = 'lantern'))
    into lv from jsonb_array_elements(mem) e;

  return jsonb_build_object(
    'chapter', cname, 'size', n, 'cap', tent_cap(), 'new_members_6m', newm, 'renewal_due', due,
    'meetings', ev, 'attendance_rate', case when ev > 0 and n > 0 then round(att::numeric / (ev * n), 3) else null end,
    'referrals_per_member_week', case when n > 0 then round(refs / n / weeks, 2) else null end,
    'one_to_one_per_member_week', case when n > 0 then round(o2o * 2 / n / weeks, 2) else null end,
    'visitors_invited', vinv, 'visitors_attended', vatt, 'visitors_joined', vjoin,
    'conversion', case when vatt > 0 then round(vjoin::numeric / vatt, 2) else null end,
    'levels', lv, 'members', mem, 'open_categories', open_cats);
end $$;


do $$
declare t text;
begin
  foreach t in array array['gratitude', 'learning_logs'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function give_gratitude(uuid, text) from public, anon;
revoke all on function log_learning(text, int, date, text) from public, anon;
revoke all on function delete_learning(uuid) from public, anon;
revoke all on function my_activity(int) from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
grant execute on function give_gratitude(uuid, text) to authenticated;
grant execute on function log_learning(text, int, date, text) to authenticated;
grant execute on function delete_learning(uuid) to authenticated;
grant execute on function my_activity(int) to authenticated;
revoke insert, update, delete on gratitude, learning_logs from anon, authenticated;
