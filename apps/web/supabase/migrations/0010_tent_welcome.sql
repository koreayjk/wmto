-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 선교사가 텐트에 들어오는 두 단계
--  1) 텐트에 모시기: 사업가 한 명이 "우리 텐트로 모시기" → 선교사가 그 텐트의 구성원이 됩니다(멘토가 되는 것은 아님).
--  2) 멘토로 함께하기: 텐트의 사업가 중 그 선교사의 멘토가 되고 싶은 사람이 직접 맡습니다.

-- 열린 요청 목록에 선교사가 속한 텐트를 함께 돌려줍니다.
drop function if exists open_matching_requests();
create function open_matching_requests() returns table (
  id uuid, partner_name text, mission_field text, contribution_type contribution_type,
  message text, created_at timestamptz, partner_chapter uuid
) language sql stable security definer set search_path = wmto as $$
  select r.id, p.name, pp.mission_field, r.contribution_type, r.message, r.created_at, p.chapter_id
  from matching_requests r
  join members p on p.id = r.partner_id
  left join partner_profiles pp on pp.member_id = r.partner_id
  where r.status = 'pending'
    and current_member_role() = 'mentor'
    and r.contribution_type = any (
      coalesce((select contribution_types from mentor_profiles where member_id = current_member_id()), '{}'))
  order by r.created_at;
$$;
revoke all on function open_matching_requests() from public, anon;
grant execute on function open_matching_requests() to authenticated;

-- 텐트에 모시기: 아직 텐트가 없는 선교사만, 내 텐트로.
create or replace function tent_welcome(p_request uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare
  me uuid := current_member_id();
  my_tent uuid;
  req matching_requests;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select chapter_id into my_tent from members where id = me;
  if my_tent is null then raise exception 'no tent'; end if;
  select * into req from matching_requests where id = p_request and status = 'pending';
  if not found then raise exception 'request not available'; end if;
  update members set chapter_id = my_tent, chapter = (select name from chapters where id = my_tent)
   where id = req.partner_id and role = 'partner' and chapter_id is null;
end $$;
revoke all on function tent_welcome(uuid) from public, anon;
grant execute on function tent_welcome(uuid) to authenticated;

-- 멘토로 함께하기: 텐트에 속한 선교사는 그 텐트의 사업가만 맡을 수 있습니다.
create or replace function accept_matching_request(p_request uuid) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare
  me uuid := current_member_id();
  my_tent uuid;
  req matching_requests;
  p_tent uuid;
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
  select chapter_id into my_tent from members where id = me;
  select chapter_id into p_tent from members where id = req.partner_id;
  if p_tent is not null and p_tent is distinct from my_tent then raise exception 'different tent'; end if;
  insert into matchings (mentor_id, partner_id, contribution_type)
    values (me, req.partner_id, req.contribution_type) returning id into new_id;
  update matching_requests set status = 'accepted', mentor_id = me, responded_at = now() where id = req.id;
  return new_id;
end $$;
