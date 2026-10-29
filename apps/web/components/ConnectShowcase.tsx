"use client";

import { useState } from "react";

type Screen = { key: string; label: string; title: string; text: string };
type Role = { name: string; text: string };

/** 홈페이지의 WMTO Connect 소개: 화면을 탭으로 바꿔 보여 주고, 체험·로그인으로 이어 줍니다. */
export function ConnectShowcase({ eyebrow, title, body, screens, roles, demo, login, note, frameAlt }: {
  eyebrow: string; title: string; body: string; screens: readonly Screen[]; roles: readonly Role[];
  demo: string; login: string; note: string; frameAlt: string;
}) {
  const [i, setI] = useState(0);
  const s = screens[i];
  return (
    <section className="bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6 min-[1500px]:max-w-[88rem]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
        <h2 className="display mt-4 max-w-3xl text-[1.9rem] sm:text-5xl md:text-[3rem]">{title}</h2>
        <p className="mt-6 max-w-2xl text-lg leading-[1.9] text-soft">{body}</p>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div role="tablist" aria-label={eyebrow} className="flex flex-wrap gap-2">
              {screens.map((x, n) => (
                <button key={x.key} role="tab" aria-selected={n === i} onClick={() => setI(n)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-500 ${n === i ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-black/10 hover:text-ink"}`}>
                  {x.label}
                </button>
              ))}
            </div>
            <div className="mt-7 min-h-[8.5rem]" role="tabpanel">
              <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 leading-[1.85] text-soft">{s.text}</p>
            </div>
            <ul className="mt-6 space-y-3 border-t border-line pt-6">
              {roles.map((r) => (
                <li key={r.name} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span><b className="font-semibold">{r.name}</b> <span className="text-soft">{r.text}</span></span>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="/connect/demo" className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition duration-500 hover:bg-[var(--accent-hover)] active:scale-[0.98]">{demo}</a>
              <a href="/connect/login" className="inline-flex items-center rounded-full px-6 py-3 text-[15px] font-semibold text-ink ring-1 ring-inset ring-ink/15 transition duration-500 hover:bg-black/[0.04] active:scale-[0.98]">{login}</a>
            </div>
            <p className="mt-4 text-xs text-soft">{note}</p>
          </div>

          <div className="rounded-[1.75rem] bg-black/[0.04] p-2 ring-1 ring-black/[0.05] md:p-3">
            <div className="overflow-hidden rounded-[1.3rem] bg-white shadow-[0_40px_70px_-40px_rgba(6,32,27,0.5)]">
              <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#f6f5f1] px-4 py-2.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#e6a09a]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ecd09a]" /><span className="h-2.5 w-2.5 rounded-full bg-[#a9d3a4]" />
                <span className="ml-3 rounded-full bg-white px-3 py-0.5 text-[11px] text-soft">wmto.vercel.app/connect</span>
              </div>
              {screens.map((x, n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={x.key} src={`/images/connect-${x.key}.jpg`} alt={n === i ? `${frameAlt}: ${x.label}` : ""} aria-hidden={n !== i}
                  width={1360} height={860} loading="lazy" decoding="async"
                  className={`h-auto w-full transition-opacity duration-700 ${n === i ? "block opacity-100" : "hidden opacity-0"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
