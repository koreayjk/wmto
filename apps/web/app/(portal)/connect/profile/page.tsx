import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasMission } from "@/lib/me";
import { requireMe } from "@/lib/me";
import { getMessages } from "@/lib/i18n";
import { getPortalLocale } from "@/lib/locale";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/connect/Avatar";
import { groupCategories, loadCategories } from "@/lib/categories";
import { AvatarUploader } from "@/components/connect/AvatarUploader";
import { contributionTypes, krRegions, sponsorTypes } from "@/lib/codes";
import { Card, PageTitle, labelCls } from "@/components/connect/ui";

const opt = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max) || null;

async function saveProfile(fd: FormData) {
  "use server";
  const { me, supabase } = await requireMe();
  const name = String(fd.get("name") ?? "").trim().slice(0, 100);
  if (!name) return;
  // 변경 가능한 컬럼은 DB 권한(column grant)으로도 제한됩니다. role/status/stage 는 수정할 수 없습니다.
  await supabase.from("members").update({ name, phone: opt(fd, "phone", 50), country: opt(fd, "country", 100), region: (krRegions as readonly string[]).includes(String(fd.get("region"))) ? String(fd.get("region")) : null, district: opt(fd, "district", 100) }).eq("id", me.id);
  if (me.role === "mentor") {
    const types = fd.getAll("contribution_types").map(String).filter((v) => (contributionTypes as readonly string[]).includes(v));
    // 업종은 표준 목록에서 고릅니다. 한 챕터에 같은 업종이 이미 있으면 DB 가 거부합니다.
    // 업종은 처음 정할 때만 직접 고르고, 바꿀 때는 신청 후 승인(아래 requestCategoryChange).
    const cid = /^\d+$/.test(String(fd.get("category_id") ?? "")) ? Number(fd.get("category_id")) : null;
    const { data: curRow } = await supabase.from("mentor_profiles").select("category_id,industry").eq("member_id", me.id).maybeSingle();
    if (cid && !curRow?.category_id) {
      const { error: ce } = await supabase.rpc("set_first_category", { p_category: cid });
      if (ce?.message.includes("category_taken")) redirect("/connect/profile?error=category_taken");
    }
    const { error } = await supabase.from("mentor_profiles").update({
      business_name: opt(fd, "business_name"), ...(!curRow?.category_id && !cid ? { industry: opt(fd, "industry") } : {}), ...(fd.has("mission_heart") ? { contribution_types: types } : {}),
      intro: opt(fd, "intro", 1500), keywords: opt(fd, "keywords", 300), years_in_business: /^\d{1,2}$/.test(String(fd.get("years") ?? "")) ? Number(fd.get("years")) : null,
      website: opt(fd, "website", 200), church: opt(fd, "church", 120), faith_story: opt(fd, "faith_story", 1000), ...(fd.has("mission_heart") ? { mission_heart: opt(fd, "mission_heart", 1000) } : {}),
    }).eq("member_id", me.id);
    if (error?.message.includes("category_taken")) redirect("/connect/profile?error=category_taken");
  } else if (me.role === "partner") {
    await supabase.from("partner_profiles").update({ mission_field: opt(fd, "mission_field"), sending_org: opt(fd, "sending_org"), business_idea: opt(fd, "business_idea", 1000) }).eq("member_id", me.id);
  } else if (me.role === "sponsor") {
    const st = String(fd.get("sponsor_type") ?? "");
    await supabase.from("sponsor_profiles").update({ sponsor_type: (sponsorTypes as readonly string[]).includes(st) ? st : null, church_name: opt(fd, "church_name") }).eq("member_id", me.id);
  }
  revalidatePath("/connect/profile");
  redirect("/connect/profile?saved=1");
}

async function setEmailPref(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  await r.supabase.rpc("set_email_pref", { p_on: fd.get("on") === "1" });
  revalidatePath("/connect/profile");
}

