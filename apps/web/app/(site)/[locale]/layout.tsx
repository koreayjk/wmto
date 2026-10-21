import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { getMessages, isLocale } from "@/lib/i18n";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: m.site.name, template: "%s · WMTO" },
    description: m.site.description,
    openGraph: { title: m.site.name, description: m.site.description, locale: locale === "en" ? "en_US" : "ko_KR", type: "website" },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
        <a href="#main" className="sr-only rounded-lg bg-accent px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
          {m.site.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
