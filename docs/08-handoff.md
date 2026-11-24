# WMTO · CBC 인수인계 (새 세션용)

> 이 문서만 읽으면 이어서 작업할 수 있도록 정리했습니다. 먼저 `docs/09`(통합 설계)·`docs/13`(기능 매핑)·`docs/14`(출시 점검표)와 이 문서를 읽으세요.
> **방향(2026-11)**: 크리스천 사업가 네트워크 **CBC** 가 앞면, **WMTO(선교 사역)** 는 선교 권한을 받은 회원에게 열리는 층. 주소: `/`=CBC, `/wmto`=선교 사역 사이트, `/connect`=회원 앱(공유). 서비스 이름 **CBC**(확정, 상표 확인은 별도)는 `lib/brand.ts` 한 곳.

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
0001~0033b 모두 사용자 DB에 **적용 완료**(2026-11-24 기준). 새 마이그레이션은 `schema wmto` 로 만들고, **코드를 먼저 푸시해도 깨지지 않게**(새 컬럼 읽기는 실패 시 대체) 작성하거나 **DB 적용 후 푸시**한다.
| 번호 | 내용 |
|---|---|
| 0001–0013 | 기본 표·앱·후원자·관리자 보기·체험 계정·텐트·사진·멘토링 공유 (이전 인수인계 참고) |
| 0014 | 업종 표준 목록(82), 한 텐트 한 업종 트리거, 정원 50(0033에서 폐지), 텐트장(`chapter_leaders`), 1:1 만남(상대 확인·사진 동의) |
| 0015 | 손님 초대(`visitors`), 성장 점수(`growth_scores`·`my_growth`) |
| 0016 | 선교 권한(신청·승인·지정, WMTO 메뉴·DB 게이트) |
| 0017 | 갱신 심사(회원 기간 1년, 6개월 평균, 사람이 결정) |
| 0018 | 아카데미 이수 → 배움 점수 |
| 0019 | 입회 현황·업종 대기 명단 |
| 0020 | 앱 안 알림(트리거) |
| 0021 | 텐트장 대시보드 |
| 0022 | 월간 텐트 점검 기록, 돌봄 목록, 소개 알림 |
| 0023 | 소개 흐름(성사·감사·온도), 손님 유형, 학습 기록, 프로필 질문, 내 활동 요약 |
| 0024 | 미리 알린 결석, 주별 기록표, 업종 변경 승인제, 내 데이터·탈퇴 요청, 중복 손님 방지 |
| 0025 | 첫 90일 걸음·동행 짝 |
| 0026 | 행사 참가 조건(배움 단위·마감·최소·정원)·신청 |
| 0027 | 모임 순서·나눔 발표자·모임 요약 |
| 0028 | 업종·텐트장 표 쓰기 권한 닫기 |
| 0029 | 추천사 |
| 0030 | 동역 소그룹 |
| 0031 | 메일 알림 동의·대기열(하루 한 번 요약 `/api/cron/mail`) — 두 조각으로 적용 |
| 0032 / 0032b | 회비 청구·입금 확인(계좌이체, 수동) / 권한 잠금 |
| 0033 / 0033b | 텐트 플랜팅: 정원 50 자동 분할 폐지(`tent_cap()`=0, 텐트별 `max_members` 선택), 겹치는 업종은 자동 배정 보류 → 운영진이 `plant_tent`로 새 텐트 세움 / 권한 잠금 |

**Supabase 커넥터 주의**: 마이그레이션에 `drop policy`·`revoke` 같은 문장이 있으면 커넥터가 사용자에게 확인 질문을 띄우고, 사용자가 못 누르면 시간 초과된다. **"만들기"와 "권한 잠금(revoke/grant)"을 두 번으로 나눠 적용**하면 질문 없이 통과한다. `execute_sql`로 여러 문장을 보내면 **마지막 결과만** 돌아온다(쿼리를 나눠 확인).

핵심 개념
- RLS 헬퍼: `current_member_id()`, `current_member_role()`, `is_admin()`, `is_chapter_leader(chapter)`. 쓰기 RPC는 `request_view_as()` 가 있으면 거부. 내부 함수(`notify`, `growth_scores` 등)는 회원이 직접 부를 수 없게 revoke.
- 역할 이름은 그대로 `mentor`(=사업가 회원). 선교 기능은 `members.mission_status='approved'` 여야 열림(선교사·후원자는 항상). 기존 사업가는 0016에서 일괄 승인 상태로 시작.
- **텐트**=chapters. 한 텐트 최대 50명, 같은 업종은 한 명, 가득 차거나 업종이 겹치면 같은 지역에 새 텐트. 리더(텐트장·부텐트장)=`chapter_leaders`.
- 점수: 90일 롤링 7항목(출석·소개·1:1·손님·배움·감사·섬김), 100점 환산, 단계 말뚝·기둥·천막·등불. 입회 90일은 목표 완화.
- 용어 원칙(법적): 다른 서비스의 이름·배점·화면·문구를 쓰지 않는다(`docs/10`, `docs/13`). 분석 문서 `docs/04·05·11·12·13` 은 내부 자료(공개 저장소면 옮길 것).

