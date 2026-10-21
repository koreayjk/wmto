import type { Metadata } from "next";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { applicationTypes, isApplicationType } from "@/lib/codes";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "신청·문의" };

export default async function Apply({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type: raw } = await searchParams;
  const type = isApplicationType(raw) ? raw : "contact";
  const m = getMessages().apply;
  return (
    <section className="bg-paper pb-28 pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="display text-4xl md:text-5xl">{m.types[type].title}</h1>
        <p className="mt-4 text-soft">{m.sub}</p>

        <nav aria-label={m.typeLabel} className="mt-8 flex flex-wrap gap-2 text-sm">
          {applicationTypes.map((t) => (
            <Link
              key={t}
              href={`/apply?type=${t}`}
              className={`border px-3 py-1.5 transition-colors ${
                t === type ? "border-clay bg-clay text-white" : "border-line text-soft hover:border-ink"
              }`}
            >
              {m.types[t].name}
            </Link>
          ))}
        </nav>

        {/* key: 유형을 바꾸면 폼 상태를 초기화 */}
        <ApplyForm key={type} type={type} />
      </div>
    </section>
  );
}
