import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";
import { PrintButton } from "@/components/connect/PrintButton";

type Row = { week: string; attendance: number; referrals_given: number; referrals_received: number; visitors: number; one_to_one: number; learning: number; gratitude: number };
const KEYS = ["attendance", "referrals_given", "referrals_received", "visitors", "one_to_one", "learning", "gratitude"] as const;

export default async function Records() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.records;
  const { data } = await supabase.rpc("my_weekly_records", { p_weeks: 26 });
  const rows = ((data ?? []) as Row[]);
  const cur = rows[0];
  const total = (k: (typeof KEYS)[number]) => rows.reduce((a, r) => a + Number(r[k] ?? 0), 0);
  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><PageTitle eyebrow="Records" sub={t.sub}>{t.title}</PageTitle><PrintButton label={t.print} /></div>
      <Card title={t.thisWeek}>
        {cur ? (
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
            {KEYS.map((k) => <li key={k}><p className="text-[13px] text-soft">{t.cols[k]}</p><p className="mt-1 text-[1.8rem] font-light leading-none tabular-nums">{Number(cur[k] ?? 0)}</p></li>)}
          </ul>
        ) : <p className="text-soft">{t.empty}</p>}
      </Card>
      <Card title={t.weeks}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm tabular-nums">
            <thead><tr className="text-left text-[12px] text-soft"><th className="py-2 pr-4 font-medium">{t.week}</th>{KEYS.map((k) => <th key={k} className="px-2 py-2 text-right font-medium">{t.cols[k]}</th>)}</tr></thead>
            <tbody className="divide-y divide-black/[0.06]">
              {rows.map((r) => <tr key={r.week}><td className="py-2 pr-4 text-soft">{fmtDate(r.week, locale)}</td>{KEYS.map((k) => <td key={k} className={`px-2 py-2 text-right ${Number(r[k]) ? "" : "text-soft/50"}`}>{Number(r[k] ?? 0)}</td>)}</tr>)}
              <tr className="font-medium"><td className="py-2.5 pr-4">{t.total}</td>{KEYS.map((k) => <td key={k} className="px-2 py-2.5 text-right">{total(k)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
