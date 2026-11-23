-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 16단계: 동역 소그룹 (docs/13)
-- 같은 텐트 안에서 서로의 고객층을 이어 줄 수 있는 3~6명의 작은 모임. 텐트장·부텐트장이 만들고 구성원을 정한다.
-- 한 사람은 소그룹 하나에만 들어가며, 구성원끼리 "이번 주 소개 기회"를 나누는 작은 게시판이 있다.
create table if not exists circles (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  name text not null check (length(name) between 1 and 60),
  purpose text check (purpose is null or length(purpose) <= 300),
  status text not null default 'active' check (status in ('active', 'closed')),
  created_by uuid references members(id),
  created_at timestamptz not null default now()
);
create table if not exists circle_members (
  circle_id uuid not null references circles(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (circle_id, member_id)
);
create unique index if not exists circle_members_one_circle on circle_members (member_id);
create table if not exists circle_posts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  author_id uuid references members(id) on delete set null,
  body text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists circle_posts_idx on circle_posts (circle_id, created_at desc);

create or replace function in_circle(p_circle uuid) returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from circle_members where circle_id = p_circle and member_id = current_member_id());
$$;
revoke all on function in_circle(uuid) from public, anon;
grant execute on function in_circle(uuid) to authenticated;

alter table circles enable row level security;
alter table circle_members enable row level security;
alter table circle_posts enable row level security;
drop policy if exists circles_read on circles;
create policy circles_read on circles for select using (chapter_id = (select chapter_id from members where id = current_member_id()) or is_admin());
drop policy if exists circles_admin on circles;
create policy circles_admin on circles for all using (is_admin()) with check (is_admin());
drop policy if exists circle_members_read on circle_members;
create policy circle_members_read on circle_members for select using (in_circle(circle_id) or is_admin() or exists (select 1 from circles c where c.id = circle_id and is_chapter_leader(c.chapter_id)));
drop policy if exists circle_members_admin on circle_members;
create policy circle_members_admin on circle_members for all using (is_admin()) with check (is_admin());
drop policy if exists circle_posts_read on circle_posts;
create policy circle_posts_read on circle_posts for select using (in_circle(circle_id) or is_admin());
drop policy if exists circle_posts_admin on circle_posts;
create policy circle_posts_admin on circle_posts for all using (is_admin()) with check (is_admin());

create or replace function create_circle(p_chapter uuid, p_name text, p_purpose text default null) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  if coalesce(btrim(p_name), '') = '' then raise exception 'name required'; end if;
  insert into circles (chapter_id, name, purpose, created_by) values (p_chapter, left(btrim(p_name), 60), nullif(left(btrim(coalesce(p_purpose, '')), 300), ''), me) returning id into new_id;
  return new_id;
end $$;

