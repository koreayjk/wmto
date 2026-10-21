type Item = { name: string; text: string };

/** 핵심 가치 띠. 한 번만 쓰는 장치라서 값(가치)을 보여주는 데만 사용한다. */
export function ValuesMarquee({ items }: { items: readonly Item[] }) {
  const row = (dup: boolean) => (
    <ul className={`flex shrink-0 items-baseline gap-14 pr-14 ${dup ? "marquee-dup" : ""}`} aria-hidden={dup}>
      {items.map((it) => (
        <li key={it.name} className="flex items-baseline gap-4 whitespace-nowrap">
          <span className="text-4xl font-bold tracking-tight md:text-6xl">{it.name}</span>
          <span className="text-sm text-soft md:text-base">{it.text}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="marquee overflow-hidden bg-paper py-10 md:py-14" aria-label="WMTO의 네 가지 핵심 가치">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
