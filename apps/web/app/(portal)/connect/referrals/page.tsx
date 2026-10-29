import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { krRegions } from "@/lib/codes";
import { Card, PageTitle } from "@/components/connect/ui";
import { ReferralComposer, type ComposerText, type DirMentor } from "@/components/connect/ReferralComposer";

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
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.referral;

  const [{ data: dir }, { data: refs }] = await Promise.all([
    supabase.rpc("mentor_directory"),
    supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const mentors = (dir ?? []) as DirMentor[];
  const cm = getMessages(locale).connect;
  const composerText: ComposerText = { ...t.picker, receiver: t.receiver, client: t.client, contact: t.contact, note: t.note, send: t.send, ways: cm.contribution, stages: cm.stageNames, regions: getMessages(locale).apply.options.region, regionOrder: krRegions, dateLocale: locale === "en" ? "en-US" : "ko-KR" };
  const name = new Map(mentors.map((x) => [x.id, x.name]));
  const all = (refs ?? []) as Ref[];
  const received = all.filter((r) => r.receiver_id === me.id);
  const sent = all.filter((r) => r.giver_id === me.id);
  // 보낸 사람 이름은 members RLS 로는 보이지 않으므로 디렉토리에서 찾습니다. 없으면 "-".
  const who = (id: string) => name.get(id) ?? "-";

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Referrals">{t.title}</PageTitle>
      <Card title={t.new} className="lg:col-span-full">
        {mentors.length === 0 ? (
          <p className="text-soft">{t.noMentors}</p>
        ) : (
          <ReferralComposer mentors={mentors} action={send} t={composerText} />
        )}
      </Card>

      <Card title={`${t.received} · ${received.length}`} className="lg:col-span-1">
        {received.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {received.map((r) => (
              <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                <p className="flex items-center justify-between gap-3 text-xs text-clay"><span>{t.from} {who(r.giver_id)} · {fmtDate(r.created_at, locale)}</span></p>
                <p className="mt-0.5 font-display text-base font-semibold">{r.client_name}{r.client_contact && <span className="ml-2 text-sm font-normal text-soft">{r.client_contact}</span>}</p>
                {r.note && <p className="mt-1 whitespace-pre-line text-sm text-soft">{r.note}</p>}
                <form action={setStatus} className="mt-2.5 flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status} className="field !w-auto !py-1.5 !text-sm" aria-label={t.update}>
                    {STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                  </select>
                  <button className="cbtn cbtn-sm">{t.update}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`${t.sent} · ${sent.length}`} className="lg:col-span-1">
        {sent.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {sent.map((r) => (
              <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                <p className="flex justify-between gap-3 text-xs text-clay"><span>{t.to} {who(r.receiver_id)} · {fmtDate(r.created_at, locale)}</span><span className="rounded-full bg-tint px-2.5 py-0.5 font-semibold text-accent">{t.status[r.status]}</span></p>
                <p className="mt-0.5 font-display text-base font-semibold">{r.client_name}</p>
                {r.note && <p className="mt-1 whitespace-pre-line text-sm text-soft">{r.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
