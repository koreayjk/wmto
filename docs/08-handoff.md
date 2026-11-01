# WMTO 인수인계 (새 세션용)

> 이 문서만 읽으면 이어서 작업할 수 있도록 정리했습니다. 먼저 `docs/00`~`07`과 이 문서를 읽으세요.

## 1. 한눈에
- **WMTO** (Work Mission Tentmaking Organization, 자립선교 비즈니스 네트워크): 크리스천 사업가(Mentor)가 선교사(Partner)를 가르치고 동행해 자립을 돕고, 후원자(Sponsor)가 재정으로 길을 엽니다. 표어 *More Blessed to Give*.
- **공개 사이트 + 회원 앱 "WMTO Connect"(PWA)**. 한국어(주소 접두사 없음)·영어(`/en`).
- 운영 주소: https://wmto.vercel.app · 체험: https://wmto.vercel.app/connect/demo · 회원 로그인: /connect/login · 관리자: /admin
- 저장소 `koreayjk/wmto`, 앱은 `apps/web`. **`main`에 바로 푸시**합니다(PR 요청 없으면 만들지 않음). 사용자는 한국어로 대화합니다.

## 2. 기술
Next.js 16 App Router(`proxy.ts`), React 19, Tailwind v4, `@supabase/ssr`, zod, phosphor 아이콘.
- 라우트: `app/(site)/[locale]/(pages)` 공개, `app/(portal)/connect|admin|auth` 앱.
- 언어: 공개는 주소, 앱은 쿠키 `wmto-locale`(`x-locale` 헤더). 문구는 `messages/ko.ts`(기준 타입)·`en.ts` — **한쪽만 고치면 `tsc`가 실패**하므로 항상 둘 다.
- 화면 글꼴(Connect·관리자): IBM Plex Sans KR 고딕(본문·제목·숫자), 편지 서명만 Nanum Pen Script. 공개 사이트는 Pretendard.

## 3. 인프라 (사용자 계정)
- **Supabase**: 조직 `imamerica2414`, 프로젝트 **`svm`**(id `uafdrygbaloqffhwcebc`, **us-west-2 오리건**)을 선교 파송 앱 SVM과 **공유**. WMTO는 별도 스키마 **`wmto`**(Exposed schemas에 `wmto` 추가됨). 같은 조직에 도쿄(ap-northeast-1) 프로젝트 `lifememory`, `imcms`도 있음. Supabase MCP 커넥터가 연결돼 있어 읽기 확인 가능(이 세션에서는 변경 안 함).
- **Vercel**: Function Region을 `pdx1`(Portland)로 맞춤(예전 iad1에서 느렸음). 아시아 사용자가 많으므로 장기적으로는 **서울/도쿄 새 Supabase 프로젝트 + Vercel `icn1`/`hnd1`** 이전을 권했고 일정 미정. 둘 중 하나만 옮기면 느려지니 반드시 같이.
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용), `NEXT_PUBLIC_SITE_URL`, 선택 `DEMO_ACCOUNT_EMAIL`(기본 `wmto-demo@example.com`).
- **절대 금지**: service_role 키·인증코드·토큰을 대화에 요구하거나 받지 않기. SVM의 Site URL 바꾸지 않기. 이메일 로그인 템플릿은 `.Data.wmto_member`로 분기하고 SVM 템플릿은 `else`로 보존.
- SQL은 사용자가 Supabase SQL Editor에서 직접 실행합니다. 새 마이그레이션을 만들면 **번호·실행 순서·데모 재시드 여부를 사용자에게 명확히** 알리세요(코드가 새 컬럼을 읽으면 SQL 실행 전엔 앱이 깨질 수 있음).

