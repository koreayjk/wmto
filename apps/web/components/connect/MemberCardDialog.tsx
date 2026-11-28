"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type MemberCard = {
  id: string; name: string; photo_url: string | null; chapter: string | null; joined_at: string; is_me: boolean;
  business_name: string | null; industry: string | null; intro: string | null; keywords: string | null; years: number | null;
  website: string | null; church: string | null; faith_story: string | null; business_address: string | null; business_phone: string | null;
  contact_shared: boolean; phone: string | null; email: string | null; met: number; last_met: string | null; ref_sent: number; ref_received: number;
};
export type CardLabels = Record<string, string>;
const f = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, String(x)), s);

function Row({ k, children }: { k: string; children: ReactNode }) {
  return <div className="grid gap-1 py-2.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4"><dt className="text-[13px] text-soft">{k}</dt><dd className="min-w-0 break-words leading-relaxed">{children}</dd></div>;
}

/** 텐트 회원 카드를 누르면 상세 정보 팝업을 엽니다(서버 액션으로 불러옴). */
export function MemberCardTrigger({ id, load, labels, locale, className, children }: {
  id: string; load: (id: string) => Promise<MemberCard | null>; labels: CardLabels; locale: "ko" | "en"; className?: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<MemberCard | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function show() {
    setOpen(true);
    if (data) return;
    setState("loading");
    try { const r = await load(id); if (r) { setData(r); setState("idle"); } else setState("error"); } catch { setState("error"); }
  }
  const dt = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const kw = (data?.keywords ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const href = data?.website ? (/^https?:\/\//.test(data.website) ? data.website : `https://${data.website}`) : null;

  return (
    <>
      <button type="button" onClick={show} aria-haspopup="dialog" title={labels.open} className={className}>{children}</button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="m-auto w-[min(42rem,94vw)] max-h-[90svh] overflow-y-auto rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]">
        <div className="relative p-6 sm:p-8">
          <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-soft hover:bg-black/[0.06]">×</button>
          {state === "loading" && <p className="py-16 text-center text-soft">{labels.loading}</p>}
          {state === "error" && <p className="py-16 text-center text-soft">{labels.error}</p>}
          {data && state === "idle" && (
            <>
              <header className="flex items-center gap-4 pr-10">
                {data.photo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={data.photo_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  : <span aria-hidden className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-tint text-2xl font-semibold text-accent">{data.name.slice(0, 1)}</span>}
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-semibold">{data.name}{data.is_me && <span className="ml-2 rounded-full bg-tint px-2 py-0.5 align-middle text-xs font-semibold text-accent">{labels.me}</span>}</h2>
                  {data.business_name && <p className="mt-0.5 text-[15px]">{data.business_name}</p>}
                  <p className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                    {data.industry && <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-white">{data.industry}</span>}
                    {data.chapter && <span className="rounded-full bg-tint px-2.5 py-1 text-accent">{data.chapter}</span>}
                  </p>
                </div>
              </header>

              {data.intro && <p className="mt-5 rounded-2xl bg-tint p-4 leading-relaxed text-ink/85">{data.intro}</p>}

              <dl className="mt-4 divide-y divide-black/[0.07]">
                {(data.business_address || data.business_phone || href) && (
                  <>
                    {data.business_address && <Row k={labels.address}>{data.business_address}</Row>}
                    {data.business_phone && <Row k={labels.phone}><a className="text-accent underline" href={`tel:${data.business_phone.replace(/[^0-9+]/g, "")}`}>{data.business_phone}</a></Row>}
                    {href && <Row k={labels.website}><a className="break-all text-accent underline" href={href} target="_blank" rel="noopener noreferrer">{data.website}</a></Row>}
                  </>
                )}
                {data.contact_shared
                  ? (data.phone || data.email) && (
                    <>
                      {data.phone && <Row k={labels.mobile}><a className="text-accent underline" href={`tel:${data.phone.replace(/[^0-9+]/g, "")}`}>{data.phone}</a></Row>}
                      {data.email && <Row k={labels.email}><a className="break-all text-accent underline" href={`mailto:${data.email}`}>{data.email}</a></Row>}
                    </>
                  )
                  : <Row k={labels.contact}><span className="text-sm text-soft">{labels.hidden}</span></Row>}
                {kw.length > 0 && <Row k={labels.keywords}><span className="flex flex-wrap gap-1.5">{kw.map((x) => <span key={x} className="rounded-full bg-tint px-2.5 py-0.5 text-sm text-accent">{x}</span>)}</span></Row>}
                {data.years != null && <Row k={labels.years}>{f(labels.yearsUnit, { n: data.years })}</Row>}
                {data.church && <Row k={labels.church}>{data.church}</Row>}
                {data.faith_story && <Row k={labels.faith}>{data.faith_story}</Row>}
                <Row k={labels.joined}>{dt(data.joined_at)}</Row>
              </dl>

              {!data.is_me && (
                <section className="mt-5 rounded-2xl bg-tint p-4">
                  <h3 className="text-sm font-semibold">{labels.together}</h3>
                  {data.met + data.ref_sent + data.ref_received === 0
                    ? <p className="mt-1 text-sm text-soft">{labels.none}</p>
                    : <ul className="mt-1.5 space-y-0.5 text-sm">
                        {data.met > 0 && <li>{f(labels.met, { n: data.met })}{data.last_met ? ` · ${f(labels.lastMet, { d: dt(data.last_met) })}` : ""}</li>}
                        {data.ref_sent > 0 && <li>{f(labels.sent, { n: data.ref_sent })}</li>}
                        {data.ref_received > 0 && <li>{f(labels.received, { n: data.ref_received })}</li>}
                      </ul>}
                </section>
              )}

              {!data.is_me && (
                <p className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
                  <Link href="/connect/referrals" className="rounded-full bg-accent px-5 py-2.5 text-white">{labels.actRef}</Link>
                  <Link href="/connect/one-to-one" className="rounded-full px-5 py-2.5 text-accent ring-1 ring-inset ring-black/15">{labels.actO2o}</Link>
                </p>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
