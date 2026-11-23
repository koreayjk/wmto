-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 7단계: 앱 안 알림. 쌓여 있는 "대기 항목"(1:1 확인, 선교 권한 신청, 손님 확인, 갱신 심사)을 해당 사람에게 이어 준다.
-- 메일·푸시는 보내지 않는다(앱 안에서만). 문구는 앱이 언어에 맞게 만들고, 여기에는 종류(kind)와 값(params)만 저장한다.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null,
  params jsonb not null default '{}'::jsonb,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_member_idx on notifications (member_id, created_at desc);
create index if not exists notifications_unread_idx on notifications (member_id) where read_at is null;
alter table notifications enable row level security;
drop policy if exists notifications_self on notifications;
create policy notifications_self on notifications for select using (member_id = current_member_id());
drop policy if exists notifications_admin on notifications;
create policy notifications_admin on notifications for all using (is_admin()) with check (is_admin());

create or replace function notify(p_member uuid, p_kind text, p_params jsonb, p_href text) returns void
language sql security definer set search_path = wmto as $$
  insert into notifications (member_id, kind, params, href)
  select p_member, p_kind, coalesce(p_params, '{}'::jsonb), p_href where p_member is not null;
$$;
revoke all on function notify(uuid, text, jsonb, text) from public, anon, authenticated;

create or replace function notify_leaders(p_chapter uuid, p_except uuid, p_kind text, p_params jsonb, p_href text) returns void
language sql security definer set search_path = wmto as $$
  select notify(l.member_id, p_kind, p_params, p_href) from chapter_leaders l
   where l.chapter_id = p_chapter and l.member_id is distinct from p_except;
$$;
revoke all on function notify_leaders(uuid, uuid, text, jsonb, text) from public, anon, authenticated;

-- 1:1 만남
create or replace function trg_notify_o2o() returns trigger
language plpgsql security definer set search_path = wmto as $$
declare a text; b text;
begin
  if tg_op = 'INSERT' then
    select name into a from members where id = new.member_a;
    perform notify(new.member_b, 'o2o_request', jsonb_build_object('name', a), '/connect/one-to-one');
  elsif new.status is distinct from old.status and new.status in ('confirmed', 'declined') then
    select name into b from members where id = new.member_b;
    perform notify(new.member_a, 'o2o_' || new.status, jsonb_build_object('name', b), '/connect/one-to-one');
  end if;
  return new;
end $$;
drop trigger if exists notify_o2o on one_to_ones;
create trigger notify_o2o after insert or update of status on one_to_ones for each row execute function trg_notify_o2o();

-- 선교 권한
create or replace function trg_notify_mission() returns trigger
language plpgsql security definer set search_path = wmto as $$
declare nm text; ch uuid;
begin
  if tg_op = 'INSERT' then
    select name, chapter_id into nm, ch from members where id = new.member_id;
    if ch is not null then perform notify_leaders(ch, new.member_id, 'mission_request', jsonb_build_object('name', nm), '/connect/mission'); end if;
  elsif new.status is distinct from old.status and new.status in ('approved', 'declined') then
    perform notify(new.member_id, 'mission_' || new.status, '{}'::jsonb, '/connect/mission');
  end if;
  return new;
end $$;
drop trigger if exists notify_mission on mission_requests;
create trigger notify_mission after insert or update of status on mission_requests for each row execute function trg_notify_mission();

-- 손님 초대
create or replace function trg_notify_visitor() returns trigger
language plpgsql security definer set search_path = wmto as $$
declare inviter text;
begin
  if tg_op = 'INSERT' then
    select name into inviter from members where id = new.invited_by;
    perform notify_leaders(new.chapter_id, new.invited_by, 'visitor_invited', jsonb_build_object('name', new.name, 'by', inviter), '/connect/visitors');
  elsif new.status is distinct from old.status and new.status in ('attended', 'joined') then
    perform notify(new.invited_by, 'visitor_' || new.status, jsonb_build_object('name', new.name), '/connect/visitors');
  end if;
  return new;
end $$;
drop trigger if exists notify_visitor on visitors;
create trigger notify_visitor after insert or update of status on visitors for each row execute function trg_notify_visitor();

-- 갱신 심사
create or replace function trg_notify_renewal() returns trigger
language plpgsql security definer set search_path = wmto as $$
declare nm text; ch uuid;
begin
  select name, chapter_id into nm, ch from members where id = new.member_id;
  if tg_op = 'INSERT' then
    perform notify(new.member_id, 'renewal_open', jsonb_build_object('term_end', new.term_end), '/connect/growth');
    if ch is not null then perform notify_leaders(ch, new.member_id, 'renewal_review', jsonb_build_object('name', nm), '/connect/renewal'); end if;
  elsif new.status is distinct from old.status and new.status in ('renewed', 'on_hold', 'not_renewed', 'planned') then
    perform notify(new.member_id, 'renewal_' || new.status, '{}'::jsonb, '/connect/growth');
  end if;
  return new;
end $$;
drop trigger if exists notify_renewal on renewal_reviews;
create trigger notify_renewal after insert or update of status on renewal_reviews for each row execute function trg_notify_renewal();

-- 읽음 처리(본인 것만). p_ids 가 비어 있으면 모두 읽음
create or replace function mark_notifications_read(p_ids uuid[] default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then return; end if;
  if me is null then return; end if;
  update notifications set read_at = now() where member_id = me and read_at is null and (p_ids is null or id = any (p_ids));
end $$;
revoke all on function mark_notifications_read(uuid[]) from public, anon;
grant execute on function mark_notifications_read(uuid[]) to authenticated;

do $$
declare t text;
begin
  foreach t in array array['notifications'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;
revoke insert, update, delete on notifications from anon, authenticated;
