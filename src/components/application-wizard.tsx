"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field, areaClass, fieldClass } from "@/components/field";
import { ScopeNotice, StatusHint } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import {
  contactMethodLabels,
  contactMethods,
  coverageTypeLabels,
  coverageTypes,
  emptyApplicationDraft,
  employmentStatusLabels,
  employmentStatuses,
  homeLicenseState,
  incomeBandLabels,
  incomeBands,
  isWashingtonCounty,
  newHouseholdMember,
  persistableDraft,
  publicApplication,
  relationshipLabels,
  relationships,
  validateWizardStep,
  washingtonCounties,
  wizardSteps,
  yesNoUnsure,
  yesNoUnsureLabels,
  type ApplicationDraft,
  type ApplicationFieldErrors,
  type ContactMethod,
  type CoverageType,
  type EmploymentStatus,
  type HouseholdMember,
  type IncomeBand,
  type PlanInterest,
  type Relationship,
  type TobaccoAnswer,
  type WizardStepId,
  type YesNoUnsure,
} from "@/lib/application";
import {
  agentAssistanceConsentText,
  portalDisclaimer,
} from "@/lib/legal";
import { countyForZip, formatUsd, planById, toPlanInterest } from "@/lib/plans";
import {
  APPLICATION_DRAFT_STORAGE_KEY,
  APPLICATION_STORAGE_KEY,
  SELECTED_PLAN_STORAGE_KEY,
} from "@/lib/site";
import { cn } from "@/lib/utils";

type Lookup = { id: string; email: string };
type PublicApplication = ReturnType<typeof publicApplication>;

function readLookup(): Lookup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Lookup>;
    if (typeof parsed.id === "string" && typeof parsed.email === "string") {
      return { id: parsed.id, email: parsed.email };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function readLocalDraft(): { step: WizardStepId; fields: ApplicationDraft } | null {
  try {
    const raw = window.localStorage.getItem(APPLICATION_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      step?: WizardStepId;
      fields?: ApplicationDraft;
    };
    if (!parsed.fields) return null;
    const step =
      wizardSteps.some((item) => item.id === parsed.step) && parsed.step
        ? parsed.step
        : "identity";
    return {
      step,
      fields: { ...emptyApplicationDraft, ...parsed.fields, ssn: "" },
    };
  } catch {
    return null;
  }
}

function readSelectedPlan(): PlanInterest | null {
  try {
    const raw = window.localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlanInterest;
  } catch {
    return null;
  }
}

function persistLocal(
  step: WizardStepId,
  fields: ApplicationDraft,
  lookup?: Lookup | null
) {
  window.localStorage.setItem(
    APPLICATION_DRAFT_STORAGE_KEY,
    JSON.stringify({
      step,
      fields: persistableDraft(fields),
      savedAt: new Date().toISOString(),
    })
  );
  if (lookup) {
    window.localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(lookup));
  }
}

function draftFromPublic(application: PublicApplication): ApplicationDraft {
  return {
    fullName: application.fullName,
    dateOfBirth: application.dateOfBirth,
    ssn: "",
    email: application.email,
    phone: application.phone,
    preferredContactMethod: application.preferredContactMethod,
    streetAddress: application.streetAddress,
    city: application.city,
    state: application.state,
    zip: application.zip,
    county: application.county,
    householdMembers: application.householdMembers,
    incomeBand: application.incomeBand,
    annualIncome: application.annualIncome,
    employmentStatus: application.employmentStatus,
    employerName: application.employerName,
    employerOffersCoverage: application.employerOffersCoverage,
    hasCurrentCoverage: application.hasCurrentCoverage,
    currentCoverageType: application.currentCoverageType,
    losingCoverageSoon: application.losingCoverageSoon,
    notes: application.notes,
    selectedPlan: application.selectedPlan,
    acceptedDisclaimer: application.acceptedDisclaimer,
    agentAssistanceConsent: application.agentAssistanceConsent,
  };
}

