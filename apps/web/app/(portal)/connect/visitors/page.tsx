import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { groupCategories, loadCategories } from "@/lib/categories";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

async function invite(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo || r.me.role !== "mentor") return;
  const cat = /^\d+$/.test(String(fd.get("category") ?? "")) ? Number(fd.get("category")) : null;
  const planned = String(fd.get("planned") ?? "");
  const { error } = await r.supabase.rpc("invite_visitor", {
    p_name: String(fd.get("name") ?? ""), p_contact: String(fd.get("contact") ?? ""), p_category: cat,
    p_planned: /^\d{4}-\d{2}-\d{2}$/.test(planned) ? planned : null, p_note: String(fd.get("note") ?? ""),
    p_kind: ["guest", "observer", "substitute"].includes(String(fd.get("kind"))) ? String(fd.get("kind")) : "guest",
    p_for: /^[0-9a-f-]{36}$/i.test(String(fd.get("for_member") ?? "")) ? String(fd.get("for_member")) : null,
  });
  revalidatePath("/connect/visitors");
  redirect(error ? "/connect/visitors?error=form" : "/connect/visitors?saved=1");
}

async function setStatus(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("set_visitor_status", { p_id: String(fd.get("id") ?? ""), p_status: String(fd.get("status") ?? "") });
  revalidatePath("/connect/visitors");
}

type V = { id: string; chapter_id: string; invited_by: string; name: string; contact: string | null; category_id: number | null; planned_at: string | null; note: string | null; status: "invited" | "attended" | "joined" | "declined"; kind: "guest" | "observer" | "substitute"; created_at: string };

export default async function Visitors({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.visitors;
  const { saved, error: err } = await searchParams;

  const [{ data }, cats, { data: peerData }] = await Promise.all([
    supabase.from("visitors").select("*").order("created_at", { ascending: false }).limit(100),
    loadCategories(supabase),
    supabase.rpc("chapter_peers"),
  ]);
  const rows = (data ?? []) as V[];
  const mine = rows.filter((v) => v.invited_by === me.id);
  const toConfirm = rows.filter((v) => v.invited_by !== me.id && v.status === "invited"); // RLS 로 내가 리더인 챕터의 것만 보임
  const catName = new Map(cats.map((c) => [c.id, locale === "en" ? c.name_en : c.name_ko]));
  const peerName = new Map(((peerData ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]));
  const grouped = groupCategories(cats, locale === "en" ? "en" : "ko");
  const attended90 = mine.filter((v) => v.kind === "guest" && (v.status === "attended" || v.status === "joined")).length;

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-full"><PageTitle eyebrow="Guests" sub={t.sub}>{t.title}</PageTitle></div>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent lg:col-span-full">{t.saved}</p>}
      {err && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a] lg:col-span-full">{t.errors.form}</p>}

      <Card title={t.invite}>
        <form action={invite} className="space-y-4">
          <fieldset>
            <legend className={labelCls}>{t.kind.label}</legend>
            <div className="space-y-1.5 text-sm">
              {(["guest", "observer", "substitute"] as const).map((k) => <label key={k} className="flex items-start gap-2"><input type="radio" name="kind" value={k} defaultChecked={k === "guest"} className="mt-1 accent-[var(--accent)]" /><span>{t.kind[k]}</span></label>)}
            </div>
            <p className="mt-1.5 text-xs text-soft">{t.kindNote}</p>
          </fieldset>
          <label className="block"><span className={labelCls}>{t.forMember}</span>
            <select name="for_member" defaultValue="" className="field"><option value="">-</option>{((peerData ?? []) as { id: string; name: string }[]).filter((p) => p.id !== me.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="block"><span className={labelCls}>{t.name}</span><input name="name" required maxLength={100} className="field" /></label>
          <label className="block"><span className={labelCls}>{t.contact}</span><input name="contact" maxLength={200} className="field" /></label>
          <label className="block">
            <span className={labelCls}>{t.category}</span>
            <select name="category" defaultValue="" className="field">
              <option value="">-</option>
              {grouped.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</optgroup>)}
            </select>
          </label>
          <label className="block"><span className={labelCls}>{t.planned}</span><input name="planned" type="date" className="field" /></label>
          <label className="block"><span className={labelCls}>{t.note}</span><textarea name="note" rows={2} maxLength={1000} className="field" /></label>
          <button className="cbtn w-full">{t.send}</button>
        </form>
      </Card>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {[[t.stats.total, mine.length], [t.stats.month, attended90]].map(([k, v]) => (
            <div key={String(k)} className="cbezel"><div className="cbezel-in p-5"><p className="text-[13px] text-soft">{k}</p><p className="mt-1 text-[2rem] font-light leading-none tabular-nums">{v}</p></div></div>
          ))}
        </div>

        {toConfirm.length > 0 && (
          <Card title={`${t.confirmTitle} · ${toConfirm.length}`}>
            <ul className="divide-y divide-black/[0.06]">
              {toConfirm.map((v) => (
                <li key={v.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-medium">{v.name}<span className="ml-2 text-xs text-soft">{[v.category_id ? catName.get(v.category_id) : null, v.planned_at ? fmtDate(v.planned_at, locale) : null].filter(Boolean).join(" · ")}</span></p>
                  <p className="mt-0.5 text-xs text-soft">{t.by} {peerName.get(v.invited_by) ?? "-"}</p>
                  <form action={setStatus} className="mt-2.5 flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={v.id} />
                    <button name="status" value="attended" className="cbtn cbtn-sm">{t.attended}</button>
                    <button name="status" value="joined" className="cbtn cbtn-quiet cbtn-sm">{t.joined}</button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title={t.mine}>
          {mine.length === 0 ? <p className="text-soft">{t.empty}</p> : (
            <ul className="divide-y divide-black/[0.06]">
              {mine.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <span>
                    <b className="font-medium">{v.name}</b>{v.kind !== "guest" && <span className="ml-2 rounded-full bg-tint px-2 py-0.5 text-[11px] text-soft">{t.kindShort[v.kind]}</span>}
                    <span className="ml-2 text-xs text-soft">{[v.category_id ? catName.get(v.category_id) : null, v.planned_at ? fmtDate(v.planned_at, locale) : fmtDate(v.created_at, locale)].filter(Boolean).join(" · ")}</span>
                    {v.note && <span className="mt-0.5 block text-sm text-soft">{v.note}</span>}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold tracking-wide ${v.status === "attended" || v.status === "joined" ? "text-accent" : v.status === "invited" ? "gilt" : "text-soft"}`}>{t.status[v.status]}</span>
                    {v.status === "invited" && (
                      <form action={setStatus}><input type="hidden" name="id" value={v.id} /><button name="status" value="declined" className="text-sm text-soft underline">{t.cancel}</button></form>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
