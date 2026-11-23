import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function markProcessed(fd: FormData) {
  "use server";
  await requireAdmin();
  const db = createSupabaseAdminClient();
  await db.from("deletion_requests").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", String(fd.get("id"))).eq("status", "requested");
  revalidatePath("/admin/privacy");
}

export default async function AdminPrivacy() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("deletion_requests").select("id,member_id,reason,status,created_at,processed_at").order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as { id: string; member_id: string; reason: string | null; status: "requested" | "processed" | "cancelled"; created_at: string }[];
  const ids = rows.map((r) => r.member_id);
  const { data: people } = ids.length ? await supabase.from("members").select("id,name,email").in("id", ids) : { data: [] };
  const who = new Map((people ?? []).map((p) => [p.id as string, p as { name: string; email: string }]));
  const label = { requested: "요청됨", processed: "처리 완료", cancelled: "취소됨" } as const;
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">탈퇴·개인정보 요청</h1>
      <p className="max-w-2xl text-soft">회원이 탈퇴를 요청하면 여기에 쌓입니다. 앱 계정과 회원 정보를 정리한 뒤(Supabase 계정 삭제, 법령상 보관 대상 분리 등) "처리 완료"를 눌러 주세요. 자동으로 지우지 않습니다.</p>
      <ul className="mt-8 divide-y divide-black/[0.06]">
        {rows.length === 0 && <li className="py-6 text-soft">요청이 없습니다.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <b>{who.get(r.member_id)?.name ?? "-"}</b> <span className="text-soft">{who.get(r.member_id)?.email ?? ""}</span>
              <span className="ml-2 text-xs font-semibold">{label[r.status]}</span>
              {r.reason && <span className="mt-0.5 block text-sm text-soft">{r.reason}</span>}
              <span className="block text-xs text-soft">{new Date(r.created_at).toLocaleDateString("ko-KR")}</span>
            </span>
            {r.status === "requested" && <form action={markProcessed}><input type="hidden" name="id" value={r.id} /><button className="cbtn cbtn-sm">처리 완료</button></form>}
          </li>
        ))}
      </ul>
    </>
  );
}