export function ApplicationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stepIndex, setStepIndex] = useState(0);
  const [fields, setFields] = useState<ApplicationDraft>(emptyApplicationDraft);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [ssnOnFile, setSsnOnFile] = useState(false);
  const [ssnMasked, setSsnMasked] = useState("");
  const [errors, setErrors] = useState<ApplicationFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const step = wizardSteps[stepIndex] ?? wizardSteps[0];

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const lookup = readLookup();
        const local = readLocalDraft();
        const storedPlan = readSelectedPlan();
        const queryPlan = planById(searchParams.get("plan") ?? "");
        const queryCounty = searchParams.get("county") ?? "";
        const queryZip = searchParams.get("zip") ?? "";
        if (lookup) {
          try {
            const params = new URLSearchParams(lookup);
            const response = await fetch(`/api/applications?${params.toString()}`, {
              cache: "no-store",
            });
            const payload = (await response.json().catch(() => null)) as
              | { ok: true; application: PublicApplication }
              | { ok: false }
              | null;
            if (!cancelled && payload && payload.ok) {
              setApplicationId(payload.application.id);
              const next = draftFromPublic(payload.application);
              const interest = queryPlan
                ? toPlanInterest({
                    plan: queryPlan,
                    county: queryCounty || next.county,
                    zip: queryZip || next.zip,
                  })
                : storedPlan || next.selectedPlan;
              if (interest) {
                next.selectedPlan = interest;
                if (!next.zip && interest.zip) next.zip = interest.zip;
                if (!next.county && interest.county) next.county = interest.county;
              }
              setFields(next);
              setSsnOnFile(payload.application.ssnOnFile);
              setSsnMasked(payload.application.ssnMasked);
              if (local?.step) {
                const index = wizardSteps.findIndex((item) => item.id === local.step);
                if (index >= 0) setStepIndex(index);
              }
              return;
            }
          } catch {
            /* use local */
          }
        }
        if (!cancelled) {
          const next = {
            ...emptyApplicationDraft,
            ...(local?.fields ?? {}),
            ssn: "",
            householdMembers:
              local?.fields.householdMembers && local.fields.householdMembers.length > 0
                ? local.fields.householdMembers
                : [newHouseholdMember("self")],
          };
          const interest = queryPlan
            ? toPlanInterest({
                plan: queryPlan,
                county: queryCounty || next.county,
                zip: queryZip || next.zip,
              })
            : storedPlan || next.selectedPlan;
          if (interest) {
            next.selectedPlan = interest;
            if (!next.zip) next.zip = interest.zip;
            if (!next.county) next.county = interest.county;
            if (!next.city && interest.zip) {
              /* city filled on address step */
            }
          }
          if (queryZip && !next.zip) next.zip = queryZip;
          if (queryCounty && !next.county) next.county = queryCounty;
          if (next.zip && !next.county) {
            next.county = countyForZip(next.zip) ?? next.county;
          }
          setFields(next);
          if (local?.step) {
            const index = wizardSteps.findIndex((item) => item.id === local.step);
            if (index >= 0) setStepIndex(index);
          }
          if (lookup) setApplicationId(lookup.id);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function update<K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) {
    setFields((current) => {
      const next = { ...current, [key]: value };
      if (key === "fullName" && typeof value === "string") {
        next.householdMembers = current.householdMembers.map((member) => {
          if (member.relationship !== "self") return member;
          if (!member.fullName || member.fullName === current.fullName) {
            return { ...member, fullName: value };
          }
          return member;
        });
      }
      if (key === "zip" && typeof value === "string") {
        const mapped = countyForZip(value);
        if (mapped) next.county = mapped;
      }
      persistLocal(step.id, next, applicationId && current.email ? { id: applicationId, email: current.email } : readLookup());
      return next;
    });
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateMember(id: string, patch: Partial<HouseholdMember>) {
    setFields((current) => {
      const next = {
        ...current,
        householdMembers: current.householdMembers.map((member) =>
          member.id === id ? { ...member, ...patch } : member
        ),
      };
      persistLocal(step.id, next, applicationId ? { id: applicationId, email: current.email } : null);
      return next;
    });
  }

  function addMember() {
    setFields((current) => {
      const next = {
        ...current,
        householdMembers: [...current.householdMembers, newHouseholdMember("child")],
      };
      persistLocal(step.id, next);
      return next;
    });
  }

  function removeMember(id: string) {
    setFields((current) => {
      if (current.householdMembers.length <= 1) return current;
      const next = {
        ...current,
        householdMembers: current.householdMembers.filter((member) => member.id !== id),
      };
      persistLocal(step.id, next);
      return next;
    });
  }

  const selfName = useMemo(() => {
    return (
      fields.householdMembers.find((member) => member.relationship === "self")
        ?.fullName || fields.fullName
    );
  }, [fields.fullName, fields.householdMembers]);

  async function save(submit: boolean) {
    const stepErrors = submit
      ? validateWizardStep(step.id, fields, { ssnOnFile })
      : {};
    if (!submit) {
      const current = validateWizardStep(step.id, fields, { ssnOnFile });
      if (Object.keys(current).length > 0) {
        setErrors(current);
        return false;
      }
    } else if (Object.keys(stepErrors).length > 0 && stepIndex < wizardSteps.length - 1) {
      setErrors(stepErrors);
      return false;
    }

    setSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const payload = {
        ...fields,
        id: applicationId,
        submit,
      };
      const response = await fetch("/api/applications", {
        method: applicationId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | {
            ok: true;
            application: PublicApplication;
          }
        | { ok: false; error?: string; errors?: ApplicationFieldErrors }
        | null;
      if (!response.ok || !body || !body.ok) {
        if (body && "errors" in body && body.errors) setErrors(body.errors);
        setSaveError(
          body && "error" in body && body.error
            ? body.error
            : "Acashi could not save this application."
        );
        return false;
      }
      setApplicationId(body.application.id);
      setSsnOnFile(body.application.ssnOnFile);
      setSsnMasked(body.application.ssnMasked);
      setFields((current) => ({ ...current, ssn: "" }));
      persistLocal(step.id, { ...fields, ssn: "" }, {
        id: body.application.id,
        email: body.application.email,
      });
      if (submit) {
        router.push(`/account?id=${encodeURIComponent(body.application.id)}&email=${encodeURIComponent(body.application.email)}`);
        return true;
      }
      setSaveNotice("Saved.");
      return true;
    } catch {
      setSaveError("Acashi could not be reached. Try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const last = stepIndex === wizardSteps.length - 1;
    const ok = await save(last);
    if (ok && !last) {
      setErrors({});
      setStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1));
    }
  }

  async function onSaveForLater() {
    const ok = await save(false);
    if (ok) setSaveNotice("Draft saved. You can leave and come back on this browser.");
  }

  if (!hydrated) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading application…
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void onContinue(event)} className="space-y-10" noValidate>
      <ScopeNotice />
      <StatusHint />
      {fields.selectedPlan ? (
        <div className="border border-foreground/10 px-4 py-4 text-sm leading-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Plan of interest · not enrollment
          </p>
          <p className="mt-2 font-medium">
            {fields.selectedPlan.issuer} · {fields.selectedPlan.name}
          </p>
          <p className="text-muted-foreground">
            {fields.selectedPlan.metal}
            {fields.selectedPlan.planType ? ` · ${fields.selectedPlan.planType}` : ""}
            {" · "}
            {formatUsd(fields.selectedPlan.premium)} age {fields.selectedPlan.premiumAge} list
            {" · deductible "}
            {formatUsd(fields.selectedPlan.deductible)}
          </p>
        </div>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          No plan selected yet. You can still apply, or{" "}
          <Link href="/" className="underline underline-offset-3">
            browse Marketplace plans
          </Link>{" "}
          first. Selection is interest only.
        </p>
      )}

      <ol className="grid gap-px bg-foreground/10 sm:grid-cols-6">
        {wizardSteps.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "bg-background px-3 py-3",
              index === stepIndex && "bg-foreground text-background"
            )}
          >
            <p
              className={cn(
                "text-[10px] uppercase tracking-[0.16em]",
                index === stepIndex ? "text-background/70" : "text-muted-foreground"
              )}
            >
              {index === stepIndex ? "Now" : index < stepIndex ? "Done" : "Later"}
            </p>
            <p className="mt-1 text-sm">{item.label}</p>
          </li>
        ))}
      </ol>

      {saveError ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <p
          role="status"
          className="border border-foreground/12 bg-muted/40 px-4 py-3 text-sm leading-6"
        >
          {saveNotice}
          {applicationId ? (
            <span className="mt-1 block font-mono text-xs">{applicationId}</span>
          ) : null}
        </p>
      ) : null}

      {step.id === "identity" ? (
        <IdentityStep
          fields={fields}
          errors={errors}
          update={update}
          ssnOnFile={ssnOnFile}
          ssnMasked={ssnMasked}
        />
      ) : null}
      {step.id === "address" ? (
        <AddressStep fields={fields} errors={errors} update={update} />
      ) : null}
      {step.id === "household" ? (
        <HouseholdStep
          fields={fields}
          errors={errors}
          updateMember={updateMember}
          addMember={addMember}
          removeMember={removeMember}
        />
      ) : null}
      {step.id === "income" ? (
        <IncomeStep fields={fields} errors={errors} update={update} />
      ) : null}
      {step.id === "coverage" ? (
        <CoverageStep fields={fields} errors={errors} update={update} />
      ) : null}
      {step.id === "consent" ? (
        <ConsentStep
          fields={fields}
          errors={errors}
          update={update}
          selfName={selfName}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            className="h-10 rounded-sm px-4"
            onClick={() => {
              setStepIndex((current) => Math.max(0, current - 1));
              setSaveError(null);
            }}
          >
            Back
          </Button>
        ) : null}
        <Button type="submit" disabled={saving} className="h-10 rounded-sm px-4">
          {saving
            ? "Saving…"
            : stepIndex === wizardSteps.length - 1
              ? "Submit application"
              : "Save and continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          className="h-10 rounded-sm px-4"
          onClick={() => void onSaveForLater()}
        >
          Save for later
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Stored in Firestore collection{" "}
        <span className="font-mono">acashi_applications</span> in GCP project{" "}
        <span className="font-mono">devo-holding</span>. SSN is encrypted at rest
        and is never written to this browser or to URLs.
      </p>
    </form>
  );
}

