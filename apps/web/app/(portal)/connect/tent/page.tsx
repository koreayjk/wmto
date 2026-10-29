import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

type Tent = { id: string; name: string; region: string | null; via: "own" | "mentor" };
type Person = {
  id: string; name: string; role: "mentor" | "partner" | "sponsor"; country: string | null; joined_at: string;
  industry: string | null; business_name: string | null; contribution_types: string[] | null;
  mission_field: string | null; business_idea: string | null; stage: string | null; via: "own" | "mentor"; mentee_count: number;
};
type Ev = { id: string; type: string; title: string; start_at: string; location: string | null; meeting_url: string | null; attended: number; me_attended: boolean };
type Post = { id: string; kind: "notice" | "recap"; title: string; body: string; created_at: string; author: string | null };
type Overview = { tent: { id: string; name: string; region: string | null }; members: Person[]; events: Ev[]; posts: Post[]; activity: { matchings: number; logs_30d: number } };

async function addPost(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const chapter = String(fd.get("chapter_id") ?? "");
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  const body = String(fd.get("body") ?? "").trim().slice(0, 4000);
  const kind = fd.get("kind") === "recap" ? "recap" : "notice";
  if (me.role !== "mentor" || !chapter || !title || !body) return;
  await supabase.from("tent_posts").insert({ chapter_id: chapter, author_id: me.id, kind, title, body });
  revalidatePath("/connect/tent");
}

async function pickup(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") return;
  const { error } = await supabase.rpc("accept_matching_request", { p_request: String(fd.get("id")) });
  revalidatePath("/connect/tent");
  if (!error) redirect("/connect/mentoring");
}

