"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";

const m = getMessages();

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/connect") || path.startsWith("/auth")) return null;
  return (
    <footer className="border-t border-line bg-deep text-soft">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-ink">WMTO</p>
            <p className="mt-2 text-sm">{m.site.name}</p>
            <p className="text-sm">{m.site.footerLine}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-14 gap-y-2.5 text-sm">
            {m.nav.items.map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-accent">{i.label}</Link></li>
            ))}
            <li><Link href="/fund" className="hover:text-accent">순환 기금</Link></li>
            <li><Link href="/apply?type=contact" className="hover:text-accent">문의</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">{m.site.privacy}</Link></li>
          </ul>
        </div>
        <p className="mt-12 border-t border-line pt-6 text-sm">
          {m.verse.ko} ({m.verse.ref})
        </p>
      </div>
    </footer>
  );
}
