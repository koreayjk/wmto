"use client";

import { useMemo, useState } from "react";

export type DirMentor = {
  id: string; name: string; industry: string | null; business_name: string | null;
  country: string | null; region: string | null; chapter: string | null;
  contribution_types: string[]; stage: string | null; mentee_count: number; joined_at: string;
};

export type ComposerText = {
  receiver: string; client: string; contact: string; note: string; send: string;
  find: string; search: string; byIndustry: string; byRegion: string; allIndustry: string; allRegion: string;
  noResult: string; chosen: string; choose: string; none: string; mentees: string; people: string; since: string;
  ways: Record<string, string>; stages: Record<string, string>;
};

/** 받을 사업가를 업종·지역별로 묶어 보면서 고르고, 같은 카드 안에서 소개 내용을 씁니다. */
export function ReferralComposer({ mentors, t, action }: { mentors: DirMentor[]; t: ComposerText; action: (fd: FormData) => void | Promise<void> }) {
  const [group, setGroup] = useState<"industry" | "region">("industry");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string>("");

  const regionOf = (m: DirMentor) => m.region || m.country || "-";
  const industryOf = (m: DirMentor) => m.industry || "-";
  const industries = useMemo(() => [...new Set(mentors.map(industryOf))].sort((a, b) => a.localeCompare(b, "ko")), [mentors]);
  const regions = useMemo(() => [...new Set(mentors.map(regionOf))].sort((a, b) => a.localeCompare(b, "ko")), [mentors]);

  const shown = mentors.filter((m) =>
    (!industry || industryOf(m) === industry) && (!region || regionOf(m) === region) &&
    (!q || `${m.name} ${m.business_name ?? ""} ${m.industry ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const groups = useMemo(() => {
    const map = new Map<string, DirMentor[]>();
    for (const m of shown) { const k = group === "industry" ? industryOf(m) : regionOf(m); map.set(k, [...(map.get(k) ?? []), m]); }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ko"));
  }, [shown, group]); // eslint-disable-line react-hooks/exhaustive-deps
  const chosen = mentors.find((m) => m.id === picked);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div>
        <h3 className="mb-3 text-sm font-medium">{t.find}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full bg-tint p-1 text-sm" role="group">
            {(["industry", "region"] as const).map((g) => (
              <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}
                className={`rounded-full px-3.5 py-1 font-medium transition-colors ${group === g ? "bg-white shadow-sm" : "text-soft"}`}>
                {g === "industry" ? t.byIndustry : t.byRegion}
              </button>
            ))}
          </div>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="field !w-auto !py-1.5 !text-sm" aria-label={t.allIndustry}>
            <option value="">{t.allIndustry}</option>
            {industries.map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="field !w-auto !py-1.5 !text-sm" aria-label={t.allRegion}>
            <option value="">{t.allRegion}</option>
            {regions.map((x) => <option key={x}>{x}</option>)}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="field !w-44 !py-1.5 !text-sm" />
        </div>

        <div className="mt-5 max-h-[34rem] space-y-6 overflow-y-auto pr-1">
          {groups.length === 0 && <p className="text-soft">{t.noResult}</p>}
          {groups.map(([name, list]) => (
            <section key={name}>
              <h4 className="mb-2 flex items-baseline gap-2 text-sm font-semibold">{name}<span className="text-xs font-normal text-soft">{t.people.replace("{n}", String(list.length))}</span></h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((m) => {
                  const on = m.id === picked;
                  const ways = m.contribution_types.map((k) => t.ways[k]).filter(Boolean).join(" · ");
                  return (
                    <li key={m.id}>
                      <button type="button" aria-pressed={on} onClick={() => setPicked(m.id)}
                        className={`w-full rounded-2xl p-4 text-left transition-colors ${on ? "bg-accent/10 ring-2 ring-accent" : "bg-white ring-1 ring-black/[0.06] hover:ring-black/20"}`}>
                        <span className="flex items-center justify-between gap-2">
                          <b className="font-display">{m.name}</b>
                          {m.stage && <span className="rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-accent">{t.stages[m.stage] ?? m.stage}</span>}
                        </span>
                        {m.business_name && <span className="mt-0.5 block text-sm">{m.business_name}</span>}
                        <span className="mt-1 block text-xs text-soft">
                          {group === "industry" ? regionOf(m) : industryOf(m)}
                          {ways && ` · ${ways}`}
                        </span>
                        <span className="mt-1 block text-xs text-soft">
                          {t.mentees.replace("{n}", String(m.mentee_count))} · {t.since.replace("{d}", new Date(m.joined_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short" }))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <form action={action} className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <input type="hidden" name="receiver_id" value={picked} />
        <div>
          <span className="mb-1.5 block text-sm font-medium">{t.receiver}</span>
          <p className={`rounded-2xl px-4 py-3 text-sm ${chosen ? "bg-accent/10" : "bg-tint text-soft"}`} aria-live="polite">
            {chosen ? <><b>{chosen.name}</b>{chosen.industry ? ` · ${chosen.industry}` : ""}</> : t.none}
          </p>
        </div>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t.client}</span><input name="client_name" required maxLength={200} className="field" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t.contact}</span><input name="client_contact" maxLength={200} className="field" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t.note}</span><textarea name="note" rows={4} maxLength={3000} className="field" /></label>
        <button className="cbtn w-full disabled:opacity-50" disabled={!picked}>{chosen ? t.send : t.choose}</button>
      </form>
    </div>
  );
}
