import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
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
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages().connect;
  const t = m.request;

  if (me.role === "mentor") {
    const { data } = await supabase.rpc("open_matching_requests");
    const rows = (data ?? []) as { id: string; partner_name: string; mission_field: string | null; contribution_type: keyof typeof m.contribution; message: string | null; created_at: string }[];
    return (
      <div className="space-y-4">
        <PageTitle>{t.incomingTitle}</PageTitle>
        {rows.length === 0 && <p className="text-soft">{t.incomingEmpty}</p>}
        {rows.map((r) => (
          <Card key={r.id}>
            <p className="text-xs text-clay">{m.contribution[r.contribution_type]} · {fmtDate(r.created_at)}</p>
            <p className="mt-1 font-display text-lg font-semibold">{r.partner_name}{r.mission_field ? <span className="ml-2 text-sm font-normal text-soft">{r.mission_field}</span> : null}</p>
            {r.message && <p className="mt-2 whitespace-pre-line text-soft">{r.message}</p>}
            <form action={accept} className="mt-4">
              <input type="hidden" name="id" value={r.id} />
              <button className="bg-clay px-5 py-2.5 text-sm font-medium text-white rounded-lg">{t.accept}</button>
              <p className="mt-2 text-xs text-soft">{t.acceptHint}</p>
            </form>
          </Card>
        ))}
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
          <button className="w-full bg-clay py-3.5 font-medium text-white rounded-lg">{t.send}</button>
        </form>
      </Card>
      <h2 className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.mine}</h2>
      {(data ?? []).length === 0 && <p className="text-soft">{t.empty}</p>}
      {(data ?? []).map((r) => (
        <Card key={r.id}>
          <p className="flex justify-between text-xs text-clay"><span>{m.contribution[r.contribution_type as keyof typeof m.contribution]} · {fmtDate(r.created_at)}</span><span>{t.status[r.status as keyof typeof t.status]}</span></p>
          {r.message && <p className="mt-2 whitespace-pre-line text-soft">{r.message}</p>}
          {r.status === "pending" && (
            <form action={cancelRequest} className="mt-3"><input type="hidden" name="id" value={r.id} /><button className="text-sm text-soft underline">{t.cancel}</button></form>
          )}
        </Card>
      ))}
    </div>
  );
}
