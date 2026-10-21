import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { createPublicClient } from "@/lib/supabase/public";
import { PageHero, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "스토리" };
export const revalidate = 300;

type Story = { id: string; title: string; body: string; image_url: string | null; is_example: boolean; published_at: string };

export default async function Stories() {
  const m = getMessages().stories;
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
      <PageHero photo="how" title={m.title} />
      <Section>
        {stories.length === 0 ? (
          <p className="text-lg text-soft">{m.empty}</p>
        ) : (
          <div className="grid gap-16">
            {stories.map((s) => (
              <Reveal as="article" key={s.id} className="grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_1.4fr]">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="photo-fallback aspect-[4/3] w-full" />
                )}
                <div>
                  {s.is_example && (
                    <span className="mb-3 inline-block border border-clay px-2 py-0.5 text-xs text-clay">{m.example}</span>
                  )}
                  <h2 className="display text-2xl md:text-3xl">{s.title}</h2>
                  <p className="mt-4 whitespace-pre-line text-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
