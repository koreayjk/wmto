/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

/** 내가 리더(텐트장·부텐트장)인 텐트 목록. 운영진은 모든 텐트. 권한은 DB 함수가 다시 확인합니다. */
export async function leaderChapters(supabase: SupabaseClient<any, any, any>, memberId: string): Promise<{ id: string; name: string }[]> {
  const { data: isAdmin } = await supabase.from("admins").select("user_id").limit(1).maybeSingle();
  if (isAdmin) {
    const { data } = await supabase.from("chapters").select("id,name").order("name");
    return (data ?? []) as { id: string; name: string }[];
  }
  const { data } = await supabase.from("chapter_leaders").select("chapter_id, chapters(id,name)").eq("member_id", memberId);
  return ((data ?? []) as unknown as { chapters: { id: string; name: string } | { id: string; name: string }[] | null }[])
    .map((r) => (Array.isArray(r.chapters) ? r.chapters[0] : r.chapters)).filter(Boolean) as { id: string; name: string }[];
}
