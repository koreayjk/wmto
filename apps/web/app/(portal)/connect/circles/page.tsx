import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { leaderChapters } from "@/lib/leader-chapters";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";


async function create(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const { error } = await r.supabase.rpc("create_circle", { p_chapter: String(fd.get("chapter")), p_name: String(fd.get("name") ?? ""), p_purpose: String(fd.get("purpose") ?? "") });
  revalidatePath("/connect/circles");
  if (error) redirect("/connect/circles?error=1");
}
async function addMember(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const { error } = await r.supabase.rpc("add_circle_member", { p_circle: String(fd.get("circle")), p_member: String(fd.get("member")) });
  revalidatePath("/connect/circles");
  if (error) redirect("/connect/circles?error=1");
}
async function removeMember(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("remove_circle_member", { p_circle: String(fd.get("circle")), p_member: String(fd.get("member")) });
  revalidatePath("/connect/circles");
}
async function closeCircle(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("close_circle", { p_circle: String(fd.get("circle")) });
  revalidatePath("/connect/circles");
}
async function post(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("post_circle", { p_circle: String(fd.get("circle")), p_body: String(fd.get("body") ?? "") });
  revalidatePath("/connect/circles");
}

type Mine = { id: string; name: string; purpose: string | null; members: { id: string; name: string; industry: string | null }[] };
type Ch = { circles: { id: string; name: string; purpose: string | null; members: { id: string; name: string }[] }[]; free: { id: string; name: string; industry: string | null }[] };

export default async function Circles({ searchParams }: { searchParams: Promise<{ error?: string; chapter?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase, viewAs } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.circles;
  const { error, chapter: want } = await searchParams;
  const { data: mineData } = await supabase.rpc("my_circle");
  const mine = (mineData ?? null) as Mine | null;
  const { data: postRows } = mine ? await supabase.rpc("my_circle_posts", { p_circle: mine.id }) : { data: [] };
  const posts = (postRows ?? []) as { id: string; author_name: string | null; body: string; created_at: string }[];
  const chapters = await leaderChapters(supabase, me.id);
  const current = chapters.find((c) => c.id === want) ?? chapters[0];
  const { data: chData } = current ? await supabase.rpc("chapter_circles", { p_chapter: current.id }) : { data: null };
  const ch = (chData ?? null) as Ch | null;

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Circles" sub={t.sub}>{t.title}</PageTitle>
      {error && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{t.leader.error}</p>}

      <Card title={t.mine}>
        {!mine ? <p className="text-soft">{t.none}</p> : (
          <>
            <p className="font-display text-xl font-semibold">{mine.name}</p>
            {mine.purpose && <p className="mt-1 text-sm text-soft">{mine.purpose}</p>}
            <p className="mt-4 text-[13px] text-soft">{t.members}</p>
            <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm">{mine.members.map((m) => <li key={m.id}><b className="font-medium">{m.name}</b>{m.industry ? <span className="text-soft"> · {m.industry}</span> : null}</li>)}</ul>
            {!viewAs && <form action={removeMember} className="mt-3"><input type="hidden" name="circle" value={mine.id} /><input type="hidden" name="member" value={me.id} /><button className="text-xs text-soft underline">{t.leave}</button></form>}
          </>
        )}
      </Card>

      {mine && (
        <Card title={t.board}>
          {!viewAs && (
            <form action={post} className="mb-5 space-y-2"><input type="hidden" name="circle" value={mine.id} />
              <textarea name="body" required rows={2} maxLength={1000} placeholder={t.boardHint} className="field" />
              <button className="cbtn cbtn-quiet cbtn-sm">{t.post}</button></form>
          )}
          {posts.length === 0 ? <p className="text-sm text-soft">{t.noPosts}</p> : (
            <ul className="divide-y divide-black/[0.06]">{posts.map((p) => <li key={p.id} className="py-3 first:pt-0 last:pb-0"><p className="text-xs text-soft"><b className="font-medium text-ink">{p.author_name ?? "-"}</b> · {fmtDate(p.created_at, locale)}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{p.body}</p></li>)}</ul>
          )}
        </Card>
      )}

      {current && ch && !viewAs && (
        <Card title={`${t.leader.title} · ${current.name}`}>
          <form action={create} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
            <input type="hidden" name="chapter" value={current.id} />
            <label className="block"><span className={labelCls}>{t.leader.name}</span><input name="name" required maxLength={60} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.leader.purpose}</span><input name="purpose" maxLength={300} className="field" /></label>
            <button className="cbtn">{t.leader.create}</button>
          </form>
          <p className="mt-2 text-xs text-soft">{t.leader.max}</p>
          {ch.circles.length === 0 ? <p className="mt-5 text-sm text-soft">{t.leader.empty}</p> : (
            <ul className="mt-5 divide-y divide-black/[0.06]">
              {ch.circles.map((c) => (
                <li key={c.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3"><b className="font-medium">{c.name} <span className="text-xs font-normal text-soft">{c.members.length}/6</span></b>
                    <form action={closeCircle}><input type="hidden" name="circle" value={c.id} /><button className="text-xs text-soft underline">{t.leader.close}</button></form></div>
                  <ul className="mt-2 flex flex-wrap gap-2 text-sm">{c.members.map((m) => <li key={m.id} className="flex items-center gap-1.5 rounded-full bg-tint px-3 py-1">{m.name}
                    <form action={removeMember}><input type="hidden" name="circle" value={c.id} /><input type="hidden" name="member" value={m.id} /><button aria-label={t.leader.remove} className="text-soft">×</button></form></li>)}</ul>
                  {c.members.length < 6 && ch.free.length > 0 && (
                    <form action={addMember} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="circle" value={c.id} />
                      <select name="member" required defaultValue="" className="field !w-auto !py-1.5 !text-sm"><option value="" disabled>{t.leader.pick}</option>{ch.free.map((m) => <option key={m.id} value={m.id}>{m.name}{m.industry ? ` · ${m.industry}` : ""}</option>)}</select>
                      <button className="cbtn cbtn-quiet cbtn-sm">{t.leader.add}</button></form>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-[13px] text-soft">{t.leader.free}: {ch.free.map((m) => m.name).join(", ") || "-"}</p>
        </Card>
      )}
    </div>
  );
}
