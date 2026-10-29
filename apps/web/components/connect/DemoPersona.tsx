import { getMessages } from "@/lib/i18n";
import { fmtMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { Me } from "@/lib/me";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/connect/ui";

type Db = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** 체험 모드: 지금 보고 있는 가상 회원이 누구인지, 이야기와 숫자로 소개합니다. */
export async function DemoPersona({ me, db, locale }: { me: Me; db: Db; locale: Locale }) {
  if (!me.role) return null;
  const msg = getMessages(locale);
  const p = msg.connect.demo.persona;
  const f = p.facts;
  const prof = (me.profile ?? {}) as Record<string, string | string[] | null>;
  const stage = me.stage ? msg.connect.stageNames[me.stage as keyof typeof msg.connect.stageNames] : null;
  const num = (t: string, n: number) => t.replace("{n}", String(n));

  const { data: row } = await db.from("members").select("created_at").eq("id", me.id).maybeSingle();
  const months = row?.created_at ? Math.max(1, Math.round((Date.now() - new Date(row.created_at).getTime()) / (30.4 * 86400_000))) : null;
  const facts: [string, string][] = [];
  if (months) facts.push([f.joined, num(f.months, months)]);

  if (me.role === "mentor") {
    const [{ count: mentees }, { count: logs }] = await Promise.all([
      db.from("matchings").select("id", { count: "exact", head: true }).eq("mentor_id", me.id),
      db.from("mentoring_logs").select("id", { count: "exact", head: true }).eq("created_by", me.id),
    ]);
    const ways = ((prof.contribution_types as string[] | null) ?? []).map((k) => msg.connect.contribution[k as keyof typeof msg.connect.contribution]).filter(Boolean).join(" · ");
    const biz = [prof.business_name, prof.industry].filter(Boolean).join(" · ");
    if (biz) facts.push([f.business, biz]);
    if (ways) facts.push([f.ways, ways]);
    facts.push([f.mentees, num(f.people, mentees ?? 0)], [f.logs, num(f.times, logs ?? 0)]);
  } else if (me.role === "partner") {
    const [{ count: mentors }, { data: rep }] = await Promise.all([
      db.from("matchings").select("id", { count: "exact", head: true }).eq("partner_id", me.id),
      db.from("self_reports").select("revenue_amount,currency,self_reliance").eq("partner_id", me.id).order("month", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (prof.mission_field) facts.push([f.field, String(prof.mission_field)]);
    if (prof.sending_org) facts.push([f.org, String(prof.sending_org)]);
    if (prof.business_idea) facts.push([f.idea, String(prof.business_idea)]);
    facts.push([f.mentors, num(f.people, mentors ?? 0)]);
    if (rep?.revenue_amount != null) facts.push([f.revenue, fmtMoney(Number(rep.revenue_amount), locale)]);
    if (rep?.self_reliance != null) facts.push([f.reliance, `${rep.self_reliance} / 5`]);
  } else {
    const { data: gifts } = await db.from("donations").select("amount,partner_id").eq("sponsor_id", me.id);
    const list = gifts ?? [];
    const total = list.reduce((s, g) => s + Number(g.amount), 0);
    const partners = new Set(list.map((g) => g.partner_id).filter(Boolean)).size;
    const type = prof.sponsor_type ? msg.apply.options.sponsorType[prof.sponsor_type as "individual" | "church"] : null;
    if (type) facts.push([f.type, type]);
    facts.push([f.total, fmtMoney(total, locale)], [f.partners, num(f.people, partners)], [f.gifts, num(f.times, list.length)]);
  }
  if (me.role !== "sponsor" && stage) facts.splice(1, 0, [f.stage, stage]);

  const showcase = me.email.startsWith("demo.showcase.");
  return (
    <Card title={p.title}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <b className="font-display text-xl">{me.name}</b>
        <span className="rounded-full bg-tint px-3 py-0.5 text-xs font-semibold text-accent">{p.role[me.role]}</span>
      </div>
      {showcase && <p className="mt-3 max-w-3xl leading-relaxed text-ink/80">{p.story[me.role]}</p>}
      <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-soft">{k}</dt>
            <dd className="mt-0.5 font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
