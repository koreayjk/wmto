import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Bezel } from "./Bezel";
import { Reveal } from "./Reveal";
import { PhotoFrame } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

type Variant = "solid" | "ghost" | "onAccent" | "onAccentGhost";
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** 버튼: 알약형. 주요 버튼은 오른쪽에 아이콘 원이 들어가고, 누르면 살짝 눌리고 호버하면 아이콘이 비스듬히 움직인다. */
export function Button({ href, children, variant = "solid", icon }: { href: string; children: ReactNode; variant?: Variant | "light"; icon?: boolean }) {
  const v = variant === "light" ? "ghost" : variant;
  const hasIcon = icon ?? (v === "solid" || v === "onAccent");
  const styles: Record<Variant, string> = {
    solid: "bg-accent text-white hover:bg-[var(--accent-hover)]",
    ghost: "text-ink ring-1 ring-inset ring-ink/15 hover:bg-black/[0.04] hover:ring-ink/30",
    onAccent: "bg-white text-accent hover:bg-tint",
    onAccentGhost: "text-white ring-1 ring-inset ring-white/50 hover:bg-white/10",
  };
  const circle = v === "onAccent" ? "bg-accent/10" : "bg-white/15";
  return (
    <Link
      href={href}
      className={`group inline-flex max-w-full items-center justify-center gap-3 rounded-full text-center text-[15px] font-semibold tracking-tight transition duration-500 ${EASE} active:scale-[0.98] ${hasIcon ? "py-2 pl-6 pr-2" : "px-6 py-[13px]"} ${styles[v]}`}
    >
      {children}
      {hasIcon && (
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition duration-500 ${EASE} group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105 ${circle}`}>
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </span>
      )}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 font-semibold text-accent">
      <span className="underline decoration-accent/30 underline-offset-4 group-hover:decoration-accent">{children}</span>
      <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function ButtonRow({ buttons, onAccent }: { buttons: readonly { label: string; href: string }[]; onAccent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map((b, i) => (
        <Button key={b.label} href={b.href} variant={onAccent ? (i === 0 ? "onAccent" : "onAccentGhost") : i === 0 ? "solid" : "ghost"}>
          {b.label}
        </Button>
      ))}
    </div>
  );
}

/** 하위 페이지 상단: 왼쪽 글, 오른쪽 사진. 헤더는 sticky 라 위 여백은 짧게. */
export function PageHero({ photo, title, sub, children }: { photo: PhotoKey; title: string; sub?: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-28 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pb-32 md:pt-40">
      <div>
        <h1 className="display rise text-[2rem] sm:text-5xl md:text-[3.5rem]">{title}</h1>
        {sub && <p className="rise rise-1 mt-6 max-w-xl text-lg text-soft md:text-xl">{sub}</p>}
        {children && <div className="rise rise-2 mt-8">{children}</div>}
      </div>
      <PhotoFrame name={photo} ratio="aspect-[4/3] md:aspect-[4/5]" className="rise rise-2" />
    </section>
  );
}

type Tone = "paper" | "deep" | "tint" | "night";

/** 일반 섹션. night 는 예전 이름이라 tint 로 처리(어두운 면은 쓰지 않음). */
export function Section({ title, sub, children, tone = "paper", narrow }: { title?: string; eyebrow?: string; sub?: string; children?: ReactNode; tone?: Tone; narrow?: boolean }) {
  const bg = { paper: "bg-paper", deep: "bg-deep", tint: "bg-tint", night: "bg-tint" }[tone];
  return (
    <section className={`${bg} py-24 md:py-36`}>
      <div className={`mx-auto px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
        {title && <Reveal as="h2" className="display max-w-3xl text-[1.75rem] sm:text-4xl md:text-[2.75rem]">{title}</Reveal>}
        {sub && <p className="mt-5 max-w-2xl text-lg text-soft">{sub}</p>}
        {children && <div className={title ? "mt-12 md:mt-14" : ""}>{children}</div>}
      </div>
    </section>
  );
}

/** 글 + 사진 2단. flip 으로 좌우 교대 */
export function Split({ photo, title, body, children, flip, ratio = "aspect-[4/3]", tone = "paper" }: { photo: PhotoKey; title: string; body?: string; children?: ReactNode; flip?: boolean; ratio?: string; tone?: "paper" | "deep" }) {
  return (
    <section className={tone === "deep" ? "bg-deep" : "bg-paper"}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 md:py-36">
        <div className={flip ? "md:order-2" : ""}>
          <Reveal as="h2" className="display text-[1.75rem] sm:text-4xl md:text-[2.5rem]">{title}</Reveal>
          {body && <p className="mt-6 max-w-xl text-lg leading-[1.9] text-soft">{body}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        <PhotoFrame name={photo} ratio={ratio} className={flip ? "md:order-1" : ""} />
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-lg leading-[1.95] text-soft">{children}</p>;
}

type Item = { name: string; text?: string; en?: string };

/** 항목 목록: 구분선은 항목 사이에만 한 줄 */
export function Rows({ items }: { items: readonly Item[]; tone?: "paper" | "night" }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <li key={it.name} className="grid gap-2 py-7 md:grid-cols-[1fr_1.6fr] md:gap-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">{it.name}</h3>
            {it.en && <p className="mt-0.5 text-sm font-medium text-accent">{it.en}</p>}
          </div>
          {it.text && <p className="text-soft">{it.text}</p>}
        </li>
      ))}
    </ul>
  );
}

