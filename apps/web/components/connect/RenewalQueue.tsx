import { decideRenewal } from "@/lib/renewal-actions";

export type RenewalRow = {
  id: string; name: string; business_name: string | null; industry: string | null; chapter_name: string | null; term_end: string; round_no: number;
  avg_score: number | null; level: string | null; suggestion: "renew" | "plan" | "hold" | "not_renew"; status: "open" | "planned" | "on_hold" | "not_renewed";
  plan: string | null; leader_note: string | null; appeal_note: string | null; support_until: string | null;
};
type T = { queueEmpty: string; avg: string; term: string; round: string; level: Record<string, string>; suggest: Record<string, string>; status: Record<string, string>;
  plan: string; planHint: string; note: string; appeal: string; actions: { renew: string; plan: string; hold: string; notRenew: string }; supportUntil: string };

/** 갱신 심사 목록. 결정 버튼은 DB 함수가 권한을 다시 확인합니다. 미갱신은 운영진만 누를 수 있습니다. */
export function RenewalQueue({ rows, t, admin }: { rows: RenewalRow[]; t: T; admin: boolean }) {
  if (!rows.length) return <p className="text-soft">{t.queueEmpty}</p>;
  return (
    <ul className="divide-y divide-black/[0.06]">
      {rows.map((r) => {
        const open = r.status === "open" || r.status === "planned";
        return (
          <li key={r.id} className="py-5 first:pt-0 last:pb-0">
            <p className="font-medium">{r.name}
              <span className="ml-2 text-xs text-soft">{[r.chapter_name, r.business_name, r.industry].filter(Boolean).join(" · ")}</span></p>
            <p className="mt-1 text-sm text-soft">
              {t.avg} <b className="text-ink">{r.avg_score ?? "-"}</b> · {r.level ? t.level[r.level] : "-"} · {t.term} {r.term_end}{r.round_no > 1 ? ` · ${r.round_no}${t.round}` : ""}
            </p>
            <p className="mt-1 text-sm"><span className="gilt text-[11px] font-semibold">{t.status[r.status]}</span> <span className="ml-1">{t.suggest[r.suggestion]}</span>
              {r.support_until && <span className="ml-2 text-soft">{t.supportUntil} {r.support_until}</span>}</p>
            {r.appeal_note && <p className="mt-2 rounded-xl bg-tint px-3 py-2 text-sm"><b>{t.appeal}</b> · {r.appeal_note}</p>}
            {r.plan && <p className="mt-2 text-sm text-soft">{t.plan}: {r.plan}</p>}
            {open && (
              <form action={decideRenewal} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={r.id} />
                <textarea name="plan" rows={2} maxLength={2000} placeholder={t.planHint} defaultValue={r.plan ?? ""} className="field" />
                <input name="note" maxLength={1000} placeholder={t.note} className="field" />
                <div className="flex flex-wrap gap-2">
                  <button name="action" value="renew" className="cbtn cbtn-sm">{t.actions.renew}</button>
                  <button name="action" value="plan" className="cbtn cbtn-quiet cbtn-sm">{t.actions.plan}</button>
                  <button name="action" value="hold" className="cbtn cbtn-quiet cbtn-sm">{t.actions.hold}</button>
                  {admin && <button name="action" value="not_renew" className="cbtn cbtn-quiet cbtn-sm">{t.actions.notRenew}</button>}
                </div>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
