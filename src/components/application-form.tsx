"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, areaClass, fieldClass } from "@/components/field";
import { ScopeNotice, StatusHint } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import {
  contactMethodLabels,
  contactMethods,
  emptyApplicationDraft,
  incomeBandLabels,
  incomeBands,
  parseApplicationDraft,
  usStates,
  type ApplicationDraft,
  type ApplicationFieldErrors,
  type ApplicationRecord,
  type ContactMethod,
  type IncomeBand,
  type UsState,
} from "@/lib/application";
import { APPLICATION_STORAGE_KEY } from "@/lib/site";

export function ApplicationForm() {
  const router = useRouter();
  const [fields, setFields] = useState<ApplicationDraft>(emptyApplicationDraft);
  const [errors, setErrors] = useState<ApplicationFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ApplicationDraft>(
    key: K,
    value: ApplicationDraft[K]
  ) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseApplicationDraft(fields);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setSubmitError("Check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.draft),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; application: ApplicationRecord }
        | { ok: false; error?: string; errors?: ApplicationFieldErrors }
        | null;

      if (!response.ok || !payload || !payload.ok) {
        if (payload && "errors" in payload && payload.errors) {
          setErrors(payload.errors);
        }
        setSubmitError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Acashi could not store this application. Try again."
        );
        return;
      }

      const lookup = {
        id: payload.application.id,
        email: payload.application.email,
      };
      window.localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(lookup));
      router.push(
        `/status?id=${encodeURIComponent(lookup.id)}&email=${encodeURIComponent(lookup.email)}`
      );
    } catch {
      setSubmitError("Acashi could not be reached. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <ScopeNotice />
      <StatusHint />

      {submitError ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <Field
        label="Full name"
        htmlFor="fullName"
        error={errors.fullName}
      >
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

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="State" htmlFor="state" error={errors.state}>
          <select
            id="state"
            name="state"
            value={fields.state}
            aria-invalid={Boolean(errors.state)}
            className={fieldClass(Boolean(errors.state))}
            onChange={(event) => update("state", event.target.value as UsState)}
          >
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
          hint="Marketplace eligibility is local. ZIP is enough for this interest form."
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
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          label="Household size"
          htmlFor="householdSize"
          hint="People who would be on the same marketplace application, including you."
          error={errors.householdSize}
        >
          <input
            id="householdSize"
            name="householdSize"
            type="number"
            min={1}
            max={15}
            value={fields.householdSize}
            aria-invalid={Boolean(errors.householdSize)}
            className={fieldClass(Boolean(errors.householdSize))}
            onChange={(event) =>
              update("householdSize", Number.parseInt(event.target.value, 10) || 0)
            }
          />
        </Field>
        <Field
          label="Approximate annual household income"
          htmlFor="incomeBand"
          hint="A band is enough. This is not a subsidy calculation."
          error={errors.incomeBand}
        >
          <select
            id="incomeBand"
            name="incomeBand"
            value={fields.incomeBand}
            aria-invalid={Boolean(errors.incomeBand)}
            className={fieldClass(Boolean(errors.incomeBand))}
            onChange={(event) =>
              update("incomeBand", event.target.value as IncomeBand)
            }
          >
            {incomeBands.map((band) => (
              <option key={band} value={band}>
                {incomeBandLabels[band]}
              </option>
            ))}
          </select>
        </Field>
      </div>

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
                onChange={() =>
                  update("preferredContactMethod", method as ContactMethod)
                }
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

      <Field
        label="Notes (optional)"
        htmlFor="notes"
        hint="Deadlines, current coverage, or questions. Do not send medical records."
        error={errors.notes}
      >
        <textarea
          id="notes"
          name="notes"
          rows={5}
          value={fields.notes}
          aria-invalid={Boolean(errors.notes)}
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
        <span>
          I understand Acashi is not a licensed broker and does not give
          insurance advice. Enrollment happens on HealthCare.gov or my state
          marketplace. Acashi only collects this interest form and tracks
          status.
        </span>
      </label>
      {errors.acceptedDisclaimer ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.acceptedDisclaimer}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-sm px-4"
        >
          {submitting ? "Saving…" : "Submit application"}
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Stored in Firestore collection{" "}
          <span className="font-mono">acashi_applications</span> in GCP project{" "}
          <span className="font-mono">devo-holding</span>.
        </p>
      </div>
    </form>
  );
}
