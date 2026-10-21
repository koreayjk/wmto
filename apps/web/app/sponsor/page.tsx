import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, FinalCta, PageHero, PhotoBand, PhotoTiles, Section, Split } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "후원자 (Sponsor)" };

export default function Sponsor() {
  const p = getMessages().sponsor;
  const wayPhotos = ["story5", "train", "fund", "how"] as const;
  return (
    <>
      <PageHero photo="sponsor" title={p.top.title} sub={p.top.sub} />

      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{p.why.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{p.why.body}</Reveal>
        </div>
      </section>

      <Section title={p.ways.title}>
        <PhotoTiles items={p.ways.items.map((it, i) => ({ ...it, photo: wayPhotos[i] }))} />
      </Section>

      <PhotoBand photo="about" title={p.cycle.title} body={p.cycle.body} />

      <Split photo="story4" title={p.report.title} tone="deep">
        <Bullets items={p.report.items} />
      </Split>

      <Section title={p.church.title}>
        <Reveal as="p" className="max-w-2xl text-lg leading-[1.95] text-soft">{p.church.body}</Reveal>
      </Section>

      <FinalCta title={p.final.title} buttons={p.final.buttons} />
    </>
  );
}
