import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { DB_SCHEMA } from "./schema";
import { VIEW_AS_HEADER, viewOnlyFetch } from "../viewas";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured() {
  return Boolean(url() && anon());
}

/** 로그인 세션(쿠키)을 사용하는 클라이언트. RLS 가 적용됩니다. */
/** viewAs: 관리자가 회원 화면을 읽기 전용으로 볼 때의 회원 id (supabase/migrations/0006_view_as.sql) */
export async function createSupabaseServerClient(opts: { viewAs?: string } = {}) {
  const cookieStore = await cookies();
  return createServerClient(url(), anon(), {
    db: { schema: DB_SCHEMA },
    ...(opts.viewAs ? { global: { headers: { [VIEW_AS_HEADER]: opts.viewAs }, fetch: viewOnlyFetch } } : {}),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다. proxy.ts 가 세션을 갱신합니다.
        }
      },
    },
  });
}

/** 서버 전용. RLS 를 우회하므로 신청 폼 저장 등 서버 코드에서만 사용하세요. */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url() || !key) throw new Error("Supabase service role is not configured");
  return createClient(url(), key, { auth: { persistSession: false }, db: { schema: DB_SCHEMA } });
}
