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
1. Supabase 프로젝트 생성 → SQL Editor에서 `apps/web/supabase/migrations/` 의 `0001_init.sql`, `0002_app_phase1.sql` 을 순서대로 실행
2. Auth에서 관리자 계정 생성 후 `insert into admins (user_id) values ('<auth user id>');`
3. `.env.local`에 URL / anon key / service role key 입력 (service role key는 서버 전용)

### 회원 앱 (WMTO Connect, PWA) — `/connect`
- 홈페이지와 같은 Next.js 프로젝트·같은 DB. 모바일 브라우저에서 "홈 화면에 추가"하면 앱처럼 설치됩니다.
- 1단계: 로그인·프로필, 모임 일정·출석, 멘토링 기록, 자립 리포트. 관리자는 `/admin/members`(승인·초대), `/admin/matchings`(매칭 배정).
- 로그인은 이메일 링크 방식이며 승인된 회원만 가능합니다(자동 가입 없음).
- **Supabase 이메일 템플릿 설정 필수** (Authentication → Email Templates). 링크를 다른 기기에서 열어도 동작하도록 아래 형태로 바꿔 주세요.
  - Invite user: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/connect`
  - Magic Link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/connect`
  - Site URL 은 실제 배포 주소(`NEXT_PUBLIC_SITE_URL` 과 동일)로 설정
- 회의 링크(`events.meeting_url`)는 로그인한 회원에게만 보입니다(익명 방문자는 컬럼 권한으로 차단).

Supabase 설정 없이도 정적 페이지는 모두 표시되며, 일정·스토리는 빈 목록, 신청 폼 제출은 오류로 처리됩니다.

## 교체 지점
- 문구: `apps/web/messages/ko.ts` (영어는 `en.ts` 추가 후 `lib/i18n.ts` 등록)
- 사진: `apps/web/lib/photos.ts` 에 `public/images/` 경로를 채우면 전 페이지 반영
- 개인정보 처리방침: `apps/web/app/privacy/page.tsx` (현재 초안)
