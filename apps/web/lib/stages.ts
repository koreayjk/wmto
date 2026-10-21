// docs/00-wmto-overview.md 6장. 코드 값은 DB enum 과 동일합니다.
export const mentorStages = ["seed", "sower", "harvester", "elder"] as const;
export const partnerStages = ["ready", "launch", "growing", "self_sustaining"] as const;
export type MentorStage = (typeof mentorStages)[number];
export type PartnerStage = (typeof partnerStages)[number];
