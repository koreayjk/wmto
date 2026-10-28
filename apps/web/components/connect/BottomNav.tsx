"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./icons";

export type NavItem = { href: string; label: string; also?: string[] };

/** 휴대폰 하단: 화면에서 살짝 떠 있는 유리 알약. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="mx-auto flex max-w-md rounded-full bg-white/85 p-1.5 shadow-[0_20px_40px_-18px_rgba(14,70,58,0.45),0_0_0_1px_rgba(22,24,29,0.06)] backdrop-blur-xl">
        {items.map((i) => {
          const active = i.href === "/connect" ? path === i.href : [i.href, ...(i.also ?? [])].some((h) => path.startsWith(h));
          return (
            <li key={i.href} className="flex-1">
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-2 text-[11px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  active ? "bg-accent text-white" : "text-ink/60"
                }`}
              >
                <NavIcon href={i.href} size={22} />
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
