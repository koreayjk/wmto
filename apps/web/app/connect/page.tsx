import Link from "next/link";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { currentMonthKst, fmtDate, fmtDateTime, fmtMonth } from "@/lib/format";
import { mentorStages, partnerStages } from "@/lib/stages";
import { Card, PageTitle, StageBar } from "@/components/connect/ui";

type Ev = { id: string; title: string; start_at: string; meeting_url: string | null };

export default async function ConnectHome() {
  const { me, supabase } = await requireMe();
  const m = getMessages().connect;

  const { data: ev } = await supabase
    .from("events")
    .select("id,title,start_at,meeting_url")
    .gte("start_at", new Date(Date.now() - 2 * 3600_000).toISOString())
    .order("start_at")
    .limit(1);
  const next = (ev?.[0] as Ev | undefined) ?? null;

  const nextCard = (
    <Card title={m.nextEvent}>
      {next ? (
        <>
          <p className="font-serif text-lg font-semibold">{next.title}</p>
          <p className="text-sm text-soft">{fmtDateTime(next.start_at)}</p>
          {next.meeting_url && (
            <a href={next.meeting_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-block bg-clay px-5 py-2.5 text-sm font-medium text-white">
              {m.join}
            </a>
          )}
        </>
      ) : (
        <p className="text-soft">{m.noEvent}</p>
      )}
    </Card>
  );

  let body: React.ReactNode;

  if (me.role === "partner") {
    const [{ data: ms }, { data: rep }] = await Promise.all([
      supabase.from("matchings").select("id,mentor_id,contribution_type").eq("status", "active"),
      supabase.from("self_reports").select("id").eq("partner_id", me.id).eq("month", currentMonthKst()).maybeSingle(),
    ]);
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
                  <span className="font-serif text-lg font-semibold">{nameOf.get(x.mentor_id) ?? "—"}</span>
                  <span className="ml-2 text-sm text-soft">{m.contribution[x.contribution_type as keyof typeof m.contribution]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-soft">{m.noMentor}</p>
          )}
        </Card>
        {nextCard}
        <Card>
          <p className={rep ? "text-soft" : "font-medium"}>{rep ? m.reportDone : m.reportDue}</p>
          {!rep && (
            <Link href="/connect/report" className="mt-4 inline-block bg-clay px-5 py-2.5 text-sm font-medium text-white">
              {m.writeReport}
            </Link>
          )}
        </Card>
      </>
    );
  } else if (me.role === "mentor") {
    const { data: ms } = await supabase.from("matchings").select("id,partner_id,contribution_type").eq("status", "active");
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

    body = (
      <>
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
                    <p className="font-serif text-lg font-semibold">
                      {name.get(x.partner_id) ?? "—"}
                      {st && <span className="ml-2 text-xs font-normal text-clay">{m.stageNames[st]}</span>}
                    </p>
                    <p className="text-sm text-soft">
                      {p?.mission_field ? `${p.mission_field} · ` : ""}
                      {m.contribution[x.contribution_type as keyof typeof m.contribution]}
                    </p>
                    <p className="mt-1 text-sm text-soft">
                      {m.lastMentoring}: {lastLog.get(x.id) ? fmtDate(lastLog.get(x.id)!) : m.noMentoringYet}
                      {" · "}
                      {m.latestReport}: {lastRep.get(x.partner_id) ? fmtMonth(lastRep.get(x.partner_id)!) : m.noReportYet}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-soft">{m.noMentees}</p>
          )}
        </Card>
        {nextCard}
      </>
    );
  } else {
    body = (
      <>
        <Card><p className="text-soft">{m.sponsorHome}</p></Card>
        {nextCard}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle>{me.name}{m.greeting}</PageTitle>
      {body}
    </div>
  );
}
