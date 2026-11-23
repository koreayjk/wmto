-- 로컬 데이터베이스 회귀 점검: 모든 마이그레이션을 적용한 새 DB에서 실행하고, 마지막에 되돌린다(rollback).
--   psql -v ON_ERROR_STOP=1 -d <db> -f apps/web/supabase/tests/smoke.sql
-- 한 줄이라도 assert 가 실패하면 오류로 멈춘다. 흐름: 권한 → 선교 권한 → 소개·감사 → 1:1·손님 → 학습·결석 →
-- 갱신 심사 → 업종 변경 → 첫 90일 → 행사 신청 → 모임 순서 → 추천사 → 소그룹 → 점검 기록 → 알림.
set search_path = wmto;
begin;

insert into auth.users(id) values ('00000000-0000-0000-0000-00000000a001'), ('00000000-0000-0000-0000-00000000b001'), ('00000000-0000-0000-0000-00000000c001'), ('00000000-0000-0000-0000-00000000d001');
insert into chapters(id, name) values ('00000000-0000-0000-0000-0000000000c1', 'T');
insert into admins(user_id) values ('00000000-0000-0000-0000-00000000d001');
insert into members (id, role, name, email, status, auth_user_id, chapter_id, created_at, term_end) values
  ('00000000-0000-0000-0000-0000000000a1', 'mentor', '새회원', 'a@t.x', 'active', '00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-0000000000c1', now() - interval '10 days', current_date + 20),
  ('00000000-0000-0000-0000-0000000000b1', 'mentor', '리더', 'b@t.x', 'active', '00000000-0000-0000-0000-00000000b001', '00000000-0000-0000-0000-0000000000c1', now() - interval '300 days', current_date + 300),
  ('00000000-0000-0000-0000-0000000000c9', 'mentor', '동료', 'c@t.x', 'active', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-0000000000c1', now() - interval '200 days', current_date + 200);
insert into mentor_profiles(member_id) values ('00000000-0000-0000-0000-0000000000a1'), ('00000000-0000-0000-0000-0000000000b1'), ('00000000-0000-0000-0000-0000000000c9');
insert into chapter_leaders(chapter_id, member_id) values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1');
update members set mission_status = 'none';
insert into events(id, type, title, start_at, chapter_id, learning_units, capacity, min_people, signup_deadline) values
  ('00000000-0000-0000-0000-0000000000e1', 'online', '다음 모임', now() + interval '3 days', '00000000-0000-0000-0000-0000000000c1', 2, 5, 2, now() + interval '2 days'),
  ('00000000-0000-0000-0000-0000000000e2', 'online', '지난 모임', now() - interval '3 days', '00000000-0000-0000-0000-0000000000c1', 0, null, null, null);

-- 테스트용 도우미: 회원으로 전환
create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', u::text, true);
  execute 'set local role authenticated';
end $$;
create or replace function pg_temp.fails(sql text) returns boolean language plpgsql as $$
begin execute sql; return false; exception when others then return true; end $$;

do $$
declare A uuid := '00000000-0000-0000-0000-00000000a001'; B uuid := '00000000-0000-0000-0000-00000000b001'; C uuid := '00000000-0000-0000-0000-00000000c001'; D uuid := '00000000-0000-0000-0000-00000000d001';
  ma uuid := '00000000-0000-0000-0000-0000000000a1'; mb uuid := '00000000-0000-0000-0000-0000000000b1'; mc uuid := '00000000-0000-0000-0000-0000000000c9';
  ch uuid := '00000000-0000-0000-0000-0000000000c1'; e1 uuid := '00000000-0000-0000-0000-0000000000e1'; e2 uuid := '00000000-0000-0000-0000-0000000000e2';
  rid uuid; x jsonb; n int; cat1 int; cat2 int;
begin
  -- 0. 권한: 익명/일반 회원은 내부 함수·쓰기 불가
  perform pg_temp.as_user(A);
  assert pg_temp.fails($q$select growth_scores('00000000-0000-0000-0000-0000000000a1')$q$), 'growth_scores must be closed';
  assert pg_temp.fails($q$insert into chapter_leaders(chapter_id, member_id) values ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000a1')$q$), 'members must not write leaders';
  assert pg_temp.fails($q$select create_circle('00000000-0000-0000-0000-0000000000c1','x')$q$), 'non-leader cannot create circle';
  assert pg_temp.fails($q$select chapter_dashboard('00000000-0000-0000-0000-0000000000c1')$q$), 'non-leader cannot see dashboard';

  -- 1. 선교 권한: 신청 → 텐트장 승인
  assert not has_mission_access(), 'no mission access at first';
  perform request_mission('열정');
  assert pg_temp.fails($q$select request_mission('again')$q$), 'duplicate mission request';
  perform pg_temp.as_user(B);
  assert (select count(*) from pending_mission_requests()) = 1, 'leader sees pending';
  perform decide_mission_request((select id from pending_mission_requests() limit 1), true);
  perform pg_temp.as_user(A);
  assert has_mission_access(), 'mission access after approval';

  -- 2. 소개 → 성사 → 감사
  insert into referrals(giver_id, receiver_id, client_name, warmth, pre_contacted) values (ma, mb, '고객', 3, true) returning id into rid;
  perform pg_temp.as_user(B);
  assert pg_temp.fails(format('select give_gratitude(%L,%L)', rid, '아직')), 'gratitude before won';
  update referrals set status = 'won' where id = rid;
  perform give_gratitude(rid, '감사합니다');
  assert pg_temp.fails(format('select give_gratitude(%L,%L)', rid, '두번')), 'gratitude twice';
  perform pg_temp.as_user(A);
  assert (select count(*) from notifications where kind in ('referral_won', 'gratitude_received')) = 2, 'referral notifications';

  -- 3. 1:1 확인, 손님 유형, 중복 방지
  perform invite_visitor('손님', '010-1', null, null, null);
  assert pg_temp.fails($q$select invite_visitor('손님2','010-1',null,null,null)$q$), 'duplicate visitor contact';
  perform invite_visitor('대신', null, null, null, null, 'substitute', mb);
  assert pg_temp.fails($q$select invite_visitor('x',null,null,null,null,'substitute',null)$q$), 'substitute needs target';
  perform pg_temp.as_user(B);
  perform set_visitor_status((select id from visitors where name = '손님'), 'attended');
  perform pg_temp.as_user(A);
  assert (my_activity(90)->>'visitors')::int = 1, 'only guests counted';

  -- 4. 학습 기록과 결석 알림
  perform log_learning('scripture', 2, current_date, '말씀');
  assert pg_temp.fails($q$select log_learning('book', 1, current_date + 3)$q$), 'future learning date';
  perform notify_absence(e1, 'health', '감기');
  assert pg_temp.fails(format('select notify_absence(%L, %L)', e2, 'other')), 'past event absence notice';
  assert (select count(*) from absence_notices) = 1, 'absence recorded';
  perform pg_temp.as_user(B);
  assert (select count(*) from notifications where kind = 'absence_notice') = 1, 'leader notified of absence';

  -- 5. 행사 신청(정원·마감)
  perform pg_temp.as_user(A);
  perform signup_event(e1);
  assert (select signups from event_signup_summary() where event_id = e1) = 1, 'signup counted';
  perform cancel_signup(e1);

  -- 6. 점수·돌봄·대시보드
  assert jsonb_array_length(my_growth()->'items') = 7, 'seven growth items';
  perform pg_temp.as_user(B);
  x := chapter_dashboard(ch);
  assert (x->>'size')::int = 3, 'dashboard size';
  assert jsonb_typeof(chapter_watchlist(ch)->'absence') = 'array', 'watchlist';

  -- 7. 업종 변경: 처음 설정은 직접, 이후 신청→승인
  select min(id), max(id) into cat1, cat2 from industry_categories where parent_id is not null;
  perform pg_temp.as_user(A);
  perform set_first_category(cat1);
  assert pg_temp.fails(format('select set_first_category(%s)', cat2)), 'first category only once';
  assert pg_temp.fails(format('update mentor_profiles set category_id = %s where member_id = %L', cat2, ma)), 'direct category update is closed';
  perform request_category_change(cat2, '바꾸고 싶어요');
  perform pg_temp.as_user(B);
  perform decide_category_change((select id from pending_category_changes() limit 1), true);
  perform pg_temp.as_user(A);
  assert (select category_id from mentor_profiles where member_id = ma) = cat2, 'category changed after approval';
  -- 같은 텐트에 같은 업종 거부
  perform pg_temp.as_user(C);
  assert pg_temp.fails(format('select set_first_category(%s)', cat2)), 'category exclusive per tent';

  -- 8. 첫 90일 동행
  perform pg_temp.as_user(B);
  perform assign_companion(ma, mc);
  assert jsonb_array_length(chapter_newcomers(ch)) = 1, 'newcomer listed';
  perform pg_temp.as_user(A);
  assert (my_first90()->>'buddy_name') = '동료', 'buddy name';
  assert jsonb_array_length(my_first90()->'steps') = 7, 'seven steps';

  -- 9. 모임 순서와 발표자
  perform pg_temp.as_user(B);
  perform save_meeting_plan(e1, '[{"key":"welcome","minutes":10,"owner":null}]'::jsonb, mc, '소명');
  assert pg_temp.fails(format('select save_meeting_plan(%L, %L::jsonb, %L, null)', e1, '[]', '00000000-0000-0000-0000-0000000000ff')), 'bad speaker rejected';
  perform pg_temp.as_user(C);
  assert (get_meeting_plan(e1)->>'featured_name') = '동료', 'member sees plan';
  assert not (get_meeting_plan(e1)->>'can_edit')::boolean, 'member cannot edit';

  -- 10. 추천사(함께 일한 사이만) 와 공개 결정
  perform pg_temp.as_user(A);
  assert pg_temp.fails(format('select write_testimonial(%L, %L)', mc, '함께 일하지 않은 분입니다 추천')), 'testimonial needs shared work';
  perform pg_temp.as_user(B);
  perform write_testimonial(ma, '성실하고 약속을 잘 지키는 분입니다.');
  perform pg_temp.as_user(C);
  assert (select count(*) from tent_testimonials()) = 0, 'unpublished hidden';
  perform pg_temp.as_user(A);
  perform decide_testimonial((select id from testimonials limit 1), true);
  perform pg_temp.as_user(C);
  assert (select count(*) from tent_testimonials()) = 1, 'published visible to tent';

  -- 11. 소그룹
  perform pg_temp.as_user(B);
  perform create_circle(ch, '소그룹');
  rid := (select id from circles limit 1);
  perform add_circle_member(rid, ma);
  perform add_circle_member(rid, mc);
  assert pg_temp.fails(format('select add_circle_member(%L, %L)', rid, ma)), 'one circle per member';
  perform pg_temp.as_user(A);
  perform post_circle(rid, '소개 기회');
  perform pg_temp.as_user(B);
  assert (select count(*) from my_circle_posts(rid)) = 0, 'non-member cannot read circle posts';

  -- 12. 월간 점검 기록: 시작→저장→제출→잠금
  rid := start_tent_review(ch);
  assert pg_temp.fails(format('select submit_tent_review(%L)', rid)), 'submit needs taker and date';
  perform save_tent_review(rid, current_date, mc, '{"meeting":"좋았다"}'::jsonb, '[{"text":"안부","done":false}]'::jsonb);
  perform submit_tent_review(rid);
  assert pg_temp.fails(format('select save_tent_review(%L, current_date, null, %L::jsonb, %L::jsonb)', rid, '{}', '[]')), 'locked after submit';

  -- 13. 내 정보 권리
  perform pg_temp.as_user(A);
  assert (export_my_data()->'member'->>'name') = '새회원', 'export';
  perform request_deletion('테스트');
  assert (select count(*) from deletion_requests) = 1, 'deletion requested';

  -- 14. 운영진: 갱신 심사 열기와 결정
  perform pg_temp.as_user(D);
  n := open_renewal_reviews();
  assert n >= 1, 'renewal reviews opened';
  perform pg_temp.as_user(A);
  assert (select count(*) from notifications where kind = 'renewal_open') = 1, 'member notified of renewal';
  perform pg_temp.as_user(B);
  assert pg_temp.fails(format('select decide_renewal(%L, %L)', (select id from renewal_queue() limit 1), 'not_renew')), 'leader cannot not_renew';

  raise notice 'SMOKE OK';
end $$;

rollback;
