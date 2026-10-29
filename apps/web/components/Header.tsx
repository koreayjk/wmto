"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { getMessages, localeFromPathname, localizeHref, switchLocaleHref, type Locale } from "@/lib/i18n";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** 떠 있는 유리 알약형 메뉴. 모바일에서는 전체 화면 메뉴로 펼쳐지고 링크가 순서대로 올라온다. */
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const locale: Locale = localeFromPathname(path);
  const other: Locale = locale === "ko" ? "en" : "ko";
  const m = getMessages(locale);
  const switchHref = switchLocaleHref(path, "", other);
  const home = localizeHref(locale, "/");

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  if (path.startsWith("/admin") || path.startsWith("/connect") || path.startsWith("/auth")) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-40 px-3 md:top-5 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between min-[1700px]:max-w-6xl rounded-full bg-white/90 py-2 pl-5 pr-2 shadow-[0_10px_30px_-14px_rgba(14,106,91,0.35)] ring-1 ring-black/[0.06] backdrop-blur-xl">
          <Link href={home} className="flex shrink-0 items-baseline gap-2.5 whitespace-nowrap" aria-label={m.site.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.svg" alt="" width={32} height={32} className="h-8 w-8 self-center" />
            <span className="text-xl font-extrabold tracking-tight">WMTO</span>
            <span className="hidden whitespace-nowrap text-[13px] text-soft min-[1700px]:inline">{m.site.tagline}</span>
          </Link>
          <nav className="hidden items-center gap-0.5 text-[15px] lg:flex" aria-label={m.nav.main}>
            {m.nav.items.map((i) => {
              const href = localizeHref(locale, i.href);
              const active = path === href;
              return (
                <Link
                  key={i.href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 transition-colors duration-300 hover:bg-black/[0.04] ${active ? "font-semibold text-accent" : "text-ink/80"}`}
                >
                  {i.label}
                </Link>
              );
            })}
            <Link
              href={switchHref}
              hrefLang={other}
              lang={other}
              aria-label={m.nav.switchLabel}
              className="ml-1 rounded-full px-3 py-2 text-sm font-medium text-soft ring-1 ring-inset ring-black/10 transition-colors duration-300 hover:bg-black/[0.04] hover:text-ink"
            >
              {m.nav.switchTo}
            </Link>
            <a href="/connect/demo" className="ml-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-accent ring-1 ring-inset ring-accent/30 transition-colors duration-300 hover:bg-tint">{m.nav.app.demo}</a>
            <Link href={localizeHref(locale, m.nav.cta.href)} className={`ml-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition duration-500 ${EASE} hover:bg-[var(--accent-hover)] active:scale-[0.97]`}>
              {m.nav.cta.label}
            </Link>
          </nav>
          <button
            className="relative grid h-11 w-11 place-items-center rounded-full bg-black/[0.04] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? m.nav.close : m.nav.menu}
            onClick={() => setOpen(!open)}
          >
            <span className={`absolute h-[1.5px] w-5 rounded bg-ink transition-transform duration-500 ${EASE} ${open ? "rotate-45" : "-translate-y-[3.5px]"}`} />
            <span className={`absolute h-[1.5px] w-5 rounded bg-ink transition-transform duration-500 ${EASE} ${open ? "-rotate-45" : "translate-y-[3.5px]"}`} />
          </button>
        </div>
      </header>

      {/* 전체 화면 메뉴: 닫힌 동안은 포커스되지 않도록 invisible */}
      <div
        id="mobile-nav"
        className={`fixed inset-0 z-30 bg-white transition-[opacity,visibility] duration-300 motion-reduce:transition-none lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        aria-hidden={!open}
      >
        <nav className="flex h-full flex-col justify-center px-8 pb-10 pt-24" aria-label={m.nav.mobile}>
          <ul className="space-y-1">
            {m.nav.items.map((i, n) => (
              <li key={i.href}>
                <Link
                  href={localizeHref(locale, i.href)}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${60 + n * 35}ms` : "0ms" }}
                  className={`block py-2.5 text-[2rem] font-bold leading-snug tracking-tight transition duration-500 motion-reduce:transition-none ${EASE} ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={localizeHref(locale, m.nav.cta.href)}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? "340ms" : "0ms" }}
            className={`mt-10 block rounded-full bg-accent px-6 py-4 text-center font-semibold text-white transition duration-500 motion-reduce:transition-none ${EASE} ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            {m.nav.cta.label}
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href="/connect/demo" tabIndex={open ? 0 : -1} className="block rounded-full py-3.5 text-center font-semibold text-accent ring-1 ring-inset ring-accent/30">{m.nav.app.demo}</a>
            <a href="/connect/login" tabIndex={open ? 0 : -1} className="block rounded-full py-3.5 text-center font-medium text-ink ring-1 ring-inset ring-black/10">{m.nav.app.login}</a>
          </div>
          <Link
            href={switchHref}
            hrefLang={other}
            lang={other}
            tabIndex={open ? 0 : -1}
            aria-label={m.nav.switchLabel}
            className="mt-4 block rounded-full py-3.5 text-center font-medium text-soft ring-1 ring-inset ring-black/10"
          >
            {m.nav.switchTo}
          </Link>
        </nav>
      </div>
    </>
  );
}
