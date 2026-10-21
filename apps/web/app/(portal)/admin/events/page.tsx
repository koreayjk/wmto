import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { eventTypes } from "@/lib/codes";

async function addEvent(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const type = String(fd.get("type"));
  const title = String(fd.get("title") ?? "").trim();
  const start = String(fd.get("start_at") ?? "");
  if (!(eventTypes as readonly string[]).includes(type) || !title || !start) return;
  const end = String(fd.get("end_at") ?? "");
  // datetime-local 은 한국 시간(+09:00)으로 입력받습니다.
  await supabase.from("events").insert({
    type,
    title,
    start_at: new Date(`${start}:00+09:00`).toISOString(),
    end_at: end ? new Date(`${end}:00+09:00`).toISOString() : null,
    location: String(fd.get("location") ?? "") || null,
    meeting_provider: String(fd.get("meeting_url") ?? "") ? (fd.get("meeting_provider") === "bbb" ? "bbb" : "zoom") : null,
    meeting_url: String(fd.get("meeting_url") ?? "") || null,
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

async function removeEvent(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", String(fd.get("id")));
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export default async function AdminEvents() {
  const { supabase } = await requireAdmin();
  const t = getMessages().events.types;
  const { data } = await supabase.from("events").select("*").order("start_at", { ascending: false }).limit(100);
  return (
    <>
      <h1 className="font-display text-2xl font-semibold">{getMessages().admin.events}</h1>
      <form action={addEvent} className="mt-6 grid gap-3 md:grid-cols-2">
        <select name="type" required className="field">
          {eventTypes.map((e) => <option key={e} value={e}>{t[e]}</option>)}
        </select>
        <input name="title" required placeholder="제목" className="field" />
        <label className="text-sm text-soft">시작 (KST)<input name="start_at" type="datetime-local" required className="field mt-1" /></label>
        <label className="text-sm text-soft">종료 (KST)<input name="end_at" type="datetime-local" className="field mt-1" /></label>
        <input name="location" placeholder="장소" className="field" />
        <select name="meeting_provider" className="field"><option value="zoom">Zoom</option><option value="bbb">BigBlueButton</option></select>
        <input name="meeting_url" type="url" placeholder="회의 링크 (회원에게만 공개)" className="field md:col-span-2" />
        <button className="bg-clay py-3 font-medium text-white md:col-span-2 rounded-lg">일정 등록</button>
      </form>
      <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-4 py-4">
            <span>
              <span className="text-xs text-clay">{t[e.type as keyof typeof t]}</span>{" "}
              {e.title} <span className="text-soft">{new Date(e.start_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
            </span>
            <form action={removeEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="text-sm text-soft hover:text-clay">삭제</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
