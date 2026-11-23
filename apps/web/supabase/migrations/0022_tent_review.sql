-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 9단계: 월간 텐트 점검 기록 + 살펴볼 사람 목록 + 소개 알림 (docs/13)
-- 점검 기록: 텐트장·부텐트장이 한 달에 한 번 남기는 기록. 시작할 때 그 시점의 지표가 자동으로 담기고(이후 변하지 않음),
-- 직전 달 기록을 제출해야 새로 시작할 수 있으며, 제출하면 잠긴다(수정은 운영진만 되돌릴 수 있음). 미완료 할 일은 다음 달로 이어진다.

-- ───────── 살펴볼 사람 ─────────
-- 1) 최근 6개월 모임에 3번 이상 빠진 분 2) 2주 넘게 진행이 없는 소개 3) 기간 종료 6개월 이내인데 낮은 단계인 분(일찍 살피기)
create or replace function chapter_watchlist(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare absent jsonb; early jsonb; stalled int;
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'missed', x.missed) order by x.missed desc, x.name), '[]'::jsonb) into absent
  from (
    select m.id, m.name,
      (select count(*) from events e where e.chapter_id = p_chapter and e.start_at >= greatest(m.created_at, now() - interval '180 days') and e.start_at < now())
      - (select count(*) from attendance a join events e on e.id = a.event_id where a.member_id = m.id and e.chapter_id = p_chapter and e.start_at >= greatest(m.created_at, now() - interval '180 days') and e.start_at < now()) as missed
    from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active') x
  where x.missed >= 3;

  select count(*) into stalled from referrals r join members m on m.id = r.giver_id
   where m.chapter_id = p_chapter and r.status = 'sent' and r.created_at < now() - interval '14 days';

  select coalesce(jsonb_agg(jsonb_build_object('id', y.id, 'name', y.name, 'term_end', y.term_end, 'total', y.total, 'level', growth_level(y.total)) order by y.total, y.name), '[]'::jsonb) into early
  from (
    select m.id, m.name, m.term_end,
      coalesce(round((select sum(points) / nullif(sum(max_points), 0) * 100 from growth_scores(m.id))), 0) as total
    from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active'
      and m.term_end > current_date + 60 and m.term_end <= current_date + 180) y
  where growth_level(y.total) in ('peg', 'pole');

  return jsonb_build_object('absence', absent, 'stalled_referrals', stalled, 'early', early);
end $$;
revoke all on function chapter_watchlist(uuid) from public, anon;
grant execute on function chapter_watchlist(uuid) to authenticated;

-- ───────── 월간 텐트 점검 기록 ─────────
create table if not exists tent_reviews (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  month date not null,                       -- 그 달의 1일
  held_on date,
  note_taker uuid references members(id),
  snapshot jsonb not null default '{}'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb, -- [{text, done, carried}]
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  created_by uuid references members(id),
  submitted_by uuid references members(id),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (chapter_id, month)
);
alter table tent_reviews enable row level security;
drop policy if exists tent_reviews_read on tent_reviews;
create policy tent_reviews_read on tent_reviews for select using (is_admin() or is_chapter_leader(chapter_id));
drop policy if exists tent_reviews_admin on tent_reviews;
create policy tent_reviews_admin on tent_reviews for all using (is_admin()) with check (is_admin());

create or replace function start_tent_review(p_chapter uuid, p_month date default null) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); mth date; existing uuid; prev tent_reviews; carried jsonb := '[]'::jsonb; snap jsonb; new_id uuid;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  mth := date_trunc('month', coalesce(p_month, current_date))::date;
  if mth > date_trunc('month', current_date)::date or mth < (date_trunc('month', current_date) - interval '1 month')::date then raise exception 'month out of range'; end if;
  select id into existing from tent_reviews where chapter_id = p_chapter and month = mth;
  if existing is not null then return existing; end if;
  if exists (select 1 from tent_reviews where chapter_id = p_chapter and status = 'draft') then raise exception 'previous draft'; end if;

  select * into prev from tent_reviews where chapter_id = p_chapter and status = 'submitted' and month < mth order by month desc limit 1;
  if found then
    select coalesce(jsonb_agg(jsonb_build_object('text', a->>'text', 'done', false, 'carried', true)), '[]'::jsonb) into carried
      from jsonb_array_elements(prev.actions) a where coalesce((a->>'done')::boolean, false) = false;
  end if;
  snap := chapter_dashboard(p_chapter) || jsonb_build_object('watch', chapter_watchlist(p_chapter), 'taken_at', now());
  insert into tent_reviews (chapter_id, month, snapshot, actions, created_by) values (p_chapter, mth, snap, carried, me) returning id into new_id;
  return new_id;
