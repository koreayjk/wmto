import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

const YEAR = 60 * 60 * 24 * 365;

/**
 * 1) 공개 사이트: 한국어는 주소에 접두사가 없고(내부적으로 /ko 로 연결), 영어는 /en 으로 시작합니다.
 * 2) 회원 앱·관리자: 로그인 세션 갱신, 언어는 쿠키(wmto-locale)로 정합니다. 관리자는 항상 한국어.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ───── 회원 앱 · 관리자 · 인증 ─────
  if (pathname.startsWith("/admin") || pathname.startsWith("/connect") || pathname.startsWith("/auth")) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale: Locale = pathname.startsWith("/admin") ? "ko" : isLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const headers = new Headers(request.headers);
    headers.set("x-locale", locale);
    let response = NextResponse.next({ request: { headers } });

    // 미리 불러오기(prefetch) 요청은 세션 갱신을 건너뛰어 서버 부담과 대기를 줄입니다. 실제 이동 때 갱신됩니다.
    if (pathname.startsWith("/auth") || request.headers.get("next-router-prefetch")) return response;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return response;
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers } });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
    return response;
  }

  // ───── 공개 사이트 ─────
  const first = pathname.split("/")[1];
  if (first === "ko") {
    // /ko/... 는 접두사 없는 주소로 정리
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ko/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  const isEn = first === "en";
  const headers = new Headers(request.headers);
  headers.set("x-locale", isEn ? "en" : "ko");
  const response = isEn
    ? NextResponse.next({ request: { headers } })
    : NextResponse.rewrite(new URL(`/ko${pathname === "/" ? "" : pathname}${request.nextUrl.search}`, request.url), { request: { headers } });
  // 마지막으로 본 언어를 기억해 회원 앱 로그인 화면 등에서 이어 씁니다.
  const want: Locale = isEn ? "en" : "ko";
  if (request.cookies.get(LOCALE_COOKIE)?.value !== want) {
    response.cookies.set(LOCALE_COOKIE, want, { path: "/", maxAge: YEAR, sameSite: "lax" });
  }
  return response;
}

export const config = {
  // 정적 파일(확장자가 있는 주소), 내부 경로, API, 매니페스트는 제외
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
