import { BRAND, BRAND_FULL, BRAND_FULL_KO } from "./brand";

export type CbcLocale = "ko" | "en";

type Copy = {
  meta: { title: string; description: string };
  nav: { mission: string; login: string; other: string };
  hero: { eyebrow: string; title: string; sub: string; join: string; login: string };
  concept: { eyebrow: string; title: string; lead: string; pillars: { word: string; title: string; text: string }[] };
  why: { title: string; items: { title: string; text: string }[] };
  rhythm: { eyebrow: string; title: string; text: string; items: string[] };
  menu: { about: string; how: string; join: string; faq: string };
  system: { eyebrow: string; title: string; sub: string; items: { title: string; text: string; points: string[] }[] };
  levels: { title: string; sub: string; items: { name: string; text: string }[] };
  agenda: { title: string; sub: string; items: { title: string; text: string }[] };
  gloss: { title: string; items: { term: string; text: string }[] };
  slots: { tent: string; filledLabel: string; youLabel: string; openLabel: string; you: string; filled: string[]; open: string[]; note: string };
  path: { title: string; sub: string; steps: { title: string; text: string }[] };
  photoNote: string;
  synergy: { eyebrow: string; title: string; sub: string; roles: { tag: string; name: string; note: string }[]; steps: { who: string; title: string; text: string }[]; gainsTitle: string; gains: { who: string; text: string }[]; whyTitle: string; why: { title: string; text: string }[]; math: { value: string; unit: string; text: string }; note: string };
  photos: Record<"hero" | "workplace" | "gathering" | "oneToOne" | "referral" | "prayer", string>;
  faq: { title: string; items: { q: string; a: string }[]; more: string };
  trust: { title: string; items: string[] };
  mission: { eyebrow: string; title: string; text: string; cta: string; note: string };
  final: { title: string; text: string; join: string; contact: string };
  footer: { privacy: string; contact: string; note: string };
};