end $$;

create or replace function save_tent_review(p_id uuid, p_held_on date, p_note_taker uuid, p_notes jsonb, p_actions jsonb) returns void
language plpgsql security definer set search_path = wmto as $$
declare r tent_reviews;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from tent_reviews where id = p_id for update;
  if not found then raise exception 'not found'; end if;
  if not (is_admin() or is_chapter_leader(r.chapter_id)) then raise exception 'forbidden'; end if;
  if r.status <> 'draft' then raise exception 'locked'; end if;
  if jsonb_typeof(coalesce(p_notes, '{}'::jsonb)) <> 'object' or jsonb_typeof(coalesce(p_actions, '[]'::jsonb)) <> 'array' then raise exception 'bad input'; end if;
  if pg_column_size(coalesce(p_notes, '{}'::jsonb)) > 40000 or jsonb_array_length(coalesce(p_actions, '[]'::jsonb)) > 40 then raise exception 'too large'; end if;
  if p_note_taker is not null and not exists (select 1 from members where id = p_note_taker and chapter_id = r.chapter_id and status = 'active') then raise exception 'bad note taker'; end if;
  update tent_reviews set held_on = p_held_on, note_taker = p_note_taker, notes = coalesce(p_notes, '{}'::jsonb), actions = coalesce(p_actions, '[]'::jsonb) where id = p_id;
end $$;

create or replace function submit_tent_review(p_id uuid) returns void
language plpgsql security definer set search_path = wmto as $$
declare r tent_reviews; me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from tent_reviews where id = p_id for update;
  if not found then raise exception 'not found'; end if;
  if not (is_admin() or is_chapter_leader(r.chapter_id)) then raise exception 'forbidden'; end if;
  if r.status <> 'draft' then raise exception 'locked'; end if;
  if r.held_on is null or r.note_taker is null then raise exception 'note taker and date required'; end if;
  update tent_reviews set status = 'submitted', submitted_by = me, submitted_at = now() where id = p_id;
end $$;

create or replace function reopen_tent_review(p_id uuid) returns void
language plpgsql security definer set search_path = wmto as $$
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'admin only'; end if;
  update tent_reviews set status = 'draft', submitted_by = null, submitted_at = null where id = p_id;
end $$;

-- ───────── 소개 알림 (받은 소개 / 진행 상태 변경) ─────────
create or replace function trg_notify_referral() returns trigger
language plpgsql security definer set search_path = wmto as $$
declare g text; r text;
begin
  if tg_op = 'INSERT' then
    select name into g from members where id = new.giver_id;
    perform notify(new.receiver_id, 'referral_received', jsonb_build_object('name', g), '/connect/referrals');
  elsif new.status is distinct from old.status then
    select name into r from members where id = new.receiver_id;
    perform notify(new.giver_id, 'referral_' || new.status::text, jsonb_build_object('name', r), '/connect/referrals');
  end if;
  return new;
end $$;
drop trigger if exists notify_referral on referrals;
create trigger notify_referral after insert or update of status on referrals for each row execute function trg_notify_referral();

do $$
declare t text;
begin
  foreach t in array array['tent_reviews'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function start_tent_review(uuid, date) from public, anon;
revoke all on function save_tent_review(uuid, date, uuid, jsonb, jsonb) from public, anon;
revoke all on function submit_tent_review(uuid) from public, anon;
revoke all on function reopen_tent_review(uuid) from public, anon;
grant execute on function start_tent_review(uuid, date) to authenticated;
grant execute on function save_tent_review(uuid, date, uuid, jsonb, jsonb) to authenticated;
grant execute on function submit_tent_review(uuid) to authenticated;
grant execute on function reopen_tent_review(uuid) to authenticated;
revoke insert, update, delete on tent_reviews from anon, authenticated;
