import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

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
  const { data: people } = ids.length ? await supabase.from("members").select("id,name").in("id", ids) : { data: [] };
  const name = new Map((people ?? []).map((p) => [p.id, p.name]));

  // 받은 편지는 열어본 것으로 처리 (새 편지 표시는 이번 조회 기준으로 보여줌)
  const unread = new Set(letters.filter((l) => l.recipient_id === me.id && !l.read_at).map((l) => l.id));
  if (unread.size) await supabase.from("thanks_letters").update({ read_at: new Date().toISOString() }).in("id", [...unread]);

  let mentors: { id: string; name: string }[] = [];
  if (me.role === "partner") {
    const { data: ms } = await supabase.from("matchings").select("mentor_id");
    const mids = [...new Set((ms ?? []).map((x) => x.mentor_id))];
    const { data: mm } = mids.length ? await supabase.from("members").select("id,name").in("id", mids) : { data: [] };
    mentors = mm ?? [];
  } else if (me.role === "sponsor") {
    redirect("/connect");
  }
  const received = letters.filter((l) => l.recipient_id === me.id);
  const sent = letters.filter((l) => l.sender_id === me.id);

  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>
      {me.role === "partner" && (
        <Card title={t.write}>
          {mentors.length === 0 ? (
            <p className="text-soft">{t.noMentor}</p>
          ) : (
            <form action={send} className="space-y-4">
              <label className="block">
                <span className={labelCls}>{t.to}</span>
                <select name="recipient_id" required defaultValue={mentors[0].id} className="field">
                  {mentors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </label>
              <label className="block"><span className={labelCls}>{t.body}</span><textarea name="body" required rows={6} maxLength={5000} className="field" /></label>
              <button className="cbtn w-full">{t.send}</button>
            </form>
          )}
        </Card>
      )}

      {me.role === "mentor" && (
        <>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.received}</h2>
          {received.length === 0 && <p className="text-soft">{t.empty}</p>}
          {received.map((l) => (
            <Card key={l.id}>
              <p className="text-xs text-clay">{name.get(l.sender_id) ?? "-"} · {fmtDate(l.created_at, locale)}{unread.has(l.id) && <b className="ml-2 text-white"><span className="rounded-full bg-accent px-2 py-0.5 text-xs">{t.newBadge}</span></b>}</p>
              <p className="mt-2 whitespace-pre-line font-display text-lg leading-relaxed">{l.body}</p>
            </Card>
          ))}
        </>
      )}

      {me.role === "partner" && (
        <>
          <h2 className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-soft">{t.sent}</h2>
          {sent.length === 0 && <p className="text-soft">{t.empty}</p>}
          {sent.map((l) => (
            <Card key={l.id}>
              <p className="text-xs text-clay">{name.get(l.recipient_id) ?? "-"} · {fmtDate(l.created_at, locale)}</p>
              <p className="mt-2 whitespace-pre-line text-soft">{l.body}</p>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
