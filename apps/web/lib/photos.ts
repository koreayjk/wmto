// 사진 교체: public/images/ 에 파일을 넣고 아래 경로만 채우면 모든 페이지에 반영됩니다.
// null 이면 따뜻한 그라데이션 자리표시가 보입니다.
export const photos = {
  hero: null as string | null, // 선교 현장: 작은 가게·공방에서 일하는 선교사
  problem: null as string | null,
  how: null as string | null,
  camp: null as string | null, // 필리핀 선교본부
  fund: null as string | null,
  mentor: null as string | null, // 함께 웃는 사업가
  partner: null as string | null,
  sponsor: null as string | null,
  about: null as string | null,
  final: null as string | null,
  base: null as string | null, // 훈련 거점 시설 사진
};
export type PhotoKey = keyof typeof photos;
