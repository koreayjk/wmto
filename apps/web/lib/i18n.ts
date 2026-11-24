import { keepKoDeep } from "./typo";
import { ko, type Messages } from "@/messages/ko";
import { en } from "@/messages/en";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";
export const LOCALE_COOKIE = "wmto-locale";

export const isLocale = (v: unknown): v is Locale => v === "ko" || v === "en";

const catalogs: Record<Locale, Messages> = { ko: keepKoDeep(ko), en };

export function getMessages(locale: Locale = defaultLocale): Messages {
  return catalogs[locale];
}

// 회원 앱·관리자·인증 경로는 주소에 언어를 붙이지 않고 쿠키로 정합니다.
const PORTAL = ["/connect", "/admin", "/auth"];
const isPortal = (href: string) => PORTAL.some((p) => href === p || href.startsWith(p + "/") || href.startsWith(p + "?"));

/** 선교 사역(WMTO) 공개 사이트는 /wmto 아래에 있습니다. 루트(/)는 CBC 첫 화면입니다. */
export const WMTO_BASE = "/wmto";
const stripBase = (p: string) => (p === WMTO_BASE ? "/" : p.startsWith(WMTO_BASE + "/") ? p.slice(WMTO_BASE.length) : p);

/** 브라우저 주소 기준의 언어. 한국어는 접두사 없이, 영어는 /en 으로 시작합니다(WMTO 는 /wmto/en). */
export function localeFromPathname(pathname: string): Locale {
  const p = stripBase(pathname);
  return p === "/en" || p.startsWith("/en/") ? "en" : "ko";
}

/** 내부 링크에 /wmto 와 언어 접두사를 붙입니다. 외부 주소·회원 앱 경로는 그대로 둡니다. */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || isPortal(href)) return href;
  if (href === WMTO_BASE || /^\/wmto[/?#]/.test(href)) return href;
  let rest = href;
  if (/^\/en($|[/?#])/.test(rest)) rest = rest.slice(3) || "/";
  const p = locale === "en" ? (rest === "/" ? "/en" : "/en" + (rest.startsWith("/?") || rest.startsWith("/#") ? rest.slice(1) : rest)) : rest;
  if (p === "/") return WMTO_BASE;
  return WMTO_BASE + (p.startsWith("/?") || p.startsWith("/#") ? p.slice(1) : p);
}

/** 같은 페이지의 다른 언어 주소 */
export function switchLocaleHref(pathname: string, search: string, target: Locale): string {
  const p = stripBase(pathname);
  const base = p === "/en" ? "/" : p.startsWith("/en/") ? p.slice(3) : p;
  return localizeHref(target, base) + search;
}

/** "{n}" 자리표시자를 값으로 바꿉니다. */
export const fill = (template: string, n: string | number) => template.replace("{n}", String(n));
