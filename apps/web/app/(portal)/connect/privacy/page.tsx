import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

async function requestDelete(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("request_deletion", { p_reason: String(fd.get("reason") ?? "") });
  revalidatePath("/connect/privacy");
}
async function cancelDelete() {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("cancel_deletion");
  revalidatePath("/connect/privacy");
}

export default async function Privacy() {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const t = getMessages(locale).connect.privacy;
  const { data: open } = await supabase.from("deletion_requests").select("id").eq("member_id", me.id).eq("status", "requested").maybeSingle();
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Privacy" sub={t.sub}>{t.title}</PageTitle>
      <Card title={t.exportTitle}>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-soft">{t.exportText}</p>
        <a href="/connect/privacy/export" className="cbtn cbtn-quiet">{t.exportBtn}</a>
      </Card>
      <Card title={t.deleteTitle}>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-soft">{t.deleteText}</p>
        {open ? (
          <form action={cancelDelete} className="flex flex-wrap items-center gap-4"><span className="text-sm">{t.requested}</span><button className="cbtn cbtn-quiet cbtn-sm">{t.cancelBtn}</button></form>
        ) : (
          <form action={requestDelete} className="max-w-xl space-y-3">
            <label className="block"><span className={labelCls}>{t.reason}</span><textarea name="reason" rows={2} maxLength={500} className="field" /></label>
            <button className="cbtn cbtn-quiet">{t.deleteBtn}</button>
          </form>
        )}
      </Card>
    </div>
  );
}
