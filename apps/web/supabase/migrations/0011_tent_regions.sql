-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 지역별 텐트 자동 배정
--  · 한국: 서울, 경기도, 충청남도, 충청북도, 강원도, 전라남도, 전라북도, 경상남도, 경상북도, 제주도 + 광역시(부산·대구·인천·광주·대전·울산) + 세종
--  · 다른 나라: 나라별로 한 텐트
--  · 사업가가 12명을 넘으면 그 텐트 안에서 시·군·구(도시)로 둘로 나눕니다(1텐트, 2텐트 …).
--  · 사업가·후원자는 지역 정보(country, region, district)가 있으면 자동으로 들어갑니다. 선교사는 따로 정하지 않습니다.

alter table members add column if not exists region text;     -- 한국의 시·도
alter table members add column if not exists district text;   -- 시·군·구 (해외는 도시)
grant update (region, district) on members to authenticated;

alter table chapters add column if not exists region_key text;                 -- 예: KR:서울, C:미국 (데모는 DEMO: 접두)
alter table chapters add column if not exists base text;                       -- 이름의 기본형 (예: 서울)
alter table chapters add column if not exists districts text[] not null default '{}';
alter table chapters add column if not exists seq int not null default 1;
create index if not exists chapters_region_key_idx on chapters (region_key);

-- 텐트 하나에 사업가가 12명을 넘으면 나눕니다.
create or replace function tent_max() returns int language sql immutable as $$ select 12 $$;

create or replace function tent_key(p_country text, p_region text, p_demo boolean)
returns table (k text, base text, grp text) language plpgsql immutable as $$
declare
  kr text[] := array['서울','경기도','충청남도','충청북도','강원도','전라남도','전라북도','경상남도','경상북도','제주도','부산','대구','인천','광주','대전','울산','세종'];
  c text := lower(btrim(coalesce(p_country, '')));
  r text := btrim(coalesce(p_region, ''));
  korea boolean := c in ('대한민국','한국','korea','south korea','republic of korea','kr','rok') or (c = '' and r = any (kr));
  out_k text; out_b text; out_g text;
begin
  if korea then
    if r = any (kr) then out_k := 'KR:' || r; out_b := r; out_g := '한국'; end if;
  elsif c <> '' then
    out_k := 'C:' || c; out_b := btrim(p_country); out_g := btrim(p_country);
  end if;
  if out_k is null then return; end if;
  if p_demo then out_k := 'DEMO:' || out_k; out_b := '[데모] ' || out_b; end if;
  k := out_k; base := out_b; grp := out_g;
  return next;
end $$;

-- 사업가가 많은 텐트를 시·군·구 기준으로 균형 있게 둘로 나눕니다.
create or replace function tent_split(p_tent uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare
  t chapters;
  d record;
  a text[] := '{}'; b text[] := '{}';
  na int := 0; nb int := 0;
  nseq int; newid uuid;
begin
  select * into t from chapters where id = p_tent;
  for d in
    select coalesce(district, '') as dist, count(*) as n from members
    where chapter_id = p_tent and role = 'mentor' and status = 'active'
    group by 1 order by n desc, dist
  loop
    if na <= nb then a := a || d.dist; na := na + d.n; else b := b || d.dist; nb := nb + d.n; end if;
  end loop;
  select coalesce(max(seq), 0) + 1 into nseq from chapters where region_key = t.region_key;
  insert into chapters (name, region, region_key, base, seq, districts)
  values (t.base || ' ' || nseq || '텐트', t.region, t.region_key, t.base, nseq, array_remove(b, ''))
  returning id into newid;
  update chapters set districts = array_remove(a, ''), name = t.base || ' ' || t.seq || '텐트' where id = p_tent;
  update members set chapter_id = newid
   where chapter_id = p_tent and role in ('mentor', 'sponsor') and coalesce(district, '') = any (b);
  update members m set chapter = c.name from chapters c where c.id = m.chapter_id and m.chapter_id in (p_tent, newid);
end $$;

create or replace function tent_rebalance(p_key text) returns void
language plpgsql security definer set search_path = wmto as $$
declare t chapters;
begin
  loop
    select c.* into t from chapters c
    where c.region_key = p_key
      and (select count(*) from members x where x.chapter_id = c.id and x.role = 'mentor' and x.status = 'active') > tent_max()
      and (select count(distinct coalesce(x.district, '')) from members x where x.chapter_id = c.id and x.role = 'mentor' and x.status = 'active') >= 2
    order by c.seq limit 1;
    exit when not found;
    perform tent_split(t.id);
  end loop;
end $$;

-- 한 사람을 지역에 맞는 텐트에 넣습니다.
create or replace function assign_member_tent(p_member uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare
  m members;
  kk record;
  t chapters;
begin
  select * into m from members where id = p_member;
  if not found or m.role not in ('mentor', 'sponsor') or m.status <> 'active' then return; end if;
  select * into kk from tent_key(m.country, m.region, m.email like '%@demo.wmto.invalid');
  if kk.k is null then return; end if;

  select * into t from chapters
   where region_key = kk.k and m.district is not null and m.district = any (districts) order by seq limit 1;
  if not found then
    select c.* into t from chapters c where c.region_key = kk.k
     order by (select count(*) from members x where x.chapter_id = c.id and x.role = 'mentor' and x.status = 'active'), c.seq limit 1;
  end if;
  if not found then
    insert into chapters (name, region, region_key, base, seq)
    values (kk.base || ' 텐트', kk.grp, kk.k, kk.base, 1) returning * into t;
  end if;
  if m.district is not null and not (m.district = any (t.districts)) then
    update chapters set districts = array_append(districts, m.district) where id = t.id;
  end if;
  update members set chapter_id = t.id, chapter = t.name where id = m.id;
  perform tent_rebalance(kk.k);
end $$;

create or replace function trg_members_assign_tent() returns trigger
language plpgsql security definer set search_path = wmto as $$
begin
  if new.status = 'active' and new.role in ('mentor', 'sponsor') then perform assign_member_tent(new.id); end if;
  return null;
end $$;

drop trigger if exists members_assign_tent on members;
create trigger members_assign_tent after insert or update of status, role, country, region, district on members
  for each row execute function trg_members_assign_tent();

-- 텐트가 없는 사업가·후원자를 지역 정보로 한꺼번에 배정합니다.
create or replace function assign_unassigned_tents() returns int
language plpgsql security definer set search_path = wmto as $$
declare r record; n int := 0;
begin
  if session_user not in ('postgres', 'supabase_admin', 'service_role') and not is_admin() then raise exception 'forbidden'; end if;
  for r in select id from members where role in ('mentor', 'sponsor') and status = 'active' and chapter_id is null loop
    perform assign_member_tent(r.id);
    n := n + 1;
  end loop;
  return n;
end $$;

revoke all on function tent_split(uuid), tent_rebalance(text), assign_member_tent(uuid), trg_members_assign_tent(), assign_unassigned_tents() from public, anon, authenticated;
grant execute on function assign_unassigned_tents() to authenticated;

-- 이미 있는 회원 중 지역 정보가 있는 사람은 지금 배정합니다.
select assign_unassigned_tents();
