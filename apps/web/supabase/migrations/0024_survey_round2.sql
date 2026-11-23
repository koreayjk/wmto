-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 11단계: 내부 분석 2차 반영 (docs/13)
-- ① 미리 알린 결석(사정 결석) — 점수·돌봄 목록에서 불이익 없이 제외  ② 주별 활동 기록표
-- ③ 업종 변경은 신청 후 승인  ④ 내 데이터 내려받기·탈퇴 요청  ⑤ 같은 손님 중복 초대 방지

-- ───────── ① 미리 알린 결석 ─────────
create table if not exists absence_notices (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  reason text not null check (reason in ('schedule', 'health', 'travel', 'family', 'other')),
  note text,
  created_at timestamptz not null default now(),
  unique (member_id, event_id)
);
alter table absence_notices enable row level security;
drop policy if exists absence_notices_self on absence_notices;
create policy absence_notices_self on absence_notices for select using (member_id = current_member_id());
drop policy if exists absence_notices_admin on absence_notices;
create policy absence_notices_admin on absence_notices for all using (is_admin()) with check (is_admin());

create or replace function notify_absence(p_event uuid, p_reason text, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ev events; ch uuid; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  select * into ev from events where id = p_event;
  if not found or ev.start_at <= now() then raise exception 'event not available'; end if;
  select chapter_id, name into ch, nm from members where id = me;
  if ev.chapter_id is distinct from ch then raise exception 'not your tent event'; end if;
  insert into absence_notices (member_id, event_id, reason, note) values (me, p_event, p_reason, nullif(left(btrim(coalesce(p_note, '')), 300), ''))
    on conflict (member_id, event_id) do update set reason = excluded.reason, note = excluded.note;
  perform notify_leaders(ch, me, 'absence_notice', jsonb_build_object('name', nm, 'title', ev.title), '/connect/dashboard');
end $$;

create or replace function cancel_absence(p_event uuid) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  delete from absence_notices where member_id = current_member_id() and event_id = p_event;
end $$;

-- 점수: 미리 알린 결석은 출석률 계산에서 제외 / 돌봄 목록: 결석 횟수에서 제외
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

create or replace function chapter_watchlist(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare absent jsonb; early jsonb; stalled int;
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'missed', x.missed) order by x.missed desc, x.name), '[]'::jsonb) into absent
  from (
    select m.id, m.name,
      (select count(*) from events e where e.chapter_id = p_chapter and e.start_at >= greatest(m.created_at, now() - interval '180 days') and e.start_at < now()
          and not exists (select 1 from absence_notices n where n.member_id = m.id and n.event_id = e.id))
      - (select count(*) from attendance a join events e on e.id = a.event_id where a.member_id = m.id and e.chapter_id = p_chapter and e.start_at >= greatest(m.created_at, now() - interval '180 days') and e.start_at < now()) as missed
    from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active') x
  where x.missed >= 3;

  select count(*) into stalled from referrals r join members m on m.id = r.giver_id
   where m.chapter_id = p_chapter and r.status = 'sent' and r.created_at < now() - interval '14 days';

  select coalesce(jsonb_agg(jsonb_build_object('id', y.id, 'name', y.name, 'term_end', y.term_end, 'total', y.total, 'level', growth_level(y.total)) order by y.total, y.name), '[]'::jsonb) into early
  from (
    select m.id, m.name, m.term_end,
      coalesce(round((select sum(points) / nullif(sum(max_points), 0) * 100 from growth_scores(m.id))), 0) as total
    from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active'
      and m.term_end > current_date + 60 and m.term_end <= current_date + 180) y
  where growth_level(y.total) in ('peg', 'pole');

  return jsonb_build_object('absence', absent, 'stalled_referrals', stalled, 'early', early);
end $$;


-- ───────── ② 주별 활동 기록표 (월요일 시작, 최근 N주) ─────────
create or replace function my_weekly_records(p_weeks int default 26) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); n int := greatest(1, least(coalesce(p_weeks, 26), 52)); out jsonb;
begin
  if me is null then return null; end if;
  select coalesce(jsonb_agg(row order by wk desc), '[]'::jsonb) into out from (
    select w.wk,
      jsonb_build_object('week', to_char(w.wk, 'YYYY-MM-DD'),
        'attendance', (select count(*) from attendance a where a.member_id = me and date_trunc('week', a.attended_at) = w.wk),
        'referrals_given', (select count(*) from referrals r where r.giver_id = me and date_trunc('week', r.created_at) = w.wk),
        'referrals_received', (select count(*) from referrals r where r.receiver_id = me and date_trunc('week', r.created_at) = w.wk),
        'visitors', (select count(*) from visitors v where v.invited_by = me and v.kind = 'guest' and v.status in ('attended', 'joined') and date_trunc('week', v.attended_at) = w.wk),
        'one_to_one', (select count(*) from one_to_ones o where o.status = 'confirmed' and (o.member_a = me or o.member_b = me) and date_trunc('week', o.held_at) = w.wk),
        'learning', coalesce((select sum(l.qty * case l.kind when 'scripture' then 1 else 2 end) from learning_logs l where l.member_id = me and date_trunc('week', l.held_on::timestamptz) = w.wk), 0)
                    + (select count(*) from academy_completions c where c.member_id = me and date_trunc('week', c.completed_at) = w.wk),
        'gratitude', (select count(*) from gratitude x where x.from_member = me and date_trunc('week', x.created_at) = w.wk)) as row
    from (select date_trunc('week', now()) - make_interval(weeks => i) as wk from generate_series(0, n - 1) i) w) q;
  return out;
