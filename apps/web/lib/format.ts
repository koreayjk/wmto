import type { Locale } from "./i18n";

const KST = "Asia/Seoul";
const tag = (locale: Locale) => (locale === "en" ? "en-US" : "ko-KR");

export const fmtDateTime = (iso: string, locale: Locale = "ko") =>
  new Intl.DateTimeFormat(tag(locale), { dateStyle: "medium", timeStyle: "short", timeZone: KST }).format(new Date(iso));
export const fmtDate = (iso: string, locale: Locale = "ko") =>
  new Intl.DateTimeFormat(tag(locale), { dateStyle: "medium", timeZone: KST }).format(new Date(iso));
export const fmtMonth = (isoDate: string, locale: Locale = "ko") =>
  locale === "en"
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${isoDate.slice(0, 7)}-01T00:00:00Z`))
    : `${isoDate.slice(0, 4)}년 ${Number(isoDate.slice(5, 7))}월`;

/** 한국 시간 기준 이번 달 1일 (YYYY-MM-01) */
export function currentMonthKst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 7) + "-01";
}

/** <input type="datetime-local"> 값(한국 시간) → ISO */
export function kstLocalToIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const nowKstLocal = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 16);
