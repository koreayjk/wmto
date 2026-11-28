import { requireMe, hasMission } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const LEARN_KINDS = ["scripture", "discipleship", "business", "book", "other"] as const;
const UNIT: Record<string, number> = { scripture: 1, discipleship: 2, business: 2, book: 2, other: 1 };

async function logLearning(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const kind = String(fd.get("kind"));
  const { error } = await r.supabase.rpc("log_learning", { p_kind: (LEARN_KINDS as readonly string[]).includes(kind) ? kind : "other", p_qty: Math.min(5, Math.max(1, Number(fd.get("qty")) || 1)), p_held_on: String(fd.get("held_on") ?? ""), p_note: String(fd.get("note") ?? "") });
  revalidatePath("/connect/academy");
  if (error) redirect("/connect/academy?error=1");
}

async function removeLearning(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("delete_learning", { p_id: String(fd.get("id")) });
  revalidatePath("/connect/academy");
}

async function mark(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const id = String(fd.get("id"));
  if (fd.get("undo")) await r.supabase.rpc("uncomplete_academy", { p_video: id });
  else await r.supabase.rpc("complete_academy", { p_video: id });
  revalidatePath("/connect/academy");
}

export default async function Academy({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: lerr } = await searchParams;
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.academy;
  // 역할별 공개 범위는 DB 정책(academy_read)이 적용합니다.
  const { data } = await supabase.from("academy_videos").select("id,title,description,video_url,category,published_at").order("published_at", { ascending: false }).limit(200);
  const { data: done } = await supabase.from("academy_completions").select("video_id,completed_at").eq("member_id", me.id);
  const doneSet = new Set((done ?? []).map((d) => d.video_id as string));
  const recent = (done ?? []).filter((d) => Date.now() - new Date(d.completed_at as string).getTime() < 90 * 86400000).length;
  const { data: logs } = me.role === "mentor" ? await supabase.from("learning_logs").select("id,kind,qty,held_on,note,created_at").eq("member_id", me.id).order("held_on", { ascending: false }).limit(20) : { data: [] };
  const todayStr = new Date().toISOString().slice(0, 10);
  // CBC 사업가(선교 권한 없음)에게는 선교·멘토 교육 강의를 보이지 않습니다.
  const cbc = me.role === "mentor" && !hasMission(me);
  const MISSION_RE = /선교|멘토|후원|mission|mentor|sponsor/i;
  const groups = new Map<string, NonNullable<typeof data>>();
  (data ?? []).filter((v) => !cbc || !MISSION_RE.test(`${v.category ?? ""} ${v.title ?? ""}`)).forEach((v) => {
    const k = v.category || t.uncategorized;
    groups.set(k, [...(groups.get(k) ?? []), v]);
  });
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Academy" sub={me.role === "mentor" ? `${t.hint} · ${t.progress} ${recent}` : undefined}>{t.title}</PageTitle>
      {me.role === "mentor" && (
        <Card title={t.learning.title}>
          <p className="mb-5 text-sm text-soft">{t.learning.sub}</p>
          {lerr && <p role="alert" className="mb-4 rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{t.learning.error}</p>}
          <form action={logLearning} className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr_1fr_auto] sm:items-end">
            <label className="block"><span className={labelCls}>{t.learning.title}</span>
              <select name="kind" className="field">{LEARN_KINDS.map((k) => <option key={k} value={k}>{t.learning.kind[k]} ({t.learning.unit.replace("{n}", String(UNIT[k]))})</option>)}</select></label>
            <label className="block"><span className={labelCls}>{t.learning.qty}</span><input name="qty" type="number" min={1} max={5} defaultValue={1} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.learning.date}</span><input name="held_on" type="date" defaultValue={todayStr} max={todayStr} className="field" /></label>
            <button className="cbtn">{t.learning.add}</button>
            <label className="block sm:col-span-full"><span className={labelCls}>{t.learning.note}</span><input name="note" maxLength={300} className="field" /></label>
          </form>
          <h3 className="mt-7 text-[13px] font-medium text-soft">{t.learning.recent}</h3>
          {(logs ?? []).length === 0 ? <p className="mt-2 text-sm text-soft">{t.learning.empty}</p> : (
            <ul className="mt-2 divide-y divide-black/[0.06] text-sm">
              {(logs ?? []).map((l) => (
                <li key={l.id as string} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <span><b className="font-medium">{t.learning.kind[l.kind as keyof typeof t.learning.kind]}</b> × {l.qty as number}<span className="ml-2 text-xs text-soft">{fmtDate(l.held_on as string, locale)}{l.note ? ` · ${l.note}` : ""}</span></span>
                  {Date.now() - new Date(l.created_at as string).getTime() < 7 * 86400000 && <form action={removeLearning}><input type="hidden" name="id" value={l.id as string} /><button className="text-xs text-soft underline">{t.learning.remove}</button></form>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      {groups.size === 0 && <p className="text-soft">{t.empty}</p>}
      {[...groups].map(([cat, vids]) => (
        <Card key={cat} title={cat}>
          <ul className="divide-y divide-black/[0.06]">
            {vids.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold">{v.title}</span>
                  {v.description && <span className="mt-0.5 block text-sm text-soft">{v.description}</span>}
                  <span className="mt-1 block text-xs text-soft">{fmtDate(v.published_at, locale)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="cbtn cbtn-sm">{t.watch}</a>
                  <form action={mark}>
                    <input type="hidden" name="id" value={v.id} />
                    {doneSet.has(v.id)
                      ? <button name="undo" value="1" className="text-xs text-accent underline">{t.done} · {t.undo}</button>
                      : <button className="text-xs underline">{t.markDone}</button>}
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
