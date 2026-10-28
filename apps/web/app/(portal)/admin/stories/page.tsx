import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";

async function addStory(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const title = String(fd.get("title") ?? "").trim();
  const body = String(fd.get("body") ?? "").trim();
  if (!title || !body) return;
  await supabase.from("stories").insert({
    title,
    body,
    image_url: String(fd.get("image_url") ?? "") || null,
    is_example: fd.get("is_example") === "on",
    published_at: fd.get("publish") === "on" ? new Date().toISOString() : null,
  });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

async function toggle(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const published = fd.get("published") === "1";
  await supabase.from("stories").update({ published_at: published ? null : new Date().toISOString() }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

async function remove(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("stories").delete().eq("id", String(fd.get("id")));
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export default async function AdminStories() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("stories").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">{getMessages().admin.stories}</h1>
      <form action={addStory} className="mt-6 grid gap-3">
        <input name="title" required placeholder="제목" className="field" />
        <textarea name="body" required rows={6} placeholder="본문" className="field" />
        <input name="image_url" placeholder="이미지 URL (선택)" className="field" />
        <label className="flex items-center gap-2"><input type="checkbox" name="is_example" /> 예시 스토리 (&ldquo;예시&rdquo; 표시)</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="publish" defaultChecked /> 바로 공개</label>
        <button className="cbtn w-full">등록</button>
      </form>
      <ul className="mt-10 alist divide-y divide-black/[0.06]">
        {(data ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 py-4">
            <span>
              {s.title} {s.is_example && <span className="text-xs text-clay">[예시]</span>}{" "}
              <span className="text-xs text-soft">{s.published_at ? "공개" : "비공개"}</span>
            </span>
            <span className="flex gap-4 text-sm">
              <form action={toggle}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="published" value={s.published_at ? "1" : "0"} />
                <button className="text-soft hover:text-ink">{s.published_at ? "비공개로" : "공개로"}</button>
              </form>
              <form action={remove}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-soft hover:text-clay">삭제</button>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
