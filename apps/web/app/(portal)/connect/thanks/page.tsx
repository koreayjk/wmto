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
  const short = (iso: string) => fmtDate(iso, locale);

  return (
    <div className="space-y-12">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" precedence="default" />
      <header>
        <p className="gilt text-[11px] font-medium uppercase tracking-[0.3em]">Letters</p>
        <h1 className="display mt-3 text-[2rem] leading-[1.15] md:text-[2.4rem]">{t.title}</h1>
      </header>

      {me.role === "partner" && (
        <section className="grid gap-12 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
          {mentors.length === 0 ? (
            <p className="text-soft">{t.noMentor}</p>
          ) : (
            <form action={send} className="stationery px-8 pb-9 pt-10 sm:px-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.svg" alt="" width={26} height={26} className="mx-auto h-[26px] w-[26px] opacity-70" />
              <label className="mt-8 flex items-baseline gap-3 border-b border-black/10 pb-3">
                <span className="gilt text-[11px] font-medium uppercase tracking-[0.24em]">{t.toShort}</span>
                <select name="recipient_id" required defaultValue={mentors[0].id} className="serif !w-auto !border-0 !bg-transparent !p-0 text-lg outline-none">
                  {mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </label>
              <textarea name="body" required rows={10} maxLength={5000} placeholder={t.body}
                className="letter-body mt-6 block w-full resize-none !rounded-none !border-0 !bg-transparent !p-0 outline-none placeholder:text-black/25" />
              <div className="hair-t mt-8 flex items-end justify-between gap-4 pt-6">
                <span className="pen">{me.name} {t.from}</span>
                <button className="cbtn cbtn-sm">{t.send}</button>
              </div>
            </form>
          )}
          <div>
            <h2 className="gilt mb-6 text-[11px] font-medium uppercase tracking-[0.24em]">{t.sent}</h2>
            {sent.length === 0 && <p className="text-soft">{t.empty}</p>}
            <ul className="space-y-6">
              {sent.map((l) => {
                const p = who.get(l.recipient_id);
                return (
                  <li key={l.id} className="stationery px-7 pb-7 pt-6">
                    <p className="flex items-center gap-2.5 text-xs text-soft"><Avatar name={p?.name ?? "-"} url={p?.photo_url} size={24} /><span><b className="font-medium text-ink">{p?.name ?? "-"}</b> · {short(l.created_at)}</span></p>
                    <p className="letter-body mt-4 line-clamp-4 whitespace-pre-line text-[0.95rem]">{l.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {me.role === "mentor" && (
        <section>
          <h2 className="gilt mb-7 text-[11px] font-medium uppercase tracking-[0.24em]">{t.received}</h2>
          {received.length === 0 && <p className="text-soft">{t.empty}</p>}
          <ul className="columns-1 gap-8 md:columns-2 xl:columns-3 [&>li]:mb-8">
            {received.map((l) => {
              const p = who.get(l.sender_id);
              return (
                <li key={l.id} className="stationery break-inside-avoid px-8 pb-8 pt-8">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={p?.name ?? "-"} url={p?.photo_url} size={38} />
                      <span><b className="serif block font-medium">{p?.name ?? "-"}</b><span className="text-xs text-soft">{short(l.created_at)}</span></span>
                    </span>
                    {unread.has(l.id) && <span className="gilt flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em]"><span className="h-1.5 w-1.5 rounded-full bg-[#b8975a]" />{t.newBadge}</span>}
                  </div>
                  <p className="letter-body hair-t mt-5 whitespace-pre-line pt-5">{l.body}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
