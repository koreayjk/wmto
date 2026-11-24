-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 17단계: 메일로 알림 받기(선택 동의) — 하루 한 번 요약 메일
-- 기본은 "받지 않음". 회원이 직접 켠 경우에만, 그 뒤에 생긴 알림이 발송 대기열(email_outbox)에 쌓이고
-- 서버(/api/cron/mail)가 하루 한 번 회원별로 모아 한 통으로 보낸다. 발송은 서비스 키로만 처리한다.
create table if not exists notification_prefs (
  member_id uuid primary key references members(id) on delete cascade,
  email boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table notification_prefs enable row level security;
drop policy if exists notification_prefs_self on notification_prefs;
create policy notification_prefs_self on notification_prefs for select using (member_id = current_member_id());
drop policy if exists notification_prefs_admin on notification_prefs;
create policy notification_prefs_admin on notification_prefs for all using (is_admin()) with check (is_admin());

create table if not exists email_outbox (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null,
  params jsonb not null default '{}'::jsonb,
  href text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists email_outbox_pending_idx on email_outbox (created_at) where sent_at is null;
alter table email_outbox enable row level security;
drop policy if exists email_outbox_admin on email_outbox;
create policy email_outbox_admin on email_outbox for all using (is_admin()) with check (is_admin());

-- 알림을 만들 때, 메일 수신에 동의한 회원이면 대기열에도 넣는다.
create or replace function notify(p_member uuid, p_kind text, p_params jsonb, p_href text) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if p_member is null then return; end if;
  insert into notifications (member_id, kind, params, href) values (p_member, p_kind, coalesce(p_params, '{}'::jsonb), p_href);
  if exists (select 1 from notification_prefs where member_id = p_member and email) then
    insert into email_outbox (member_id, kind, params, href) values (p_member, p_kind, coalesce(p_params, '{}'::jsonb), p_href);
  end if;
end $$;
revoke all on function notify(uuid, text, jsonb, text) from public, anon, authenticated;

create or replace function set_email_pref(p_on boolean) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  insert into notification_prefs (member_id, email, updated_at) values (me, coalesce(p_on, false), now())
    on conflict (member_id) do update set email = excluded.email, updated_at = now();
  if not coalesce(p_on, false) then delete from email_outbox where member_id = me and sent_at is null; end if;
end $$;

create or replace function my_email_pref() returns boolean
language sql stable security definer set search_path = wmto as $$
  select coalesce((select email from notification_prefs where member_id = current_member_id()), false);
$$;

do $$
declare t text;
begin
  foreach t in array array['notification_prefs', 'email_outbox'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function set_email_pref(boolean) from public, anon;
revoke all on function my_email_pref() from public, anon;
grant execute on function set_email_pref(boolean) to authenticated;
grant execute on function my_email_pref() to authenticated;
revoke insert, update, delete on notification_prefs, email_outbox from anon, authenticated;
revoke select on email_outbox from anon, authenticated;
