import { Campfire, Flag, Lightbulb, MapPin, Tent } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/connect/ui";
import type { getMessages } from "@/lib/i18n";

type Item = { key: "attendance" | "referrals" | "one_to_one" | "visitors" | "service"; actual: number; target: number; max: number; points: number };
export type GrowthData = { total: number; level: "peg" | "pole" | "canvas" | "lantern"; items: Item[]; history: { weeks_ago: number; total: number }[]; age_days: number; grace: boolean };
const LEVELS = ["peg", "pole", "canvas", "lantern"] as const;
const FROM = { peg: 0, pole: 40, canvas: 60, lantern: 80 } as const;
const ICON = { peg: MapPin, pole: Flag, canvas: Tent, lantern: Lightbulb } as const;
const f = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, String(x)), s);

/** 성장 지표: 단계, 항목별 막대, 다음 단계에 필요한 것, 12주 추이 */
export function GrowthIndex({ data, t }: { data: GrowthData; t: ReturnType<typeof getMessages>["connect"]["growth"]["index"] }) {
  const Icon = ICON[data.level] ?? Campfire;
  const idx = LEVELS.indexOf(data.level);
  const nextLevel = LEVELS[idx + 1];
  const toNext = nextLevel ? FROM[nextLevel] - data.total : 0;
  const pct = (it: Item) => Math.round(Math.min(1, it.actual / (it.target || 1)) * 100);
  const gaps = [...data.items].filter((i) => i.points < i.max - 0.5).sort((a, b) => b.max - b.points - (a.max - a.points)).slice(0, 3);
  const need = (i: Item) => Math.max(1, Math.ceil(i.target - i.actual - 1e-9));
  const hist = data.history;
  const w = 220, h = 56;
  const pts = hist.map((p, n) => `${(n / Math.max(1, hist.length - 1)) * w},${h - (p.total / 100) * h}`).join(" ");

  return (
    <Card title={t.title} className="lg:col-span-full">
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-soft">{t.sub}</p>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,16rem)]">
        <div>
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-tint text-accent"><Icon size={34} weight="light" aria-hidden /></span>
            <span><b className="block text-2xl">{t.levels[data.level]}</b><span className="text-sm text-soft">{data.total}{t.score}</span></span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{t.levelDesc[data.level]}</p>
          {nextLevel ? <p className="mt-3 text-sm font-medium text-accent">{f(t.next, { name: t.levels[nextLevel], n: Math.ceil(toNext) })}</p> : <p className="mt-3 text-sm font-medium text-accent">{t.top}</p>}
          <ol className="mt-5 flex gap-1.5" aria-hidden>
            {LEVELS.map((l, n) => <li key={l} className={`h-1.5 flex-1 rounded-full ${n <= idx ? "bg-accent" : "bg-black/10"}`} />)}
          </ol>
          <div className="mt-1.5 flex justify-between text-[11px] text-soft" aria-hidden>{LEVELS.map((l) => <span key={l}>{t.levels[l]}</span>)}</div>
          {data.grace && <p className="mt-4 text-xs leading-relaxed text-soft">{t.grace}</p>}
        </div>

        <ul className="space-y-4">
          {data.items.map((it) => (
            <li key={it.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{t.items[it.key]}</span>
                <span className="tabular-nums text-soft">
                  {f(t.actual[it.key], { a: it.key === "attendance" ? Math.round(it.actual * 100) : Math.round(it.actual) })} · {f(t.target[it.key], { t: it.key === "attendance" ? Math.round(it.target * 100) : Math.ceil(it.target) })}
                  <b className="ml-3 text-ink">{Math.round(it.points)}/{it.max}</b>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-accent" style={{ width: `${pct(it)}%` }} /></div>
            </li>
          ))}
        </ul>

        <div>
          {gaps.length > 0 && (
            <>
              <p className="gilt text-[11px] font-medium uppercase tracking-[0.24em]">{t.todoTitle}</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                {gaps.map((g) => <li key={g.key} className="flex gap-2.5"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8975a]" aria-hidden />{f(t.todo[g.key], { n: need(g) })}</li>)}
              </ul>
            </>
          )}
          <p className="gilt mt-7 text-[11px] font-medium uppercase tracking-[0.24em]">{t.trend}</p>
          <svg viewBox={`0 0 ${w} ${h + 4}`} className="mt-3 w-full" role="img" aria-label={t.trend}>
            <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" transform="translate(0 2)" />
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-soft"><span>{f(t.weeksAgo, { n: hist.length - 1 })}</span><span>{t.now}</span></div>
        </div>
      </div>
      <p className="mt-6 text-xs text-soft">{t.note}</p>
    </Card>
  );
}
