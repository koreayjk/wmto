import type { Viewport } from "next";
import "@/app/globals.css";
import { getRequestLocale } from "@/lib/locale";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** 회원 앱·관리자·인증 경로의 루트 레이아웃. 언어는 proxy 가 요청마다 정해 줍니다. */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
