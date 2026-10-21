import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, FinalCta, PageHero, Prose, Rows, Section, Columns } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const a = getMessages().about;
  return (
    <>
      <PageHero photo="about" title={a.top.title} sub={a.top.sub} />
      <Section title={a.who.title}><Prose>{a.who.body}</Prose></Section>
      <Section title={a.vision.title} tone="deep"><Prose>{a.vision.body}</Prose></Section>
      <Section title={a.mission.title}><Bullets items={a.mission.items} /></Section>
      <Section title={a.different.title} tone="tint"><Reveal as="p" delay={1} className="max-w-2xl text-lg leading-[2] text-soft">{a.different.body}</Reveal></Section>
      <Section title={a.values.title}><Columns items={a.values.items} cols={4} /></Section>
      <Section title={a.three.title} tone="deep"><Rows items={a.three.items} /></Section>
      <Section title={a.ops.title}><Prose>{a.ops.body}</Prose></Section>
      <FinalCta title={a.final.title} buttons={a.final.buttons} />
    </>
  );
}
