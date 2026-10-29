import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Role } from "@/lib/codes";
import { getViewAsId } from "@/lib/viewas";
import { pickDemoMember } from "@/lib/demo";

export type Me = {
  id: string;
  role: Role | null;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  photo_url: string | null;
  status: "applicant" | "active" | "inactive";
  /** 역할별 프로필 한 줄. 컬럼은 역할마다 다릅니다. */
  profile: Record<string, unknown> | null;
  stage: string | null;
};

/** 로그인한 회원. 로그아웃 상태이거나 회원 연결이 없으면 null. */
export const getMe = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  // 관리자의 "회원 화면 보기": 그 회원 시점으로, 읽기 전용으로 보여 줍니다(관리자에게만 효력).
  const viewId = await getViewAsId();
  if (viewId) {
    const { data: adm } = await supabase.from("admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
    if (adm) {
      const { data: vm } = await supabase.from("members").select("id,role,name,email,phone,country,photo_url,status").eq("id", viewId).maybeSingle();
      if (vm) {
        let vp: Record<string, unknown> | null = null;
        if (vm.role) {
          const { data } = await supabase.from(`${vm.role}_profiles`).select("*").eq("member_id", vm.id).maybeSingle();
          vp = data;
        }
        const viewMe: Me = { ...(vm as Omit<Me, "profile" | "stage">), profile: vp, stage: (vp?.stage as string) ?? null };
        return { me: viewMe, supabase: await createSupabaseServerClient({ viewAs: viewId }), viewAs: { id: viewId, name: vm.name, role: vm.role as Role | null }, demo: false };
      }
    }
  }

  const [{ data: m }, { data: dv }] = await Promise.all([
    supabase.from("members").select("id,role,name,email,phone,country,photo_url,status").eq("auth_user_id", auth.user.id).maybeSingle(),
    supabase.from("demo_viewers").select("user_id").eq("user_id", auth.user.id).maybeSingle(),
  ]);
  if (!m) {
    // 공개 데모 계정: 가상 회원의 시점으로 읽기 전용 화면을 보여 줍니다(데이터베이스가 데모 회원만 허용).
    if (!dv) return null;
    const candidates = [viewId, await pickDemoMember("mentor")].filter(Boolean) as string[];
    for (const id of candidates) {
      const vc = await createSupabaseServerClient({ viewAs: id });
      // 회원 정보와 세 역할의 프로필을 한 번에 조회합니다(왕복 1회).
      const [{ data: vm }, mp, pp, sp] = await Promise.all([
        vc.from("members").select("id,role,name,email,phone,country,photo_url,status").eq("id", id).maybeSingle(),
        vc.from("mentor_profiles").select("*").eq("member_id", id).maybeSingle(),
        vc.from("partner_profiles").select("*").eq("member_id", id).maybeSingle(),
        vc.from("sponsor_profiles").select("*").eq("member_id", id).maybeSingle(),
      ]);
      if (!vm) continue;
      const vp = ((vm.role === "mentor" ? mp : vm.role === "partner" ? pp : sp).data ?? null) as Record<string, unknown> | null;
      const demoMe: Me = { ...(vm as Omit<Me, "profile" | "stage">), profile: vp, stage: (vp?.stage as string) ?? null };
      return { me: demoMe, supabase: vc, viewAs: { id, name: vm.name, role: vm.role as Role | null }, demo: true };
    }
    return null;
  }
  let profile: Record<string, unknown> | null = null;
  if (m.role) {
    const { data } = await supabase.from(`${m.role}_profiles`).select("*").eq("member_id", m.id).maybeSingle();
    profile = data;
  }
  const me: Me = { ...(m as Omit<Me, "profile" | "stage">), profile, stage: (profile?.stage as string) ?? null };
  return { me, supabase, viewAs: null as { id: string; name: string; role: Role | null } | null, demo: false };
});

/** 앱 페이지 가드. 활성 회원이 아니면 로그인 화면으로. */
export async function requireMe() {
  const r = await getMe();
  if (!r) redirect("/connect/login");
  if (r.me.status !== "active") redirect("/connect/login?error=inactive");
  return r;
}
