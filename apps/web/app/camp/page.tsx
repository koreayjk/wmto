import type { Metadata } from "next";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { Bullets, Button, PageHero, Prose, Rows, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "필리핀 훈련 캠프" };

export default function Camp() {
  const c = getMessages().camp;
  return (
    <>
      <PageHero photo="camp" eyebrow="Philippines Camp" title={c.top.title} sub={c.top.sub} />
      <Section title={c.intro.title}><Prose>{c.intro.body}</Prose></Section>
      <Section title={c.overview.title} tone="deep"><Rows items={c.overview.items} /></Section>
      <Section title={c.weeks.title}><Rows items={c.weeks.items} /></Section>
      <Section title={c.tracks.title} tone="night"><Rows items={c.tracks.items} tone="night" /></Section>
      <Section title={c.teachers.title}><Prose>{c.teachers.body}</Prose></Section>
      <Section title={c.cost.title} tone="deep"><Rows items={c.cost.items} /></Section>
      <Section title={c.after.title}><Bullets items={c.after.items} /></Section>
      <Section tone="night">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="font-serif text-2xl font-semibold">{c.support.partner.who}</p>
            <div className="mt-6"><Button href={c.support.partner.href}>{c.support.partner.label}</Button></div>
          </Reveal>
          <Reveal delay={1}>
            <p className="font-serif text-2xl font-semibold">{c.support.mentor.who}</p>
            <p className="mt-3 text-white/75">{c.support.mentor.text}</p>
            <div className="mt-6"><Button href={c.support.mentor.href} variant="light">{c.support.mentor.label}</Button></div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
