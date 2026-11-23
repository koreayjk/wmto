import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

async function ask(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo || r.me.role !== "mentor") return;
  const { error } = await r.supabase.rpc("request_mission", { p_message: String(fd.get("message") ?? "") });
  revalidatePath("/connect/mission");
  redirect(error ? "/connect/mission?error=form" : "/connect/mission?saved=1");
}
async function cancel() {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("cancel_mission_request");
  revalidatePath("/connect/mission");
}
async function decide(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("decide_mission_request", { p_id: String(fd.get("id")), p_approve: fd.get("approve") === "1", p_note: String(fd.get("note") ?? "") });
  revalidatePath("/connect/mission");
}
async function designate(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("designate_mission", { p_member: String(fd.get("member")), p_grant: fd.get("grant") === "1" });
  revalidatePath("/connect/mission");
}

type Pending = { id: string; member_id: string; name: string; business_name: string | null; industry: string | null; chapter_name: string | null; message: string | null };

export default async function Mission({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.mission;
  const { saved, error: err } = await searchParams;
  const st = me.mission_status;

  // 텐트장이면 신청 검토와 지정 기능이 보입니다(DB가 권한을 확인함).
  const { data: lead } = await supabase.from("chapter_leaders").select("chapter_id").eq("member_id", me.id).limit(1);
  const isLeader = (lead ?? []).length > 0;
  const [{ data: pend }, { data: peers }] = isLeader
    ? await Promise.all([supabase.rpc("pending_mission_requests"), supabase.rpc("chapter_peers")])
    : [{ data: [] }, { data: [] }];
  const pending = (pend ?? []) as Pending[];
  const people = ((peers ?? []) as { id: string; name: string; mission_status?: string }[]).filter((p) => p.id !== me.id);
  // 지정 목록의 현재 상태: 회원 행은 텐트장이 직접 못 읽을 수 있어 신청·지정 이력으로 보완하지 않고 버튼 두 개를 모두 제공합니다.

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-full"><PageTitle eyebrow="Mission" sub={t.sub}>{t.title}</PageTitle></div>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent lg:col-span-full">{t.sent}</p>}
      {err && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a] lg:col-span-full">{t.errors.form}</p>}

      <Card title={t.statusLabel}>
        <p className="font-display text-lg font-semibold">{t.status[st]}</p>
        <p className="mt-5 text-[13px] text-soft">{t.what}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{t.whatList.map((x) => <li key={x}>{x}</li>)}</ul>
        {st === "approved" && <a href="/connect/mentoring" className="cbtn mt-6 inline-block">{t.openNow}</a>}
        {st === "requested" && <form action={cancel} className="mt-6"><button className="cbtn cbtn-quiet">{t.cancel}</button></form>}
        {(st === "none" || st === "revoked") && (
          <form action={ask} className="mt-6 space-y-4">
            <label className="block"><span className={labelCls}>{t.message}</span><textarea name="message" rows={3} maxLength={1000} placeholder={t.messageHint} className="field" /></label>
            <button className="cbtn w-full">{t.send}</button>
          </form>
        )}
      </Card>

      {isLeader && (
        <div className="space-y-6">
          <Card title={`${t.reviewTitle} · ${pending.length}`}>
            {pending.length === 0 ? <p className="text-soft">{t.reviewEmpty}</p> : (
              <ul className="divide-y divide-black/[0.06]">
                {pending.map((p) => (
                  <li key={p.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-medium">{p.name}<span className="ml-2 text-xs text-soft">{[p.business_name, p.industry].filter(Boolean).join(" · ")}</span></p>
                    {p.message && <p className="mt-1 text-sm text-soft">{p.message}</p>}
                    <form action={decide} className="mt-3 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="note" placeholder={t.note} maxLength={500} className="field !w-48" />
                      <button name="approve" value="1" className="cbtn cbtn-sm">{t.approve}</button>
                      <button name="approve" value="0" className="cbtn cbtn-quiet cbtn-sm">{t.decline}</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t.manageTitle}>
            <p className="mb-4 text-sm text-soft">{t.manageSub}</p>
            <ul className="divide-y divide-black/[0.06]">
              {people.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span>{p.name}</span>
                  <form action={designate} className="flex gap-2"><input type="hidden" name="member" value={p.id} />
                    <button name="grant" value="1" className="cbtn cbtn-sm">{t.grant}</button>
                    <button name="grant" value="0" className="cbtn cbtn-quiet cbtn-sm">{t.revoke}</button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
