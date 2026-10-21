// 활동 점수: 순위가 아니라 "이번 달 걸어온 길"을 돌아보는 참고용입니다.
// 가중치는 docs/02-app.md 4장의 활동 항목(출석, 멘토링, 자립 리포트, 매칭, 리퍼럴 등)을 따릅니다.
export const WEIGHTS = {
  attendance: 1,
  mentoring: 3,
  reports: 3,
  referrals: 2,
  letters: 1,
  matchings: 2,
} as const;

export type ActivityCounts = Record<keyof typeof WEIGHTS, number>;

export const activityScore = (c: Partial<ActivityCounts>) =>
  (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce((sum, k) => sum + WEIGHTS[k] * (c[k] ?? 0), 0);
