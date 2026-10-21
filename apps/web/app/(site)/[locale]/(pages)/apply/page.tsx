import type { Metadata } from "next";
import { L } from "@/components/L";
import { getMessages, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { applicationTypes, isApplicationType } from "@/lib/codes";
import { ApplyForm } from "./ApplyForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, "apply", "/apply");
}

export default async function Apply({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string }> }) {
  const { locale } = await params;
  const { type: raw } = await searchParams;
  const type = isApplicationType(raw) ? raw : "contact";
  const m = getMessages(locale as Locale).apply;
  return (
    <section className="bg-paper pb-28 pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="display text-4xl md:text-5xl">{m.types[type].title}</h1>
        <p className="mt-4 text-soft">{m.sub}</p>

        <nav aria-label={m.typeLabel} className="mt-8 flex flex-wrap gap-2 text-sm">
          {applicationTypes.map((t) => (
            <L
              key={t}
              href={`/apply?type=${t}`}
              className={`rounded-full border px-4 py-2.5 transition-colors duration-300 ${
                t === type ? "border-clay bg-clay text-white" : "border-line text-soft hover:border-ink"
              }`}
            >
              {m.types[t].name}
            </L>
          ))}
        </nav>

        {/* key: 유형을 바꾸면 폼 상태를 초기화 */}
        <ApplyForm key={type} type={type} />
      </div>
    </section>
  );
}
