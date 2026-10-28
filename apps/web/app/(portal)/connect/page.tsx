import Link from "next/link";
import { requireMe } from "@/lib/me";
import { fill, getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { currentMonthKst, fmtDate, fmtDateTime, fmtMonth } from "@/lib/format";
import { mentorStages, partnerStages } from "@/lib/stages";
import { Card, PageTitle, StageBar } from "@/components/connect/ui";
import { ActivityChart } from "@/components/connect/ActivityChart";
import { catsFor, monthlyActivity } from "@/lib/activity";

type Ev = { id: string; title: string; start_at: string; meeting_url: string | null };

export default async function ConnectHome() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const m = getMessages(locale).connect;

  const { data: ev } = await supabase
    .from("events")
    .select("id,title,start_at,meeting_url")
    .gte("start_at", new Date(Date.now() - 2 * 3600_000).toISOString())
    .order("start_at")
    .limit(3);
  const upcoming = (ev ?? []) as Ev[];
  const next = upcoming[0] ?? null;

  const d = m.dash;
  const nextCard = (
    <Card title={d.upcoming}>
      {upcoming.length ? (
        <ul className="divide-y divide-line">
          {upcoming.map((e, i) => (
            <li key={e.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <span>
                <span className="block font-display text-base font-semibold">{e.title}</span>
                <span className="text-sm text-soft">{fmtDateTime(e.start_at, locale)}</span>
              </span>
              {i === 0 && e.meeting_url && (
                <a href={e.meeting_url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 bg-clay px-4 py-2 text-sm font-medium text-white rounded-lg">
                  {m.join}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-soft">{m.noEvent}</p>
      )}
      <Link href="/connect/events" className="mt-4 inline-block text-sm font-medium text-clay underline">{d.seeAll}</Link>
    </Card>
  );

  const eventSoon = !!next && new Date(next.start_at).getTime() - Date.now() < 24 * 3600_000;
  type Today = { text: string; cta?: string; href?: string };
  const t = m.today;
  let today: Today = { text: t.rest };
  let body: React.ReactNode;

  if (me.role === "partner") {
    const [{ data: ms }, { data: rep }] = await Promise.all([
      supabase.from("matchings").select("id,mentor_id,contribution_type").eq("status", "active"),
      supabase.from("self_reports").select("id").eq("partner_id", me.id).eq("month", currentMonthKst()).maybeSingle(),
    ]);
    today = !rep
      ? { text: t.report, cta: t.reportCta, href: "/connect/report" }
      : eventSoon
        ? { text: t.event, cta: t.eventCta, href: "/connect/events" }
        : { text: t.thanks, cta: t.thanksCta, href: "/connect/thanks" };
    const ids = (ms ?? []).map((x) => x.mentor_id);
    const { data: mentors } = ids.length ? await supabase.from("members").select("id,name").in("id", ids) : { data: [] };
    const nameOf = new Map((mentors ?? []).map((x) => [x.id, x.name]));
    body = (
      <>
        <Card title={m.stageTitle}>
          <StageBar stages={partnerStages} current={me.stage} names={m.stageNames} desc={m.stageDesc} />
        </Card>
        <Card title={m.myMentor}>
          {(ms ?? []).length ? (
            <ul className="space-y-2">
              {ms!.map((x) => (
                <li key={x.id}>
                  <span className="font-display text-lg font-semibold">{nameOf.get(x.mentor_id) ?? "-"}</span>
                  <span className="ml-2 text-sm text-soft">{m.contribution[x.contribution_type as keyof typeof m.contribution]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-soft">{m.noMentor}</p>
          )}
        </Card>
        {nextCard}
      </>
    );
  } else if (me.role === "mentor") {
    const [{ data: ms }, { data: openReqs }, { count: unread }] = await Promise.all([
      supabase.from("matchings").select("id,partner_id,contribution_type").eq("status", "active"),
      supabase.rpc("open_matching_requests"),
      supabase.from("thanks_letters").select("id", { count: "exact", head: true }).eq("recipient_id", me.id).is("read_at", null),
    ]);
    const reqCount = (openReqs as unknown[] | null)?.length ?? 0;
    const partnerIds = (ms ?? []).map((x) => x.partner_id);
    const matchingIds = (ms ?? []).map((x) => x.id);
    const [{ data: people }, { data: profs }, { data: reps }, { data: logs }] = partnerIds.length
      ? await Promise.all([
          supabase.from("members").select("id,name").in("id", partnerIds),
          supabase.from("partner_profiles").select("member_id,stage,mission_field").in("member_id", partnerIds),
          supabase.from("self_reports").select("partner_id,month").in("partner_id", partnerIds).order("month", { ascending: false }),
          supabase.from("mentoring_logs").select("matching_id,held_at").in("matching_id", matchingIds).order("held_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
    const name = new Map((people ?? []).map((x) => [x.id, x.name]));
    const prof = new Map((profs ?? []).map((x) => [x.member_id, x]));
    const lastRep = new Map<string, string>();
    (reps ?? []).forEach((r) => { if (!lastRep.has(r.partner_id)) lastRep.set(r.partner_id, r.month); });
    const lastLog = new Map<string, string>();
    (logs ?? []).forEach((l) => { if (!lastLog.has(l.matching_id)) lastLog.set(l.matching_id, l.held_at); });

    const monthAgo = Date.now() - 30 * 24 * 3600_000;
    const staleMentoring = (ms ?? []).some((x) => { const l = lastLog.get(x.id); return !l || new Date(l).getTime() < monthAgo; });
    today = reqCount > 0
      ? { text: t.requests, cta: t.requestsCta, href: "/connect/matching" }
      : (unread ?? 0) > 0
        ? { text: t.unread, cta: t.unreadCta, href: "/connect/thanks" }
        : staleMentoring
          ? { text: t.mentoring, cta: t.mentoringCta, href: "/connect/mentoring" }
          : eventSoon
            ? { text: t.event, cta: t.eventCta, href: "/connect/events" }
            : { text: t.rest };
    body = (
      <>
        {(reqCount > 0 || (unread ?? 0) > 0) && (
          <Card>
            <ul className="space-y-2">
              {reqCount > 0 && <li><Link href="/connect/matching" className="font-medium text-clay underline">{fill(m.pending.requestsLine, reqCount)}</Link></li>}
              {(unread ?? 0) > 0 && <li><Link href="/connect/thanks" className="font-medium text-clay underline">{fill(m.pending.unreadLine, unread ?? 0)}</Link></li>}
            </ul>
          </Card>
        )}
        <Card title={m.stageTitle}>
          <StageBar stages={mentorStages} current={me.stage} names={m.stageNames} desc={m.stageDesc} />
        </Card>
        <Card title={m.myMentees}>
          {(ms ?? []).length ? (
            <ul className="divide-y divide-line">
              {ms!.map((x) => {
                const p = prof.get(x.partner_id);
                const st = p?.stage as keyof typeof m.stageNames | undefined;
                return (
                  <li key={x.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-display text-lg font-semibold">
                      {name.get(x.partner_id) ?? "-"}
                      {st && <span className="ml-2 text-xs font-normal text-clay">{m.stageNames[st]}</span>}
                    </p>
                    <p className="text-sm text-soft">
                      {p?.mission_field ? `${p.mission_field} · ` : ""}
                      {m.contribution[x.contribution_type as keyof typeof m.contribution]}
                    </p>
                    <p className="mt-1 text-sm text-soft">
                      {m.lastMentoring}: {lastLog.get(x.id) ? fmtDate(lastLog.get(x.id)!, locale) : m.noMentoringYet}
                      {" · "}
                      {m.latestReport}: {lastRep.get(x.partner_id) ? fmtMonth(lastRep.get(x.partner_id)!, locale) : m.noReportYet}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-soft">{m.noMentees}</p>
          )}
        </Card>
      </>
    );
  } else {
    if (eventSoon) today = { text: t.event, cta: t.eventCta, href: "/connect/events" };
    body = (
      <>
        <Card><p className="text-soft">{m.sponsorHome}</p></Card>
      </>
    );
  }

  // 이번 달 숫자와 최근 6개월 그래프 (사업가·선교사)
  const showActivity = me.role === "mentor" || me.role === "partner";
  const rows = showActivity ? await monthlyActivity(supabase, me, 6) : [];
  const thisMonth = rows[rows.length - 1];
  const cats = catsFor(me.role);
  const g = m.growth;
  const statHref: Record<string, string> = {
    attendance: "/connect/events", mentoring: "/connect/mentoring", reports: "/connect/report", referrals: "/connect/referrals", letters: "/connect/thanks",
  };

  // 프로필에서 아직 비어 있는 항목
  const p = (me.profile ?? {}) as Record<string, unknown>;
  const wanted: Record<string, string[]> = {
    mentor: ["business_name", "industry", "contribution_types"],
    partner: ["mission_field", "sending_org", "business_idea"],
    sponsor: ["sponsor_type", "church_name"],
  };
  const empty = (v: unknown) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
  const missing: string[] = [];
  if (!me.phone) missing.push("phone");
  if (!me.country) missing.push("country");
  (me.role ? wanted[me.role] : []).forEach((k) => { if (empty(p[k])) missing.push(k); });

  const shortcuts: { href: string; label: string }[] =
    me.role === "partner"
      ? [{ href: "/connect/report", label: d.sc.report }, { href: "/connect/mentoring", label: d.sc.mentoring }, { href: "/connect/growth", label: d.sc.growth }]
      : me.role === "mentor"
        ? [{ href: "/connect/mentoring", label: d.sc.mentoring }, { href: "/connect/referrals", label: d.sc.referral }, { href: "/connect/growth", label: d.sc.growth }]
        : [{ href: "/connect/academy", label: d.sc.academy }, { href: "/connect/events", label: m.nav.events }];

  return (
    <div className="space-y-4">
      <PageTitle>{me.name}{m.greeting}</PageTitle>
      <Card title={t.title} className="border-accent/30 bg-tint">
        <p className="text-lg font-medium">{today.text}</p>
        {today.href && (
          <Link href={today.href} className="mt-4 inline-block bg-clay px-5 py-2.5 text-sm font-medium text-white rounded-lg">
            {today.cta}
          </Link>
        )}
      </Card>

      {showActivity && thisMonth && (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card title={d.chartTitle} className="lg:col-span-3">
            <ActivityChart rows={rows} locale={locale} unit={d.chartUnit} aria={d.chartAria} />
            <p className="mt-4 text-xs text-soft">{d.chartNote}</p>
          </Card>
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {cats.map((c) => (
              <Link key={c} href={statHref[c]} className="rounded-2xl border border-line bg-white p-5 transition-colors hover:border-accent/40">
                <p className="text-xs text-soft">{g.labels[c]}</p>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{thisMonth.counts[c]}</p>
                <p className="mt-1 text-xs text-clay">{d.statsTitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">{body}</div>
        <div className="space-y-4">
          {nextCard}
          {missing.length > 0 && (
            <Card title={d.profileTitle}>
              <p className="text-sm text-soft">{d.profileHint}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {missing.map((k) => (
                  <li key={k} className="rounded-full bg-tint px-3 py-1 text-sm text-accent">{d.profileFields[k as keyof typeof d.profileFields]}</li>
                ))}
              </ul>
              <Link href="/connect/profile" className="mt-4 inline-block text-sm font-medium text-clay underline">{d.profileCta}</Link>
            </Card>
          )}
          <Card title={d.shortcuts}>
            <ul className="divide-y divide-line">
              {shortcuts.map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="font-medium">{x.label}</span>
                    <span aria-hidden className="text-clay">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
