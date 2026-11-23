import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { Card, PageTitle } from "@/components/connect/ui";
import { RenewalQueue, type RenewalRow } from "@/components/connect/RenewalQueue";

export default async function Renewal() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  if (me.role !== "mentor") redirect("/connect");
  const { data: lead } = await supabase.from("chapter_leaders").select("chapter_id").eq("member_id", me.id).limit(1);
  if (!(lead ?? []).length) redirect("/connect/growth");
  const t = getMessages(locale).connect.renewal;
  const { data } = await supabase.rpc("renewal_queue");
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Renewal" sub={t.sub}>{t.title}</PageTitle>
      <Card><RenewalQueue rows={(data ?? []) as RenewalRow[]} t={t} admin={false} /></Card>
    </div>
  );
}
