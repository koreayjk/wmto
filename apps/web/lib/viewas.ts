import { cookies } from "next/headers";

/** 관리자의 "회원 화면 보기" 상태. 쿠키에 보고 있는 회원 id 를 담습니다(관리자에게만 효력이 있습니다). */
export const VIEW_AS_COOKIE = "wmto-view-as";
export const VIEW_AS_HEADER = "x-wmto-view-as";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getViewAsId(): Promise<string | null> {
  const v = (await cookies()).get(VIEW_AS_COOKIE)?.value;
  return v && UUID.test(v) ? v : null;
}

// 보기 모드에서 허용하는 요청: 조회(GET/HEAD)와 조회용 RPC 만. 나머지는 모두 막아 "보기 전용"을 지킵니다.
const READ_RPC = /\/rest\/v1\/rpc\/(open_matching_requests|mentor_directory|sponsor_overview|sponsor_gifts|sponsor_partner_feed|fund_overview)(\?|$)/;

export const viewOnlyFetch: typeof fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
  const allowed = method === "GET" || method === "HEAD" || url.includes("/auth/v1/") || (method === "POST" && READ_RPC.test(url));
  if (!allowed) {
    return new Response(JSON.stringify({ code: "view_only", message: "관리자 보기 모드에서는 저장할 수 없습니다." }), {
      status: 403, headers: { "content-type": "application/json" },
    });
  }
  return fetch(input, init);
};
