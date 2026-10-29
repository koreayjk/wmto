import { AdminNav } from "@/components/connect/AdminNav";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n";

export const metadata = { robots: { index: false, follow: false } };
// 로그인 상태를 매 요청마다 확인해야 하므로 정적 생성 금지
export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const m = getMessages().admin;
  const links = [
    { href: "/admin", label: m.applications },
    { href: "/admin/members", label: "회원" },
    { href: "/admin/matchings", label: "매칭" },
    { href: "/admin/stages", label: "성장 단계" },
    { href: "/admin/academy", label: "아카데미" },
    { href: "/admin/donations", label: "후원·기금" },
    { href: "/admin/events", label: m.events },
    { href: "/admin/stories", label: m.stories },
  ];
  return (
    <div className="connect min-h-svh text-[15px]">
      <header className="sticky top-3 z-40 px-3 pt-3 md:top-4 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 rounded-[2rem] bg-white/85 py-2.5 pl-5 pr-3 shadow-[0_14px_30px_-18px_rgba(14,70,58,0.45),0_0_0_1px_rgba(22,24,29,0.06)] backdrop-blur-xl">
          <span className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <b className="font-display text-[15px] tracking-tight">WMTO {m.title}</b>
          </span>
          <AdminNav links={links} />
          <form action={logout} className="ml-auto">
            <button className="rounded-full px-3.5 py-1.5 text-[14px] text-ink/60 transition-colors duration-500 hover:bg-black/[0.05] hover:text-ink">{m.logout}</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-6 md:pt-14">{children}</div>
    </div>
  );
}
