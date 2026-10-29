"use server";

import { applicationSchema, formDataToObject, roleForApplication } from "@/lib/applications";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/notify";

export type ApplyState = { ok: boolean; error?: "required" | "email" | "consent" | "generic" };

export async function submitApplication(_prev: ApplyState, fd: FormData): Promise<ApplyState> {
  const parsed = applicationSchema.safeParse(formDataToObject(fd));
  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => i.path[0]);
    if (paths.includes("consent")) return { ok: false, error: "consent" };
    if (paths.includes("email")) return { ok: false, error: "email" };
    return { ok: false, error: "required" };
  }
  const input = parsed.data;

  try {
    const db = createSupabaseAdminClient();
    const role = roleForApplication(input);

    // 같은 이메일(대소문자 무시)이면 기존 회원을 재사용하고 applications 만 추가
    const { data: existing, error: findErr } = await db
      .from("members")
      .select("id, role, phone, country, region, district")
      .ilike("email", input.email)
      .maybeSingle();
    if (findErr) throw findErr;

    let memberId: string;
    if (!existing) {
      const { data, error } = await db
        .from("members")
        .insert({
          role,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          country: input.country ?? null,
          region: input.region ?? null,
          district: input.district ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      memberId = data.id;
    } else {
      memberId = existing.id;
      // 비어 있던 정보만 채움. 기존 값과 role 은 덮어쓰지 않음
      const patch: Record<string, unknown> = {};
      if (!existing.role && role) patch.role = role;
      if (!existing.phone && input.phone) patch.phone = input.phone;
      if (!existing.country && input.country) patch.country = input.country;
      if (!existing.region && input.region) patch.region = input.region;
      if (!existing.district && input.district) patch.district = input.district;
      if (Object.keys(patch).length) {
        const { error } = await db.from("members").update(patch).eq("id", memberId);
        if (error) throw error;
      }
    }

    await saveProfile(db, memberId, input);

    const { data: app, error: appErr } = await db
      .from("applications")
      .insert({
        member_id: memberId,
        type: input.type,
        message: input.message ?? null,
        details: detailsFor(input),
      })
      .select("id")
      .single();
    if (appErr) throw appErr;

    await notifyAdmin(input, app.id);
    return { ok: true };
  } catch (e) {
    console.error("submitApplication failed", e);
    return { ok: false, error: "generic" };
  }
}

type Db = ReturnType<typeof createSupabaseAdminClient>;
type Input = ReturnType<typeof applicationSchema.parse>;

// 프로필 테이블에 맞는 값은 프로필에, 나머지는 applications.details 에 저장합니다.
// 프로필 upsert 에서 stage 는 건드리지 않아 기존 단계가 유지됩니다.
async function saveProfile(db: Db, memberId: string, input: Input) {
  switch (input.type) {
    case "mentor_join":
      await check(
        db.from("mentor_profiles").upsert(
          {
            member_id: memberId,
            business_name: input.businessName ?? null,
            industry: input.industry ?? null,
            contribution_types: input.contributionTypes,
          },
          { onConflict: "member_id" },
        ),
      );
      break;
    case "camp_instructor":
      await check(
        db
          .from("mentor_profiles")
          .upsert({ member_id: memberId, industry: input.industry }, { onConflict: "member_id" }),
      );
      break;
    case "partner_consult":
      await check(
        db.from("partner_profiles").upsert(
          {
            member_id: memberId,
            mission_field: input.missionField,
            sending_org: input.sendingOrg ?? null,
            business_idea: input.businessIdea ?? null,
          },
          { onConflict: "member_id" },
        ),
      );
      break;
    case "camp_apply":
      await check(
        db
          .from("partner_profiles")
          .upsert({ member_id: memberId, mission_field: input.missionField }, { onConflict: "member_id" }),
      );
      break;
    case "sponsor_inquiry":
      await check(
        db.from("sponsor_profiles").upsert(
          {
            member_id: memberId,
            sponsor_type: input.sponsorType,
            church_name: input.churchName ?? null,
          },
          { onConflict: "member_id" },
        ),
      );
      break;
  }
}

function detailsFor(input: Input): Record<string, unknown> {
  switch (input.type) {
    case "observe":
      return { role: input.role, preferred_schedule: input.preferredSchedule ?? null };
    case "mentor_join":
      return { contribution_types: input.contributionTypes };
    case "partner_consult":
      return { mission_field: input.missionField, sending_org: input.sendingOrg ?? null };
    case "camp_apply":
      return { mission_field: input.missionField, track: input.track };
    case "camp_instructor":
      return {
        industry: input.industry,
        teachable_fields: input.teachableFields,
        availability: input.availability,
      };
    case "sponsor_inquiry":
      return { sponsor_type: input.sponsorType, interested_kinds: input.interestedKinds };
    default:
      return {};
  }
}

async function check(p: PromiseLike<{ error: unknown }>) {
  const { error } = await p;
  if (error) throw error;
}
