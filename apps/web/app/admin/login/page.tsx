import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n";

async function login(fd: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  });
  redirect(error ? "/admin/login?error=invalid" : "/admin");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const m = getMessages().admin;
  const msg =
    error === "forbidden" ? m.notAdmin
    : error === "invalid" ? "이메일 또는 비밀번호를 확인해 주세요."
    : error === "config" ? "Supabase 환경 변수가 설정되지 않았습니다."
    : null;
  return (
    <div className="mx-auto max-w-sm px-6 py-32">
      <h1 className="display text-3xl">{m.title}</h1>
      <form action={login} className="mt-8 space-y-4">
        <input name="email" type="email" required placeholder="이메일" aria-label="이메일" className="field" />
        <input name="password" type="password" required placeholder="비밀번호" aria-label="비밀번호" className="field" />
        {msg && <p role="alert" className="text-sm text-clay">{msg}</p>}
        <button className="w-full bg-clay py-3 font-medium text-white rounded-lg">{m.login}</button>
      </form>
    </div>
  );
}
