import type { MetadataRoute } from "next";
import { localizeHref } from "@/lib/i18n";

const cbcPaths = ["/join", "/privacy"]; // CBC 공개 페이지(영어는 /en 접두)
const paths = ["/", "/about", "/mentor", "/partner", "/sponsor", "/camp", "/fund", "/stories", "/events", "/apply"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const cbc = { url: base, alternates: { languages: { ko: base, en: base + "/en" } } };
  const cbcPages = cbcPaths.map((p) => ({ url: base + p, alternates: { languages: { ko: base + p, en: base + "/en" + p } } }));
  return [cbc, ...cbcPages, ...paths.map((p) => ({
    url: base + localizeHref("ko", p),
    alternates: { languages: { ko: base + localizeHref("ko", p), en: base + localizeHref("en", p) } },
  }))];
}
