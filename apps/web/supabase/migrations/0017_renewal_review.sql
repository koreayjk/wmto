-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 4단계: 갱신 심사 (docs/10 §4). 회원 기간 1년, 만료 60일 전부터 최근 6개월 평균 지표로 심사.
-- 점수가 낮다고 자동으로 탈락시키지 않는다: 사람(텐트장·운영진)이 결정하고, 낮은 단계는 개선 계획·90일 지원 기간을 거친다.
alter table members add column if not exists term_end date;
update members set term_end = (created_at + interval '1 year')::date where term_end is null;
alter table members alter column term_end set default ((now() + interval '1 year')::date);

create table if not exists renewal_reviews (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  term_end date not null,
  round_no int not null default 1,
  avg_score numeric,
  level text,
  suggestion text not null check (suggestion in ('renew', 'plan', 'hold', 'not_renew')),
  status text not null default 'open' check (status in ('open', 'planned', 'renewed', 'on_hold', 'not_renewed', 'closed')),
  plan text,
  leader_note text,
  appeal_note text,
  support_until date,
  decided_by uuid references members(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists renewal_reviews_member_idx on renewal_reviews (member_id, created_at desc);
alter table renewal_reviews enable row level security;
drop policy if exists renewal_reviews_self on renewal_reviews;
create policy renewal_reviews_self on renewal_reviews for select using (member_id = current_member_id());
drop policy if exists renewal_reviews_admin on renewal_reviews;
create policy renewal_reviews_admin on renewal_reviews for all using (is_admin()) with check (is_admin());

-- 최근 N주(기본 26주 ≈ 6개월)의 주간 점수(100점 환산) 평균
create or replace function growth_avg(p_member uuid, p_weeks int default 26) returns numeric
language plpgsql stable security definer set search_path = wmto as $$
declare i int; s numeric; a numeric; tot numeric := 0; n int := 0; joined timestamptz;
begin
  select created_at into joined from members where id = p_member;
  if joined is null then return null; end if;
  for i in 0 .. greatest(1, least(p_weeks, 52)) - 1 loop
    if now() - make_interval(days => 7 * i) < joined then continue; end if;
    select sum(points), sum(max_points) into s, a from growth_scores(p_member, now() - make_interval(days => 7 * i));
    if coalesce(a, 0) > 0 then tot := tot + s / a * 100; n := n + 1; end if;
  end loop;
  return case when n > 0 then round(tot / n, 1) else null end;
end $$;

-- 만료 60일 이내인 사업가의 심사를 연다(운영진). 지원 기간이 끝난 보류 건은 2차 심사로 다시 연다.
create or replace function open_renewal_reviews() returns int
language plpgsql security definer set search_path = wmto as $$
declare r record; avg numeric; lvl text; sug text; rn int; opened int := 0;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if not is_admin() then raise exception 'forbidden'; end if;
  -- 지원 기간이 끝난 보류 건은 닫고 새 심사로 이어 간다
  update renewal_reviews set status = 'closed' where status = 'on_hold' and support_until <= current_date;
  for r in
    select m.id, m.term_end from members m
    where m.role = 'mentor' and m.status = 'active' and m.term_end <= current_date + 60
      and not exists (select 1 from renewal_reviews x where x.member_id = m.id and x.status in ('open', 'planned'))
      and not exists (select 1 from renewal_reviews x where x.member_id = m.id and x.status = 'on_hold' and x.support_until > current_date)
  loop
    avg := growth_avg(r.id, 26);
    lvl := growth_level(coalesce(avg, 0));
    select count(*) + 1 into rn from renewal_reviews where member_id = r.id and term_end = r.term_end;
    sug := case when lvl in ('lantern', 'canvas') then 'renew' when lvl = 'pole' then 'plan'
                when rn > 1 then 'not_renew' else 'hold' end;
    insert into renewal_reviews (member_id, term_end, round_no, avg_score, level, suggestion) values (r.id, r.term_end, rn, avg, lvl, sug);
    opened := opened + 1;
  end loop;
  return opened;
end $$;

-- 텐트장·운영진용 심사 목록 (회원 행을 직접 읽을 권한이 없어도 볼 수 있게 함수로 제공)
create or replace function renewal_queue() returns table (
  id uuid, member_id uuid, name text, business_name text, industry text, chapter_name text, term_end date, round_no int,
  avg_score numeric, level text, suggestion text, status text, plan text, leader_note text, appeal_note text, support_until date, created_at timestamptz)
language sql stable security definer set search_path = wmto as $$
  select r.id, r.member_id, m.name, mp.business_name, mp.industry, c.name, r.term_end, r.round_no, r.avg_score, r.level, r.suggestion,
         r.status, r.plan, r.leader_note, r.appeal_note, r.support_until, r.created_at
  from renewal_reviews r
  join members m on m.id = r.member_id
  left join mentor_profiles mp on mp.member_id = m.id
  left join chapters c on c.id = m.chapter_id
  where r.status in ('open', 'planned', 'on_hold', 'not_renewed') and r.created_at > now() - interval '12 months'
    and (is_admin() or (m.chapter_id is not null and is_chapter_leader(m.chapter_id)))
  order by case r.status when 'open' then 0 when 'planned' then 1 when 'on_hold' then 2 else 3 end, r.term_end;
$$;

-- 결정: renew(갱신) / plan(개선 계획 기록) / hold(90일 지원 후 재심사) / not_renew(미갱신, 운영진만)
create or replace function decide_renewal(p_id uuid, p_action text, p_note text default null, p_plan text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); r renewal_reviews; ch uuid; plan_text text;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  select * into r from renewal_reviews where id = p_id and status in ('open', 'planned') for update;
  if not found then raise exception 'not found'; end if;
  select chapter_id into ch from members where id = r.member_id;
  if not (is_admin() or (ch is not null and is_chapter_leader(ch))) then raise exception 'forbidden'; end if;
  if r.member_id = me and not is_admin() then raise exception 'cannot decide own review'; end if;
  plan_text := coalesce(nullif(btrim(coalesce(p_plan, '')), ''), r.plan);

  if p_action = 'plan' then
    if plan_text is null then raise exception 'plan required'; end if;
    update renewal_reviews set plan = left(plan_text, 2000), leader_note = nullif(left(btrim(coalesce(p_note, '')), 1000), ''), status = 'planned', decided_by = me, decided_at = now() where id = p_id;
  elsif p_action = 'renew' then
    -- 기준 이상이면 바로, 기둥 단계는 개선 계획이 있어야, 그 아래는 운영진이 사유를 남길 때만
    if r.suggestion = 'plan' and plan_text is null then raise exception 'plan required'; end if;
    if r.suggestion in ('hold', 'not_renew') and not (is_admin() and nullif(btrim(coalesce(p_note, '')), '') is not null) then raise exception 'admin note required'; end if;
    update renewal_reviews set status = 'renewed', plan = coalesce(left(plan_text, 2000), plan), leader_note = nullif(left(btrim(coalesce(p_note, '')), 1000), ''), decided_by = me, decided_at = now() where id = p_id;
    update members set term_end = (greatest(term_end, current_date) + interval '1 year')::date where id = r.member_id;
  elsif p_action = 'hold' then
    update renewal_reviews set status = 'on_hold', support_until = current_date + 90, leader_note = nullif(left(btrim(coalesce(p_note, '')), 1000), ''), decided_by = me, decided_at = now() where id = p_id;
  elsif p_action = 'not_renew' then
    if not is_admin() then raise exception 'admin only'; end if;
    update renewal_reviews set status = 'not_renewed', leader_note = nullif(left(btrim(coalesce(p_note, '')), 1000), ''), decided_by = me, decided_at = now() where id = p_id;
  else
    raise exception 'bad action';
  end if;
end $$;

-- 회원의 이의 신청(의견 남기기)
create or replace function renewal_appeal(p_note text) returns void
language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id();
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null then raise exception 'forbidden'; end if;
  update renewal_reviews set appeal_note = nullif(left(btrim(coalesce(p_note, '')), 1000), '')
   where id = (select id from renewal_reviews where member_id = me order by created_at desc limit 1);
end $$;

do $$
declare t text;
begin
  foreach t in array array['renewal_reviews'] loop
    execute format('drop policy if exists viewas_no_insert on %I', t);
    execute format('drop policy if exists viewas_no_update on %I', t);
    execute format('drop policy if exists viewas_no_delete on %I', t);
    execute format('create policy viewas_no_insert on %I as restrictive for insert with check (request_view_as() is null)', t);
    execute format('create policy viewas_no_update on %I as restrictive for update using (request_view_as() is null)', t);
    execute format('create policy viewas_no_delete on %I as restrictive for delete using (request_view_as() is null)', t);
  end loop;
end $$;

revoke all on function growth_avg(uuid, int) from public, anon, authenticated;
revoke all on function open_renewal_reviews() from public, anon;
revoke all on function renewal_queue() from public, anon;
revoke all on function decide_renewal(uuid, text, text, text) from public, anon;
revoke all on function renewal_appeal(text) from public, anon;
grant execute on function open_renewal_reviews() to authenticated;
grant execute on function renewal_queue() to authenticated;
grant execute on function decide_renewal(uuid, text, text, text) to authenticated;
grant execute on function renewal_appeal(text) to authenticated;
revoke insert, update, delete on renewal_reviews from anon, authenticated;
