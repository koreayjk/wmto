-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 14단계: 모임 진행 도구 (docs/13)
-- 텐트 모임마다 "모임 순서(시간 배분·담당자)"와 "나눔 발표자"를 정해 두고, 회원은 미리 볼 수 있다.
-- 발표자는 가장 오래 발표하지 않은 분을 추천한다. 모임이 끝나면 숫자 요약을 만들어 텐트 후기 글로 올릴 수 있다.
create table if not exists meeting_plans (
  event_id uuid primary key references events(id) on delete cascade,
  agenda jsonb not null default '[]'::jsonb,        -- [{key, minutes, owner}]
  featured_member uuid references members(id) on delete set null,
  featured_topic text,
  updated_by uuid references members(id),
  updated_at timestamptz not null default now()
);
alter table meeting_plans enable row level security;
drop policy if exists meeting_plans_admin on meeting_plans;
create policy meeting_plans_admin on meeting_plans for all using (is_admin()) with check (is_admin());

-- 모임 순서 보기: 내 텐트의 모임(또는 텐트장·운영진)만
create or replace function get_meeting_plan(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare ev events; me uuid := current_member_id(); my_ch uuid; p meeting_plans; fname text; can_edit boolean;
begin
  select * into ev from events where id = p_event;
  if not found then return null; end if;
  select chapter_id into my_ch from members where id = me;
  can_edit := ev.chapter_id is not null and (is_admin() or is_chapter_leader(ev.chapter_id));
  if not (is_admin() or (ev.chapter_id is not null and ev.chapter_id = my_ch)) then return null; end if;
  select * into p from meeting_plans where event_id = p_event;
  if p.featured_member is not null then select name into fname from members where id = p.featured_member; end if;
  return jsonb_build_object('event', jsonb_build_object('id', ev.id, 'title', ev.title, 'start_at', ev.start_at, 'chapter_id', ev.chapter_id),
    'agenda', coalesce(p.agenda, '[]'::jsonb), 'featured_member', p.featured_member, 'featured_name', fname, 'featured_topic', p.featured_topic,
    'can_edit', can_edit, 'has_plan', p.event_id is not null);
end $$;

create or replace function save_meeting_plan(p_event uuid, p_agenda jsonb, p_featured uuid, p_topic text) returns void
language plpgsql security definer set search_path = wmto as $$
declare ev events; me uuid := current_member_id(); old_feat uuid; nm text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into ev from events where id = p_event;
  if not found or ev.chapter_id is null then raise exception 'not a tent event'; end if;
  if not (is_admin() or is_chapter_leader(ev.chapter_id)) then raise exception 'forbidden'; end if;
  if jsonb_typeof(coalesce(p_agenda, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_agenda, '[]'::jsonb)) > 20 or pg_column_size(coalesce(p_agenda, '[]'::jsonb)) > 8000 then raise exception 'bad agenda'; end if;
  if p_featured is not null and not exists (select 1 from members where id = p_featured and chapter_id = ev.chapter_id and status = 'active') then raise exception 'bad speaker'; end if;
  select featured_member into old_feat from meeting_plans where event_id = p_event;
  insert into meeting_plans (event_id, agenda, featured_member, featured_topic, updated_by, updated_at)
  values (p_event, coalesce(p_agenda, '[]'::jsonb), p_featured, nullif(left(btrim(coalesce(p_topic, '')), 200), ''), me, now())
  on conflict (event_id) do update set agenda = excluded.agenda, featured_member = excluded.featured_member, featured_topic = excluded.featured_topic, updated_by = excluded.updated_by, updated_at = now();
  if p_featured is not null and p_featured is distinct from old_feat and p_featured is distinct from me then
    perform notify(p_featured, 'featured_assigned', jsonb_build_object('title', ev.title), '/connect/meeting/' || p_event::text);
  end if;
end $$;

-- 나눔 발표자 추천: 가장 오래 발표하지 않은 분(한 번도 없으면 먼저)
create or replace function suggest_featured(p_chapter uuid) returns table (member_id uuid, name text, last_at timestamptz)
language plpgsql stable security definer set search_path = wmto as $$
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  return query
    select m.id, m.name, (select max(e.start_at) from meeting_plans mp join events e on e.id = mp.event_id where mp.featured_member = m.id and e.chapter_id = p_chapter and e.start_at <= now())
    from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active'
    order by 3 nulls first, m.name limit 8;
end $$;

-- 모임 요약(숫자만): 텐트 구성원이면 볼 수 있다
create or replace function meeting_recap(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare ev events; my_ch uuid; n_members int; n_att int; n_notice int; n_guest int; n_signup int;
begin
  select * into ev from events where id = p_event;
  if not found or ev.chapter_id is null then return null; end if;
  select chapter_id into my_ch from members where id = current_member_id();
  if not (is_admin() or ev.chapter_id = my_ch) then return null; end if;
  select count(*) into n_members from members where chapter_id = ev.chapter_id and role = 'mentor' and status = 'active';
  select count(*) into n_att from attendance a join members m on m.id = a.member_id where a.event_id = p_event and m.chapter_id = ev.chapter_id;
  select count(*) into n_notice from absence_notices where event_id = p_event;
  select count(*) into n_signup from event_signups where event_id = p_event;
  select count(*) into n_guest from visitors v where v.chapter_id = ev.chapter_id and v.kind = 'guest' and v.status in ('attended', 'joined')
     and v.attended_at >= ev.start_at - interval '1 day' and v.attended_at < ev.start_at + interval '2 days';
  return jsonb_build_object('members', n_members, 'attended', n_att, 'absence_notices', n_notice, 'signups', n_signup, 'guests', n_guest);
end $$;

do $$
declare t text;
begin
  foreach t in array array['meeting_plans'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function get_meeting_plan(uuid) from public, anon;
revoke all on function save_meeting_plan(uuid, jsonb, uuid, text) from public, anon;
revoke all on function suggest_featured(uuid) from public, anon;
revoke all on function meeting_recap(uuid) from public, anon;
grant execute on function get_meeting_plan(uuid) to authenticated;
grant execute on function save_meeting_plan(uuid, jsonb, uuid, text) to authenticated;
grant execute on function suggest_featured(uuid) to authenticated;
grant execute on function meeting_recap(uuid) to authenticated;
revoke insert, update, delete on meeting_plans from anon, authenticated;
