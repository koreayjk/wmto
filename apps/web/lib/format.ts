const KST = "Asia/Seoul";

export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: KST }).format(new Date(iso));
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: KST }).format(new Date(iso));
export const fmtMonth = (isoDate: string) => `${isoDate.slice(0, 4)}년 ${Number(isoDate.slice(5, 7))}월`;

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
