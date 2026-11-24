import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/lib/brand";
import { cbcCopy, isCbcLocale } from "@/lib/cbc-copy";

const IMG = "/images/cbc";
// eslint-disable-next-line @next/next/no-img-element
const Photo = ({ name, alt, className = "" }: { name: string; alt: string; className?: string }) => <img src={`${IMG}/${name}.jpg`} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;

export default async function CbcHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isCbcLocale(locale)) notFound();
  const c = cbcCopy[locale];
  const en = locale === "en";
  const join = en ? "/wmto/en/apply?type=mentor_join" : "/wmto/apply?type=mentor_join";
  const contact = en ? "/wmto/en/apply?type=contact" : "/wmto/apply?type=contact";
  const privacy = en ? "/wmto/en/privacy" : "/wmto/privacy";
  const mission = en ? "/wmto/en" : "/wmto";
  const btn = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition active:scale-[0.98]";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href={en ? "/en" : "/"} aria-label={BRAND} className="flex items-center">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/cbc-mark.svg" alt={BRAND} width={52} height={32} className="h-8 w-auto" /></Link>
          <nav className="hidden items-center gap-1 text-sm lg:flex">
            <a href="#about" className="rounded-full px-3 py-2 text-ink/80 hover:text-ink">{c.menu.about}</a>
            <a href="#how" className="rounded-full px-3 py-2 text-ink/80 hover:text-ink">{c.menu.how}</a>
            <a href="#visit" className="rounded-full px-3 py-2 text-ink/80 hover:text-ink">{c.menu.join}</a>
            <a href="#faq" className="rounded-full px-3 py-2 text-ink/80 hover:text-ink">{c.menu.faq}</a>
          </nav>
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href={mission} className="hidden rounded-full px-3 py-2 text-soft hover:text-ink sm:inline" style={{ whiteSpace: "nowrap" }}>{c.nav.mission}</Link>
            <Link href={en ? "/" : "/en"} hrefLang={en ? "ko" : "en"} className="rounded-full px-3 py-2 text-soft hover:text-ink" style={{ whiteSpace: "nowrap" }}>{c.nav.other}</Link>
            <Link href="/connect/login" className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]" style={{ whiteSpace: "nowrap" }}>{c.nav.login}</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="bg-[#071D3D] text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-[#E0B85A]">{c.hero.eyebrow}</p>
              <h1 className="display mt-5 max-w-3xl whitespace-pre-line text-[2.3rem] leading-[1.15] sm:text-[3rem] lg:text-[3.4rem]">{c.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">{c.hero.sub}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={join} className={`${btn} bg-[#E0B85A] text-[#071D3D] hover:bg-[#ebc872]`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
                <Link href="/connect/login" className={`${btn} text-white ring-1 ring-inset ring-white/30 hover:bg-white/10`}>{c.hero.login}</Link>
              </div>
            </div>
            <div>
              <div className="aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"><Photo name="hero" alt={c.photos.hero} /></div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/[0.06] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="font-display text-xl font-semibold">{c.start.title}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-stretch">
              {c.start.steps.map((st, i) => (
                <li key={st.title} className="flex gap-4 rounded-2xl bg-tint p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{i + 1}</span>
                  <span><b className="block font-display text-lg">{st.title}</b><span className="mt-1 block text-sm leading-relaxed text-soft">{st.text}</span></span>
                </li>
              ))}
              <li className="flex items-center"><Link href={join} className={`${btn} w-full bg-accent text-white hover:bg-[var(--accent-hover)]`}>{c.start.cta}<ArrowRight size={18} weight="bold" aria-hidden /></Link></li>
            </ol>
          </div>
        </section>

        <section className="bg-[#071D3D] text-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-center font-display text-lg text-white/80">{c.stats.title}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-y-8 text-center md:grid-cols-4">
              {c.stats.items.map((it) => (
                <li key={it.label}>
                  <span className="font-display text-5xl font-semibold text-[#E0B85A]">{it.value}</span><span className="ml-1 text-lg text-white/90">{it.unit}</span>
                  <span className="mt-2 block text-sm text-white/70">{it.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-xs text-white/50">{c.stats.note}</p>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.concept.eyebrow}</p>
          <h2 className="display mt-4 max-w-3xl text-[1.8rem] leading-tight md:text-[2.4rem]">{c.concept.title}</h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink/80">{c.concept.lead}</p>
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {c.concept.pillars.map((p) => (
              <li key={p.word} className="rounded-2xl bg-tint p-7">
                <span className="gilt text-[12px] font-medium uppercase tracking-[0.25em]">{p.word}</span>
                <h3 className="mt-3 font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-soft">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-tint">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:py-32 lg:grid-cols-2">
            <div className="aspect-[3/2] overflow-hidden rounded-3xl"><Photo name="workplace" alt={c.photos.workplace} /></div>
            <div>
              <h2 className="display text-[1.8rem] md:text-[2.2rem]">{c.why.title}</h2>
              <ul className="mt-8 space-y-6">
                {c.why.items.map((it) => (
                  <li key={it.title}><h3 className="font-display text-xl font-semibold">{it.title}</h3><p className="mt-1.5 leading-relaxed text-soft">{it.text}</p></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:py-32 lg:grid-cols-2">
          <div>
            <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.rhythm.eyebrow}</p>
            <h2 className="display mt-4 text-[1.8rem] leading-tight md:text-[2.2rem]">{c.rhythm.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">{c.rhythm.text}</p>
            <ul className="mt-6 space-y-3">
              {c.rhythm.items.map((t) => <li key={t} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
          <div className="aspect-[3/2] overflow-hidden rounded-3xl"><Photo name="gathering" alt={c.photos.gathering} /></div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <h2 className="display text-[1.8rem] md:text-[2.3rem]">{c.how.title}</h2>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {c.how.items.map((it, i) => (
              <li key={it.title} className="border-t border-black/10 pt-5">
                <span className="gilt text-[12px] font-medium tracking-[0.2em]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{it.title}</h3>
                <p className="mt-2 leading-relaxed text-soft">{it.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            <div className="aspect-[3/2] overflow-hidden rounded-2xl"><Photo name="one-to-one" alt={c.photos.oneToOne} /></div>
            <div className="aspect-[3/2] overflow-hidden rounded-2xl"><Photo name="referral" alt={c.photos.referral} /></div>
          </div>
        </section>

        <section id="visit" className="scroll-mt-20 bg-white">
          <div className="mx-auto max-w-6xl px-6 pt-8 pb-24 md:pb-32">
            <h2 className="display text-[1.8rem] md:text-[2.2rem]">{c.visit.title}</h2>
            <p className="mt-3 max-w-2xl text-soft">{c.visit.sub}</p>
            <ol className="mt-10 grid gap-5 md:grid-cols-4">
              {c.visit.steps.map((st, i) => (
                <li key={st.title} className="rounded-2xl border border-black/10 p-6">
                  <span className="font-display text-3xl font-semibold text-[#B8923A]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{st.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-tint">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.system.eyebrow}</p>
            <h2 className="display mt-4 text-[1.8rem] md:text-[2.3rem]">{c.system.title}</h2>
            <p className="mt-4 max-w-3xl text-lg text-ink/75">{c.system.sub}</p>
            <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className="display text-[1.8rem] md:text-[2.2rem]">{c.levels.title}</h2>
              <p className="mt-3 text-soft">{c.levels.sub}</p>
              <ol className="mt-8 space-y-3">
                {c.levels.items.map((lv, i) => (
                  <li key={lv.name} className="flex items-center gap-4 rounded-2xl bg-tint p-4" style={{ marginLeft: `${i * 14}px` }}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071D3D] font-display text-sm font-semibold text-[#E0B85A]">{i + 1}</span>
                    <span><b className="font-display text-lg">{lv.name}</b><span className="block text-sm text-soft">{lv.text}</span></span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="display text-[1.8rem] md:text-[2.2rem]">{c.agenda.title}</h2>
              <p className="mt-3 text-soft">{c.agenda.sub}</p>
              <ol className="mt-8 border-l-2 border-[#B8923A]/40 pl-6">
                {c.agenda.items.map((a) => (
                  <li key={a.title} className="relative pb-6 last:pb-0">
                    <span aria-hidden className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#B8923A]" />
                    <b className="font-display text-lg">{a.title}</b>
                    <p className="text-sm leading-relaxed text-soft">{a.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-tint">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <h2 className="display text-[1.8rem] md:text-[2.2rem]">{c.journey.title}</h2>
            <p className="mt-3 text-soft">{c.journey.sub}</p>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {c.journey.steps.map((st, i) => (
                <li key={st.title} className="border-t-2 border-accent pt-4">
                  <span className="gilt text-[12px] font-medium tracking-[0.2em]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{st.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:py-32 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="aspect-[3/2] overflow-hidden rounded-3xl"><Photo name="prayer" alt={c.photos.prayer} /></div>
          <div>
            <h2 className="display text-[1.6rem] md:text-[2rem]">{c.trust.title}</h2>
            <ul className="mt-8 space-y-4">
              {c.trust.items.map((t) => <li key={t} className="flex gap-3 text-lg leading-relaxed"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.mission.eyebrow}</p>
          <h2 className="display mt-4 text-[1.8rem] md:text-[2.3rem]">{c.mission.title}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/80">{c.mission.text}</p>
          <Link href={mission} className={`${btn} mt-8 text-ink ring-1 ring-inset ring-ink/20 hover:bg-black/[0.04]`}>{c.mission.cta}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
          <p className="mt-4 text-sm text-soft">{c.mission.note}</p>
        </section>

        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20 md:py-28">
          <h2 className="display text-[1.6rem] md:text-[2rem]">{c.faq.title}</h2>
          <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {c.faq.items.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
                <p className="mt-2 leading-relaxed text-soft">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-5 text-sm text-soft">{c.faq.more}</p>
        </section>

        <section className="bg-tint">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-xl font-semibold">{c.links.title}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[join, "/connect/login", mission, contact].map((href, i) => (
                <li key={href}>
                  <Link href={href} className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:ring-accent/40">
                    <b className="font-display text-lg">{c.links.items[i].title}</b>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-soft">{c.links.items[i].text}</span>
                    <ArrowRight size={18} weight="bold" aria-hidden className="mt-4 text-accent transition group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-accent text-white">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
            <h2 className="display text-[1.8rem] md:text-[2.3rem]">{c.final.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">{c.final.text}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={join} className={`${btn} bg-white text-accent hover:bg-tint`}>{c.final.join}</Link>
              <Link href={contact} className={`${btn} text-white ring-1 ring-inset ring-white/50 hover:bg-white/10`}>{c.final.contact}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-soft">
          <span>{c.footer.note}</span>
          <span className="flex gap-5"><Link href={privacy} className="hover:text-ink">{c.footer.privacy}</Link><Link href={contact} className="hover:text-ink">{c.footer.contact}</Link></span>
        </div>
      </footer>
    </>
  );
}
