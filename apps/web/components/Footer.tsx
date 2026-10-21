"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";

const m = getMessages();

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="bg-night text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-serif text-xl font-bold text-white">WMTO</p>
            <p className="mt-2 text-sm">{m.site.name}</p>
            <p className="text-sm">{m.site.footerLine}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {m.nav.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-white">{i.label}</Link>
              </li>
            ))}
            <li><Link href="/fund" className="hover:text-white">순환 기금</Link></li>
            <li><Link href="/apply?type=contact" className="hover:text-white">문의</Link></li>
            <li><Link href="/privacy" className="hover:text-white">{m.site.privacy}</Link></li>
          </ul>
        </div>
        <p className="mt-14 border-t border-white/10 pt-6 text-center font-serif text-sm italic text-gold">
          {m.verse.ko} ({m.verse.ref}) · {m.verse.en} — {m.verse.refEn}
        </p>
      </div>
    </footer>
  );
}
