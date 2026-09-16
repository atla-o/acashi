"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  incomeBandLabels,
  incomeBands,
  newHouseholdMember,
  parseApplicationDraft,
  publicApplication,
  relationshipLabels,
  relationships,
  usStates,
  validateWizardStep,
  wizardSteps,
  yesNoUnsure,
  yesNoUnsureLabels,
  type ApplicationDraft,
  type ApplicationFieldErrors,
  type ApplicationRecord,
  type ContactMethod,
  type CoverageType,
  type EmploymentStatus,
  type HouseholdMember,
  type IncomeBand,
  type Relationship,
  type TobaccoAnswer,
  type UsState,
  type WizardStepId,
  type YesNoUnsure,
} from "@/lib/application";
import {
  agentAssistanceConsentText,
  portalDisclaimer,
} from "@/lib/legal";
import {
  APPLICATION_DRAFT_STORAGE_KEY,
  APPLICATION_STORAGE_KEY,
} from "@/lib/site";
import { cn } from "@/lib/utils";

type Lookup = { id: string; email: string };

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
        : "contact";
    return { step, fields: { ...emptyApplicationDraft, ...parsed.fields } };
  } catch {
    return null;
  }
}

function persistLocal(step: WizardStepId, fields: ApplicationDraft, lookup?: Lookup | null) {
  window.localStorage.setItem(
    APPLICATION_DRAFT_STORAGE_KEY,
    JSON.stringify({ step, fields, savedAt: new Date().toISOString() })
  );
  if (lookup) {
    window.localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(lookup));
  }
}

function draftFromPublic(application: ReturnType<typeof publicApplication>): ApplicationDraft {
  return {
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    preferredContactMethod: application.preferredContactMethod,
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
    acceptedDisclaimer: application.acceptedDisclaimer,
    agentAssistanceConsent: application.agentAssistanceConsent,
  };
}

