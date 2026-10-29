import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";

export default async function Academy() {
  const locale = await getPortalLocale();
  const { supabase } = await requireMe();
  const t = getMessages(locale).connect.academy;
  // 역할별 공개 범위는 DB 정책(academy_read)이 적용합니다.
  const { data } = await supabase.from("academy_videos").select("id,title,description,video_url,category,published_at").order("published_at", { ascending: false }).limit(200);
  const groups = new Map<string, NonNullable<typeof data>>();
  (data ?? []).forEach((v) => {
    const k = v.category || t.uncategorized;
    groups.set(k, [...(groups.get(k) ?? []), v]);
  });
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Academy">{t.title}</PageTitle>
      {groups.size === 0 && <p className="text-soft">{t.empty}</p>}
      {[...groups].map(([cat, vids]) => (
        <Card key={cat} title={cat}>
          <ul className="divide-y divide-black/[0.06]">
            {vids.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold">{v.title}</span>
                  {v.description && <span className="mt-0.5 block text-sm text-soft">{v.description}</span>}
                  <span className="mt-1 block text-xs text-soft">{fmtDate(v.published_at, locale)}</span>
                </span>
                <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="cbtn cbtn-sm shrink-0">{t.watch}</a>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
