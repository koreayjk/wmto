import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { roles, type Role } from "@/lib/codes";
import { getMessages } from "@/lib/i18n";

type Member = { id: string; role: Role | null; name: string; email: string; phone: string | null; country: string | null; status: "applicant" | "active" | "inactive"; auth_user_id: string | null; created_at: string };

const statusLabel = { applicant: "신청자", active: "활성", inactive: "비활성" } as const;

/** 이미 가입된 이메일이면 기존 auth 사용자를 찾아 연결합니다. */
async function findAuthUserId(db: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
  }
  return null;
}

async function approve(fd: FormData) {
  "use server";
  await requireAdmin(); // 관리자 확인 후, 계정 생성은 서비스 키로 수행
  const db = createSupabaseAdminClient();
  const id = String(fd.get("id"));
  const { data: m } = await db.from("members").select("id,email,role,auth_user_id").eq("id", id).single();
  if (!m) return;
  const role = (m.role ?? String(fd.get("role"))) as Role;
  if (!(roles as readonly string[]).includes(role)) return;

  let userId: string | null = m.auth_user_id;
  if (!userId) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const { data, error } = await db.auth.admin.inviteUserByEmail(m.email, { redirectTo: `${site}/auth/confirm?next=/connect`, data: { wmto_member: true } });
    userId = data?.user?.id ?? (error ? await findAuthUserId(db, m.email) : null);
  }
  if (!userId) { console.error("approve: could not create or find auth user for", m.email); return; }

  await db.from("members").update({ status: "active", role, auth_user_id: userId }).eq("id", id);
  // 역할 프로필 행 보장 (이미 있으면 그대로 두어 신청 시 입력값과 단계를 보존)
  await db.from(`${role}_profiles`).upsert({ member_id: id }, { onConflict: "member_id", ignoreDuplicates: true });
  revalidatePath("/admin/members");
}

async function setStatus(fd: FormData) {
  "use server";
  await requireAdmin();
  const status = String(fd.get("status"));
  if (status !== "inactive" && status !== "active") return;
  const db = createSupabaseAdminClient();
  await db.from("members").update({ status }).eq("id", String(fd.get("id"))).not("auth_user_id", "is", null);
  revalidatePath("/admin/members");
}

export default async function AdminMembers() {
  const { supabase } = await requireAdmin();
  const roleLabel = getMessages().apply.options.role;
  const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false }).limit(300);
  const members = (data ?? []) as Member[];
  const applicants = members.filter((x) => x.status === "applicant");
  const others = members.filter((x) => x.status !== "applicant");

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">회원 관리</h1>
      <p className="mt-2 text-sm text-soft">승인하면 앱 계정이 만들어지고 초대 메일이 발송됩니다.</p>

      <h2 className="mt-8 text-sm font-semibold text-clay">신청자 ({applicants.length})</h2>
      <ul className="mt-2 divide-y divide-black/10 border-y border-black/10">
        {applicants.length === 0 && <li className="py-6 text-soft">승인 대기 중인 신청자가 없습니다.</li>}
        {applicants.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <b>{x.name}</b> <span className="text-soft">{x.email}{x.country ? ` · ${x.country}` : ""}</span>
              <span className="ml-2 text-xs text-clay">{x.role ? roleLabel[x.role] : "역할 미정"}</span>
            </span>
            <form action={approve} className="flex items-center gap-2">
              <input type="hidden" name="id" value={x.id} />
              {!x.role && (
                <select name="role" required defaultValue="" className="border border-black/20 px-2 py-1">
                  <option value="" disabled>역할</option>
                  {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                </select>
              )}
              <button className="bg-clay px-4 py-1.5 text-white rounded-lg">승인·초대</button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-sm font-semibold text-clay">회원 ({others.length})</h2>
      <ul className="mt-2 divide-y divide-black/10 border-y border-black/10">
        {others.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>
              {x.name} <span className="text-soft">{x.email}</span>
              <span className="ml-2 text-xs text-clay">{x.role ? roleLabel[x.role] : "-"} · {statusLabel[x.status]}</span>
            </span>
            <form action={setStatus}>
              <input type="hidden" name="id" value={x.id} />
              <input type="hidden" name="status" value={x.status === "active" ? "inactive" : "active"} />
              <button className="text-sm text-soft hover:text-clay">{x.status === "active" ? "비활성화" : "활성화"}</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
