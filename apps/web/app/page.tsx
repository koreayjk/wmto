import { getMessages } from "@/lib/i18n";
import { Button, FinalCta, Rows, Section, Split, Steps, TextLink } from "@/components/ui";
import { PhotoFrame } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  const m = getMessages();
  const h = m.home;
  const [primary, ...others] = h.hero.buttons;
  return (
    <>
      {/* 1. 첫 화면: 한 장면에 메시지와 행동이 모두 보이도록 */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 md:min-h-[calc(100dvh-4rem)] md:grid-cols-[1.25fr_0.75fr] md:gap-14 md:py-12">
        <div>
          <h1 className="display rise text-[2rem] sm:text-[2.6rem] lg:text-[3.1rem]">{h.hero.title}</h1>
          <p className="rise rise-1 mt-6 max-w-xl text-lg text-soft md:text-xl">{h.hero.sub}</p>
          <div className="rise rise-2 mt-9 flex flex-wrap gap-3">
            <Button href={primary.href}>{primary.label}</Button>
            {others.map((b) => <Button key={b.href} href={b.href} variant="ghost">{b.label}</Button>)}
          </div>
        </div>
        <PhotoFrame name="hero" ratio="aspect-[4/3] md:aspect-[4/5]" className="rise rise-2 md:max-h-[34rem] md:w-full" />
      </section>

      {/* 2. 문제: 한 문장에 집중 */}
      <section className="bg-tint py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] text-ink sm:text-5xl md:text-[3.25rem]">{h.problem.title}</Reveal>
          <p className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{h.problem.body}</p>
        </div>
      </section>

      {/* 3. 세 사람: 크기가 다른 세 면 */}
      <Section title={h.solution.title}>
        <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2">
          {h.solution.items.map((it, i) => {
            const style = [
              "md:col-span-3 md:row-span-2 bg-accent text-white",
              "md:col-span-2 bg-tint text-ink",
              "md:col-span-2 border border-line bg-white text-ink",
            ][i];
            return (
              <div key={it.name} className={`flex min-h-48 flex-col justify-end rounded-2xl p-7 md:p-9 ${style}`}>
                <p className={`text-sm font-semibold ${i === 0 ? "text-soft" : "text-accent"}`}>{it.en}</p>
                <h3 className={`mt-1 font-bold tracking-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-2xl"}`}>{it.name}</h3>
                <p className={`mt-3 ${i === 0 ? "text-lg text-white/90" : "text-soft"}`}>{it.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 4. 사례와 흐름 */}
      <Split photo="how" title={h.how.title} body={h.how.body} tone="deep">
        <p className="text-sm text-soft">* {h.how.note}</p>
      </Split>
      <section className="bg-deep pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-6"><Steps items={h.how.flow} /></div>
      </section>

      {/* 5. 캠프: 핵심 사실을 옆에 */}
      <Section title={h.camp.title}>
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <p className="max-w-xl text-lg leading-[1.9] text-soft">{h.camp.body}</p>
            <div className="mt-8"><TextLink href={h.camp.cta.href}>{h.camp.cta.label}</TextLink></div>
          </div>
          <dl className="divide-y divide-line self-start rounded-2xl border border-line bg-white px-7">
            {m.camp.overview.items.slice(0, 3).map((f) => (
              <div key={f.name} className="py-5">
                <dt className="text-sm font-semibold text-accent">{f.name}</dt>
                <dd className="mt-0.5 font-medium">{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 6. 순환 기금 */}
      <Section title={h.fund.title} tone="deep">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <p className="max-w-xl text-lg leading-[1.9] text-soft">{h.fund.body}</p>
            <div className="mt-8"><TextLink href={h.fund.cta.href}>{h.fund.cta.label}</TextLink></div>
          </div>
          <Rows items={m.fund.terms.slice(1, 4)} />
        </div>
      </Section>

      {/* 7. 사업가 / 선교사 */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          {[{ k: "mentor" as const, tone: "bg-deep" }, { k: "partner" as const, tone: "bg-tint" }].map(({ k, tone }) => (
            <article key={k} className={`flex flex-col rounded-2xl p-6 md:p-8 ${tone}`}>
              <PhotoFrame name={k} ratio="aspect-[16/10]" />
              <h2 className="display mt-8 text-[1.5rem] md:text-[1.75rem]">{h[k].title}</h2>
              <p className="mt-4 text-soft">{h[k].body}</p>
              <div className="mt-8 pt-2 md:mt-auto"><Button href={h[k].cta.href}>{h[k].cta.label}</Button></div>
            </article>
          ))}
        </div>
      </section>

      {/* 8. 신뢰 */}
      <Section title={h.trust.title} tone="deep">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <Rows items={h.trust.items} />
          <div className="space-y-5">
            <PhotoFrame name="base" />
            <div className="rounded-2xl border border-dashed border-ink/25 p-6">
              <p className="font-bold">{h.trust.board}</p>
              <p className="mt-1 text-sm text-soft">{h.trust.boardPlaceholder}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 9. 자주 묻는 질문 */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <Reveal as="h2" className="display text-[1.75rem] sm:text-4xl md:sticky md:top-28 md:self-start">{h.faq.title}</Reveal>
          <div className="divide-y divide-line border-y border-line">
            {h.faq.items.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-lg font-bold tracking-tight">
                  {f.q}
                  <Plus size={22} className="plus shrink-0 text-accent transition-transform duration-200" aria-hidden />
                </summary>
                <p className="pb-7 pr-10 text-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. 마지막 */}
      <FinalCta title={h.final.title} body={h.final.body} buttons={h.final.buttons} verse={`"${m.verse.en}" - ${m.verse.refEn}`} />
    </>
  );
}
