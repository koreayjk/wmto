import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate, fmtMoney } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";

type Overview = { total_given: number; given_this_year: number; gifts: number; partners_supported: number; first_gift: string | null };
type Gift = { id: string; kind: "one_to_one" | "camp" | "fund" | "monthly"; partner_name: string | null; amount: number; currency: string; donated_at: string; note: string | null };

export default async function Giving() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "sponsor") redirect("/connect");
  const m = getMessages(locale).connect.sponsor;
  const g = m.giving;

  const [{ data: ov }, { data: gifts }] = await Promise.all([
    supabase.rpc("sponsor_overview"),
    supabase.rpc("sponsor_gifts"),
  ]);
  const o = ((ov as Overview[] | null) ?? [])[0] ?? { total_given: 0, given_this_year: 0, gifts: 0, partners_supported: 0, first_gift: null };
  const rows = (gifts ?? []) as Gift[];
  const stats: [string, string][] = [
    [g.total, fmtMoney(Number(o.total_given), locale)],
    [g.thisYear, fmtMoney(Number(o.given_this_year), locale)],
    [g.partners, String(o.partners_supported)],
    [g.gifts, String(o.gifts)],
  ];

  return (
    <div className="space-y-4">
      <PageTitle sub={o.first_gift ? g.since.replace("{d}", fmtDate(o.first_gift, locale)) : g.sub}>{g.title}</PageTitle>
      <div className="grid grid-cols-2 gap-4 lg:col-span-full lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="cbezel c-rise">
            <div className="cbezel-in flex min-h-32 flex-col justify-between p-5">
              <p className="text-[13px] text-soft">{label}</p>
              <p className="font-display text-[1.7rem] font-light leading-tight tabular-nums">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-soft">{g.empty}</p>
      ) : (
        <Card title={g.list} className="lg:col-span-full">
          <ul className="divide-y divide-black/[0.06]">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-4 first:pt-0 last:pb-0">
                <span>
                  <span className="block font-display text-base font-semibold">{g.kinds[r.kind]}</span>
                  <span className="text-sm text-soft">
                    {r.partner_name ?? g.general} · {fmtDate(r.donated_at, locale)}
                  </span>
                </span>
                <span className="font-display text-lg tabular-nums">{fmtMoney(Number(r.amount), locale)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-soft">{g.receiptNote}</p>
        </Card>
      )}
    </div>
  );
}
