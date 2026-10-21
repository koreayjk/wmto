import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { currentMonthKst, fmtMonth } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

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

const money = (r: Report) => (r.revenue_amount == null ? "—" : `${Number(r.revenue_amount).toLocaleString("ko-KR")} ${r.currency}`);

function Details({ r }: { r: Report }) {
  const t = getMessages().connect.report;
  return (
    <>
      <p className="text-sm text-soft">{t.revenueLabel} {money(r)} · {t.reliance} {r.self_reliance ?? "—"}/5</p>
      {r.difficulties && <p className="mt-2 whitespace-pre-line text-sm"><b>{t.difficulties}</b> {r.difficulties}</p>}
      {r.prayer_topics && <p className="mt-2 whitespace-pre-line text-sm"><b>{t.prayer}</b> {r.prayer_topics}</p>}
    </>
  );
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ saved?: string; month?: string }> }) {
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const t = getMessages().connect.report;
  const sp = await searchParams;

  const { data } = await supabase
    .from("self_reports")
    .select("id,partner_id,month,revenue_amount,currency,self_reliance,difficulties,prayer_topics")
    .order("month", { ascending: false })
    .limit(60);
  const reports = (data ?? []) as Report[];

  if (me.role === "mentor") {
    const ids = [...new Set(reports.map((r) => r.partner_id))];
    const { data: people } = ids.length ? await supabase.from("members").select("id,name").in("id", ids) : { data: [] };
    const nameOf = new Map((people ?? []).map((p) => [p.id, p.name]));
    return (
      <div className="space-y-4">
        <PageTitle>{t.menteeReports}</PageTitle>
        {reports.length === 0 && <p className="text-soft">{t.empty}</p>}
        {reports.map((r) => (
          <Card key={r.id}>
            <p className="font-serif text-lg font-semibold">{nameOf.get(r.partner_id) ?? "—"} <span className="text-sm font-normal text-clay">{fmtMonth(r.month)}</span></p>
            <Details r={r} />
          </Card>
        ))}
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
      {sp.saved && <p role="status" className="border border-clay/40 bg-clay/10 p-3 text-sm">{t.saved}</p>}
      <nav aria-label={t.month} className="flex gap-2 text-sm">
        {[cur, prev].map((v) => (
          <Link key={v} href={v === cur ? "/connect/report" : `/connect/report?month=${v}`}
            className={`border px-4 py-2 ${v === month ? "border-clay bg-clay text-white" : "border-line text-soft"}`}>
            {fmtMonth(v)}
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
              <option value="" disabled>선택</option>
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
          <button className="w-full bg-clay py-3.5 font-medium text-white">{t.save}</button>
        </form>
      </Card>

      <h2 className="pt-4 text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.history}</h2>
      {reports.length === 0 && <p className="text-soft">{t.empty}</p>}
      {reports.map((r) => (
        <Card key={r.id}>
          <p className="font-serif text-lg font-semibold">{fmtMonth(r.month)}</p>
          <Details r={r} />
        </Card>
      ))}
    </div>
  );
}
