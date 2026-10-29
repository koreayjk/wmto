import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/admin";
import { getMessages } from "@/lib/i18n";
import { VIEW_AS_COOKIE } from "@/lib/viewas";

const DEMO = "@demo.wmto.invalid";
const roleOrder = ["mentor", "partner", "sponsor"] as const;
type RoleKey = (typeof roleOrder)[number];

async function startViewAs(fd: FormData) {
  "use server";
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  (await cookies()).set(VIEW_AS_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  redirect("/connect");
}

type Person = { id: string; name: string; email: string; role: RoleKey; status: string };
type FeedItem = { at: string; text: string; tag: string };

const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}분 전`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h}시간 전`;
  return `${Math.round(h / 24)}일 전`;
};

export default async function AdminViewAs({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const m = getMessages();
  const roleLabel = m.apply.options.role;
  const role = (roleOrder as readonly string[]).includes(sp.role ?? "") ? (sp.role as RoleKey) : "mentor";
  const q = (sp.q ?? "").trim().slice(0, 40);

  let pq = supabase.from("members").select("id,name,email,role,status").eq("role", role).eq("status", "active").order("name").limit(300);
  if (q) pq = pq.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,email.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const [{ data: people }, { data: counts }, logs, refs, thanks, matches, gifts] = await Promise.all([
    pq,
    supabase.from("members").select("role").eq("status", "active").limit(5000),
    supabase.from("mentoring_logs").select("held_at,content,created_by,matching_id").order("held_at", { ascending: false }).limit(6),
    supabase.from("referrals").select("created_at,giver_id,receiver_id,client_name").order("created_at", { ascending: false }).limit(6),
    supabase.from("thanks_letters").select("created_at,sender_id,recipient_id").order("created_at", { ascending: false }).limit(6),
    supabase.from("matchings").select("created_at,mentor_id,partner_id").order("created_at", { ascending: false }).limit(5),
    supabase.from("donations").select("created_at,sponsor_id,partner_id,amount,kind").order("created_at", { ascending: false }).limit(5),
  ]);
  const list = (people ?? []) as Person[];
  const total: Record<string, number> = {};
  (counts ?? []).forEach((c) => { total[c.role as string] = (total[c.role as string] ?? 0) + 1; });

  // 최근 활동 피드(전체 회원). 이름은 한 번에 조회합니다.
  const ids = new Set<string>();
  (logs.data ?? []).forEach((x) => ids.add(x.created_by));
  (refs.data ?? []).forEach((x) => { ids.add(x.giver_id); ids.add(x.receiver_id); });
  (thanks.data ?? []).forEach((x) => { ids.add(x.sender_id); ids.add(x.recipient_id); });
  (matches.data ?? []).forEach((x) => { ids.add(x.mentor_id); ids.add(x.partner_id); });
  (gifts.data ?? []).forEach((x) => { ids.add(x.sponsor_id); if (x.partner_id) ids.add(x.partner_id); });
  const { data: nm } = ids.size ? await supabase.from("members").select("id,name").in("id", [...ids]) : { data: [] };
  const n = new Map((nm ?? []).map((x) => [x.id, x.name]));
  const nameOf = (id: string | null) => (id ? n.get(id) ?? "-" : "-");
  const feed: FeedItem[] = [
    ...(logs.data ?? []).map((x) => ({ at: x.held_at, tag: "멘토링", text: `${nameOf(x.created_by)} 님이 멘토링을 기록했습니다` })),
    ...(refs.data ?? []).map((x) => ({ at: x.created_at, tag: "리퍼럴", text: `${nameOf(x.giver_id)} → ${nameOf(x.receiver_id)} 고객 소개 (${x.client_name})` })),
    ...(thanks.data ?? []).map((x) => ({ at: x.created_at, tag: "감사 편지", text: `${nameOf(x.sender_id)} 선교사가 ${nameOf(x.recipient_id)} 멘토에게 편지를 보냈습니다` })),
    ...(matches.data ?? []).map((x) => ({ at: x.created_at, tag: "매칭", text: `${nameOf(x.mentor_id)} 멘토와 ${nameOf(x.partner_id)} 선교사가 연결되었습니다` })),
    ...(gifts.data ?? []).map((x) => ({ at: x.created_at, tag: "후원", text: `${nameOf(x.sponsor_id)} 님이 ${x.partner_id ? nameOf(x.partner_id) + " 선교사를" : "사역을"} 후원했습니다 (${Number(x.amount).toLocaleString("ko-KR")}원)` })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 14);

  return (
    <>
      <h1 className="display mb-2 text-[2rem] md:text-[2.4rem]">앱 화면 보기</h1>
      <p className="text-soft">회원을 고르면 그 회원의 시점으로 회원 앱(WMTO Connect)을 볼 수 있습니다. <b className="font-semibold text-ink">읽기 전용</b>이라 저장되거나 바뀌는 것은 없습니다.</p>

      <h2 className="mt-12 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">지금 돌아가고 있는 활동</h2>
      <ul className="alist divide-y divide-black/[0.06]">
        {feed.length === 0 && <li className="py-6 text-soft">아직 활동이 없습니다. 데모 데이터를 넣으면 이곳에 활동이 채워집니다.</li>}
        {feed.map((f, i) => (
          <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
            <span><span className="mr-2 rounded-full bg-tint px-2.5 py-0.5 text-xs font-medium text-accent">{f.tag}</span>{f.text}</span>
            <span className="text-xs text-soft">{ago(f.at)}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 mb-3 text-[12px] font-medium tracking-[0.14em] text-soft">회원 고르기</h2>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        {roleOrder.map((r) => (
          <a key={r} href={`/admin/view-as?role=${r}`}
            className={`rounded-full px-4 py-1.5 ring-1 transition-colors duration-500 ${r === role ? "bg-ink text-white ring-ink" : "bg-white/70 ring-black/10 hover:bg-white"}`}>
            {roleLabel[r]} {total[r] ?? 0}
          </a>
        ))}
        <form action="/admin/view-as" className="ml-auto flex gap-2">
          <input type="hidden" name="role" value={role} />
          <input name="q" defaultValue={q} placeholder="이름·이메일 검색" className="field !w-56 !py-1.5 !text-sm" aria-label="검색" />
          <button className="cbtn cbtn-sm cbtn-quiet">검색</button>
        </form>
      </div>
      <ul className="alist divide-y divide-black/[0.06]">
        {list.length === 0 && <li className="py-6 text-soft">해당하는 활성 회원이 없습니다.</li>}
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <span>
              <b className="font-semibold">{p.name}</b> <span className="text-soft">{p.email}</span>
              {p.email.endsWith(DEMO) && <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-soft">데모</span>}
            </span>
            <form action={startViewAs}>
              <input type="hidden" name="id" value={p.id} />
              <button className="cbtn cbtn-sm">앱 화면 보기</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
