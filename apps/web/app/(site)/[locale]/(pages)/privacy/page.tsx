import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "privacy", "/privacy");
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const p = getMessages(locale as Locale).privacy;
  return (
    <>
      <PageHero photo="market" title={p.title} compact />
      <Section narrow>
        <div className="space-y-6 text-soft">
          <p><b className="text-ink">{p.draft}</b> {p.draftNote}</p>
          {p.items.map((t) => <p key={t}>{t}</p>)}
        </div>
      </Section>
    </>
  );
}
