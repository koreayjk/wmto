-- WMTO 데모 데이터 한 번에 지우기
-- 실행하면 seed_demo.sql 이 만든 모든 가상 데이터(회원, 매칭, 기록, 일정, 스토리, 영상 등)가 사라집니다.
-- 실제 회원과 실제 신청서는 지워지지 않습니다. (데모 데이터는 이메일이 @demo.wmto.invalid 이거나 제목이 [데모] 로 시작합니다.)
set search_path = wmto;

-- 먼저 데모 일정에 붙은 출석 기록과 영상 연결이 정리되도록 일정부터 지웁니다.
delete from academy_videos where title like '[데모]%';
delete from stories        where title like '[데모]%';
delete from events         where title like '[데모]%';

-- 멘토링 기록은 작성자(created_by) 연결 때문에 회원보다 먼저 지워야 합니다.
delete from mentoring_logs
where created_by in (select id from members where email like '%@demo.wmto.invalid')
   or matching_id in (select id from matchings
                      where mentor_id  in (select id from members where email like '%@demo.wmto.invalid')
                         or partner_id in (select id from members where email like '%@demo.wmto.invalid'));

-- 데모 회원을 지우면 프로필, 신청서, 매칭, 멘토링 기록, 자립 리포트, 리퍼럴, 감사 편지, 성장 이력, 출석이 함께 지워집니다.
delete from members        where email like '%@demo.wmto.invalid';

delete from chapters       where name like '[데모]%';

-- 실제 선교사 화면을 채우려고 넣은 자립 리포트(내용이 [데모] 로 시작)도 지웁니다.
delete from self_reports   where difficulties like '[데모]%';

-- 확인: 아래 두 숫자가 모두 0 이어야 합니다.
select
  (select count(*) from members where email like '%@demo.wmto.invalid') as demo_members_left,
  (select count(*) from events  where title like '[데모]%')              as demo_events_left;
