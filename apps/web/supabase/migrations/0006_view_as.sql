-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
-- 설정 후 Dashboard > Project Settings > API > Exposed schemas 에 wmto 를 추가해야 앱이 접근합니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 관리자의 "회원 화면 보기" (읽기 전용 미리보기).
-- 앱이 요청에 x-wmto-view-as: <회원 id> 헤더를 붙이면, 관리자 본인에게만 그 회원의 시점으로 데이터가 보입니다.
--  · 헤더가 있으면 관리자 권한(is_admin)은 꺼지고, 그 회원에게 허용된 행만 조회됩니다.
--  · 관리자가 아닌 사람이 헤더를 붙여도 무시됩니다.
--  · 쓰기는 앱이 막습니다(보기 전용).

create or replace function request_view_as() returns uuid
language plpgsql stable set search_path = wmto as $$
declare v text;
begin
  v := nullif(current_setting('request.headers', true), '')::json ->> 'x-wmto-view-as';
  if v ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return v::uuid; end if;
  return null;
exception when others then
  return null;
end $$;

-- 관리자 계정인지 (보기 모드와 무관)
create or replace function is_admin_user() returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- 정책에서 쓰는 관리자 확인: 보기 모드에서는 관리자 권한을 쓰지 않습니다.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from admins where user_id = auth.uid()) and request_view_as() is null;
$$;

create or replace function current_member_id() returns uuid
language sql stable security definer set search_path = wmto as $$
  select coalesce(
    case when exists (select 1 from admins where user_id = auth.uid()) then request_view_as() end,
    (select id from members where auth_user_id = auth.uid() and status = 'active' limit 1)
  );
$$;

create or replace function current_member_role() returns member_role
language sql stable security definer set search_path = wmto as $$
  select role from members where id = current_member_id() and status = 'active';
$$;

-- 보기 모드에서 그 회원 본인 행을 읽을 수 있게
drop policy if exists members_self on members;
create policy members_self on members for select using (
  auth_user_id = auth.uid()
  or (id = request_view_as() and exists (select 1 from admins where user_id = auth.uid()))
);

revoke all on function request_view_as() from public, anon;
revoke all on function is_admin_user() from public, anon;
grant execute on function request_view_as() to anon, authenticated;
grant execute on function is_admin_user() to authenticated;
