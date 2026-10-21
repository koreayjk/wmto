# WMTO 자립선교 비즈니스 네트워크

홈페이지(1단계)와 회원 앱(2단계)을 한 저장소에서 개발합니다.

- `docs/00-wmto-overview.md` — 공통 기준 문서 (용어·금액·단계, 충돌 시 우선)
- `docs/01-website.md` — 홈페이지 개발 브리프
- `apps/web` — Next.js(App Router) + TypeScript + Tailwind v4 홈페이지
- `apps/web/supabase/migrations` — 앱과 공유할 DB 스키마

## 시작하기

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # Supabase 키 입력
npm run dev                                     # http://localhost:3000
```

### Supabase 설정
1. Supabase 프로젝트 생성 → SQL Editor에서 `apps/web/supabase/migrations/0001_init.sql` 실행
2. Auth에서 관리자 계정 생성 후 `insert into admins (user_id) values ('<auth user id>');`
3. `.env.local`에 URL / anon key / service role key 입력 (service role key는 서버 전용)

Supabase 설정 없이도 정적 페이지는 모두 표시되며, 일정·스토리는 빈 목록, 신청 폼 제출은 오류로 처리됩니다.

## 교체 지점
- 문구: `apps/web/messages/ko.ts` (영어는 `en.ts` 추가 후 `lib/i18n.ts` 등록)
- 사진: `apps/web/lib/photos.ts` 에 `public/images/` 경로를 채우면 전 페이지 반영
- 개인정보 처리방침: `apps/web/app/privacy/page.tsx` (현재 초안)
