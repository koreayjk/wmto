import type { Metadata } from "next";
import Link from "next/link";
import { CbcShell } from "@/components/cbc/CbcShell";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { cbcCopy, isCbcLocale } from "@/lib/cbc-copy";
import { isApplicationType } from "@/lib/codes";
import { ApplyForm } from "@/app/(site)/[locale]/(pages)/apply/ApplyForm";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { groupCategories, loadCategories } from "@/lib/categories";

const T = {
  ko: { title: "참여 문의", sub: "남겨 주시면 확인 후 가까운 텐트를 안내해 드립니다.", tabs: { mentor_join: "사업가 참여 문의", contact: "일반 문의" }, label: "문의 종류", back: "CBC 첫 화면" },
  en: { title: "Ask to join", sub: "Leave your details and we will point you to a nearby tent.", tabs: { mentor_join: "Business owner inquiry", contact: "General inquiry" }, label: "Inquiry type", back: "CBC home" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isCbcLocale(locale)) return {};
  return { title: `${T[locale].title} · ${BRAND}`, robots: { index: true, follow: true }, alternates: { canonical: locale === "en" ? "/en/join" : "/join", languages: { ko: "/join", en: "/en/join" } } };
}

export default async function CbcJoin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string }> }) {
  const { locale } = await params;
  if (!isCbcLocale(locale)) notFound();
  const { type: raw } = await searchParams;
  const type = isApplicationType(raw) && (raw === "mentor_join" || raw === "contact") ? raw : "mentor_join";
  const en = locale === "en";
  const t = T[locale];
  const c = cbcCopy[locale];
  const base = en ? "/en" : "";
  let categories: ReturnType<typeof groupCategories> = [];
  if (type === "mentor_join" && isSupabaseConfigured()) {
    try { categories = groupCategories(await loadCategories(createSupabaseAdminClient()), locale); } catch { categories = []; }
  }
  return (
    <CbcShell locale={locale} switchHref={en ? "/join" : "/en/join"}>
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="display text-4xl md:text-5xl">{t.title}</h1>
          <p className="mt-4 text-soft">{t.sub}</p>
          <nav aria-label={t.label} className="mt-8 flex flex-wrap gap-2 text-sm">
            {(["mentor_join", "contact"] as const).map((k) => (
              <Link key={k} href={`${base}/join?type=${k}`} className={`inline-flex min-h-[44px] items-center rounded-full border px-4 transition-colors ${k === type ? "border-accent bg-accent text-white" : "border-black/15 text-soft hover:border-ink"}`}>{t.tabs[k]}</Link>
            ))}
          </nav>
          <ApplyForm key={type} variant="cbc" type={type} categories={categories} backHref={en ? "/en" : "/"} />
        </div>
    </CbcShell>
  );
}
