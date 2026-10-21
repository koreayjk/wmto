import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-white text-[15px]">
      <header className="flex flex-wrap items-center gap-6 border-b border-line px-6 py-4">
        <b className="font-serif text-lg">WMTO {m.title}</b>
        <nav className="flex gap-5 text-soft">
          <Link href="/admin" className="hover:text-ink">{m.applications}</Link>
          <Link href="/admin/members" className="hover:text-ink">회원</Link>
          <Link href="/admin/matchings" className="hover:text-ink">매칭</Link>
          <Link href="/admin/stages" className="hover:text-ink">성장 단계</Link>
          <Link href="/admin/academy" className="hover:text-ink">아카데미</Link>
          <Link href="/admin/events" className="hover:text-ink">{m.events}</Link>
          <Link href="/admin/stories" className="hover:text-ink">{m.stories}</Link>
        </nav>
        <form action={logout} className="ml-auto">
          <button className="text-soft hover:text-ink">{m.logout}</button>
        </form>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
