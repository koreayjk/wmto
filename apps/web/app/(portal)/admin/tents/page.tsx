import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function addTent(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const name = String(fd.get("name") ?? "").trim().slice(0, 80);
  if (!name) return;
  await supabase.from("chapters").insert({ name, region: String(fd.get("region") ?? "").trim().slice(0, 80) || null });
  revalidatePath("/admin/tents");
}

async function assign(fd: FormData) {
  "use server";
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const tent = String(fd.get("tent") ?? "");
  const { data: c } = tent ? await db.from("chapters").select("id,name").eq("id", tent).maybeSingle() : { data: null };
  await db.from("members").update({ chapter_id: c?.id ?? null, chapter: c?.name ?? null }).eq("id", String(fd.get("member")));
  revalidatePath("/admin/tents");
}

export default async function AdminTents() {
  const { supabase } = await requireAdmin();
  const [{ data: tents }, { data: people }] = await Promise.all([
    supabase.from("chapters").select("id,name,region").order("name"),
    supabase.from("members").select("id,name,role,chapter_id").eq("status", "active").in("role", ["mentor", "sponsor", "partner"]).order("name").limit(500),
  ]);
  const list = tents ?? [];
  const all = people ?? [];
  const roleName = { mentor: "사업가", partner: "선교사", sponsor: "후원자" } as const;
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">텐트</h1>
      <p className="max-w-2xl text-soft">지역(또는 온라인)별 모임입니다. 사업가·후원자는 여기서 텐트를 배정합니다. 선교사는 텐트의 사업가가 "우리 텐트로 모시기"를 하면 그 텐트에 들어오고, 멘토는 텐트원이 이어서 직접 맡습니다.</p>

      <form action={addTent} className="mt-8 flex flex-wrap gap-3">
        <input name="name" required placeholder="텐트 이름 (예: 부산 텐트)" className="field !w-64" />
        <input name="region" placeholder="지역 (예: 한국, 온라인)" className="field !w-48" />
        <button className="cbtn">텐트 만들기</button>
      </form>

      <ul className="mt-8 divide-y divide-black/[0.06]">
        {list.map((t) => {
          const own = all.filter((p) => p.chapter_id === t.id);
          return (
            <li key={t.id} className="py-4">
              <p className="font-display text-lg font-semibold">{t.name} <span className="text-sm font-normal text-soft">{t.region ?? ""} · 구성원 {own.length}명</span></p>
              <p className="mt-1 text-sm text-soft">{own.map((p) => p.name).join(", ") || "아직 없음"}</p>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 text-sm font-medium">회원을 텐트에 배정</h2>
      <form action={assign} className="mt-3 flex flex-wrap gap-3">
        <select name="member" required className="field !w-64" defaultValue="">
          <option value="" disabled>회원 선택</option>
          {all.map((p) => <option key={p.id} value={p.id}>{p.name} · {roleName[p.role as keyof typeof roleName]}</option>)}
        </select>
        <select name="tent" className="field !w-64" defaultValue="">
          <option value="">텐트 없음</option>
          {list.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="cbtn">배정</button>
      </form>
    </>
  );
}
