import { getMessages } from "@/lib/i18n";
import { Button, FinalCta, Rows, Section, Split, Steps, TextLink } from "@/components/ui";
import { Bezel } from "@/components/Bezel";
import { Photo, PhotoFrame } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  const m = getMessages();
  const h = m.home;
  const [primary, ...others] = h.hero.buttons;
  return (
    <>
      {/* 1. 첫 화면: 전체 사진 배경 + 글. 위쪽은 떠 있는 유리 메뉴가 사진 위에 놓인다 */}
      <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden text-white md:items-center">
        <Photo name="hero" alt="필리핀 교회에서 사람들이 손을 들고 함께 예배하는 모습" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06201b]/90 via-[#06201b]/55 to-[#06201b]/30 md:bg-gradient-to-r md:from-[#06201b]/90 md:via-[#06201b]/65 md:to-[#06201b]/10" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-32 md:py-32">
          <h1 className="display rise max-w-3xl text-[2.1rem] sm:text-[2.75rem] lg:text-[3.6rem]">{h.hero.title}</h1>
          <p className="rise rise-1 mt-6 max-w-xl text-lg text-white/90 md:text-xl">{h.hero.sub}</p>
          <div className="rise rise-2 mt-10 flex flex-wrap gap-3">
            <Button href={primary.href} variant="onAccent">{primary.label}</Button>
            {others.map((b) => <Button key={b.href} href={b.href} variant="onAccentGhost">{b.label}</Button>)}
          </div>
        </div>
      </section>

      {/* 2. 문제: 한 문장에 집중 */}
      <section className="bg-tint py-28 md:py-44">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal as="h2" className="display text-[1.9rem] sm:text-5xl md:text-[3.25rem]">{h.problem.title}</Reveal>
          <Reveal as="p" delay={1} className="mt-8 max-w-2xl text-lg leading-[1.95] text-soft md:text-xl">{h.problem.body}</Reveal>
        </div>
      </section>

      {/* 3. 세 사람: 크기가 다른 세 면(비대칭 벤토) */}
      <Section title={h.solution.title}>
        <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2">
          {h.solution.items.map((it, i) => {
            const cfg = [
              { span: "md:col-span-3 md:row-span-2", inner: "bg-accent text-white", label: "text-white/85", text: "text-lg text-white/90", name: "text-3xl md:text-4xl" },
              { span: "md:col-span-2", inner: "bg-tint text-ink", label: "text-accent", text: "text-soft", name: "text-2xl" },
              { span: "md:col-span-2", inner: "bg-white text-ink", label: "text-accent", text: "text-soft", name: "text-2xl" },
            ][i];
            return (
              <Reveal key={it.name} delay={(i + 1) as 1 | 2 | 3} className={cfg.span}>
                <Bezel className="h-full" inner={cfg.inner} innerClassName="flex min-h-52 flex-col justify-end p-7 md:p-10">
                  <p className={`text-sm font-semibold ${cfg.label}`}>{it.en}</p>
                  <h3 className={`mt-1 font-bold tracking-tight ${cfg.name}`}>{it.name}</h3>
                  <p className={`mt-3 ${cfg.text}`}>{it.text}</p>
                </Bezel>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* 4. 사례와 흐름 */}
      <Split photo="how" title={h.how.title} body={h.how.body} tone="deep">
        <p className="text-sm text-soft">* {h.how.note}</p>
      </Split>
      <section className="bg-deep pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl px-6"><Steps items={h.how.flow} /></div>
      </section>

      {/* 5. 캠프: 핵심 사실을 옆에 */}
      <Section title={h.camp.title}>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <p className="max-w-xl text-lg leading-[1.9] text-soft">{h.camp.body}</p>
            <div className="mt-8"><TextLink href={h.camp.cta.href}>{h.camp.cta.label}</TextLink></div>
          </div>
          <Reveal delay={1}>
            <Bezel>
              <dl className="divide-y divide-line px-7 md:px-9">
                {m.camp.overview.items.slice(0, 3).map((f) => (
                  <div key={f.name} className="py-6">
                    <dt className="text-sm font-semibold text-accent">{f.name}</dt>
                    <dd className="mt-0.5 font-medium">{f.text}</dd>
                  </div>
                ))}
              </dl>
            </Bezel>
          </Reveal>
        </div>
      </Section>

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
          {([{ k: "mentor" as const }, { k: "partner" as const }]).map(({ k }, i) => (
            <Reveal key={k} delay={(i + 1) as 1 | 2 | 3}>
              <Bezel className="h-full" innerClassName="flex h-full flex-col p-5 md:p-7">
                <PhotoFrame name={k} ratio="aspect-[16/10]" />
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
            <PhotoFrame name="base" />
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
      <FinalCta title={h.final.title} body={h.final.body} buttons={h.final.buttons} verse={`"${m.verse.en}" - ${m.verse.refEn}`} />
    </>
  );
}
