# WMTO 서비스 열기: Supabase 설정과 배포 안내서

> 이 안내서대로 하면 홈페이지의 신청서가 저장되고, 관리자가 승인하면 회원이 이메일 링크로 앱(`/connect`)에 들어올 수 있게 됩니다.
> 코딩은 필요 없습니다. 클릭하고 복사해서 붙여 넣는 작업입니다. 처음 하시는 분 기준으로 썼습니다.
> 예상 시간: 1시간 안팎

---

## 0. 먼저 이해할 것

WMTO는 두 가지 서비스를 이어서 씁니다.

| 서비스 | 하는 일 | 비용 |
|---|---|---|
| **Supabase** | 신청서·회원·기록을 저장하는 데이터베이스와 로그인 | 무료 요금제로 시작 가능 |
| **Vercel** | 홈페이지와 앱을 인터넷에 올려 주는 서버 | 무료(Hobby)로 시작 가능. 단, Hobby는 비상업용이라 후원금을 받는 단계가 되면 유료(Pro) 전환을 확인하세요 |
| **Resend** (선택) | 로그인 메일과 신청 알림 메일을 안정적으로 보내는 서비스 | 월 소량 무료 |

> **이 안내서는 SVM과 같은 Supabase 프로젝트를 나눠 쓰는 경우를 기준으로 합니다.**
> WMTO의 표는 전부 `wmto`라는 별도 칸(스키마)에 만들어지므로 SVM의 표와 이름이 겹치지 않습니다.
> 대신 아래 세 가지는 프로젝트 전체가 공유하니 특히 조심하세요. (각 단계에 ⚠ 표시)
> 1. **로그인 사용자 목록**(Authentication → Users): SVM 사용자와 WMTO 사용자가 한 목록에 섞입니다.
> 2. **이메일 양식**(초대, 로그인 링크): 프로젝트에 하나뿐이라 SVM과 WMTO가 같이 씁니다. 5장에서 조건문으로 나눕니다.
> 3. **Site URL**: 하나뿐이므로 SVM 설정을 바꾸지 말고 WMTO 주소는 "Redirect URLs"에만 추가합니다.
> 별도 프로젝트로 분리하고 싶으면 1장에서 새 프로젝트를 만들면 되고, 나머지 단계는 같습니다.

**준비물**
- GitHub 계정(`koreayjk`) : 코드가 이미 `koreayjk/wmto` 저장소에 있습니다.
- 관리자로 쓸 이메일 주소 1개
- (권장) 사용할 도메인 이름. 없으면 Vercel이 주는 주소로 먼저 시작하세요.

**순서 한눈에 보기**
1. Supabase 프로젝트 만들기
2. 데이터베이스 표 만들기 (SQL 4개 실행)
3. 관리자 계정 만들기
4. Vercel에 올리기
5. Supabase에 사이트 주소와 이메일 양식 알려 주기
6. 메일이 잘 가도록 SMTP 설정하기 (권장)
7. 전체 시험하기

---

## 1. Supabase 프로젝트 준비하기

**SVM과 같은 프로젝트를 쓰는 경우:** 새로 만들지 않고 SVM이 쓰는 프로젝트를 열어 "키 3개 확인해 두기"로 바로 가세요. (SVM 쪽 설정은 건드리지 않습니다.)

**새 프로젝트를 만드는 경우:**

1. https://supabase.com 에 접속해 GitHub 계정으로 가입/로그인합니다.
2. **New project**를 누릅니다. (처음이면 Organization을 먼저 만듭니다. 이름은 `WMTO`)
3. 아래처럼 입력합니다.
   - **Name**: `wmto`
   - **Database Password**: 길고 어려운 비밀번호를 만들고 **비밀번호 관리자나 안전한 곳에 저장**합니다. 나중에 거의 쓰지 않지만 잃어버리면 곤란합니다.
   - **Region**: `Northeast Asia (Seoul)` (한국 사용자가 가장 빠릅니다)
4. **Create new project**를 누르고 1~2분 기다립니다.

### 키 3개 확인해 두기
프로젝트가 열리면 왼쪽 아래 톱니바퀴 **Project Settings → API** (또는 **API Keys**)에서 아래 세 값을 확인합니다. 4번 단계에서 씁니다.

