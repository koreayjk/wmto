import { ko, type Messages } from "@/messages/ko";
import { en } from "@/messages/en";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";
export const LOCALE_COOKIE = "wmto-locale";

export const isLocale = (v: unknown): v is Locale => v === "ko" || v === "en";

const catalogs: Record<Locale, Messages> = { ko, en };

export function getMessages(locale: Locale = defaultLocale): Messages {
  return catalogs[locale];
}

// 회원 앱·관리자·인증 경로는 주소에 언어를 붙이지 않고 쿠키로 정합니다.
const PORTAL = ["/connect", "/admin", "/auth"];
const isPortal = (href: string) => PORTAL.some((p) => href === p || href.startsWith(p + "/") || href.startsWith(p + "?"));

/** 브라우저 주소 기준의 언어. 한국어는 접두사 없이, 영어는 /en 으로 시작합니다. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
}

/** 내부 링크에 언어 접두사를 붙입니다. 외부 주소·해시·회원 앱 경로는 그대로 둡니다. */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || isPortal(href)) return href;
  if (locale === "ko") return href;
  if (href === "/en" || href.startsWith("/en/") || href.startsWith("/en?")) return href;
  return href === "/" ? "/en" : `/en${href}`;
}

/** 같은 페이지의 다른 언어 주소 */
export function switchLocaleHref(pathname: string, search: string, target: Locale): string {
  const base = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return localizeHref(target, base) + search;
}

/** "{n}" 자리표시자를 값으로 바꿉니다. */
export const fill = (template: string, n: string | number) => template.replace("{n}", String(n));
