import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { Bullets, Button, PageHero, PhotoBand, Rows, Section, Split } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "fund", "/fund");
}

export default async function Fund({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const f = getMessages(locale as Locale).fund;
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
