"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideGroup = { title?: string; items: { href: string; label: string }[] };

/** 큰 화면의 왼쪽 메뉴. 홈 / 네트워크 / 활동 / 리포트 / 배우기 묶음으로 나눕니다. */
export function Sidebar({ groups }: { groups: SideGroup[] }) {
  const path = usePathname();
  return (
    <nav aria-label="WMTO Connect" className="space-y-6">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.title && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-soft">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((i) => {
              const active = i.href === "/connect" ? path === i.href : path.startsWith(i.href);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2.5 text-[15px] transition-colors ${active ? "bg-tint font-semibold text-accent" : "text-ink/80 hover:bg-black/[0.04]"}`}
                  >
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
