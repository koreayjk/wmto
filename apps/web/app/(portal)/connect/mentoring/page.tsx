import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDateTime, kstLocalToIso, nowKstLocal } from "@/lib/format";
import { Card, labelCls } from "@/components/connect/ui";
import { Avatar } from "@/components/connect/Avatar";

async function addLog(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") return;
  const heldAt = kstLocalToIso(String(fd.get("held_at") ?? ""));
  const duration = Number(fd.get("duration_min"));
  const content = String(fd.get("content") ?? "").trim();
  const matchingId = String(fd.get("matching_id") ?? "");
  if (!heldAt || !Number.isInteger(duration) || duration < 1 || duration > 600 || !content || !matchingId) return;
  // 담당 멘토인지·진행 중 매칭인지는 DB 정책이 최종 검증합니다.
  const optional = (k: string) => String(fd.get(k) ?? "").trim().slice(0, 2000) || null;
  await supabase.from("mentoring_logs").insert({
    matching_id: matchingId, held_at: heldAt, duration_min: duration, content: content.slice(0, 5000), created_by: me.id,
    next_steps: optional("next_steps"), prayer_topics: optional("prayer_topics"),
    shared: fd.get("shared") === "on", // 기본 공유, 끄면 나와 선교사만
  });
  revalidatePath("/connect/mentoring");
}

type Feed = {
  id: string; matching_id: string; partner_id: string; partner_name: string; partner_photo: string | null;
  author_id: string; author_name: string | null; author_photo: string | null;
  held_at: string; duration_min: number; content: string; next_steps: string | null; prayer_topics: string | null;
  shared: boolean; mine: boolean;
};