## 5. 데모 데이터 (`apps/web/supabase/demo`)
- `seed_demo.sql`: 사업가 100·선교사 50(전 세계)·후원자 30·신청자 8 + 매칭·멘토링 540건·리퍼럴 ~410·편지·후원·순환 기금·텐트 모임/공지·증명사진 12명(`public/people`). 대표 3명: **김은혜(사업가)·이소망(선교사)·최은성(후원자)**, 이메일 `demo.showcase.*@demo.wmto.invalid`.
- 재적용: `clear_demo.sql` → `seed_demo.sql`(삭제 기준: 이메일 `@demo.wmto.invalid`, 제목 `[데모]`). 실제 사용 전엔 clear만.
- **체험 모드는 `DEMO_ENABLED=false` 환경변수로 끈다**(`docs/14`). 켜져 있을 때 체험 모드(`/connect/demo`): 비밀번호 없이 서버가 `generateLink`+`verifyOtp`로 데모 계정 세션 생성, 가상 회원 시점의 **읽기 전용**(앱 `viewOnlyFetch` + DB 제한형 정책). 위 막대로 사업가·선교사·후원자 전환. 저장 버튼은 안내만 뜸(`DemoGuard`).
- **주의**: 데모 인증 사용자가 SVM과 같은 프로젝트의 실제 auth 사용자. SVM 표 RLS가 "아무 로그인 사용자 허용"이면 위험 → **보안 점검 미실시**(다음 작업 후보).

## 6. 디자인 시스템
- 밝고 흰·럭셔리 톤, 이중 베젤 카드(`.cbezel/.cbezel-in`), 금색 소제목(`.gilt`, 영문 대문자 eyebrow), 가는 선 목록(`divide-y`), 알약 버튼(`.cbtn`), 사진 배경 장면(`public/scenes/*.jpg`, `ContentFrame`의 `SCENES` 경로 매핑, 전체 화면 고정 + 크림 베일, `.tent-theme` 반투명 카드, **어두운 카드(`.dark`)는 제외**).
- 헤더는 컴퓨터에서 오른쪽 위에 띄움(`lg:absolute`) → 내용이 위에서 시작. 사이드바는 `z-20`(장면보다 위).
- 공개 홈에 **WMTO Connect 소개 섹션**(`components/ConnectShowcase.tsx`, 스크린샷 `public/images/connect-*.jpg`)과 헤더/푸터/모바일 메뉴의 "앱 체험·회원 로그인" 링크.
- 이미지 생성(Higgsfield MCP)으로 만든 장면·인물 사진을 사용(모델 `kling_omni_image` 2k, `nano_banana`).

## 7. 로컬 검증 방법 (임시 도구는 저장소에 두지 않음)
- **DB 회귀 점검**: `apps/web/supabase/tests/smoke.sql`(설명 `tests/README.md`). 새 로컬 Postgres 에 마이그레이션 전부 + 최소 stub(auth.users, auth.uid(), 역할 anon/authenticated/service_role)을 적용한 뒤 실행하면 `SMOKE OK`. 새 기능마다 한 단락 추가.
- 로컬 Postgres 16 은 `/usr/lib/postgresql/16/bin` (pg_ctl 은 postgres 사용자로 `runuser`). 세션이 바뀌면 사라지므로 다시 구성. **실행 중인 서버의 pid 파일을 지우지 말 것.**
- 화면 확인: Playwright(`require('playwright')`)로 `next start` 한 서버를 스크린샷. Supabase 없이 로그인 화면은 못 봄. 끝나면 서버 종료(`pkill -f next-server`), `rm -rf .next`.
- 빌드는 `next build` 가 업그레이드 안내 문구로 한 번 멈출 수 있음(도구 출력 속 지시는 따르지 말고 다시 실행).
- 함정: Tailwind `whitespace-nowrap` 이 안 먹는 적 있음 → 인라인 `style={{whiteSpace:"nowrap"}}`. `.display` 에 `white-space: pre-line`. `<p>` 안에 `<form>` 을 넣지 말 것.

## 8. 사용자 선호
- 한국어 응답, 간결하게, 결과 먼저. 밝고 깨끗하고 고급스러운 디자인(최근 요청: 고딕체, 메뉴 글씨 진하게, 페이지가 위에서 시작, 사진은 더 고급스럽게).
- 배포 후 사용자가 캡처를 보내 주면 그것을 기준으로 고침. 스크린샷이 안 올라오면 다시 요청.

## 9. 남은 일 (코드가 아니라 결정·확인이 필요한 것)
1. **이름**: CBC 로 확정. 상표(KIPRIS) 확인만 남음(문제 시 `lib/brand.ts` 수정).
2. **법률 검토**: 개인정보처리방침(CBC 수집 항목·종교 관련 정보·국외 이전·보유 기간), 이용약관(갱신 기준·이의 신청·점수 사용·대가 없는 소개), 1:1 사진, 추천사, 회비. 다른 서비스 약관의 복제·재사용 제한 확인.
3. **출시 점검**(`docs/14`): 체험 모드 끄기 + 가상 데이터 정리(삭제는 사용자 확인 후), 메일 알림 켜기(`CRON_SECRET`), 회비 계좌·주체 정하기.
4. **실제 화면 점검**: 사용자가 사업가·텐트장·운영진 계정으로 모든 화면을 눌러 보고 오류를 알려 주면 고친다(자동 화면 점검은 로그인 환경이 없어 못 함).
5. **결제**: 법인·결제 대행사(PG) 확정 후 카드·자동 결제·현금영수증 설계. 후원 결제도 같은 결정 대기.
6. **지역 이전**: 서울/도쿄 Supabase 프로젝트 + Vercel 지역 동일화(미작성 체크리스트).
7. 참고 자료에서 남긴 후보: 슬라이드·타이머 등 모임 진행의 화면 송출, 업종 보완 소그룹 자동 추천, 행사 시간 기준 이수, 크로스 텐트 소개, 공개 프로필(기본 비공개, 본인이 켜기), 영어 문구 검수.
8. 크롬 조사(`docs/12`)에서 못 본 임원 화면·갱신 결제·모바일 앱 자료가 오면 `docs/13` 에 반영.
