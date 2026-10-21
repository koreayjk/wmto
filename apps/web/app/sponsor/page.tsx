import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, FinalCta, PageHero, Prose, Rows, Section, Tiles } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "후원자 (Sponsor)" };

export default function Sponsor() {
  const m = getMessages();
  const p = m.sponsor;
  return (
    <>
      <PageHero photo="sponsor" title={p.top.title} sub={p.top.sub} />
      <Section title={p.why.title}><Prose>{p.why.body}</Prose></Section>
      <Section title={p.ways.title} tone="deep"><Tiles items={p.ways.items} /></Section>
      <Section title={p.cycle.title} tone="tint"><Reveal as="p" delay={1} className="max-w-2xl text-lg leading-[2] text-soft">{p.cycle.body}</Reveal></Section>
      <Section title={p.report.title}><Bullets items={p.report.items} /></Section>
      <Section title={p.church.title} tone="deep"><Prose>{p.church.body}</Prose></Section>
      <section className="bg-paper py-24 text-center">
        <Reveal as="p" className="mx-auto max-w-3xl px-6 font-display text-2xl leading-relaxed md:text-3xl">
          &ldquo;{m.verse.en}&rdquo;
          <span className="mt-4 block text-base not-italic text-clay">- {m.verse.refEn}</span>
        </Reveal>
      </section>
      <FinalCta title={p.final.title} buttons={p.final.buttons} />
    </>
  );
}
