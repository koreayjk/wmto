// 사진 교체: public/images/ 에 파일을 넣고 아래 경로만 채우면 모든 페이지에 반영됩니다.
// null 이면 단정한 자리표시가 보입니다. 권장 비율은 각 항목 옆에 적어 두었습니다.
export const photos = {
  hero: null as string | null, // 4:5 세로. 선교지 작은 가게·공방에서 일하는 선교사
  problem: null as string | null,
  how: null as string | null, // 4:3. 사업가가 가르치는 장면
  camp: null as string | null, // 4:3. 필리핀 선교본부와 훈련 현장
  fund: null as string | null,
  mentor: null as string | null, // 16:10. 함께 웃는 사업가
  partner: null as string | null, // 16:10. 선교사와 멘토
  sponsor: null as string | null,
  about: null as string | null,
  final: null as string | null,
  base: null as string | null, // 4:3. 훈련 거점 시설
};
export type PhotoKey = keyof typeof photos;
