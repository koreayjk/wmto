import Link from "next/link";
import { Flag, Lightbulb, MapPin, Tent } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/connect/ui";
import { ActivityChart } from "@/components/connect/ActivityChart";
import type { MonthRow } from "@/lib/activity";
import type { GrowthData } from "@/components/connect/GrowthIndex";
import type { getMessages } from "@/lib/i18n";

type Msgs = ReturnType<typeof getMessages>["connect"];
const LEVELS = ["peg", "pole", "canvas", "lantern"] as const;
const FROM = { peg: 0, pole: 40, canvas: 60, lantern: 80 } as const;
const ICON = { peg: MapPin, pole: Flag, canvas: Tent, lantern: Lightbulb } as const;
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, String(x)), s);

/** 포인트 링: 100점 만점 중 내 점수를 원형 게이지로 보여 줍니다. */
function Ring({ value, label }: { value: number; label: string }) {
  const r = 68, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 168 168" role="img" aria-label={label} className="h-44 w-44 shrink-0">
      <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(22,24,29,0.08)" strokeWidth="14" />
      <circle cx="84" cy="84" r={r} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 84 84)" />
      <text x="84" y="88" textAnchor="middle" className="fill-[var(--ink)]" style={{ fontSize: 44, fontWeight: 300 }}>{Math.round(value)}</text>
      <text x="84" y="112" textAnchor="middle" className="fill-[var(--soft)]" style={{ fontSize: 13 }}>/ 100</text>
    </svg>
  );
}

/** 12주 포인트 추이(꺾은선) */
function Trend({ hist, t }: { hist: GrowthData["history"]; t: Msgs["growth"]["index"] }) {
  const w = 520, h = 130, pad = 8;
  const n = Math.max(1, hist.length - 1);
  const xy = hist.map((p, i) => [pad + (i / n) * (w - pad * 2), h - pad - (p.total / 100) * (h - pad * 2)] as const);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = xy.length ? `${pad},${h - pad} ${line} ${w - pad},${h - pad}` : "";
  const last = hist[hist.length - 1]?.total ?? 0;
  const first = hist[0]?.total ?? 0;
  return (
    <figure role="img" aria-label={`${t.trend}: ${Math.round(first)} → ${Math.round(last)}`}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full">
        {[0, 40, 60, 80].map((g) => {
          const y = h - pad - (g / 100) * (h - pad * 2);
          return <line key={g} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(22,24,29,0.07)" strokeDasharray={g ? "3 5" : undefined} />;
        })}
        {area && <polygon points={area} fill="var(--accent)" opacity="0.10" />}
        {line && <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {xy.length > 0 && <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="5" fill="var(--accent)" />}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-soft"><span>{fill(t.weeksAgo, { n: hist.length - 1 })}</span><span>{t.now}</span></figcaption>
    </figure>
  );
}

export function MemberDashboard({ g, act, rows, period, t, m, locale }: {
  g: GrowthData | null; act: Record<string, number> | null; rows: MonthRow[]; period: 90 | 365 | 0;
  t: Msgs["board"]; m: Msgs; locale: "ko" | "en";
}) {
  const ix = m.growth.index;
  const tiles = (["referrals_given", "referrals_received", "referrals_won", "one_to_one", "visitors", "learning", "gratitude_sent", "gratitude_received"] as const);
  const href: Record<string, string> = { referrals_given: "/connect/referrals", referrals_received: "/connect/referrals", referrals_won: "/connect/referrals", one_to_one: "/connect/one-to-one", visitors: "/connect/visitors", learning: "/connect/academy", gratitude_sent: "/connect/referrals", gratitude_received: "/connect/referrals" };
  const idx = g ? LEVELS.indexOf(g.level) : 0;
  const Icon = g ? ICON[g.level] ?? MapPin : MapPin;
  const next = g && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const toNext = g && next ? Math.ceil(FROM[next] - g.total) : 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card title={t.points}>
          {g ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Ring value={g.total} label={fill(t.gaugeAria, { n: Math.round(g.total) })} />
              <div className="min-w-0 text-center sm:text-left lg:text-center xl:text-left">
                <p className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1 text-sm font-semibold text-accent"><Icon size={18} weight="light" aria-hidden />{ix.levels[g.level]}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">{ix.levelDesc[g.level]}</p>
                {next ? <p className="mt-2 text-sm font-medium text-accent">{fill(ix.next, { name: ix.levels[next], n: toNext })}</p> : <p className="mt-2 text-sm font-medium text-accent">{ix.top}</p>}
                <ol className="mt-4 flex gap-1.5" aria-hidden>
                  {LEVELS.map((l, n) => <li key={l} className={`h-1.5 flex-1 rounded-full ${n <= idx ? "bg-accent" : "bg-black/10"}`} />)}
                </ol>
              </div>
            </div>
          ) : <p className="text-soft">{t.empty}</p>}
          <Link href="/connect/growth" className="mt-5 inline-block text-sm font-medium text-clay underline">{t.detail}</Link>
        </Card>

        <Card title={t.activity}>
          <p className="mb-4 flex gap-2 text-sm">
            {([90, 365, 0] as const).map((d) => <Link key={d} href={`/connect?p=${d}`} className={`rounded-full px-3.5 py-1.5 ring-1 ring-inset ${period === d ? "bg-accent text-white ring-accent" : "ring-ink/15"}`}>{m.activity.period[d]}</Link>)}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((k) => (
              <li key={k}>
                <Link href={href[k]} className="cbezel c-rise block h-full">
                  <div className="cbezel-in flex h-full min-h-28 flex-col justify-between p-4">
                    <p className="text-[12.5px] leading-snug text-soft">{m.activity.tiles[k]}</p>
                    <p className="serif text-[2.2rem] font-light leading-none tabular-nums">{act?.[k] ?? 0}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={ix.trend}>
          {g && g.history.length > 1 ? <Trend hist={g.history} t={ix} /> : <p className="text-soft">{t.empty}</p>}
        </Card>
        <Card title={t.monthly}>
          {rows.length > 0 ? <ActivityChart rows={rows} locale={locale} unit={m.dash.chartUnit} aria={m.dash.chartAria} /> : <p className="text-soft">{t.empty}</p>}
        </Card>
      </div>

      {g && (
        <Card title={t.breakdown}>
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {g.items.map((it) => {
              const pct = Math.round(Math.min(1, it.points / (it.max || 1)) * 100);
              const key = it.key as keyof typeof ix.items;
              return (
                <li key={it.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{ix.items[key] ?? it.key}</span>
                    <b className="tabular-nums">{Math.round(it.points)}<span className="font-normal text-soft"> / {it.max}</span></b>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-soft">{ix.note}</p>
        </Card>
      )}
    </div>
  );
}
