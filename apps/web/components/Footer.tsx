"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMessages, localeFromPathname, localizeHref, switchLocaleHref } from "@/lib/i18n";

export function Footer() {
  const path = usePathname();
  const locale = localeFromPathname(path);
  const other = locale === "ko" ? "en" : "ko";
  const m = getMessages(locale);
  if (path.startsWith("/admin") || path.startsWith("/connect") || path.startsWith("/auth")) return null;
  const href = (h: string) => localizeHref(locale, h);
  return (
    <footer className="border-t border-line bg-deep text-soft">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-ink">WMTO</p>
            <p className="mt-2 text-sm">{m.site.name}</p>
            <p className="text-sm">{m.site.footerLine}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-10 text-sm">
            {m.nav.items.map((i) => (
              <li key={i.href}><Link href={href(i.href)} className="inline-block py-2 hover:text-accent">{i.label}</Link></li>
            ))}
            <li><Link href={href("/fund")} className="inline-block py-2 hover:text-accent">{m.footer.fund}</Link></li>
            <li><Link href={href("/apply?type=contact")} className="inline-block py-2 hover:text-accent">{m.footer.contact}</Link></li>
            <li><Link href={href("/privacy")} className="inline-block py-2 hover:text-accent">{m.site.privacy}</Link></li>
            <li>
              <Link href={switchLocaleHref(path, "", other)} hrefLang={other} lang={other} aria-label={m.nav.switchLabel} className="inline-block py-2 font-medium text-ink hover:text-accent">
                {m.nav.switchTo}
              </Link>
            </li>
          </ul>
        </div>
        <p className="mt-12 border-t border-line pt-6 text-sm">{m.verse.footer}</p>
      </div>
    </footer>
  );
}
