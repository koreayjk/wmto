import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { mentorStages, partnerStages } from "@/lib/stages";
import { fmtDate } from "@/lib/format";

async function promote(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const to = String(fd.get("to"));
  if (!to) return;
  // admin_set_stage 는 관리자 확인·단계 값 검증·이력 기록을 DB 에서 수행합니다.
  await supabase.rpc("admin_set_stage", { p_member: String(fd.get("member_id")), p_to: to, p_note: String(fd.get("note") ?? "").trim() || null });
  revalidatePath("/admin/stages");
}

export default async function AdminStages() {
  const { supabase } = await requireAdmin();
  const n = getMessages().connect.stageNames;
  const label = (s: string) => n[s as keyof typeof n] ?? s;

  const [{ data: sugg }, { data: mp }, { data: pp }, { data: members }, { data: hist }] = await Promise.all([
    supabase.from("promotion_suggestions").select("member_id,role,from_stage,to_stage,reason"),
    supabase.from("mentor_profiles").select("member_id,stage"),
    supabase.from("partner_profiles").select("member_id,stage"),
    supabase.from("members").select("id,name,role").eq("status", "active").in("role", ["mentor", "partner"]).order("name"),
    supabase.from("stage_history").select("id,member_id,from_stage,to_stage,note,created_at").order("created_at", { ascending: false }).limit(30),
  ]);
  const name = new Map((members ?? []).map((x) => [x.id, x.name]));
  const stage = new Map([...(mp ?? []), ...(pp ?? [])].map((x) => [x.member_id, x.stage as string]));

  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">성장 단계</h1>
      <p className="mt-2 text-sm text-soft">기준을 충족한 회원이 자동으로 제안됩니다. 승인하면 단계가 바뀌고 이력이 남습니다.</p>

      <h2 className="mt-12 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">승급 제안 ({(sugg ?? []).length})</h2>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
        {(sugg ?? []).length === 0 && <li className="py-5 text-soft">제안이 없습니다.</li>}
        {(sugg ?? []).map((s) => (
          <li key={`${s.member_id}-${s.to_stage}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <b>{name.get(s.member_id) ?? "-"}</b>{" "}
              <span className="text-soft">{label(s.from_stage)} → {label(s.to_stage)}</span>
              <span className="block text-xs text-soft">{s.reason}</span>
            </span>
            <form action={promote}>
              <input type="hidden" name="member_id" value={s.member_id} />
              <input type="hidden" name="to" value={s.to_stage} />
              <input type="hidden" name="note" value={s.reason} />
              <button className="cbtn cbtn-sm">승인</button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">직접 변경</h2>
      <p className="mt-1 text-xs text-soft">캠프 수료(Launch)나 챕터 리더십(Elder)처럼 자동 기준이 없는 경우에 사용합니다.</p>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
        {(members ?? []).map((m) => {
          const stages = m.role === "mentor" ? mentorStages : partnerStages;
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>{m.name} <span className="text-xs text-clay">{label(stage.get(m.id) ?? "")}</span></span>
              <form action={promote} className="flex gap-2">
                <input type="hidden" name="member_id" value={m.id} />
                <select name="to" required defaultValue="" className="field !w-auto !py-1.5 !text-sm">
                  <option value="" disabled>단계</option>
                  {stages.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
                <input name="note" placeholder="사유" className="field !w-auto !py-1.5 !text-sm" />
                <button className="cbtn cbtn-sm">변경</button>
              </form>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">최근 이력</h2>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
        {(hist ?? []).map((h) => (
          <li key={h.id} className="py-3 text-sm">
            {name.get(h.member_id) ?? "-"}: {label(h.from_stage ?? "")} → {label(h.to_stage)}{" "}
            <span className="text-soft">{fmtDate(h.created_at)}{h.note ? ` · ${h.note}` : ""}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
