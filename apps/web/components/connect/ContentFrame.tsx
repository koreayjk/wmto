"use client";

import { usePathname } from "next/navigation";

/** 휴대폰은 한 줄로, 컴퓨터(lg 이상)는 화면 폭을 모두 씁니다. 홈 외 화면은 카드를 여러 열로 배치합니다. */
export function ContentFrame({ children }: { children: React.ReactNode }) {
  const home = usePathname() === "/connect";
  return <div className={`mx-auto max-w-xl lg:max-w-[100rem] ${home ? "" : "connect-wide"}`}>{children}</div>;
}
