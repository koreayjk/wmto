import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";

type Dash = {
  chapter: string; size: number; cap: number; new_members_6m: number; renewal_due: number; meetings: number; attendance_rate: number | null;
  referrals_per_member_week: number | null; one_to_one_per_member_week: number | null; visitors_invited: number; visitors_attended: number; visitors_joined: number; conversion: number | null;
  levels: Record<"peg" | "pole" | "canvas" | "lantern", number>;
  members: { id: string; name: string; term_end: string; total: number; level: "peg" | "pole" | "canvas" | "lantern"; weakest: string }[];
  open_categories: { id: number; name: string; group: string }[];
};

// 임시 기준(운영하며 조정). [든든, 살펴봄] 하한.
const BANDS = { attendance: [0.8, 0.6], referrals: [0.5, 0.25], oneToOne: [0.5, 0.25], conversion: [0.4, 0.2] } as const;
const tone = (v: number | null, [good, watch]: readonly [number, number]) => (v === null ? "none" : v >= good ? "good" : v >= watch ? "watch" : "care");

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ chapter?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.dashboard;
  const { chapter: want } = await searchParams;

  // 내가 리더인 텐트(운영진은 모든 텐트)
  const { data: isAdmin } = await supabase.from("admins").select("user_id").limit(1).maybeSingle();
  const { data: led } = isAdmin
    ? await supabase.from("chapters").select("id,name").order("name")
    : await supabase.from("chapter_leaders").select("chapter_id, chapters(id,name)").eq("member_id", me.id);
  const chapters = ((led ?? []) as unknown as ({ id: string; name: string } | { chapters: { id: string; name: string } | { id: string; name: string }[] | null })[])
    .map((r) => ("chapters" in r ? (Array.isArray(r.chapters) ? r.chapters[0] : r.chapters) : r)).filter(Boolean) as { id: string; name: string }[];
  if (!chapters.length) return <div className="space-y-6"><PageTitle eyebrow="Overview">{t.title}</PageTitle><p className="text-soft">{t.empty}</p></div>;
  const current = chapters.find((c) => c.id === want) ?? chapters[0];
  const { data } = await supabase.rpc("chapter_dashboard", { p_chapter: current.id });
  if (!data) redirect("/connect");
  const d = data as Dash;
  const lm = getMessages(locale).connect.growth.index.levels as Record<string, string>;
  const pct = (v: number | null) => (v === null ? t.none : `${Math.round(v * 100)}%`);
  const num = (v: number | null) => (v === null ? t.none : String(v));
  const tiles: { label: string; value: string; sub?: string; tone?: string }[] = [
    { label: t.size, value: String(d.size), sub: t.sizeOf.replace("{cap}", String(d.cap)) },
    { label: t.attendance, value: pct(d.attendance_rate), tone: tone(d.attendance_rate, BANDS.attendance) },
    { label: t.referrals, value: num(d.referrals_per_member_week), tone: tone(d.referrals_per_member_week, BANDS.referrals) },
    { label: t.oneToOne, value: num(d.one_to_one_per_member_week), tone: tone(d.one_to_one_per_member_week, BANDS.oneToOne) },
    { label: t.visitors, value: String(d.visitors_invited), sub: `${t.attended} ${d.visitors_attended} · ${t.joined} ${d.visitors_joined}` },
    { label: t.conversion, value: pct(d.conversion), tone: tone(d.conversion, BANDS.conversion) },
    { label: t.newMembers, value: String(d.new_members_6m) },
    { label: t.renewalDue, value: String(d.renewal_due) },
  ];
  const toneText = (k?: string) => (k && k !== "none" ? (t.health as Record<string, string>)[k] : "");
  const group = new Map<string, string[]>();
  d.open_categories.forEach((c) => group.set(c.group, [...(group.get(c.group) ?? []), c.name]));

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Overview" sub={t.sub}>{t.title} · {d.chapter}</PageTitle>
      {chapters.length > 1 && (
        <p className="flex flex-wrap gap-2 text-sm">
          <span className="text-soft">{t.pickChapter}</span>
          {chapters.map((c) => <Link key={c.id} href={`/connect/dashboard?chapter=${c.id}`} className={`rounded-full px-3 py-1 ring-1 ring-inset ${c.id === current.id ? "bg-accent text-white ring-accent" : "ring-ink/15"}`}>{c.name}</Link>)}
        </p>
      )}

      <Card title={t.health.title}>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((x) => (
            <li key={x.label}>
              <p className="text-[13px] text-soft">{x.label}</p>
              <p className="mt-1 text-[2rem] font-light leading-none tabular-nums">{x.value}</p>
              {(x.sub || toneText(x.tone)) && <p className={`mt-1.5 text-xs ${x.tone === "care" ? "text-[#8a2f1a]" : x.tone === "good" ? "text-accent" : "text-soft"}`}>{x.sub ?? toneText(x.tone)}</p>}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-soft">{t.health.note}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t.levels.title}>
          <ul className="grid grid-cols-4 gap-3 text-center">
            {(["peg", "pole", "canvas", "lantern"] as const).map((k) => (
              <li key={k} className="rounded-2xl bg-tint px-2 py-4"><p className="text-2xl tabular-nums">{d.levels?.[k] ?? 0}</p><p className="mt-1 text-xs text-soft">{t.levels[k]}</p></li>
            ))}
          </ul>
        </Card>
        <Card title={t.coach.title}>
          <ol className="space-y-2 text-sm leading-relaxed">{t.coach.steps.map((s, i) => <li key={s} className="flex gap-3"><span className="gilt font-medium tabular-nums">{i + 1}</span>{s}</li>)}</ol>
        </Card>
      </div>

      <Card title={t.members.title}>
        <p className="mb-4 text-sm text-soft">{t.members.sub}</p>
        <ul className="divide-y divide-black/[0.06]">
          {d.members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0">
              <span className="min-w-[8rem]"><b className="font-medium">{m.name}</b> <span className="ml-1 text-xs text-soft">{lm[m.level] ?? m.level} · {m.total}</span></span>
              <span className="min-w-0 flex-1 text-sm text-soft">{t.members.next}: {(t.weakest as Record<string, string>)[m.weakest] ?? "-"}</span>
              <span className="text-xs text-soft">{t.members.term} {fmtDate(m.term_end, locale)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t.open.title}>
        <p className="text-sm text-soft">{t.open.sub}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">{t.open.count.replace("{n}", String(d.open_categories.length))} · {t.open.show}</summary>
          <div className="mt-4 space-y-3">
            {[...group].map(([g, items]) => <p key={g} className="text-sm"><b className="font-medium">{g}</b><span className="text-soft"> — {items.join(", ")}</span></p>)}
          </div>
        </details>
      </Card>
    </div>
  );
}