| 이름 | 어디에 쓰나 | 공개해도 되나 |
|---|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` | 괜찮음 |
| **anon public key** (`eyJ...` 로 시작) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 괜찮음 |
| **service_role key** (`eyJ...` 로 시작) | `SUPABASE_SERVICE_ROLE_KEY` | **절대 공개 금지** (모든 보안을 우회하는 열쇠). 카톡·메일·글에 붙여 넣지 마세요 |

---

## 2. 데이터베이스 표 만들기 (SQL 7개)

1. Supabase 왼쪽 메뉴 **SQL Editor**를 엽니다.
2. **New query**를 누릅니다.
3. GitHub의 `koreayjk/wmto` 저장소에서 아래 파일을 **순서대로** 엽니다. 각 파일의 전체 내용을 복사해 SQL Editor에 붙여 넣고 **Run**을 누릅니다.

   | 순서 | 파일 (`apps/web/supabase/migrations/`) | 내용 |
   |---|---|---|
   | 1 | `0001_init.sql` | 회원, 신청, 일정, 스토리 등 기본 표 |
   | 2 | `0002_app_phase1.sql` | 앱 1단계: 출석, 매칭, 멘토링 기록, 자립 리포트 |
   | 3 | `0003_app_phase2.sql` | 앱 2단계: 매칭 요청, 리퍼럴, 감사 편지, 성장 단계, 아카데미 |
   | 4 | `0004_mentoring_followup.sql` | 멘토링 기록의 "다음에 할 것·기도제목" |
   | 5 | `0005_sponsor.sql` | 후원자 화면: 후원 내역, 선교사 소식, 순환 기금 흐름 |
   | 6 | `0006_view_as.sql` | 관리자의 "앱 화면 보기" (읽기 전용 미리보기) |
   | 7 | `0007_demo_viewer.sql` | 공개 데모 체험 계정 (사업가·선교사·후원자 모드 전환, 읽기 전용) |
   | 8 | `0008_mentor_directory_detail.sql` | 리퍼럴 사업가 찾기(업종·지역·도움 방식별) |
   | 9 | `0009_tents.sql` | 텐트 모임(구성원·일정·공지/후기, 선교사 픽업) |
   | 10 | `0010_tent_welcome.sql` | 텐트에 모시기(1단계)와 멘토로 함께하기(2단계) 분리 |

   각 파일 맨 위에 `wmto` 스키마를 만드는 문장이 들어 있어서, SVM의 기존 표(`public` 칸)는 전혀 건드리지 않습니다. 파일을 고치지 말고 그대로 붙여 넣으세요.

4. 매번 아래에 **Success**가 나오면 다음 파일로 넘어갑니다.
   - 빨간 오류가 나오면 **멈추고** 오류 문장을 복사해 두세요. 앞 단계를 건너뛰었거나 같은 파일을 두 번 실행한 경우가 대부분입니다. (처음부터 다시 하려면 8장 맨 아래 "처음부터 다시 하고 싶을 때"를 보세요.)
5. 확인: 왼쪽 **Table Editor** 상단의 스키마 선택칸(보통 `public`)을 **`wmto`** 로 바꾸면 `members`, `applications`, `events`, `matchings`, `mentoring_logs` 같은 표가 보여야 합니다. (SVM 표는 `public`에 그대로 있습니다.)

### 2-1. ⚠ `wmto` 스키마를 앱에 열어 주기 (필수, 빠뜨리기 쉬움)
Supabase는 기본적으로 `public` 칸만 앱에 열어 줍니다. WMTO가 쓸 수 있게 추가해야 합니다.

1. **Project Settings → API** (또는 **Data API → Settings**) 를 엽니다.
2. **Exposed schemas** 칸에 `wmto` 를 **추가**합니다. (기존의 `public` 등은 지우지 마세요.)
3. **Save** 합니다.

이걸 안 하면 신청서 저장과 앱이 "The schema must be one of the following" 같은 오류를 냅니다.

> 중요: 4개를 **한 번에 하나씩, 순서대로**. 순서가 바뀌면 오류가 납니다.

---

## 3. 관리자 계정 만들기

관리자는 `/admin`에서 신청을 승인하고, 일정·스토리·매칭을 관리합니다.

1. Supabase 왼쪽 **Authentication → Users → Add user → Create new user**
2. 관리자 이메일과 비밀번호를 입력하고 **Auto Confirm User**를 체크한 뒤 만듭니다. (⚠ 이 목록은 SVM과 공유됩니다. 이미 SVM에 가입한 이메일이면 새로 만들지 말고 그 사용자의 UID를 쓰세요. SVM 관리자 목록과는 별개이므로, WMTO 관리자 권한은 아래 SQL로만 부여됩니다.)
3. 목록에서 방금 만든 사용자의 **User UID**(`xxxxxxxx-xxxx-...` 형식)를 복사합니다.
4. **SQL Editor**에서 아래를 실행합니다. (`여기에-UID`를 복사한 값으로 바꿉니다. 따옴표는 남깁니다.)

```sql
insert into wmto.admins (user_id) values ('여기에-UID');
```

5. 관리자를 더 추가하려면 사용자를 만든 뒤 같은 SQL을 한 번 더 실행합니다.

---

## 4. Vercel에 사이트 올리기

1. https://vercel.com 에 GitHub 계정으로 가입/로그인합니다.
2. **Add New → Project**를 누르고 `koreayjk/wmto` 저장소를 **Import** 합니다. (저장소가 안 보이면 "Adjust GitHub App Permissions"에서 저장소 접근을 허용합니다.)
3. 설정 화면에서 아래 두 가지가 가장 중요합니다.
   - **Root Directory**: `apps/web` 으로 바꿉니다 (Edit 버튼). **이걸 안 바꾸면 빌드가 실패합니다.**
   - **Framework Preset**: Next.js (자동 인식)
4. **Environment Variables**에 아래를 입력합니다. (Name과 Value를 하나씩 추가)

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | 1장의 Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1장의 anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | 1장의 service_role key |
   | `NEXT_PUBLIC_SITE_URL` | 사이트 주소. 처음에는 `https://wmto-xxxx.vercel.app` 처럼 Vercel이 주는 주소 (배포 후 정확한 값 확인. 아래 참고) |

   (선택: `NEXT_PUBLIC_SUPABASE_SCHEMA` 는 기본값이 `wmto` 라서 따로 넣지 않아도 됩니다.)

   (신청 알림 메일을 받으려면 6장에서 만든 `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL`, `NOTIFY_FROM_EMAIL`도 추가합니다. 지금은 건너뛰어도 됩니다.)
