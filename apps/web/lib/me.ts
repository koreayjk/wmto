import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Role } from "@/lib/codes";

export type Me = {
  id: string;
  role: Role | null;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  status: "applicant" | "active" | "inactive";
  /** 역할별 프로필 한 줄. 컬럼은 역할마다 다릅니다. */
  profile: Record<string, unknown> | null;
  stage: string | null;
};

/** 로그인한 회원. 로그아웃 상태이거나 회원 연결이 없으면 null. */
export async function getMe() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: m } = await supabase
    .from("members")
    .select("id,role,name,email,phone,country,status")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();
  if (!m) return null;
  let profile: Record<string, unknown> | null = null;
  if (m.role) {
    const { data } = await supabase.from(`${m.role}_profiles`).select("*").eq("member_id", m.id).maybeSingle();
    profile = data;
  }
  const me: Me = { ...(m as Omit<Me, "profile" | "stage">), profile, stage: (profile?.stage as string) ?? null };
  return { me, supabase };
}

/** 앱 페이지 가드. 활성 회원이 아니면 로그인 화면으로. */
export async function requireMe() {
  const r = await getMe();
  if (!r) redirect("/connect/login");
  if (r.me.status !== "active") redirect("/connect/login?error=inactive");
  return r;
}
