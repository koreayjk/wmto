import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { Bullets, Button, PageHero, PhotoBand, Rows, Section, Split } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "순환 기금" };

export default function Fund() {
  const f = getMessages().fund;
  return (
    <>
      <PageHero photo="partnerPanel" title={f.top.title} sub={f.body} />

      <Section title={f.termsTitle}><Rows items={f.terms} /></Section>

      <Split photo="fund" title={f.safetyTitle} tone="deep" flip>
        <Bullets items={f.safety} />
      </Split>

      <PhotoBand photo="story5" title={f.status.text} body={f.status.note} />

      <Section tone="deep">
        <Reveal><Button href={f.cta.href}>{f.cta.label}</Button></Reveal>
      </Section>
    </>
  );
}