async function requestCategoryChange(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const cid = /^\d+$/.test(String(fd.get("category_id") ?? "")) ? Number(fd.get("category_id")) : 0;
  if (cid) await r.supabase.rpc("request_category_change", { p_category: cid, p_note: String(fd.get("note") ?? "") });
  revalidatePath("/connect/profile");
}

/** 증명사진: 서버가 Storage(wmto-avatars)에 올리고 주소만 저장합니다. 보기 전용(관리자·체험)에서는 저장하지 않습니다. */
async function uploadAvatar(fd: FormData) {
  "use server";
  const r = await requireMe();
  if (r.viewAs || r.demo) return;
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
  const db = createSupabaseAdminClient();
  const path = `${r.me.id}/${Date.now()}.jpg`;
  const { error } = await db.storage.from("wmto-avatars").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
  if (error) { console.error("avatar upload failed", error.message); return; }
  await db.from("members").update({ photo_url: db.storage.from("wmto-avatars").getPublicUrl(path).data.publicUrl }).eq("id", r.me.id);
  revalidatePath("/connect", "layout");
}

async function logout() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/connect/login");
}

async function setLanguage(fd: FormData) {
  "use server";
  const v = fd.get("locale");
  if (isLocale(v)) (await cookies()).set(LOCALE_COOKIE, v, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/connect", "layout");
  redirect("/connect/profile");
}

export default async function Profile({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getPortalLocale();
  const { me, supabase } = await requireMe();
  const c = getMessages(locale).connect;
  const t = c.profile;
  const f = getMessages(locale).apply;
  const p = (me.profile ?? {}) as Record<string, string | string[] | null>;
  const { saved, error: err } = await searchParams;
  const cats = me.role === "mentor" ? groupCategories(await loadCategories(supabase), locale === "en" ? "en" : "ko") : [];
  const { data: loc } = await supabase.from("members").select("region,district").eq("id", me.id).maybeSingle();
  const roleLabel = me.role ? f.options.role[me.role] : "-";
  const { data: pendingChange } = me.role === "mentor" ? await supabase.from("category_change_requests").select("id").eq("member_id", me.id).eq("status", "pending").maybeSingle() : { data: null };
  const { data: mailPref } = await supabase.rpc("my_email_pref");
  const mailOn = mailPref === true;
  const hasCategory = !!p.category_id;
  const currentCatName = hasCategory ? (cats.flatMap((g) => g.items).find((i) => i.id === Number(p.category_id))?.label ?? (p.industry as string) ?? "") : "";
  // 프로필 완성도(사업가): 비어 있는 항목을 알려 줍니다.
  const filled = (v: unknown) => !(v == null || v === "" || (Array.isArray(v) && v.length === 0));
  const checks: [string, boolean][] = me.role === "mentor" ? [
    ["photo", !!me.photo_url], ["phone", !!me.phone], ["region", !!loc?.region], ["business_name", filled(p.business_name)], ["category", filled(p.category_id)],
    ["intro", filled(p.intro)], ["keywords", filled(p.keywords)], ["years", filled(p.years_in_business)], ["website", filled(p.website)],
    ["church", filled(p.church)], ["faith", filled(p.faith_story)], ...(hasMission(me) ? ([["mission", filled(p.mission_heart)]] as [string, boolean][]) : []),
  ] : [];
  const pct = checks.length ? Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100) : 0;
  const missingKeys = checks.filter(([, ok]) => !ok).map(([k]) => k);

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start">
      <div className="lg:col-span-full"><PageTitle eyebrow="Profile">{t.title}</PageTitle></div>
      {err === "category_taken" && <p role="alert" className="lg:col-span-full rounded-2xl bg-[#fdf1ee] px-4 py-3 text-sm text-[#8a2f1a]">{t.categoryTaken}</p>}
      {saved && <p role="status" className="lg:col-span-full rounded-2xl bg-tint px-4 py-3 text-sm text-accent">{t.saved}</p>}
      <div className="space-y-5 lg:sticky lg:top-6">
      <Card>
        <AvatarUploader action={uploadAvatar} hasPhoto={!!me.photo_url} name={t.photo.title} labels={t.photo}
          preview={me.photo_url ? <Avatar name={me.name} url={me.photo_url} size={88} /> : <Avatar name={me.name} size={88} />} />
      </Card>
      {checks.length > 0 && (
        <Card title={t.complete.title}>
          <div className="flex items-center gap-4"><span className="text-[2rem] font-light tabular-nums leading-none">{pct}%</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.07]"><span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></span></div>
          <p className="mt-3 text-xs text-soft">{t.complete.hint}</p>
          {missingKeys.length === 0 ? <p className="mt-3 text-sm text-accent">{t.complete.done}</p> : (
            <p className="mt-3 text-sm"><b className="font-medium">{t.complete.missing}</b><br /><span className="text-soft">{missingKeys.map((k) => (t.complete.items as Record<string, string>)[k]).join(" · ")}</span></p>
          )}
        </Card>
      )}
      <Card>
        <p className="text-sm text-soft">{t.role}: {roleLabel}{me.stage ? ` · ${t.stage}: ${c.stageNames[me.stage as keyof typeof c.stageNames]}` : ""}</p>
        <p className="mt-1 text-sm text-soft">{me.email}</p>
      </Card>
      <Card>
        <form action={setLanguage} data-demo-allow className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{t.language}</span>
          <span className="flex gap-2">
            {([["ko", "한국어"], ["en", "English"]] as const).map(([v, label]) => (
              <button key={v} name="locale" value={v} aria-pressed={locale === v}
                className={`rounded-full border px-4 py-2 text-sm ${locale === v ? "border-accent bg-accent text-white" : "border-black/10 text-soft"}`}>
                {label}
              </button>
            ))}
          </span>
        </form>
      </Card>
      <Card title={t.mail.title}>
        <p className="mb-4 text-sm leading-relaxed text-soft">{t.mail.text}</p>
        <form action={setEmailPref} className="flex gap-2">
          <button name="on" value="1" aria-pressed={mailOn} className={`rounded-full border px-4 py-2 text-sm ${mailOn ? "border-accent bg-accent text-white" : "border-black/10 text-soft"}`}>{t.mail.on}</button>
          <button name="on" value="0" aria-pressed={!mailOn} className={`rounded-full border px-4 py-2 text-sm ${!mailOn ? "border-accent bg-accent text-white" : "border-black/10 text-soft"}`}>{t.mail.off}</button>
        </form>
      </Card>
      <p className="px-1 text-sm text-soft">{t.install}</p>
      <form action={logout} data-demo-allow><button className="cbtn cbtn-quiet w-full">{t.logout}</button></form>
      </div>
      <Card>
        <form action={saveProfile} className="space-y-4">
          <label className="block"><span className={labelCls}>{f.fields.name}</span><input name="name" required defaultValue={me.name} className="field" /></label>
          <label className="block"><span className={labelCls}>{f.fields.phone}</span><input name="phone" type="tel" defaultValue={me.phone ?? ""} className="field" /></label>
          <label className="block"><span className={labelCls}>{f.fields.country}</span><input name="country" defaultValue={me.country ?? ""} className="field" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>{f.fields.region}</span>
              <select name="region" defaultValue={loc?.region ?? ""} className="field">
                <option value="">{c.select}</option>
                {krRegions.map((v) => <option key={v} value={v}>{f.options.region[v]}</option>)}
              </select>
            </label>
            <label className="block"><span className={labelCls}>{f.fields.district}</span><input name="district" defaultValue={loc?.district ?? ""} className="field" /></label>
          </div>
          {(me.role === "mentor" || me.role === "sponsor") && <p className="text-xs text-soft">{t.locationNote}</p>}

          {me.role === "mentor" && (
            <>
              <label className="block"><span className={labelCls}>{f.fields.businessName}</span><input name="business_name" defaultValue={(p.business_name as string) ?? ""} className="field" /></label>
              <label className="block">
                <span className={labelCls}>{f.fields.industry}</span>
                {hasCategory ? (
                  <span className="field flex items-center !bg-black/[0.03] text-soft">{currentCatName}</span>
                ) : cats.length > 0 ? (
                  <select name="category_id" defaultValue={String((p.category_id as number | null) ?? "")} className="field">
                    <option value="">{c.select}</option>
                    {cats.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</optgroup>)}
                  </select>
                ) : <input name="industry" defaultValue={(p.industry as string) ?? ""} className="field" />}
                {cats.length > 0 && <span className="mt-2 block text-xs text-soft">{hasCategory ? getMessages(locale).connect.catChange.note : t.categoryNote}</span>}
              </label>
              <h3 className="pt-2 text-[13px] font-medium text-soft">{t.more.title}</h3>
              <label className="block"><span className={labelCls}>{t.more.intro}</span><textarea name="intro" rows={3} maxLength={1500} defaultValue={(p.intro as string) ?? ""} placeholder={t.more.introHint} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.more.keywords}</span><input name="keywords" maxLength={300} defaultValue={(p.keywords as string) ?? ""} placeholder={t.more.keywordsHint} className="field" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className={labelCls}>{t.more.years}</span><input name="years" type="number" min={0} max={99} defaultValue={(p.years_in_business as number | null) ?? ""} className="field" /></label>
                <label className="block"><span className={labelCls}>{t.more.website}</span><input name="website" type="url" maxLength={200} defaultValue={(p.website as string) ?? ""} className="field" /></label>
              </div>
              <label className="block"><span className={labelCls}>{t.more.church}</span><input name="church" maxLength={120} defaultValue={(p.church as string) ?? ""} className="field" /></label>
              <label className="block"><span className={labelCls}>{t.more.faith}</span><textarea name="faith_story" rows={3} maxLength={1000} defaultValue={(p.faith_story as string) ?? ""} placeholder={t.more.faithHint} className="field" /></label>
              {hasMission(me) && <label className="block"><span className={labelCls}>{t.more.mission}</span><textarea name="mission_heart" rows={3} maxLength={1000} defaultValue={(p.mission_heart as string) ?? ""} placeholder={t.more.missionHint} className="field" /></label>}
              {hasMission(me) && <fieldset>
                <legend className={labelCls}>{f.fields.contributionTypes}</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {contributionTypes.map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input type="checkbox" name="contribution_types" value={v} defaultChecked={((p.contribution_types as string[]) ?? []).includes(v)} className="h-4 w-4 accent-[var(--clay)]" />
                      {c.contribution[v]}
                    </label>
                  ))}
                </div>
              </fieldset>}
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
                  <option value="">{c.select}</option>
                  {sponsorTypes.map((v) => <option key={v} value={v}>{f.options.sponsorType[v]}</option>)}
                </select>
              </label>
              <label className="block"><span className={labelCls}>{f.fields.churchName}</span><input name="church_name" defaultValue={(p.church_name as string) ?? ""} className="field" /></label>
            </>
          )}
          <button className="cbtn w-full">{t.save}</button>
        </form>
      </Card>
      {me.role === "mentor" && hasCategory && (
        <Card title={getMessages(locale).connect.catChange.title}>
          {pendingChange ? <p className="text-sm">{getMessages(locale).connect.catChange.pending}</p> : (
            <form action={requestCategoryChange} className="space-y-4">
              <label className="block"><span className={labelCls}>{getMessages(locale).connect.catChange.pick}</span>
                <select name="category_id" defaultValue="" className="field"><option value="">{c.select}</option>{cats.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</optgroup>)}</select></label>
              <label className="block"><span className={labelCls}>{getMessages(locale).connect.catChange.why}</span><input name="note" maxLength={500} className="field" /></label>
              <button className="cbtn cbtn-quiet">{getMessages(locale).connect.catChange.send}</button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
