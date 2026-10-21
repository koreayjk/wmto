"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { getMessages } from "@/lib/i18n";

const m = getMessages();

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);

  if (path.startsWith("/admin") || path.startsWith("/connect") || path.startsWith("/auth")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-baseline gap-2.5" aria-label={m.site.name}>
          <span className="text-xl font-extrabold tracking-tight">WMTO</span>
          <span className="hidden text-[13px] text-soft xl:inline">자립선교 비즈니스 네트워크</span>
        </Link>
        <nav className="hidden items-center gap-1 text-[15px] lg:flex" aria-label="주 메뉴">
          {m.nav.items.map((i) => {
            const active = path === i.href;
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 transition-colors hover:bg-deep ${active ? "font-semibold text-accent" : "text-ink/80"}`}
              >
                {i.label}
              </Link>
            );
          })}
          <Link href={m.nav.cta.href} className="ml-3 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.98]">
            {m.nav.cta.label}
          </Link>
        </nav>
        <button
          className="-mr-2 rounded-lg p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? m.nav.close : m.nav.menu}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <List size={26} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-white px-6 pb-8 pt-3 lg:hidden" aria-label="모바일 메뉴">
          <ul className="divide-y divide-line">
            {m.nav.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="block py-4 text-xl font-bold tracking-tight">{i.label}</Link>
              </li>
            ))}
          </ul>
          <Link href={m.nav.cta.href} className="mt-6 block rounded-lg bg-accent px-5 py-4 text-center font-semibold text-white">
            {m.nav.cta.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
