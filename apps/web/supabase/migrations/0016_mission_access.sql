-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 3단계: 선교 권한(mission access) — 신청 후 승인, 또는 텐트장·운영진 지정 (docs/09)
alter table members add column if not exists mission_status text not null default 'none'
  check (mission_status in ('none', 'requested', 'approved', 'revoked'));
alter table members add column if not exists mission_decided_by uuid references members(id);
alter table members add column if not exists mission_decided_at timestamptz;

-- 이미 쓰고 있던 사업가(멘토)는 기존 기능을 그대로 쓰도록 승인 상태로 시작
update members set mission_status = 'approved', mission_decided_at = now()
 where role = 'mentor' and mission_status = 'none';

create table if not exists mission_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  decided_by uuid references members(id),
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);
create unique index if not exists mission_requests_one_pending on mission_requests (member_id) where status = 'pending';
create index if not exists mission_requests_member_idx on mission_requests (member_id, created_at desc);
alter table mission_requests enable row level security;
drop policy if exists mission_requests_read on mission_requests;
create policy mission_requests_read on mission_requests for select using (member_id = current_member_id() or is_admin());
drop policy if exists mission_requests_admin on mission_requests;
create policy mission_requests_admin on mission_requests for all using (is_admin()) with check (is_admin());

-- 선교 기능을 써도 되는 사람인가: 사업가는 승인된 경우만, 선교사·후원자·관리자는 항상
create or replace function has_mission_access() returns boolean
language sql stable security definer set search_path = wmto as $$
  select is_admin() or coalesce((
    select case when m.role = 'mentor' then m.mission_status = 'approved' else true end
    from members m where m.id = current_member_id()
  ), false);
$$;

create or replace function request_mission(p_message text) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); st text; new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select mission_status into st from members where id = me;
  if st = 'approved' then raise exception 'already approved'; end if;
  if st = 'requested' then raise exception 'already requested'; end if;
  insert into mission_requests (member_id, message) values (me, nullif(left(btrim(coalesce(p_message, '')), 1000), '')) returning id into new_id;
  update members set mission_status = 'requested' where id = me;
  return new_id;
end $$;

create or replace function cancel_mission_request() returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  update mission_requests set status = 'cancelled', decided_at = now() where member_id = me and status = 'pending';
  update members set mission_status = 'none' where id = me and mission_status = 'requested';
end $$;

-- 승인·거절: 운영진 또는 그 사업가가 속한 텐트의 텐트장·부텐트장
create or replace function decide_mission_request(p_id uuid, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); r mission_requests; ch uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from mission_requests where id = p_id and status = 'pending' for update;
  if not found then raise exception 'not found'; end if;
  select chapter_id into ch from members where id = r.member_id;
  if not (is_admin() or (ch is not null and is_chapter_leader(ch))) then raise exception 'forbidden'; end if;
  if r.member_id = me and not is_admin() then raise exception 'cannot decide own request'; end if;
  update mission_requests set status = case when p_approve then 'approved' else 'declined' end, decided_by = me, decided_at = now(),
    decision_note = nullif(left(btrim(coalesce(p_note, '')), 500), '') where id = p_id;
  update members set mission_status = case when p_approve then 'approved' else 'none' end, mission_decided_by = me, mission_decided_at = now() where id = r.member_id;
end $$;

-- 승인 대기 목록: 운영진은 전체, 텐트장·부텐트장은 자기 텐트(회원 행 조회 권한이 없어도 볼 수 있게 함수로 제공)
create or replace function pending_mission_requests() returns table (
  id uuid, member_id uuid, name text, business_name text, industry text, chapter_name text, message text, created_at timestamptz)
language sql stable security definer set search_path = wmto as $$
  select r.id, r.member_id, m.name, mp.business_name, mp.industry, c.name, r.message, r.created_at
  from mission_requests r
  join members m on m.id = r.member_id
  left join mentor_profiles mp on mp.member_id = m.id
  left join chapters c on c.id = m.chapter_id
  where r.status = 'pending' and (is_admin() or (m.chapter_id is not null and is_chapter_leader(m.chapter_id)))
  order by r.created_at;
$$;

-- 지정·해제: 신청 없이 직접 열어 주거나 거둠(운영진, 또는 같은 텐트의 텐트장)
create or replace function designate_mission(p_member uuid, p_grant boolean) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); ch uuid; rl member_role;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select chapter_id, role into ch, rl from members where id = p_member;
  if rl is distinct from 'mentor' then raise exception 'only business members'; end if;
  if not (is_admin() or (ch is not null and is_chapter_leader(ch))) then raise exception 'forbidden'; end if;
  update mission_requests set status = case when p_grant then 'approved' else 'cancelled' end, decided_by = me, decided_at = now()
   where member_id = p_member and status = 'pending';
  update members set mission_status = case when p_grant then 'approved' else 'revoked' end, mission_decided_by = me, mission_decided_at = now() where id = p_member;
end $$;

-- DB 쪽에서도 막기: 멘토링 기록 작성과 매칭 요청 수락은 선교 권한이 있어야 함
drop policy if exists mentoring_logs_mentor_insert on mentoring_logs;
create policy mentoring_logs_mentor_insert on mentoring_logs for insert with check (
  created_by = current_member_id()
  and has_mission_access()
  and exists (select 1 from matchings m where m.id = matching_id
              and m.mentor_id = current_member_id() and m.status = 'active')
);

create or replace function accept_matching_request(p_request uuid) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare
  me uuid := current_member_id();
  req matching_requests;
  new_id uuid;
begin
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  if not has_mission_access() then raise exception 'mission access required'; end if;
  select * into req from matching_requests where id = p_request and status = 'pending' for update;
  if not found then raise exception 'request not available'; end if;
  if not (req.contribution_type = any (
        coalesce((select contribution_types from mentor_profiles where member_id = me), '{}'))) then
    raise exception 'contribution type mismatch';
  end if;
  insert into matchings (mentor_id, partner_id, contribution_type)
    values (me, req.partner_id, req.contribution_type) returning id into new_id;
  update matching_requests set status = 'accepted', mentor_id = me, responded_at = now() where id = req.id;
  return new_id;
end $$;

-- 보기 모드 쓰기 차단
do $$
declare t text;
begin
  foreach t in array array['mission_requests'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function has_mission_access() from public, anon;
revoke all on function request_mission(text) from public, anon;
revoke all on function cancel_mission_request() from public, anon;
revoke all on function decide_mission_request(uuid, boolean, text) from public, anon;
revoke all on function pending_mission_requests() from public, anon;
revoke all on function designate_mission(uuid, boolean) from public, anon;
revoke all on function accept_matching_request(uuid) from public, anon;
grant execute on function has_mission_access() to authenticated;
grant execute on function request_mission(text) to authenticated;
grant execute on function cancel_mission_request() to authenticated;
grant execute on function decide_mission_request(uuid, boolean, text) to authenticated;
grant execute on function pending_mission_requests() to authenticated;
grant execute on function designate_mission(uuid, boolean) to authenticated;
grant execute on function accept_matching_request(uuid) to authenticated;
revoke insert, update, delete on mission_requests from anon, authenticated;
