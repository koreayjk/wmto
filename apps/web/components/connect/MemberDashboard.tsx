import Link from "next/link";
import { Flag, Info, Lightbulb, MapPin, Tent } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/connect/ui";
import { ActivityChart } from "@/components/connect/ActivityChart";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { MonthRow } from "@/lib/activity";
import type { GrowthData } from "@/components/connect/GrowthIndex";
import type { getMessages } from "@/lib/i18n";

type Msgs = ReturnType<typeof getMessages>["connect"];
export type Metric = "referrals_given" | "one_to_one" | "visitors";
export const METRICS: readonly Metric[] = ["referrals_given", "one_to_one", "visitors"];
type Ev = { id: string; title: string; start_at: string; meeting_url: string | null };

const LEVELS = ["peg", "pole", "canvas", "lantern"] as const;
const FROM = { peg: 0, pole: 40, canvas: 60, lantern: 80 } as const;
const ICON = { peg: MapPin, pole: Flag, canvas: Tent, lantern: Lightbulb } as const;
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, String(x)), s);

/** 포인트 링: 100점 만점 중 내 점수를 원형 게이지로 보여 줍니다. */
function Ring({ value, label }: { value: number; label: string }) {
  const r = 68, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 168 168" role="img" aria-label={label} className="h-40 w-40 shrink-0">
      <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(22,24,29,0.08)" strokeWidth="14" />
      <circle cx="84" cy="84" r={r} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 84 84)" />
      <text x="84" y="88" textAnchor="middle" className="fill-[var(--ink)]" style={{ fontSize: 44, fontWeight: 300 }}>{Math.round(value)}</text>
      <text x="84" y="112" textAnchor="middle" className="fill-[var(--soft)]" style={{ fontSize: 13 }}>/ 100</text>
    </svg>
  );
}

/** 기간 안의 날짜들을 누적 건수 계열로 바꿉니다(90일=주 단위, 그 밖=월 단위). */
function cumulative(dates: string[], period: 90 | 365 | 0, locale: "ko" | "en") {
  const now = Date.now();
  const ts = dates.map((d) => new Date(d).getTime()).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  const start = period === 0 ? Math.min(ts[0] ?? now - 90 * 86400000, now - 60 * 86400000) : now - period * 86400000;
  const inWin = ts.filter((x) => x >= start && x <= now);
  const n = period === 90 ? 13 : period === 365 ? 12 : Math.max(3, Math.min(36, Math.round((now - start) / (30.4 * 86400000))));
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", period === 90 ? { month: "numeric", day: "numeric" } : { month: "short" });
  return Array.from({ length: n }, (_, i) => {
    const t = start + ((i + 1) / n) * (now - start);
    return { label: fmt.format(new Date(t)), value: inWin.filter((x) => x <= t).length };
  });
}

function Line({ pts, unit, aria, empty }: { pts: { label: string; value: number }[]; unit: string; aria: string; empty: string }) {
  const w = 640, h = 240, l = 34, r = 12, tp = 26, b = 30;
  const max = Math.max(4, ...pts.map((p) => p.value));
  const step = max <= 8 ? 2 : max <= 20 ? 5 : max <= 60 ? 10 : 20;
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => l + (i / Math.max(1, pts.length - 1)) * (w - l - r);
  const y = (v: number) => tp + (1 - v / top) * (h - tp - b);
  const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const every = Math.ceil(pts.length / 7);
  const total = pts[pts.length - 1]?.value ?? 0;
  if (total === 0) return <p className="py-10 text-center text-soft">{empty}</p>;
  return (
    <figure role="img" aria-label={`${aria}: ${total}`}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
        <text x="2" y="11" className="fill-[var(--soft)]" style={{ fontSize: 11 }}>{unit}</text>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={l} x2={w - r} y1={y(tk)} y2={y(tk)} stroke="rgba(22,24,29,0.08)" />
            <text x={l - 6} y={y(tk) + 4} textAnchor="end" className="fill-[var(--soft)]" style={{ fontSize: 11 }}>{tk}</text>
          </g>
        ))}
        <polygon points={`${x(0)},${y(0)} ${line} ${x(pts.length - 1)},${y(0)}`} fill="var(--accent)" opacity="0.08" />
        <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r={i === pts.length - 1 ? 5 : 3.5} fill="#fff" stroke="var(--accent)" strokeWidth="2" />)}
        {pts.map((p, i) => i % every === 0 || i === pts.length - 1 ? <text key={`l${i}`} x={x(i)} y={h - 8} textAnchor="middle" className="fill-[var(--soft)]" style={{ fontSize: 11 }}>{p.label}</text> : null)}
      </svg>
    </figure>
  );
}

