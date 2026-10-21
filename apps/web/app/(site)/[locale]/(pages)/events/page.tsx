import type { Metadata } from "next";
import { L } from "@/components/L";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { FinalCta, PageHero, PhotoTiles, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import type { EventType } from "@/lib/codes";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "events", "/events");
}
export const revalidate = 300;

type Ev = { id: string; type: EventType; title: string; start_at: string; end_at: string | null; location: string | null };

const fmts = Object.fromEntries((["ko", "en"] as const).map((l) => [l, new Intl.DateTimeFormat(l === "en" ? "en-US" : "ko-KR", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Seoul" })])) as Record<Locale, Intl.DateTimeFormat>;

export default async function Events({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale as Locale).events;
  const fmt = fmts[locale as Locale];
  const db = createPublicClient();
  let events: Ev[] = [];
  if (db) {
    const { data } = await db
      .from("events")
      .select("id,type,title,start_at,end_at,location")
      .gte("start_at", new Date(Date.now() - 86400000).toISOString())
      .order("start_at");
    events = (data ?? []) as Ev[];
  }
  return (
    <>
      <PageHero photo="story1" title={m.title} compact />
      <Section>
        {events.length === 0 ? (
          <p className="text-lg text-soft">{m.empty}</p>
        ) : (
          <ul className="border-t border-line">
            {events.map((e) => (
              <Reveal as="li" key={e.id} className="grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr_auto] md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-clay">{m.types[e.type]}</p>
                  <p className="mt-1 text-sm text-soft">{fmt.format(new Date(e.start_at))}</p>
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold md:text-2xl">{e.title}</h2>
                  {e.location && <p className="text-sm text-soft">{e.location}</p>}
                </div>
                {e.type === "online" && (
                  <L href="/apply?type=observe" className="bg-clay px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[var(--accent-hover)] rounded-lg">
                    {m.observe}
                  </L>
                )}
              </Reveal>
            ))}
          </ul>
        )}
      </Section>

      <Section title={m.regularTitle} tone="deep">
        <PhotoTiles items={m.regular.map((r, i) => ({ ...r, photo: (["story1", "groupTable", "camp", "community"] as const)[i] }))} />
      </Section>

      <FinalCta title={m.finalTitle} body={m.finalBody} buttons={m.finalButtons} />
    </>
  );
}
