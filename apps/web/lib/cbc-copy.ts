import { BRAND } from "./brand";

export type CbcLocale = "ko" | "en";

type Copy = {
  meta: { title: string; description: string };
  nav: { mission: string; login: string; other: string };
  hero: { eyebrow: string; title: string; sub: string; join: string; login: string };
  how: { title: string; items: { title: string; text: string }[] };
  trust: { title: string; items: string[] };
  mission: { eyebrow: string; title: string; text: string; cta: string; note: string };
  final: { title: string; text: string; join: string; contact: string };
  footer: { privacy: string; contact: string; note: string };
};

const ko: Copy = {
  meta: { title: `${BRAND} · 크리스천 사업가 네트워크`, description: "일터에서 서로 소개하고 세워 주는 크리스천 사업가 모임. 업종마다 한 사람, 정기 모임, 1:1 만남, 손님 초대, 성장 기록을 한 앱에서." },
  nav: { mission: "선교 사역(WMTO)", login: "회원 로그인", other: "English" },
  hero: {
    eyebrow: "크리스천 사업가 네트워크",
    title: "일터에서 서로 소개하고,\n함께 자라는 모임",
    sub: "같은 업종은 한 모임에 한 분. 경쟁하지 않고 서로의 고객을 연결해 주는 사업가 모임입니다. 정기 모임과 1:1 만남, 감사와 배움을 하나의 앱에서 이어 갑니다.",
    join: "입회 문의", login: "회원 로그인",
  },
  how: {
    title: "이렇게 함께합니다",
    items: [
      { title: "지역 모임(텐트)", text: "지역별로 모이고, 한 모임에는 같은 업종의 사업가가 한 분만 들어옵니다. 한 모임은 최대 50명입니다." },
      { title: "소개와 감사", text: "서로의 고객이 될 만한 분을 소개하고, 진행 상태를 나누고, 성사되면 감사를 전합니다." },
      { title: "1:1 만남", text: "모임 밖에서도 일대일로 만나 서로의 일을 깊이 알고, 만남을 간단한 양식으로 남깁니다. 상대가 확인하면 기록이 완성됩니다." },
      { title: "손님 초대", text: "함께하면 좋을 분을 모임에 초대합니다. 참석은 텐트장이 확인합니다." },
      { title: "성장 기록", text: "최근 90일의 활동을 점수와 단계로 돌아봅니다. 순위가 아니라, 다음 걸음을 찾는 도구입니다." },
      { title: "배움", text: "아카데미 강의를 보고 이수를 기록합니다. 새로 온 분은 처음 90일 동안 목표를 낮춰 드립니다." },
    ],
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
  final: { title: "함께할 분을 기다립니다", text: "입회 문의를 남겨 주시면 가까운 지역 텐트를 안내해 드립니다.", join: "입회 문의", contact: "문의하기" },
  footer: { privacy: "개인정보처리방침", contact: "문의", note: `${BRAND}는 서비스 이름(가칭)이며 변경될 수 있습니다.` },
};

const en: Copy = {
  meta: { title: `${BRAND} · Christian business network`, description: "A Christian business community where members refer and build each other up. One owner per industry, regular gatherings, 1:1s, guests and growth in one app." },
  nav: { mission: "Mission work (WMTO)", login: "Member login", other: "한국어" },
  hero: {
    eyebrow: "Christian business network",
    title: "A community that refers,\nand grows, together",
    sub: "One business per industry in each group, so we don't compete — we connect each other's clients. Gatherings, 1:1 meetings, gratitude and learning, all in one app.",
    join: "Ask to join", login: "Member login",
  },
  how: {
    title: "How we gather",
    items: [
      { title: "Local groups (tents)", text: "Members meet by region. Each group has just one owner per industry, and holds up to 50 members." },
      { title: "Referrals and thanks", text: "Introduce people who could become each other's clients, share progress, and say thank you when it works out." },
      { title: "1:1 meetings", text: "Meet one-on-one outside the gathering, learn each other's work, and log it in a short form. Your counterpart confirms it." },
      { title: "Guest invitations", text: "Invite someone who would benefit from joining. The group leader confirms attendance." },
      { title: "Growth record", text: "Look back on the last 90 days as a score and a level. It is not a ranking — it helps you find your next step." },
      { title: "Learning", text: "Watch academy lessons and record completion. New members get lighter goals for their first 90 days." },
    ],
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
  footer: { privacy: "Privacy policy", contact: "Contact", note: `${BRAND} is a working name and may change.` },
};

export const cbcCopy = { ko, en };
export const isCbcLocale = (v: unknown): v is CbcLocale => v === "ko" || v === "en";
