import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { photos } from "@/lib/photos";
import { Bezel } from "@/components/Bezel";
import { Bullets, Button, Facts, PageHero, PhotoBand, Prose, Section, Split, Tiles } from "@/components/ui";
import { PhotoFrame } from "@/components/Photo";
import { StoryScroll } from "@/components/StoryScroll";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "camp", "/camp");
}

export default async function Camp({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale as Locale);
  const c = m.camp;
  const weekPhotos = ["story1", "mentorPanel", "partnerPanel"] as const;
  return (
    <>
      <PageHero photo="camp" title={c.top.title} sub={c.top.sub} />

      <Section title={c.intro.title}>
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5"><Prose>{c.intro.body}</Prose></div>
          <div className="relative md:col-span-7 md:pb-12">
            <PhotoFrame name="train" ratio="aspect-[4/3]" />
            <Reveal delay={1} className="mt-4 md:absolute md:bottom-0 md:-left-12 md:mt-0 md:w-[19rem]">
              <Bezel className="shadow-[0_30px_60px_-30px_rgba(6,32,27,0.45)]">
                <dl className="divide-y divide-line px-6 py-1">
                  {c.overview.items.map((f) => (
                    <div key={f.name} className="py-4">
                      <dt className="text-sm font-semibold text-accent">{f.name}</dt>
                      <dd className="mt-0.5 text-[15px] font-medium leading-snug">{f.text}</dd>
                    </div>
                  ))}
                </dl>
              </Bezel>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section title={c.weeks.title} tone="deep">
        <StoryScroll steps={c.weeks.items.map((it, i) => ({ ...it, src: photos[weekPhotos[i]] }))} label={m.labels.week} />
      </Section>

      <Section title={c.tracks.title}><Tiles items={c.tracks.items} /></Section>

      <Split photo="groupTable" title={c.teachers.title} body={c.teachers.body} tone="deep" flip />

      <Section title={c.cost.title}><Facts items={c.cost.items} /></Section>

      <PhotoBand photo="how" title={c.after.title} body={c.after.items.join(" · ")} />

      <Section tone="deep">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="text-2xl font-bold tracking-tight">{c.support.partner.who}</p>
            <div className="mt-6"><Button href={c.support.partner.href}>{c.support.partner.label}</Button></div>
          </Reveal>
          <Reveal delay={1}>
            <p className="text-2xl font-bold tracking-tight">{c.support.mentor.who}</p>
            <p className="mt-3 text-soft">{c.support.mentor.text}</p>
            <div className="mt-6"><Button href={c.support.mentor.href} variant="ghost">{c.support.mentor.label}</Button></div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
