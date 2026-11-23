import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { kstLocalToIso, nowKstLocal, fmtDateTime } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";
import { Avatar } from "@/components/connect/Avatar";
import { ProofPhotoInput } from "@/components/connect/ProofPhotoInput";

/** 1:1 만남 사진 인증을 필수로 할지(운영 정책). 필요하면 false 로 바꿔 선택 사항으로 둡니다. */
const PROOF_REQUIRED = true;
const BUCKET = "wmto-proofs";

async function create(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo || r.me.role !== "mentor") return;
  const other = String(fd.get("other") ?? "");
  const heldAt = kstLocalToIso(String(fd.get("held_at") ?? ""));
  if (!other || !heldAt) redirect("/connect/one-to-one?error=form");

  let proofPath: string | null = null;
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.size > 4 * 1024 * 1024 || !file.type.startsWith("image/")) redirect("/connect/one-to-one?error=photo");
    const path = `${r.me.id}/${Date.now()}.jpg`;
    const { error } = await createSupabaseAdminClient().storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "image/jpeg", upsert: false });
    if (error) { console.error("proof upload failed", error.message); redirect("/connect/one-to-one?error=photo"); }
    proofPath = path;
  } else if (PROOF_REQUIRED) {
    redirect("/connect/one-to-one?error=photo");
  }

  const { error } = await r.supabase.rpc("create_one_to_one", {
    p_other: other, p_held_at: heldAt, p_place: String(fd.get("place") ?? ""), p_duration: Number(fd.get("duration_min")) || 60,
    p_learned: String(fd.get("learned") ?? ""), p_can_help: String(fd.get("can_help") ?? ""), p_next: String(fd.get("next_step") ?? ""),
    p_intro: String(fd.get("intro_to") ?? ""), p_prayer: String(fd.get("prayer") ?? ""), p_proof_path: proofPath, p_consent: fd.get("consent") === "on",
  });
  if (error) redirect("/connect/one-to-one?error=" + (error.message.includes("same chapter") ? "chapter" : "form"));
  revalidatePath("/connect/one-to-one");
  redirect("/connect/one-to-one?saved=1");
}

async function decide(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const id = String(fd.get("id") ?? "");
  const { error } = fd.get("action") === "decline"
    ? await r.supabase.rpc("decline_one_to_one", { p_id: id })
    : await r.supabase.rpc("confirm_one_to_one", { p_id: id, p_consent: fd.get("consent") === "on" });
  revalidatePath("/connect/one-to-one");
  if (error) redirect("/connect/one-to-one?error=" + (error.message.includes("30 days") ? "dup" : error.message.includes("expired") ? "expired" : "form"));
}

type Row = {
  id: string; member_a: string; member_b: string; held_at: string; place: string | null; duration_min: number | null;
  learned: string; can_help: string; next_step: string; intro_to: string | null; prayer: string | null;
  proof_path: string | null; consent_a: boolean; consent_b: boolean; status: "pending" | "confirmed" | "declined"; expires_at: string;
};
type Peer = { id: string; name: string; photo_url: string | null; business_name: string | null; category_name: string | null; last_met: string | null; met_90d: boolean };

