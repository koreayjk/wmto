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
      <PageTitle sub={n.sub}>{n.title}</PageTitle>
      {rows.length === 0 && <p className="text-soft">{n.empty}</p>}
      {rows.map((r) => {
        const level = r.self_reliance ?? 0;
        const recentUp = r.stage_changed_at && Date.now() - new Date(r.stage_changed_at).getTime() < 90 * 86400_000;
        return (
          <Card key={r.partner_name + (r.mission_field ?? "")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold">{r.partner_name}</p>
                <p className="text-sm text-soft">{r.mission_field ?? "-"}</p>
              </div>
              {r.stage && (
                <span className="shrink-0 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-accent">
                  {c.stageNames[r.stage as keyof typeof c.stageNames] ?? r.stage}
                </span>
              )}
            </div>
            {recentUp && r.stage_changed_at && (
              <p className="mt-3 text-sm font-medium text-accent">{n.stageUp.replace("{d}", fmtDate(r.stage_changed_at, locale))}</p>
            )}
            {r.report_month ? (
              <div className="mt-5 space-y-4">
                <p className="text-xs text-soft">{n.report.replace("{m}", fmtMonth(r.report_month, locale))}</p>
                <div>
                  <p className="mb-2 text-[13px] text-soft">{n.reliance}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex gap-1.5" aria-hidden>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`h-2 w-7 rounded-full ${i <= level ? "bg-accent" : "bg-black/10"}`} />
                      ))}
                    </span>
                    <span className="text-sm">{n.relianceLabels[level] ?? ""}</span>
                  </div>
                </div>
                {r.prayer_topics && (
                  <div>
                    <p className="mb-1 text-[13px] text-soft">{n.prayer}</p>
                    <p className="leading-relaxed">&ldquo;{r.prayer_topics}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-soft">{n.noReport}</p>
            )}
            <p className="mt-5 border-t border-black/[0.06] pt-4 text-sm text-soft">
              {n.given} <b className="font-semibold text-ink">{fmtMoney(Number(r.given), locale)}</b>
              {r.last_gift ? ` · ${fmtDate(r.last_gift, locale)}` : ""}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
