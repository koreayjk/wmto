import type { ApplicationInput } from "./applications";
import { getMessages } from "./i18n";

/** 관리자 알림 메일(Resend). 키가 없으면 조용히 건너뜁니다. 실패해도 신청 저장에는 영향 없음. */
export async function notifyAdmin(input: ApplicationInput, applicationId: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!key || !to || !from) return;

  const m = getMessages();
  const label = m.apply.types[input.type].name;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `[WMTO] 새 신청: ${label} — ${input.name}`,
        html: `<p><b>${esc(label)}</b></p>
<p>${esc(input.name)} (${esc(input.email)})</p>
<p>${esc(input.message ?? "")}</p>
<p><a href="${site}/admin">관리자 페이지에서 보기</a> · ${applicationId}</p>`,
      }),
    });
  } catch {
    // 알림 실패는 무시
  }
}