export default async function OneToOne({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.oneToOne;
  const { saved, error: err } = await searchParams;

  const [{ data: rows }, { data: peerData }] = await Promise.all([
    supabase.from("one_to_ones").select("*").order("held_at", { ascending: false }).limit(60),
    supabase.rpc("chapter_peers"),
  ]);
  const list = (rows ?? []) as Row[];
  const peers = (peerData ?? []) as Peer[];
  const peer = new Map(peers.map((p) => [p.id, p]));
  const now = Date.now();
  const mine = (r: Row) => r.member_a === me.id;
  const eff = (r: Row) => (r.status === "pending" && new Date(r.expires_at).getTime() < now ? "expired" : r.status);
  const waiting = list.filter((r) => r.member_b === me.id && eff(r) === "pending");
  const confirmed90 = list.filter((r) => r.status === "confirmed" && new Date(r.held_at).getTime() > now - 90 * 86400_000);
  const notMet = peers.filter((p) => !p.met_90d);

  // 사진은 비공개 저장소라 서버가 짧게 유효한 주소를 만들어 줍니다(내가 볼 수 있는 기록만 목록에 있음).
  const db = createSupabaseAdminClient();
  const urls = new Map<string, string>();
  for (const r of list) {
    const visible = r.proof_path && (mine(r) || (r.status === "confirmed" && r.consent_a && r.consent_b));
    if (!visible) continue;
    const { data } = await db.storage.from(BUCKET).createSignedUrl(r.proof_path!, 3600);
    if (data?.signedUrl) urls.set(r.id, data.signedUrl);
  }

  const who = (id: string) => peer.get(id) ?? { id, name: "-", photo_url: null, business_name: null, category_name: null, last_met: null, met_90d: false };
  const errText = err ? ((t.errors as Record<string, string>)[err] ?? t.errors.form) : null;

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-full"><PageTitle eyebrow="1:1" sub={t.sub}>{t.title}</PageTitle></div>
      {saved && <p role="status" className="rounded-2xl bg-tint px-4 py-3 text-sm text-accent lg:col-span-full">{t.saved}</p>}
      {errText && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a] lg:col-span-full">{errText}</p>}

      <div className="space-y-6 lg:sticky lg:top-6">
        <Card title={t.new}>
          {peers.length === 0 ? <p className="text-soft">{t.noPeers}</p> : (
            <form action={create} className="space-y-4">
              <label className="block">
                <span className={labelCls}>{t.peer}</span>
                <select name="other" required defaultValue="" className="field">
                  <option value="" disabled>{t.pick}</option>
                  {notMet.length > 0 && <optgroup label={t.notMetGroup}>{notMet.map((p) => <option key={p.id} value={p.id}>{p.name}{p.category_name ? ` · ${p.category_name}` : ""}</option>)}</optgroup>}
                  {peers.filter((p) => p.met_90d).length > 0 && <optgroup label={t.metGroup}>{peers.filter((p) => p.met_90d).map((p) => <option key={p.id} value={p.id}>{p.name}{p.category_name ? ` · ${p.category_name}` : ""}</option>)}</optgroup>}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className={labelCls}>{t.heldAt}</span><input name="held_at" type="datetime-local" required defaultValue={nowKstLocal()} className="field" /></label>
                <label className="block"><span className={labelCls}>{t.duration}</span><input name="duration_min" type="number" min={10} max={480} defaultValue={60} className="field" /></label>
              </div>
              <label className="block"><span className={labelCls}>{t.place}</span><input name="place" maxLength={100} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.learned}</span><textarea name="learned" required rows={3} maxLength={2000} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.canHelp}</span><textarea name="can_help" required rows={3} maxLength={2000} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.nextStep}</span><textarea name="next_step" required rows={2} maxLength={2000} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.introTo}</span><input name="intro_to" maxLength={300} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.prayer}</span><input name="prayer" maxLength={300} className="field" /></label>
              <div>
                <span className={labelCls}>{t.photo}{PROOF_REQUIRED ? "" : ` (${t.optional})`}</span>
                <ProofPhotoInput name="photo" required={PROOF_REQUIRED} labels={{ choose: t.photoChoose, change: t.photoChange, hint: t.photoHint }} />
              </div>
              <label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--accent)]" /><span>{t.consent}</span></label>
              <button className="cbtn w-full">{t.save}</button>
              <p className="text-xs leading-relaxed text-soft">{t.confirmNote}</p>
            </form>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[[t.count90, confirmed90.length], [t.metPeople, peers.length - notMet.length], [t.notMetCount, notMet.length]].map(([k, v]) => (
            <div key={String(k)} className="cbezel"><div className="cbezel-in p-5"><p className="text-[13px] text-soft">{k}</p><p className="mt-1 text-[2rem] font-light leading-none tabular-nums">{v}</p></div></div>
          ))}
        </div>

        {waiting.length > 0 && (
          <Card title={`${t.waiting} · ${waiting.length}`}>
            <ul className="divide-y divide-black/[0.06]">
              {waiting.map((r) => {
                const p = who(r.member_a);
                return (
                  <li key={r.id} className="py-5 first:pt-0 last:pb-0">
                    <p className="flex items-center gap-3"><Avatar name={p.name} url={p.photo_url} size={36} /><span><b className="block">{p.name}</b><span className="text-xs text-soft">{fmtDateTime(r.held_at, locale)}{r.place ? ` · ${r.place}` : ""}</span></span></p>
                    <dl className="mt-3 space-y-1.5 text-sm text-ink/80">
                      <div><dt className="inline font-semibold">{t.learned} </dt><dd className="inline">{r.learned}</dd></div>
                      <div><dt className="inline font-semibold">{t.canHelp} </dt><dd className="inline">{r.can_help}</dd></div>
                      <div><dt className="inline font-semibold">{t.nextStep} </dt><dd className="inline">{r.next_step}</dd></div>
                    </dl>
                    {urls.has(r.id) ? null : r.consent_a && r.proof_path ? <p className="mt-2 text-xs text-soft">{t.photoAfterConfirm}</p> : null}
                    <form action={decide} className="mt-3 flex flex-wrap items-center gap-3">
                      <input type="hidden" name="id" value={r.id} />
                      {r.consent_a && r.proof_path && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="consent" className="h-4 w-4 accent-[var(--accent)]" />{t.confirmConsent}</label>}
                      <button name="action" value="confirm" className="cbtn cbtn-sm">{t.confirm}</button>
                      <button name="action" value="decline" className="text-sm text-soft underline">{t.decline}</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        <Card title={t.mine}>
          {list.length === 0 ? <p className="text-soft">{t.empty}</p> : (
            <ul className="divide-y divide-black/[0.06]">
              {list.map((r) => {
                const p = who(mine(r) ? r.member_b : r.member_a);
                const st = eff(r);
                return (
                  <li key={r.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    {urls.has(r.id) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={urls.get(r.id)} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                    ) : <Avatar name={p.name} url={p.photo_url} size={64} className="!rounded-xl" />}
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1"><b>{p.name}</b>
                        <span className={`text-[11px] font-semibold tracking-wide ${st === "confirmed" ? "text-accent" : st === "pending" ? "gilt" : "text-soft"}`}>{t.status[st as keyof typeof t.status]}</span>
                        <span className="text-xs text-soft">{fmtDateTime(r.held_at, locale)}{r.place ? ` · ${r.place}` : ""}</span>
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink/80">{r.learned}</p>
                      <p className="mt-1 text-xs text-soft">{mine(r) ? t.byMe : t.byOther}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {notMet.length > 0 && (
          <Card title={t.suggest}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {notMet.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.06]">
                  <Avatar name={p.name} url={p.photo_url} size={40} />
                  <span className="min-w-0"><b className="block truncate text-sm">{p.name}</b><span className="block truncate text-xs text-soft">{[p.category_name, p.business_name].filter(Boolean).join(" · ")}</span></span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
