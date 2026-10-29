import type { ReactNode } from "react";

/** 이중 테두리(바깥 틀 + 안쪽 면) 카드. tone="dark" 는 오늘 할 일 같은 한 장의 강조에만 씁니다. */
export function Card({ title, children, className = "", tone }: { title?: string; children: ReactNode; className?: string; tone?: "dark" }) {
  const dark = tone === "dark";
  return (
    <section className={`cbezel c-rise ${className}`}>
      <div className={`cbezel-in p-6 md:p-7 ${dark ? "dark" : ""}`}>
        {title && <h2 className={`mb-5 text-[11px] font-medium uppercase tracking-[0.24em] ${dark ? "text-white/60" : "gilt"}`}>{title}</h2>}
        {children}
      </div>
    </section>
  );
}

export function PageTitle({ children, sub, eyebrow }: { children: ReactNode; sub?: string; eyebrow?: string }) {
  return (
    <header className="mb-8 mt-2">
      {eyebrow && <p className="gilt mb-3 text-[11px] font-medium uppercase tracking-[0.3em]">{eyebrow}</p>}
      <h1 className="display text-[2rem] leading-[1.15] md:text-[2.4rem]">{children}</h1>
      {sub && <p className="mt-3 text-soft">{sub}</p>}
    </header>
  );
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
            <div className={`h-[3px] rounded-full ${i <= idx ? "bg-accent" : "bg-ink/10"} ${i > 0 ? "ml-1.5" : ""}`} />
            <p className={`mt-2 text-[11px] leading-tight ${i === idx ? "font-semibold text-ink" : "text-soft"}`}>{names[s]}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-display text-lg font-semibold">{names[stages[idx]]}</p>
      <p className="text-sm text-soft">{desc[stages[idx]]}</p>
    </div>
  );
}

export const labelCls = "mb-2 block text-[12px] font-medium tracking-[0.06em] text-ink/60";
