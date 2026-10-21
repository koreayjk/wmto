import { getMessages, type Locale } from "@/lib/i18n";
import { Button, FinalCta, Rows, Section, TextLink } from "@/components/ui";
import { ValuesMarquee } from "@/components/Marquee";
import { StoryScroll } from "@/components/StoryScroll";
import { PeopleBento } from "@/components/People";
import { photos } from "@/lib/photos";
import { Bezel } from "@/components/Bezel";
import { Photo, PhotoFrame } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale as Locale);
  const h = m.home;
  const [primary, ...others] = h.hero.buttons;
  return (
    <>
      {/* 1. 첫 화면: 전체 사진 배경 + 글. 사진 속 인물이 왼쪽에 있어 글은 오른쪽에 둔다(모바일은 아래) */}
      <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden text-white md:items-center">
        <Photo name="hero" alt={m.alts.hero} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06201b]/92 via-[#06201b]/50 to-[#06201b]/20 md:bg-gradient-to-l md:from-[#06201b]/88 md:via-[#06201b]/60 md:to-[#06201b]/0" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-32 md:py-32">
          <div className="md:ml-auto md:max-w-[44rem]">
            <h1 className="display rise text-[2.1rem] sm:text-[2.75rem] lg:text-[3.2rem]">{h.hero.title}</h1>
            <p className="rise rise-1 mt-6 max-w-xl text-lg text-white/90 md:text-xl">{h.hero.sub}</p>
            <div className="rise rise-2 mt-10 flex flex-wrap gap-3">
              <Button href={primary.href} variant="onAccent">{primary.label}</Button>
              {others.map((b) => <Button key={b.href} href={b.href} variant="onAccentGhost">{b.label}</Button>)}
            </div>
          </div>
        </div>
      </section>

      {/* 가치 띠 */}
      <ValuesMarquee items={m.about.values.items} label={m.labels.marquee} />

      {/* 2. 문제: 한 문장에 집중 */}
      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{h.problem.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{h.problem.body}</Reveal>
        </div>
      </section>

      {/* 3. 세 사람: 크기가 다른 세 면, 사진을 바탕으로 */}
      <Section title={h.solution.title}>
        <PeopleBento items={h.solution.items} />
      </Section>

      {/* 4. 사례와 흐름: 스크롤하면 사진이 바뀌는 단계 이야기 */}
      <Section title={h.how.title} sub={h.how.body} tone="deep">
        <p className="-mt-6 mb-16 text-sm text-soft md:mb-20">* {h.how.note}</p>
        <StoryScroll
          label={m.labels.step}
          steps={h.how.steps.map((st, i) => ({ ...st, src: photos[(["story1", "camp", "how", "story4", "story5"] as const)[i]] }))}
        />
      </Section>

      {/* 5. 캠프: 사진 위에 정보 카드가 겹친다 */}
      <Section title={h.camp.title}>
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="max-w-xl text-lg leading-[1.9] text-soft">{h.camp.body}</p>
            <div className="mt-8"><TextLink href={h.camp.cta.href}>{h.camp.cta.label}</TextLink></div>
          </div>
          <div className="relative md:col-span-7 md:pb-12">
            <PhotoFrame name="train" ratio="aspect-[4/3]" />
            <Reveal delay={1} className="mt-4 md:absolute md:-bottom-0 md:-left-12 md:mt-0 md:w-[19rem]">
              <Bezel className="shadow-[0_30px_60px_-30px_rgba(6,32,27,0.45)]">
                <dl className="divide-y divide-line px-6 py-1">
                  {m.camp.overview.items.slice(0, 3).map((f) => (
                    <div key={f.name} className="py-4">
                      <dt className="text-sm font-semibold text-accent">{f.name}</dt>
                      <dd className="mt-0.5 font-medium">{f.text}</dd>
                    </div>
                  ))}
                </dl>
              </Bezel>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 말씀: 사진 전체 배경 */}
      <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden text-white">
        <Photo name="about" />
        <div className="absolute inset-0 bg-[#06201b]/65" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <Reveal as="p" className="display text-[2rem] sm:text-5xl md:text-6xl">{m.verse.bandTitle}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 text-lg text-white/90">{m.verse.bandCaption}</Reveal>
        </div>
      </section>

      {/* 6. 순환 기금 */}
      <Section title={h.fund.title} tone="deep">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
          <div>
            <p className="max-w-xl text-lg leading-[1.9] text-soft">{h.fund.body}</p>
            <div className="mt-8"><TextLink href={h.fund.cta.href}>{h.fund.cta.label}</TextLink></div>
          </div>
          <Rows items={m.fund.terms.slice(1, 4)} />
        </div>
      </Section>

      {/* 7. 사업가 / 선교사: 이중 테두리 패널 */}
      <section className="bg-paper py-24 md:py-36">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          {([{ k: "mentor" as const, ph: "mentorPanel" as const }, { k: "partner" as const, ph: "partnerPanel" as const }]).map(({ k, ph }, i) => (
            <Reveal key={k} delay={(i + 1) as 1 | 2 | 3}>
              <Bezel className="h-full" innerClassName="flex h-full flex-col p-5 md:p-7">
                <PhotoFrame name={ph} ratio="aspect-[16/10]" />
                <div className="flex flex-1 flex-col px-1.5 pb-2 pt-8 md:px-2">
                  <h2 className="display text-[1.5rem] md:text-[1.75rem]">{h[k].title}</h2>
                  <p className="mt-4 text-soft">{h[k].body}</p>
                  <div className="mt-8 pt-2 md:mt-auto"><Button href={h[k].cta.href}>{h[k].cta.label}</Button></div>
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. 신뢰 */}
      <Section title={h.trust.title} tone="deep">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-20">
          <Rows items={h.trust.items} />
          <div className="space-y-5">
            {photos.base && <PhotoFrame name="base" alt={m.alts.base} />}
            <div className="rounded-[1.25rem] border border-dashed border-ink/25 p-6">
              <p className="font-bold">{h.trust.board}</p>
              <p className="mt-1 text-sm text-soft">{h.trust.boardPlaceholder}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 9. 자주 묻는 질문 */}
      <section className="bg-paper py-24 md:py-36">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <Reveal as="h2" className="display text-[1.75rem] sm:text-4xl md:sticky md:top-32 md:self-start">{h.faq.title}</Reveal>
          <div className="divide-y divide-line border-y border-line">
            {h.faq.items.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-lg font-bold tracking-tight">
                  {f.q}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/[0.04] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-tint">
                    <Plus size={18} className="plus text-accent transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" aria-hidden />
                  </span>
                </summary>
                <p className="pb-7 pr-12 text-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. 마지막 */}
      <FinalCta title={h.final.title} body={h.final.body} buttons={h.final.buttons} />
    </>
  );
}