export function ApplicationWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [fields, setFields] = useState<ApplicationDraft>(emptyApplicationDraft);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ApplicationFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(true);

  const step = wizardSteps[stepIndex] ?? wizardSteps[0];

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const lookup = readLookup();
        const local = readLocalDraft();
        if (lookup) {
          try {
            const params = new URLSearchParams(lookup);
            const response = await fetch(`/api/applications?${params.toString()}`, {
              cache: "no-store",
            });
            const payload = (await response.json().catch(() => null)) as
              | { ok: true; application: ReturnType<typeof publicApplication> }
              | { ok: false }
              | null;
            if (!cancelled && payload && payload.ok) {
              setApplicationId(payload.application.id);
              setFields(draftFromPublic(payload.application));
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
        if (!cancelled && local) {
          setFields({
            ...local.fields,
            householdMembers:
              local.fields.householdMembers.length > 0
                ? local.fields.householdMembers
                : [newHouseholdMember("self")],
          });
          const index = wizardSteps.findIndex((item) => item.id === local.step);
          if (index >= 0) setStepIndex(index);
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
  }, []);

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
      persistLocal(step.id, next, applicationId ? { id: applicationId, email: next.email } : null);
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError(null);
    setSaveNotice(null);
  }

  function updateMember(id: string, patch: Partial<HouseholdMember>) {
    setFields((current) => {
      const next = {
        ...current,
        householdMembers: current.householdMembers.map((member) =>
          member.id === id ? { ...member, ...patch } : member
        ),
      };
      persistLocal(step.id, next, applicationId ? { id: applicationId, email: next.email } : null);
      return next;
    });
    setErrors((current) => ({ ...current, householdMembers: undefined }));
    setSaveError(null);
  }

  function addMember() {
    setFields((current) => {
      if (current.householdMembers.length >= 15) return current;
      const next = {
        ...current,
        householdMembers: [...current.householdMembers, newHouseholdMember("child")],
      };
      persistLocal(step.id, next, applicationId ? { id: applicationId, email: next.email } : null);
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
      persistLocal(step.id, next, applicationId ? { id: applicationId, email: next.email } : null);
      return next;
    });
  }

  async function save(submit: boolean, nextStep?: WizardStepId) {
    const parsed = parseApplicationDraft(
      { ...fields, id: applicationId },
      submit ? "complete" : "partial"
    );
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setSaveError(
        submit
          ? "Check the highlighted fields before submitting."
          : "Check the highlighted fields."
      );
      return false;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/applications", {
        method: applicationId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.draft,
          id: applicationId,
          submit,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; application: ApplicationRecord }
        | { ok: false; error?: string; errors?: ApplicationFieldErrors }
        | null;

      if (!response.ok || !payload || !payload.ok) {
        if (payload && "errors" in payload && payload.errors) {
          setErrors(payload.errors);
        }
        setSaveError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Acashi could not store this application. Try again."
        );
        return false;
      }

      const lookup = {
        id: payload.application.id,
        email: payload.application.email,
      };
      setApplicationId(lookup.id);
      persistLocal(nextStep ?? step.id, parsed.draft, lookup);

      if (submit) {
        window.localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
        router.push(
          `/status?id=${encodeURIComponent(lookup.id)}&email=${encodeURIComponent(lookup.email)}`
        );
        return true;
      }

      setSaveNotice(
        applicationId
          ? "Progress saved."
          : `Progress saved. Application id ${lookup.id}.`
      );
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
    const stepErrors = validateWizardStep(step.id, fields);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setSaveError("Check this step before continuing.");
      return;
    }

    const last = stepIndex === wizardSteps.length - 1;
    const next = wizardSteps[stepIndex + 1];
    const ok = await save(last, last ? step.id : next?.id);
    if (ok && !last) {
      setStepIndex((current) => current + 1);
      setSaveNotice("Saved. Continue when you are ready.");
    }
  }

  async function onSaveForLater() {
    const ok = await save(false, step.id);
    if (ok) {
      setSaveNotice(
        "Saved for later. Use the same browser, or look up status with your application id and email."
      );
    }
  }

  const selfName = useMemo(
    () => fields.householdMembers.find((member) => member.relationship === "self")?.fullName,
    [fields.householdMembers]
  );

  if (!hydrated) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Loading
        </p>
        <div className="h-10 max-w-xs bg-foreground/8" />
        <div className="h-4 max-w-xl bg-foreground/6" />
        <span className="sr-only">Loading application…</span>
      </div>
    );
  }

  return (
    <form onSubmit={onContinue} className="space-y-8" noValidate>
      <ScopeNotice />
      <StatusHint />

      <ol className="grid grid-cols-3 gap-px bg-foreground/10 sm:grid-cols-6">
        {wizardSteps.map((item, index) => {
          const current = index === stepIndex;
          const reached = index < stepIndex;
          return (
            <li
              key={item.id}
              className={cn(
                "bg-background px-2 py-3 sm:px-3",
                current && "bg-foreground text-background"
              )}
            >
              <p
                className={cn(
                  "text-[10px] uppercase tracking-[0.16em]",
                  current ? "text-background/70" : "text-muted-foreground"
                )}
              >
                {current ? "Now" : reached ? "Done" : "Later"}
              </p>
              <p className="mt-1 text-xs font-medium sm:text-sm">{item.label}</p>
            </li>
          );
        })}
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

      {step.id === "contact" ? (
        <ContactStep fields={fields} errors={errors} update={update} />
      ) : null}
      {step.id === "location" ? (
        <LocationStep fields={fields} errors={errors} update={update} />
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
        <span className="font-mono">devo-holding</span>. Progress is also kept
        in this browser.
      </p>
    </form>
  );
}

function ContactStep({
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
      <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
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

function LocationStep({
  fields,
  errors,
  update,
}: {
  fields: ApplicationDraft;
  errors: ApplicationFieldErrors;
  update: <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      <Field label="State" htmlFor="state" error={errors.state}>
        <select
          id="state"
          name="state"
          value={fields.state}
          aria-invalid={Boolean(errors.state)}
          className={fieldClass(Boolean(errors.state))}
          onChange={(event) => update("state", event.target.value as UsState | "")}
        >
          <option value="">Select state</option>
          {usStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="ZIP"
        htmlFor="zip"
        hint="Marketplace eligibility is local."
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
      <Field
        label="County"
        htmlFor="county"
        hint="As listed for your ZIP. This is not a plan quote."
        error={errors.county}
      >
        <input
          id="county"
          name="county"
          autoComplete="address-level2"
          value={fields.county}
          aria-invalid={Boolean(errors.county)}
          className={fieldClass(Boolean(errors.county))}
          onChange={(event) => update("county", event.target.value)}
        />
      </Field>
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
        People who would be on the same Marketplace application, including you.
        Ages matter. Tobacco is asked for people 18 or older. This is not a
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
          {fields.state || "—"} {fields.zip} {fields.county}
        </p>
        <p>
          Household {fields.householdMembers.length}. Income{" "}
          {fields.incomeBand ? incomeBandLabels[fields.incomeBand as IncomeBand] : "—"}.
        </p>
      </div>
      <Field
        label="Notes (optional)"
        htmlFor="notes"
        hint="Deadlines, current coverage, or questions. Do not send medical records or Social Security numbers."
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
