import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, Button, PageHero, Prose, Rows, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "순환 기금" };

export default function Fund() {
  const f = getMessages().fund;
  return (
    <>
      <PageHero photo="fund" eyebrow="Pass-It-On Fund" title={f.top.title} />
      <Section narrow><Prose>{f.body}</Prose></Section>
      <Section title={f.termsTitle} tone="deep"><Rows items={f.terms} /></Section>
      <Section title={f.safetyTitle}><Bullets items={f.safety} /></Section>
      <Section title={f.status.title} tone="night">
        <Reveal as="p" className="font-serif text-2xl md:text-3xl">{f.status.text}</Reveal>
        <p className="mt-4 text-sm text-white/50">{f.status.note}</p>
        <div className="mt-10"><Button href={f.cta.href}>{f.cta.label}</Button></div>
      </Section>
    </>
  );
}
