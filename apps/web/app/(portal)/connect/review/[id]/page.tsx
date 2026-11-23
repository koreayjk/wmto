import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const SECTIONS = ["meeting", "newcomers", "visitors", "referrals", "care", "renewals", "prayer"] as const;
type Action = { text: string; done: boolean; carried?: boolean };

async function save(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const id = String(fd.get("id"));
  const notes: Record<string, string> = {};
  for (const k of SECTIONS) notes[k] = String(fd.get(`n_${k}`) ?? "").slice(0, 4000);
  const actions: Action[] = [];
  for (let i = 0; i < 40; i++) {
    const text = String(fd.get(`a_text_${i}`) ?? "").trim().slice(0, 300);
    if (!text) continue;
    actions.push({ text, done: fd.get(`a_done_${i}`) === "on", ...(fd.get(`a_carried_${i}`) === "1" ? { carried: true } : {}) });
  }
  const held = String(fd.get("held_on") ?? "");
  const taker = String(fd.get("note_taker") ?? "");
  const { error } = await r.supabase.rpc("save_tent_review", {
    p_id: id, p_held_on: /^\d{4}-\d{2}-\d{2}$/.test(held) ? held : null, p_note_taker: /^[0-9a-f-]{36}$/i.test(taker) ? taker : null, p_notes: notes, p_actions: actions,
  });
  if (!error && fd.get("submit") === "1") {
    const { error: e2 } = await r.supabase.rpc("submit_tent_review", { p_id: id });
    revalidatePath(`/connect/review/${id}`);
    redirect(`/connect/review/${id}?${e2 ? "error=need" : "submitted=1"}`);
  }
  revalidatePath(`/connect/review/${id}`);
  redirect(`/connect/review/${id}?${error ? "error=generic" : "saved=1"}`);
}

type Snap = {
  size?: number; attendance_rate?: number | null; referrals_per_member_week?: number | null; one_to_one_per_member_week?: number | null;
  visitors_invited?: number; visitors_joined?: number; renewal_due?: number; levels?: Record<string, number>; taken_at?: string;
};

export default async function ReviewEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; submitted?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { supabase, viewAs } = await requireMe();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = getMessages(locale).connect.review;
  const lv = getMessages(locale).connect.dashboard.levels;
  const { saved, submitted, error } = await searchParams;
  const { data: r } = await supabase.from("tent_reviews").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const { data: peers } = await supabase.rpc("chapter_peers");
  const people = ((peers ?? []) as { id: string; name: string }[]);
  const snap = (r.snapshot ?? {}) as Snap;
  const notes = (r.notes ?? {}) as Record<string, string>;
  const actions = (r.actions ?? []) as Action[];
  const locked = r.status === "submitted" || !!viewAs;
  const pct = (v: number | null | undefined) => (v == null ? "-" : `${Math.round(v * 100)}%`);
  const num = (v: number | null | undefined) => (v == null ? "-" : String(v));
  const rows = [...actions, ...Array.from({ length: locked ? 0 : 3 }, () => ({ text: "", done: false } as Action))];

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Review" sub={`${t.month} ${String(r.month).slice(0, 7)} · ${t.status[r.status as "draft" | "submitted"]}`}>{t.title}</PageTitle>
      <Link href={`/connect/review?chapter=${r.chapter_id}`} className="text-sm underline">{t.back}</Link>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.saved}</p>}
      {submitted && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.submitted}</p>}
      {error && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{error === "need" ? t.needSubmit : t.errors.generic}</p>}

      <Card title={t.snapshot.title}>
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {[[t.snapshot.size, snap.size], [t.snapshot.attendance, pct(snap.attendance_rate)], [t.snapshot.referrals, num(snap.referrals_per_member_week)], [t.snapshot.oneToOne, num(snap.one_to_one_per_member_week)],
            [t.snapshot.visitors, `${snap.visitors_invited ?? 0} (${t.snapshot.joined} ${snap.visitors_joined ?? 0})`], [t.snapshot.renewalDue, snap.renewal_due ?? 0],
            [t.snapshot.levels, (["peg", "pole", "canvas", "lantern"] as const).map((k) => `${lv[k]} ${snap.levels?.[k] ?? 0}`).join(" · ")]].map(([k, v]) => (
            <li key={String(k)}><p className="text-[13px] text-soft">{k}</p><p className="mt-1 text-lg tabular-nums">{String(v ?? "-")}</p></li>
          ))}
        </ul>
      </Card>

      <form action={save} className="space-y-6">
        <input type="hidden" name="id" value={id} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>{t.heldOn}</span><input name="held_on" type="date" defaultValue={r.held_on ?? ""} disabled={locked} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.noteTaker}</span>
              <select name="note_taker" defaultValue={r.note_taker ?? ""} disabled={locked} className="field">
                <option value="">{t.pick}</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></label>
          </div>
        </Card>

        <Card title={t.sections.title}>
          <div className="space-y-5">
            {SECTIONS.map((k) => (
              <label key={k} className="block"><span className={labelCls}>{t.sections[k]}</span>
                <textarea name={`n_${k}`} rows={3} maxLength={4000} defaultValue={notes[k] ?? ""} disabled={locked} className="field" /></label>
            ))}
          </div>
        </Card>

        <Card title={t.actions.title}>
          <p className="mb-4 text-sm text-soft">{t.actions.sub}</p>
          <ul className="space-y-2.5">
            {rows.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <input type="checkbox" name={`a_done_${i}`} defaultChecked={a.done} disabled={locked} aria-label={t.actions.done} className="h-4 w-4 accent-[var(--accent)]" />
                <input name={`a_text_${i}`} defaultValue={a.text} maxLength={300} placeholder={t.actions.add} disabled={locked} className="field flex-1" aria-label={t.actions.text} />
                {a.carried && <><input type="hidden" name={`a_carried_${i}`} value="1" /><span className="shrink-0 text-xs text-soft">{t.actions.carried}</span></>}
              </li>
            ))}
          </ul>
        </Card>

        {locked ? <p className="text-sm text-soft">{t.locked}</p> : (
          <div className="flex flex-wrap gap-3">
            <button className="cbtn cbtn-quiet">{t.save}</button>
            <button name="submit" value="1" className="cbtn">{t.submit}</button>
          </div>
        )}
      </form>
    </div>
  );
}
