import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { FinalCta, PageHero, Prose, Rows, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "선교사 (Partner)" };

export default function Partner() {
  const p = getMessages().partner;
  return (
    <>
      <PageHero photo="partner" eyebrow="Partner" title={p.top.title} sub={p.top.sub} />
      <Section title={p.empathy.title}><Prose>{p.empathy.body}</Prose></Section>
      <Section title={p.assure.title} tone="deep"><Rows items={p.assure.items} /></Section>
      <Section title={p.stages.title}><Rows items={p.stages.items} /></Section>
      <Section title={p.camp.title} tone="night"><Reveal as="p" delay={1} className="max-w-2xl text-lg leading-[2] text-white/80">{p.camp.body}</Reveal></Section>
      <Section title={p.cost.title}>
        <Rows items={p.cost.items} />
        <Reveal as="p" className="mt-8 text-soft">{p.cost.note}</Reveal>
      </Section>
      <Section title={p.promise.title} tone="deep"><Prose>{p.promise.body}</Prose></Section>
      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
