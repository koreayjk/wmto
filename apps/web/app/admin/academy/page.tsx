import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { roles } from "@/lib/codes";
import { getMessages } from "@/lib/i18n";

const PROVIDERS = ["youtube", "vimeo", "zoom", "bbb", "other"] as const;

async function add(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const title = String(fd.get("title") ?? "").trim();
  const url = String(fd.get("video_url") ?? "").trim();
  if (!title || !/^https:\/\//.test(url)) return;
  const forRoles = fd.getAll("for_roles").map(String).filter((r) => (roles as readonly string[]).includes(r));
  const provider = String(fd.get("provider"));
  await supabase.from("academy_videos").insert({
    title, video_url: url,
    description: String(fd.get("description") ?? "").trim() || null,
    category: String(fd.get("category") ?? "").trim() || null,
    provider: (PROVIDERS as readonly string[]).includes(provider) ? provider : "other",
    for_roles: forRoles.length ? forRoles : roles,
  });
  revalidatePath("/admin/academy");
}

async function remove(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("academy_videos").delete().eq("id", String(fd.get("id")));
  revalidatePath("/admin/academy");
}

export default async function AdminAcademy() {
  const { supabase } = await requireAdmin();
  const roleLabel = getMessages().apply.options.role;
  const { data } = await supabase.from("academy_videos").select("*").order("published_at", { ascending: false }).limit(200);
  return (
    <>
      <h1 className="font-serif text-2xl font-semibold">아카데미</h1>
      <form action={add} className="mt-6 grid gap-3 md:grid-cols-2">
        <input name="title" required placeholder="제목" className="field md:col-span-2" />
        <input name="video_url" type="url" required placeholder="영상 링크 (https://)" className="field md:col-span-2" />
        <input name="category" placeholder="분류 (예: 경영 기초)" className="field" />
        <select name="provider" className="field">{PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <textarea name="description" rows={2} placeholder="설명" className="field md:col-span-2" />
        <fieldset className="flex flex-wrap gap-4 md:col-span-2">
          <legend className="mb-1 text-sm text-soft">공개 대상 (선택하지 않으면 모두)</legend>
          {roles.map((r) => <label key={r} className="flex items-center gap-2"><input type="checkbox" name="for_roles" value={r} /> {roleLabel[r]}</label>)}
        </fieldset>
        <button className="bg-clay py-3 font-medium text-white md:col-span-2">영상 등록</button>
      </form>
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-4 py-3">
            <span>{v.title} <span className="text-xs text-clay">{v.category ?? ""} · {(v.for_roles as string[]).map((r) => roleLabel[r as keyof typeof roleLabel]).join(", ")}</span></span>
            <form action={remove}><input type="hidden" name="id" value={v.id} /><button className="text-sm text-soft hover:text-clay">삭제</button></form>
          </li>
        ))}
      </ul>
    </>
  );
}