## 4. 데이터베이스 (마이그레이션 `apps/web/supabase/migrations`)
순서대로 0001~0013 모두 사용자 DB에 **적용 완료**(0013까지 실행했다고 확인받음).
| 번호 | 내용 |
|---|---|
| 0001 | 기본 표(회원·프로필·신청·일정·스토리) |
| 0002–0004 | 앱 1·2단계(출석·매칭·멘토링·리포트·리퍼럴·감사 편지·아카데미), 멘토링 후속 |
| 0005 | 후원자: `donations`, `fund_loans`, RPC `sponsor_*`, `fund_overview` |
| 0006 | 관리자 읽기 전용 "회원 화면 보기"(`x-wmto-view-as` 헤더) |
| 0007 | 공개 데모 계정(`demo_viewers`), 쓰기 차단 제한형 정책 |
| 0008 | `mentor_directory` 확장 |
| 0009 | 텐트: `tent_posts`, `my_tents`, `tent_overview`(`chapters`=텐트) |
| 0010 | 텐트 2단계: `tent_welcome`(모시기) / `accept_matching_request`(멘토 맡기, 다른 텐트 선교사 거부) |
| 0011 | 지역별 텐트 자동 배정(`members.region/district`, 트리거, 12명 초과 시 분할) |
| 0012 | 사업가 찾기 지역 분류 |
| 0013 | 증명사진(`photo_url`, Storage 버킷 `wmto-avatars`), 멘토링 공유(`shared`, `mentoring_feed`) |

핵심 개념
- RLS 헬퍼: `current_member_id()`, `current_member_role()`, `is_admin()`. 쓰기 RPC는 `request_view_as()`가 있으면 거부.
- **텐트**: 한국은 시·도(서울·경기도·충남·충북·강원·전남·전북·경남·경북·제주 + 부산·대구·인천·광주·대전·울산·세종), 해외는 나라별. 사업가·후원자는 지역 정보로 자동 입장, **사업가 12명 초과 시 시·군·구 기준으로 둘로 분할**(이름 `서울 1텐트`, `서울 2텐트`…). 선교사는 지역 무관 — 사업가가 **"우리 텐트로 모시기"(1단계)** 하면 텐트원이 되고, 텐트원 중 원하는 사업가가 **"멘토로 함께하기"(2단계)** 로 1:1 동행 시작. 데모 회원은 `[데모]` 접두 별도 텐트.
- **멘토링 기록은 기본 공유**(`shared=true`), 끄면 쓴 멘토와 그 선교사만.

## 5. 데모 데이터 (`apps/web/supabase/demo`)
- `seed_demo.sql`: 사업가 100·선교사 50(전 세계)·후원자 30·신청자 8 + 매칭·멘토링 540건·리퍼럴 ~410·편지·후원·순환 기금·텐트 모임/공지·증명사진 12명(`public/people`). 대표 3명: **김은혜(사업가)·이소망(선교사)·최은성(후원자)**, 이메일 `demo.showcase.*@demo.wmto.invalid`.
- 재적용: `clear_demo.sql` → `seed_demo.sql`(삭제 기준: 이메일 `@demo.wmto.invalid`, 제목 `[데모]`). 실제 사용 전엔 clear만.
- 체험 모드(`/connect/demo`): 비밀번호 없이 서버가 `generateLink`+`verifyOtp`로 데모 계정 세션 생성, 가상 회원 시점의 **읽기 전용**(앱 `viewOnlyFetch` + DB 제한형 정책). 위 막대로 사업가·선교사·후원자 전환. 저장 버튼은 안내만 뜸(`DemoGuard`).
- **주의**: 데모 인증 사용자가 SVM과 같은 프로젝트의 실제 auth 사용자. SVM 표 RLS가 "아무 로그인 사용자 허용"이면 위험 → **보안 점검 미실시**(다음 작업 후보).

