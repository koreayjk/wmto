// 사진 교체: public/images/ 에 파일을 넣고 아래 경로를 바꾸면 모든 페이지에 반영됩니다.
// null 이면 단정한 자리표시가 보입니다. 현재 사진은 Unsplash 무료 라이선스 대체 사진입니다.
// 출처는 docs/photo-credits.md. 실제 WMTO 사진이 생기면 같은 이름으로 교체하세요.
export const photos = {
  hero: "/images/hero.jpg", // 가로 3:2. 카페에서 일하는 사업가(인물이 왼쪽에 있어 글은 오른쪽)
  aboutHero: "/images/about-hero.jpg", // 필리핀 교회에서 함께 예배하는 장면
  market: "/images/market.jpg", // 시장(판로 연결)
  groupTable: "/images/group-table.jpg", // 둘러앉아 상담하는 모습
  community: "/images/community.jpg", // 마을 모임
  problem: null as string | null,
  how: "/images/how.jpg", // 커피 수확 (자립 사업 이야기)
  camp: "/images/camp.jpg", // 기술 훈련 현장
  fund: "/images/fund.jpg", // 재봉 (창업 소재)
  mentor: "/images/mentor.jpg", // 제빵 (기술 전수)
  partner: "/images/partner.jpg", // 작은 가게를 운영하는 사람
  sponsor: "/images/sponsor.jpg", // 커피 열매
  about: "/images/about.jpg", // 손으로 일하는 사람
  story1: "/images/story1.jpg", // 강의실(온라인 모임)
  story4: "/images/story4.jpg", // 시장 노점(자립)
  story5: "/images/story5.jpg", // 웃는 아이들(다음 세대)
  train: "/images/train.jpg", // 주방 훈련(캠프)
  mentorPanel: "/images/mentor-panel.jpg", // 밀가루(기술 전수)
  partnerPanel: "/images/partner-panel.jpg", // 재봉틀(자립 사업)
  final: null as string | null,
  base: null as string | null, // 필리핀 선교본부 시설 사진은 실제 사진이 필요합니다
};

/** 사진마다 얼굴·피사체가 잘 보이도록 잘라내는 기준점 */
export const photoPosition: Partial<Record<keyof typeof photos, string>> = {
  hero: "40% 40%",
  aboutHero: "50% 35%",
  community: "50% 60%",
  partner: "50% 58%",
  story4: "50% 50%",
  story5: "50% 35%",
  train: "50% 45%",
  mentorPanel: "50% 70%",
  fund: "50% 40%",
};
export type PhotoKey = keyof typeof photos;
