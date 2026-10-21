import { z } from "zod";
import {
  applicationTypes,
  campTracks,
  contributionTypes,
  roles,
  sponsorKinds,
  sponsorTypes,
  type ApplicationType,
  type Role,
} from "./codes";

const text = (max = 500) => z.string().trim().max(max);
const required = (max = 200) => text(max).min(1);
const optional = (max = 500) =>
  text(max).transform((v) => (v === "" ? undefined : v)).optional();

const base = {
  name: required(100),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: optional(50),
  country: optional(100),
  message: optional(3000),
  consent: z.literal("on"),
};

const list = <T extends readonly [string, ...string[]]>(values: T) =>
  z.array(z.enum(values)).default([]);

export const applicationSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("observe"),
    role: z.enum(roles),
    preferredSchedule: optional(200),
  }),
  z.object({
    ...base,
    type: z.literal("mentor_join"),
    businessName: optional(200),
    industry: optional(200),
    contributionTypes: list(contributionTypes).pipe(z.array(z.enum(contributionTypes)).min(1)),
  }),
  z.object({
    ...base,
    type: z.literal("partner_consult"),
    missionField: required(200),
    sendingOrg: optional(200),
    businessIdea: optional(1000),
  }),
  z.object({
    ...base,
    type: z.literal("camp_apply"),
    missionField: required(200),
    track: z.enum(campTracks),
  }),
  z.object({
    ...base,
    type: z.literal("camp_instructor"),
    industry: required(200),
    teachableFields: required(500),
    availability: required(200),
  }),
  z.object({
    ...base,
    type: z.literal("sponsor_inquiry"),
    sponsorType: z.enum(sponsorTypes),
    churchName: optional(200),
    interestedKinds: list(sponsorKinds),
  }),
  z.object({ ...base, type: z.literal("contact") }),
]);

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** 신청 유형 → 회원 역할. contact 는 역할을 알 수 없습니다. */
export function roleForApplication(input: ApplicationInput): Role | null {
  switch (input.type) {
    case "observe":
      return input.role;
    case "mentor_join":
    case "camp_instructor":
      return "mentor";
    case "partner_consult":
    case "camp_apply":
      return "partner";
    case "sponsor_inquiry":
      return "sponsor";
    case "contact":
      return null;
  }
}

/** FormData → 스키마 입력. 체크박스(복수)는 getAll 로 모읍니다. */
export function formDataToObject(fd: FormData): Record<string, unknown> {
  const multi = new Set(["contributionTypes", "interestedKinds"]);
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    out[key] = multi.has(key) ? fd.getAll(key) : fd.get(key);
  }
  for (const key of multi) if (!(key in out)) out[key] = [];
  return out;
}

export { applicationTypes };
export type { ApplicationType };
