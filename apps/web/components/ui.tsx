import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";
import { PhotoFrame } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

type Variant = "solid" | "ghost" | "onAccent" | "onAccentGhost";

/** 버튼: 컨트롤은 rounded-lg, 컨테이너(카드·사진·패널)는 rounded-2xl 로 통일 */
export function Button({ href, children, variant = "solid" }: { href: string; children: ReactNode; variant?: Variant | "light" }) {
  const v = variant === "light" ? "ghost" : variant;
  const styles: Record<Variant, string> = {
    solid: "bg-accent text-white hover:bg-[var(--accent-hover)]",
    ghost: "border border-ink/20 text-ink hover:bg-deep hover:border-ink/40",
    onAccent: "bg-white text-accent hover:bg-tint",
    onAccentGhost: "border border-white/60 text-white hover:bg-white/10",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold tracking-tight whitespace-nowrap transition duration-200 active:scale-[0.98] ${styles[v]}`}
    >
      {children}
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
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pb-24 md:pt-20">
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
    <section className={`${bg} py-20 md:py-28`}>
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
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
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

/** 마지막 행동 유도: 악센트 면 위에 흰 글자 */
export function FinalCta({ title, body, buttons, verse }: { photo?: PhotoKey; title: string; body?: string; buttons: readonly { label: string; href: string }[]; verse?: string }) {
  return (
    <section className="bg-paper px-6 pb-20 md:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl bg-accent p-8 text-white md:grid-cols-[1.3fr_1fr] md:gap-14 md:p-16">
        <div>
          {verse && <p className="mb-5 text-sm text-white/85">{verse}</p>}
          <Reveal as="h2" className="display text-[1.75rem] sm:text-4xl md:text-[2.5rem]">{title}</Reveal>
          {body && <p className="mt-5 max-w-xl text-lg text-white/85">{body}</p>}
        </div>
        <div className="md:justify-self-end">
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            {buttons.map((b, i) => (
              <Button key={b.label} href={b.href} variant={i === 0 ? "onAccent" : "onAccentGhost"}>{b.label}</Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type Cell = { name: string; text?: string };

/** 핵심 사실 묶음: 1px 선으로 나뉜 한 덩어리 */
export function Facts({ items }: { items: readonly Cell[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.name} className="bg-white p-6 md:p-7">
          <dt className="text-sm font-semibold text-accent">{it.name}</dt>
          <dd className="mt-1.5 text-lg font-medium leading-snug">{it.text}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 위쪽 선만 있는 단(段). 순서·병렬 항목에 사용 */
export function Columns({ items, cols = 3 }: { items: readonly Cell[]; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <div className={`grid gap-x-8 gap-y-10 ${grid}`}>
      {items.map((it) => (
        <div key={it.name} className="border-t-2 border-ink pt-5">
          <h3 className="text-xl font-bold tracking-tight">{it.name}</h3>
          {it.text && <p className="mt-2 text-soft">{it.text}</p>}
        </div>
      ))}
    </div>
  );
}

/** 색 면 타일: 번갈아 다른 면색 */
export function Tiles({ items }: { items: readonly Cell[] }) {
  const tones = ["bg-white", "bg-deep", "bg-deep", "bg-white"];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={it.name} className={`rounded-2xl border border-line p-7 md:p-9 ${tones[i % 4]}`}>
          <h3 className="text-xl font-bold tracking-tight md:text-2xl">{it.name}</h3>
          {it.text && <p className="mt-3 text-soft">{it.text}</p>}
        </div>
      ))}
    </div>
  );
}
