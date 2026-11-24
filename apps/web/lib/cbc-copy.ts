import { BRAND, BRAND_FULL, BRAND_FULL_KO } from "./brand";

export type CbcLocale = "ko" | "en";

type Copy = {
  meta: { title: string; description: string };
  nav: { mission: string; login: string; other: string };
  hero: { eyebrow: string; title: string; sub: string; join: string; login: string };
  concept: { eyebrow: string; title: string; lead: string; pillars: { word: string; title: string; text: string }[] };
  why: { title: string; items: { title: string; text: string }[] };
  rhythm: { eyebrow: string; title: string; text: string; items: string[] };
  photos: Record<"hero" | "workplace" | "gathering" | "oneToOne" | "referral" | "prayer", string>;
  how: { title: string; items: { title: string; text: string }[] };
  journey: { title: string; sub: string; steps: { title: string; text: string }[] };
  faq: { title: string; items: { q: string; a: string }[]; more: string };
  trust: { title: string; items: string[] };
  mission: { eyebrow: string; title: string; text: string; cta: string; note: string };
  final: { title: string; text: string; join: string; contact: string };
  footer: { privacy: string; contact: string; note: string };
};

const ko: Copy = {
  meta: { title: `${BRAND} · ${BRAND_FULL_KO}`, description: "일터에서 서로 소개하고 세워 주는 크리스천 사업가 모임. 업종마다 한 사람, 정기 모임, 1:1 만남, 손님 초대, 성장 기록을 한 앱에서." },
  nav: { mission: "선교 사역(WMTO)", login: "회원 로그인", other: "English" },
  hero: {
    eyebrow: `${BRAND_FULL_KO} · 크리스천 사업가 네트워크`,
    title: "일터에서 서로 소개하고,\n함께 자라는 모임",
    sub: "같은 업종은 한 모임에 한 분. 경쟁하지 않고 서로의 고객을 연결해 주는 사업가 모임입니다. 정기 모임과 1:1 만남, 감사와 배움을 하나의 앱에서 이어 갑니다.",
    join: "입회 문의", login: "회원 로그인",
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
    text: "CBC의 기본 단위는 지역 모임인 '텐트'입니다. 같은 업종의 사업가는 한 텐트에 한 분만 들어옵니다. 서로 경쟁하지 않으니 마음 놓고 고객을 소개할 수 있습니다.",
    items: ["지역별 텐트, 한 텐트 최대 50명", "업종당 한 분 — 경쟁이 아닌 협력", "정기 모임에서 서로의 일과 필요를 나눔", "텐트장과 운영진이 함께 돌봄"],
  },
  photos: { hero: "카페 테이블에 둘러앉아 웃으며 이야기하는 사업가들", workplace: "자기 가게에서 미소 짓는 사업가", gathering: "정기 모임에서 둘러앉아 이야기를 나누는 회원들", oneToOne: "커피를 사이에 두고 일대일로 대화하는 두 사업가", referral: "악수하며 명함을 건네는 두 사업가", prayer: "조용히 함께 기도하는 사업가들" },
  how: {
    title: "CBC에서 함께하는 일",
    items: [
      { title: "지역 모임(텐트)", text: "지역별로 모이고, 한 모임에는 같은 업종의 사업가가 한 분만 들어옵니다. 한 모임은 최대 50명입니다." },
      { title: "소개와 감사", text: "서로의 고객이 될 만한 분을 소개하고, 진행 상태를 나누고, 성사되면 감사를 전합니다." },
      { title: "1:1 만남", text: "모임 밖에서도 일대일로 만나 서로의 일을 깊이 알고, 만남을 간단한 양식으로 남깁니다. 상대가 확인하면 기록이 완성됩니다." },
      { title: "손님 초대", text: "함께하면 좋을 분을 모임에 초대합니다. 참석은 텐트장이 확인합니다." },
      { title: "성장 기록", text: "최근 90일의 활동을 점수와 단계로 돌아봅니다. 순위가 아니라, 다음 걸음을 찾는 도구입니다." },
      { title: "배움", text: "아카데미 강의를 보고 이수를 기록합니다. 새로 온 분은 처음 90일 동안 목표를 낮춰 드립니다." },
    ],
  },
  journey: {
    title: "처음 90일, 이렇게 시작합니다",
    sub: "처음 오신 분에게는 목표를 낮추고 한 걸음씩 안내합니다.",
    steps: [
      { title: "입회 문의", text: "문의를 남기면 운영진이 연락드리고, 업종이 겹치지 않는 가까운 텐트를 안내합니다." },
      { title: "텐트 배정", text: "승인되면 지역 텐트에 들어가 같은 텐트 회원들과 인사합니다." },
      { title: "첫 모임과 1:1", text: "정기 모임에 참석하고, 먼저 한 분과 일대일로 만나 서로의 일을 알아 갑니다." },
      { title: "첫 소개와 감사", text: "서로의 고객이 될 만한 분을 소개하고, 성사되면 감사를 전합니다." },
      { title: "성장과 배움", text: "최근 활동을 돌아보며 다음 걸음을 정하고, 아카데미로 함께 배웁니다." },
    ],
  },
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
  final: { title: "함께할 분을 기다립니다", text: "입회 문의를 남겨 주시면 가까운 지역 텐트를 안내해 드립니다.", join: "입회 문의", contact: "문의하기" },
  footer: { privacy: "개인정보처리방침", contact: "문의", note: `© ${new Date().getFullYear()} ${BRAND} · ${BRAND_FULL_KO}` },
};

