// docs/00-wmto-overview.md 의 코드 값. DB enum 과 동일하게 유지합니다.
export const roles = ["mentor", "partner", "sponsor"] as const;
export const contributionTypes = ["skill", "coach", "channel", "advisor"] as const;
export const sponsorTypes = ["individual", "church"] as const;
export const sponsorKinds = ["one_to_one", "camp", "fund", "monthly"] as const;
export const applicationTypes = [
  "observe",
  "mentor_join",
  "partner_consult",
  "camp_apply",
  "camp_instructor",
  "sponsor_inquiry",
  "contact",
] as const;
export const applicationStatuses = ["new", "contacted", "done"] as const;
export const eventTypes = ["online", "offline", "camp", "conference"] as const;
export const campTracks = ["business", "marketing", "digital", "skill"] as const;

export type Role = (typeof roles)[number];
export type ContributionType = (typeof contributionTypes)[number];
export type SponsorType = (typeof sponsorTypes)[number];
export type SponsorKind = (typeof sponsorKinds)[number];
export type ApplicationType = (typeof applicationTypes)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type EventType = (typeof eventTypes)[number];

export function isApplicationType(v: unknown): v is ApplicationType {
  return typeof v === "string" && (applicationTypes as readonly string[]).includes(v);
}

/** 한국의 시·도 (텐트는 이 단위로 자동 배정됩니다). 광역시는 따로 둡니다. */
export const krRegions = ["서울", "경기도", "충청남도", "충청북도", "강원도", "전라남도", "전라북도", "경상남도", "경상북도", "제주도", "부산", "대구", "인천", "광주", "대전", "울산", "세종"] as const;
