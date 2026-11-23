-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- CBC 8단계: 텐트장 대시보드 (docs/13). 텐트 건강 지표, 회원 현황, 비어 있는 업종.
-- 텐트장·부텐트장과 운영진만 호출할 수 있다. 회원 점수는 리더에게만 보이고, 회원 본인은 자기 점수를 본다.
create or replace function chapter_dashboard(p_chapter uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare
  since timestamptz := now() - interval '90 days';
  weeks numeric := 90 / 7.0;
  n int; newm int; due int; ev int; att int; refs int; o2o int; vinv int; vatt int; vjoin int;
  open_cats jsonb; mem jsonb; lv jsonb; cname text;
begin
  if not (is_admin() or is_chapter_leader(p_chapter)) then raise exception 'forbidden'; end if;
  select name into cname from chapters where id = p_chapter;
  if cname is null then raise exception 'not found'; end if;

  select count(*) into n from members where chapter_id = p_chapter and role = 'mentor' and status = 'active';
  select count(*) into newm from members where chapter_id = p_chapter and role = 'mentor' and status = 'active' and created_at >= now() - interval '180 days';
  select count(*) into due from members where chapter_id = p_chapter and role = 'mentor' and status = 'active' and term_end <= current_date + 60;
  select count(*) into ev from events where chapter_id = p_chapter and start_at >= since and start_at < now();
  select count(*) into att from attendance a join events e on e.id = a.event_id join members m on m.id = a.member_id
   where e.chapter_id = p_chapter and e.start_at >= since and e.start_at < now() and m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active';
  select count(*) into refs from referrals r join members m on m.id = r.giver_id
   where m.chapter_id = p_chapter and m.status = 'active' and r.created_at >= since;
  select count(*) into o2o from one_to_ones o join members m on m.id = o.member_a
   where m.chapter_id = p_chapter and o.status = 'confirmed' and o.held_at >= since;
  select count(*) filter (where created_at >= since), count(*) filter (where status in ('attended', 'joined') and attended_at >= since), count(*) filter (where status = 'joined' and attended_at >= since)
    into vinv, vatt, vjoin from visitors where chapter_id = p_chapter;

  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name_ko, 'group', g.name_ko) order by g.sort, c.sort, c.id), '[]'::jsonb) into open_cats
    from industry_categories c join industry_categories g on g.id = c.parent_id
   where c.active and not exists (
     select 1 from members m join mentor_profiles p on p.member_id = m.id
      where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active' and p.category_id = c.id);

  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'term_end', x.term_end, 'total', x.total, 'level', growth_level(x.total), 'weakest', x.weakest) order by x.total, x.name), '[]'::jsonb) into mem
    from (
      select m.id, m.name, m.term_end,
             coalesce(round((select sum(points) / nullif(sum(max_points), 0) * 100 from growth_scores(m.id))), 0) as total,
             (select k from growth_scores(m.id) order by points / max_points, k limit 1) as weakest
        from members m where m.chapter_id = p_chapter and m.role = 'mentor' and m.status = 'active') x;

  select jsonb_build_object(
    'peg', count(*) filter (where (e->>'level') = 'peg'), 'pole', count(*) filter (where (e->>'level') = 'pole'),
    'canvas', count(*) filter (where (e->>'level') = 'canvas'), 'lantern', count(*) filter (where (e->>'level') = 'lantern'))
    into lv from jsonb_array_elements(mem) e;

  return jsonb_build_object(
    'chapter', cname, 'size', n, 'cap', tent_cap(), 'new_members_6m', newm, 'renewal_due', due,
    'meetings', ev, 'attendance_rate', case when ev > 0 and n > 0 then round(att::numeric / (ev * n), 3) else null end,
    'referrals_per_member_week', case when n > 0 then round(refs / n / weeks, 2) else null end,
    'one_to_one_per_member_week', case when n > 0 then round(o2o * 2 / n / weeks, 2) else null end,
    'visitors_invited', vinv, 'visitors_attended', vatt, 'visitors_joined', vjoin,
    'conversion', case when vatt > 0 then round(vjoin::numeric / vatt, 2) else null end,
    'levels', lv, 'members', mem, 'open_categories', open_cats);
end $$;

revoke all on function chapter_dashboard(uuid) from public, anon;
grant execute on function chapter_dashboard(uuid) to authenticated;
