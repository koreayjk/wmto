import { createClient } from "@supabase/supabase-js";
import { DB_SCHEMA } from "./schema";

/** 쿠키 없이 공개 콘텐츠(일정·스토리)만 읽는 클라이언트. 설정이 없으면 null. */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false }, db: { schema: DB_SCHEMA } });
}
