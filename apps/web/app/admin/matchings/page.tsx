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

async function end(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("matchings").update({ status: "ended", ended_at: new Date().toISOString().slice(0, 10) }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/matchings");
}

export default async function AdminMatchings() {
  const { supabase } = await requireAdmin();
  const c = getMessages().connect.contribution;
  const [{ data: members }, { data: matchings }] = await Promise.all([
    supabase.from("members").select("id,name,role,email").eq("status", "active").in("role", ["mentor", "partner"]).order("name"),
    supabase.from("matchings").select("id,mentor_id,partner_id,contribution_type,status,started_at").order("created_at", { ascending: false }),
  ]);
  const mentors = (members ?? []).filter((x) => x.role === "mentor");
  const partners = (members ?? []).filter((x) => x.role === "partner");
  const name = new Map((members ?? []).map((x) => [x.id, x.name]));

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold">매칭 배정</h1>
      <form action={create} className="mt-6 grid gap-3 md:grid-cols-4">
        <select name="mentor_id" required defaultValue="" className="field"><option value="" disabled>사업가</option>{mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select name="partner_id" required defaultValue="" className="field"><option value="" disabled>선교사</option>{partners.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select name="contribution_type" className="field">{contributionTypes.map((t) => <option key={t} value={t}>{c[t]}</option>)}</select>
        <button className="bg-clay py-3 font-medium text-white">배정</button>
      </form>
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
        {(matchings ?? []).length === 0 && <li className="py-6 text-soft">배정된 매칭이 없습니다.</li>}
        {(matchings ?? []).map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-4 py-4">
            <span>
              {name.get(x.mentor_id) ?? "—"} → {name.get(x.partner_id) ?? "—"}
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
