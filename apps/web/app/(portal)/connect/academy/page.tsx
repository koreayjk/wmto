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
      <PageTitle>{t.title}</PageTitle>
      {groups.size === 0 && <p className="text-soft">{t.empty}</p>}
      {[...groups].map(([cat, vids]) => (
        <section key={cat} className="space-y-3">
          <h2 className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-clay">{cat}</h2>
          {vids.map((v) => (
            <Card key={v.id}>
              <p className="font-display text-lg font-semibold">{v.title}</p>
              <p className="text-xs text-soft">{fmtDate(v.published_at, locale)}</p>
              {v.description && <p className="mt-2 text-soft">{v.description}</p>}
              <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="cbtn mt-5">{t.watch}</a>
            </Card>
          ))}
        </section>
      ))}
    </div>
  );
}
