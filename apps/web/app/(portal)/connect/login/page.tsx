import Link from "next/link";
import { redirect } from "next/navigation";
import { getMessages, localizeHref } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function sendLink(fd: FormData) {
  "use server";
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || !isSupabaseConfigured()) redirect("/connect/login?error=email");
  const supabase = await createSupabaseServerClient();
  // 승인된(가입된) 이메일만 가능. 새 계정은 만들지 않습니다.
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/confirm?next=/connect` },
  });
  // 가입 여부가 드러나지 않도록 항상 같은 안내를 보여줍니다.
  redirect("/connect/login?sent=1");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const m = getMessages(locale).connect.login;
  const { sent, error } = await searchParams;
  const msg = error === "link" ? m.invalidLink : error === "inactive" ? m.inactive : error === "email" ? getMessages(locale).connect.emailError : null;
  return (
    <div className="pt-8">
      <h1 className="display text-3xl">{m.title}</h1>
      <p className="mt-3 text-soft">{m.sub}</p>
      {sent ? (
        <p role="status" className="mt-8 rounded-2xl bg-tint p-5 text-accent">{m.sent}</p>
      ) : (
        <form action={sendLink} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{m.email}</span>
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          {msg && <p role="alert" className="text-sm text-clay">{msg}</p>}
          <button className="cbtn w-full">{m.send}</button>
        </form>
      )}
      <p className="mt-10 text-sm text-soft">
        {m.notMember}{" "}
        <Link href={localizeHref(locale, "/apply?type=observe")} className="underline">{m.apply}</Link>
      </p>
    </div>
  );
}
