import type { MonthRow } from "@/lib/activity";

/** 월별 나눔 기록. 가는 막대 하나의 색, 이번 달만 진하게. 숫자는 막대 위에 직접 적습니다. */
export function ActivityChart({ rows, locale, unit, aria }: { rows: MonthRow[]; locale: "ko" | "en"; unit: string; aria: string }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  const label = (month: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", { month: "short", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const summary = rows.map((r) => `${label(r.month)} ${unit.replace("{n}", String(r.total))}`).join(", ");
  return (
    <figure role="img" aria-label={`${aria}: ${summary}`}>
      <div className="flex h-44 items-end gap-2 border-b border-black/[0.07] sm:gap-4" aria-hidden>
        {rows.map((r, i) => {
          const current = i === rows.length - 1;
          return (
            <div key={r.month} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className={`mb-2 text-[13px] tabular-nums ${current ? "font-semibold text-ink" : "text-soft"}`}>{r.total}</span>
              <div
                className={`w-full max-w-9 rounded-full transition-[background-color] duration-700 ${current ? "bg-accent" : "bg-accent/20"}`}
                style={{ height: `${Math.max(r.total ? 8 : 3, (r.total / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 text-xs text-soft sm:gap-4" aria-hidden>
        {rows.map((r) => <span key={r.month} className="flex-1 text-center">{label(r.month)}</span>)}
      </div>
    </figure>
  );
}