export default async function Mentoring({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages(locale).connect;
  const t = m.mentoring;
  const { p: only } = await searchParams;

  const [{ data: matchings }, { data: feed }] = await Promise.all([
    supabase.from("matchings").select("id,mentor_id,partner_id,contribution_type,status"),
    supabase.rpc("mentoring_feed"),
  ]);
  const all = (feed ?? []) as Feed[];
  const active = (matchings ?? []).filter((x) => x.status === "active");
  const partnerIds = [...new Set((matchings ?? []).map((x) => x.partner_id))];
  const { data: people } = partnerIds.length && me.role === "mentor" ? await supabase.from("members").select("id,name,photo_url").in("id", partnerIds) : { data: [] };
  const partners = (people ?? []) as { id: string; name: string; photo_url: string | null }[];
  const nameOf = new Map(partners.map((p) => [p.id, p.name]));
  const logs = only ? all.filter((l) => l.partner_id === only) : all;

  // 달(月)로 묶어 시간 흐름이 보이게
  const monthKey = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ko-KR", { year: "numeric", month: "long", timeZone: "Asia/Seoul" });
  const groups: [string, Feed[]][] = [];
  for (const l of logs) {
    const k = monthKey(l.held_at);
    const g = groups[groups.length - 1];
    if (g && g[0] === k) g[1].push(l); else groups.push([k, [l]]);
  }
  const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", timeZone: "Asia/Seoul" });
  const wd = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ko-KR", { weekday: "short", timeZone: "Asia/Seoul" });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12">
      <header className="lg:col-span-2">
        <h1 className="display text-[2rem] leading-[1.15] md:text-[2.4rem]">{t.title}</h1>
        <p className="mt-3 text-soft">{t.sub}</p>
      </header>

      {me.role === "mentor" && (
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card title={t.newTitle}>
            {active.length ? (
              <form action={addLog} className="space-y-4">
                <label className="block">
                  <span className={labelCls}>{t.matching}</span>
                  <select name="matching_id" required className="field" defaultValue={active.find((x) => x.partner_id === only)?.id}>
                    {active.map((x) => (
                      <option key={x.id} value={x.id}>
                        {nameOf.get(x.partner_id) ?? "-"} · {m.contribution[x.contribution_type as keyof typeof m.contribution]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className={labelCls}>{t.heldAt}</span>
                    <input name="held_at" type="datetime-local" required defaultValue={nowKstLocal()} className="field" />
                  </label>
                  <label className="block">
                    <span className={labelCls}>{t.duration}</span>
                    <input name="duration_min" type="number" min={1} max={600} required defaultValue={60} className="field" />
                  </label>
                </div>
                <label className="block">
                  <span className={labelCls}>{t.content}</span>
                  <textarea name="content" required rows={5} maxLength={5000} className="field" />
                </label>
                <label className="block">
                  <span className={labelCls}>{t.nextSteps}</span>
                  <textarea name="next_steps" rows={2} maxLength={2000} className="field" />
                </label>
                <label className="block">
                  <span className={labelCls}>{t.prayer}</span>
                  <textarea name="prayer_topics" rows={2} maxLength={2000} className="field" />
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-tint px-4 py-3">
                  <input type="checkbox" name="shared" defaultChecked className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                  <span><span className="block text-sm font-medium">{t.shareLabel}</span><span className="mt-0.5 block text-xs leading-relaxed text-soft">{t.shareHint}</span></span>
                </label>
                <button className="cbtn w-full">{t.save}</button>
              </form>
            ) : (
              <p className="text-soft">{t.noMatching}</p>
            )}
          </Card>
        </div>
      )}

      <section className={me.role === "partner" ? "lg:col-span-2 max-w-3xl" : ""}>
        {me.role === "mentor" && partners.length > 1 && (
          <nav className="mb-6 flex flex-wrap gap-2" aria-label={t.forPartner}>
            <Link href="/connect/mentoring" aria-current={!only ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm ${!only ? "bg-ink text-white" : "bg-white ring-1 ring-black/10"}`}>{t.all}</Link>
            {partners.map((p) => (
              <Link key={p.id} href={`/connect/mentoring?p=${p.id}`} aria-current={only === p.id ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm ${only === p.id ? "bg-ink text-white" : "bg-white ring-1 ring-black/10"}`}>
                <Avatar name={p.name} url={p.photo_url} size={24} />{p.name}
              </Link>
            ))}
          </nav>
        )}

        {logs.length === 0 ? <p className="text-soft">{t.empty}</p> : groups.map(([month, list]) => (
          <div key={month} className="mb-10">
            <h2 className="mb-4 text-[12px] font-medium tracking-[0.14em] text-soft">{month}</h2>
            <ol className="relative space-y-7 before:absolute before:bottom-2 before:left-[1.65rem] before:top-2 before:w-px before:bg-black/10">
              {list.map((l) => (
                <li key={l.id} className="relative flex gap-4 sm:gap-5">
                  <div className="z-10 w-[3.3rem] shrink-0 text-center">
                    <span className="block rounded-2xl bg-white py-1.5 shadow-[0_0_0_1px_rgba(22,24,29,0.06),0_10px_20px_-14px_rgba(14,70,58,0.5)]">
                      <span className="block font-display text-xl font-semibold leading-none tabular-nums">{day(l.held_at)}</span>
                      <span className="mt-1 block text-[11px] text-soft">{wd(l.held_at)}</span>
                    </span>
                  </div>
                  <article className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Avatar name={me.role === "mentor" ? l.partner_name : (l.author_name ?? "-")} url={me.role === "mentor" ? l.partner_photo : l.author_photo} size={30} />
                      <b className="font-display text-lg">
                        {me.role === "mentor" ? (nameOf.get(l.partner_id) ?? l.partner_name) : `${t.withMentor} ${l.author_name ?? "-"}`}
                      </b>
                      <span className="text-xs text-soft">{fmtDateTime(l.held_at, locale).split(" ").slice(-2).join(" ")} · {l.duration_min}{t.minutes}</span>
                    </div>
                    <p className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                      {me.role === "mentor" && !l.mine && <span className="rounded-full bg-tint px-2.5 py-0.5 font-medium text-accent">{t.fromOther.replace("{n}", l.author_name ?? "-")}</span>}
                      {l.mine && (l.shared
                        ? <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-soft">{t.sharedBadge}</span>
                        : <span className="rounded-full bg-[#f6ead9] px-2.5 py-0.5 text-[#8a5a14]">🔒 {t.privateBadge}</span>)}
                    </p>
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/85">{l.content}</p>
                    {(l.next_steps || l.prayer_topics) && (
                      <dl className="mt-3 space-y-1.5 border-l-2 border-accent/25 pl-4 text-sm">
                        {l.next_steps && <div><dt className="inline font-semibold">{t.nextSteps.replace(/ \(.*\)/, "")} </dt><dd className="inline text-ink/75">{l.next_steps}</dd></div>}
                        {l.prayer_topics && <div><dt className="inline font-semibold">{t.prayer.replace(/ \(.*\)/, "")} </dt><dd className="inline text-ink/75">{l.prayer_topics}</dd></div>}
                      </dl>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
