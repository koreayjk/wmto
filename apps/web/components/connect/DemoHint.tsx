"use client";

import { usePathname } from "next/navigation";

/** 체험 모드: 지금 보고 있는 화면이 무엇이고 어떻게 쓰이는지 한두 문장으로 알려 줍니다. */
export function DemoHint({ hints }: { hints: Record<string, string> }) {
  const path = usePathname().replace(/\/$/, "");
  const text = hints[path];
  if (!text || path === "/connect") return null;
  return (
    <div className="relative z-10 mb-5 flex gap-3 border-l-2 border-[#b8975a]/60 py-1 pl-5 text-sm leading-relaxed text-ink/75">
      <p>{text}</p>
    </div>
  );
}