## 6. 디자인 시스템
- 밝고 흰·럭셔리 톤, 이중 베젤 카드(`.cbezel/.cbezel-in`), 금색 소제목(`.gilt`, 영문 대문자 eyebrow), 가는 선 목록(`divide-y`), 알약 버튼(`.cbtn`), 사진 배경 장면(`public/scenes/*.jpg`, `ContentFrame`의 `SCENES` 경로 매핑, 전체 화면 고정 + 크림 베일, `.tent-theme` 반투명 카드, **어두운 카드(`.dark`)는 제외**).
- 헤더는 컴퓨터에서 오른쪽 위에 띄움(`lg:absolute`) → 내용이 위에서 시작. 사이드바는 `z-20`(장면보다 위).
- 공개 홈에 **WMTO Connect 소개 섹션**(`components/ConnectShowcase.tsx`, 스크린샷 `public/images/connect-*.jpg`)과 헤더/푸터/모바일 메뉴의 "앱 체험·회원 로그인" 링크.
- 이미지 생성(Higgsfield MCP)으로 만든 장면·인물 사진을 사용(모델 `kling_omni_image` 2k, `nano_banana`).

## 7. 로컬 검증 방법 (임시 도구는 저장소에 두지 않음)
- 로컬 Postgres 16(`/tmp/pgd`, 소켓 `/tmp/pgd/sock`, 포트 5439)에 마이그레이션 0001~0013 + 시드를 적용해 RLS·함수 시험(권한 테스트 161개 통과). 세션이 바뀌면 사라지므로 필요하면 다시 구성.
- 화면 확인: Playwright(`require('playwright')`)로 스크린샷. Supabase 없이 보려면 **임시로** `lib/supabase/server.ts`에 가짜 클라이언트(로컬 DB 직결)를 끼우고 **작업 후 `git checkout lib/supabase/server.ts`로 반드시 되돌리기**(커밋 금지). `next dev` 포트 3100, 끝나면 `fuser -k 3100/tcp; rm -rf .next AGENTS.md`.
- 함정: Tailwind `whitespace-nowrap`이 이 프로젝트에서 적용 안 된 적 있음 → 인라인 `style={{whiteSpace:"nowrap"}}`. `.display`에 `white-space: pre-line` 있음. 포스트그레스 pid 파일을 지우면 서버가 죽음.

## 8. 사용자 선호
- 한국어 응답, 간결하게, 결과 먼저. 밝고 깨끗하고 고급스러운 디자인(최근 요청: 고딕체, 메뉴 글씨 진하게, 페이지가 위에서 시작, 사진은 더 고급스럽게).
- 배포 후 사용자가 캡처를 보내 주면 그것을 기준으로 고침. 스크린샷이 안 올라오면 다시 요청.

## 9. 남은 일 / 아이디어
1. **보안 점검**: Supabase 보안·성능 경고 확인, 체험 계정이 SVM 표(`public.*`)에 접근 못 하는지 확인. 불안하면 WMTO만 새 프로젝트로 분리.
2. **지역 이전**: 서울(또는 도쿄·싱가포르) 새 Supabase 프로젝트로 `wmto` 스키마 이전 + Vercel 지역 동일화. 체크리스트 작성 약속(미작성).
3. **실제 회원으로 전체 흐름 한 번** 돌려 보기: 신청 → 관리자 승인 → 이메일 로그인 → 텐트 자동 배정 → 사진 업로드(버킷 `wmto-avatars` 확인) → 멘토링 기록.
4. **후원 결제·기부금 영수증**(3단계): 현재는 "후원 상담 문의" 폼 → 운영진이 `/admin/donations`에서 수동 입력. 홈페이지에 후원 계좌 안내를 먼저 넣을지, 토스/포트원(국내)·Stripe(해외) 연동을 기획할지 사용자 결정 대기.
5. 영어 문구 원어민 검수, 영어용 스크린샷, 홈/내 정보 화면에도 배경 장면 적용 여부.
6. 사용자가 외부 AI/사람에게 앱 아이디어를 받는 중 → 받은 아이디어를 정리해 우선순위화.
7. BNI Connect 분석에서 보류한 항목: 참관자 초대, 첫 30일 체크리스트, 감사 편지 개편 등(`docs/04`).