function IdentityStep({
  fields,
  errors,
  update,
  ssnOnFile,
  ssnMasked,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
  ssnOnFile: boolean;
  ssnMasked: string;
}) {
  return (
    <div className="space-y-8">
      <Field label="Full legal name" htmlFor="fullName" error={errors.fullName}>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          value={fields.fullName}
          aria-invalid={Boolean(errors.fullName)}
          className={fieldClass(Boolean(errors.fullName))}
          onChange={(event) => update("fullName", event.target.value)}
        />
      </Field>
      <Field
        label="Date of birth"
        htmlFor="dateOfBirth"
        hint="As used on Healthplanfinder. YYYY-MM-DD."
        error={errors.dateOfBirth}
      >
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          value={fields.dateOfBirth}
          aria-invalid={Boolean(errors.dateOfBirth)}
          className={fieldClass(Boolean(errors.dateOfBirth))}
          onChange={(event) => update("dateOfBirth", event.target.value)}
        />
      </Field>
      <Field
        label="Social Security number"
        htmlFor="ssn"
        hint={
          ssnOnFile
            ? `On file as ${ssnMasked || "•••-••-••••"}. Re-enter only if it needs to change. Never placed in URLs.`
            : "Required for a complete file. Encrypted at rest. Not shown on your account page. Not placed in URLs."
        }
        error={errors.ssn}
      >
        <input
          id="ssn"
          name="ssn-applicant"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={fields.ssn}
          aria-invalid={Boolean(errors.ssn)}
          className={fieldClass(Boolean(errors.ssn))}
          onChange={(event) => update("ssn", event.target.value)}
        />
      </Field>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            aria-invalid={Boolean(errors.email)}
            className={fieldClass(Boolean(errors.email))}
            onChange={(event) => update("email", event.target.value)}
          />
        </Field>
        <Field
          label="Phone"
          htmlFor="phone"
          hint="US number. Used only if you ask us to call or text."
          error={errors.phone}
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            aria-invalid={Boolean(errors.phone)}
            className={fieldClass(Boolean(errors.phone))}
            onChange={(event) => update("phone", event.target.value)}
          />
        </Field>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Preferred contact method
        </legend>
        <div className="space-y-2">
          {contactMethods.map((method) => (
            <label
              key={method}
              className="flex cursor-pointer items-start gap-3 border border-foreground/12 px-3 py-3 text-sm leading-6"
            >
              <input
                type="radio"
                name="preferredContactMethod"
                value={method}
                checked={fields.preferredContactMethod === method}
                className="mt-1"
                onChange={() => update("preferredContactMethod", method as ContactMethod)}
              />
              <span>{contactMethodLabels[method]}</span>
            </label>
          ))}
        </div>
        {errors.preferredContactMethod ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.preferredContactMethod}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}

function AddressStep({
  fields,
  errors,
  update,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <p className="text-sm leading-7 text-muted-foreground">
        Washington residential address. Enrollment is on Healthplanfinder, not
        HealthCare.gov.
      </p>
      <Field label="Street address" htmlFor="streetAddress" error={errors.streetAddress}>
        <input
          id="streetAddress"
          name="streetAddress"
          autoComplete="street-address"
          value={fields.streetAddress}
          aria-invalid={Boolean(errors.streetAddress)}
          className={fieldClass(Boolean(errors.streetAddress))}
          onChange={(event) => update("streetAddress", event.target.value)}
        />
      </Field>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="City" htmlFor="city" error={errors.city}>
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            value={fields.city}
            aria-invalid={Boolean(errors.city)}
            className={fieldClass(Boolean(errors.city))}
            onChange={(event) => update("city", event.target.value)}
          />
        </Field>
        <Field label="State" htmlFor="state" error={errors.state}>
          <input
            id="state"
            name="state"
            value={homeLicenseState}
            readOnly
            className={fieldClass(Boolean(errors.state))}
          />
        </Field>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          label="ZIP"
          htmlFor="zip"
          hint="Washington ZIPs are 98001–99403."
          error={errors.zip}
        >
          <input
            id="zip"
            name="zip"
            inputMode="numeric"
            autoComplete="postal-code"
            value={fields.zip}
            aria-invalid={Boolean(errors.zip)}
            className={fieldClass(Boolean(errors.zip))}
            onChange={(event) => update("zip", event.target.value)}
          />
        </Field>
        <Field label="County" htmlFor="county" error={errors.county}>
          <select
            id="county"
            name="county"
            value={isWashingtonCounty(fields.county) ? fields.county : ""}
            aria-invalid={Boolean(errors.county)}
            className={fieldClass(Boolean(errors.county))}
            onChange={(event) => update("county", event.target.value)}
          >
            <option value="">Select county</option>
            {washingtonCounties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function HouseholdStep({
  fields,
  errors,
  updateMember,
  addMember,
  removeMember,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  updateMember: (id: string, patch: Partial<HouseholdMember>) => void;
  addMember: () => void;
  removeMember: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-7 text-muted-foreground">
        People who would be on the same Healthplanfinder application, including
        you. Ages matter. Tobacco is asked for people 18 or older. This is not a
        medical questionnaire.
      </p>
      {errors.householdMembers ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.householdMembers}
        </p>
      ) : null}
      <div className="space-y-6">
        {fields.householdMembers.map((member, index) => {
          const adult = member.age !== null && member.age >= 18;
          return (
            <div key={member.id} className="space-y-4 border border-foreground/10 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Person {index + 1}
                </p>
                {fields.householdMembers.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                    onClick={() => removeMember(member.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor={`member-name-${member.id}`}>
                  <input
                    id={`member-name-${member.id}`}
                    value={member.fullName}
                    className={fieldClass()}
                    onChange={(event) =>
                      updateMember(member.id, { fullName: event.target.value })
                    }
                  />
                </Field>
                <Field label="Age" htmlFor={`member-age-${member.id}`}>
                  <input
                    id={`member-age-${member.id}`}
                    type="number"
                    min={0}
                    max={120}
                    value={member.age ?? ""}
                    className={fieldClass()}
                    onChange={(event) => {
                      const value = event.target.value;
                      const age = value === "" ? null : Number.parseInt(value, 10);
                      updateMember(member.id, {
                        age: Number.isInteger(age) ? age : null,
                        tobaccoUse:
                          age !== null && age >= 18
                            ? member.tobaccoUse === "not_asked"
                              ? "no"
                              : member.tobaccoUse
                            : "not_asked",
                      });
                    }}
                  />
                </Field>
                <Field label="Relationship" htmlFor={`member-rel-${member.id}`}>
                  <select
                    id={`member-rel-${member.id}`}
                    value={member.relationship}
                    className={fieldClass()}
                    onChange={(event) =>
                      updateMember(member.id, {
                        relationship: event.target.value as Relationship,
                      })
                    }
                  >
                    {relationships.map((relationship) => (
                      <option key={relationship} value={relationship}>
                        {relationshipLabels[relationship]}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="flex items-start gap-3 self-end pb-2 text-sm leading-6">
                  <input
                    type="checkbox"
                    checked={member.seekingCoverage}
                    className="mt-1"
                    onChange={(event) =>
                      updateMember(member.id, {
                        seekingCoverage: event.target.checked,
                      })
                    }
                  />
                  <span>Seeking Marketplace coverage</span>
                </label>
              </div>
              {adult ? (
                <fieldset className="space-y-2">
                  <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Used tobacco in the last 6 months?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(["no", "yes"] as TobaccoAnswer[]).map((answer) => (
                      <label
                        key={answer}
                        className="flex cursor-pointer items-center gap-2 border border-foreground/12 px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`tobacco-${member.id}`}
                          checked={member.tobaccoUse === answer}
                          onChange={() =>
                            updateMember(member.id, { tobaccoUse: answer })
                          }
                        />
                        {answer === "yes" ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-sm px-4"
        onClick={addMember}
      >
        Add a person
      </Button>
    </div>
  );
}

function IncomeStep({
  fields,
  errors,
  update,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
}) {
  const showEmployer =
    fields.employmentStatus === "employed" ||
    fields.employmentStatus === "self_employed";
  return (
    <div className="space-y-8">
      <Field
        label="Approximate annual household income"
        htmlFor="incomeBand"
        hint="A band is enough. This is not a subsidy calculation or a guarantee."
        error={errors.incomeBand}
      >
        <select
          id="incomeBand"
          name="incomeBand"
          value={fields.incomeBand}
          aria-invalid={Boolean(errors.incomeBand)}
          className={fieldClass(Boolean(errors.incomeBand))}
          onChange={(event) =>
            update("incomeBand", event.target.value as IncomeBand | "")
          }
        >
          <option value="">Select a band</option>
          {incomeBands.map((band) => (
            <option key={band} value={band}>
              {incomeBandLabels[band]}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Exact amount (optional)"
        htmlFor="annualIncome"
        hint="Leave blank if the band is enough."
        error={errors.annualIncome}
      >
        <input
          id="annualIncome"
          name="annualIncome"
          inputMode="decimal"
          value={fields.annualIncome}
          aria-invalid={Boolean(errors.annualIncome)}
          className={fieldClass(Boolean(errors.annualIncome))}
          onChange={(event) => update("annualIncome", event.target.value)}
        />
      </Field>
      <Field
        label="Employment"
        htmlFor="employmentStatus"
        error={errors.employmentStatus}
      >
        <select
          id="employmentStatus"
          name="employmentStatus"
          value={fields.employmentStatus}
          aria-invalid={Boolean(errors.employmentStatus)}
          className={fieldClass(Boolean(errors.employmentStatus))}
          onChange={(event) =>
            update("employmentStatus", event.target.value as EmploymentStatus | "")
          }
        >
          <option value="">Select status</option>
          {employmentStatuses.map((status) => (
            <option key={status} value={status}>
              {employmentStatusLabels[status]}
            </option>
          ))}
        </select>
      </Field>
      {showEmployer ? (
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Employer name (optional)" htmlFor="employerName">
            <input
              id="employerName"
              name="employerName"
              value={fields.employerName}
              className={fieldClass()}
              onChange={(event) => update("employerName", event.target.value)}
            />
          </Field>
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Employer offers health coverage?
            </legend>
            {yesNoUnsure.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 border border-foreground/12 px-3 py-3 text-sm leading-6"
              >
                <input
                  type="radio"
                  name="employerOffersCoverage"
                  checked={fields.employerOffersCoverage === value}
                  className="mt-1"
                  onChange={() => update("employerOffersCoverage", value)}
                />
                <span>{yesNoUnsureLabels[value]}</span>
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}
    </div>
  );
}

function CoverageStep({
  fields,
  errors,
  update,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Does anyone on this application have health coverage now?
        </legend>
        {yesNoUnsure.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-start gap-3 border border-foreground/12 px-3 py-3 text-sm leading-6"
          >
            <input
              type="radio"
              name="hasCurrentCoverage"
              checked={fields.hasCurrentCoverage === value}
              className="mt-1"
              onChange={() => {
                update("hasCurrentCoverage", value as YesNoUnsure);
                if (value === "no") update("currentCoverageType", "none");
              }}
            />
            <span>{yesNoUnsureLabels[value]}</span>
          </label>
        ))}
        {errors.hasCurrentCoverage ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.hasCurrentCoverage}
          </p>
        ) : null}
      </fieldset>
      {fields.hasCurrentCoverage === "yes" ? (
        <Field
          label="What kind?"
          htmlFor="currentCoverageType"
          error={errors.currentCoverageType}
        >
          <select
            id="currentCoverageType"
            value={fields.currentCoverageType}
            className={fieldClass(Boolean(errors.currentCoverageType))}
            onChange={(event) =>
              update("currentCoverageType", event.target.value as CoverageType | "")
            }
          >
            <option value="">Select type</option>
            {coverageTypes
              .filter((type) => type !== "none")
              .map((type) => (
                <option key={type} value={type}>
                  {coverageTypeLabels[type]}
                </option>
              ))}
          </select>
        </Field>
      ) : null}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Is anyone losing coverage soon?
        </legend>
        <p className="text-sm leading-6 text-muted-foreground">
          High level only. Acashi does not decide special enrollment.
        </p>
        {yesNoUnsure.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-start gap-3 border border-foreground/12 px-3 py-3 text-sm leading-6"
          >
            <input
              type="radio"
              name="losingCoverageSoon"
              checked={fields.losingCoverageSoon === value}
              className="mt-1"
              onChange={() => update("losingCoverageSoon", value)}
            />
            <span>{yesNoUnsureLabels[value]}</span>
          </label>
        ))}
        {errors.losingCoverageSoon ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.losingCoverageSoon}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}

function ConsentStep({
  fields,
  errors,
  update,
  selfName,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
  selfName?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="border border-foreground/10 px-4 py-4 text-sm leading-7 text-muted-foreground">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Review
        </p>
        <p className="mt-2 text-foreground">
          {selfName || fields.fullName || "Applicant"} · {fields.email} ·{" "}
          {fields.streetAddress} {fields.city} {fields.state || "—"} {fields.zip}{" "}
          {fields.county}
        </p>
        <p>
          Household {fields.householdMembers.length}. Income{" "}
          {fields.incomeBand ? incomeBandLabels[fields.incomeBand as IncomeBand] : "—"}.
        </p>
        {fields.selectedPlan ? (
          <p>
            Plan of interest: {fields.selectedPlan.issuer} {fields.selectedPlan.name}{" "}
            — not a binding enrollment.
          </p>
        ) : (
          <p>No plan of interest selected.</p>
        )}
      </div>
      <Field
        label="Notes (optional)"
        htmlFor="notes"
        hint="Deadlines, current coverage, or questions. Do not put a Social Security number in notes."
        error={errors.notes}
      >
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={fields.notes}
          className={areaClass(Boolean(errors.notes))}
          onChange={(event) => update("notes", event.target.value)}
        />
      </Field>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          name="acceptedDisclaimer"
          checked={fields.acceptedDisclaimer}
          className="mt-1"
          onChange={(event) => update("acceptedDisclaimer", event.target.checked)}
        />
        <span>{portalDisclaimer}</span>
      </label>
      {errors.acceptedDisclaimer ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.acceptedDisclaimer}
        </p>
      ) : null}
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          name="agentAssistanceConsent"
          checked={fields.agentAssistanceConsent}
          className="mt-1"
          onChange={(event) =>
            update("agentAssistanceConsent", event.target.checked)
          }
        />
        <span>{agentAssistanceConsentText}</span>
      </label>
      {errors.agentAssistanceConsent ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.agentAssistanceConsent}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">
        If you check the agent-assistance box, Acashi stores the consent text,
        a timestamp, and the submitting IP with this application. That is a
        retainable authorization, not enrollment.
      </p>
    </div>
  );
}
