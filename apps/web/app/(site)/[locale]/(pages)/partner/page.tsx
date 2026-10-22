import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { photos } from "@/lib/photos";
import { Facts, FinalCta, PageHero, PhotoBand, PhotoTiles, Section, Split } from "@/components/ui";
import { StoryScroll } from "@/components/StoryScroll";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "partner", "/partner");
}

export default async function Partner({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale as Locale);
  const p = m.partner;
  const assurePhotos = ["how", "fund", "groupTable", "market"] as const;
  const stagePhotos = ["story1", "camp", "partnerPanel", "partner"] as const;
  return (
    <>
      <PageHero photo="story4" title={p.top.title} sub={p.top.sub} />

      <Split photo="community" title={p.empathy.title} body={p.empathy.body} />

      <Section title={p.assure.title} tone="deep">
        <PhotoTiles items={p.assure.items.map((it, i) => ({ ...it, photo: assurePhotos[i] }))} />
      </Section>

      <Section title={p.stages.title}>
        <StoryScroll label={m.labels.step} steps={p.stages.items.map((it, i) => ({ ...it, src: photos[stagePhotos[i]] }))} />
      </Section>

      <Split photo="train" title={p.camp.title} body={p.camp.body} tone="deep" flip />

      <Section title={p.cost.title}>
        <Facts items={p.cost.items} />
        <Reveal as="p" className="mt-8 text-soft">{p.cost.note}</Reveal>
      </Section>

      <PhotoBand photo="about" title={p.promise.title} body={p.promise.body} />
      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