export function Bullets({ items }: { items: readonly string[]; tone?: "paper" | "night" }) {
  return (
    <ul className="max-w-2xl space-y-5">
      {items.map((t) => (
        <li key={t} className="flex gap-4 text-lg">
          <span className="mt-[0.72em] h-px w-6 shrink-0 bg-accent" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** 흐름 도식. 순서가 의미를 갖는 경우에만 사용 */
export function Steps({ items }: { items: readonly string[] }) {
  return (
    <ol className="grid gap-x-6 md:grid-cols-5">
      {items.map((t, i) => (
        <li key={t} className="relative border-t border-ink/20 pb-6 pr-4 pt-7">
          <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-accent" aria-hidden />
          <span className="text-sm font-semibold text-accent">{i + 1}</span>
          <p className="mt-1 text-lg font-bold tracking-tight">{t}</p>
        </li>
      ))}
    </ol>
  );
}

/** 마지막 행동 유도: 악센트 면을 이중 테두리로 감싼다 */
export function FinalCta({ title, body, buttons, verse }: { photo?: PhotoKey; title: string; body?: string; buttons: readonly { label: string; href: string }[]; verse?: string }) {
  return (
    <section className="bg-paper px-4 pb-24 md:px-6 md:pb-36">
      <Bezel className="mx-auto max-w-6xl" inner="bg-accent text-white" innerClassName="grid items-center gap-10 p-8 md:grid-cols-[1.3fr_1fr] md:gap-14 md:p-16">
        <div>
          {verse && <p className="mb-5 text-sm text-white/85">{verse}</p>}
          <Reveal as="h2" className="display text-[1.75rem] sm:text-4xl md:text-[2.5rem]">{title}</Reveal>
          {body && <p className="mt-5 max-w-xl text-lg text-white/85">{body}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:justify-self-end">
          {buttons.map((b, i) => (
            <Button key={b.label} href={b.href} variant={i === 0 ? "onAccent" : "onAccentGhost"}>{b.label}</Button>
          ))}
        </div>
      </Bezel>
    </section>
  );
}

type Cell = { name: string; text?: string };

/** 핵심 사실 묶음: 이중 테두리 안에서 1px 선으로 나뉜다 */
export function Facts({ items }: { items: readonly Cell[] }) {
  return (
    <Reveal>
      <Bezel innerClassName="">
        <dl className="grid gap-px bg-line sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.name} className="bg-white p-6 md:p-8">
              <dt className="text-sm font-semibold text-accent">{it.name}</dt>
              <dd className="mt-1.5 text-lg font-medium leading-snug">{it.text}</dd>
            </div>
          ))}
        </dl>
      </Bezel>
    </Reveal>
  );
}

const stagger = (i: number) => (Math.min(i, 3) as 0 | 1 | 2 | 3) || undefined;

/** 위쪽 선만 있는 단(段). 순서·병렬 항목에 사용. 항목이 차례로 올라온다 */
export function Columns({ items, cols = 3 }: { items: readonly Cell[]; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <div className={`grid gap-x-8 gap-y-12 ${grid}`}>
      {items.map((it, i) => (
        <Reveal key={it.name} delay={stagger(i)} className="border-t-2 border-ink pt-6">
          <h3 className="text-xl font-bold tracking-tight">{it.name}</h3>
          {it.text && <p className="mt-2 text-soft">{it.text}</p>}
        </Reveal>
      ))}
    </div>
  );
}

/** 색 면 타일: 이중 테두리, 번갈아 다른 면색 */
export function Tiles({ items }: { items: readonly Cell[] }) {
  const tones = ["bg-white", "bg-deep", "bg-deep", "bg-white"];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => (
        <Reveal key={it.name} delay={stagger(i)}>
          <Bezel inner={tones[i % 4]} innerClassName="p-7 md:p-10">
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">{it.name}</h3>
            {it.text && <p className="mt-3 text-soft">{it.text}</p>}
          </Bezel>
        </Reveal>
      ))}
    </div>
  );
}
