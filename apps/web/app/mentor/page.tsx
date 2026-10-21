import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, Columns, Facts, FinalCta, PageHero, PhotoTiles, Rows, Section, Split } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "사업가 (Mentor)" };

export default function Mentor() {
  const p = getMessages().mentor;
  const wayPhotos = ["mentorPanel", "story1", "market", "groupTable"] as const;
  return (
    <>
      <PageHero photo="mentor" title={p.top.title} sub={p.top.sub} />

      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{p.why.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{p.why.body}</Reveal>
        </div>
      </section>

      <Section title={p.ways.title} sub={p.ways.sub}>
        <PhotoTiles items={p.ways.items.map((it, i) => ({ name: `${it.name} (${it.en})`, text: it.text, photo: wayPhotos[i] }))} />
        <Reveal as="p" className="mt-10 text-lg font-bold">{p.ways.closing}</Reveal>
      </Section>

      <Section title={p.how.title} tone="deep"><Rows items={p.how.items} /></Section>

      <Split photo="how" title={p.gain.title} flip>
        <Bullets items={p.gain.items} />
      </Split>

      <Section title={p.stages.title} tone="deep"><Columns items={p.stages.items} cols={4} /></Section>

      <Section title={p.fee.title}>
        <Facts items={p.fee.lines.map((l, i) => ({ name: i === 0 ? "회비" : "순환 기금", text: l }))} />
      </Section>

      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
