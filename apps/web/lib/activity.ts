import type { SupabaseClient } from "@supabase/supabase-js";
import type { Me } from "./me";
import { currentMonthKst } from "./format";

export type Cat = "attendance" | "mentoring" | "reports" | "referrals" | "letters";

/** 역할별로 보여 줄 항목. 선교사는 보낸 감사 편지, 사업가는 받은 감사 편지를 셉니다. */
export const catsFor = (role: Me["role"]): Cat[] =>
  role === "mentor" ? ["attendance", "mentoring", "referrals", "letters"] : ["attendance", "mentoring", "reports", "letters"];

const KST = 9 * 3600_000;
const monthOf = (iso: string) => new Date(new Date(iso).getTime() + KST).toISOString().slice(0, 7);

export type MonthRow = { month: string; counts: Record<Cat, number>; total: number };

/**
 * 최근 N개월(이번 달 포함)의 나눔 기록 건수. 순위가 아니라 걸어온 길을 보여 주기 위한 숫자입니다.
 * 모든 조회는 본인 권한(RLS)으로 이루어져 본인 것만 보입니다.
 */
export async function monthlyActivity(supabase: SupabaseClient, me: Me, n = 6): Promise<MonthRow[]> {
  const cur = currentMonthKst().slice(0, 7);
  const [y, mo] = cur.split("-").map(Number);
  const months = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, mo - 1 - (n - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
  const since = `${months[0]}-01T00:00:00+09:00`;
  const sinceDate = `${months[0]}-01`;
  const dates = async (q: PromiseLike<{ data: { d: string }[] | null }>) => (await q).data?.map((r) => r.d) ?? [];

  const [att, men, rep, ref, let_] = await Promise.all([
    dates(supabase.from("attendance").select("d:attended_at").eq("member_id", me.id).gte("attended_at", since).limit(2000) as never),
    dates((me.role === "mentor"
      ? supabase.from("mentoring_logs").select("d:held_at").eq("created_by", me.id).gte("held_at", since)
      : supabase.from("mentoring_logs").select("d:held_at").gte("held_at", since)).limit(2000) as never),
    me.role === "partner" ? dates(supabase.from("self_reports").select("d:month").eq("partner_id", me.id).gte("month", sinceDate).limit(100) as never) : Promise.resolve([] as string[]),
    me.role === "mentor" ? dates(supabase.from("referrals").select("d:created_at").eq("giver_id", me.id).gte("created_at", since).limit(2000) as never) : Promise.resolve([] as string[]),
    dates(supabase.from("thanks_letters").select("d:created_at").eq(me.role === "partner" ? "sender_id" : "recipient_id", me.id).gte("created_at", since).limit(2000) as never),
  ]);

  const rows: MonthRow[] = months.map((month) => ({ month, counts: { attendance: 0, mentoring: 0, reports: 0, referrals: 0, letters: 0 }, total: 0 }));
  const idx = new Map(rows.map((r, i) => [r.month, i]));
  const add = (list: string[], cat: Cat, plain = false) =>
    list.forEach((d) => { const i = idx.get(plain ? d.slice(0, 7) : monthOf(d)); if (i !== undefined) { rows[i].counts[cat]++; rows[i].total++; } });
  add(att, "attendance"); add(men, "mentoring"); add(rep, "reports", true); add(ref, "referrals"); add(let_, "letters");
  return rows;
}
