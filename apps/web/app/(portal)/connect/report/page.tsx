import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages, type Locale } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { currentMonthKst, fmtMonth } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";
import { Avatar } from "@/components/connect/Avatar";

async function saveReport(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  if (me.role !== "partner") return;
  const month = String(fd.get("month") ?? "");
  // 이번 달과 지난달만 작성·수정 가능
  const cur = currentMonthKst();
  const prev = new Date(Date.UTC(Number(cur.slice(0, 4)), Number(cur.slice(5, 7)) - 2, 1)).toISOString().slice(0, 10);
  if (month !== cur && month !== prev) return;
  const revenueRaw = String(fd.get("revenue_amount") ?? "").trim();
  const revenue = revenueRaw === "" ? null : Number(revenueRaw);
  const reliance = Number(fd.get("self_reliance"));
  if ((revenue !== null && (!Number.isFinite(revenue) || revenue < 0)) || !Number.isInteger(reliance) || reliance < 1 || reliance > 5) return;
  await supabase.from("self_reports").upsert(
    {
      partner_id: me.id, month, revenue_amount: revenue,
      currency: (String(fd.get("currency") ?? "KRW").trim().toUpperCase() || "KRW").slice(0, 8),
      self_reliance: reliance,
      difficulties: String(fd.get("difficulties") ?? "").trim().slice(0, 3000) || null,
      prayer_topics: String(fd.get("prayer_topics") ?? "").trim().slice(0, 3000) || null,
    },
    { onConflict: "partner_id,month" },
  );
  revalidatePath("/connect/report");
  redirect("/connect/report?saved=1");
}

type Report = {
  id: string; partner_id: string; month: string; revenue_amount: number | null; currency: string;
  self_reliance: number | null; difficulties: string | null; prayer_topics: string | null;
};

const money = (r: Report, locale: Locale) => (r.revenue_amount == null ? "-" : `${Number(r.revenue_amount).toLocaleString(locale === "en" ? "en-US" : "ko-KR")} ${r.currency}`);

