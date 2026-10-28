import type { MonthRow } from "@/lib/activity";

/** 월별 나눔 기록 막대 그래프. 한 가지 색, 이번 달만 진하게. 숫자는 막대 위에 직접 적습니다. */
export function ActivityChart({ rows, locale, unit, aria }: { rows: MonthRow[]; locale: "ko" | "en"; unit: string; aria: string }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  const label = (month: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", { month: "short", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const summary = rows.map((r) => `${label(r.month)} ${unit.replace("{n}", String(r.total))}`).join(", ");
  return (
    <figure role="img" aria-label={`${aria}: ${summary}`}>
      <div className="flex h-44 items-end gap-3" aria-hidden>
        {rows.map((r, i) => {
          const current = i === rows.length - 1;
          return (
            <div key={r.month} className="flex h-full flex-1 flex-col justify-end text-center">
              <span className="mb-1 text-sm font-semibold tabular-nums">{r.total}</span>
              <div
                className={`w-full rounded-t-lg ${current ? "bg-accent" : "bg-accent/35"}`}
                style={{ height: `${Math.max(r.total ? 6 : 2, (r.total / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 text-xs text-soft" aria-hidden>
        {rows.map((r) => <span key={r.month} className="flex-1 text-center">{label(r.month)}</span>)}
      </div>
    </figure>
  );
}
