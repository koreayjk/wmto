import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/lib/brand";
import { cbcCopy, isCbcLocale } from "@/lib/cbc-copy";

const IMG = "/images/cbc";
// eslint-disable-next-line @next/next/no-img-element
const Photo = ({ name, alt }: { name: string; alt: string }) => <img src={`${IMG}/${name}.jpg`} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />;

const GILT = "text-[#7A5F1E]"; // 흰 바탕용 금색(대비 4.5:1 이상)
const EYEBROW = "text-[13px] font-semibold tracking-[0.08em]";
const H2 = "display text-[1.8rem] leading-tight md:text-[2.3rem]";
const SECTION = "mx-auto max-w-6xl px-6 py-16 md:py-24";


export default async function CbcHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isCbcLocale(locale)) notFound();
  const c = cbcCopy[locale];
  const en = locale === "en";
  const join = en ? "/en/join" : "/join";
  const contact = en ? "/en/join?type=contact" : "/join?type=contact";
  const privacy = en ? "/wmto/en/privacy" : "/wmto/privacy";
  const mission = en ? "/wmto/en" : "/wmto";
  const btn = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition active:scale-[0.98]";
  const navLink = "min-h-[44px] items-center rounded-full px-3 text-ink/80 hover:text-ink";
  const menu = [["#about", c.menu.about], ["#synergy", c.synergy.eyebrow], ["#how", c.menu.how], ["#visit", c.menu.join], ["#faq", c.menu.faq]] as const;

  return (
    <div className="break-keep">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-2">
          <Link href={en ? "/en" : "/"} aria-label={BRAND} className="flex min-h-[44px] items-center">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/cbc-mark.svg" alt={BRAND} width={52} height={32} className="h-8 w-auto" /></Link>
          <nav aria-label="Primary" className="hidden items-center text-sm lg:flex">
            {menu.map(([h, l]) => <a key={h} href={h} className={`${navLink} inline-flex`}>{l}</a>)}
          </nav>
          <div className="flex items-center gap-1 text-sm sm:gap-2">
            <Link href={mission} className={`${navLink} hidden md:inline-flex`} style={{ whiteSpace: "nowrap" }}>{c.nav.mission}</Link>
            <Link href={en ? "/" : "/en"} hrefLang={en ? "ko" : "en"} className={`${navLink} inline-flex`} style={{ whiteSpace: "nowrap" }}>{c.nav.other}</Link>
            <Link href="/connect/login" className={`${navLink} hidden sm:inline-flex`} style={{ whiteSpace: "nowrap" }}>{c.nav.login}</Link>
            <Link href={join} className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-5 font-semibold text-white hover:bg-[var(--accent-hover)]" style={{ whiteSpace: "nowrap" }}>{c.hero.join}</Link>
            <details className="relative lg:hidden">
              <summary aria-label="Menu" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-black/[0.05] [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="block h-0.5 w-5 bg-ink shadow-[0_-6px_0_currentColor,0_6px_0_currentColor]" />
              </summary>
              <div className="absolute right-0 top-12 w-60 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/10">
                {menu.map(([h, l]) => <a key={h} href={h} className="flex min-h-[44px] items-center rounded-xl px-4 hover:bg-tint">{l}</a>)}
                <Link href={mission} className="flex min-h-[44px] items-center rounded-xl px-4 hover:bg-tint">{c.nav.mission}</Link>
                <Link href="/connect/login" className="flex min-h-[44px] items-center rounded-xl px-4 hover:bg-tint">{c.nav.login}</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="main" className="pb-20 lg:pb-0">
        {/* 1. 첫 화면 */}
        <section className="bg-[#071D3D] text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className={`${EYEBROW} text-[#E0B85A]`}>{c.hero.eyebrow}</p>
              <h1 className="display mt-5 max-w-3xl whitespace-pre-line text-[2.3rem] leading-[1.15] sm:text-[3rem] lg:text-[3.4rem]">{c.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-white/85 md:text-xl">{c.hero.sub}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={join} className={`${btn} bg-[#E0B85A] text-[#071D3D] hover:bg-[#ebc872]`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
                <Link href="/connect/login" className={`${btn} text-white ring-1 ring-inset ring-white/30 hover:bg-white/10`}>{c.hero.login}</Link>
              </div>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/70">
                {c.gloss.items.slice(0, 3).map((g, i) => <span key={g.term}>{i > 0 && " · "}<b className="font-semibold text-white/90">{g.term}</b> {g.text}</span>)}
              </p>
            </div>
            <figure>
              <div className="aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"><Photo name="hero" alt={c.photos.hero} /></div>
              <figcaption className="mt-2 text-xs text-white/60">{c.photoNote}</figcaption>
            </figure>
          </div>
        </section>

        {/* 2. CBC 소개 */}
        <section id="about" className={`${SECTION} scroll-mt-20`}>
          <p className={`${EYEBROW} ${GILT}`}>{c.concept.eyebrow}</p>
          <h2 className={`${H2} mt-3 max-w-3xl`}>{c.concept.title}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/80">{c.concept.lead}</p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {c.concept.pillars.map((p) => (
              <li key={p.word} className="rounded-2xl bg-tint p-7">
                <span className={`${EYEBROW} ${GILT} uppercase`}>{p.word}</span>
                <h3 className="mt-2 font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-soft">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. 왜 CBC + 사진 */}
        <section className="bg-tint">
          <div className={`${SECTION} grid items-center gap-10 lg:grid-cols-2`}>
            <figure>
              <div className="aspect-[3/2] overflow-hidden rounded-3xl"><Photo name="workplace" alt={c.photos.workplace} /></div>
            </figure>
            <div>
              <h2 className={H2}>{c.why.title}</h2>
              <ul className="mt-7 space-y-6">
                {c.why.items.map((it) => (
                  <li key={it.title}><h3 className="font-display text-xl font-semibold">{it.title}</h3><p className="mt-1.5 leading-relaxed text-soft">{it.text}</p></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. 텐트 구조(그림) */}
        <section className={`${SECTION} grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]`}>
          <div>
            <p className={`${EYEBROW} ${GILT}`}>{c.rhythm.eyebrow}</p>
            <h2 className={`${H2} mt-3`}>{c.rhythm.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">{c.rhythm.text}</p>
            <ul className="mt-6 space-y-3">
              {c.rhythm.items.map((t) => <li key={t} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
          <figure className="rounded-3xl bg-[#071D3D] p-6 text-white md:p-8">
            <p className="font-display text-lg font-semibold">{c.slots.tent}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {c.slots.filled.map((t) => <li key={t} className="rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-[#071D3D]">{t}</li>)}
              <li className="rounded-full bg-[#E0B85A] px-3.5 py-1.5 text-sm font-bold text-[#071D3D] ring-2 ring-white">★ {c.slots.you}</li>
              {c.slots.open.map((t) => <li key={t} className="rounded-full border border-dashed border-white/45 px-3.5 py-1.5 text-sm text-white/65">{t}</li>)}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/80">
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white/90" />{c.slots.filledLabel}</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#E0B85A]" />{c.slots.youLabel}</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-dashed border-white/55" />{c.slots.openLabel}</li>
            </ul>
            <figcaption className="mt-3 text-xs text-white/60">{c.slots.note}</figcaption>
          </figure>
        </section>

        {/* 4-1. 시너지 사례 */}
        <section id="synergy" className="scroll-mt-20 bg-[#071D3D] text-white">
          <div className={SECTION}>
            <p className={`${EYEBROW} text-[#E0B85A]`}>{c.synergy.eyebrow}</p>
            <h2 className={`${H2} mt-3 max-w-3xl`}>{c.synergy.title}</h2>
            <p className="mt-4 text-white/70">{c.synergy.sub}</p>

            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {c.synergy.roles.map((r) => (
                <li key={r.tag} className="flex items-center gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0B85A] font-display text-lg font-bold text-[#071D3D]">{r.tag}</span>
                  <span><b className="block font-display text-lg">{r.name}</b><span className="text-sm text-white/65">{r.note}</span></span>
                </li>
              ))}
            </ul>

            <ol className="mt-10 space-y-4">
              {c.synergy.steps.map((st, i) => (
                <li key={st.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-[#071D3D]">{st.who}</span>
                    {i < c.synergy.steps.length - 1 && <span aria-hidden className="mt-1 w-px flex-1 bg-white/25" />}
                  </div>
                  <div className="flex-1 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                    <h3 className="font-display text-lg font-semibold"><span className="text-[#E0B85A]">{i + 1}.</span> {st.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-white/80">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h3 className="mt-14 font-display text-xl font-semibold">{c.synergy.gainsTitle}</h3>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {c.synergy.gains.map((g) => (
                <li key={g.who} className="rounded-2xl bg-[#E0B85A] p-6 text-[#071D3D]">
                  <b className="font-display text-lg">{g.who}</b>
                  <p className="mt-2 leading-relaxed">{g.text}</p>
                </li>
              ))}
            </ul>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h3 className="font-display text-xl font-semibold">{c.synergy.whyTitle}</h3>
                <ul className="mt-5 space-y-5">
                  {c.synergy.why.map((w) => (
                    <li key={w.title} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E0B85A]" /><span><b className="font-display text-lg">{w.title}</b><span className="mt-0.5 block text-white/75">{w.text}</span></span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white/[0.07] p-7 text-center ring-1 ring-white/15">
                <span className="font-display text-6xl font-semibold text-[#E0B85A]">{c.synergy.math.value}</span><span className="ml-1 text-xl">{c.synergy.math.unit}</span>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{c.synergy.math.text}</p>
              </div>
            </div>
            <p className="mt-8 text-sm text-white/60">{c.synergy.note}</p>
          </div>
        </section>

        {/* 5. 운영 방식(체계) */}
        <section id="how" className="scroll-mt-20 bg-tint">
          <div className={SECTION}>
            <p className={`${EYEBROW} ${GILT}`}>{c.system.eyebrow}</p>
            <h2 className={`${H2} mt-3`}>{c.system.title}</h2>
            <p className="mt-4 max-w-3xl text-lg text-ink/75">{c.system.sub}</p>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {c.system.items.map((it) => (
                <li key={it.title} className="rounded-2xl bg-white p-7 ring-1 ring-black/5">
                  <h3 className="font-display text-xl font-semibold">{it.title}</h3>
                  <p className="mt-2 leading-relaxed text-soft">{it.text}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-black/10 pt-4 text-sm">
                    {it.points.map((p) => <li key={p} className="flex gap-2.5"><span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8923A]" />{p}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <figure className="aspect-[3/2] overflow-hidden rounded-2xl"><Photo name="one-to-one" alt={c.photos.oneToOne} /></figure>
              <figure className="aspect-[3/2] overflow-hidden rounded-2xl"><Photo name="referral" alt={c.photos.referral} /></figure>
            </div>
          </div>
        </section>

        {/* 6. 성장 단계 + 모임 흐름 */}
        <section className={SECTION}>
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className={H2}>{c.levels.title}</h2>
              <p className="mt-3 text-soft">{c.levels.sub}</p>
              <ol className="mt-8 space-y-3">
                {c.levels.items.map((lv, i) => (
                  <li key={lv.name} className="rounded-2xl bg-tint p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071D3D] font-display text-sm font-semibold text-[#E0B85A]">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold">{lv.name}</h3>
                        <p className="text-sm text-soft">{lv.text}</p>
                        <div aria-hidden className="mt-2 h-1.5 rounded-full bg-black/10"><div className="h-full rounded-full bg-[#B8923A]" style={{ width: `${(i + 1) * 25}%` }} /></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className={H2}>{c.agenda.title}</h2>
              <p className="mt-3 text-soft">{c.agenda.sub}</p>
              <ol className="mt-8 border-l-2 border-[#B8923A]/40 pl-6">
                {c.agenda.items.map((a) => (
                  <li key={a.title} className="relative pb-6 last:pb-0">
                    <span aria-hidden className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#B8923A]" />
                    <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                    <p className="text-sm leading-relaxed text-soft">{a.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 7. 첫 방문 → 첫 90일(통합 타임라인) */}
        <section id="visit" className="scroll-mt-20 bg-tint">
          <div className={SECTION}>
            <h2 className={H2}>{c.path.title}</h2>
            <p className="mt-3 text-soft">{c.path.sub}</p>
            <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {c.path.steps.map((st, i) => (
                <li key={st.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{st.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-soft">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10"><Link href={join} className={`${btn} bg-accent text-white hover:bg-[var(--accent-hover)]`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link></div>
          </div>
        </section>

        {/* 8. 지키는 것 + 용어 */}
        <section className={`${SECTION} grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]`}>
          <figure><div className="aspect-[3/2] overflow-hidden rounded-3xl"><Photo name="prayer" alt={c.photos.prayer} /></div></figure>
          <div>
            <h2 className={H2}>{c.trust.title}</h2>
            <ul className="mt-7 space-y-4">
              {c.trust.items.map((t) => <li key={t} className="flex gap-3 text-lg leading-relaxed"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
        </section>

        {/* 9. 선교(WMTO) */}
        <section className="border-y border-black/[0.06] bg-tint">
          <div className={`${SECTION} max-w-4xl`}>
            <p className={`${EYEBROW} ${GILT}`}>{c.mission.eyebrow}</p>
            <h2 className={`${H2} mt-3`}>{c.mission.title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/80">{c.mission.text}</p>
            <Link href={mission} className={`${btn} mt-7 bg-white text-ink ring-1 ring-inset ring-ink/20 hover:bg-white/70`}>{c.mission.cta}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
            <p className="mt-4 text-sm text-soft">{c.mission.note}</p>
          </div>
        </section>

        {/* 10. 자주 묻는 질문 + 용어 */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-16 md:py-24">
          <h2 className={H2}>{c.faq.title}</h2>
          <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {c.faq.items.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-2xl font-light text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-1 pb-2 leading-relaxed text-soft">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-5 text-sm text-soft">{c.faq.more}</p>
          <dl className="mt-10 grid gap-x-8 gap-y-2 rounded-2xl bg-tint p-6 text-sm sm:grid-cols-2">
            <dt className="sr-only">{c.gloss.title}</dt>
            {c.gloss.items.map((g) => <dd key={g.term}><b>{g.term}</b> — {g.text}</dd>)}
          </dl>
        </section>

        {/* 11. 마무리 */}
        <section className="bg-[#071D3D] text-white">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
            <h2 className="display text-[1.8rem] md:text-[2.3rem]">{c.final.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">{c.final.text}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={join} className={`${btn} bg-[#E0B85A] text-[#071D3D] hover:bg-[#ebc872]`}>{c.final.join}</Link>
              <Link href={contact} className={`${btn} text-white ring-1 ring-inset ring-white/40 hover:bg-white/10`}>{c.final.contact}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-soft">
          <span>{c.footer.note}</span>
          <span className="flex gap-5"><Link href={privacy} className="inline-flex min-h-[44px] items-center hover:text-ink">{c.footer.privacy}</Link><Link href={contact} className="inline-flex min-h-[44px] items-center hover:text-ink">{c.footer.contact}</Link></span>
        </div>
      </footer>

      {/* 모바일 하단 고정 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 p-3 backdrop-blur lg:hidden">
        <Link href={join} className={`${btn} w-full bg-accent text-white`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
      </div>
    </div>
  );
}
