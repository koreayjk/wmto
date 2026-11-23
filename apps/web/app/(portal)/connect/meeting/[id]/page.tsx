import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const KEYS = ["welcome", "word", "newcomers", "featured", "sharing", "requests", "prayer"] as const;
const DEFAULT_MIN: Record<(typeof KEYS)[number], number> = { welcome: 10, word: 10, newcomers: 10, featured: 20, sharing: 15, requests: 10, prayer: 10 };
type Item = { key: (typeof KEYS)[number]; minutes: number; owner: string | null };

async function save(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const id = String(fd.get("id"));
  const agenda: Item[] = KEYS.map((k) => ({ key: k, minutes: Math.min(120, Math.max(0, Math.round(Number(fd.get(`m_${k}`)) || 0))), owner: /^[0-9a-f-]{36}$/i.test(String(fd.get(`o_${k}`) ?? "")) ? String(fd.get(`o_${k}`)) : null }));
  const feat = String(fd.get("featured") ?? "");
  const { error } = await r.supabase.rpc("save_meeting_plan", { p_event: id, p_agenda: agenda, p_featured: /^[0-9a-f-]{36}$/i.test(feat) ? feat : null, p_topic: String(fd.get("topic") ?? "") });
  revalidatePath(`/connect/meeting/${id}`);
  redirect(`/connect/meeting/${id}?${error ? "error=1" : "saved=1"}`);
}

async function postRecap(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo || r.me.role !== "mentor") return;
  const chapter = String(fd.get("chapter"));
  await r.supabase.from("tent_posts").insert({ chapter_id: chapter, author_id: r.me.id, kind: "recap", title: String(fd.get("title") ?? "").slice(0, 120), body: String(fd.get("body") ?? "").slice(0, 4000) });
  revalidatePath("/connect/tent");
  redirect(`/connect/meeting/${String(fd.get("id"))}?posted=1`);
}

type Plan = { event: { id: string; title: string; start_at: string; chapter_id: string | null }; agenda: Item[]; featured_member: string | null; featured_name: string | null; featured_topic: string | null; can_edit: boolean; has_plan: boolean };

export default async function Meeting({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string; posted?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase, viewAs } = await requireMe();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = getMessages(locale).connect.meeting;
  const { saved, error, posted } = await searchParams;
  const { data } = await supabase.rpc("get_meeting_plan", { p_event: id });
  const plan = data as Plan | null;
  if (!plan) return <div className="space-y-6"><PageTitle eyebrow="Plan">{t.title}</PageTitle><p className="text-soft">{t.noAccess}</p><Link href="/connect/events" className="text-sm underline">{t.back}</Link></div>;

  const chapter = plan.event.chapter_id!;
  const [{ data: peers }, { data: sugg }, { data: recapData }] = await Promise.all([
    supabase.rpc("chapter_peers"),
    plan.can_edit ? supabase.rpc("suggest_featured", { p_chapter: chapter }) : Promise.resolve({ data: [] }),
    supabase.rpc("meeting_recap", { p_event: id }),
  ]);
  const people = ((peers ?? []) as { id: string; name: string }[]);
  const nameOf = new Map(people.map((p) => [p.id, p.name]));
  const suggestions = ((sugg ?? []) as { member_id: string; name: string; last_at: string | null }[]);
  const recap = recapData as { members: number; attended: number; absence_notices: number; signups: number; guests: number } | null;
  const items: Item[] = KEYS.map((k) => plan.agenda.find((a) => a.key === k) ?? { key: k, minutes: plan.has_plan ? 0 : DEFAULT_MIN[k], owner: null });
  const total = items.reduce((a, i) => a + i.minutes, 0);
  const editable = plan.can_edit && !viewAs;
  const past = new Date(plan.event.start_at).getTime() < Date.now();
  const featured = plan.featured_name ?? t.featured.none;

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Plan" sub={`${plan.event.title} · ${fmtDateTime(plan.event.start_at, locale)}`}>{t.title}</PageTitle>
      <Link href="/connect/events" className="text-sm underline">{t.back}</Link>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.edit.saved}</p>}
      {posted && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.recap.posted}</p>}
      {error && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{t.edit.error}</p>}

      <Card title={`${t.title} · ${t.total.replace("{n}", String(total))}`}>
        {!plan.has_plan && !editable ? <p className="text-soft">{t.none}</p> : (
          <ol className="divide-y divide-black/[0.06]">
            {items.filter((i) => i.minutes > 0).map((i, n) => (
              <li key={i.key} className="flex flex-wrap items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex gap-3"><span className="gilt tabular-nums">{n + 1}</span><span className="font-medium">{t.sections[i.key]}{i.key === "featured" && plan.featured_member ? <span className="ml-2 font-normal text-soft">{featured}{plan.featured_topic ? ` · ${plan.featured_topic}` : ""}</span> : null}</span></span>
                <span className="text-sm text-soft">{i.owner ? `${t.owner} ${nameOf.get(i.owner) ?? "-"} · ` : ""}{i.minutes}{t.minutes}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {editable && (
        <Card title={t.edit.title}>
          <form action={save} className="space-y-5">
            <input type="hidden" name="id" value={id} />
            <p className="text-sm text-soft">{t.edit.hint}</p>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.key} className="grid items-center gap-3 sm:grid-cols-[1fr_6rem_12rem]">
                  <span className="text-sm font-medium">{t.sections[i.key]}</span>
                  <input name={`m_${i.key}`} type="number" min={0} max={120} defaultValue={i.minutes || (plan.has_plan ? 0 : DEFAULT_MIN[i.key])} aria-label={t.minutes} className="field" />
                  <select name={`o_${i.key}`} defaultValue={i.owner ?? ""} aria-label={t.owner} className="field"><option value="">-</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className={labelCls}>{t.featured.title}</span>
                <select name="featured" defaultValue={plan.featured_member ?? ""} className="field"><option value="">{t.featured.none}</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className="block"><span className={labelCls}>{t.featured.topic}</span><input name="topic" maxLength={200} defaultValue={plan.featured_topic ?? ""} className="field" /></label>
            </div>
            {suggestions.length > 0 && (
              <p className="text-xs text-soft"><b className="font-medium">{t.featured.suggest}</b> {suggestions.slice(0, 5).map((s) => `${s.name} (${s.last_at ? t.featured.last.replace("{d}", fmtDate(s.last_at, locale)) : t.featured.never})`).join(" · ")}</p>
            )}
            <button className="cbtn">{t.edit.save}</button>
          </form>
        </Card>
      )}

      {recap && past && (
        <Card title={t.recap.title}>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-5">
            {([[t.recap.members, recap.members], [t.recap.attended, recap.attended], [t.recap.notices, recap.absence_notices], [t.recap.signups, recap.signups], [t.recap.guests, recap.guests]] as const).map(([k, v]) => (
              <li key={k}><p className="text-[13px] text-soft">{k}</p><p className="mt-1 text-[1.8rem] font-light leading-none tabular-nums">{v}</p></li>
            ))}
          </ul>
          {me.role === "mentor" && !viewAs && (
            <form action={postRecap} className="mt-6">
              <input type="hidden" name="id" value={id} /><input type="hidden" name="chapter" value={chapter} />
              <input type="hidden" name="title" value={t.recap.postTitle.replace("{t}", plan.event.title)} />
              <input type="hidden" name="body" value={t.recap.postBody.replace("{a}", String(recap.attended)).replace("{g}", String(recap.guests)).replace("{n}", String(recap.absence_notices)).replace("{f}", featured)} />
              <button className="cbtn cbtn-quiet">{t.recap.post}</button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
