import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { contributionTypes } from "@/lib/codes";
import { getMessages } from "@/lib/i18n";

async function create(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const mentor = String(fd.get("mentor_id"));
  const partner = String(fd.get("partner_id"));
  const type = String(fd.get("contribution_type"));
  if (!mentor || !partner || mentor === partner || !(contributionTypes as readonly string[]).includes(type)) return;
  await supabase.from("matchings").insert({ mentor_id: mentor, partner_id: partner, contribution_type: type });
  revalidatePath("/admin/matchings");
}

async function assignRequest(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const reqId = String(fd.get("request_id"));
  const mentor = String(fd.get("mentor_id"));
  if (!reqId || !mentor) return;
  const { data: req } = await supabase.from("matching_requests").select("partner_id,contribution_type,status").eq("id", reqId).single();
  if (!req || req.status !== "pending") return;
  const { error } = await supabase.from("matchings").insert({ mentor_id: mentor, partner_id: req.partner_id, contribution_type: req.contribution_type });
  if (error) return;
  await supabase.from("matching_requests").update({ status: "accepted", mentor_id: mentor, responded_at: new Date().toISOString() }).eq("id", reqId);
  revalidatePath("/admin/matchings");
}

async function end(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("matchings").update({ status: "ended", ended_at: new Date().toISOString().slice(0, 10) }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/matchings");
}

export default async function AdminMatchings() {
  const { supabase } = await requireAdmin();
  const c = getMessages().connect.contribution;
  const [{ data: members }, { data: matchings }, { data: requests }] = await Promise.all([
    supabase.from("members").select("id,name,role,email").eq("status", "active").in("role", ["mentor", "partner"]).order("name"),
    supabase.from("matchings").select("id,mentor_id,partner_id,contribution_type,status,started_at").order("created_at", { ascending: false }),
    supabase.from("matching_requests").select("id,partner_id,contribution_type,message,created_at").eq("status", "pending").order("created_at"),
  ]);
  const mentors = (members ?? []).filter((x) => x.role === "mentor");
  const partners = (members ?? []).filter((x) => x.role === "partner");
  const name = new Map((members ?? []).map((x) => [x.id, x.name]));

  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">매칭 배정</h1>
      <h2 className="mt-10 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">대기 중인 요청 ({(requests ?? []).length})</h2>
      <ul className="mt-2 alist divide-y divide-black/[0.06]">
        {(requests ?? []).length === 0 && <li className="py-5 text-soft">대기 중인 요청이 없습니다.</li>}
        {(requests ?? []).map((r) => (
          <li key={r.id} className="py-4">
            <p><b>{name.get(r.partner_id) ?? "-"}</b> <span className="text-xs text-clay">{c[r.contribution_type as keyof typeof c]}</span></p>
            {r.message && <p className="mt-1 text-sm text-soft">{r.message}</p>}
            <form action={assignRequest} className="mt-2 flex gap-2">
              <input type="hidden" name="request_id" value={r.id} />
              <select name="mentor_id" required defaultValue="" className="field !w-auto !py-1.5 !text-sm"><option value="" disabled>사업가 선택</option>{mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
              <button className="cbtn cbtn-sm">배정</button>
            </form>
          </li>
        ))}
      </ul>
      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">직접 배정</h2>
      <form action={create} className="mt-6 grid gap-3 md:grid-cols-4">
        <select name="mentor_id" required defaultValue="" className="field"><option value="" disabled>사업가</option>{mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select name="partner_id" required defaultValue="" className="field"><option value="" disabled>선교사</option>{partners.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select name="contribution_type" className="field">{contributionTypes.map((t) => <option key={t} value={t}>{c[t]}</option>)}</select>
        <button className="cbtn w-full">배정</button>
      </form>
      <ul className="mt-10 alist divide-y divide-black/[0.06]">
        {(matchings ?? []).length === 0 && <li className="py-6 text-soft">배정된 매칭이 없습니다.</li>}
        {(matchings ?? []).map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-4 py-4">
            <span>
              {name.get(x.mentor_id) ?? "-"} → {name.get(x.partner_id) ?? "-"}
              <span className="ml-2 text-xs text-clay">{c[x.contribution_type as keyof typeof c]} · {x.status === "active" ? "진행 중" : "종료"}</span>
            </span>
            {x.status === "active" && (
              <form action={end}><input type="hidden" name="id" value={x.id} /><button className="text-sm text-soft hover:text-clay">종료</button></form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
