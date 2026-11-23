import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/lib/brand";
import { cbcCopy, isCbcLocale } from "@/lib/cbc-copy";

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
          <Link href={en ? "/en" : "/"} className="display text-xl font-semibold tracking-tight">{BRAND}</Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href={mission} className="hidden rounded-full px-3 py-2 text-soft hover:text-ink sm:inline" style={{ whiteSpace: "nowrap" }}>{c.nav.mission}</Link>
            <Link href={en ? "/" : "/en"} hrefLang={en ? "ko" : "en"} className="rounded-full px-3 py-2 text-soft hover:text-ink" style={{ whiteSpace: "nowrap" }}>{c.nav.other}</Link>
            <Link href="/connect/login" className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]" style={{ whiteSpace: "nowrap" }}>{c.nav.login}</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="bg-tint">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
            <p className="gilt text-[12px] font-medium uppercase tracking-[0.3em]">{c.hero.eyebrow}</p>
            <h1 className="display mt-5 max-w-3xl whitespace-pre-line text-[2.3rem] leading-[1.15] sm:text-[3rem] lg:text-[3.6rem]">{c.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/80 md:text-xl">{c.hero.sub}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={join} className={`${btn} bg-accent text-white hover:bg-[var(--accent-hover)]`}>{c.hero.join}<ArrowRight size={18} weight="bold" aria-hidden /></Link>
              <Link href="/connect/login" className={`${btn} text-ink ring-1 ring-inset ring-ink/15 hover:bg-black/[0.04]`}>{c.hero.login}</Link>
            </div>
          </div>
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
        </section>

        <section className="bg-tint">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
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
