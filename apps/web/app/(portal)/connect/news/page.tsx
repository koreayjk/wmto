import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate, fmtMonth, fmtMoney } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";
import type { FeedRow } from "@/lib/sponsor";

export default async function News() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "sponsor") redirect("/connect");
  const c = getMessages(locale).connect;
  const n = c.sponsor.news;
  const { data } = await supabase.rpc("sponsor_partner_feed");
  const rows = (data ?? []) as FeedRow[];

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="News" sub={n.sub}>{n.title}</PageTitle>
      {rows.length === 0 && <p className="text-soft">{n.empty}</p>}
      {rows.length > 0 && (
        <Card className="lg:col-span-full">
          <ul className="divide-y divide-black/[0.06]">
            {rows.map((r) => {
              const level = r.self_reliance ?? 0;
              const recentUp = r.stage_changed_at && Date.now() - new Date(r.stage_changed_at).getTime() < 90 * 86400_000;
              return (
                <li key={r.partner_name + (r.mission_field ?? "")} className="grid gap-x-8 gap-y-3 py-6 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto]">
                  <div>
                    <p className="font-display text-lg font-semibold">{r.partner_name}</p>
                    <p className="text-sm text-soft">{r.mission_field ?? "-"}</p>
                    {r.stage && <span className="mt-2 inline-block rounded-full bg-tint px-3 py-0.5 text-xs font-semibold text-accent">{c.stageNames[r.stage as keyof typeof c.stageNames] ?? r.stage}</span>}
                    {recentUp && r.stage_changed_at && <p className="mt-2 text-xs font-medium text-accent">{n.stageUp.replace("{d}", fmtDate(r.stage_changed_at, locale))}</p>}
                  </div>
                  {r.report_month ? (
                    <div className="space-y-2">
                      <p className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-xs text-soft">{n.report.replace("{m}", fmtMonth(r.report_month, locale))}</span>
                        <span className="flex gap-1" aria-hidden>{[1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-1.5 w-5 rounded-full ${i <= level ? "bg-accent" : "bg-black/10"}`} />)}</span>
                        <span>{n.relianceLabels[level] ?? ""}</span>
                      </p>
                      {r.prayer_topics && <p className="leading-relaxed text-ink/85">&ldquo;{r.prayer_topics}&rdquo;</p>}
                    </div>
                  ) : <p className="text-soft">{n.noReport}</p>}
                  <p className="text-sm text-soft lg:text-right">
                    {n.given}<b className="block font-display text-lg font-semibold text-ink tabular-nums">{fmtMoney(Number(r.given), locale)}</b>
                    {r.last_gift ? fmtDate(r.last_gift, locale) : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
