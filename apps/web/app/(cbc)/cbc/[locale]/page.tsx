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
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href={mission} className="hidden rounded-full px-3 py-2 text-soft hover:text-ink sm:inline" style={{ whiteSpace: "nowrap" }}>{c.nav.mission}</Link>
            <Link href={en ? "/" : "/en"} hrefLang={en ? "ko" : "en"} className="rounded-full px-3 py-2 text-soft hover:text-ink" style={{ whiteSpace: "nowrap" }}>{c.nav.other}</Link>
            <Link href="/connect/login" className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]" style={{ whiteSpace: "nowrap" }}>{c.nav.login}</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="bg-tint">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.hero.eyebrow}</p>
              <h1 className="display mt-5 max-w-3xl whitespace-pre-line text-[2.3rem] leading-[1.15] sm:text-[3rem] lg:text-[3.4rem]">{c.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-ink/80 md:text-xl">{c.hero.sub}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={join} className={`${btn} bg-accent text-white hover:bg-[var(--accent-hover)]`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
                <Link href="/connect/login" className={`${btn} text-ink ring-1 ring-inset ring-ink/15 hover:bg-black/[0.04]`}>{c.hero.login}</Link>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(7,29,61,0.45)]"><Photo name="hero" alt={c.photos.hero} /></div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
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

        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
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

        <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
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
