import { Bezel } from "./Bezel";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

type Person = { name: string; en: string; text: string };

/** 사업가·후원자·선교사: 크기가 다른 세 면, 사진 바탕 */
export function PeopleBento({ items }: { items: readonly Person[] }) {
  const cfg = [
    { span: "md:col-span-3 md:row-span-2", photo: "mentor" as const, min: "min-h-80 md:min-h-[26rem]", name: "text-3xl md:text-4xl", text: "text-lg" },
    { span: "md:col-span-2", photo: "sponsor" as const, min: "min-h-60", name: "text-2xl", text: "" },
    { span: "md:col-span-2", photo: "partner" as const, min: "min-h-60", name: "text-2xl", text: "" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2">
      {items.slice(0, 3).map((it, i) => (
        <Reveal key={it.name} delay={(i + 1) as 1 | 2 | 3} className={cfg[i].span}>
          <Bezel className="h-full" inner="bg-ink" innerClassName={`relative isolate flex flex-col justify-end p-7 text-white md:p-10 ${cfg[i].min}`}>
            <Photo name={cfg[i].photo} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06201b]/90 via-[#06201b]/40 to-[#06201b]/5" aria-hidden />
            <div className="relative">
              <p className="text-sm font-semibold text-white/85">{it.en}</p>
              <h3 className={`mt-1 font-bold tracking-tight ${cfg[i].name}`}>{it.name}</h3>
              <p className={`mt-3 text-white/90 ${cfg[i].text}`}>{it.text}</p>
            </div>
          </Bezel>
        </Reveal>
      ))}
    </div>
  );
}
