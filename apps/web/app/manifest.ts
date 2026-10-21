import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WMTO Connect",
    short_name: "WMTO",
    description: "WMTO 자립선교 비즈니스 네트워크 회원 앱",
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
