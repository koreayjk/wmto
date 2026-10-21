import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n";
import { createPublicClient } from "@/lib/supabase/public";
import { Button, FinalCta, PageHero, Section, Split } from "@/components/ui";
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
      <PageHero photo="how" title={m.title} compact />
      {stories.length === 0 ? (
        <Split photo="story4" title={m.emptyTitle} body={m.emptyBody}>
          <Button href="/apply?type=observe">온라인 모임 참관 신청</Button>
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
      <FinalCta title="다음 이야기의 주인공이 되어 주세요" body="사업가로, 선교사로, 후원자로 함께해 주세요." buttons={[{ label: "사업가로 동참하기", href: "/mentor" }, { label: "자립 상담 신청", href: "/apply?type=partner_consult" }]} />
    </>
  );
}
