import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const STATUSES = ["sent", "contacted", "closed"] as const;

async function send(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const client = String(fd.get("client_name") ?? "").trim().slice(0, 200);
  const receiver = String(fd.get("receiver_id") ?? "");
  if (me.role !== "mentor" || !client || !receiver) return;
  // 받는 사람이 활성 사업가인지는 DB 정책이 최종 검증합니다.
  await supabase.from("referrals").insert({
    giver_id: me.id, receiver_id: receiver, client_name: client,
    client_contact: String(fd.get("client_contact") ?? "").trim().slice(0, 200) || null,
    note: String(fd.get("note") ?? "").trim().slice(0, 3000) || null,
  });
  revalidatePath("/connect/referrals");
}

async function setStatus(fd: FormData) {
  "use server";
  const { supabase } = await requireMe();
  const status = String(fd.get("status"));
  if (!(STATUSES as readonly string[]).includes(status)) return;
  await supabase.from("referrals").update({ status }).eq("id", String(fd.get("id")));
  revalidatePath("/connect/referrals");
}

type Ref = { id: string; giver_id: string; receiver_id: string; client_name: string; client_contact: string | null; note: string | null; status: (typeof STATUSES)[number]; created_at: string };

export default async function Referrals() {
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages().connect.referral;

  const [{ data: dir }, { data: refs }] = await Promise.all([
    supabase.rpc("mentor_directory"),
    supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const mentors = (dir ?? []) as { id: string; name: string; industry: string | null; business_name: string | null }[];
  const name = new Map(mentors.map((x) => [x.id, x.name]));
  const all = (refs ?? []) as Ref[];
  const received = all.filter((r) => r.receiver_id === me.id);
  const sent = all.filter((r) => r.giver_id === me.id);
  // 보낸 사람 이름은 members RLS 로는 보이지 않으므로 디렉토리에서 찾습니다. 없으면 "—".
  const who = (id: string) => name.get(id) ?? "—";

  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>
      <Card title={t.new}>
        {mentors.length === 0 ? (
          <p className="text-soft">{t.noMentors}</p>
        ) : (
          <form action={send} className="space-y-4">
            <label className="block">
              <span className={labelCls}>{t.receiver}</span>
              <select name="receiver_id" required defaultValue="" className="field">
                <option value="" disabled>선택</option>
                {mentors.map((x) => <option key={x.id} value={x.id}>{x.name}{x.industry ? ` · ${x.industry}` : ""}</option>)}
              </select>
            </label>
            <label className="block"><span className={labelCls}>{t.client}</span><input name="client_name" required maxLength={200} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.contact}</span><input name="client_contact" maxLength={200} className="field" /></label>
            <label className="block"><span className={labelCls}>{t.note}</span><textarea name="note" rows={3} maxLength={3000} className="field" /></label>
            <button className="w-full bg-clay py-3.5 font-medium text-white">{t.send}</button>
          </form>
        )}
      </Card>

      <h2 className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.received}</h2>
      {received.length === 0 && <p className="text-soft">{t.empty}</p>}
      {received.map((r) => (
        <Card key={r.id}>
          <p className="text-xs text-clay">{t.from} {who(r.giver_id)} · {fmtDate(r.created_at)}</p>
          <p className="mt-1 font-serif text-lg font-semibold">{r.client_name}</p>
          {r.client_contact && <p className="text-sm text-soft">{r.client_contact}</p>}
          {r.note && <p className="mt-2 whitespace-pre-line text-soft">{r.note}</p>}
          <form action={setStatus} className="mt-3 flex items-center gap-2">
            <input type="hidden" name="id" value={r.id} />
            <select name="status" defaultValue={r.status} className="border border-line bg-white px-2 py-1.5 text-sm" aria-label={t.update}>
              {STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
            </select>
            <button className="bg-ink px-3 py-1.5 text-sm text-white">{t.update}</button>
          </form>
        </Card>
      ))}

      <h2 className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.sent}</h2>
      {sent.length === 0 && <p className="text-soft">{t.empty}</p>}
      {sent.map((r) => (
        <Card key={r.id}>
          <p className="flex justify-between text-xs text-clay"><span>{t.to} {who(r.receiver_id)} · {fmtDate(r.created_at)}</span><span>{t.status[r.status]}</span></p>
          <p className="mt-1 font-serif text-lg font-semibold">{r.client_name}</p>
          {r.note && <p className="mt-2 whitespace-pre-line text-soft">{r.note}</p>}
        </Card>
      ))}
    </div>
  );
}
