import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { leaderChapters } from "@/lib/leader-chapters";
import { Card, PageTitle } from "@/components/connect/ui";

async function start(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const prev = fd.get("prev") === "1";
  const d = new Date();
  if (prev) d.setMonth(d.getMonth() - 1);
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  const chapter = String(fd.get("chapter"));
  const { data, error } = await r.supabase.rpc("start_tent_review", { p_chapter: chapter, p_month: month });
  if (error || !data) redirect(`/connect/review?chapter=${chapter}&error=${/previous draft/.test(error?.message ?? "") ? "previous" : /range/.test(error?.message ?? "") ? "range" : "generic"}`);
  redirect(`/connect/review/${data}`);
}

type Row = { id: string; month: string; status: "draft" | "submitted"; held_on: string | null };

export default async function ReviewList({ searchParams }: { searchParams: Promise<{ chapter?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase, viewAs } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const t = getMessages(locale).connect.review;
  const { chapter: want, error } = await searchParams;
  const chapters = await leaderChapters(supabase, me.id);
  if (!chapters.length) redirect("/connect");
  const current = chapters.find((c) => c.id === want) ?? chapters[0];
  const { data } = await supabase.from("tent_reviews").select("id,month,status,held_on").eq("chapter_id", current.id).order("month", { ascending: false }).limit(24);
  const rows = (data ?? []) as Row[];
  const err = error ? (t.errors as Record<string, string>)[error] ?? t.errors.generic : null;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Review" sub={t.sub}>{t.title} · {current.name}</PageTitle>
      {err && <p role="alert" className="rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{err}</p>}
      {chapters.length > 1 && (
        <p className="flex flex-wrap gap-2 text-sm"><span className="text-soft">{t.pickChapter}</span>
          {chapters.map((c) => <Link key={c.id} href={`/connect/review?chapter=${c.id}`} className={`rounded-full px-3 py-1 ring-1 ring-inset ${c.id === current.id ? "bg-accent text-white ring-accent" : "ring-ink/15"}`}>{c.name}</Link>)}
        </p>
      )}
      {!viewAs && (
        <form action={start} className="flex flex-wrap gap-3">
          <input type="hidden" name="chapter" value={current.id} />
          <button className="cbtn">{t.start}</button>
          <button name="prev" value="1" className="cbtn cbtn-quiet">{t.startPrev}</button>
        </form>
      )}
      <Card title={t.list}>
        {rows.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <ul className="divide-y divide-black/[0.06]">
            {rows.map((r) => (
              <li key={r.id} className="py-3.5 first:pt-0 last:pb-0">
                <Link href={`/connect/review/${r.id}`} className="flex items-center justify-between gap-4">
                  <span className="font-medium">{r.month.slice(0, 7)}</span>
                  <span className={`text-[11px] font-semibold tracking-wide ${r.status === "submitted" ? "text-accent" : "gilt"}`}>{t.status[r.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