end $$;

-- ───────── ③ 업종 변경: 신청 후 승인 ─────────
create table if not exists category_change_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  from_category int references industry_categories(id),
  to_category int not null references industry_categories(id),
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  decided_by uuid references members(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists category_change_one_pending on category_change_requests (member_id) where status = 'pending';
alter table category_change_requests enable row level security;
drop policy if exists category_change_self on category_change_requests;
create policy category_change_self on category_change_requests for select using (member_id = current_member_id());
drop policy if exists category_change_admin on category_change_requests;
create policy category_change_admin on category_change_requests for all using (is_admin()) with check (is_admin());

-- 업종은 이제 직접 바꿀 수 없고(처음 정할 때만 가능), 변경은 신청 후 텐트장·운영진이 승인한다.
revoke update (category_id) on mentor_profiles from authenticated;

create or replace function set_first_category(p_category int) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  if exists (select 1 from mentor_profiles where member_id = me and category_id is not null) then raise exception 'already set'; end if;
  select name_ko into nm from industry_categories where id = p_category and active;
  if nm is null then raise exception 'bad category'; end if;
  update mentor_profiles set category_id = p_category, industry = nm where member_id = me;   -- 같은 텐트에 이미 있으면 트리거가 거부
end $$;

create or replace function request_category_change(p_category int, p_note text default null) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); cur int; ch uuid; nm text; new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select category_id into cur from mentor_profiles where member_id = me;
  if cur is null then raise exception 'use first category'; end if;
  if cur = p_category then raise exception 'same category'; end if;
  if not exists (select 1 from industry_categories where id = p_category and active) then raise exception 'bad category'; end if;
  insert into category_change_requests (member_id, from_category, to_category, note) values (me, cur, p_category, nullif(left(btrim(coalesce(p_note, '')), 500), '')) returning id into new_id;
  select chapter_id, name into ch, nm from members where id = me;
  if ch is not null then perform notify_leaders(ch, me, 'category_request', jsonb_build_object('name', nm), '/connect/dashboard'); end if;
  return new_id;
end $$;

create or replace function pending_category_changes() returns table (
  id uuid, member_id uuid, name text, chapter_name text, from_name text, to_name text, note text, created_at timestamptz)
language sql stable security definer set search_path = wmto as $$
  select r.id, r.member_id, m.name, c.name, f.name_ko, t.name_ko, r.note, r.created_at
  from category_change_requests r
  join members m on m.id = r.member_id
  left join chapters c on c.id = m.chapter_id
  left join industry_categories f on f.id = r.from_category
  join industry_categories t on t.id = r.to_category
  where r.status = 'pending' and (is_admin() or (m.chapter_id is not null and is_chapter_leader(m.chapter_id)))
  order by r.created_at;
$$;

create or replace function decide_category_change(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); r category_change_requests; ch uuid; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from category_change_requests where id = p_id and status = 'pending' for update;
  if not found then raise exception 'not found'; end if;
  select chapter_id into ch from members where id = r.member_id;
  if not (is_admin() or (ch is not null and is_chapter_leader(ch))) then raise exception 'forbidden'; end if;
  if r.member_id = me and not is_admin() then raise exception 'cannot decide own request'; end if;
  if p_approve then
    select name_ko into nm from industry_categories where id = r.to_category;
    update mentor_profiles set category_id = r.to_category, industry = nm where member_id = r.member_id;   -- 같은 텐트에 이미 있으면 category_taken 으로 거부
  end if;
  update category_change_requests set status = case when p_approve then 'approved' else 'declined' end, decided_by = me, decided_at = now() where id = p_id;
  perform notify(r.member_id, case when p_approve then 'category_approved' else 'category_declined' end, '{}'::jsonb, '/connect/profile');
end $$;

