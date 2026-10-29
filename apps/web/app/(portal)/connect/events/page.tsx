import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";

const CHECKIN_BEFORE_MS = 30 * 60_000;
const KST = "Asia/Seoul";

async function checkIn(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  // 시간 조건은 DB 정책(attendance_self_insert)이 최종 검증합니다.
  await supabase.from("attendance").insert({ event_id: String(fd.get("event_id")), member_id: me.id });
  revalidatePath("/connect/events");
}

type Ev = { chapter_id: string | null; id: string; type: string; title: string; start_at: string; end_at: string | null; location: string | null; meeting_url: string | null };

/** 한국 시간 기준 날짜(YYYY-MM-DD)와 하루 중 분(0~1439) */
const kstDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: KST });
const kstMinutes = (d: Date) => { const [h, m] = d.toLocaleTimeString("en-GB", { timeZone: KST, hour: "2-digit", minute: "2-digit", hour12: false }).split(":").map(Number); return h * 60 + m; };
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400_000);

export default async function Events() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const m = getMessages(locale);
  const c = m.connect.events;
  const tl = c.tl;
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [{ data: events }, { data: att }, { data: mine }] = await Promise.all([
    supabase.from("events").select("id,chapter_id,type,title,start_at,end_at,location,meeting_url").gte("start_at", since).order("start_at"),
    supabase.from("attendance").select("event_id").eq("member_id", me.id),
    supabase.rpc("my_tents"),
  ]);
  // 전체 모임과 내 텐트의 모임만 보여 줍니다(다른 텐트의 정기 모임은 제외).
  const myTents = new Set(((mine ?? []) as { id: string }[]).map((x) => x.id));
  const attended = new Set((att ?? []).map((a) => a.event_id));
  const now = new Date();
  const nowMs = now.getTime();
  const today = kstDate(now);
  const endOf = (e: Ev) => new Date(e.end_at ?? new Date(e.start_at).getTime() + 3 * 3600_000).getTime();
  const list = ((events ?? []) as Ev[]).filter((e) => !e.chapter_id || myTents.has(e.chapter_id));
  const upcoming = list.filter((e) => endOf(e) >= nowMs);
  const past = list.filter((e) => endOf(e) < nowMs).reverse().slice(0, 12);

  const next = upcoming[0];
  let countdown: { d: number; h: number; mi: number; live: boolean } | null = null;
  if (next) {
    const ms = new Date(next.start_at).getTime() - nowMs;
    countdown = ms <= 0 ? { d: 0, h: 0, mi: 0, live: true } : { d: Math.floor(ms / 86400_000), h: Math.floor((ms % 86400_000) / 3600_000), mi: Math.floor((ms % 3600_000) / 60_000), live: false };
  }

  const bucket = (e: Ev) => {
    const n = dayDiff(today, kstDate(new Date(e.start_at)));
    if (n <= 0) return tl.today;
    if (n === 1) return tl.tomorrow;
    if (n <= 7) return tl.thisWeek;
    if (n <= 31) return tl.thisMonth;
    return tl.later;
  };
  const groups: [string, Ev[]][] = [];
  for (const e of upcoming) { const b = bucket(e); const g = groups[groups.length - 1]; if (g && g[0] === b) g[1].push(e); else groups.push([b, [e]]); }

  const loc = locale === "en" ? "en-US" : "ko-KR";
  const entry = (e: Ev, isPast: boolean) => {
    const s = new Date(e.start_at);
    const en = new Date(e.end_at ?? s.getTime() + 3600_000 * 2);
    const n = dayDiff(today, kstDate(s));
    const live = !isPast && s.getTime() <= nowMs && endOf(e) >= nowMs;
    const open = s.getTime() - CHECKIN_BEFORE_MS <= nowMs;
    const t0 = kstMinutes(s), t1 = Math.max(t0 + 30, kstMinutes(en));
    const time = (d: Date) => d.toLocaleTimeString(loc, { timeZone: KST, hour: "numeric", minute: "2-digit", hour12: locale === "en" });
    const chip = live ? tl.now : isPast ? tl.ago.replace("{n}", String(Math.abs(n))) : n === 0 ? tl.today : tl.dday.replace("{n}", String(n));
    return (
      <li key={e.id} className={`relative flex gap-4 sm:gap-6 ${isPast ? "opacity-60" : ""}`}>
        <div className="z-10 w-[3.6rem] shrink-0 text-center">
          <span className={`block rounded-2xl py-2 ${live ? "bg-accent text-white" : "bg-white"} shadow-[0_0_0_1px_rgba(22,24,29,0.06),0_10px_20px_-14px_rgba(14,70,58,0.5)]`}>
            <span className={`block text-[11px] ${live ? "text-white/80" : "text-soft"}`}>{s.toLocaleDateString(loc, { month: "short", timeZone: KST })}</span>
            <span className="block font-display text-2xl font-semibold leading-none tabular-nums">{s.toLocaleDateString("en-US", { day: "numeric", timeZone: KST })}</span>
            <span className={`mt-1 block text-[11px] ${live ? "text-white/80" : "text-soft"}`}>{s.toLocaleDateString(loc, { weekday: "short", timeZone: KST })}</span>
          </span>
        </div>
        <article className="min-w-0 flex-1 pb-2">
          <p className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${live ? "bg-accent text-white" : isPast ? "bg-black/[0.06] text-soft" : "bg-tint text-accent"}`}>{chip}</span>
            <span className="uppercase tracking-[0.18em] text-clay">{m.events.types[e.type as keyof typeof m.events.types]}</span>
          </p>
          <h3 className="mt-1.5 font-display text-lg font-semibold">{e.title}</h3>
          <p className="mt-0.5 text-sm text-soft">{time(s)} – {time(en)}{e.location ? ` · ${e.location}` : ""}</p>
          <div className="mt-2.5 flex items-center gap-3" aria-label={tl.dayBar}>
            <span className="relative h-1.5 w-40 overflow-hidden rounded-full bg-black/[0.07]">
              <span className="absolute inset-y-0 rounded-full bg-accent/70" style={{ left: `${(t0 / 1440) * 100}%`, width: `${((t1 - t0) / 1440) * 100}%` }} />
            </span>
            <span className="text-[10px] tracking-wide text-soft">0 · 6 · 12 · 18 · 24</span>
          </div>
          {!isPast && (
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              {e.meeting_url && <a href={e.meeting_url} target="_blank" rel="noopener noreferrer" className="cbtn cbtn-sm">{m.connect.join}</a>}
              {attended.has(e.id) ? (
                <span className="text-sm text-soft">✓ {c.checkedIn}</span>
              ) : open ? (
                <form action={checkIn}><input type="hidden" name="event_id" value={e.id} /><button className="cbtn cbtn-quiet cbtn-sm">{c.checkIn}</button></form>
              ) : (
                <span className="text-xs text-soft">{c.checkInHint}</span>
              )}
            </div>
          )}
          {isPast && attended.has(e.id) && <p className="mt-2 text-sm text-soft">✓ {c.checkedIn}</p>}
        </article>
      </li>
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
      <header className="lg:col-span-2">
        <h1 className="display text-[2rem] leading-[1.15] md:text-[2.4rem]">{c.title}</h1>
        <p className="mt-3 text-soft">{tl.sub}</p>
      </header>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="cbezel c-rise"><div className="cbezel-in dark p-7">
          <p className="text-[12px] tracking-[0.14em] text-white/60">{tl.until}</p>
          {next && countdown ? (
            <>
              <p className="mt-4 flex items-end gap-1 font-display font-light leading-none tabular-nums">
                {countdown.live ? <span className="text-3xl">{tl.now}</span> : (
                  <>
                    <span className="text-[4rem]">{countdown.d}</span><span className="pb-2 pr-3 text-lg text-white/60">{tl.d}</span>
                    <span className="text-[2.4rem]">{countdown.h}</span><span className="pb-1 pr-3 text-base text-white/60">{tl.h}</span>
                    <span className="text-[2.4rem]">{countdown.mi}</span><span className="pb-1 text-base text-white/60">{tl.m}</span>
                  </>
                )}
              </p>
              <p className="mt-5 font-display text-lg">{next.title}</p>
              <p className="mt-1 text-sm text-white/65">{new Date(next.start_at).toLocaleString(loc, { timeZone: KST, month: "long", day: "numeric", weekday: "short", hour: "numeric", minute: "2-digit", hour12: locale === "en" })}</p>
            </>
          ) : <p className="mt-4 text-white/70">{c.empty}</p>}
        </div></div>
      </aside>

      <section>
        {groups.length === 0 && <p className="text-soft">{c.empty}</p>}
        {groups.map(([name, evs]) => (
          <div key={name} className="mb-10">
            <h2 className="mb-5 text-[12px] font-medium tracking-[0.14em] text-soft">{name}</h2>
            <ol className="relative space-y-8 before:absolute before:bottom-2 before:left-[1.8rem] before:top-2 before:w-px before:bg-black/10">{evs.map((e) => entry(e, false))}</ol>
          </div>
        ))}
        {past.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-5 text-[12px] font-medium tracking-[0.14em] text-soft">{c.past}</h2>
            <ol className="relative space-y-7 before:absolute before:bottom-2 before:left-[1.8rem] before:top-2 before:w-px before:bg-black/10">{past.map((e) => entry(e, true))}</ol>
          </div>
        )}
      </section>
    </div>
  );
}
