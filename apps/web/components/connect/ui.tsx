import type { ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {title && <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-clay">{title}</h2>}
      {children}
    </section>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="display mb-6 text-3xl">{children}</h1>;
}

/** 성장 단계 진행 바 - 순위가 아니라 단계 이름으로 격려 */
export function StageBar({
  stages,
  current,
  names,
  desc,
}: {
  stages: readonly string[];
  current: string | null;
  names: Record<string, string>;
  desc: Record<string, string>;
}) {
  const idx = Math.max(0, stages.indexOf(current ?? stages[0]));
  return (
    <div>
      <ol className="flex">
        {stages.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={`h-1 ${i <= idx ? "bg-clay" : "bg-ink/15"} ${i > 0 ? "ml-1" : ""}`} />
            <p className={`mt-2 text-[11px] leading-tight ${i === idx ? "font-semibold text-ink" : "text-soft"}`}>{names[s]}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-display text-lg font-semibold">{names[stages[idx]]}</p>
      <p className="text-sm text-soft">{desc[stages[idx]]}</p>
    </div>
  );
}

export const labelCls = "mb-1.5 block text-sm font-medium";
