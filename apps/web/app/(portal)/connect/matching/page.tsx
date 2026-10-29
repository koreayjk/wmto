import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { contributionTypes } from "@/lib/codes";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

async function createRequest(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const type = String(fd.get("contribution_type"));
  if (me.role !== "partner" || !(contributionTypes as readonly string[]).includes(type)) return;
  await supabase.from("matching_requests").insert({
    partner_id: me.id, contribution_type: type, message: String(fd.get("message") ?? "").trim().slice(0, 2000) || null,
  });
  revalidatePath("/connect/matching");
}

async function cancelRequest(fd: FormData) {
  "use server";
  const { supabase } = await requireMe();
  await supabase.from("matching_requests").update({ status: "cancelled" }).eq("id", String(fd.get("id")));
  revalidatePath("/connect/matching");
}

async function accept(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") return;
  const { error } = await supabase.rpc("accept_matching_request", { p_request: String(fd.get("id")) });
  revalidatePath("/connect/matching");
  if (!error) redirect("/connect/mentoring");
}

export default async function Matching() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages(locale).connect;
  const t = m.request;

  if (me.role === "mentor") {
    const { data } = await supabase.rpc("open_matching_requests");
    const rows = (data ?? []) as { id: string; partner_name: string; mission_field: string | null; contribution_type: keyof typeof m.contribution; message: string | null; created_at: string }[];
    return (
      <div className="space-y-4">
        <PageTitle>{t.incomingTitle}</PageTitle>
        {rows.length === 0 && <p className="text-soft">{t.incomingEmpty}</p>}
        {rows.length > 0 && (
          <Card className="lg:col-span-full">
            <ul className="divide-y divide-black/[0.06]">
              {rows.map((r) => (
                <li key={r.id} className="grid gap-x-8 gap-y-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <p className="font-display text-lg font-semibold">{r.partner_name}</p>
                    <p className="text-sm text-soft">{r.mission_field ?? "-"}</p>
                    <p className="mt-1 text-xs text-clay">{m.contribution[r.contribution_type]} · {fmtDate(r.created_at, locale)}</p>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed text-ink/80">{r.message}</p>
                  <form action={accept} className="md:text-right">
                    <input type="hidden" name="id" value={r.id} />
                    <button className="cbtn cbtn-sm">{t.accept}</button>
                  </form>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-soft">{t.acceptHint}</p>
          </Card>
        )}
      </div>
    );
  }

  const { data } = await supabase.from("matching_requests").select("id,contribution_type,message,status,created_at").order("created_at", { ascending: false }).limit(50);
  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>
      <Card title={t.new}>
        <form action={createRequest} className="space-y-4">
          <select name="contribution_type" className="field" aria-label={t.new}>
            {contributionTypes.map((c) => <option key={c} value={c}>{m.contribution[c]}</option>)}
          </select>
          <label className="block"><span className={labelCls}>{t.message}</span><textarea name="message" rows={4} maxLength={2000} className="field" /></label>
          <button className="cbtn w-full">{t.send}</button>
        </form>
      </Card>
      <Card title={t.mine} className="lg:col-span-1">
        {(data ?? []).length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {(data ?? []).map((r) => (
              <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                <p className="flex justify-between gap-3 text-xs text-clay"><span>{m.contribution[r.contribution_type as keyof typeof m.contribution]} · {fmtDate(r.created_at, locale)}</span><span className="rounded-full bg-tint px-2.5 py-0.5 font-semibold text-accent">{t.status[r.status as keyof typeof t.status]}</span></p>
                {r.message && <p className="mt-1.5 whitespace-pre-line text-ink/80">{r.message}</p>}
                {r.status === "pending" && (
                  <form action={cancelRequest} className="mt-2"><input type="hidden" name="id" value={r.id} /><button className="text-sm text-soft underline">{t.cancel}</button></form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
