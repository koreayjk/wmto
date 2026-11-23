-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 13단계: 행사별 참가 조건(배움 단위, 신청 마감, 최소·정원) + 참가 신청 (docs/13)
-- 행사를 만들 때 "이 행사에 참석하면 배움 몇 단위", "언제까지 신청", "최소 몇 명이면 열림", "정원"을 정해 두면
-- 회원은 신청하고, 참석(출석 확인)하면 배움 점수에 자동으로 더해진다. 최소 인원 미달 취소는 사람이 판단한다(자동 취소 없음).
alter table events add column if not exists learning_units numeric not null default 0 check (learning_units between 0 and 20);
alter table events add column if not exists signup_deadline timestamptz;
alter table events add column if not exists min_people int check (min_people is null or min_people between 1 and 1000);
alter table events add column if not exists capacity int check (capacity is null or capacity between 1 and 1000);

create table if not exists event_signups (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);
create index if not exists event_signups_member_idx on event_signups (member_id);
alter table event_signups enable row level security;
drop policy if exists event_signups_self on event_signups;
create policy event_signups_self on event_signups for select using (member_id = current_member_id());
drop policy if exists event_signups_admin on event_signups;
create policy event_signups_admin on event_signups for all using (is_admin()) with check (is_admin());

create or replace function signup_event(p_event uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ev events; n int;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  select * into ev from events where id = p_event for update;
  if not found or ev.start_at <= now() then raise exception 'event not available'; end if;
  if ev.signup_deadline is not null and ev.signup_deadline < now() then raise exception 'signup closed'; end if;
  if ev.chapter_id is not null and ev.chapter_id is distinct from (select chapter_id from members where id = me) then raise exception 'not your tent event'; end if;
  if ev.capacity is not null then
    select count(*) into n from event_signups where event_id = p_event;
    if n >= ev.capacity and not exists (select 1 from event_signups where event_id = p_event and member_id = me) then raise exception 'full'; end if;
  end if;
  insert into event_signups (event_id, member_id) values (p_event, me) on conflict do nothing;
end $$;

create or replace function cancel_signup(p_event uuid) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  delete from event_signups where event_id = p_event and member_id = current_member_id();
end $$;

-- 신청 현황(보이는 행사만): 행사별 신청 인원과 내 신청 여부
create or replace function event_signup_summary() returns table (event_id uuid, signups int, mine boolean)
language sql stable security definer set search_path = wmto as $$
  select e.id, (select count(*)::int from event_signups s where s.event_id = e.id),
         exists (select 1 from event_signups s where s.event_id = e.id and s.member_id = current_member_id())
  from events e
  where current_member_id() is not null and e.start_at > now() - interval '1 day'
    and (e.chapter_id is null or e.chapter_id = (select chapter_id from members where id = current_member_id()));
$$;

-- 성장 점수: 참석한 행사의 배움 단위를 '배움'에 더함
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
  lrn := lrn + coalesce((select sum(e.learning_units) from attendance at join events e on e.id = at.event_id
                          where at.member_id = p_member and e.learning_units > 0 and e.start_at >= win_start and e.start_at < p_asof), 0);
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
  foreach t in array array['event_signups'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function signup_event(uuid) from public, anon;
revoke all on function cancel_signup(uuid) from public, anon;
revoke all on function event_signup_summary() from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
grant execute on function signup_event(uuid) to authenticated;
grant execute on function cancel_signup(uuid) to authenticated;
grant execute on function event_signup_summary() to authenticated;
revoke insert, update, delete on event_signups from anon, authenticated;
