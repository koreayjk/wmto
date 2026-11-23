import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { cbcCopy, isCbcLocale } from "@/lib/cbc-copy";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isCbcLocale(locale)) return {};
  const c = cbcCopy[locale].meta;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: c.title, description: c.description,
    alternates: { canonical: locale === "en" ? "/en" : "/", languages: { ko: "/", en: "/en" } },
    openGraph: { title: c.title, description: c.description, locale: locale === "en" ? "en_US" : "ko_KR", type: "website" },
  };
}

export default async function CbcLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isCbcLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
