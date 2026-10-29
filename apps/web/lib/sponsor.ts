/** 후원자 화면이 RPC 로 받는 행의 모양 (supabase/migrations/0005_sponsor.sql) */
export type FeedRow = {
  partner_name: string; mission_field: string | null; stage: string | null; stage_changed_at: string | null;
  report_month: string | null; self_reliance: number | null; prayer_topics: string | null; given: number; last_gift: string | null;
};
export type FundRow = { total_lent: number; total_repaid: number; loans: number; active_loans: number; partners_started: number; reflowed: number };
