import type { Metadata } from "next";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { Button, FinalCta, PageHero, Section, Split } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "stories", "/stories");
}
export const revalidate = 300;

type Story = { id: string; title: string; body: string; image_url: string | null; is_example: boolean; published_at: string };

export default async function Stories({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale as Locale).stories;
  const db = createPublicClient();
  let stories: Story[] = [];
  if (db) {
    const { data } = await db
      .from("stories")
      .select("id,title,body,image_url,is_example,published_at")
      .order("published_at", { ascending: false });
    stories = (data ?? []) as Story[];
  }
  return (
    <>
      <PageHero photo="how" title={m.title} compact />
      {stories.length === 0 ? (
        <Split photo="story4" title={m.emptyTitle} body={m.emptyBody}>
          <Button href="/apply?type=observe">{m.observeCta}</Button>
        </Split>
      ) : (
      <Section>
        <div className="grid gap-16">
            {stories.map((s) => (
              <Reveal as="article" key={s.id} className="grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_1.4fr]">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="aspect-[4/3] w-full rounded-[1.25rem] object-cover" />
                ) : (
                  <div className="photo-fallback aspect-[4/3] w-full rounded-[1.25rem]" />
                )}
                <div>
                  {s.is_example && (
                    <span className="mb-3 inline-block rounded-full bg-tint px-3 py-1 text-xs font-semibold text-accent">{m.example}</span>
                  )}
                  <h2 className="display text-2xl md:text-3xl">{s.title}</h2>
                  <p className="mt-4 whitespace-pre-line text-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
        </div>
      </Section>
      )}
      <FinalCta title={m.finalTitle} body={m.finalBody} buttons={m.finalButtons} />
    </>
  );
}
