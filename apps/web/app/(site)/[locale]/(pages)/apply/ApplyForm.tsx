"use client";

import { usePathname } from "next/navigation";
import { L } from "@/components/L";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { getMessages, localeFromPathname } from "@/lib/i18n";
import { campTracks, contributionTypes, krRegions, roles, sponsorKinds, sponsorTypes, type ApplicationType } from "@/lib/codes";
import { submitApplication, type ApplyState } from "./actions";

const initial: ApplyState = { ok: false };

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-clay"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Checks({ name, values, labels }: { name: string; values: readonly string[]; labels: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {values.map((v) => (
        <label key={v} className="flex items-center gap-2.5 py-2">
          <input type="checkbox" name={name} value={v} className="h-5 w-5 accent-[var(--clay)]" />
          {labels[v]}
        </label>
      ))}
    </div>
  );
}

function Select({ name, values, labels, required, placeholder }: { name: string; values: readonly string[]; labels: Record<string, string>; required?: boolean; placeholder: string }) {
  return (
    <select name={name} required={required} defaultValue="" className="field">
      <option value="" disabled>{placeholder}</option>
      {values.map((v) => <option key={v} value={v}>{labels[v]}</option>)}
    </select>
  );
}

const input = (name: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
  <input name={name} className="field" {...props} />
);

export function ApplyForm({ type }: { type: ApplicationType }) {
  const m = getMessages(localeFromPathname(usePathname())).apply;
  const [state, action, pending] = useActionState(submitApplication, initial);
  const errRef = useRef<HTMLDivElement>(null);
  // 제출 실패 시 오류 요약으로 포커스를 옮겨 키보드·화면낭독 사용자도 바로 알 수 있게 함
  useEffect(() => { if (state.error) errRef.current?.focus(); }, [state]);
  const f = m.fields;

  if (state.ok) {
    return (
      <div className="mt-14 border-t border-line pt-14">
        <h2 className="display text-3xl">{m.thanks.title}</h2>
        <p className="mt-4 text-lg text-soft">{m.thanks.body}</p>
        <L href="/" className="mt-8 inline-block border border-ink/30 px-6 py-3 hover:bg-ink hover:text-paper rounded-lg">
          {m.thanks.back}
        </L>
      </div>
    );
  }

  return (
    <form action={action} className="mt-10 space-y-6">
      <input type="hidden" name="type" value={type} />
      {state.error && (
        <div ref={errRef} role="alert" tabIndex={-1} className="rounded-2xl bg-[#fdf1ee] p-5 text-[#8a2f1a] outline-none ring-1 ring-[#e9b9ac]">
          <p className="font-bold">{m.errorTitle}</p>
          <p className="mt-1 text-sm">{m.errors[state.error]}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={f.name} required>{input("name", { required: true, autoComplete: "name" })}</Field>
        <Field label={f.email} required>{input("email", { type: "email", required: true, autoComplete: "email" })}</Field>
        <Field label={f.phone}>{input("phone", { type: "tel", autoComplete: "tel" })}</Field>
        <Field label={f.country}>{input("country", { autoComplete: "country-name" })}</Field>
        <Field label={f.region}><Select name="region" values={krRegions} labels={m.options.region} placeholder={m.regionPlaceholder} /></Field>
        <Field label={f.district}>{input("district")}</Field>
      </div>

      {type === "observe" && (
        <>
          <Field label={f.role} required><Select name="role" values={roles} labels={m.options.role} required placeholder={m.select} /></Field>
          <Field label={f.preferredSchedule}>{input("preferredSchedule")}</Field>
        </>
      )}

      {type === "mentor_join" && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.businessName}>{input("businessName")}</Field>
            <Field label={f.industry}>{input("industry")}</Field>
          </div>
          <Field label={f.contributionTypes} required>
            <Checks name="contributionTypes" values={contributionTypes} labels={m.options.contribution} />
          </Field>
        </>
      )}

      {type === "partner_consult" && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.missionField} required>{input("missionField", { required: true })}</Field>
            <Field label={f.sendingOrg}>{input("sendingOrg")}</Field>
          </div>
          <Field label={f.businessIdea}><textarea name="businessIdea" rows={3} className="field" /></Field>
        </>
      )}

      {type === "camp_apply" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={f.missionField} required>{input("missionField", { required: true })}</Field>
          <Field label={f.track} required><Select name="track" values={campTracks} labels={m.options.track} required placeholder={m.select} /></Field>
        </div>
      )}

      {type === "camp_instructor" && (
        <>
          <Field label={f.industry} required>{input("industry", { required: true })}</Field>
          <Field label={f.teachableFields} required>{input("teachableFields", { required: true })}</Field>
          <Field label={f.availability} required>{input("availability", { required: true })}</Field>
        </>
      )}

      {type === "sponsor_inquiry" && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.sponsorType} required><Select name="sponsorType" values={sponsorTypes} labels={m.options.sponsorType} required placeholder={m.select} /></Field>
            <Field label={f.churchName}>{input("churchName")}</Field>
          </div>
          <Field label={f.interestedKinds}>
            <Checks name="interestedKinds" values={sponsorKinds} labels={m.options.sponsorKind} />
          </Field>
        </>
      )}

      <Field label={f.message}><textarea name="message" rows={5} className="field" /></Field>

      <div className="border-t border-line pt-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--clay)]" />
          <span>
            {m.consent}
            <span className="mt-1 block text-sm text-soft">{m.consentHelp}</span>
          </span>
        </label>
      </div>


      <button
        disabled={pending}
        className="w-full rounded-full bg-accent py-4 font-semibold text-white transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:px-16"
      >
        {pending ? m.submitting : m.submit}
      </button>
    </form>
  );
}
