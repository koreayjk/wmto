import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { currentMonthKst, fmtDate } from "@/lib/format";
import { activityScore, WEIGHTS, type ActivityCounts } from "@/lib/score";
import { mentorStages, partnerStages } from "@/lib/stages";
import { Card, PageTitle, StageBar } from "@/components/connect/ui";

export default async function Growth() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages(locale).connect;
  const g = m.growth;
  const monthStart = `${currentMonthKst()}T00:00:00+09:00`;
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: "exact", head: true } as const;

  const [attendance, mentoring, reports, referrals, letters, matchings, hist, sugg] = await Promise.all([
    count(supabase.from("attendance").select("id", head).eq("member_id", me.id).gte("attended_at", monthStart)),
    me.role === "mentor"
      ? count(supabase.from("mentoring_logs").select("id", head).eq("created_by", me.id).gte("held_at", monthStart))
      : count(supabase.from("mentoring_logs").select("id", head).gte("held_at", monthStart)), // 선교사는 자기 매칭 기록만 보임(RLS)
    me.role === "partner" ? count(supabase.from("self_reports").select("id", head).eq("partner_id", me.id).eq("month", currentMonthKst())) : Promise.resolve(0),
    me.role === "mentor" ? count(supabase.from("referrals").select("id", head).eq("giver_id", me.id).gte("created_at", monthStart)) : Promise.resolve(0),
    count(supabase.from("thanks_letters").select("id", head).eq(me.role === "partner" ? "sender_id" : "recipient_id", me.id).gte("created_at", monthStart)),
    count(supabase.from("matchings").select("id", head).eq("status", "active")),
    supabase.from("stage_history").select("id,from_stage,to_stage,created_at").eq("member_id", me.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("promotion_suggestions").select("to_stage,reason").eq("member_id", me.id).maybeSingle(),
  ]);

  const counts: ActivityCounts = { attendance, mentoring, reports, referrals, letters, matchings };
  const keys = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).filter((k) => !(k === "reports" && me.role !== "partner") && !(k === "referrals" && me.role !== "mentor"));
  const stages = me.role === "mentor" ? mentorStages : partnerStages;
  const names = m.stageNames;

  return (
    <div className="space-y-4">
      <PageTitle>{g.title}</PageTitle>
      <Card title={m.stageTitle}>
        <StageBar stages={stages} current={me.stage} names={names} desc={m.stageDesc} />
        {sugg.data && (
          <p className="mt-4 border-t border-line pt-4 text-sm">
            <b className="text-clay">{g.suggestion}</b> → {names[sugg.data.to_stage as keyof typeof names]}
            <span className="block text-soft">{sugg.data.reason} · {g.suggestionNote}</span>
          </p>
        )}
      </Card>
      <Card title={g.thisMonth}>
        <ul className="divide-y divide-line">
          {keys.map((k) => (
            <li key={k} className="flex justify-between py-2.5">
              <span>{g.labels[k]}</span>
              <span className="font-display font-semibold">{counts[k]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="text-soft">{g.scoreLabel}</span>
          <span className="font-display text-2xl font-semibold">{activityScore(counts)}</span>
        </p>
        <p className="mt-2 text-xs text-soft">{g.note}</p>
      </Card>
      <Card title={g.history}>
        {(hist.data ?? []).length === 0 ? (
          <p className="text-soft">{g.noHistory}</p>
        ) : (
          <ul className="space-y-2">
            {hist.data!.map((h) => (
              <li key={h.id}>
                <span className="font-display font-semibold">{names[h.to_stage as keyof typeof names] ?? h.to_stage}</span>
                <span className="ml-2 text-sm text-soft">{fmtDate(h.created_at, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
