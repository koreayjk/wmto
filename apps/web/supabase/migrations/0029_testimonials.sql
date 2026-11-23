-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 15단계: 추천사 (docs/13)
-- 함께 일해 본 사업가(확인된 1:1 만남이나 소개가 오간 사이)만 서로에게 추천사를 쓸 수 있다.
-- 받은 사람이 "공개"를 눌러야 같은 텐트 회원에게 보인다(원치 않으면 숨김). 추천사를 부탁할 수도 있다.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references members(id) on delete cascade,
  subject_id uuid not null references members(id) on delete cascade,
  body text not null check (length(body) between 10 and 1500),
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  check (author_id <> subject_id),
  unique (author_id, subject_id)
);
create index if not exists testimonials_subject_idx on testimonials (subject_id, status, created_at desc);
alter table testimonials enable row level security;
drop policy if exists testimonials_party_read on testimonials;
create policy testimonials_party_read on testimonials for select using (author_id = current_member_id() or subject_id = current_member_id());
drop policy if exists testimonials_admin on testimonials;
create policy testimonials_admin on testimonials for all using (is_admin()) with check (is_admin());

-- 함께 일해 본 사이인가(확인된 1:1 또는 소개)
create or replace function worked_together(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from one_to_ones o where o.status = 'confirmed' and ((o.member_a = a and o.member_b = b) or (o.member_a = b and o.member_b = a)))
      or exists (select 1 from referrals r where (r.giver_id = a and r.receiver_id = b) or (r.giver_id = b and r.receiver_id = a));
$$;
revoke all on function worked_together(uuid, uuid) from public, anon, authenticated;

-- 추천사를 쓸 수 있는 분(함께 일해 본 같은 텐트·다른 텐트 사업가)
create or replace function testimonial_candidates() returns table (id uuid, name text, written boolean)
language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, exists (select 1 from testimonials t where t.author_id = current_member_id() and t.subject_id = m.id)
  from members m
  where current_member_id() is not null and m.role = 'mentor' and m.status = 'active' and m.id <> current_member_id()
    and worked_together(current_member_id(), m.id)
  order by m.name;
$$;

create or replace function write_testimonial(p_subject uuid, p_body text) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  if not exists (select 1 from members where id = p_subject and role = 'mentor' and status = 'active') then raise exception 'bad subject'; end if;
  if not worked_together(me, p_subject) then raise exception 'no shared work'; end if;
  insert into testimonials (author_id, subject_id, body) values (me, p_subject, left(btrim(p_body), 1500));
  select name into nm from members where id = me;
  perform notify(p_subject, 'testimonial_written', jsonb_build_object('name', nm), '/connect/testimonials');
end $$;

create or replace function request_testimonial(p_from uuid, p_message text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  if not worked_together(me, p_from) then raise exception 'no shared work'; end if;
  select name into nm from members where id = me;
  perform notify(p_from, 'testimonial_request', jsonb_build_object('name', nm), '/connect/testimonials');
end $$;

create or replace function decide_testimonial(p_id uuid, p_publish boolean) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); t testimonials; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into t from testimonials where id = p_id for update;
  if not found or t.subject_id <> me then raise exception 'forbidden'; end if;
  update testimonials set status = case when p_publish then 'published' else 'hidden' end, decided_at = now() where id = p_id;
  if p_publish then
    select name into nm from members where id = me;
    perform notify(t.author_id, 'testimonial_published', jsonb_build_object('name', nm), '/connect/testimonials');
  end if;
end $$;

-- 같은 텐트 사업가들이 받은 공개 추천사
create or replace function tent_testimonials() returns table (id uuid, subject_name text, author_name text, body text, created_at timestamptz)
language sql stable security definer set search_path = wmto as $$
  select t.id, s.name, a.name, t.body, t.created_at
  from testimonials t join members s on s.id = t.subject_id join members a on a.id = t.author_id
  where t.status = 'published' and current_member_id() is not null
    and s.chapter_id is not null and s.chapter_id = (select chapter_id from members where id = current_member_id())
  order by t.created_at desc limit 50;
$$;

do $$
declare t text;
begin
  foreach t in array array['testimonials'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function testimonial_candidates() from public, anon;
revoke all on function write_testimonial(uuid, text) from public, anon;
revoke all on function request_testimonial(uuid, text) from public, anon;
revoke all on function decide_testimonial(uuid, boolean) from public, anon;
revoke all on function tent_testimonials() from public, anon;
grant execute on function testimonial_candidates() to authenticated;
grant execute on function write_testimonial(uuid, text) to authenticated;
grant execute on function request_testimonial(uuid, text) to authenticated;
grant execute on function decide_testimonial(uuid, boolean) to authenticated;
grant execute on function tent_testimonials() to authenticated;
revoke insert, update, delete on testimonials from anon, authenticated;
