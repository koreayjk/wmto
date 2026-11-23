# 데이터베이스 점검 (smoke.sql)

새 임시 데이터베이스에 `migrations/*.sql` 을 순서대로 적용한 뒤 실행합니다. 모든 데이터는 마지막에 되돌립니다(rollback).

```bash
# supabase 가 제공하는 auth 스키마가 없는 로컬 Postgres 에서는 먼저 최소 stub 이 필요합니다(auth.users, auth.uid(), 역할 anon/authenticated/service_role).
psql -v ON_ERROR_STOP=1 -d <db> -f apps/web/supabase/tests/smoke.sql
```

성공하면 `SMOKE OK` 가 출력됩니다. 새 기능을 추가할 때는 해당 흐름 한 단락을 이 파일에 더해 두세요.
권한(익명·일반 회원이 못 하는 것), 선교 권한, 소개·감사, 손님 유형, 학습·결석, 업종 변경, 첫 90일, 행사 신청, 모임 순서, 추천사, 소그룹, 월간 점검, 개인정보, 갱신 심사를 확인합니다.
