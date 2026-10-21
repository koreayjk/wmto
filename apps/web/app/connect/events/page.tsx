import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { fmtDateTime } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";

const CHECKIN_BEFORE_MS = 30 * 60_000;

async function checkIn(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  // 시간 조건은 DB 정책(attendance_self_insert)이 최종 검증합니다.
  await supabase.from("attendance").insert({ event_id: String(fd.get("event_id")), member_id: me.id });
  revalidatePath("/connect/events");
}

export default async function Events() {
  const { me, supabase } = await requireMe();
  const m = getMessages();
  const c = m.connect.events;
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const [{ data: events }, { data: att }] = await Promise.all([
    supabase.from("events").select("id,type,title,start_at,end_at,location,meeting_url").gte("start_at", since).order("start_at"),
    supabase.from("attendance").select("event_id").eq("member_id", me.id),
  ]);
  const attended = new Set((att ?? []).map((a) => a.event_id));
  const now = Date.now();
  const isPast = (e: { start_at: string; end_at: string | null }) =>
    new Date(e.end_at ?? new Date(e.start_at).getTime() + 3 * 3600_000).getTime() < now;
  const upcoming = (events ?? []).filter((e) => !isPast(e));
  const past = (events ?? []).filter(isPast).reverse();

  const row = (e: (typeof upcoming)[number], canAct: boolean) => {
    const open = new Date(e.start_at).getTime() - CHECKIN_BEFORE_MS <= now;
    return (
      <Card key={e.id}>
        <p className="text-xs uppercase tracking-[0.2em] text-clay">{m.events.types[e.type as keyof typeof m.events.types]}</p>
        <p className="mt-1 font-display text-lg font-semibold">{e.title}</p>
        <p className="text-sm text-soft">{fmtDateTime(e.start_at)}{e.location ? ` · ${e.location}` : ""}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {canAct && e.meeting_url && (
            <a href={e.meeting_url} target="_blank" rel="noopener noreferrer" className="bg-clay px-5 py-2.5 text-sm font-medium text-white rounded-lg">
              {m.connect.join}
            </a>
          )}
          {attended.has(e.id) ? (
            <span className="text-sm text-soft">✓ {c.checkedIn}</span>
          ) : canAct && open ? (
            <form action={checkIn}>
              <input type="hidden" name="event_id" value={e.id} />
              <button className="border border-ink/30 px-5 py-2.5 text-sm hover:bg-ink hover:text-paper rounded-lg">{c.checkIn}</button>
            </form>
          ) : canAct ? (
            <span className="text-xs text-soft">{c.checkInHint}</span>
          ) : null}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <PageTitle>{c.title}</PageTitle>
      {upcoming.length ? upcoming.map((e) => row(e, true)) : <p className="text-soft">{c.empty}</p>}
      {past.length > 0 && (
        <>
          <h2 className="pt-6 text-xs font-medium uppercase tracking-[0.2em] text-soft">{c.past}</h2>
          {past.map((e) => row(e, false))}
        </>
      )}
    </div>
  );
}
