import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./i18n";

/** 회원 앱의 언어: 쿠키(wmto-locale). 공개 사이트를 마지막으로 본 언어가 그대로 이어집니다. */
export async function getPortalLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : defaultLocale;
}

/** 루트 레이아웃용: proxy 가 요청마다 정해 준 언어(관리자는 항상 한국어). */
export async function getRequestLocale(): Promise<Locale> {
  const v = (await headers()).get("x-locale");
  return isLocale(v) ? v : defaultLocale;
}
