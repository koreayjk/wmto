import type { Metadata } from "next";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { Bullets, Button, PageHero, Prose, Rows, Section, Columns, Facts, Tiles } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "필리핀 훈련 캠프" };

export default function Camp() {
  const c = getMessages().camp;
  return (
    <>
      <PageHero photo="camp" title={c.top.title} sub={c.top.sub} />
      <Section title={c.intro.title}><Prose>{c.intro.body}</Prose></Section>
      <Section title={c.overview.title} tone="deep"><Facts items={c.overview.items} /></Section>
      <Section title={c.weeks.title}><Columns items={c.weeks.items} cols={3} /></Section>
      <Section title={c.tracks.title} tone="tint"><Tiles items={c.tracks.items} /></Section>
      <Section title={c.teachers.title}><Prose>{c.teachers.body}</Prose></Section>
      <Section title={c.cost.title} tone="deep"><Facts items={c.cost.items} /></Section>
      <Section title={c.after.title}><Bullets items={c.after.items} /></Section>
      <Section tone="tint">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="font-display text-2xl font-semibold">{c.support.partner.who}</p>
            <div className="mt-6"><Button href={c.support.partner.href}>{c.support.partner.label}</Button></div>
          </Reveal>
          <Reveal delay={1}>
            <p className="font-display text-2xl font-semibold">{c.support.mentor.who}</p>
            <p className="mt-3 text-soft">{c.support.mentor.text}</p>
            <div className="mt-6"><Button href={c.support.mentor.href} variant="light">{c.support.mentor.label}</Button></div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
