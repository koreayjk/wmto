import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtMoney } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";
import type { FundRow } from "@/lib/sponsor";

export default async function Fund() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "sponsor" && me.role !== "mentor") redirect("/connect");
  const f = getMessages(locale).connect.sponsor.fund;
  const { data } = await supabase.rpc("fund_overview");
  const o = ((data as FundRow[] | null) ?? [])[0];
  const lent = Number(o?.total_lent ?? 0);
  const repaid = Number(o?.total_repaid ?? 0);
  const ratio = lent > 0 ? Math.min(100, Math.round((repaid / lent) * 100)) : 0;

  const stats: [string, string][] = [
    [f.lent, fmtMoney(lent, locale)],
    [f.repaid, fmtMoney(repaid, locale)],
    [f.reflowed, fmtMoney(Number(o?.reflowed ?? 0), locale)],
    [f.started, f.people.replace("{n}", String(o?.partners_started ?? 0))],
    [f.active, f.loans.replace("{n}", String(o?.active_loans ?? 0))],
  ];

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Fund" sub={f.sub}>{f.title}</PageTitle>
      {lent === 0 ? (
        <p className="text-soft">{f.empty}</p>
      ) : (
        <>
          <Card title={f.ratio} tone="dark" className="lg:col-span-full">
            <p className="serif text-[3.2rem] font-light leading-none tabular-nums">{ratio}<span className="text-2xl">%</span></p>
            <div className="mt-6 h-2 rounded-full bg-white/15" role="img" aria-label={`${f.ratio} ${ratio}%`}>
              <div className="h-full rounded-full bg-white" style={{ width: `${ratio}%` }} />
            </div>
            <p className="mt-5 text-sm text-white/70">{f.note}</p>
          </Card>
          <div className="grid grid-cols-2 gap-4 lg:col-span-full lg:grid-cols-5">
            {stats.map(([label, value]) => (
              <div key={label} className="cbezel c-rise">
                <div className="cbezel-in flex min-h-28 flex-col justify-between p-5">
                  <p className="text-[13px] text-soft">{label}</p>
                  <p className="serif text-[1.4rem] font-light leading-tight tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
