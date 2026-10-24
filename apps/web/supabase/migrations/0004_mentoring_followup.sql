-- 멘토링 기록에 후속 항목 추가: 다음에 할 것, 기도제목 (둘 다 선택 입력)
-- 기존 RLS 정책(당사자 조회, 담당 멘토만 작성·수정)이 새 컬럼에도 그대로 적용됩니다.
alter table mentoring_logs
  add column next_steps text check (next_steps is null or length(next_steps) <= 2000),
  add column prayer_topics text check (prayer_topics is null or length(prayer_topics) <= 2000);
