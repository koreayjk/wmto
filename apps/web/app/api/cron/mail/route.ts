import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n";

/**
 * 하루 한 번(Vercel Cron) 메일 알림 요약을 보냅니다.
 *  - 메일 수신에 동의한 회원의 대기열(email_outbox)만 처리하고, 회원마다 한 통으로 모아 보냅니다.
 *  - CRON_SECRET, RESEND_API_KEY, NOTIFY_FROM_EMAIL 이 모두 있어야 동작합니다(없으면 아무것도 하지 않음).
 */
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!key || !from) return NextResponse.json({ ok: true, skipped: "mail not configured" });

  const db = createSupabaseAdminClient();
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const kinds = getMessages("ko").connect.notifications.kinds as Record<string, string>;
  const brand = getMessages("ko").connect.appName;

  // 3일이 지난 대기분은 보내지 않고 정리합니다.
  await db.from("email_outbox").delete().is("sent_at", null).lt("created_at", new Date(Date.now() - 3 * 86400000).toISOString());

  const { data: rows } = await db.from("email_outbox").select("id,member_id,kind,params").is("sent_at", null).order("created_at").limit(1000);
  const byMember = new Map<string, { id: string; kind: string; params: Record<string, string> }[]>();
  for (const r of rows ?? []) byMember.set(r.member_id, [...(byMember.get(r.member_id) ?? []), { id: r.id, kind: r.kind, params: (r.params ?? {}) as Record<string, string> }]);

  let sent = 0, failed = 0;
  for (const [memberId, items] of [...byMember].slice(0, 200)) {
    const { data: m } = await db.from("members").select("email,name,status").eq("id", memberId).maybeSingle();
    const { data: pref } = await db.from("notification_prefs").select("email").eq("member_id", memberId).maybeSingle();
    const ids = items.map((i) => i.id);
    if (!m || m.status !== "active" || !pref?.email) { await db.from("email_outbox").delete().in("id", ids); continue; }
    const lines = items.map((i) => (kinds[i.kind] ?? i.kind).replace(/\{(\w+)\}/g, (_, k) => i.params?.[k] ?? ""));
    const html = `<p>${esc(m.name)}님, 새 알림이 ${lines.length}건 있어요.</p><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<p><a href="${site}/connect/notifications">${esc(brand)}에서 확인하기</a></p>
<p style="color:#777;font-size:12px">이 메일은 알림을 메일로 받기로 하셨기 때문에 보내졌어요. ${esc(brand)} 내 정보에서 언제든 끌 수 있어요: ${site}/connect/profile</p>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: m.email, subject: `[${brand}] 새 알림 ${lines.length}건`, html }),
      });
      if (res.ok) { await db.from("email_outbox").update({ sent_at: new Date().toISOString() }).in("id", ids); sent++; } else failed++;
    } catch { failed++; }
  }
  return NextResponse.json({ ok: true, members: byMember.size, sent, failed });
}