create or replace function add_circle_member(p_circle uuid, p_member uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare c circles; n int; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into c from circles where id = p_circle and status = 'active';
  if not found then raise exception 'not found'; end if;
  if not (is_admin() or is_chapter_leader(c.chapter_id)) then raise exception 'forbidden'; end if;
  if not exists (select 1 from members where id = p_member and chapter_id = c.chapter_id and role = 'mentor' and status = 'active') then raise exception 'bad member'; end if;
  select count(*) into n from circle_members where circle_id = p_circle;
  if n >= 6 then raise exception 'circle full'; end if;
  insert into circle_members (circle_id, member_id) values (p_circle, p_member);  -- 이미 다른 소개 그룹이면 고유 제약이 거부
  perform notify(p_member, 'circle_added', jsonb_build_object('name', c.name), '/connect/circles');
end $$;

create or replace function remove_circle_member(p_circle uuid, p_member uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare c circles;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into c from circles where id = p_circle;
  if not found then raise exception 'not found'; end if;
  if not (p_member = current_member_id() or is_admin() or is_chapter_leader(c.chapter_id)) then raise exception 'forbidden'; end if;
  delete from circle_members where circle_id = p_circle and member_id = p_member;
end $$;

create or replace function close_circle(p_circle uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare c circles;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into c from circles where id = p_circle;
  if not found then raise exception 'not found'; end if;
  if not (is_admin() or is_chapter_leader(c.chapter_id)) then raise exception 'forbidden'; end if;
  delete from circle_members where circle_id = p_circle;
  update circles set status = 'closed' where id = p_circle;
end $$;

create or replace function post_circle(p_circle uuid, p_body text) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not in_circle(p_circle) then raise exception 'forbidden'; end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'body required'; end if;
  insert into circle_posts (circle_id, author_id, body) values (p_circle, me, left(btrim(p_body), 1000));
  insert into notifications (member_id, kind, params, href)
    select cm.member_id, 'circle_post', jsonb_build_object('name', (select name from members where id = me)), '/connect/circles'
    from circle_members cm where cm.circle_id = p_circle and cm.member_id <> me;
end $$;

-- 내 소그룹과 구성원(이름·업종)
create or replace function my_circle() returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare me uuid := current_member_id(); c circles;
begin
  select ci.* into c from circles ci join circle_members cm on cm.circle_id = ci.id where cm.member_id = me and ci.status = 'active';
  if not found then return null; end if;
  return jsonb_build_object('id', c.id, 'name', c.name, 'purpose', c.purpose,
    'members', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name, 'industry', mp.industry) order by cm.joined_at), '[]'::jsonb)
                from circle_members cm join members m on m.id = cm.member_id left join mentor_profiles mp on mp.member_id = m.id where cm.circle_id = c.id));
end $$;

-- 텐트장용: 텐트의 소그룹과 구성원 수, 소그룹이 없는 회원
create or replace function chapter_circles(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'circles', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'purpose', c.purpose,
        'members', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name) order by cm.joined_at), '[]'::jsonb) from circle_members cm join members m on m.id = cm.member_id where cm.circle_id = c.id)) order by c.created_at), '[]'::jsonb)
        from circles c where c.chapter_id = p_chapter and c.status = 'active'),
    'free', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name, 'industry', mp.industry) order by m.name), '[]'::jsonb)
        from members m left join mentor_profiles mp on mp.member_id = m.id
        where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active' and not exists (select 1 from circle_members cm where cm.member_id = m.id)));
end $$;

create or replace function my_circle_posts(p_circle uuid) returns table (id uuid, author_name text, body text, created_at timestamptz)
language sql stable security definer set search_path = wmto as $$
  select p.id, m.name, p.body, p.created_at from circle_posts p left join members m on m.id = p.author_id
  where p.circle_id = p_circle and in_circle(p_circle) order by p.created_at desc limit 30;
$$;

do $$
declare t text;
begin
  foreach t in array array['circles', 'circle_members', 'circle_posts'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function create_circle(uuid, text, text) from public, anon;
revoke all on function add_circle_member(uuid, uuid) from public, anon;
revoke all on function remove_circle_member(uuid, uuid) from public, anon;
revoke all on function close_circle(uuid) from public, anon;
revoke all on function post_circle(uuid, text) from public, anon;
revoke all on function my_circle() from public, anon;
revoke all on function chapter_circles(uuid) from public, anon;
revoke all on function my_circle_posts(uuid) from public, anon;
grant execute on function create_circle(uuid, text, text) to authenticated;
grant execute on function add_circle_member(uuid, uuid) to authenticated;
grant execute on function remove_circle_member(uuid, uuid) to authenticated;
grant execute on function close_circle(uuid) to authenticated;
grant execute on function post_circle(uuid, text) to authenticated;
grant execute on function my_circle() to authenticated;
grant execute on function chapter_circles(uuid) to authenticated;
grant execute on function my_circle_posts(uuid) to authenticated;
revoke insert, update, delete on circles, circle_members, circle_posts from anon, authenticated;
