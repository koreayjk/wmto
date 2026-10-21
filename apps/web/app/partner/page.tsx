import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { FinalCta, PageHero, Prose, Rows, Section, Columns, Facts, Tiles } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "선교사 (Partner)" };

export default function Partner() {
  const p = getMessages().partner;
  return (
    <>
      <PageHero photo="partner" title={p.top.title} sub={p.top.sub} />
      <Section title={p.empathy.title}><Prose>{p.empathy.body}</Prose></Section>
      <Section title={p.assure.title} tone="deep"><Tiles items={p.assure.items} /></Section>
      <Section title={p.stages.title}><Columns items={p.stages.items} cols={4} /></Section>
      <Section title={p.camp.title} tone="tint"><Reveal as="p" delay={1} className="max-w-2xl text-lg leading-[2] text-soft">{p.camp.body}</Reveal></Section>
      <Section title={p.cost.title}>
        <Facts items={p.cost.items} />
        <Reveal as="p" className="mt-8 text-soft">{p.cost.note}</Reveal>
      </Section>
      <Section title={p.promise.title} tone="deep"><Prose>{p.promise.body}</Prose></Section>
      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
