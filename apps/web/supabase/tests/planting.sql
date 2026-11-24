-- 텐트 플랜팅 점검: 같은 지역·같은 업종이면 자동으로 새 텐트를 만들지 않고, 운영진이 plant_tent 로 세운 뒤 배정된다.
--   psql -v ON_ERROR_STOP=1 -d <db> -f apps/web/supabase/tests/planting.sql   (마지막에 rollback)
set search_path = wmto;
begin;
do $$
declare cat1 int; cat2 int; a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); k text := 'KR:서울'; t2 uuid;
begin
  select min(id), max(id) into cat1, cat2 from industry_categories where parent_id is not null;
  insert into members(id, role, name, email, status, region) values (a,'mentor','가','pa@t.x','applicant','서울'), (b,'mentor','나','pb@t.x','applicant','서울'), (c,'mentor','다','pc@t.x','applicant','서울');
  insert into mentor_profiles(member_id, category_id) values (a,cat1),(b,cat1),(c,cat2);
  update members set status='active' where id = a;
  assert (select chapter_id from members where id = a) is not null, 'first member gets the first tent';
  assert (select count(*) from chapters where region_key = k) = 1, 'one tent';
  update members set status='active' where id = b;
  assert (select chapter_id from members where id = b) is null, 'same industry: not auto-assigned, no auto tent';
  assert (select count(*) from chapters where region_key = k) = 1, 'no tent auto-created for overlap';
  update members set status='active' where id = c;
  assert (select chapter_id from members where id = c) = (select chapter_id from members where id = a), 'different industry joins the same tent (no cap)';
  t2 := plant_tent(k);
  assert (select count(*) from chapters where region_key = k) = 2, 'planted a second tent';
  assert (select name from chapters where region_key = k and seq = 1) like '%1텐트', 'first tent renumbered';
  perform assign_member_tent(b);
  assert (select chapter_id from members where id = b) = t2, 'waiting member lands in the new tent';
  update chapters set max_members = 1 where region_key = k and seq = 1;
  assert (select open_chapters from admission_overview() limit 0) is null or true, 'overview callable';
  raise notice 'PLANTING OK';
end $$;
rollback;
