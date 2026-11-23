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
    chapter_id: String(fd.get("chapter_id") ?? "") || null,
    ...(Number(fd.get("learning_units")) > 0 ? { learning_units: Math.min(20, Number(fd.get("learning_units"))) } : {}),
    ...(String(fd.get("signup_deadline") ?? "") ? { signup_deadline: new Date(`${String(fd.get("signup_deadline"))}:00+09:00`).toISOString() } : {}),
    ...(Number(fd.get("min_people")) > 0 ? { min_people: Math.min(1000, Number(fd.get("min_people"))) } : {}),
    ...(Number(fd.get("capacity")) > 0 ? { capacity: Math.min(1000, Number(fd.get("capacity"))) } : {}),
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
  const { data: tents } = await supabase.from("chapters").select("id,name").order("name");
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">{getMessages().admin.events}</h1>
      <form action={addEvent} className="mt-6 grid gap-3 md:grid-cols-2">
        <select name="type" required className="field">
          {eventTypes.map((e) => <option key={e} value={e}>{t[e]}</option>)}
        </select>
        <input name="title" required placeholder="제목" className="field" />
        <label className="text-sm text-soft">시작 (KST)<input name="start_at" type="datetime-local" required className="field mt-1" /></label>
        <label className="text-sm text-soft">종료 (KST)<input name="end_at" type="datetime-local" className="field mt-1" /></label>
        <input name="location" placeholder="장소" className="field" />
        <select name="chapter_id" className="field" defaultValue=""><option value="">전체 모임 (텐트 없음)</option>{(tents ?? []).map((t) => <option key={t.id} value={t.id}>{t.name} 모임</option>)}</select>
        <select name="meeting_provider" className="field"><option value="zoom">Zoom</option><option value="bbb">BigBlueButton</option></select>
        <input name="meeting_url" type="url" placeholder="회의 링크 (회원에게만 공개)" className="field md:col-span-2" />
        <p className="text-xs text-soft md:col-span-2">참가 조건(선택): 교육·행사에 참석하면 회원의 배움 점수에 자동으로 더해지고, 신청 마감과 인원 조건을 보여 줍니다. 최소 인원 미달 취소는 직접 판단해 주세요.</p>
        <label className="text-sm text-soft">참석 시 배움 단위<input name="learning_units" type="number" min={0} max={20} step="0.5" defaultValue={0} className="field mt-1" /></label>
        <label className="text-sm text-soft">신청 마감 (KST)<input name="signup_deadline" type="datetime-local" className="field mt-1" /></label>
        <label className="text-sm text-soft">최소 인원<input name="min_people" type="number" min={1} className="field mt-1" /></label>
        <label className="text-sm text-soft">정원<input name="capacity" type="number" min={1} className="field mt-1" /></label>
        <button className="cbtn w-full md:col-span-2">일정 등록</button>
      </form>
      <ul className="mt-10 alist divide-y divide-black/[0.06]">
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