export default async function TentPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const m = getMessages(locale).connect;
  const t = m.tent;
  const { t: want } = await searchParams;

  const { data: mine } = await supabase.rpc("my_tents");
  const tents = (mine ?? []) as Tent[];
  if (tents.length === 0) {
    return (
      <div className="space-y-4">
        <PageTitle sub={t.sub}>{t.title}</PageTitle>
        <Card><p className="leading-relaxed text-soft">{t.noTent}</p></Card>
      </div>
    );
  }
  const cur = tents.find((x) => x.id === want) ?? tents[0];
  const [{ data: ov }, pk] = await Promise.all([
    supabase.rpc("tent_overview", { p_chapter: cur.id }),
    me.role === "mentor" ? supabase.rpc("open_matching_requests") : Promise.resolve({ data: [] }),
  ]);
  const o = ov as Overview | null;
  if (!o) redirect("/connect");
  const waiting = (pk.data ?? []) as { id: string; partner_name: string; mission_field: string | null; contribution_type: keyof typeof m.contribution; message: string | null; created_at: string }[];

  const by = (r: Person["role"]) => o.members.filter((p) => p.role === r);
  const mentors = by("mentor"), partners = by("partner"), sponsors = by("sponsor");
  const now = Date.now();
  const upcoming = o.events.filter((e) => new Date(e.start_at).getTime() >= now - 2 * 3600_000).reverse();
  const past = o.events.filter((e) => new Date(e.start_at).getTime() < now - 2 * 3600_000);
  const next = upcoming[0];
  const stage = (s: string | null) => (s ? m.stageNames[s as keyof typeof m.stageNames] ?? s : null);
  const stats: [string, number][] = [
    [t.stats.members, o.members.length], [t.stats.mentors, mentors.length], [t.stats.partners, partners.length],
    [t.stats.accompany, o.activity.matchings], [t.stats.logs, o.activity.logs_30d],
  ];

  const personCard = (p: Person) => {
    const ways = (p.contribution_types ?? []).map((k) => m.contribution[k as keyof typeof m.contribution]).filter(Boolean).join(" · ");
    return (
      <li key={p.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
        <span className="flex items-center justify-between gap-2">
          <b className="font-display">{p.name}</b>
          {stage(p.stage) && <span className="rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-accent">{stage(p.stage)}</span>}
        </span>
        {p.role === "mentor" && (
          <>
            <span className="mt-0.5 block text-sm">{[p.business_name, p.industry].filter(Boolean).join(" · ")}</span>
            <span className="mt-1 block text-xs text-soft">{ways}{ways ? " · " : ""}{t.mentees.replace("{n}", String(p.mentee_count))}</span>
          </>
        )}
        {p.role === "partner" && (
          <>
            <span className="mt-0.5 block text-sm">{p.mission_field ?? p.country}</span>
            {p.business_idea && <span className="mt-1 block text-xs text-soft">{p.business_idea}</span>}
            {p.via === "mentor" && <span className="mt-1 block text-xs text-clay">{t.via}</span>}
          </>
        )}
        {p.role === "sponsor" && p.country && <span className="mt-0.5 block text-sm text-soft">{p.country}</span>}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <PageTitle sub={t.sub}>{o.tent.name}</PageTitle>

      {tents.length > 1 && (
        <nav className="col-span-full flex flex-wrap gap-2" aria-label={t.mine}>
          {tents.map((x) => (
            <Link key={x.id} href={`/connect/tent?t=${x.id}`} aria-current={x.id === cur.id ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm ${x.id === cur.id ? "bg-ink text-white" : "bg-white ring-1 ring-black/10"}`}>
              {x.name} <span className="opacity-60">· {x.via === "own" ? t.viaOwn : t.viaMentor}</span>
            </Link>
          ))}
        </nav>
      )}
      {me.role === "partner" && <p className="col-span-full max-w-3xl rounded-2xl bg-tint px-5 py-4 text-sm leading-relaxed text-ink/80">{t.partnerNote}</p>}

      <div className="col-span-full grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="cbezel c-rise"><div className="cbezel-in p-5">
            <p className="text-[13px] text-soft">{k}</p>
            <p className="font-display text-[2.2rem] font-light leading-none tabular-nums">{v}</p>
          </div></div>
        ))}
      </div>

      <Card title={t.next}>
        {next ? (
          <>
            <p className="font-display text-lg font-semibold">{next.title}</p>
            <p className="text-sm text-soft">{fmtDateTime(next.start_at, locale)}{next.location ? ` · ${next.location}` : ""}</p>
            {next.meeting_url && <a href={next.meeting_url} target="_blank" rel="noopener noreferrer" className="cbtn cbtn-sm mt-4 inline-flex">{t.join}</a>}
            {upcoming.length > 1 && (
              <ul className="mt-4 divide-y divide-black/[0.06] text-sm">
                {upcoming.slice(1, 4).map((e) => <li key={e.id} className="flex justify-between gap-3 py-2"><span>{e.title}</span><span className="text-soft">{fmtDate(e.start_at, locale)}</span></li>)}
              </ul>
            )}
          </>
        ) : <p className="text-soft">{t.noNext}</p>}
      </Card>

      <Card title={t.past}>
        {past.length === 0 ? <p className="text-soft">{t.noNext}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {past.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span><span className="block font-medium">{e.title}</span><span className="text-xs text-soft">{fmtDate(e.start_at, locale)}{e.me_attended ? ` · ✓ ${t.meAttended}` : ""}</span></span>
                <span className="shrink-0 text-sm text-soft">{t.attended.replace("{n}", String(e.attended))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={t.posts} className="lg:col-span-2">
        {o.posts.length === 0 ? <p className="text-soft">{t.noPosts}</p> : (
          <ul className="space-y-5">
            {o.posts.map((p) => (
              <li key={p.id}>
                <p className="flex flex-wrap items-center gap-2 text-xs text-clay">
                  <span className="rounded-full bg-tint px-2 py-0.5 font-semibold text-accent">{t[p.kind]}</span>
                  {fmtDate(p.created_at, locale)}{p.author ? ` · ${p.author}` : ""}
                </p>
                <p className="mt-1 font-display text-lg font-semibold">{p.title}</p>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-ink/80">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
        {me.role === "mentor" && (
          <form action={addPost} className="mt-6 space-y-3 border-t border-black/[0.06] pt-5">
            <input type="hidden" name="chapter_id" value={cur.id} />
            <p className="text-sm font-medium">{t.write}</p>
            <select name="kind" className="field !w-auto !py-1.5 !text-sm" aria-label={t.postKind}><option value="notice">{t.notice}</option><option value="recap">{t.recap}</option></select>
            <label className="block"><span className={labelCls}>{t.postTitle}</span><input name="title" required maxLength={120} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.postBody}</span><textarea name="body" required rows={3} maxLength={4000} className="field" /></label>
            <button className="cbtn cbtn-sm">{t.post}</button>
          </form>
        )}
      </Card>

      {me.role === "mentor" && (
        <Card title={t.pickup} className="lg:col-span-full">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-soft">{t.pickupSub}</p>
          {waiting.length === 0 ? <p className="text-soft">{t.pickupEmpty}</p> : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {waiting.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
                  <p className="text-xs text-clay">{m.contribution[r.contribution_type]} · {fmtDate(r.created_at, locale)}</p>
                  <p className="mt-1 font-display font-semibold">{r.partner_name}{r.mission_field && <span className="ml-2 text-sm font-normal text-soft">{r.mission_field}</span>}</p>
                  {r.message && <p className="mt-1 text-sm leading-relaxed text-soft">{r.message}</p>}
                  <form action={pickup} className="mt-3">
                    <input type="hidden" name="id" value={r.id} />
                    <button className="cbtn cbtn-sm">{t.pickupBtn}</button>
                    <p className="mt-2 text-xs text-soft">{t.pickupHint}</p>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Card title={`${t.people} · ${o.members.length}`} className="lg:col-span-full">
        <div className="space-y-6">
          {([["mentor", mentors], ["partner", partners], ["sponsor", sponsors]] as const).map(([role, list]) => list.length > 0 && (
            <section key={role}>
              <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold">{t.roles[role]}<span className="text-xs font-normal text-soft">{list.length}</span></h3>
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{list.map(personCard)}</ul>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
