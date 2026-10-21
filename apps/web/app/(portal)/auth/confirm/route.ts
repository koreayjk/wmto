import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["invite", "magiclink", "email", "recovery"];

// 이메일 링크(초대·로그인) 확인. 다른 기기·브라우저에서 열어도 동작하도록 token_hash 방식을 씁니다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/connect";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/connect";

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(safeNext, origin));
  }
  return NextResponse.redirect(new URL("/connect/login?error=link", origin));
}
