"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";

const m = getMessages();

export function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  if (path.startsWith("/admin")) return null;
  // 밝은 배경으로 시작하는 페이지는 처음부터 solid 헤더
  const lightTop = path.startsWith("/apply");
  const light = !solid && !open && !lightTop;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid || open || lightTop ? "bg-paper/90 text-ink backdrop-blur" : "text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-lg font-bold tracking-wide">
          WMTO
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] md:flex">
          {m.nav.items.map((i) => (
            <Link key={i.href} href={i.href} className={`transition-opacity hover:opacity-100 ${path === i.href ? "opacity-100" : "opacity-75"}`}>
              {i.label}
            </Link>
          ))}
          <Link
            href={m.nav.cta.href}
            className={`px-4 py-2 text-[13px] font-medium transition-colors ${light ? "bg-white text-night" : "bg-clay text-white"}`}
          >
            {m.nav.cta.label}
          </Link>
        </nav>
        <button
          className="md:hidden"
          aria-expanded={open}
          aria-label={open ? m.nav.close : m.nav.menu}
          onClick={() => setOpen(!open)}
        >
          <span className="block h-px w-6 bg-current" />
          <span className="mt-2 block h-px w-6 bg-current" />
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-6 pb-8 pt-4 md:hidden">
          {m.nav.items.map((i) => (
            <Link key={i.href} href={i.href} className="py-3 font-serif text-2xl">
              {i.label}
            </Link>
          ))}
          <Link href={m.nav.cta.href} className="mt-4 bg-clay px-5 py-3.5 text-center font-medium text-white">
            {m.nav.cta.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
