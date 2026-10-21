import type { Metadata } from "next";
import { getMessages, localizeHref, type Locale } from "./i18n";

type Key = keyof ReturnType<typeof getMessages>["meta"];

/** 페이지별 제목과 언어 대체 주소(hreflang) */
export function pageMetadata(locale: Locale, key: Key, path: string): Metadata {
  const m = getMessages(locale);
  return {
    title: m.meta[key],
    alternates: {
      canonical: localizeHref(locale, path),
      languages: { ko: path, en: localizeHref("en", path), "x-default": path },
    },
  };
}
