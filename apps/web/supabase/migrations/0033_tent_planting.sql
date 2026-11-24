-- 텐트 플랜팅: 텐트 정원을 50명으로 고정하지 않고, 운영진이 알맞은 때에 새 텐트를 세웁니다.
--  · tent_cap() 은 이제 "제한 없음"(0)을 뜻합니다. 필요한 텐트에만 chapters.max_members 로 상한을 둘 수 있습니다.
--  · 자동 배정은 업종이 비어 있는 같은 지역 텐트에 넣습니다. 지역에 텐트가 아직 하나도 없을 때만 첫 텐트를 만들고,
--    그 밖에 들어갈 텐트가 없으면 배정하지 않고 둡니다(운영진이 텐트를 세운 뒤 배정).
set search_path = wmto;

alter table chapters add column if not exists max_members int check (max_members is null or max_members between 1 and 500);

create or replace function tent_cap() returns int language sql immutable as $$ select 0 $$;

create or replace function assign_member_tent(p_member uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare
  m members; kk record; t chapters; cid int; n int;
begin
  select * into m from members where id = p_member;
  if not found or m.role not in ('mentor', 'sponsor') or m.status <> 'active' then return; end if;
  select * into kk from tent_key(m.country, m.region, m.email like '%@demo.wmto.invalid');
  if kk.k is null then return; end if;
  select category_id into cid from mentor_profiles where member_id = m.id;

  if m.role = 'mentor' then
    select c.* into t from chapters c
     where c.region_key = kk.k
       and (c.max_members is null
            or (select count(*) from members x where x.chapter_id = c.id and x.role = 'mentor' and x.status = 'active' and x.id <> m.id) < c.max_members)
       and (cid is null or not exists (
             select 1 from members x join mentor_profiles p on p.member_id = x.id
              where x.chapter_id = c.id and x.role = 'mentor' and x.status = 'active' and x.id <> m.id and p.category_id = cid))
     order by (m.district is not null and m.district = any (c.districts)) desc, c.seq limit 1;
  else
    select c.* into t from chapters c where c.region_key = kk.k
     order by (m.district is not null and m.district = any (c.districts)) desc, c.seq limit 1;
  end if;

  if not found then
    select count(*) into n from chapters where region_key = kk.k;
    if n > 0 then return; end if;  -- 새 텐트는 운영진이 알맞은 때에 세웁니다(plant_tent)
    insert into chapters (name, region, region_key, base, seq)
    values (kk.base || ' 텐트', kk.grp, kk.k, kk.base, 1) returning * into t;
  end if;
  if m.district is not null and not (m.district = any (t.districts)) then
    update chapters set districts = array_append(districts, m.district) where id = t.id;
  end if;
  update members set chapter_id = t.id, chapter = t.name where id = m.id;
end $$;

-- 같은 지역에 새 텐트를 세웁니다(운영진 전용). 첫 텐트에 번호가 없으면 1텐트로 이름을 바꿉니다.
create or replace function plant_tent(p_region_key text) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare t chapters; n int; newid uuid;
begin
  if session_user not in ('postgres', 'supabase_admin', 'service_role') and not is_admin() then raise exception 'forbidden'; end if;
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into t from chapters where region_key = p_region_key order by seq limit 1;
  if not found then raise exception 'unknown region'; end if;
  select count(*) into n from chapters where region_key = p_region_key;
  insert into chapters (name, region, region_key, base, seq)
  values (t.base || ' ' || (n + 1) || '텐트', t.region, p_region_key, t.base, n + 1) returning id into newid;
  if n = 1 then
    update chapters set name = base || ' 1텐트' where region_key = p_region_key and seq = 1;
    update members x set chapter = c.name from chapters c where c.id = x.chapter_id and c.region_key = p_region_key;
  end if;
  return newid;
end $$;

-- 입회 대기 현황: 상한이 있는 텐트만 가득 찬 것으로 봅니다.
create or replace function admission_overview() returns table (
  member_id uuid, name text, email text, category_id int, category_name text, region_key text, region_label text,
  chapters int, open_chapters int, waiting boolean, waiting_since timestamptz)
language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, m.email, c.id, c.name_ko, k.k, k.base,
    (select count(*)::int from chapters ch where ch.region_key = k.k),
    (select count(*)::int from chapters ch where ch.region_key = k.k
        and (ch.max_members is null or (select count(*) from members x where x.chapter_id = ch.id and x.role = 'mentor' and x.status = 'active') < ch.max_members)
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
