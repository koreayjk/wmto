import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import type { PhotoKey } from "@/lib/photos";

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mb-5 text-xs font-medium uppercase tracking-[0.28em] ${light ? "text-gold" : "text-clay"}`}>
      {children}
    </p>
  );
}

export function Button({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost" | "light";
}) {
  const styles = {
    solid: "bg-clay text-white hover:bg-[#954220]",
    ghost: "border border-ink/30 text-ink hover:bg-ink hover:text-paper",
    light: "border border-white/50 text-white hover:bg-white hover:text-night",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-medium tracking-tight transition-colors ${styles}`}
    >
      {children}
    </Link>
  );
}

/** 페이지 상단 풀스크린 장면 */
export function PageHero({
  photo,
  eyebrow,
  title,
  sub,
  children,
}: {
  photo: PhotoKey;
  eyebrow?: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[78svh] items-end overflow-hidden text-white">
      <Photo name={photo} drift overlay="bg-gradient-to-t from-night/85 via-night/40 to-night/20" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40 md:pb-28">
        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
        <Reveal as="h1" className="display max-w-4xl text-[2.4rem] sm:text-6xl md:text-7xl">
          {title}
        </Reveal>
        {sub && (
          <Reveal as="p" delay={1} className="mt-7 max-w-2xl text-lg text-white/80 md:text-xl">
            {sub}
          </Reveal>
        )}
        {children && <Reveal delay={2} className="mt-10">{children}</Reveal>}
      </div>
    </section>
  );
}

/** 일반 섹션 */
export function Section({
  title,
  eyebrow,
  sub,
  children,
  tone = "paper",
  narrow,
}: {
  title?: string;
  eyebrow?: string;
  sub?: string;
  children?: ReactNode;
  tone?: "paper" | "deep" | "night";
  narrow?: boolean;
}) {
  const bg = { paper: "bg-paper", deep: "bg-deep", night: "bg-night text-white" }[tone];
  return (
    <section className={`${bg} py-24 md:py-36`}>
      <div className={`mx-auto px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
        {eyebrow && <Eyebrow light={tone === "night"}>{eyebrow}</Eyebrow>}
        {title && (
          <Reveal as="h2" className="display max-w-3xl text-3xl sm:text-4xl md:text-5xl">
            {title}
          </Reveal>
        )}
        {sub && (
          <Reveal as="p" delay={1} className={`mt-6 max-w-2xl text-lg ${tone === "night" ? "text-white/70" : "text-soft"}`}>
            {sub}
          </Reveal>
        )}
        {children && <div className={title ? "mt-14" : ""}>{children}</div>}
      </div>
    </section>
  );
}

/** 사진 위에 글이 얹히는 풀블리드 장면 */
export function Scene({
  photo,
  title,
  body,
  children,
  align = "left",
}: {
  photo: PhotoKey;
  title: string;
  body?: string;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden py-28 text-white">
      <Photo name={photo} overlay="bg-night/55" />
      <div className={`relative mx-auto w-full max-w-6xl px-6 ${align === "center" ? "text-center" : ""}`}>
        <Reveal as="h2" className={`display text-3xl sm:text-5xl md:text-6xl ${align === "center" ? "mx-auto" : ""} max-w-4xl`}>
          {title}
        </Reveal>
        {body && (
          <Reveal as="p" delay={1} className={`mt-8 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl ${align === "center" ? "mx-auto" : ""}`}>
            {body}
          </Reveal>
        )}
        {children && <Reveal delay={2} className="mt-10">{children}</Reveal>}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft">{children}</Reveal>;
}

type Item = { name: string; text?: string; en?: string };

/** 번호 없는 라인 리스트 (카드 남발 대신 얇은 구분선) */
export function Rows({ items, tone = "paper" }: { items: readonly Item[]; tone?: "paper" | "night" }) {
  const line = tone === "night" ? "border-white/15" : "border-line";
  return (
    <ul className={`border-t ${line}`}>
      {items.map((it, i) => (
        <Reveal as="li" key={it.name} delay={(Math.min(i, 3) as 1 | 2 | 3) || undefined}
          className={`grid gap-2 border-b ${line} py-7 md:grid-cols-[1fr_1.6fr] md:gap-10`}>
          <div>
            <h3 className="font-serif text-xl font-semibold md:text-2xl">{it.name}</h3>
            {it.en && <p className="mt-1 text-sm tracking-wide text-clay">{it.en}</p>}
          </div>
          {it.text && <p className={tone === "night" ? "text-white/75" : "text-soft"}>{it.text}</p>}
        </Reveal>
      ))}
    </ul>
  );
}

export function Bullets({ items, tone = "paper" }: { items: readonly string[]; tone?: "paper" | "night" }) {
  return (
    <ul className="space-y-5">
      {items.map((t, i) => (
        <Reveal as="li" key={t} delay={(Math.min(i, 3) as 1 | 2 | 3) || undefined} className="flex gap-4 text-lg">
          <span className="mt-[0.7em] h-px w-8 shrink-0 bg-clay" />
          <span className={tone === "night" ? "text-white/85" : ""}>{t}</span>
        </Reveal>
      ))}
    </ul>
  );
}

/** 단계 도식 (가로 → 모바일에서는 세로) */
export function Steps({ items, tone = "paper" }: { items: readonly string[]; tone?: "paper" | "night" }) {
  return (
    <ol className="grid gap-0 md:grid-cols-5">
      {items.map((t, i) => (
        <Reveal as="li" key={t} delay={(Math.min(i, 3) as 1 | 2 | 3) || undefined}
          className={`relative border-t py-6 pr-6 md:pt-8 ${tone === "night" ? "border-white/25" : "border-ink/25"}`}>
          <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-clay" />
          <span className="font-serif text-sm text-clay">{String(i + 1).padStart(2, "0")}</span>
          <p className="mt-1 font-serif text-lg font-semibold">{t}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export function ButtonRow({ buttons, light }: { buttons: readonly { label: string; href: string }[]; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map((b, i) => (
        <Button key={b.label} href={b.href} variant={i === 0 ? "solid" : light ? "light" : "ghost"}>
          {b.label}
        </Button>
      ))}
    </div>
  );
}

export function FinalCta({
  photo = "final",
  title,
  body,
  buttons,
  verse,
}: {
  photo?: PhotoKey;
  title: string;
  body?: string;
  buttons: readonly { label: string; href: string }[];
  verse?: string;
}) {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden py-28 text-white">
      <Photo name={photo} overlay="bg-night/65" />
      <div className="relative mx-auto w-full max-w-4xl px-6 text-center">
        {verse && <Reveal as="p" className="mb-8 font-serif text-base italic text-gold md:text-lg">{verse}</Reveal>}
        <Reveal as="h2" className="display text-3xl sm:text-5xl md:text-6xl">{title}</Reveal>
        {body && <Reveal as="p" delay={1} className="mx-auto mt-7 max-w-xl text-lg text-white/80">{body}</Reveal>}
        <Reveal delay={2} className="mt-10 flex justify-center">
          <ButtonRow buttons={buttons} light />
        </Reveal>
      </div>
    </section>
  );
}
