import type { Metadata, Viewport } from "next";
import { getMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { BottomNav, type NavItem } from "@/components/connect/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";
import { Sidebar, type SideGroup } from "@/components/connect/Sidebar";
import { ContentFrame } from "@/components/connect/ContentFrame";

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
    also: ["/connect/growth", "/connect/matching", "/connect/referrals", "/connect/thanks", "/connect/academy", "/connect/profile", "/connect/fund"],
  });

  const it = m.more.items;
  const role = active?.role;
  const network: { href: string; label: string }[] = [];
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
    <div className="connect min-h-svh lg:flex">
      <ServiceWorker />
      {active && (
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-0 flex h-svh flex-col overflow-y-auto px-5 py-8">
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
      <div className="min-w-0 flex-1">
        <header className="pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-xl items-center px-5 lg:h-20 lg:max-w-none lg:px-10 xl:px-14">
            <span className="flex items-center gap-2 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-lg font-bold tracking-wide">WMTO</span>
              <span className="text-xs uppercase tracking-[0.2em] text-clay">Connect</span>
            </span>
            {active && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-white/80 py-1.5 pl-4 pr-1.5 text-sm shadow-[0_8px_20px_-14px_rgba(14,70,58,0.5),0_0_0_1px_rgba(22,24,29,0.05)]">
                <span className="hidden text-ink/70 sm:inline">{active.name}</span>
                {stageName && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">{stageName}</span>}
              </span>
            )}
          </div>
        </header>
        <main className={`px-5 pt-2 lg:px-10 xl:px-14 lg:pt-4 ${active ? "pb-32 lg:pb-20" : "pb-12"}`}>
          <ContentFrame>{children}</ContentFrame>
        </main>
      </div>
      {active && <BottomNav items={items} />}
    </div>
  );
}
