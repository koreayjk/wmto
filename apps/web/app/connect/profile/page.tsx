import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { contributionTypes, sponsorTypes } from "@/lib/codes";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const opt = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max) || null;

async function saveProfile(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const name = String(fd.get("name") ?? "").trim().slice(0, 100);
  if (!name) return;
  // 변경 가능한 컬럼은 DB 권한(column grant)으로도 제한됩니다. role/status/stage 는 수정할 수 없습니다.
  await supabase.from("members").update({ name, phone: opt(fd, "phone", 50), country: opt(fd, "country", 100) }).eq("id", me.id);
  if (me.role === "mentor") {
    const types = fd.getAll("contribution_types").map(String).filter((v) => (contributionTypes as readonly string[]).includes(v));
    await supabase.from("mentor_profiles").update({ business_name: opt(fd, "business_name"), industry: opt(fd, "industry"), contribution_types: types }).eq("member_id", me.id);
  } else if (me.role === "partner") {
    await supabase.from("partner_profiles").update({ mission_field: opt(fd, "mission_field"), sending_org: opt(fd, "sending_org"), business_idea: opt(fd, "business_idea", 1000) }).eq("member_id", me.id);
  } else if (me.role === "sponsor") {
    const st = String(fd.get("sponsor_type") ?? "");
    await supabase.from("sponsor_profiles").update({ sponsor_type: (sponsorTypes as readonly string[]).includes(st) ? st : null, church_name: opt(fd, "church_name") }).eq("member_id", me.id);
  }
  revalidatePath("/connect/profile");
  redirect("/connect/profile?saved=1");
}

async function logout() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/connect/login");
}

export default async function Profile({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { me } = await requireMe();
  const c = getMessages().connect;
  const t = c.profile;
  const f = getMessages().apply;
  const p = (me.profile ?? {}) as Record<string, string | string[] | null>;
  const { saved } = await searchParams;
  const roleLabel = me.role ? f.options.role[me.role] : "—";

  return (
    <div className="space-y-4">
      <PageTitle>{t.title}</PageTitle>
      {saved && <p role="status" className="border border-clay/40 bg-clay/10 p-3 text-sm">{t.saved}</p>}
      <Card>
        <p className="text-sm text-soft">{t.role}: {roleLabel}{me.stage ? ` · ${t.stage}: ${c.stageNames[me.stage as keyof typeof c.stageNames]}` : ""}</p>
        <p className="mt-1 text-sm text-soft">{me.email}</p>
      </Card>
      <Card>
        <form action={saveProfile} className="space-y-4">
          <label className="block"><span className={labelCls}>{f.fields.name}</span><input name="name" required defaultValue={me.name} className="field" /></label>
          <label className="block"><span className={labelCls}>{f.fields.phone}</span><input name="phone" type="tel" defaultValue={me.phone ?? ""} className="field" /></label>
          <label className="block"><span className={labelCls}>{f.fields.country}</span><input name="country" defaultValue={me.country ?? ""} className="field" /></label>

          {me.role === "mentor" && (
            <>
              <label className="block"><span className={labelCls}>{f.fields.businessName}</span><input name="business_name" defaultValue={(p.business_name as string) ?? ""} className="field" /></label>
              <label className="block"><span className={labelCls}>{f.fields.industry}</span><input name="industry" defaultValue={(p.industry as string) ?? ""} className="field" /></label>
              <fieldset>
                <legend className={labelCls}>{f.fields.contributionTypes}</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {contributionTypes.map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input type="checkbox" name="contribution_types" value={v} defaultChecked={((p.contribution_types as string[]) ?? []).includes(v)} className="h-4 w-4 accent-[var(--clay)]" />
                      {c.contribution[v]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          {me.role === "partner" && (
            <>
              <label className="block"><span className={labelCls}>{f.fields.missionField}</span><input name="mission_field" defaultValue={(p.mission_field as string) ?? ""} className="field" /></label>
              <label className="block"><span className={labelCls}>{f.fields.sendingOrg}</span><input name="sending_org" defaultValue={(p.sending_org as string) ?? ""} className="field" /></label>
              <label className="block"><span className={labelCls}>{f.fields.businessIdea}</span><textarea name="business_idea" rows={3} defaultValue={(p.business_idea as string) ?? ""} className="field" /></label>
            </>
          )}
          {me.role === "sponsor" && (
            <>
              <label className="block">
                <span className={labelCls}>{f.fields.sponsorType}</span>
                <select name="sponsor_type" defaultValue={(p.sponsor_type as string) ?? ""} className="field">
                  <option value="">선택</option>
                  {sponsorTypes.map((v) => <option key={v} value={v}>{f.options.sponsorType[v]}</option>)}
                </select>
              </label>
              <label className="block"><span className={labelCls}>{f.fields.churchName}</span><input name="church_name" defaultValue={(p.church_name as string) ?? ""} className="field" /></label>
            </>
          )}
          <button className="w-full bg-clay py-3.5 font-medium text-white">{t.save}</button>
        </form>
      </Card>
      <p className="px-1 text-sm text-soft">{t.install}</p>
      <form action={logout}><button className="w-full border border-ink/30 py-3.5 hover:bg-ink hover:text-paper">{t.logout}</button></form>
    </div>
  );
}
