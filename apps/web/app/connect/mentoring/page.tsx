import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { fmtDateTime, kstLocalToIso, nowKstLocal } from "@/lib/format";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

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
  await supabase.from("mentoring_logs").insert({
    matching_id: matchingId, held_at: heldAt, duration_min: duration, content: content.slice(0, 5000), created_by: me.id,
  });
  revalidatePath("/connect/mentoring");
}

export default async function Mentoring() {
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor" && me.role !== "partner") redirect("/connect");
  const m = getMessages().connect;
  const t = m.mentoring;

  const { data: matchings } = await supabase.from("matchings").select("id,mentor_id,partner_id,contribution_type,status");
  const otherIds = [...new Set((matchings ?? []).map((x) => (me.role === "mentor" ? x.partner_id : x.mentor_id)))];
  const { data: people } = otherIds.length ? await supabase.from("members").select("id,name").in("id", otherIds) : { data: [] };
  const nameOf = new Map((people ?? []).map((p) => [p.id, p.name]));
  const matchingIds = (matchings ?? []).map((x) => x.id);
  const { data: logs } = matchingIds.length
    ? await supabase.from("mentoring_logs").select("id,matching_id,held_at,duration_min,content").in("matching_id", matchingIds).order("held_at", { ascending: false }).limit(100)
    : { data: [] };
  const matchingOf = new Map((matchings ?? []).map((x) => [x.id, x]));
  const active = (matchings ?? []).filter((x) => x.status === "active");

  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>

      {me.role === "mentor" && (
        <Card title={t.newTitle}>
          {active.length ? (
            <form action={addLog} className="space-y-4">
              <label className="block">
                <span className={labelCls}>{t.matching}</span>
                <select name="matching_id" required className="field">
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
              <button className="w-full bg-clay py-3.5 font-medium text-white rounded-lg">{t.save}</button>
            </form>
          ) : (
            <p className="text-soft">{t.noMatching}</p>
          )}
        </Card>
      )}

      {(logs ?? []).length === 0 ? (
        <p className="pt-2 text-soft">{t.empty}</p>
      ) : (
        (logs ?? []).map((l) => {
          const mt = matchingOf.get(l.matching_id);
          const other = mt ? nameOf.get(me.role === "mentor" ? mt.partner_id : mt.mentor_id) : null;
          return (
            <Card key={l.id}>
              <p className="text-xs text-clay">
                {fmtDateTime(l.held_at)} · {l.duration_min}{t.minutes}
              </p>
              <p className="mt-1 font-display text-lg font-semibold">
                {me.role === "partner" ? `${t.withMentor} ` : ""}{other ?? "-"}
              </p>
              <p className="mt-2 whitespace-pre-line text-soft">{l.content}</p>
            </Card>
          );
        })
      )}
    </div>
  );
}
