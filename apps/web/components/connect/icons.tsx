"use client";

import { House, HandHeart, ShareNetwork, Envelope, CalendarBlank, ChatsCircle, Notebook, Plant, PlayCircle, UserCircle, DotsThree, HandCoins, Newspaper, ArrowsClockwise, Campfire } from "@phosphor-icons/react";
import type { ComponentType } from "react";

type Icon = ComponentType<{ size?: number; weight?: "light" | "regular"; "aria-hidden"?: boolean }>;
const map: Record<string, Icon> = {
  "/connect": House,
  "/connect/matching": HandHeart,
  "/connect/referrals": ShareNetwork,
  "/connect/thanks": Envelope,
  "/connect/events": CalendarBlank,
  "/connect/mentoring": ChatsCircle,
  "/connect/report": Notebook,
  "/connect/growth": Plant,
  "/connect/academy": PlayCircle,
  "/connect/profile": UserCircle,
  "/connect/more": DotsThree,
  "/connect/giving": HandCoins,
  "/connect/news": Newspaper,
  "/connect/fund": ArrowsClockwise,
  "/connect/tent": Campfire,
};

/** 아주 가는 선의 아이콘. 경로에 맞는 아이콘이 없으면 아무것도 그리지 않습니다. */
export function NavIcon({ href, size = 20 }: { href: string; size?: number }) {
  const I = map[href];
  return I ? <I size={size} weight="light" aria-hidden /> : null;
}
