import type { Metadata, Viewport } from "next";
import { getMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { BottomNav, type NavItem } from "@/components/connect/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { VIEW_AS_COOKIE } from "@/lib/viewas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoModes, pickDemoMember, type DemoMode } from "@/lib/demo";
import { Sidebar, type SideGroup } from "@/components/connect/Sidebar";
import { ContentFrame } from "@/components/connect/ContentFrame";
import { DemoHint } from "@/components/connect/DemoHint";
import { Avatar } from "@/components/connect/Avatar";
import { DemoGuard } from "@/components/connect/DemoGuard";

export const metadata: Metadata = {
  title: "WMTO Connect",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "WMTO", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#16130f", viewportFit: "cover" };
// 로그인 상태에 따라 달라지므로 정적 생성 금지
export const dynamic = "force-dynamic";

async function exitViewAs() {
  "use server";
  (await cookies()).delete(VIEW_AS_COOKIE);
  redirect("/admin/view-as");
}

/** 공개 데모: 사업가 / 선교사 / 후원자 모드 바꾸기 */
async function switchDemoMode(fd: FormData) {
  "use server";
  const mode = String(fd.get("mode") ?? "") as DemoMode;
  if (!(demoModes as readonly string[]).includes(mode)) return;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { data: dv } = await supabase.from("demo_viewers").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!dv) return;
  const id = await pickDemoMember(mode);
  if (!id) return;
  (await cookies()).set(VIEW_AS_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  redirect("/connect");
}

async function exitDemo() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  (await cookies()).delete(VIEW_AS_COOKIE);
  redirect("/connect/demo");
}