5. **Deploy**를 누르고 2~3분 기다립니다. 성공하면 사이트 주소가 나옵니다.
6. **주소를 확정하고 다시 배포하기**: 처음 입력한 `NEXT_PUBLIC_SITE_URL`이 실제 주소와 다르면, Vercel **Settings → Environment Variables**에서 값을 고치고 **Deployments → 가장 위 배포 → ⋯ → Redeploy** 합니다.
   - 나중에 도메인을 연결하면(예: `https://wmto.org`) 이 값을 새 주소로 바꾸고 다시 배포해야 합니다. (이 값은 빌드할 때 박히기 때문에 바꾼 뒤 재배포가 꼭 필요합니다.)

---

## 5. Supabase에 사이트 주소와 이메일 양식 알려 주기

로그인 링크가 올바른 주소로 가고, 다른 기기에서 열어도 동작하게 하는 단계입니다. **여기를 빼먹으면 로그인 링크가 작동하지 않습니다.**

### 5-1. 주소 등록 (⚠ SVM 설정을 바꾸지 마세요)
Supabase **Authentication → URL Configuration**

- **Site URL**: SVM이 이미 쓰고 있다면 **그대로 둡니다.** (바꾸면 SVM 로그인 메일이 깨집니다.) 새 프로젝트라면 WMTO 주소로 설정합니다.
- **Redirect URLs**: `https://WMTO사이트주소/**` 를 **추가**합니다. (예: `https://wmto-xxxx.vercel.app/**`) 기존 SVM 주소는 지우지 않습니다.

### 5-2. ⚠ 이메일 양식 두 개 바꾸기 (SVM과 공유되므로 조건문 사용)
Supabase **Authentication → Email Templates**

이메일 양식은 프로젝트에 하나뿐입니다. 그래서 **WMTO 회원에게 가는 메일만 WMTO 양식**으로, 나머지는 **지금 SVM이 쓰는 양식 그대로** 나가게 조건문으로 나눕니다.
WMTO가 초대할 때 사용자에게 `wmto_member` 표시를 달아 두기 때문에 가능한 방식입니다.

**먼저, 지금 들어 있는 양식을 메모장에 통째로 복사해 두세요.** (SVM용 원본이자 되돌릴 때 필요합니다.)

**Invite user** (관리자가 승인하면 회원에게 가는 초대 메일) 의 Message body를 아래 형태로 바꿉니다. `여기에 기존 SVM 양식` 자리에 방금 복사한 원본을 붙여 넣습니다.

