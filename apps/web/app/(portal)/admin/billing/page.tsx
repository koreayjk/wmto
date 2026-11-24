import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

async function saveSettings(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  for (const k of ["fee_amount", "fee_account", "fee_note"] as const) await supabase.rpc("set_setting", { p_key: k, p_value: String(fd.get(k) ?? "") });
  revalidatePath("/admin/billing");
}
async function issue(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const due = String(fd.get("due") ?? "");
  const amount = Number(String(fd.get("amount") ?? "").replace(/[^0-9]/g, ""));
  const kind = ["joining", "renewal", "other"].includes(String(fd.get("kind"))) ? String(fd.get("kind")) : "renewal";
  if (!amount) return;
  await supabase.rpc("issue_invoice", { p_member: String(fd.get("member")), p_kind: kind, p_amount: amount, p_due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null, p_note: String(fd.get("note") ?? "") });
  revalidatePath("/admin/billing");
}
async function decide(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.rpc("decide_invoice", { p_id: String(fd.get("id")), p_status: String(fd.get("status")), p_note: String(fd.get("note") ?? "") });
  revalidatePath("/admin/billing");
}

const kindLabel = { joining: "입회 회비", renewal: "갱신 회비", other: "회비" } as const;
const statusLabel = { issued: "입금 대기", paid: "입금 확인됨", waived: "면제", void: "취소" } as const;

export default async function AdminBilling() {
  const { supabase } = await requireAdmin();
  const [{ data: st }, { data: inv }, { data: people }] = await Promise.all([
    supabase.from("app_settings").select("key,value"),
    supabase.from("invoices").select("id,member_id,kind,amount,status,due_on,issued_at,paid_at,note").order("issued_at", { ascending: false }).limit(200),
    supabase.from("members").select("id,name,email").eq("role", "mentor").eq("status", "active").order("name").limit(500),
  ]);
  const set = Object.fromEntries((st ?? []).map((r) => [r.key as string, r.value as string]));
  const rows = (inv ?? []) as { id: string; member_id: string; kind: keyof typeof kindLabel; amount: number; status: keyof typeof statusLabel; due_on: string | null; issued_at: string; note: string | null }[];
  const who = new Map((people ?? []).map((p) => [p.id as string, p.name as string]));
  const open = rows.filter((r) => r.status === "issued");
  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">회비</h1>
      <p className="max-w-2xl text-soft">결제 대행사 없이 계좌 이체로 받는 방식입니다. 청구서를 발행하면 회원이 앱(활동·성장)에서 입금 안내를 보고, 입금을 확인하면 여기서 "입금 확인"을 누릅니다. 입금과 갱신 여부는 서로 자동으로 연결되지 않습니다(갱신은 갱신 심사에서 결정). 회비를 받는 주체(법인·단체)와 영수증 발행은 별도로 정해 주세요.</p>

      <form action={saveSettings} className="mt-8 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-soft">기본 회비(원, 참고용)<input name="fee_amount" inputMode="numeric" defaultValue={set.fee_amount ?? ""} className="field mt-1" /></label>
        <label className="text-sm text-soft">입금 계좌(은행·번호·예금주)<input name="fee_account" defaultValue={set.fee_account ?? ""} className="field mt-1" /></label>
        <label className="text-sm text-soft md:col-span-2">안내 문구(선택)<input name="fee_note" defaultValue={set.fee_note ?? ""} className="field mt-1" /></label>
        <button className="cbtn md:col-span-2">설정 저장</button>
      </form>

      <h2 className="mt-12 text-sm font-medium">청구서 발행</h2>
      <form action={issue} className="mt-3 grid gap-3 md:grid-cols-3">
        <select name="member" required defaultValue="" className="field"><option value="" disabled>사업가 선택</option>{(people ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select name="kind" className="field" defaultValue="renewal"><option value="joining">입회 회비</option><option value="renewal">갱신 회비</option><option value="other">기타 회비</option></select>
        <input name="amount" required inputMode="numeric" placeholder={`금액(원)${set.fee_amount ? ` 예: ${set.fee_amount}` : ""}`} className="field" />
        <label className="text-sm text-soft">입금 기한<input name="due" type="date" className="field mt-1" /></label>
        <input name="note" placeholder="메모(선택)" className="field md:col-span-1 self-end" />
        <button className="cbtn self-end">청구서 발행</button>
      </form>

      <h2 className="mt-12 text-sm font-medium">입금 대기 {open.length}건</h2>
      <ul className="mt-3 divide-y divide-black/[0.06]">
        {open.length === 0 && <li className="py-4 text-soft">입금을 기다리는 청구서가 없습니다.</li>}
        {open.map((r) => (
          <li key={r.id} className="py-4">
            <p><b>{who.get(r.member_id) ?? "-"}</b> <span className="text-soft">{kindLabel[r.kind]} · {r.amount.toLocaleString("ko-KR")}원{r.due_on ? ` · 기한 ${r.due_on}` : ""}</span></p>
            <form action={decide} className="mt-2 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={r.id} />
              <input name="note" placeholder="메모(선택)" className="field !w-56" />
              <button name="status" value="paid" className="cbtn cbtn-sm">입금 확인</button>
              <button name="status" value="waived" className="cbtn cbtn-quiet cbtn-sm">면제</button>
              <button name="status" value="void" className="cbtn cbtn-quiet cbtn-sm">취소</button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-sm font-medium">지난 청구서</h2>
      <ul className="mt-3 divide-y divide-black/[0.06] text-sm">
        {rows.filter((r) => r.status !== "issued").map((r) => <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2.5"><span>{who.get(r.member_id) ?? "-"} · {kindLabel[r.kind]} · {r.amount.toLocaleString("ko-KR")}원</span><span className="text-soft">{statusLabel[r.status]}</span></li>)}
      </ul>
    </>
  );
}
