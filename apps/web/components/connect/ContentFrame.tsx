"use client";

import { usePathname } from "next/navigation";

/** 화면마다 어울리는 배경 사진. 메뉴까지 화면 전체에 깔리는 은은한 장면입니다. */
const SCENES: Record<string, string> = {
  "/connect/tent": "tent", "/connect/mentoring": "mentoring", "/connect/events": "time", "/connect/thanks": "letters",
  "/connect/growth": "growth", "/connect/matching": "matching", "/connect/referrals": "matching", "/connect/report": "report",
  "/connect/fund": "fund", "/connect/giving": "fund", "/connect/news": "news", "/connect/academy": "academy",
};

/** 휴대폰은 한 줄로, 컴퓨터(lg 이상)는 화면 폭을 모두 씁니다. 홈 외 화면은 카드를 여러 열로 배치합니다. */
export function ContentFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname().replace(/\/$/, "");
  const home = path === "/connect";
  const scene = SCENES[path];
  return (
    <>
      {scene && <div aria-hidden className="scene-room" style={{ backgroundImage: `url(/scenes/${scene}.jpg)` }} />}
      <div className={`relative z-10 mx-auto max-w-xl lg:max-w-[100rem] ${home ? "" : "connect-wide"} ${scene ? "tent-theme" : ""}`}>{children}</div>
    </>
  );
}
