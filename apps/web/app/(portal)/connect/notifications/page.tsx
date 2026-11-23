import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { fmtDate } from "@/lib/format";
import { Card, PageTitle } from "@/components/connect/ui";

async function readAll() {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("mark_notifications_read");
  revalidatePath("/connect", "layout");
}

type N = { id: string; kind: string; params: Record<string, string>; href: string | null; read_at: string | null; created_at: string };

export default async function Notifications() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.notifications;
  const { data } = await supabase.from("notifications").select("id,kind,params,href,read_at,created_at").eq("member_id", me.id).order("created_at", { ascending: false }).limit(60);
  const rows = (data ?? []) as N[];
  const unread = rows.filter((n) => !n.read_at).length;
  const text = (n: N) => (t.kinds as Record<string, string>)[n.kind]?.replace(/\{(\w+)\}/g, (_, k) => n.params?.[k] ?? "") ?? n.kind;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Inbox" sub={t.sub}>{t.title}</PageTitle>
      <Card>
        {rows.length === 0 ? <p className="text-soft">{t.empty}</p> : (
          <>
            {unread > 0 && <form action={readAll} className="mb-4"><button className="cbtn cbtn-quiet cbtn-sm">{t.markAll} · {unread}</button></form>}
            <ul className="divide-y divide-black/[0.06]">
              {rows.map((n) => {
                const body = (
                  <span className="flex items-start gap-3">
                    <span aria-hidden className={`mt-[0.6em] h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-black/10" : "bg-accent"}`} />
                    <span>
                      <span className={`block ${n.read_at ? "text-soft" : "font-medium"}`}>{text(n)}</span>
                      <span className="text-xs text-soft">{fmtDate(n.created_at, locale)}</span>
                    </span>
                  </span>
                );
                return <li key={n.id} className="py-3.5 first:pt-0 last:pb-0">{n.href ? <Link href={n.href}>{body}</Link> : body}</li>;
              })}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