const ko: Copy = {
  meta: { title: `${BRAND} · ${BRAND_FULL_KO}`, description: "매주 한 번 모여 서로의 일을 나누고 고객을 소개하는 크리스천 사업가 모임. 업종마다 한 사람, 1:1 만남, 손님 초대, 성장 기록을 한 앱에서." },
  nav: { mission: "선교 사역(WMTO)", login: "회원 로그인", other: "English" },
  hero: {
    eyebrow: `${BRAND_FULL_KO} · 크리스천 사업가 네트워크`,
    title: "매주 만나 서로 소개하고,\n함께 자라는 사업가 모임",
    sub: "일주일에 한 번 같은 지역의 사업가가 모여 서로의 일을 나누고 고객을 소개합니다. 같은 업종은 한 모임에 한 분이라 경쟁 없이 연결됩니다. 1:1 만남, 감사와 배움은 하나의 앱에서 이어 갑니다.",
    join: "참여 문의", login: "회원 로그인",
  },
  concept: {
    eyebrow: "CBC는 무엇인가요",
    title: "일터가 곧 소명이 되는 사업가 공동체",
    lead: "CBC는 Christian Business Connect의 약자입니다. 믿음을 가진 사업가가 서로를 알고, 서로의 고객이 되어 주고, 서로의 일을 세워 주는 모임입니다. 사업과 신앙을 따로 두지 않고, 월요일의 일터에서 믿음을 살아 내도록 돕습니다.",
    pillars: [
      { word: "Christian", title: "믿음으로", text: "사업의 성공보다 먼저 사람과 신뢰를 세웁니다. 서로 기도하고, 정직하게 일하고, 받은 것을 나눕니다." },
      { word: "Business", title: "일로", text: "모임의 중심은 각자의 일입니다. 내 일을 정확히 알리고, 서로의 일을 이해해 좋은 고객을 연결합니다." },
      { word: "Connect", title: "연결로", text: "혼자 애쓰던 사업가가 한 팀이 됩니다. 소개, 1:1 만남, 손님 초대로 관계가 실제 거래와 동역으로 이어집니다." },
    ],
  },
  why: {
    title: "왜 CBC인가요",
    items: [
      { title: "사업은 외롭습니다", text: "결정은 혼자 내리고 책임도 혼자 집니다. 같은 길을 걷는 믿음의 동료가 곁에 있으면 달라집니다." },
      { title: "소개는 신뢰에서 나옵니다", text: "광고보다 한 사람의 소개가 더 멀리 갑니다. 정기적으로 만나 서로의 일을 아는 사이에서 좋은 소개가 나옵니다." },
      { title: "믿음과 일을 나누지 않습니다", text: "일요일의 믿음과 평일의 일터가 따로 놀지 않도록, 일터에서 서로를 격려하는 공동체를 만듭니다." },
    ],
  },
  rhythm: {
    eyebrow: "모임은 이렇게 돌아갑니다",
    title: "업종마다 한 분, 정기적으로 만나는 지역 모임",
    text: "CBC의 기본 단위는 지역 모임인 '텐트'입니다. 같은 업종의 사업가는 한 텐트에 한 분만 들어옵니다. 서로 경쟁하지 않으니 마음 놓고 고객을 소개할 수 있습니다. 텐트가 알맞게 자라면 새 텐트를 세워(텐트 플랜팅) 더 많은 지역과 업종으로 연결을 넓혀 갑니다.",
    items: ["지역별로 세우는 텐트", "업종당 한 분 — 경쟁이 아닌 협력", "알맞은 때 새 텐트를 세우는 텐트 플랜팅", "매주 한 번 정기 모임에서 서로의 일과 필요를 나눔", "텐트장과 운영진이 함께 돌봄"],
  },
  menu: { about: "CBC 소개", how: "운영 방식", join: "첫 방문", faq: "자주 묻는 질문" },
  system: {
    eyebrow: "운영 체계",
    title: "CBC는 이렇게 설계되어 있습니다",
    sub: "모임이 일회성 만남으로 끝나지 않도록, 구조와 기록과 돌봄을 함께 갖췄습니다.",
    items: [
      { title: "텐트 구성", text: "지역 단위 모임입니다. 업종 독점 원칙으로 회원 간 경쟁을 없앴습니다.", points: ["지역별로 세우는 텐트", "업종당 한 분", "알맞은 때 새 텐트를 세우는 텐트 플랜팅", "빈 업종은 대기자 명단으로 안내"] },
      { title: "리더십과 돌봄", text: "텐트장과 부텐트장이 회원을 돌보고, 매달 텐트를 함께 점검합니다.", points: ["텐트장·부텐트장·담당자", "월간 텐트 점검 기록", "새 회원 동행 짝 지정"] },
      { title: "소개와 감사", text: "소개의 진행 상태를 기록하고, 성사되면 감사로 마무리합니다.", points: ["소개 보내기·받기와 진행 상태", "감사 기록", "소개에 대가 없음"] },
      { title: "1:1 만남", text: "모임 밖의 일대일 만남이 관계의 깊이를 만듭니다. 상대 확인으로 기록이 완성됩니다.", points: ["만남 기록과 상대 확인", "사진은 두 분 동의 시에만", "만남이 성장 기록에 반영"] },
      { title: "성장 기록", text: "최근 90일의 활동을 7가지 영역으로 돌아보고 다음 걸음을 제안합니다.", points: ["순위가 아닌 성장 단계", "새 회원은 목표 완화", "연 1회 갱신 대화"] },
      { title: "배움과 선교", text: "아카데미로 함께 배우고, 마음이 있는 회원에게는 선교 사역의 문이 열립니다.", points: ["아카데미 이수 기록", "선교 권한은 신청·승인", "선교는 선택 사항"] },
    ],
  },
  levels: {
    title: "성장 단계: 말뚝에서 등불까지",
    sub: "텐트를 세우는 과정에 빗댄 네 단계입니다. 점수가 아니라 방향을 보여 주는 지표입니다.",
    items: [
      { name: "말뚝", text: "이제 막 시작했거나 활동이 적은 단계입니다. 리더가 먼저 연락드립니다." },
      { name: "기둥", text: "기본 활동을 꾸준히 이어 가는 단계입니다." },
      { name: "천막", text: "꾸준히 서로를 세워 주는 단계입니다." },
      { name: "등불", text: "다른 사람의 길을 밝혀 주는 단계입니다." },
    ],
  },
  agenda: {
    title: "정기 모임은 이렇게 흘러갑니다",
    sub: "텐트마다 세부 진행은 다를 수 있으며, 아래는 기본 흐름의 예시입니다.",
    items: [
      { title: "인사와 기도", text: "서로 안부를 묻고 함께 기도로 시작합니다." },
      { title: "내 일 소개", text: "이번 주 한 분이 자신의 일과 원하는 연결을 자세히 나눕니다." },
      { title: "소개와 필요 나눔", text: "회원들이 소개할 수 있는 분과 필요한 도움을 나눕니다." },
      { title: "감사 나눔", text: "성사된 소개와 받은 도움에 감사를 전합니다." },
      { title: "마무리", text: "다음 모임을 안내하고 기도로 마칩니다." },
    ],
  },
  gloss: { title: "용어 풀이", items: [{ term: "텐트", text: "지역 단위 모임" }, { term: "텐트장", text: "텐트를 돌보는 리더" }, { term: "동역", text: "같은 뜻으로 함께 일함" }, { term: "텐트 플랜팅", text: "새 텐트를 세우는 일" }] },
  slots: { tent: "서울 ○○ 텐트 (예시)", filledLabel: "참여 중인 업종(예시)", youLabel: "당신의 자리", openLabel: "아직 비어 있는 업종", you: "내 업종", filled: ["바디샵", "세무·회계", "부동산", "보험", "인테리어", "영상 제작", "치과", "법률", "카페", "웹 개발", "인쇄·광고", "이사·물류", "학원", "꽃집", "건강식품", "여행사"], open: ["한의원", "약국", "안경점", "세탁소"], note: "그림은 구조를 설명하는 예시이며 실제 회원 현황이 아닙니다. 한 업종에는 한 분만 들어옵니다." },
  path: {
    title: "첫 방문에서 첫 90일까지",
    sub: "처음 오신 분의 목표는 낮추고, 한 걸음씩 안내합니다.",
    steps: [
      { title: "문의", text: "문의를 남기면 운영진이 연락드리고, 업종이 겹치지 않는 가까운 텐트를 안내합니다." },
      { title: "모임 참관", text: "텐트장이 맞이하고, 정기 모임에서 회원들이 서로의 일을 나누는 모습을 봅니다." },
      { title: "나를 소개", text: "방문자도 자신의 일과 필요한 연결을 짧게 소개합니다." },
      { title: "입회와 텐트 배정", text: "함께하고 싶다면 신청하고, 업종 확인 후 승인되면 회원 앱이 열립니다." },
      { title: "첫 1:1 만남", text: "먼저 한 분과 일대일로 만나 서로의 일을 알아 갑니다." },
      { title: "첫 소개와 감사", text: "서로의 고객이 될 만한 분을 소개하고, 성사되면 감사를 전합니다." },
    ],
  },
  photoNote: "사진은 이해를 돕기 위한 연출 이미지입니다.",
  synergy: {
    eyebrow: "CBC의 시너지",
    title: "한 번의 소개가, 세 사람의 일이 됩니다",
    sub: "아래는 CBC에서 일어나는 일을 이해하기 쉽게 꾸민 예시 이야기입니다.",
    roles: [
      { tag: "나", name: "영상 제작사 대표", note: "CBC 텐트 회원" },
      { tag: "B", name: "바디샵 사장님", note: "같은 텐트 회원" },
      { tag: "A", name: "마케팅 회사 대표", note: "나의 지인(회원 아님)" },
    ],
    steps: [
      { who: "A", title: "필요가 생깁니다", text: "A씨의 차량이 파손됐습니다. 믿고 맡길 바디샵을 찾느라 후기만 뒤지고 있습니다." },
      { who: "나", title: "매주 모임에서 쌓은 신뢰가 있습니다", text: "저는 텐트 모임에서 매주 만나며 B 사장님의 일하는 방식과 정직함을 알고 있었습니다." },
      { who: "나", title: "자신 있게 소개합니다", text: "\"제가 아는 분인데 정직하게 잘 고쳐 주세요.\" 한마디로 A씨와 B 사장님을 연결합니다." },
      { who: "B", title: "소개받은 손님을 정성껏 맞습니다", text: "소개로 온 손님이라 더 신경 써서 수리하고, A씨는 만족합니다." },
      { who: "A", title: "고마움이 일감으로 돌아옵니다", text: "A씨는 고마운 마음에, 마침 필요했던 영상 제작을 저에게 맡깁니다." },
    ],
    gainsTitle: "한 번의 소개로 모두가 얻은 것",
    gains: [
      { who: "A씨", text: "믿을 수 있는 업체를 헤매지 않고 바로 만났습니다." },
      { who: "B 사장님", text: "광고비 없이, 신뢰를 가진 새 고객을 얻었습니다." },
      { who: "나", text: "감사가 일감으로 돌아왔고, 두 사람과의 관계가 깊어졌습니다." },
    ],
    whyTitle: "CBC라서 가능한 이유",
    why: [
      { title: "경쟁자가 아닙니다", text: "텐트에는 바디샵이 한 곳뿐이라, 소개가 망설임 없이 B 사장님께 모입니다." },
      { title: "서로를 압니다", text: "매주 만나 서로의 일을 듣기 때문에, 믿을 만한 사람만 소개할 수 있습니다." },
      { title: "순환합니다", text: "소개와 감사를 앱에 남기면, 받은 도움이 다음 소개로 이어집니다." },
    ],
    math: { value: "435", unit: "개", text: "30명 텐트에서 서로 이어질 수 있는 1:1 관계의 수(30 × 29 ÷ 2). 10명이면 45개, 20명이면 190개로, 사람이 늘수록 연결은 더 빠르게 늘어납니다." },
    note: "소개의 대가로 돈을 주고받지 않습니다. 위 이야기의 일감은 소개 대가가 아니라, 신뢰가 만든 정상적인 거래입니다.",
  },
  photos: { hero: "카페 테이블에 둘러앉아 웃으며 이야기하는 사업가들", workplace: "자기 가게에서 미소 짓는 사업가", gathering: "정기 모임에서 둘러앉아 이야기를 나누는 회원들", oneToOne: "커피를 사이에 두고 일대일로 대화하는 두 사업가", referral: "악수하며 명함을 건네는 두 사업가", prayer: "조용히 함께 기도하는 사업가들" },
  faq: {
    title: "자주 묻는 질문",
    items: [
      { q: "업종이 이미 다른 분으로 차 있으면요?", a: "대기자로 등록할 수 있고, 자리가 나거나 인근 텐트에 빈 업종이 있으면 안내드립니다." },
      { q: "선교(WMTO)에 꼭 참여해야 하나요?", a: "아닙니다. CBC 회원 활동은 선교와 별개입니다. 선교에 마음이 있는 분만 신청하거나 텐트장의 지정으로 참여합니다." },
      { q: "소개하면 대가를 받나요?", a: "소개에 대가를 주고받지 않습니다. 성사 후 감사를 전하는 것으로 마음을 표현합니다." },
      { q: "개인정보는 어떻게 쓰이나요?", a: "동의하신 범위에서만 모임 운영에 사용하고, 1:1 사진도 두 분이 모두 동의할 때만 남깁니다." },
    ],
    more: "세부 운영 방식은 입회 문의 후 자세히 안내드립니다.",
  },
  trust: {
    title: "우리가 지키는 것",
    items: ["소개에 대가를 주고받지 않습니다. 감사는 마음의 표현입니다.", "1:1 만남 사진은 두 사람이 모두 동의할 때만 남기고, 두 분과 텐트장·운영진만 볼 수 있습니다.", "점수만으로 회원 자격을 정하지 않습니다. 텐트장과 운영진이 대화하며 함께 결정합니다."],
  },
  mission: {
    eyebrow: "선교에 마음이 있다면",
    title: "일터의 은사로 선교에 동참하세요",
    text: "모임 안에서 선교에 마음이 열린 분은 신청하거나, 텐트장의 지정으로 선교 사역(WMTO)에 참여할 수 있습니다. 선교사의 자립을 곁에서 돕는 멘토링과 자립 리포트, 순환 기금이 열립니다.",
    cta: "선교 사역 알아보기", note: "선교 권한은 신청 후 승인되며, 모든 회원에게 자동으로 열리지는 않습니다.",
  },
  final: { title: "함께할 분을 기다립니다", text: "입회 문의를 남겨 주시면 가까운 지역 텐트를 안내해 드립니다.", join: "참여 문의", contact: "문의하기" },
  footer: { privacy: "개인정보처리방침", contact: "문의", note: `© ${new Date().getFullYear()} ${BRAND} · ${BRAND_FULL_KO}` },
};