const en: Copy = {
  meta: { title: `${BRAND} · ${BRAND_FULL}`, description: "A Christian business community where members refer and build each other up. One owner per industry, regular gatherings, 1:1s, guests and growth in one app." },
  nav: { mission: "Mission work (WMTO)", login: "Member login", other: "한국어" },
  hero: {
    eyebrow: `${BRAND_FULL} · Christian business network`,
    title: "A community that refers,\nand grows, together",
    sub: "One business per industry in each group, so we don't compete — we connect each other's clients. Gatherings, 1:1 meetings, gratitude and learning, all in one app.",
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
    text: "The basic unit of CBC is the regional group, called a 'tent'. Only one owner from each industry joins a tent. Because we do not compete, we can refer clients with an open heart.",
    items: ["Regional tents, up to 50 members each", "One per industry — cooperation, not competition", "Regular gatherings to share work and needs", "Cared for by the tent leader and the team"],
  },
  photos: { hero: "Business owners laughing around a cafe table", workplace: "A smiling owner in her own shop", gathering: "Members talking in a circle at a regular gathering", oneToOne: "Two owners in a one-on-one conversation over coffee", referral: "Two owners shaking hands and exchanging a card", prayer: "Business people quietly praying together" },
  how: {
    title: "What we do together",
    items: [
      { title: "Local groups (tents)", text: "Members meet by region. Each group has just one owner per industry, and holds up to 50 members." },
      { title: "Referrals and thanks", text: "Introduce people who could become each other's clients, share progress, and say thank you when it works out." },
      { title: "1:1 meetings", text: "Meet one-on-one outside the gathering, learn each other's work, and log it in a short form. Your counterpart confirms it." },
      { title: "Guest invitations", text: "Invite someone who would benefit from joining. The group leader confirms attendance." },
      { title: "Growth record", text: "Look back on the last 90 days as a score and a level. It is not a ranking — it helps you find your next step." },
      { title: "Learning", text: "Watch academy lessons and record completion. New members get lighter goals for their first 90 days." },
    ],
  },
  journey: {
    title: "Your first 90 days",
    sub: "New members get lighter goals and step-by-step guidance.",
    steps: [
      { title: "Ask to join", text: "Leave an inquiry and the team will contact you and point you to a nearby tent without an overlapping industry." },
      { title: "Join a tent", text: "Once approved, you join a regional tent and meet its members." },
      { title: "First gathering and 1:1", text: "Attend a gathering and meet one person one-on-one to learn about each other's work." },
      { title: "First referral and thanks", text: "Introduce someone who could be a client, and say thank you when it works out." },
      { title: "Growth and learning", text: "Look back on recent activity, decide your next step, and learn together in the academy." },
    ],
  },
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
