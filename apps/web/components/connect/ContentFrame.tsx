"use client";

import { usePathname } from "next/navigation";

/** 홈(대시보드)은 넓게, 나머지 화면은 읽기 좋은 폭으로 둡니다. */
export function ContentFrame({ children }: { children: React.ReactNode }) {
  const home = usePathname() === "/connect";
  return <div className={`mx-auto max-w-xl ${home ? "lg:max-w-5xl" : ""}`}>{children}</div>;
}
