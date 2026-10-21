import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { applicationStatuses, type ApplicationStatus, type ApplicationType } from "@/lib/codes";

type Row = {
  id: string; type: ApplicationType; message: string | null; details: Record<string, unknown>;
  status: ApplicationStatus; created_at: string;
  members: { name: string; email: string; phone: string | null; country: string | null; role: string | null } | null;
};

const statusLabel: Record<ApplicationStatus, string> = { new: "신규", contacted: "연락함", done: "완료" };

async function setStatus(fd: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const status = String(fd.get("status"));
  if (!(applicationStatuses as readonly string[]).includes(status)) return;
  await supabase.from("applications").update({ status }).eq("id", String(fd.get("id")));
  revalidatePath("/admin");
}

export default async function AdminApplications({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const m = getMessages().apply;

  let q = supabase
    .from("applications")
    .select("id,type,message,details,status,created_at,members(name,email,phone,country,role)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && (applicationStatuses as readonly string[]).includes(status)) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold">{getMessages().admin.applications}</h1>
      <div className="mt-4 flex gap-3 text-sm">
        <a href="/admin" className="underline">전체</a>
        {applicationStatuses.map((s) => (
          <a key={s} href={`/admin?status=${s}`} className="underline">{statusLabel[s]}</a>
        ))}
      </div>
      <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {rows.length === 0 && <p className="py-8 text-soft">신청이 없습니다.</p>}
        {rows.map((r) => (
          <article key={r.id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs text-clay">
                {m.types[r.type].name} · {new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </p>
              <p className="mt-1 font-medium">
                {r.members?.name} <span className="font-normal text-soft">{r.members?.email}{r.members?.phone ? ` · ${r.members.phone}` : ""}{r.members?.country ? ` · ${r.members.country}` : ""}</span>
              </p>
              {r.message && <p className="mt-2 whitespace-pre-line">{r.message}</p>}
              {Object.keys(r.details ?? {}).length > 0 && (
                <p className="mt-2 break-all text-xs text-soft">{JSON.stringify(r.details)}</p>
              )}
            </div>
            <form action={setStatus} className="flex items-start gap-2">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className="border border-black/20 px-2 py-1">
                {applicationStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
              </select>
              <button className="bg-ink px-3 py-1 text-white">저장</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
