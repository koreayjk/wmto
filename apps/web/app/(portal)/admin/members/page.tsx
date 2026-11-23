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

async function waitlist(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.rpc("waitlist_set", { p_member: String(fd.get("id")), p_wait: fd.get("wait") === "1", p_note: String(fd.get("note") ?? "") });
  revalidatePath("/admin/members");
}

type Adm = { member_id: string; category_name: string; region_key: string | null; region_label: string | null; chapters: number | null; open_chapters: number | null; waiting: boolean; waiting_since: string | null };

async function approve(fd: FormData) {
  "use server";
  const { supabase: adminAuthed } = await requireAdmin(); // 관리자 확인 후, 계정 생성은 서비스 키로 수행
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
  await adminAuthed.rpc("waitlist_mark_placed", { p_member: id });
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
  const [{ data }, { data: adm }] = await Promise.all([
    supabase.from("members").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.rpc("admission_overview"),
  ]);
  const admBy = new Map(((adm ?? []) as Adm[]).map((a) => [a.member_id, a]));
  const members = (data ?? []) as Member[];
  const applicants = members.filter((x) => x.status === "applicant");
  const others = members.filter((x) => x.status !== "applicant");

  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">회원 관리</h1>
      <p className="mt-2 text-sm text-soft">승인하면 앱 계정이 만들어지고 초대 메일이 발송됩니다.</p>

      <h2 className="mt-12 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">신청자 ({applicants.length})</h2>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
        {applicants.length === 0 && <li className="py-6 text-soft">승인 대기 중인 신청자가 없습니다.</li>}
        {applicants.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <b>{x.name}</b> <span className="text-soft">{x.email}{x.country ? ` · ${x.country}` : ""}</span>
              <span className="ml-2 text-xs text-clay">{x.role ? roleLabel[x.role] : "역할 미정"}</span>
              {admBy.get(x.id) && (() => {
                const a = admBy.get(x.id)!;
                const open = a.open_chapters ?? 0;
                return (
                  <span className="mt-1 block text-sm text-soft">
                    업종 <b className="text-ink">{a.category_name}</b> · 지역 {a.region_label ?? "미정"} ·{" "}
                    {a.region_key == null ? "지역 정보가 없어 자동 배정이 안 됩니다" : open > 0 ? `이 업종이 비어 있는 텐트 ${open}곳 (바로 입회 가능)` : "이 지역 텐트에 같은 업종이 이미 있어 새 텐트가 열립니다"}
                    {a.waiting && <b className="ml-2 text-accent">대기 중{open > 0 ? " · 자리 났음" : ""}</b>}
                  </span>
                );
              })()}
            </span>
            <form action={approve} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={x.id} />
              {!x.role && (
                <select name="role" required defaultValue="" className="field !w-auto !py-1.5 !text-sm">
                  <option value="" disabled>역할</option>
                  {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                </select>
              )}
              <button className="cbtn cbtn-sm">승인·초대</button>
            </form>
            {admBy.get(x.id) && (
              <form action={waitlist}>
                <input type="hidden" name="id" value={x.id} />
                <input type="hidden" name="wait" value={admBy.get(x.id)!.waiting ? "0" : "1"} />
                <button className="text-sm text-soft underline">{admBy.get(x.id)!.waiting ? "대기 해제" : "업종 대기 명단에 올리기"}</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">회원 ({others.length})</h2>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
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
