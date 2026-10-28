"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminLink = { href: string; label: string };

/** 관리자 상단 메뉴: 선택한 항목이 흰 알약으로 표시됩니다. */
export function AdminNav({ links }: { links: AdminLink[] }) {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 text-[14px]" aria-label="admin">
      {links.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${active ? "bg-ink text-white" : "text-ink/65 hover:bg-black/[0.05] hover:text-ink"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
