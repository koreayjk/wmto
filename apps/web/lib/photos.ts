// 사진 교체: public/images/ 에 파일을 넣고 아래 경로를 바꾸면 모든 페이지에 반영됩니다.
// null 이면 단정한 자리표시가 보입니다. 현재 사진은 Unsplash 무료 라이선스 대체 사진입니다.
// 출처는 docs/photo-credits.md. 실제 WMTO 사진이 생기면 같은 이름으로 교체하세요.
export const photos = {
  hero: "/images/hero.jpg", // 가로 3:2. 필리핀 교회에서 함께 예배하는 장면
  problem: null as string | null,
  how: "/images/how.jpg", // 커피 수확 (자립 사업 이야기)
  camp: "/images/camp.jpg", // 기술 훈련 현장
  fund: "/images/fund.jpg", // 재봉 (창업 소재)
  mentor: "/images/mentor.jpg", // 제빵 (기술 전수)
  partner: "/images/partner.jpg", // 작은 가게를 운영하는 사람
  sponsor: "/images/sponsor.jpg", // 커피 열매
  about: "/images/about.jpg", // 손으로 일하는 사람
  final: null as string | null,
  base: null as string | null, // 필리핀 선교본부 시설 사진은 실제 사진이 필요합니다
};

/** 사진마다 얼굴·피사체가 잘 보이도록 잘라내는 기준점 */
export const photoPosition: Partial<Record<keyof typeof photos, string>> = {
  hero: "50% 35%",
  partner: "50% 58%",
  fund: "50% 40%",
};
export type PhotoKey = keyof typeof photos;
