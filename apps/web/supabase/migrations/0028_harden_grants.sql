-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
create schema if not exists wmto;
set search_path = wmto;

-- 점검에서 발견: 업종 목록·텐트장 표는 쓰기 정책이 운영진 전용(RLS)이지만, 기본 권한이 로그인 회원에게도 열려 있었다.
-- 이중 방어로 테이블 쓰기 권한 자체를 닫는다(운영진 화면은 서비스 키로 쓴다).
revoke insert, update, delete on chapter_leaders, industry_categories from authenticated, anon;
