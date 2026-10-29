import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_EMAIL, ensureDemoUser, pickDemoMember } from "@/lib/demo";
import { VIEW_AS_COOKIE } from "@/lib/viewas";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { Card, PageTitle } from "@/components/connect/ui";
import { PendingButton } from "@/components/connect/PendingButton";

async function enterDemo() {
  "use server";
  const db = createSupabaseAdminClient();
  // 처음 보여 줄 사업가 모드의 회원을 고르고(데모 데이터가 없으면 안내), 계정을 준비합니다. 둘을 동시에 처리합니다.
  const [first] = await Promise.all([pickDemoMember("mentor"), ensureDemoUser(db)]);
  if (!first) redirect("/connect/demo?error=empty");
  // 비밀번호 없이, 서버가 데모 계정의 로그인 세션을 만들어 줍니다.
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email: DEMO_EMAIL });
  const hash = data?.properties?.hashed_token;
  if (error || !hash) redirect("/connect/demo?error=login");
  const supabase = await createSupabaseServerClient();
  const { error: e2 } = await supabase.auth.verifyOtp({ token_hash: hash, type: "magiclink" });
  if (e2) redirect("/connect/demo?error=login");
  (await cookies()).set(VIEW_AS_COOKIE, first, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 }); // 처음에는 사업가 모드로 시작
  redirect("/connect");
}

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const locale = await getPortalLocale();
  const d = getMessages(locale).connect.demo;
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl space-y-4 pt-4 md:pt-12">
      <PageTitle eyebrow="Experience" sub={d.sub}>{d.title}</PageTitle>
      <Card title={d.what.title}>
        <p className="leading-relaxed">{d.what.body}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {d.roles.map((r) => (
            <li key={r.name} className="rounded-2xl bg-tint p-4">
              <b className="block font-display">{r.name}</b>
              <span className="mt-1 block text-sm leading-relaxed text-soft">{r.text}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title={d.tourTitle}>
        <ol className="space-y-4">
          {d.flow.map((f, i) => (
            <li key={f.name} className="flex gap-4">
              <span className="font-display text-xl text-accent tabular-nums">{i + 1}</span>
              <span><b className="block font-display">{f.name}</b><span className="text-sm leading-relaxed text-soft">{f.text}</span></span>
            </li>
          ))}
        </ol>
      </Card>
      <Card className="lg:!col-span-1">
        <ul className="space-y-3 leading-relaxed">
          {d.points.map((p) => (
            <li key={p} className="flex gap-3"><span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />{p}</li>
          ))}
        </ul>
        {error && <p role="alert" className="mt-5 rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{error === "empty" ? d.empty : d.failed}</p>}
        <form action={enterDemo} className="mt-7">
          <PendingButton className="cbtn w-full" pending={d.entering}>{d.enter}</PendingButton>
        </form>
        <p className="mt-4 text-xs text-soft">{d.note}</p>
      </Card>
    </div>
  );
}