export function MemberDashboard({ g, act, rows, period, metric, dates, tent, termEnd, events, profile, t, m, locale }: {
  g: GrowthData | null; act: Record<string, number> | null; rows: MonthRow[]; period: 90 | 365 | 0; metric: Metric; dates: string[];
  tent: string | null; termEnd: string | null; events: Ev[]; profile: [string, boolean][];
  t: Msgs["board"]; m: Msgs; locale: "ko" | "en";
}) {
  const ix = m.growth.index;
  const idx = g ? LEVELS.indexOf(g.level) : 0;
  const Icon = g ? ICON[g.level] ?? MapPin : MapPin;
  const next = g && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const toNext = g && next ? Math.ceil(FROM[next] - g.total) : 0;
  const pts = cumulative(dates, period, locale);
  const q = (p: number, mt: string) => `/connect?p=${p}&m=${mt}`;
  const tiles = [
    { k: "referrals_given", rec: "/connect/referrals" }, { k: "referrals_received", rec: "/connect/referrals" }, { k: "referrals_won", rec: "/connect/referrals" }, { k: "one_to_one", rec: "/connect/one-to-one" },
    { k: "visitors", rec: "/connect/visitors" }, { k: "learning", rec: "/connect/academy" }, { k: "gratitude_sent", rec: "/connect/referrals" }, { k: "gratitude_received", rec: "/connect/referrals" },
  ] as const;
  const missing = profile.filter(([, ok]) => !ok).map(([k]) => k);
  const pct = profile.length ? Math.round(((profile.length - missing.length) / profile.length) * 100) : 100;
  const daysLeft = termEnd ? Math.ceil((new Date(termEnd).getTime() - Date.now()) / 86400000) : null;
  const pill = "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-black/10";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {tent && <Link href="/connect/tent" className={pill}><span className="text-soft">{t.head.tent}</span><b>{tent}</b></Link>}
        {g && <span className={pill}><Icon size={16} weight="light" aria-hidden /><span className="text-soft">{t.head.level}</span><b>{ix.levels[g.level]}</b></span>}
        {termEnd && <span className={pill}><span className="text-soft">{t.head.renewal}</span><b>{fmtDate(termEnd, locale)}</b>{daysLeft !== null && daysLeft >= 0 && daysLeft <= 60 && <span className="text-xs text-clay">D-{daysLeft}</span>}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <Card title={t.points}>
          {g ? (
            <div className="flex flex-col items-center gap-3">
              <Ring value={g.total} label={fill(t.gaugeAria, { n: Math.round(g.total) })} />
              <div className="text-center">
                <p className="text-sm leading-relaxed text-ink/80">{ix.levelDesc[g.level]}</p>
                {next ? <p className="mt-2 text-sm font-medium text-accent">{fill(ix.next, { name: ix.levels[next], n: toNext })}</p> : <p className="mt-2 text-sm font-medium text-accent">{ix.top}</p>}
                <ol className="mt-3 flex gap-1.5" aria-hidden>{LEVELS.map((l, n) => <li key={l} className={`h-1.5 flex-1 rounded-full ${n <= idx ? "bg-accent" : "bg-black/10"}`} />)}</ol>
              </div>
            </div>
          ) : <p className="text-soft">{t.empty}</p>}
          <Link href="/connect/growth" className="mt-4 inline-block text-sm font-medium text-clay underline">{t.detail}</Link>
        </Card>

        <Card title={`${t.chart.title} · ${t.chart.metrics[metric]}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <nav aria-label={t.chart.title} className="flex flex-wrap gap-2">
              {METRICS.map((k) => <Link key={k} href={q(period, k)} aria-current={metric === k ? "true" : undefined} className={`rounded-full px-3.5 py-1.5 ring-1 ring-inset ${metric === k ? "bg-ink text-white ring-ink" : "ring-ink/15"}`}>{t.chart.metrics[k]}</Link>)}
            </nav>
            <span className="flex items-center gap-2">
              {([90, 365, 0] as const).map((d) => <Link key={d} href={q(d, metric)} className={`rounded-full px-3.5 py-1.5 ring-1 ring-inset ${period === d ? "bg-accent text-white ring-accent" : "ring-ink/15"}`}>{m.activity.period[d]}</Link>)}
              <details className="relative">
                <summary aria-label="info" className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full text-accent ring-1 ring-inset ring-ink/15 [&::-webkit-details-marker]:hidden"><Info size={18} aria-hidden /></summary>
                <p className="absolute right-0 z-10 mt-2 w-64 rounded-xl bg-ink p-3 text-xs leading-relaxed text-white shadow-lg">{t.chart.info}</p>
              </details>
            </span>
          </div>
          <Line pts={pts} unit={t.chart.count} aria={t.chart.metrics[metric]} empty={t.chart.empty} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(({ k, rec }) => (
            <li key={k} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.07]">
              <div className="flex min-h-28 flex-col justify-between p-4">
                <p className="text-[12.5px] leading-snug text-soft">{m.activity.tiles[k]}</p>
                <p className="serif text-[2.2rem] font-light leading-none tabular-nums">{act?.[k] ?? 0}</p>
              </div>
              <div className="grid grid-cols-2 border-t border-black/[0.07] text-center text-[13px] font-medium">
                <Link href={rec} className="py-2.5 text-accent hover:bg-tint">{t.record}</Link>
                <Link href="/connect/records" className="border-l border-black/[0.07] py-2.5 text-ink/70 hover:bg-tint">{t.review}</Link>
              </div>
            </li>
          ))}
        </ul>
        <Card title={t.reports.title}>
          <ul className="space-y-2 text-sm">
            {([["/connect/records", t.reports.weekly], ["/connect/referrals", t.reports.received], ["/connect/events", t.reports.attendance]] as const).map(([h, label]) => (
              <li key={h}><Link href={h} className="block rounded-xl px-3 py-2.5 font-medium text-accent ring-1 ring-inset ring-black/10 hover:bg-tint">{label}</Link></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={ix.trend}>
          {g && g.history.length > 1 ? (
            <figure role="img" aria-label={`${ix.trend}: ${Math.round(g.history[0].total)} → ${Math.round(g.history[g.history.length - 1].total)}`}>
              <svg viewBox="0 0 520 130" className="h-36 w-full">
                {[0, 40, 60, 80].map((gl) => { const yy = 122 - (gl / 100) * 114; return <line key={gl} x1="8" x2="512" y1={yy} y2={yy} stroke="rgba(22,24,29,0.07)" strokeDasharray={gl ? "3 5" : undefined} />; })}
                {(() => {
                  const n = Math.max(1, g.history.length - 1);
                  const xy = g.history.map((p, i) => [8 + (i / n) * 504, 122 - (p.total / 100) * 114] as const);
                  const ln = xy.map(([a, b2]) => `${a.toFixed(1)},${b2.toFixed(1)}`).join(" ");
                  return <><polygon points={`8,122 ${ln} 512,122`} fill="var(--accent)" opacity="0.10" /><polyline points={ln} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /><circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="5" fill="var(--accent)" /></>;
                })()}
              </svg>
              <figcaption className="mt-1 flex justify-between text-[11px] text-soft"><span>{fill(ix.weeksAgo, { n: g.history.length - 1 })}</span><span>{ix.now}</span></figcaption>
            </figure>
          ) : <p className="text-soft">{t.empty}</p>}
        </Card>
        <Card title={t.monthly}>
          {rows.length > 0 ? <ActivityChart rows={rows} locale={locale} unit={m.dash.chartUnit} aria={m.dash.chartAria} /> : <p className="text-soft">{t.empty}</p>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {g && (
          <Card title={t.breakdown}>
            <ul className="space-y-3.5">
              {g.items.map((it) => {
                const p = Math.round(Math.min(1, it.points / (it.max || 1)) * 100);
                const key = it.key as keyof typeof ix.items;
                return (
                  <li key={it.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm"><span className="font-medium">{ix.items[key] ?? it.key}</span><b className="tabular-nums">{Math.round(it.points)}<span className="font-normal text-soft"> / {it.max}</span></b></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-accent" style={{ width: `${p}%` }} /></div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-soft">{ix.note}</p>
          </Card>
        )}
        <Card title={t.profile.title}>
          <p className="text-sm text-soft">{t.profile.sub}</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--accent) ${pct * 3.6}deg, rgba(22,24,29,0.08) 0)` }}>
              <span className="grid h-[4.9rem] w-[4.9rem] place-items-center rounded-full bg-white text-xl font-light tabular-nums">{pct}%</span>
            </div>
            {missing.length ? (
              <ul className="flex flex-wrap gap-2">{missing.slice(0, 6).map((k) => <li key={k} className="rounded-full bg-tint px-3 py-1 text-sm text-accent">{t.profile.items[k as keyof typeof t.profile.items]}</li>)}</ul>
            ) : <p className="text-sm text-accent">{t.profile.done}</p>}
          </div>
          <Link href="/connect/profile" className="mt-5 inline-block text-sm font-medium text-clay underline">{t.profile.update}</Link>
        </Card>
      </div>

      <Card title={t.events.title}>
        {events.length === 0 ? <p className="text-soft">{t.events.none}</p> : (
          <ul className="grid gap-4 sm:grid-cols-3">
            {events.map((e) => (
              <li key={e.id} className="rounded-2xl bg-tint p-4">
                <p className="text-xs text-soft">{fmtDateTime(e.start_at, locale)}</p>
                <p className="mt-1 font-display font-semibold">{e.title}</p>
                <Link href="/connect/events" className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-accent ring-1 ring-black/10">{t.events.details}</Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/connect/events" className="mt-4 inline-block text-sm font-medium text-clay underline">{t.events.seeMore}</Link>
      </Card>
    </div>
  );
}
