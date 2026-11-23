"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 권한은 데이터베이스 함수가 확인합니다(운영진 또는 해당 텐트의 텐트장).
export async function decideRenewal(fd: FormData) {
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("decide_renewal", {
    p_id: String(fd.get("id")), p_action: String(fd.get("action")), p_note: String(fd.get("note") ?? ""), p_plan: String(fd.get("plan") ?? ""),
  });
  revalidatePath("/connect/renewal"); revalidatePath("/admin/renewal");
}

export async function openRenewals() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("open_renewal_reviews");
  revalidatePath("/admin/renewal");
  return data as number | null;
}

export async function sendAppeal(fd: FormData) {
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("renewal_appeal", { p_note: String(fd.get("note") ?? "") });
  revalidatePath("/connect/growth");
}
