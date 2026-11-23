-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 5단계: 아카데미 이수 기록 + 성장 지표 '배움' 항목 (docs/10)
-- 이수는 본인이 "다 봤어요"를 누르는 방식(영상 시청 여부를 시스템이 확인할 수는 없음). 같은 영상은 한 번만, 90일 창에서 3개를 목표로 계산.
create table if not exists academy_completions (
  member_id uuid not null references members(id) on delete cascade,
  video_id uuid not null references academy_videos(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (member_id, video_id)
);
create index if not exists academy_completions_idx on academy_completions (member_id, completed_at desc);
alter table academy_completions enable row level security;
drop policy if exists academy_completions_self on academy_completions;
create policy academy_completions_self on academy_completions for select using (member_id = current_member_id());
drop policy if exists academy_completions_admin on academy_completions;
create policy academy_completions_admin on academy_completions for all using (is_admin()) with check (is_admin());

create or replace function complete_academy(p_video uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  if not exists (select 1 from academy_videos v where v.id = p_video and current_member_role() = any (v.for_roles)) then raise exception 'not found'; end if;
  insert into academy_completions (member_id, video_id) values (me, p_video) on conflict do nothing;
end $$;

create or replace function uncomplete_academy(p_video uuid) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  delete from academy_completions where member_id = current_member_id() and video_id = p_video;
end $$;

-- 성장 점수: 배움(아카데미 이수) 항목 추가
create or replace function growth_scores(p_member uuid, p_asof timestamptz default now())
returns table (k text, actual numeric, target numeric, max_points numeric, points numeric)
language plpgsql stable security definer set search_path = wmto as $$
declare
  ch uuid; joined timestamptz; scale numeric; win_start timestamptz;
  att_total numeric; att_me numeric; refs numeric; o2o numeric; vis numeric; svc numeric; lrn numeric;
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
  select count(*) into lrn from academy_completions c where c.member_id = p_member and c.completed_at >= win_start and c.completed_at < p_asof;
  svc := svc + (select count(*) * 2 from chapter_leaders where member_id = p_member);

  k := 'attendance'; actual := case when att_total = 0 then 1 else att_me / att_total end; target := 0.9; max_points := 15;
  points := max_points * least(1, actual / target); return next;
  k := 'referrals'; actual := refs; target := 12 * scale; max_points := 20; points := max_points * least(1, actual / target); return next;
  k := 'one_to_one'; actual := o2o; target := 9 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'visitors'; actual := vis; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
  k := 'learning'; actual := lrn; target := 3 * scale; max_points := 10; points := max_points * least(1, actual / target); return next;
  k := 'service'; actual := svc; target := 2 * scale; max_points := 15; points := max_points * least(1, actual / target); return next;
end $$;


do $$
declare t text;
begin
  foreach t in array array['academy_completions'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function complete_academy(uuid) from public, anon;
revoke all on function uncomplete_academy(uuid) from public, anon;
revoke all on function growth_scores(uuid, timestamptz) from public, anon, authenticated;
grant execute on function complete_academy(uuid) to authenticated;
grant execute on function uncomplete_academy(uuid) to authenticated;
revoke insert, update, delete on academy_completions from anon, authenticated;
