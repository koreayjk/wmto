-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 6단계: 입회 심사 + 업종 대기 명단 (docs/09)
-- 승인 전에 "이 업종이 그 지역 텐트에 비어 있는가"를 보여 주고, 비어 있지 않으면 대기 명단에 올려 둘 수 있다.
-- 대기 중인 신청자는 신청자(applicant) 상태로 남는다. 자리가 나면(비어 있는 텐트가 생기면) 운영진에게 "자리 났음"으로 표시된다.
create table if not exists category_waitlist (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  category_id int not null references industry_categories(id),
  note text,
  status text not null default 'waiting' check (status in ('waiting', 'placed', 'cancelled')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create unique index if not exists category_waitlist_one_waiting on category_waitlist (member_id) where status = 'waiting';
alter table category_waitlist enable row level security;
drop policy if exists category_waitlist_admin on category_waitlist;
create policy category_waitlist_admin on category_waitlist for all using (is_admin()) with check (is_admin());

-- 업종이 있는 사업가 신청자별 입회 현황
create or replace function admission_overview() returns table (
  member_id uuid, name text, email text, category_id int, category_name text, region_key text, region_label text,
  chapters int, open_chapters int, waiting boolean, waiting_since timestamptz)
language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, m.email, c.id, c.name_ko, k.k, k.base,
    (select count(*)::int from chapters ch where ch.region_key = k.k),
    (select count(*)::int from chapters ch where ch.region_key = k.k
        and (select count(*) from members x where x.chapter_id = ch.id and x.role = 'mentor' and x.status = 'active') < tent_cap()
        and not exists (select 1 from members x join mentor_profiles p on p.member_id = x.id
                         where x.chapter_id = ch.id and x.role = 'mentor' and x.status = 'active' and p.category_id = c.id)),
    exists (select 1 from category_waitlist w where w.member_id = m.id and w.status = 'waiting'),
    (select w.created_at from category_waitlist w where w.member_id = m.id and w.status = 'waiting')
  from members m
  join mentor_profiles mp on mp.member_id = m.id
  join industry_categories c on c.id = mp.category_id
  left join lateral tent_key(m.country, m.region, m.email like '%@demo.wmto.invalid') k on true
  where is_admin() and m.role = 'mentor' and m.status = 'applicant'
  order by m.created_at;
$$;

create or replace function waitlist_set(p_member uuid, p_wait boolean, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare cid int;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_wait then
    select category_id into cid from mentor_profiles where member_id = p_member;
    if cid is null then raise exception 'no category'; end if;
    insert into category_waitlist (member_id, category_id, note) values (p_member, cid, nullif(left(btrim(coalesce(p_note, '')), 500), ''))
      on conflict (member_id) where status = 'waiting' do nothing;
  else
    update category_waitlist set status = 'cancelled', decided_at = now() where member_id = p_member and status = 'waiting';
  end if;
end $$;

-- 승인(활성화)되면 대기 명단에서 '배정 완료'로
create or replace function waitlist_mark_placed(p_member uuid) returns void
language sql security definer set search_path = wmto as $$
  update category_waitlist set status = 'placed', decided_at = now() where member_id = p_member and status = 'waiting' and is_admin();
$$;

do $$
declare t text;
begin
  foreach t in array array['category_waitlist'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function admission_overview() from public, anon;
revoke all on function waitlist_set(uuid, boolean, text) from public, anon;
revoke all on function waitlist_mark_placed(uuid) from public, anon;
grant execute on function admission_overview() to authenticated;
grant execute on function waitlist_set(uuid, boolean, text) to authenticated;
grant execute on function waitlist_mark_placed(uuid) to authenticated;
revoke insert, update, delete on category_waitlist from anon, authenticated;