-- ───────── ④ 개인정보: 내 데이터 내려받기, 탈퇴 요청 ─────────
create or replace function export_my_data() returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if me is null then return null; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'member', (select to_jsonb(m) - 'auth_user_id' from members m where m.id = me),
    'profile', coalesce((select to_jsonb(p) from mentor_profiles p where p.member_id = me),
                        (select to_jsonb(p) from partner_profiles p where p.member_id = me),
                        (select to_jsonb(p) from sponsor_profiles p where p.member_id = me)),
    'referrals_given', coalesce((select jsonb_agg(to_jsonb(r)) from referrals r where r.giver_id = me), '[]'::jsonb),
    'referrals_received', coalesce((select jsonb_agg(to_jsonb(r)) from referrals r where r.receiver_id = me), '[]'::jsonb),
    'gratitude', coalesce((select jsonb_agg(to_jsonb(g)) from gratitude g where g.from_member = me or g.to_member = me), '[]'::jsonb),
    'one_to_ones', coalesce((select jsonb_agg(to_jsonb(o) - 'proof_path') from one_to_ones o where o.member_a = me or o.member_b = me), '[]'::jsonb),
    'visitors_invited', coalesce((select jsonb_agg(to_jsonb(v)) from visitors v where v.invited_by = me), '[]'::jsonb),
    'learning_logs', coalesce((select jsonb_agg(to_jsonb(l)) from learning_logs l where l.member_id = me), '[]'::jsonb),
    'academy_completions', coalesce((select jsonb_agg(to_jsonb(c)) from academy_completions c where c.member_id = me), '[]'::jsonb),
    'attendance', coalesce((select jsonb_agg(to_jsonb(a)) from attendance a where a.member_id = me), '[]'::jsonb),
    'absence_notices', coalesce((select jsonb_agg(to_jsonb(a)) from absence_notices a where a.member_id = me), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(to_jsonb(n)) from notifications n where n.member_id = me), '[]'::jsonb));
end $$;

create table if not exists deletion_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  reason text,
  status text not null default 'requested' check (status in ('requested', 'processed', 'cancelled')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create unique index if not exists deletion_one_open on deletion_requests (member_id) where status = 'requested';
alter table deletion_requests enable row level security;
drop policy if exists deletion_self on deletion_requests;
create policy deletion_self on deletion_requests for select using (member_id = current_member_id());
drop policy if exists deletion_admin on deletion_requests;
create policy deletion_admin on deletion_requests for all using (is_admin()) with check (is_admin());

create or replace function request_deletion(p_reason text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  insert into deletion_requests (member_id, reason) values (me, nullif(left(btrim(coalesce(p_reason, '')), 500), '')) on conflict do nothing;
end $$;

create or replace function cancel_deletion() returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  update deletion_requests set status = 'cancelled', processed_at = now() where member_id = current_member_id() and status = 'requested';
end $$;

-- ───────── ⑤ 같은 손님 중복 초대 방지(같은 텐트, 최근 60일, 연락처가 같으면) ─────────
create or replace function trg_visitor_duplicate() returns trigger
language plpgsql security definer set search_path = wmto as $$
begin
  if new.contact is not null and exists (
    select 1 from visitors v where v.chapter_id = new.chapter_id and lower(btrim(v.contact)) = lower(btrim(new.contact))
      and v.status in ('invited', 'attended', 'joined') and v.created_at > now() - interval '60 days') then
    raise exception 'duplicate_visitor: 이미 초대된 손님입니다' using errcode = 'unique_violation';
  end if;
  return new;
end $$;
drop trigger if exists visitors_duplicate on visitors;
create trigger visitors_duplicate before insert on visitors for each row execute function trg_visitor_duplicate();

do $$
declare t text;
begin
  foreach t in array array['absence_notices', 'category_change_requests', 'deletion_requests'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function notify_absence(uuid, text, text) from public, anon;
revoke all on function cancel_absence(uuid) from public, anon;
revoke all on function my_weekly_records(int) from public, anon;
revoke all on function set_first_category(int) from public, anon;
revoke all on function request_category_change(int, text) from public, anon;
revoke all on function pending_category_changes() from public, anon;
revoke all on function decide_category_change(uuid, boolean) from public, anon;
revoke all on function export_my_data() from public, anon;
revoke all on function request_deletion(text) from public, anon;
revoke all on function cancel_deletion() from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
revoke all on function chapter_watchlist(uuid) from public, anon;
grant execute on function notify_absence(uuid, text, text) to authenticated;
grant execute on function cancel_absence(uuid) to authenticated;
grant execute on function my_weekly_records(int) to authenticated;
grant execute on function set_first_category(int) to authenticated;
grant execute on function request_category_change(int, text) to authenticated;
grant execute on function pending_category_changes() to authenticated;
grant execute on function decide_category_change(uuid, boolean) to authenticated;
grant execute on function export_my_data() to authenticated;
grant execute on function request_deletion(text) to authenticated;
grant execute on function cancel_deletion() to authenticated;
grant execute on function chapter_watchlist(uuid) to authenticated;
revoke insert, update, delete on absence_notices, category_change_requests, deletion_requests from anon, authenticated;
