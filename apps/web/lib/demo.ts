import { createSupabaseAdminClient } from "@/lib/supabase/server";

/** 공개 데모 계정 (supabase/migrations/0007_demo_viewer.sql). 비밀번호 없이 서버가 세션을 만들어 줍니다. */
export const DEMO_EMAIL = process.env.DEMO_ACCOUNT_EMAIL || "wmto-demo@example.com";
export const DEMO_DOMAIN = "@demo.wmto.invalid";
export const demoModes = ["mentor", "partner", "sponsor"] as const;
export type DemoMode = (typeof demoModes)[number];

type Admin = ReturnType<typeof createSupabaseAdminClient>;

/** 모드마다 활동이 가장 풍부한 데모 회원을 고릅니다(매칭 수, 후원 수 기준). */
export async function pickDemoMember(mode: DemoMode): Promise<string | null> {
  const db = createSupabaseAdminClient();
  const { data: people } = await db.from("members").select("id").eq("role", mode).eq("status", "active").like("email", `%${DEMO_DOMAIN}`).limit(300);
  const ids = (people ?? []).map((p) => p.id as string);
  if (!ids.length) return null;
  const score = new Map<string, number>();
  if (mode === "sponsor") {
    const { data } = await db.from("donations").select("sponsor_id").in("sponsor_id", ids);
    (data ?? []).forEach((d) => score.set(d.sponsor_id, (score.get(d.sponsor_id) ?? 0) + 1));
  } else {
    const col = mode === "mentor" ? "mentor_id" : "partner_id";
    const { data } = await db.from("matchings").select(col).in(col, ids);
    (data ?? []).forEach((d) => { const k = (d as unknown as Record<string, string>)[col]; score.set(k, (score.get(k) ?? 0) + 1); });
  }
  return [...ids].sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0))[0];
}

async function findUserId(db: Admin, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
  }
  return null;
}

/** 데모 계정이 없으면 만들고, demo_viewers 에 등록합니다. */
export async function ensureDemoUser(db: Admin) {
  let id: string | null = null;
  const created = await db.auth.admin.createUser({ email: DEMO_EMAIL, email_confirm: true, user_metadata: { wmto_demo: true } });
  id = created.data.user?.id ?? (await findUserId(db, DEMO_EMAIL));
  if (!id) throw new Error("demo user unavailable");
  await db.from("demo_viewers").upsert({ user_id: id }, { onConflict: "user_id" });
  return id;
}
