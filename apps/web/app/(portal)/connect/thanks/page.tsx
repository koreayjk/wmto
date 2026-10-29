import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Avatar } from "@/components/connect/Avatar";

async function send(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const body = String(fd.get("body") ?? "").trim().slice(0, 5000);
  const to = String(fd.get("recipient_id") ?? "");
  if (me.role !== "partner" || !body || !to) return;
  // 받는 사람이 내 담당 멘토인지는 DB 정책이 최종 검증합니다.
  await supabase.from("thanks_letters").insert({ sender_id: me.id, recipient_id: to, body });
  revalidatePath("/connect/thanks");
}

export default async function Thanks() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.thanks;

  const { data } = await supabase.from("thanks_letters").select("id,sender_id,recipient_id,body,read_at,created_at").order("created_at", { ascending: false }).limit(100);
  const letters = data ?? [];
  const ids = [...new Set(letters.flatMap((l) => [l.sender_id, l.recipient_id]))].filter((id) => id !== me.id);
  const { data: people } = ids.length ? await supabase.from("members").select("id,name,photo_url").in("id", ids) : { data: [] };
  const who = new Map((people ?? []).map((p) => [p.id, p as { id: string; name: string; photo_url: string | null }]));

  // 받은 편지는 열어본 것으로 처리 (새 편지 표시는 이번 조회 기준으로 보여줌)
  const unread = new Set(letters.filter((l) => l.recipient_id === me.id && !l.read_at).map((l) => l.id));
  if (unread.size) await supabase.from("thanks_letters").update({ read_at: new Date().toISOString() }).in("id", [...unread]);

  let mentors: { id: string; name: string; photo_url: string | null }[] = [];
  if (me.role === "partner") {
    const { data: ms } = await supabase.from("matchings").select("mentor_id");
    const mids = [...new Set((ms ?? []).map((x) => x.mentor_id))];
    const { data: mm } = mids.length ? await supabase.from("members").select("id,name,photo_url").in("id", mids) : { data: [] };
    mentors = (mm ?? []) as typeof mentors;
  } else if (me.role === "sponsor") {
    redirect("/connect");
  }
  const received = letters.filter((l) => l.recipient_id === me.id);
  const sent = letters.filter((l) => l.sender_id === me.id);
  const tilt = (i: number) => `${[-1.2, 0.9, -0.5, 1.4, -0.9, 0.4][i % 6]}deg`;
  const short = (iso: string) => fmtDate(iso, locale);

  return (
    <div className="space-y-10">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" precedence="default" />
      <header>
        <h1 className="display text-[2rem] leading-[1.15] md:text-[2.4rem]">{t.title}</h1>
      </header>

      {me.role === "partner" && (
        <section className="grid gap-10 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
          {mentors.length === 0 ? (
            <p className="text-soft">{t.noMentor}</p>
          ) : (
            <form action={send} className="paper px-5 pb-8 pt-6 sm:px-8" style={{ transform: "rotate(-0.6deg)" }}>
              <label className="relative z-10 flex items-center gap-3 pl-10">
                <span className="hand">{t.toShort}.</span>
                <select name="recipient_id" required defaultValue={mentors[0].id} className="hand !w-auto !border-0 !border-b !border-dashed !border-black/25 !bg-transparent !px-2 !py-0">
                  {mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </label>
              <textarea name="body" required rows={9} maxLength={5000} placeholder={t.body}
                className="hand relative z-10 mt-3 block w-full resize-none !rounded-none !border-0 !bg-transparent !p-0 !pl-10 outline-none placeholder:text-black/30" />
              <div className="relative z-10 mt-6 flex items-center justify-between gap-4 pl-10">
                <span className="hand text-[1.7rem]">{me.name} {t.from}</span>
                <button className="seal !h-14 !w-14 transition-transform duration-500 [transition-timing-function:var(--ease)] hover:scale-105 active:scale-95" aria-label={t.send}>{t.seal}</button>
              </div>
            </form>
          )}
          <div>
            <h2 className="mb-5 text-[12px] font-medium tracking-[0.14em] text-soft">{t.sent}</h2>
            {sent.length === 0 && <p className="text-soft">{t.empty}</p>}
            <ul className="grid gap-5 sm:grid-cols-2">
              {sent.map((l, i) => {
                const p = who.get(l.recipient_id);
                return (
                  <li key={l.id} className="paper px-4 pb-5 pt-4 pl-12" style={{ transform: `rotate(${tilt(i)})` }}>
                    <p className="relative z-10 flex items-center gap-2 text-xs text-clay"><Avatar name={p?.name ?? "-"} url={p?.photo_url} size={22} />{t.to} {p?.name ?? "-"} · {short(l.created_at)}</p>
                    <p className="hand relative z-10 mt-2 line-clamp-5 whitespace-pre-line">{l.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {me.role === "mentor" && (
        <section>
          <h2 className="mb-5 text-[12px] font-medium tracking-[0.14em] text-soft">{t.received}</h2>
          {received.length === 0 && <p className="text-soft">{t.empty}</p>}
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {received.map((l, i) => {
              const p = who.get(l.sender_id);
              return (
                <li key={l.id} className="paper px-5 pb-7 pt-5 pl-14 sm:pl-16" style={{ transform: `rotate(${tilt(i)})` }}>
                  {unread.has(l.id) && <span className="seal absolute -right-2 -top-3 rotate-12">{t.newBadge}</span>}
                  <p className="relative z-10 flex items-center gap-2.5 text-sm text-clay">
                    <Avatar name={p?.name ?? "-"} url={p?.photo_url} size={34} />
                    <span><b className="block text-ink">{p?.name ?? "-"}</b><span className="text-xs">{short(l.created_at)}</span></span>
                  </p>
                  <p className="hand relative z-10 mt-3 whitespace-pre-line">{l.body}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
