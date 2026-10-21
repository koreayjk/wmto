"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";

const m = getMessages();
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** 떠 있는 유리 알약형 메뉴. 모바일에서는 전체 화면 메뉴로 펼쳐지고 링크가 순서대로 올라온다. */
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

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
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full bg-white/90 py-2 pl-5 pr-2 shadow-[0_10px_30px_-14px_rgba(14,106,91,0.35)] ring-1 ring-black/[0.06] backdrop-blur-xl">
          <Link href="/" className="flex items-baseline gap-2.5" aria-label={m.site.name}>
            <span className="text-xl font-extrabold tracking-tight">WMTO</span>
            <span className="hidden text-[13px] text-soft xl:inline">자립선교 비즈니스 네트워크</span>
          </Link>
          <nav className="hidden items-center gap-0.5 text-[15px] lg:flex" aria-label="주 메뉴">
            {m.nav.items.map((i) => {
              const active = path === i.href;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 transition-colors duration-300 hover:bg-black/[0.04] ${active ? "font-semibold text-accent" : "text-ink/80"}`}
                >
                  {i.label}
                </Link>
              );
            })}
            <Link href={m.nav.cta.href} className={`ml-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition duration-500 ${EASE} hover:bg-[var(--accent-hover)] active:scale-[0.97]`}>
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
        className={`fixed inset-0 z-30 bg-white/[0.97] backdrop-blur-2xl transition-[opacity,visibility] duration-500 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        aria-hidden={!open}
      >
        <nav className="flex h-full flex-col justify-center px-8 pb-10 pt-24" aria-label="모바일 메뉴">
          <ul className="space-y-1">
            {m.nav.items.map((i, n) => (
              <li key={i.href} className="overflow-hidden">
                <Link
                  href={i.href}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${120 + n * 55}ms` : "0ms" }}
                  className={`block py-2.5 text-[2rem] font-bold tracking-tight transition duration-700 ${EASE} ${open ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={m.nav.cta.href}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? "520ms" : "0ms" }}
            className={`mt-10 block rounded-full bg-accent px-6 py-4 text-center font-semibold text-white transition duration-700 ${EASE} ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            {m.nav.cta.label}
          </Link>
        </nav>
      </div>
    </>
  );
}
