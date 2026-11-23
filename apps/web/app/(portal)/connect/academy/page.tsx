import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { Card, PageTitle } from "@/components/connect/ui";

async function mark(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const id = String(fd.get("id"));
  if (fd.get("undo")) await r.supabase.rpc("uncomplete_academy", { p_video: id });
  else await r.supabase.rpc("complete_academy", { p_video: id });
  revalidatePath("/connect/academy");
}

export default async function Academy() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.academy;
  // 역할별 공개 범위는 DB 정책(academy_read)이 적용합니다.
  const { data } = await supabase.from("academy_videos").select("id,title,description,video_url,category,published_at").order("published_at", { ascending: false }).limit(200);
  const { data: done } = await supabase.from("academy_completions").select("video_id,completed_at").eq("member_id", me.id);
  const doneSet = new Set((done ?? []).map((d) => d.video_id as string));
  const recent = (done ?? []).filter((d) => Date.now() - new Date(d.completed_at as string).getTime() < 90 * 86400000).length;
  const groups = new Map<string, NonNullable<typeof data>>();
  (data ?? []).forEach((v) => {
    const k = v.category || t.uncategorized;
    groups.set(k, [...(groups.get(k) ?? []), v]);
  });
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Academy" sub={me.role === "mentor" ? `${t.hint} · ${t.progress} ${recent}` : undefined}>{t.title}</PageTitle>
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
