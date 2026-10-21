import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, FinalCta, PageHero, Prose, Rows, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "사업가 (Mentor)" };

export default function Mentor() {
  const p = getMessages().mentor;
  return (
    <>
      <PageHero photo="mentor" eyebrow="Mentor" title={p.top.title} sub={p.top.sub} />
      <Section title={p.why.title}><Prose>{p.why.body}</Prose></Section>
      <Section title={p.ways.title} sub={p.ways.sub} tone="deep">
        <Rows items={p.ways.items} />
        <Reveal as="p" className="mt-10 font-serif text-lg">{p.ways.closing}</Reveal>
      </Section>
      <Section title={p.how.title}><Rows items={p.how.items} /></Section>
      <Section title={p.gain.title} tone="night"><Bullets items={p.gain.items} tone="night" /></Section>
      <Section title={p.stages.title}><Rows items={p.stages.items} /></Section>
      <Section title={p.fee.title} tone="deep">
        <div className="space-y-3 font-serif text-2xl">
          {p.fee.lines.map((l) => <Reveal as="p" key={l}>{l}</Reveal>)}
        </div>
      </Section>
      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
