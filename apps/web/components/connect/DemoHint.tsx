"use client";

import { usePathname } from "next/navigation";

/** 체험 모드: 지금 보고 있는 화면이 무엇이고 어떻게 쓰이는지 한두 문장으로 알려 줍니다. */
export function DemoHint({ hints }: { hints: Record<string, string> }) {
  const path = usePathname().replace(/\/$/, "");
  const text = hints[path];
  if (!text || path === "/connect") return null;
  return (
    <div className="mb-4 flex gap-3 rounded-2xl bg-tint px-5 py-4 text-sm leading-relaxed text-ink/80">
      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
