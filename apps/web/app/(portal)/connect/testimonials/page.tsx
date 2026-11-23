import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

async function write(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const { error } = await r.supabase.rpc("write_testimonial", { p_subject: String(fd.get("subject")), p_body: String(fd.get("body") ?? "") });
  revalidatePath("/connect/testimonials");
  redirect(`/connect/testimonials?${error ? "error=1" : "saved=1"}`);
}
async function decide(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("decide_testimonial", { p_id: String(fd.get("id")), p_publish: fd.get("publish") === "1" });
  revalidatePath("/connect/testimonials");
}
async function ask(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const { error } = await r.supabase.rpc("request_testimonial", { p_from: String(fd.get("from")) });
  redirect(`/connect/testimonials?${error ? "error=1" : "asked=1"}`);
}

type T = { id: string; author_id: string; subject_id: string; body: string; status: "pending" | "published" | "hidden"; created_at: string };

export default async function Testimonials({ searchParams }: { searchParams: Promise<{ saved?: string; asked?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase, viewAs } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.testimonials;
  const { saved, asked, error } = await searchParams;
  const [{ data: mine }, { data: cand }, { data: tent }, { data: peers }] = await Promise.all([
    supabase.from("testimonials").select("id,author_id,subject_id,body,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.rpc("testimonial_candidates"),
    supabase.rpc("tent_testimonials"),
    supabase.rpc("chapter_peers"),
  ]);
  const all = (mine ?? []) as T[];
  const received = all.filter((x) => x.subject_id === me.id);
  const written = all.filter((x) => x.author_id === me.id);
  const candidates = (cand ?? []) as { id: string; name: string; written: boolean }[];
  const names = new Map<string, string>([...((peers ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name] as [string, string]), ...candidates.map((c) => [c.id, c.name] as [string, string])]);
  const nm = (id: string) => names.get(id) ?? "-";
  const tentRows = (tent ?? []) as { id: string; subject_name: string; author_name: string; body: string; created_at: string }[];
  const label = { pending: t.waiting, published: t.published, hidden: t.hidden } as const;

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Testimonials" sub={t.sub}>{t.title}</PageTitle>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.saved}</p>}
      {asked && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.asked}</p>}
      {error && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{t.error}</p>}

      <Card title={`${t.received} · ${received.length}`}>
        {received.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {received.map((x) => (
              <li key={x.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-xs text-soft">{t.from} {nm(x.author_id)} · {fmtDate(x.created_at, locale)} · <b className={x.status === "published" ? "text-accent" : ""}>{x.status === "pending" ? t.pending : label[x.status]}</b></p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed">{x.body}</p>
                {!viewAs && x.status !== "published" && <form action={decide} className="mt-3 flex gap-2"><input type="hidden" name="id" value={x.id} /><button name="publish" value="1" className="cbtn cbtn-sm">{t.publish}</button>{x.status === "pending" && <button name="publish" value="0" className="cbtn cbtn-quiet cbtn-sm">{t.hide}</button>}</form>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t.write}>
          {candidates.length === 0 ? <p className="text-sm text-soft">{t.noCandidates}</p> : (
            <form action={write} className="space-y-4">
              <label className="block"><span className={labelCls}>{t.pick}</span>
                <select name="subject" required defaultValue="" className="field"><option value="" disabled>-</option>{candidates.map((c) => <option key={c.id} value={c.id} disabled={c.written}>{c.name}{c.written ? ` (${t.alreadyWrote})` : ""}</option>)}</select></label>
              <label className="block"><span className={labelCls}>{t.body}</span><textarea name="body" required minLength={10} maxLength={1500} rows={5} placeholder={t.bodyHint} className="field" /></label>
              <button className="cbtn w-full">{t.send}</button>
            </form>
          )}
        </Card>
        <Card title={t.ask}>
          {candidates.length === 0 ? <p className="text-sm text-soft">{t.noCandidates}</p> : (
            <form action={ask} className="space-y-4">
              <label className="block"><span className={labelCls}>{t.askPick}</span>
                <select name="from" required defaultValue="" className="field"><option value="" disabled>-</option>{candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <button className="cbtn cbtn-quiet w-full">{t.askSend}</button>
            </form>
          )}
        </Card>
      </div>

      <Card title={`${t.written} · ${written.length}`}>
        {written.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {written.map((x) => <li key={x.id} className="py-3.5 first:pt-0 last:pb-0"><p className="text-xs text-soft">{t.to} {nm(x.subject_id)} · {label[x.status]}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{x.body}</p></li>)}
          </ul>
        )}
      </Card>

      <Card title={`${t.tent} · ${tentRows.length}`}>
        {tentRows.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {tentRows.map((x) => <li key={x.id} className="py-3.5 first:pt-0 last:pb-0"><p className="text-xs text-soft"><b className="font-medium text-ink">{x.subject_name}</b> · {t.from} {x.author_name} · {fmtDate(x.created_at, locale)}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{x.body}</p></li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}
