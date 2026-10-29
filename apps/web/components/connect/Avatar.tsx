/** 증명사진. 사진이 없으면 이름의 첫 글자를 부드러운 색 원에 보여 줍니다. */
const tones = ["#d9ebe6", "#efe6d2", "#e3e6f2", "#f2e1e1", "#e1eedb", "#ece2f1"];

export function Avatar({ name, url, size = 40, className = "" }: { name: string; url?: string | null; size?: number; className?: string }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length;
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" width={size} height={size} loading="lazy" decoding="async" style={style} className={`shrink-0 rounded-full bg-tint object-cover ring-1 ring-black/5 ${className}`} />;
  }
  return (
    <span aria-hidden style={{ ...style, background: tones[hue] }} className={`grid shrink-0 place-items-center rounded-full font-display font-semibold text-ink/70 ring-1 ring-black/5 ${className}`}>
      {[...name][0] ?? "?"}
    </span>
  );
}