```html
{{ if .Data.wmto_member }}
<h2>WMTO Connect에 초대합니다</h2>
<p>아래 버튼을 눌러 로그인하세요.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=invite">앱 열기</a></p>
{{ else }}
여기에 기존 SVM 양식
{{ end }}
```

**Magic Link** (이후 로그인할 때마다 가는 메일)

```html
{{ if .Data.wmto_member }}
<h2>WMTO Connect 로그인</h2>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink">로그인하기</a></p>
<p>이 메일은 로그인을 요청하신 분께만 전달됩니다.</p>
{{ else }}
여기에 기존 SVM 양식
{{ end }}
```

- Subject(제목)는 하나뿐이니 `로그인 링크 / Login link` 처럼 어느 쪽에도 어색하지 않은 문구로 두세요.
- `{{ .RedirectTo }}` 는 WMTO 앱이 메일을 요청할 때 보내는 주소(`https://WMTO주소/auth/confirm?next=/connect`)입니다. 그 뒤에 `&token_hash=...` 를 이어 붙이는 방식이라 SVM 주소와 섞이지 않습니다.
- 저장한 뒤 **꼭 두 쪽을 다 시험**하세요. (WMTO 로그인 메일, SVM 로그인 메일)
- ⚠ **한계:** 이미 SVM에 가입한 사람을 WMTO에서 승인하면 그 사람은 `wmto_member` 표시가 없어 로그인 메일이 SVM 양식으로 갑니다. 이런 분은 당분간 WMTO 전용 다른 이메일로 가입하도록 안내하는 것이 가장 단순합니다. (계정을 합치는 방식은 교사 연동을 설계할 때 같이 정합니다.)

---

## 6. 메일이 잘 가도록 SMTP 설정 (사실상 필수)

Supabase 기본 메일 서버는 **시간당 몇 통만 보낼 수 있고, 팀 구성원 외 주소로는 막히는 경우가 있습니다.** 실제 회원에게 초대장을 보내려면 아래를 설정하세요.

### 6-1. Resend 가입과 도메인 인증
1. https://resend.com 가입 → **Domains → Add Domain** 으로 사용할 도메인을 등록합니다.
2. 화면에 나오는 DNS 레코드(TXT, MX 등)를 도메인을 산 곳(가비아, GoDaddy, Cloudflare 등)의 DNS 설정에 추가하고 **Verify** 합니다. (몇 분~몇 시간)
3. **API Keys → Create API Key**로 키를 만듭니다(`re_...`).

> 도메인이 아직 없다면 도메인을 먼저 사세요. 도메인 없이는 다른 사람에게 메일을 보내기 어렵습니다.

### 6-2. Supabase에 연결
Supabase **Project Settings → Authentication → SMTP Settings** (또는 Authentication → Emails → SMTP) → **Enable Custom SMTP**

| 항목 | 값 |
|---|---|
| Sender email | `no-reply@내도메인` (인증한 도메인) |
| Sender name | `WMTO` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | 6-1에서 만든 API 키 (`re_...`) |

### 6-3. 신청 알림 메일 (선택)
새 신청이 들어올 때 관리자에게 알림을 받으려면 Vercel 환경 변수에 추가하고 재배포합니다.

