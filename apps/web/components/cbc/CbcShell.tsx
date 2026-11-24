import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cbcCopy, type CbcLocale } from "@/lib/cbc-copy";

/** CBC 하위 페이지(문의, 개인정보 등)의 공통 머리글·바닥글 */
export function CbcShell({ locale, switchHref, children }: { locale: CbcLocale; switchHref: string; children: React.ReactNode }) {
  const en = locale === "en";
  const c = cbcCopy[locale];
  const link = "inline-flex min-h-[44px] items-center rounded-full px-3 text-ink/80 hover:text-ink";
  return (
    <div className="break-keep">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-2">
          <Link href={en ? "/en" : "/"} aria-label={BRAND} className="flex min-h-[44px] items-center">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/cbc-mark.svg" alt={BRAND} width={52} height={32} className="h-8 w-auto" /></Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href={switchHref} hrefLang={en ? "ko" : "en"} className={link}>{c.nav.other}</Link>
            <Link href="/connect/login" className={link}>{c.nav.login}</Link>
          </nav>
        </div>
      </header>
      <main id="main" className="bg-paper pb-24 pt-14 md:pt-20">{children}</main>
      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-soft">
          <span>{c.footer.note}</span>
          <span className="flex gap-5">
            <Link href={en ? "/en/privacy" : "/privacy"} className="inline-flex min-h-[44px] items-center hover:text-ink">{c.footer.privacy}</Link>
            <Link href={en ? "/en/join?type=contact" : "/join?type=contact"} className="inline-flex min-h-[44px] items-center hover:text-ink">{c.footer.contact}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
