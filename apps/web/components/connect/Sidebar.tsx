"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./icons";

export type SideGroup = { title?: string; items: { href: string; label: string }[] };

/** 큰 화면의 왼쪽 메뉴. 아주 가는 선 아이콘과 부드러운 알약형 선택 표시. */
export function Sidebar({ groups }: { groups: SideGroup[] }) {
  const path = usePathname();
  return (
    <nav aria-label="WMTO Connect" className="space-y-7">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.title && <p className="mb-2 px-4 gilt text-[11px] font-medium uppercase tracking-[0.24em]">{g.title}</p>}
          <ul className="space-y-1">
            {g.items.map((i) => {
              const active = i.href === "/connect" ? path === i.href : path.startsWith(i.href);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      active ? "bg-white font-semibold text-ink shadow-[0_10px_24px_-16px_rgba(14,70,58,0.5),0_0_0_1px_rgba(22,24,29,0.05)]" : "text-ink/65 hover:bg-white/60 hover:text-ink"
                    }`}
                  >
                    <span className={active ? "text-accent" : ""}><NavIcon href={i.href} /></span>
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