| Name | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` |
| `ADMIN_NOTIFY_EMAIL` | 알림 받을 이메일 |
| `NOTIFY_FROM_EMAIL` | `WMTO <no-reply@내도메인>` |

---

## 7. 전체 시험하기 (이 순서로 눌러 보세요)

1. **홈페이지 열기**: 사이트 주소에 들어가 화면이 보이는지 확인합니다.
2. **신청서 제출**: `/apply?type=observe` 에서 본인의 다른 이메일로 참관 신청을 보냅니다. "감사합니다" 화면이 나와야 합니다.
3. **관리자 로그인**: `/admin/login` 에서 3장의 관리자 이메일·비밀번호로 로그인합니다.
4. **신청 확인과 승인**: `/admin/members` 에 방금 신청이 "신청자"로 보이는지 확인하고, 역할(사업가/선교사/후원자)을 정해 **승인**합니다.
5. **초대 메일 확인**: 신청에 쓴 이메일로 초대 메일이 왔는지 확인합니다. (스팸함도 확인)
6. **앱 로그인**: 메일의 버튼을 누르면 `/connect` 앱 화면이 열려야 합니다.
7. **다시 로그인 시험**: 로그아웃하고 `/connect/login` 에서 이메일을 입력해 로그인 링크를 받아 봅니다.
8. **휴대폰에 설치**: 휴대폰 브라우저로 `/connect` 를 열고 "홈 화면에 추가"를 합니다.

### 처음 채워 넣을 것
- `/admin/events`: 모임 일정 등록 (온라인 모임 링크 포함. 링크는 로그인한 회원에게만 보입니다)
- `/admin/stories`: 스토리(열매 이야기). 실제 사례가 생기면 등록하세요. 예시는 "예시" 표시를 켜 두세요.
- `/admin/academy`: 아카데미 강의 영상
- `/admin/matchings`: 사업가와 선교사 매칭 배정

---

## 8. 문제가 생겼을 때

| 증상 | 원인과 해결 |
|---|---|
| 빌드(Deploy)가 실패한다 | Vercel **Root Directory**가 `apps/web`인지 확인. 환경 변수 이름 오타 확인 |
| `/admin/login` 에 "Supabase 환경 변수가 설정되지 않았습니다" | Vercel 환경 변수 3개(URL, anon, service role)가 빠졌거나 오타. 입력 후 **재배포** |
| 관리자 로그인이 되는데 "관리자가 아닙니다" | 3장의 `insert into admins` SQL을 실행하지 않았거나 UID를 잘못 넣음 |
| 신청서 제출이 "저장하지 못했습니다" 또는 오류에 `The schema must be one of the following` 가 보인다 | 2-1의 **Exposed schemas에 `wmto`** 를 추가하지 않았습니다. 그 외에는 `SUPABASE_SERVICE_ROLE_KEY` 누락·오타, 또는 SQL `0001`을 실행하지 않은 경우입니다 |
| 초대/로그인 메일이 안 온다 | 스팸함 확인 → 6장 SMTP 설정 → Supabase **Authentication → Logs**에서 오류 확인 |
| 메일 링크를 누르면 "링크가 만료되었거나 올바르지 않습니다" | 5-2의 이메일 양식을 `auth/confirm?token_hash=...` 형태로 바꾸지 않았거나, **Site URL**이 다름. 링크는 한 번만, 일정 시간 안에만 유효하니 새로 요청 |
| 링크를 누르면 `localhost` 로 간다 | Supabase **Site URL** 또는 `NEXT_PUBLIC_SITE_URL`이 아직 `localhost`. 5-1 수정 후 재배포 |
| 앱에 들어갔는데 "승인 후 이용" 메시지 | 관리자가 승인하지 않았거나 회원이 `비활성` 상태. `/admin/members` 확인 |
| WMTO 로그인 메일이 SVM 모양으로 온다 / SVM 메일이 WMTO 모양으로 온다 | 5-2 조건문 확인. WMTO가 초대한 사용자만 `wmto_member` 표시가 있습니다 |
| 일정이 목록에 안 뜬다 | `/admin/events` 에서 등록했는지, 지난 일정은 숨겨지는지 확인 |
| 사이트 주소를 바꿨는데 링크가 예전 주소로 간다 | `NEXT_PUBLIC_SITE_URL`과 Supabase Site URL을 둘 다 바꾸고 **재배포** |

### 처음부터 다시 하고 싶을 때
실수가 많아 꼬였다면, 기존 표를 지우려 하지 말고 **새 Supabase 프로젝트를 하나 더 만들어** 1장부터 다시 하는 것이 가장 안전합니다. (무료 요금제도 프로젝트 2개까지 가능합니다.) 예전 프로젝트는 **Project Settings → General → Delete project**로 지웁니다. 표를 직접 지우는 방식은 Supabase의 기본 권한 설정까지 망가뜨릴 수 있어 권하지 않습니다.

---

## 9. 운영하면서 꼭 챙길 것

- **service_role key는 비밀**: 유출됐다고 의심되면 Supabase **Project Settings → API**에서 키를 재발급하고 Vercel 값을 바꿔 재배포합니다.
- **백업**: 무료 요금제는 자동 백업이 제한적입니다. 회원이 늘면 Pro 요금제(일일 백업)를 고려하세요.
- **개인정보 처리방침**: 현재 문구는 초안입니다. 실제 운영 전에 운영 주체와 법무 확인 후 `/privacy` 문구를 확정해 주세요.
- **회원 수 늘어나면**: 로그인 메일 발송량이 늘어납니다. 6장의 SMTP 한도를 확인하세요.
- **영어 문구**: 영어 화면은 번역 초안입니다. 공개 전에 원어민 검수를 권장합니다.

---

*관련 문서: `README.md`(개발자용 요약), `docs/02-app.md`(앱 기획), `docs/00-wmto-overview.md`(기준 문서)*
