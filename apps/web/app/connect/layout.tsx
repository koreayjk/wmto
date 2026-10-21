import type { Metadata, Viewport } from "next";
import { getMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { BottomNav, type NavItem } from "@/components/connect/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";

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
  const m = getMessages().connect;
  const r = await getMe();
  const active = r && r.me.status === "active" ? r.me : null;

  const items: NavItem[] = [{ href: "/connect", label: m.nav.home }, { href: "/connect/events", label: m.nav.events }];
  if (active?.role === "mentor" || active?.role === "partner") {
    items.push({ href: "/connect/mentoring", label: m.nav.mentoring }, { href: "/connect/report", label: m.nav.report });
  }
  items.push({
    href: "/connect/more",
    label: m.nav.more,
    also: ["/connect/growth", "/connect/matching", "/connect/referrals", "/connect/thanks", "/connect/academy", "/connect/profile"],
  });

  return (
    <div className="min-h-svh bg-paper">
      <ServiceWorker />
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-xl items-center px-5">
          <span className="font-serif text-lg font-bold tracking-wide">WMTO</span>
          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-clay">Connect</span>
        </div>
      </header>
      <main className={`mx-auto max-w-xl px-5 pt-6 ${active ? "pb-28" : "pb-12"}`}>{children}</main>
      {active && <BottomNav items={items} />}
    </div>
  );
}
