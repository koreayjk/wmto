import type { MetadataRoute } from "next";
import { localizeHref } from "@/lib/i18n";

const paths = ["/", "/about", "/mentor", "/partner", "/sponsor", "/camp", "/fund", "/stories", "/events", "/apply", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return paths.map((p) => ({
    url: base + (p === "/" ? "" : p),
    alternates: { languages: { ko: base + (p === "/" ? "" : p), en: base + localizeHref("en", p) } },
  }));
}
