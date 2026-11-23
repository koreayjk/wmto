import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

async function decide(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.rpc("decide_mission_request", { p_id: String(fd.get("id")), p_approve: fd.get("approve") === "1", p_note: String(fd.get("note") ?? "") });
  revalidatePath("/admin/mission");
}
async function designate(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.rpc("designate_mission", { p_member: String(fd.get("member")), p_grant: fd.get("grant") === "1" });
  revalidatePath("/admin/mission");
}

const label = { none: "없음", requested: "신청 중", approved: "열림", revoked: "닫힘" } as const;

export default async function AdminMission() {
  const { supabase } = await requireAdmin();
  const [{ data: pend }, { data: people }] = await Promise.all([
    supabase.rpc("pending_mission_requests"),
    supabase.from("members").select("id,name,mission_status,chapter").eq("role", "mentor").eq("status", "active").order("name").limit(500),
  ]);
  const pending = (pend ?? []) as { id: string; name: string; business_name: string | null; industry: string | null; chapter_name: string | null; message: string | null }[];
  const list = (people ?? []) as { id: string; name: string; mission_status: keyof typeof label; chapter: string | null }[];
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">선교 권한</h1>
      <p className="max-w-2xl text-soft">사업가 회원이 선교(WMTO) 메뉴를 쓰려면 권한이 필요합니다. 회원이 신청하면 여기나 텐트장 화면에서 승인하고, 신청 없이 직접 열거나 닫을 수도 있습니다. 기존 사업가는 시작 시 모두 열린 상태로 두었습니다.</p>

      <h2 className="mt-8 text-sm font-medium">승인 대기 {pending.length}건</h2>
      {pending.length === 0 ? <p className="mt-2 text-soft">대기 중인 신청이 없습니다.</p> : (
        <ul className="mt-3 divide-y divide-black/[0.06]">
          {pending.map((p) => (
            <li key={p.id} className="py-4">
              <p className="font-medium">{p.name} <span className="text-sm font-normal text-soft">{[p.chapter_name, p.business_name, p.industry].filter(Boolean).join(" · ")}</span></p>
              {p.message && <p className="mt-1 text-sm text-soft">{p.message}</p>}
              <form action={decide} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="note" placeholder="메모(선택)" maxLength={500} className="field !w-56" />
                <button name="approve" value="1" className="cbtn">승인</button>
                <button name="approve" value="0" className="cbtn cbtn-quiet">거절</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-sm font-medium">사업가별 상태</h2>
      <ul className="mt-3 divide-y divide-black/[0.06]">
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{p.name} <span className="text-sm text-soft">{p.chapter ?? ""}</span> <span className="ml-2 text-xs font-semibold">{label[p.mission_status]}</span></span>
            <form action={designate} className="flex gap-2"><input type="hidden" name="member" value={p.id} />
              <button name="grant" value="1" className="cbtn">열기</button>
              <button name="grant" value="0" className="cbtn cbtn-quiet">닫기</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