export default async function ConnectLayout({ children }: { children: React.ReactNode }) {
  const locale = await getPortalLocale();
  const m = getMessages(locale).connect;
  const r = await getMe();
  const active = r && r.me.status === "active" ? r.me : null;

  const items: NavItem[] = [{ href: "/connect", label: m.nav.home }, { href: "/connect/events", label: m.nav.events }];
  if (active?.role === "mentor" || active?.role === "partner") {
    items.push({ href: "/connect/mentoring", label: m.nav.mentoring }, { href: "/connect/report", label: m.nav.report });
  }
  if (active?.role === "sponsor") {
    items.push({ href: "/connect/giving", label: m.sponsor.navGiving }, { href: "/connect/news", label: m.sponsor.navNews });
  }
  items.push({
    href: "/connect/more",
    label: m.nav.more,
    also: ["/connect/tent", "/connect/growth", "/connect/matching", "/connect/referrals", "/connect/thanks", "/connect/academy", "/connect/profile", "/connect/fund"],
  });

  const it = m.more.items;
  const role = active?.role;
  const network: { href: string; label: string }[] = [{ href: "/connect/tent", label: m.tent.title }];
  if (role === "partner") network.push({ href: "/connect/matching", label: it.matching.name }, { href: "/connect/thanks", label: it.thanks.name });
  if (role === "mentor") network.push({ href: "/connect/matching", label: it.requests.name }, { href: "/connect/referrals", label: it.referrals.name }, { href: "/connect/thanks", label: it.thanks.name });
  const activity = [{ href: "/connect/events", label: m.nav.events }];
  const reports: { href: string; label: string }[] = [];
  if (role === "mentor" || role === "partner") {
    activity.push({ href: "/connect/mentoring", label: m.nav.mentoring });
    reports.push({ href: "/connect/report", label: m.report.title }, { href: "/connect/growth", label: it.growth.name });
  }
  const groups: SideGroup[] = [{ items: [{ href: "/connect", label: m.nav.home }] }];
  if (role === "sponsor") {
    groups.push({ title: m.sponsor.group, items: [{ href: "/connect/giving", label: m.sponsor.navGiving }, { href: "/connect/news", label: m.sponsor.navNews }, { href: "/connect/fund", label: m.sponsor.navFund }] });
  }
  if (role === "mentor") network.push({ href: "/connect/fund", label: m.sponsor.navFund });
  if (network.length) groups.push({ title: m.side.network, items: network });
  groups.push({ title: m.side.activity, items: activity });
  if (reports.length) groups.push({ title: m.side.report, items: reports });
  groups.push({ title: m.side.learn, items: [{ href: "/connect/academy", label: it.academy.name }] }, { items: [{ href: "/connect/profile", label: it.profile.name }] });
  const stageName = active?.stage ? m.stageNames[active.stage as keyof typeof m.stageNames] : null;

  return (
    <div className={`connect min-h-svh lg:flex ${r?.demo ? "pt-[3.25rem]" : r?.viewAs ? "pt-9" : ""}`}>
      <ServiceWorker />
      {r?.demo && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 bg-ink px-4 py-1.5 text-[13px] text-white">
          <span className="hidden sm:inline">{m.demo.bar}</span>
          <form action={switchDemoMode} className="flex gap-1 rounded-full bg-white/10 p-1" aria-label={m.demo.modes}>
            {demoModes.map((k) => (
              <button key={k} name="mode" value={k} aria-pressed={r.viewAs?.role === k}
                className={`rounded-full px-3.5 py-1 font-medium transition-colors duration-500 ${r.viewAs?.role === k ? "bg-white text-ink" : "text-white/80 hover:bg-white/15"}`}>
                {getMessages(locale).apply.options.role[k]}
              </button>
            ))}
          </form>
          <form action={exitDemo}><button className="rounded-full px-3 py-1 text-white/70 hover:text-white">{m.demo.exit}</button></form>
        </div>
      )}
      {r?.viewAs && !r.demo && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-ink px-4 py-2 text-[13px] text-white">
          <span>
            관리자 보기 중: <b>{r.viewAs.name}</b>
            {r.viewAs.role ? ` (${getMessages(locale).apply.options.role[r.viewAs.role]})` : ""} · 읽기 전용입니다. 저장은 되지 않습니다.
          </span>
          <form action={exitViewAs}><button className="rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25">나가기</button></form>
        </div>
      )}
      {active && (
        <aside className="relative z-10 hidden w-72 shrink-0 lg:block">
          <div className={`sticky flex flex-col overflow-y-auto px-5 py-8 ${r?.demo ? "top-[3.25rem] h-[calc(100svh-3.25rem)]" : r?.viewAs ? "top-9 h-[calc(100svh-2.25rem)]" : "top-0 h-svh"}`}>
            <div className="mb-10 flex items-center gap-2.5 px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.svg" alt="" width={32} height={32} className="h-8 w-8" />
              <span className="font-display text-lg font-bold tracking-wide">WMTO</span>
              <span className="text-xs uppercase tracking-[0.2em] text-clay">Connect</span>
            </div>
            <Sidebar groups={groups} />
          </div>
        </aside>
      )}
      <div className="relative min-w-0 flex-1">
        <header className="relative z-10 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-xl items-center px-5 lg:h-20 lg:max-w-none lg:px-10 xl:px-14">
            <span className="flex items-center gap-2 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-lg font-bold tracking-wide">WMTO</span>
              <span className="text-xs uppercase tracking-[0.2em] text-clay">Connect</span>
            </span>
            {active && (
              <span className="ml-auto flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-1.5 text-sm shadow-[0_8px_20px_-14px_rgba(14,70,58,0.5),0_0_0_1px_rgba(22,24,29,0.05)]">
                <Avatar name={active.name} url={active.photo_url} size={30} />
                <span className="hidden text-ink/70 sm:inline">{active.name}</span>
                {stageName && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">{stageName}</span>}
              </span>
            )}
          </div>
        </header>
        <main className={`px-5 pt-2 lg:px-10 xl:px-14 lg:pt-4 ${active ? "pb-32 lg:pb-20" : "pb-12"}`}>
          {r?.demo && active?.role && <DemoHint hints={m.demo.hints[active.role]} />}
          <ContentFrame>{children}</ContentFrame>
          {r?.demo && <DemoGuard message={m.demo.saveToast} />}
        </main>
      </div>
      {active && <BottomNav items={items} />}
    </div>
  );
}
