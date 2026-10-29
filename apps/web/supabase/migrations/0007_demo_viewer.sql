-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
-- 설정 후 Dashboard > Project Settings > API > Exposed schemas 에 wmto 를 추가해야 앱이 접근합니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 공개 데모 계정: 누구나 "데모 체험"으로 들어와 사업가 / 선교사 / 후원자 화면을 번갈아 볼 수 있습니다.
--  · 데모 계정(demo_viewers)은 가상 데이터(이메일이 @demo.wmto.invalid 인 회원)의 시점으로만 볼 수 있습니다.
--  · 실제 회원의 데이터는 볼 수 없고, 어떤 데이터도 쓰거나 바꿀 수 없습니다(읽기 전용).

create table demo_viewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table demo_viewers enable row level security;
create policy demo_viewers_self on demo_viewers for select using (user_id = auth.uid());

create or replace function is_demo_viewer() returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from demo_viewers where user_id = auth.uid());
$$;

-- 보기 모드(관리자 또는 데모 계정)에서 볼 "그 회원"의 id.
-- 관리자는 모든 회원, 데모 계정은 데모 회원(@demo.wmto.invalid)만 가능합니다.
create or replace function current_member_id() returns uuid
language sql stable security definer set search_path = wmto as $$
  select coalesce(
    case when exists (select 1 from admins where user_id = auth.uid()) then request_view_as() end,
    case when exists (select 1 from demo_viewers where user_id = auth.uid())
         then (select id from members where id = request_view_as() and email like '%@demo.wmto.invalid' and status = 'active') end,
    (select id from members where auth_user_id = auth.uid() and status = 'active' limit 1)
  );
$$;

drop policy if exists members_self on members;
create policy members_self on members for select using (
  auth_user_id = auth.uid()
  or (id = request_view_as() and exists (select 1 from admins where user_id = auth.uid()))
  or (id = request_view_as() and email like '%@demo.wmto.invalid' and exists (select 1 from demo_viewers where user_id = auth.uid()))
);

-- 보기 모드(요청에 x-wmto-view-as 헤더가 있을 때)에서는 모든 표의 쓰기를 막습니다.
-- 허용형 정책에 AND 로 겹쳐지는 "제한형" 정책이라, 다른 정책이 허용해도 쓸 수 없습니다.
do $$
declare t text;
begin
  foreach t in array array['admins','members','mentor_profiles','partner_profiles','sponsor_profiles','applications','events','stories','chapters',
                           'attendance','matchings','mentoring_logs','self_reports','matching_requests','referrals','thanks_letters','stage_history',
                           'academy_videos','donations','fund_loans','demo_viewers'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

-- 쓰기 RPC 도 보기 모드에서는 거부
create or replace function accept_matching_request(p_request uuid) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare
  me uuid := current_member_id();
  req matching_requests;
  new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
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

revoke all on function is_demo_viewer() from public, anon;
grant execute on function is_demo_viewer() to authenticated;
