import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { photos } from "@/lib/photos";
import { Columns, FinalCta, PageHero, PhotoBand, Prose, Section, Split } from "@/components/ui";
import { PeopleBento } from "@/components/People";
import { StoryScroll } from "@/components/StoryScroll";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const m = getMessages();
  const a = m.about;
  const missionPhotos = ["mentorPanel", "camp", "fund", "story4"] as const;
  return (
    <>
      <PageHero photo="aboutHero" title={a.top.title} sub={a.top.sub} />

      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{a.who.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{a.who.body}</Reveal>
        </div>
      </section>

      <Split photo="community" title={a.vision.title} body={a.vision.body} />

      <Section title={a.mission.title} tone="deep">
        <StoryScroll
          label="미션 {n}"
          steps={a.mission.items.map((t, i) => ({ name: t, text: "", src: photos[missionPhotos[i]] }))}
        />
      </Section>

      <PhotoBand photo="about" title={a.different.title} body={a.different.body} />

      <Section title={a.values.title}>
        <Columns items={a.values.items} cols={4} />
      </Section>

      <Section title={a.three.title} tone="deep">
        <PeopleBento items={a.three.items.map((it) => {
          const [name, en] = it.name.replace(")", "").split(" (");
          return { name, en, text: it.text };
        })} />
      </Section>

      <Section title={a.ops.title}><Prose>{a.ops.body}</Prose></Section>
      <FinalCta title={a.final.title} buttons={a.final.buttons} />
    </>
  );
}