const en: Copy = {
  meta: { title: `${BRAND} · ${BRAND_FULL}`, description: "A Christian business community that meets weekly to share each other's work and refer clients. One owner per industry, 1:1s, guests and growth in one app." },
  nav: { mission: "Mission work (WMTO)", login: "Member login", other: "한국어" },
  hero: {
    eyebrow: `${BRAND_FULL} · Christian business network`,
    title: "Meet weekly, refer each other,\ngrow together",
    sub: "Once a week, business owners from the same region gather to share their work and refer clients. With one business per industry in each group, we connect instead of compete. 1:1 meetings, gratitude and learning continue in one app.",
    join: "Ask to join", login: "Member login",
  },
  concept: {
    eyebrow: "What is CBC",
    title: "A community where the workplace becomes a calling",
    lead: "CBC stands for Christian Business Connect. It is a community where business owners of faith get to know each other, become each other's clients, and build up each other's work. We do not keep faith and business apart — we help you live out your faith in Monday's workplace.",
    pillars: [
      { word: "Christian", title: "By faith", text: "Before business success, we build people and trust. We pray for each other, work with integrity and share what we have received." },
      { word: "Business", title: "Through work", text: "Everyone's work is at the center. Explain yours clearly, understand each other's, and connect good clients." },
      { word: "Connect", title: "By connection", text: "Owners who struggled alone become a team. Referrals, 1:1s and guest invitations turn relationships into real business and partnership." },
    ],
  },
  why: {
    title: "Why CBC",
    items: [
      { title: "Business is lonely", text: "You make the decisions and carry the weight alone. Companions of faith on the same road change that." },
      { title: "Referrals come from trust", text: "One person's introduction travels further than any ad. Good referrals grow among people who meet regularly and know each other's work." },
      { title: "Faith and work belong together", text: "So that Sunday's faith and the weekday workplace do not drift apart, we build a community that encourages one another at work." },
    ],
  },
  rhythm: {
    eyebrow: "How a group runs",
    title: "One owner per industry, meeting regularly in your region",
    text: "The basic unit of CBC is the regional group, called a 'tent'. Only one owner from each industry joins a tent. Because we do not compete, we can refer clients with an open heart. When a tent has grown well, we plant a new tent to extend connections to more regions and industries.",
    items: ["Tents planted region by region", "One per industry — cooperation, not competition", "New tents are planted at the right time (tent planting)", "A weekly gathering to share work and needs", "Cared for by the tent leader and the team"],
  },
  menu: { about: "About CBC", how: "How it works", join: "First visit", faq: "FAQ" },
  system: {
    eyebrow: "How we are organized",
    title: "How CBC is designed",
    sub: "So that gatherings do not end as one-off meetings, we combine structure, records and care.",
    items: [
      { title: "Tent structure", text: "A regional group. The one-per-industry rule removes competition between members.", points: ["Tents planted by region", "One owner per industry", "New tents planted at the right time (tent planting)", "Open industries go to a waiting list"] },
      { title: "Leadership and care", text: "The tent leader and deputy care for members and review the tent together each month.", points: ["Leader, deputy and coordinators", "Monthly tent review record", "A companion for new members"] },
      { title: "Referrals and thanks", text: "Referral progress is recorded and closed with thanks when it succeeds.", points: ["Sending and receiving referrals with status", "Thank-you records", "No payment for referrals"] },
      { title: "1:1 meetings", text: "One-on-one meetings outside gatherings deepen relationships. Your counterpart's confirmation completes the record.", points: ["Meeting record with confirmation", "Photos only with both people's consent", "Meetings count toward growth"] },
      { title: "Growth record", text: "Reviews the last 90 days across seven areas and suggests your next step.", points: ["Growth levels, not rankings", "Lighter goals for new members", "A yearly renewal conversation"] },
      { title: "Learning and mission", text: "Learn together in the academy; for members with a heart for it, mission work opens.", points: ["Academy completion records", "Mission access by request and approval", "Mission work is optional"] },
    ],
  },
  levels: {
    title: "Growth levels: from peg to lantern",
    sub: "Four levels borrowed from pitching a tent. They show direction, not a score to chase.",
    items: [
      { name: "Peg", text: "Just starting, or with little activity. A leader reaches out first." },
      { name: "Pole", text: "Keeping up the basic activities steadily." },
      { name: "Canvas", text: "Steadily building up one another." },
      { name: "Lantern", text: "Lighting the way for others." },
    ],
  },
  agenda: {
    title: "How a regular gathering flows",
    sub: "Details vary by tent. This is an example of the basic flow.",
    items: [
      { title: "Welcome and prayer", text: "Greet each other and open in prayer together." },
      { title: "Introduce my work", text: "One member shares their work and the connections they want in depth." },
      { title: "Referrals and needs", text: "Members share people they can introduce and help they need." },
      { title: "Thanks", text: "Give thanks for referrals that worked and help received." },
      { title: "Closing", text: "Announce the next gathering and close in prayer." },
    ],
  },
  gloss: { title: "Terms", items: [{ term: "Tent", text: "a regional group" }, { term: "Tent leader", text: "the leader who cares for a tent" }, { term: "Partnership", text: "working together for the same purpose" }, { term: "Tent planting", text: "starting a new tent" }] },
  slots: { tent: "Seoul ○○ tent (example)", filledLabel: "Industries taken (example)", youLabel: "Your seat", openLabel: "Industries still open", you: "My industry", filled: ["Body shop", "Tax & accounting", "Real estate", "Insurance", "Interior design", "Video production", "Dentist", "Law", "Cafe", "Web development", "Printing & ads", "Moving & logistics", "Tutoring", "Florist", "Health foods", "Travel agency"], open: ["Oriental medicine", "Pharmacy", "Optician", "Laundry"], note: "The diagram explains the structure; it is not the actual membership. Only one owner joins per industry." },
  path: {
    title: "From first visit to your first 90 days",
    sub: "New members get lighter goals and step-by-step guidance.",
    steps: [
      { title: "Inquire", text: "Leave an inquiry and the team will contact you and point you to a nearby tent without an overlapping industry." },
      { title: "Observe a gathering", text: "The tent leader welcomes you and you see members share their work at a regular gathering." },
      { title: "Introduce yourself", text: "Visitors briefly introduce their work and the connections they need." },
      { title: "Join and get a tent", text: "If you want to join, apply; once your industry is confirmed and you are approved, the member app opens." },
      { title: "First 1:1", text: "Meet one person one-on-one first to learn about each other's work." },
      { title: "First referral and thanks", text: "Introduce someone who could be a client, and say thank you when it works out." },
    ],
  },
  photoNote: "Photos are illustrative images to aid understanding.",
  synergy: {
    eyebrow: "The CBC synergy",
    title: "One introduction becomes work for three people",
    sub: "Below is an illustrative story to show what happens in CBC.",
    roles: [
      { tag: "Me", name: "Video production owner", note: "CBC tent member" },
      { tag: "B", name: "Body shop owner", note: "Member of the same tent" },
      { tag: "A", name: "Marketing company owner", note: "My acquaintance (not a member)" },
    ],
    steps: [
      { who: "A", title: "A need appears", text: "Mr. A's car was damaged. He is scrolling reviews, looking for a body shop he can trust." },
      { who: "Me", title: "Weekly gatherings built trust", text: "Meeting every week in our tent, I already knew how B works and that he is honest." },
      { who: "Me", title: "I introduce with confidence", text: "\"I know him — he fixes cars honestly and well.\" One sentence connects A and B." },
      { who: "B", title: "B takes care of the referred customer", text: "Because the customer came by referral, B puts extra care into the repair and A is satisfied." },
      { who: "A", title: "Gratitude comes back as work", text: "Grateful, A hires me for a video project he happened to need." },
    ],
    gainsTitle: "What everyone gained from one introduction",
    gains: [
      { who: "A", text: "Found a trustworthy shop right away, without wandering." },
      { who: "B", text: "Gained a trusting new customer without ad spend." },
      { who: "Me", text: "Thanks came back as work, and two relationships deepened." },
    ],
    whyTitle: "Why it works in CBC",
    why: [
      { title: "No competitors", text: "There is only one body shop in a tent, so referrals flow to B without hesitation." },
      { title: "We know each other", text: "Meeting weekly and hearing each other's work, we refer only people we trust." },
      { title: "It circulates", text: "Record the referral and thanks in the app, and help received becomes the next referral." },
    ],
    math: { value: "435", unit: "", text: "possible 1:1 relationships in a 30-member tent (30 × 29 ÷ 2). 45 with 10 members, 190 with 20 — connections grow faster as people join." },
    note: "No money is exchanged for referrals. The work in this story is not payment for the referral; it is an ordinary deal born of trust.",
  },
  photos: { hero: "Business owners laughing around a cafe table", workplace: "A smiling owner in her own shop", gathering: "Members talking in a circle at a regular gathering", oneToOne: "Two owners in a one-on-one conversation over coffee", referral: "Two owners shaking hands and exchanging a card", prayer: "Business people quietly praying together" },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "What if my industry is already taken?", a: "You can join the waiting list, and we will let you know when a spot opens or a nearby tent has your industry free." },
      { q: "Must I take part in mission work (WMTO)?", a: "No. CBC membership is separate from mission work. Only those with a heart for missions request it or are designated by their tent leader." },
      { q: "Do I get paid for referrals?", a: "No payment is exchanged for referrals. We express our heart by saying thank you once it works out." },
      { q: "How is my personal information used?", a: "Only within what you consented to for running the group, and 1:1 photos are kept only when both people agree." },
    ],
    more: "We explain the detailed way of running things after you send an inquiry.",
  },
  trust: {
    title: "What we hold to",
    items: ["No payment for referrals. Thanks is an expression of the heart.", "1:1 photos are kept only with both people's consent and are visible only to the two of them, the leader and the team.", "Scores alone never decide membership. Leaders and the team talk with you and decide together."],
  },
  mission: {
    eyebrow: "If your heart is for missions",
    title: "Join mission work with your workplace gifts",
    text: "Members whose hearts are opened toward missions can request access, or be designated by a group leader, to take part in mission work (WMTO): mentoring and self-reliance reports alongside missionaries, and a revolving fund.",
    cta: "Learn about the mission work", note: "Mission access is granted after a request and approval. It does not open automatically for everyone.",
  },
  final: { title: "We are waiting for you", text: "Leave an inquiry and we will point you to a group near you.", join: "Ask to join", contact: "Contact us" },
  footer: { privacy: "Privacy policy", contact: "Contact", note: `© ${new Date().getFullYear()} ${BRAND} · ${BRAND_FULL}` },
};

export const cbcCopy = { ko, en };
export const isCbcLocale = (v: unknown): v is CbcLocale => v === "ko" || v === "en";