function Dots({ n }: { n: number | null }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n ?? 0}/5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-1.5 w-4 rounded-full ${i <= (n ?? 0) ? "bg-accent" : "bg-black/10"}`} />)}
    </span>
  );
}

/** 한 줄씩 내려가는 리포트 목록: 왼쪽에 사람과 달, 오른쪽에 매출과 자립도, 아래에 어려움·기도제목 */
function ReportRows({ rows, locale, nameOf, photoOf }: { rows: Report[]; locale: Locale; nameOf?: Map<string, string>; photoOf?: Map<string, string | null> }) {
  const t = getMessages(locale).connect.report;
  return (
    <ul className="divide-y divide-black/[0.06]">
      {rows.map((r) => (
        <li key={r.id} className="py-5 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <span className="flex items-center gap-3">
              {nameOf && <Avatar name={nameOf.get(r.partner_id) ?? "-"} url={photoOf?.get(r.partner_id)} size={38} />}
              <span>
                {nameOf && <b className="block font-display text-base">{nameOf.get(r.partner_id) ?? "-"}</b>}
                <span className={nameOf ? "text-xs text-clay" : "font-display text-base font-semibold"}>{fmtMonth(r.month, locale)}</span>
              </span>
            </span>
            <span className="flex items-center gap-5 text-sm">
              <span className="text-right"><span className="block text-[11px] text-soft">{t.revenueLabel}</span><b className="tabular-nums">{money(r, locale)}</b></span>
              <span><span className="mb-1.5 block text-[11px] text-soft">{t.reliance} {r.self_reliance ?? "-"}/5</span><Dots n={r.self_reliance} /></span>
            </span>
          </div>
          {(r.difficulties || r.prayer_topics) && (
            <dl className="mt-3 space-y-1 text-sm text-ink/80 sm:pl-[3.4rem]">
              {r.difficulties && <div><dt className="inline font-semibold">{t.difficulties} </dt><dd className="inline">{r.difficulties}</dd></div>}
              {r.prayer_topics && <div><dt className="inline font-semibold">{t.prayer} </dt><dd className="inline">{r.prayer_topics}</dd></div>}
            </dl>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ saved?: string; month?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const t = getMessages(locale).connect.report;
  const sp = await searchParams;

  const { data } = await supabase
    .from("self_reports")
    .select("id,partner_id,month,revenue_amount,currency,self_reliance,difficulties,prayer_topics")
    .order("month", { ascending: false })
    .limit(60);
  const reports = (data ?? []) as Report[];

  if (me.role === "mentor") {
    const ids = [...new Set(reports.map((r) => r.partner_id))];
    const { data: people } = ids.length ? await supabase.from("members").select("id,name,photo_url").in("id", ids) : { data: [] };
    const nameOf = new Map((people ?? []).map((p) => [p.id, p.name as string]));
    const photoOf = new Map((people ?? []).map((p) => [p.id, p.photo_url as string | null]));
    return (
      <div className="space-y-4">
        <PageTitle>{t.menteeReports}</PageTitle>
        {reports.length === 0 && <p className="text-soft">{t.empty}</p>}
        {reports.length > 0 && <Card className="lg:col-span-full"><ReportRows rows={reports} locale={locale} nameOf={nameOf} photoOf={photoOf} /></Card>}
      </div>
    );
  }

  const cur = currentMonthKst();
  const prev = new Date(Date.UTC(Number(cur.slice(0, 4)), Number(cur.slice(5, 7)) - 2, 1)).toISOString().slice(0, 10);
  const month = sp.month === prev ? prev : cur;
  const existing = reports.find((r) => r.month === month);

  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>
      {sp.saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.saved}</p>}
      <nav aria-label={t.month} className="flex gap-2 text-sm">
        {[cur, prev].map((v) => (
          <Link key={v} href={v === cur ? "/connect/report" : `/connect/report?month=${v}`}
            className={`rounded-full px-4 py-2 text-sm transition-colors duration-500 ${v === month ? "bg-accent text-white" : "text-soft ring-1 ring-inset ring-black/10 hover:text-ink"}`}>
            {fmtMonth(v, locale)}
          </Link>
        ))}
      </nav>
      <Card title={t.monthTitle}>
        {/* key: 월을 바꾸면 폼 값을 해당 월 데이터로 다시 채움 */}
        <form key={month} action={saveReport} className="space-y-4">
          <input type="hidden" name="month" value={month} />
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <label className="block">
              <span className={labelCls}>{t.revenue}</span>
              <input name="revenue_amount" type="number" min={0} step="any" inputMode="decimal" defaultValue={existing?.revenue_amount ?? ""} className="field" />
            </label>
            <label className="block">
              <span className={labelCls}>{t.currency}</span>
              <input name="currency" defaultValue={existing?.currency ?? "KRW"} maxLength={8} className="field uppercase" />
            </label>
          </div>
          <label className="block">
            <span className={labelCls}>{t.selfReliance}</span>
            <select name="self_reliance" required defaultValue={existing?.self_reliance ?? ""} className="field">
              <option value="" disabled>{getMessages(locale).connect.select}</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>{t.difficulties}</span>
            <textarea name="difficulties" rows={3} maxLength={3000} defaultValue={existing?.difficulties ?? ""} className="field" />
          </label>
          <label className="block">
            <span className={labelCls}>{t.prayer}</span>
            <textarea name="prayer_topics" rows={3} maxLength={3000} defaultValue={existing?.prayer_topics ?? ""} className="field" />
          </label>
          <button className="cbtn w-full">{t.save}</button>
        </form>
      </Card>

      <Card title={t.history} className="lg:col-span-2">
        {reports.length === 0 ? <p className="text-soft">{t.empty}</p> : <ReportRows rows={reports} locale={locale} />}
      </Card>
    </div>
  );
}
