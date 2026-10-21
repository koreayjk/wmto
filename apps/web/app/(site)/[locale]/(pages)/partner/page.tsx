import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { photos } from "@/lib/photos";
import { Facts, FinalCta, PageHero, PhotoBand, Section, Split, Tiles } from "@/components/ui";
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
  const stagePhotos = ["story1", "camp", "partnerPanel", "partner"] as const;
  return (
    <>
      <PageHero photo="story4" title={p.top.title} sub={p.top.sub} />

      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{p.empathy.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{p.empathy.body}</Reveal>
        </div>
      </section>

      <Section title={p.assure.title}><Tiles items={p.assure.items} /></Section>

      <Section title={p.stages.title} tone="deep">
        <StoryScroll label={m.labels.step} steps={p.stages.items.map((it, i) => ({ ...it, src: photos[stagePhotos[i]] }))} />
      </Section>

      <Split photo="train" title={p.camp.title} body={p.camp.body} />

      <Section title={p.cost.title} tone="deep">
        <Facts items={p.cost.items} />
        <Reveal as="p" className="mt-8 text-soft">{p.cost.note}</Reveal>
      </Section>

      <PhotoBand photo="about" title={p.promise.title} body={p.promise.body} />
      <FinalCta title={p.final.title} body={p.final.body} buttons={p.final.buttons} />
    </>
  );
}
