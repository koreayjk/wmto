import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { sponsorKinds } from "@/lib/codes";
import { fmtMoney } from "@/lib/format";

const kindLabel = getMessages().connect.sponsor.giving.kinds;
const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

async function revalidate() {
  revalidatePath("/admin/donations");
  revalidatePath("/connect", "layout");
}

async function addDonation(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const sponsor = String(fd.get("sponsor_id") ?? "");
  const kind = String(fd.get("kind") ?? "");
  const partner = String(fd.get("partner_id") ?? "");
  const amount = Number(String(fd.get("amount") ?? "").replace(/,/g, ""));
  const date = String(fd.get("donated_at") ?? "");
  const currency = String(fd.get("currency") ?? "KRW").trim().toUpperCase().slice(0, 8) || "KRW";
  if (!isUuid(sponsor) || !(sponsorKinds as readonly string[]).includes(kind) || !(amount > 0) || !isDate(date)) return;
  await supabase.from("donations").insert({
    sponsor_id: sponsor, kind, partner_id: isUuid(partner) ? partner : null, amount, currency, donated_at: date,
    note: String(fd.get("note") ?? "").trim().slice(0, 500) || null,
  });
  await revalidate();
}

async function removeDonation(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("donations").delete().eq("id", String(fd.get("id")));
  await revalidate();
}

async function addLoan(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const partner = String(fd.get("partner_id") ?? "");
  const amount = Number(String(fd.get("amount") ?? "").replace(/,/g, ""));
  const date = String(fd.get("issued_at") ?? "");
  if (!isUuid(partner) || !(amount > 0) || !isDate(date)) return;
  await supabase.from("fund_loans").insert({ partner_id: partner, amount, issued_at: date, funded_by_repayment: fd.get("funded_by_repayment") === "on" });
  await revalidate();
}

/** 상환액을 더합니다. 대여금 이상이 되면 상환 완료로 바꿉니다. */
async function addRepayment(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const add = Number(String(fd.get("repaid") ?? "").replace(/,/g, ""));
  if (!isUuid(id) || !(add > 0)) return;
  const { data: loan } = await supabase.from("fund_loans").select("amount,repaid").eq("id", id).single();
  if (!loan) return;
  const repaid = Math.min(Number(loan.amount), Number(loan.repaid) + add);
  await supabase.from("fund_loans").update({ repaid, status: repaid >= Number(loan.amount) ? "repaid" : "active" }).eq("id", id);
  await revalidate();
}

async function removeLoan(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase.from("fund_loans").delete().eq("id", String(fd.get("id")));
  await revalidate();
}

type Gift = { id: string; kind: keyof typeof kindLabel; sponsor_id: string; partner_id: string | null; amount: number; currency: string; donated_at: string; note: string | null };
type Loan = { id: string; partner_id: string; amount: number; repaid: number; status: "active" | "repaid"; funded_by_repayment: boolean; issued_at: string };

