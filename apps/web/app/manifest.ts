import type { MetadataRoute } from "next";
import { BRAND, BRAND_FULL } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} · ${BRAND_FULL}`,
    short_name: BRAND,
    description: "크리스천 사업가 네트워크 회원 앱 (선교 사역 WMTO 포함)",
    lang: "ko",
    start_url: "/connect",
    scope: "/",
    display: "standalone",
    background_color: "#16130f",
    theme_color: "#16130f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
