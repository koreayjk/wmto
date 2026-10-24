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
1. Supabase 프로젝트 생성 → SQL Editor에서 `apps/web/supabase/migrations/` 의 `0001_init.sql`, `0002_app_phase1.sql`, `0003_app_phase2.sql`, `0004_mentoring_followup.sql` 을 순서대로 실행
2. Auth에서 관리자 계정 생성 후 `insert into admins (user_id) values ('<auth user id>');`
3. `.env.local`에 URL / anon key / service role key 입력 (service role key는 서버 전용)

### 회원 앱 (WMTO Connect, PWA) — `/connect`
- 홈페이지와 같은 Next.js 프로젝트·같은 DB. 모바일 브라우저에서 "홈 화면에 추가"하면 앱처럼 설치됩니다.
- 1단계: 로그인·프로필, 모임 일정·출석, 멘토링 기록, 자립 리포트. 관리자는 `/admin/members`(승인·초대), `/admin/matchings`(매칭 배정).
- 2단계: 매칭 요청(선교사 → 사업가 수락 또는 관리자 배정), 리퍼럴, 감사 편지, 활동·성장(점수·단계 기록), 아카데미. 관리자는 `/admin/stages`(승급 제안 승인), `/admin/academy`, `/admin/matchings`(요청 배정).
- 승급은 단계 기준으로 자동 제안되고(`promotion_suggestions` 뷰) 관리자가 승인해야 반영됩니다(`admin_set_stage`, 이력 `stage_history`).
- 로그인은 이메일 링크 방식이며 승인된 회원만 가능합니다(자동 가입 없음).
- **Supabase 이메일 템플릿 설정 필수** (Authentication → Email Templates). 링크를 다른 기기에서 열어도 동작하도록 아래 형태로 바꿔 주세요.
  - Invite user: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/connect`
  - Magic Link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/connect`
  - Site URL 은 실제 배포 주소(`NEXT_PUBLIC_SITE_URL` 과 동일)로 설정
- 회의 링크(`events.meeting_url`)는 로그인한 회원에게만 보입니다(익명 방문자는 컬럼 권한으로 차단).

Supabase 설정 없이도 정적 페이지는 모두 표시되며, 일정·스토리는 빈 목록, 신청 폼 제출은 오류로 처리됩니다.

## 언어 (한국어 / English)

- 공개 사이트: 한국어는 주소에 접두사가 없고(`/about`), 영어는 `/en` 으로 시작합니다(`/en/about`). `proxy.ts` 가 한국어 주소를 내부적으로 `/ko/...` 로 연결합니다.
- 회원 앱(`/connect`)은 쿠키 `wmto-locale` 로 언어를 정합니다. 공개 사이트에서 마지막으로 본 언어가 이어지고, 앱의 프로필 화면에서 바꿀 수 있습니다.
- 관리자(`/admin`)는 항상 한국어입니다.
- 문구는 `apps/web/messages/ko.ts`(기준)와 `en.ts`(같은 구조, 컴파일러가 누락을 잡아 줍니다)에 있습니다. 영어는 작업용 번역이므로 출시 전에 원어민 검수가 필요합니다.
- 새 페이지를 추가할 때: 문구를 두 카탈로그에 추가하고, 페이지는 `params` 의 `locale` 로 `getMessages(locale)` 를 부르며, 링크는 `components/L.tsx` 를 거칩니다.

## 교체 지점
- 문구: `apps/web/messages/ko.ts` (영어는 `en.ts` 추가 후 `lib/i18n.ts` 등록)
- 사진: `apps/web/lib/photos.ts` 에 `public/images/` 경로를 채우면 전 페이지 반영
- 개인정보 처리방침: `apps/web/app/privacy/page.tsx` (현재 초안)