export default async function AdminDonations() {
  const { supabase } = await requireAdmin();
  const [{ data: people }, { data: gifts }, { data: loans }] = await Promise.all([
    supabase.from("members").select("id,name,email,role,status").in("role", ["sponsor", "partner"]).order("name").limit(1000),
    supabase.from("donations").select("id,kind,sponsor_id,partner_id,amount,currency,donated_at,note").order("donated_at", { ascending: false }).limit(100),
    supabase.from("fund_loans").select("id,partner_id,amount,repaid,status,funded_by_repayment,issued_at").order("issued_at", { ascending: false }).limit(100),
  ]);
  const members = people ?? [];
  const sponsors = members.filter((x) => x.role === "sponsor" && x.status === "active");
  const partners = members.filter((x) => x.role === "partner" && x.status === "active");
  const nameOf = new Map(members.map((x) => [x.id, x.name]));
  const giftRows = (gifts ?? []) as unknown as Gift[];
  const loanRows = (loans ?? []) as unknown as Loan[];

  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">후원·기금</h1>
      <p className="text-soft">여기에 입력한 내용이 후원자 앱의 "후원 내역", "선교사 소식", "순환 기금 흐름"에 바로 반영됩니다.</p>

      <h2 className="mt-12 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">후원 내역 입력</h2>
      {sponsors.length === 0 ? (
        <p className="text-soft">활성 후원자가 없습니다. 먼저 회원 화면에서 후원자를 승인해 주세요.</p>
      ) : (
        <form action={addDonation} className="grid gap-3 md:grid-cols-2">
          <select name="sponsor_id" required defaultValue="" className="field">
            <option value="" disabled>후원자</option>
            {sponsors.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
          </select>
          <select name="kind" required className="field">
            {sponsorKinds.map((k) => <option key={k} value={k}>{kindLabel[k]}</option>)}
          </select>
          <select name="partner_id" defaultValue="" className="field md:col-span-2">
            <option value="">후원 대상 선교사 (선교사 1:1 후원일 때 선택, 아니면 비워 두세요)</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input name="amount" inputMode="numeric" required placeholder="금액 (숫자만, 원화 기준)" className="field" />
          <label className="text-sm text-soft">후원일<input name="donated_at" type="date" required defaultValue={today()} className="field mt-1" /></label>
          <input name="currency" defaultValue="KRW" maxLength={8} className="field uppercase" aria-label="통화" />
          <input name="note" maxLength={500} placeholder="메모 (선택)" className="field" />
          <button className="cbtn w-full md:col-span-2">후원 내역 등록</button>
        </form>
      )}

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">최근 후원 내역 ({giftRows.length})</h2>
      <ul className="alist divide-y divide-black/[0.06]">
        {giftRows.length === 0 && <li className="py-6 text-soft">아직 입력한 후원 내역이 없습니다.</li>}
        {giftRows.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <span className="text-xs text-clay">{kindLabel[g.kind]}</span>{" "}
              <b className="font-semibold">{nameOf.get(g.sponsor_id) ?? "-"}</b>
              <span className="text-soft"> → {g.partner_id ? (nameOf.get(g.partner_id) ?? "-") : "전체 사역"} · {g.donated_at}{g.note ? ` · ${g.note}` : ""}</span>
            </span>
            <span className="flex items-center gap-4">
              <span className="font-display tabular-nums">{g.currency === "KRW" ? fmtMoney(Number(g.amount)) : `${g.currency} ${Number(g.amount).toLocaleString("ko-KR")}`}</span>
              <form action={removeDonation}><input type="hidden" name="id" value={g.id} /><button className="text-sm text-soft hover:text-clay">삭제</button></form>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">순환 기금 대여 입력</h2>
      <form action={addLoan} className="grid gap-3 md:grid-cols-2">
        <select name="partner_id" required defaultValue="" className="field">
          <option value="" disabled>선교사</option>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="amount" inputMode="numeric" required placeholder="대여 금액 (원)" className="field" />
        <label className="text-sm text-soft">대여일<input name="issued_at" type="date" required defaultValue={today()} className="field mt-1" /></label>
        <label className="flex items-center gap-2 self-end pb-3"><input type="checkbox" name="funded_by_repayment" /> 앞 선교사가 갚은 기금으로 시작</label>
        <button className="cbtn w-full md:col-span-2">대여 등록</button>
      </form>

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">대여 현황과 상환 입력 ({loanRows.length})</h2>
      <ul className="alist divide-y divide-black/[0.06]">
        {loanRows.length === 0 && <li className="py-6 text-soft">아직 대여 내역이 없습니다.</li>}
        {loanRows.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>
              <b className="font-semibold">{nameOf.get(l.partner_id) ?? "-"}</b>
              <span className="text-soft"> · {l.issued_at} · {fmtMoney(Number(l.amount))} 중 {fmtMoney(Number(l.repaid))} 상환</span>{" "}
              <span className="text-xs text-clay">{l.status === "repaid" ? "상환 완료" : "진행 중"}{l.funded_by_repayment ? " · 재순환 기금" : ""}</span>
            </span>
            <span className="flex flex-wrap items-center gap-3">
              {l.status === "active" && (
                <form action={addRepayment} className="flex gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <input name="repaid" inputMode="numeric" required placeholder="상환액 (원)" className="field !w-32 !py-1.5 !text-sm" aria-label="상환액" />
                  <button className="cbtn cbtn-sm">상환 입력</button>
                </form>
              )}
              <form action={removeLoan}><input type="hidden" name="id" value={l.id} /><button className="text-sm text-soft hover:text-clay">삭제</button></form>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
