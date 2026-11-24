import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { currentMonthKst, fmtDate } from "@/lib/format";
import { activityScore, WEIGHTS, type ActivityCounts } from "@/lib/score";
import { mentorStages, partnerStages } from "@/lib/stages";
import { Card, PageTitle, StageBar } from "@/components/connect/ui";
import { sendAppeal } from "@/lib/renewal-actions";
import { GrowthIndex, type GrowthData } from "@/components/connect/GrowthIndex";

export default async function Growth() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages(locale).connect;
  const g = m.growth;
  const monthStart = `${currentMonthKst()}T00:00:00+09:00`;
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: "exact", head: true } as const;

  const [attendance, mentoring, reports, referrals, letters, matchings, hist, sugg, growth] = await Promise.all([
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
    me.role === "mentor" ? supabase.rpc("my_growth") : Promise.resolve({ data: null }),
  ]);

  // 내 회원 기간과 갱신 심사 (사업가만)
  const rw = getMessages(locale).connect.renewal;
  let term: { term_end: string | null } | null = null;
  let review: { status: string; suggestion: string; plan: string | null; appeal_note: string | null; support_until: string | null } | null = null;
  let isLeader = false;
  if (me.role === "mentor") {
    const [{ data: tm }, { data: rv }, { data: ld }] = await Promise.all([
      supabase.from("members").select("term_end").eq("id", me.id).maybeSingle(),
      supabase.from("renewal_reviews").select("status,suggestion,plan,appeal_note,support_until").eq("member_id", me.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("chapter_leaders").select("chapter_id").eq("member_id", me.id).limit(1),
    ]);
    term = tm; review = rv; isLeader = (ld ?? []).length > 0;
  }
  const daysLeft = term?.term_end ? Math.ceil((new Date(term.term_end).getTime() - Date.now()) / 86400000) : null;

  const { data: bill } = me.role === "mentor" ? await supabase.rpc("my_billing") : { data: null };
  const billing = (bill ?? null) as { open: number; account: string | null; note: string | null; invoices: { id: string; kind: "joining" | "renewal" | "other"; amount: number; status: "issued" | "paid" | "waived" | "void"; due_on: string | null; issued_at: string }[] } | null;
  const bm = getMessages(locale).connect.billing;

  const counts: ActivityCounts = { attendance, mentoring, reports, referrals, letters, matchings };
  const keys = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).filter((k) => !(k === "reports" && me.role !== "partner") && !(k === "referrals" && me.role !== "mentor"));
  const stages = me.role === "mentor" ? mentorStages : partnerStages;
  const names = m.stageNames;

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Growth">{g.title}</PageTitle>
      {growth.data && <GrowthIndex data={growth.data as GrowthData} t={g.index} />}
      {billing && billing.invoices.length > 0 && (
        <Card title={bm.title}>
          <p className={`text-sm ${billing.open > 0 ? "font-medium" : "text-soft"}`}>{billing.open > 0 ? bm.open : bm.none}</p>
          {billing.open > 0 && billing.account && <p className="mt-3 rounded-xl bg-tint px-4 py-3 text-sm"><b className="font-medium">{bm.account}</b> · {billing.account}{billing.note ? <span className="mt-1 block text-soft">{bm.note}: {billing.note}</span> : null}</p>}
          <ul className="mt-4 divide-y divide-black/[0.06] text-sm">
            {billing.invoices.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>{bm.kind[i.kind]} · {i.amount.toLocaleString("ko-KR")}{bm.won}{i.status === "issued" && i.due_on ? <span className="ml-2 text-xs text-soft">{bm.due} {fmtDate(i.due_on, locale)}</span> : null}</span>
                <span className={`text-xs font-semibold ${i.status === "paid" ? "text-accent" : i.status === "issued" ? "gilt" : "text-soft"}`}>{bm.status[i.status]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-soft">{bm.hint}</p>
        </Card>
      )}
      {me.role === "mentor" && term?.term_end && (
        <Card title={rw.mine.title}>
          <p className="font-display text-lg font-semibold">{rw.mine.ends} {term.term_end}{daysLeft !== null && daysLeft >= 0 ? ` · ${daysLeft}${rw.mine.daysLeft}` : ""}</p>
          {(!review || review.status === "closed") && <p className="mt-2 text-sm text-soft">{rw.mine.none}</p>}
          {review && (review.status === "open" || review.status === "planned") && <p className="mt-2 text-sm">{rw.mine.reviewing}</p>}
          {review?.status === "renewed" && <p className="mt-2 text-sm text-accent">{rw.mine.renewed}</p>}
          {review?.status === "on_hold" && <p className="mt-2 text-sm">{rw.mine.hold}{review.support_until ? ` (${review.support_until})` : ""}</p>}
          {review?.status === "not_renewed" && <p className="mt-2 text-sm">{rw.mine.notRenewed}</p>}
          {review?.plan && <p className="mt-2 text-sm text-soft">{rw.plan}: {review.plan}</p>}
          {review && review.status !== "closed" && review.status !== "renewed" && (
            <form action={sendAppeal} className="mt-4 space-y-2">
              <textarea name="note" rows={2} maxLength={1000} defaultValue={review.appeal_note ?? ""} placeholder={rw.mine.appealTitle} className="field" />
              <button className="cbtn cbtn-quiet cbtn-sm">{rw.mine.appealBtn}</button>
            </form>
          )}
          {isLeader && <span className="mt-4 flex gap-5 text-sm"><a href="/connect/renewal" className="underline">{rw.nav}</a><a href="/connect/dashboard" className="underline">{getMessages(locale).connect.dashboard.nav}</a></span>}
        </Card>
      )}
      <Card title={m.stageTitle}>
        <StageBar stages={stages} current={me.stage} names={names} desc={m.stageDesc} />
        {sugg.data && (
          <p className="mt-4 border-t border-line pt-4 text-sm">
            <b className="text-clay">{g.suggestion}</b> → {names[sugg.data.to_stage as keyof typeof names]}
            <span className="block text-soft">{sugg.data.reason} · {g.suggestionNote}</span>
          </p>
        )}
      </Card>
      {!growth.data && (
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
      )}
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
