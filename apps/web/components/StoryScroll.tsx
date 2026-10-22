"use client";

import { useEffect, useRef, useState } from "react";

export type StoryStep = { name: string; text: string; src: string | null; detail?: string; points?: readonly string[] };

/**
 * 스크롤하면 사진이 바뀌는 단계 이야기.
 * 큰 화면: 왼쪽 사진이 고정되고 오른쪽 단계가 넘어갈 때 사진이 서서히 바뀐다.
 * 작은 화면: 단계마다 사진이 위에 붙어 세로로 이어진다(고정 없음).
 */
export function StoryScroll({ steps, label }: { steps: readonly StoryStep[]; label: string }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const photo = (src: string | null) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
    ) : (
      <div className="photo-fallback h-full w-full" />
    );

  return (
    <div className="grid md:grid-cols-2 md:gap-20">
      <div className="hidden md:block">
        <div className="sticky top-28">
          <div className="bezel">
            <div className="bezel-in">
              <div className="relative aspect-[4/5] max-h-[calc(100dvh-10rem)] w-full">
                {steps.map((s, i) => (
                  <div
                    key={s.name}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${i === active ? "opacity-100" : "opacity-0"}`}
                    aria-hidden
                  >
                    {photo(s.src)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ol>
        {steps.map((s, i) => (
          <li
            key={s.name}
            data-i={i}
            ref={(el) => { items.current[i] = el; }}
            className="py-10 md:flex md:min-h-[70dvh] md:items-center md:py-0"
          >
            <div className="md:hidden">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.25rem]">{photo(s.src)}</div>
            </div>
            <div className={`transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:max-w-lg ${i === active ? "md:opacity-100" : "md:opacity-35"}`}>
              <p className="text-sm font-semibold text-accent">{label.replace("{n}", String(i + 1))}</p>
              <h3 className="display mt-2 text-[1.6rem] md:text-[2.1rem]">{s.name}</h3>
              {s.text && <p className="mt-4 text-lg leading-[1.85] text-soft">{s.text}</p>}
              {s.detail && <p className="mt-4 leading-[1.85] text-soft">{s.detail}</p>}
              {s.points && (
                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 py-3.5 text-[15px] leading-relaxed">
                      <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
