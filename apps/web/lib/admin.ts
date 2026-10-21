import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** 관리자 페이지 가드. 로그인하지 않았거나 admins 에 없으면 /admin/login 으로 보냅니다. */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row) redirect("/admin/login?error=forbidden");
  return { supabase, user: data.user };
}
