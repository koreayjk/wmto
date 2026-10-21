import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { Button, ButtonRow, Eyebrow, FinalCta, Rows, Scene, Section, Steps } from "@/components/ui";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  const h = getMessages().home;
  return (
    <>
      {/* ① Hero */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden text-white">
        <Photo name="hero" drift overlay="bg-gradient-to-t from-night/90 via-night/45 to-night/25" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-40 md:pb-24">
          <Eyebrow light>{h.hero.eyebrow}</Eyebrow>
          <Reveal as="h1" className="display max-w-5xl text-[2.5rem] sm:text-6xl md:text-[5.2rem]">
            {h.hero.title}
          </Reveal>
          <Reveal as="p" delay={1} className="mt-7 max-w-2xl text-lg text-white/85 md:text-xl">
            {h.hero.sub}
          </Reveal>
          <Reveal delay={2} className="mt-10 flex flex-wrap gap-3">
            {h.hero.buttons.map((b, i) => (
              <Button key={b.href} href={b.href} variant={i === 0 ? "solid" : "light"}>
                {b.label}
              </Button>
            ))}
          </Reveal>
          <Reveal delay={3} as="p" className="mt-12 font-serif text-sm italic text-gold">
            {h.hero.verse}
          </Reveal>
        </div>
      </section>

      {/* ② 문제 */}
      <Section tone="night" narrow>
        <Reveal as="h2" className="display text-3xl sm:text-5xl">{h.problem.title}</Reveal>
        <Reveal as="p" delay={1} className="mt-10 text-lg leading-[2] text-white/75 md:text-xl">
          {h.problem.body}
        </Reveal>
      </Section>

      {/* ③ 해법 */}
      <Section title={h.solution.title}>
        <Rows items={h.solution.items.map((i) => ({ name: `${i.name} (${i.en})`, text: i.text }))} />
      </Section>

      {/* ④ 이렇게 작동합니다 */}
      <Scene photo="how" title={h.how.title} body={h.how.body}>
        <p className="text-sm text-white/60">* {h.how.note}</p>
      </Scene>
      <Section tone="deep">
        <Steps items={h.how.flow} />
      </Section>

      {/* ⑤ 캠프 */}
      <Scene photo="camp" title={h.camp.title} body={h.camp.body}>
        <Button href={h.camp.cta.href} variant="light">{h.camp.cta.label}</Button>
      </Scene>

      {/* ⑥ 순환 기금 */}
      <Section title={h.fund.title} narrow>
        <Reveal as="p" delay={1} className="text-lg leading-[2] text-soft">{h.fund.body}</Reveal>
        <div className="mt-10"><Button href={h.fund.cta.href} variant="ghost">{h.fund.cta.label}</Button></div>
      </Section>

      {/* ⑦ 사업가 / ⑧ 선교사 */}
      <Scene photo="mentor" title={h.mentor.title} body={h.mentor.body}>
        <Button href={h.mentor.cta.href}>{h.mentor.cta.label}</Button>
      </Scene>
      <Scene photo="partner" title={h.partner.title} body={h.partner.body}>
        <Button href={h.partner.cta.href}>{h.partner.cta.label}</Button>
      </Scene>

      {/* ⑨ 신뢰 */}
      <Section title={h.trust.title} tone="deep">
        <Rows items={h.trust.items} />
        <div className="mt-16 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="relative min-h-64 overflow-hidden"><Photo name="base" overlay="bg-night/20" /></div>
          <div className="flex flex-col justify-center border border-dashed border-ink/25 p-10">
            <p className="font-serif text-xl font-semibold">{h.trust.board}</p>
            <p className="mt-2 text-soft">{h.trust.boardPlaceholder}</p>
          </div>
        </div>
      </Section>

      {/* ⑩ FAQ */}
      <Section title={h.faq.title} narrow>
        <div className="border-t border-line">
          {h.faq.items.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 font-serif text-lg font-semibold md:text-xl">
                {f.q}
                <span className="plus text-2xl font-light text-clay transition-transform">+</span>
              </summary>
              <p className="pb-7 pr-10 text-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ⑪ 마지막 CTA */}
      <FinalCta
        title={h.final.title}
        body={h.final.body}
        buttons={h.final.buttons}
        verse={`"${getMessages().verse.en}" — ${getMessages().verse.refEn}`}
      />
    </>
  );
}
