import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { openRenewals } from "@/lib/renewal-actions";
import { RenewalQueue, type RenewalRow } from "@/components/connect/RenewalQueue";

async function open() { "use server"; await openRenewals(); }

export default async function AdminRenewal() {
  const { supabase } = await requireAdmin();
  const t = getMessages("ko").connect.renewal;
  const { data } = await supabase.rpc("renewal_queue");
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">{t.title}</h1>
      <p className="max-w-2xl text-soft">{t.sub} 점수가 낮아도 자동으로 탈락시키지 않으며, 미갱신은 운영진이 직접 결정합니다. 미갱신으로 정해도 계정은 자동으로 닫히지 않으니 기간 종료 후 회원 관리에서 처리해 주세요.</p>
      <form action={open} className="mt-6"><button className="cbtn cbtn-quiet">{t.openBtn}</button></form>
      <div className="mt-8"><RenewalQueue rows={(data ?? []) as RenewalRow[]} t={t} admin /></div>
    </>
  );
}
