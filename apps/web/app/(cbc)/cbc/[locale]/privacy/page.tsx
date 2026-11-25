import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { isCbcLocale } from "@/lib/cbc-copy";
import { getMessages } from "@/lib/i18n";
import { CbcShell } from "@/components/cbc/CbcShell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isCbcLocale(locale)) return {};
  return { title: `${getMessages(locale).privacy.title} · ${BRAND}`, alternates: { canonical: locale === "en" ? "/en/privacy" : "/privacy", languages: { ko: "/privacy", en: "/en/privacy" } } };
}

export default async function CbcPrivacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isCbcLocale(locale)) notFound();
  const p = getMessages(locale).privacy;
  return (
    <CbcShell locale={locale} switchHref={locale === "en" ? "/privacy" : "/en/privacy"}>
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="display text-4xl md:text-5xl">{p.title}</h1>
        <div className="mt-8 space-y-6 text-soft">
          <p><b className="text-ink">{p.draft}</b> {p.draftNote}</p>
          {p.items.map((t) => <p key={t}>{t}</p>)}
        </div>
      </div>
    </CbcShell>
  );
}
