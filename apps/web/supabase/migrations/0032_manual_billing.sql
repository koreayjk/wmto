-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 18단계: 회비 청구·입금 확인(수동). 결제 대행사(PG)가 정해지기 전에도 쓸 수 있는 계좌이체 방식.
-- 운영진이 회비 금액·입금 계좌를 설정하고, 회원에게 청구서를 발행하면 회원은 앱에서 입금 안내를 보고,
-- 설정 표는 운영진만 읽고(회원은 my_billing 으로 미납 시에만 계좌를 본다), 운영진이 입금을 확인(또는 면제·취소)한다. 갱신 여부는 갱신 심사가 따로 정한다(입금과 자동 연동하지 않음).
create table if not exists app_settings (
  key text primary key check (key in ('fee_amount', 'fee_account', 'fee_note')),
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table app_settings enable row level security;
create policy app_settings_admin on app_settings for all using (is_admin()) with check (is_admin());

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('joining', 'renewal', 'other')),
  amount int not null check (amount between 0 and 100000000),
  status text not null default 'issued' check (status in ('issued', 'paid', 'waived', 'void')),
  due_on date,
  note text,
  issued_by uuid references members(id),
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  decided_note text
);
create index if not exists invoices_member_idx on invoices (member_id, issued_at desc);
alter table invoices enable row level security;
create policy invoices_self on invoices for select using (member_id = current_member_id());
create policy invoices_admin on invoices for all using (is_admin()) with check (is_admin());
create policy viewas_no_insert on invoices as restrictive for insert with check (request_view_as() is null);
create policy viewas_no_update on invoices as restrictive for update using (request_view_as() is null);
create policy viewas_no_delete on invoices as restrictive for delete using (request_view_as() is null);
create policy viewas_no_insert on app_settings as restrictive for insert with check (request_view_as() is null);
create policy viewas_no_update on app_settings as restrictive for update using (request_view_as() is null);
create policy viewas_no_delete on app_settings as restrictive for delete using (request_view_as() is null);

create or replace function set_setting(p_key text, p_value text) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_key not in ('fee_amount', 'fee_account', 'fee_note') then raise exception 'bad key'; end if;
  if p_key = 'fee_amount' and coalesce(p_value, '') !~ '^\d{0,9}$' then raise exception 'bad amount'; end if;
  insert into app_settings (key, value, updated_at) values (p_key, left(coalesce(p_value, ''), 300), now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

create or replace function issue_invoice(p_member uuid, p_kind text, p_amount int, p_due date default null, p_note text default null) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'forbidden'; end if;
  if not exists (select 1 from members where id = p_member and status = 'active') then raise exception 'bad member'; end if;
  insert into invoices (member_id, kind, amount, due_on, note, issued_by) values (p_member, p_kind, p_amount, p_due, nullif(left(btrim(coalesce(p_note, '')), 300), ''), me) returning id into new_id;
  perform notify(p_member, 'invoice_issued', jsonb_build_object('amount', p_amount), '/connect/growth');
  return new_id;
end $$;

create or replace function decide_invoice(p_id uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare inv invoices;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('paid', 'waived', 'void') then raise exception 'bad status'; end if;
  select * into inv from invoices where id = p_id and status = 'issued' for update;
  if not found then raise exception 'not found'; end if;
  update invoices set status = p_status, paid_at = case when p_status = 'paid' then now() end, decided_note = nullif(left(btrim(coalesce(p_note, '')), 300), '') where id = p_id;
  if p_status in ('paid', 'waived') then perform notify(inv.member_id, 'invoice_' || p_status, '{}'::jsonb, '/connect/growth'); end if;
end $$;

-- 회원: 내 청구서와 입금 안내(미납이 있을 때만 계좌 정보를 돌려준다)
create or replace function my_billing() returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); open_n int; acct text; note text;
begin
  if me is null then return null; end if;
  select count(*) into open_n from invoices where member_id = me and status = 'issued';
  select value into acct from app_settings where key = 'fee_account';
  select value into note from app_settings where key = 'fee_note';
  return jsonb_build_object('open', open_n,
    'account', case when open_n > 0 then nullif(acct, '') end, 'note', case when open_n > 0 then nullif(note, '') end,
    'invoices', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'kind', i.kind, 'amount', i.amount, 'status', i.status, 'due_on', i.due_on, 'issued_at', i.issued_at, 'paid_at', i.paid_at) order by i.issued_at desc)
                          from (select * from invoices where member_id = me order by issued_at desc limit 12) i), '[]'::jsonb));
end $$;

do $$
begin
  if not exists (select 1 from app_settings where key = 'fee_amount') then insert into app_settings (key, value) values ('fee_amount', ''), ('fee_account', ''), ('fee_note', ''); end if;
end $$;
