"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Field, fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  applicationStatuses,
  contactMethodLabels,
  formatSubmittedAt,
  incomeBandLabels,
  isApplicationId,
  publicApplication,
  statusCopy,
  statusLabels,
} from "@/lib/application";
import { APPLICATION_STORAGE_KEY } from "@/lib/site";
import { cn } from "@/lib/utils";

type PublicApplication = ReturnType<typeof publicApplication>;
type Lookup = { id: string; email: string };

function readStoredLookup(): Lookup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Lookup>;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      isApplicationId(parsed.id)
    ) {
      return { id: parsed.id, email: parsed.email };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function StatusMonitor() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id")?.trim() ?? "";
  const queryEmail = searchParams.get("email")?.trim() ?? "";

  return (
    <StatusLookup
      key={`${queryId}::${queryEmail}`}
      queryId={queryId}
      queryEmail={queryEmail}
    />
  );
}

function StatusLookup({
  queryId,
  queryEmail,
}: {
  queryId: string;
  queryEmail: string;
}) {
  const [id, setId] = useState(queryId);
  const [email, setEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(Boolean(queryId && queryEmail));
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [lookedUp, setLookedUp] = useState(Boolean(queryId && queryEmail));

  useEffect(() => {
    const stored = readStoredLookup();
    const values =
      queryId && queryEmail
        ? { id: queryId, email: queryEmail }
        : stored;
    if (!values) return;
    void lookup(values);
  }, [queryId, queryEmail]);

  async function lookup(values: Lookup) {
    setLoading(true);
    setError(null);
    setLookedUp(true);
    setApplication(null);
    setId(values.id);
    setEmail(values.email);
    try {
      const params = new URLSearchParams({
        id: values.id.trim(),
        email: values.email.trim(),
      });
      const response = await fetch(`/api/applications?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
            | { ok: true; application: PublicApplication }
        | { ok: false; error?: string }
        | null;

      if (response.status === 404) {
        setError(
          "No application matched that id and email. Check both, or submit a new form."
        );
        return;
      }
      if (!response.ok || !payload || !payload.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Acashi could not look up that application."
        );
        return;
      }

      setApplication(payload.application);
      window.localStorage.setItem(
        APPLICATION_STORAGE_KEY,
        JSON.stringify({
          id: payload.application.id,
          email: payload.application.email,
        })
      );
    } catch {
      setError("Acashi could not be reached. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id.trim() || !email.trim()) {
      setError("Enter the application id and the email used on the form.");
      setLookedUp(true);
      return;
    }
    void lookup({ id, email });
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Application id"
            htmlFor="applicationId"
            hint="Shown after you submit. This browser may already have it."
          >
            <input
              id="applicationId"
              name="id"
              value={id}
              autoComplete="off"
              className={fieldClass()}
              onChange={(event) => {
                setId(event.target.value);
                setError(null);
              }}
            />
          </Field>
          <Field label="Email" htmlFor="lookupEmail">
            <input
              id="lookupEmail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              className={fieldClass()}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-sm px-4"
          >
            {loading ? "Looking up…" : "Look up status"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div role="status" aria-live="polite" className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Loading
          </p>
          <div className="h-10 max-w-xs bg-foreground/8" />
          <div className="h-4 max-w-xl bg-foreground/6" />
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {error}
        </p>
      ) : null}

      {!loading && !error && !application && lookedUp ? (
        <p className="text-sm leading-7 text-muted-foreground">
          Nothing to show yet. Submit an application, or enter an id and email.
        </p>
      ) : null}

      {!loading && !error && !application && !lookedUp && !id && !email ? (
        <p className="text-sm leading-7 text-muted-foreground">
          No application is in this browser yet. Enter an id and email, or start
          from the apply form.
        </p>
      ) : null}

      {application && !loading ? <StatusCard application={application} /> : null}
    </div>
  );
}

function StatusCard({ application }: { application: PublicApplication }) {
  return (
    <section
      role="status"
      className="space-y-8 border border-foreground/10 px-5 py-6 sm:px-6"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Current status
        </p>
        <h2 className="font-heading mt-2 text-3xl tracking-tight">
          {statusLabels[application.status]}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          {statusCopy[application.status]}
        </p>
      </div>

      <ol className="grid gap-px bg-foreground/10 sm:grid-cols-6">
        {applicationStatuses.map((status) => {
          const current = application.status === status;
          const currentIsTerminal =
            application.status === "submitted" ||
            application.status === "effectuated" ||
            application.status === "closed";
          const statusIsTerminal =
            status === "submitted" ||
            status === "effectuated" ||
            status === "closed";
          const currentIndex = applicationStatuses.indexOf(application.status);
          const statusIndex = applicationStatuses.indexOf(status);
          const reached =
            current ||
            (statusIndex < currentIndex &&
              !(statusIsTerminal && currentIsTerminal));
          return (
            <li
              key={status}
              className={cn(
                "bg-background px-3 py-4",
                current && "bg-foreground text-background"
              )}
            >
              <p
                className={cn(
                  "text-[10px] uppercase tracking-[0.16em]",
                  current ? "text-background/70" : "text-muted-foreground"
                )}
              >
                {current ? "Now" : reached ? "Passed" : "Later"}
              </p>
              <p className="mt-2 text-sm font-medium">{statusLabels[status]}</p>
            </li>
          );
        })}
      </ol>

      <dl className="grid gap-5 text-sm leading-6 sm:grid-cols-2">
        <Row label="Application id" value={application.id} mono />
        <Row
          label="Submitted"
          value={formatSubmittedAt(application.submittedAt)}
        />
        <Row label="Name" value={application.fullName} />
        <Row
          label="Date of birth"
          value={application.dateOfBirth || "—"}
        />
        <Row
          label="Social Security number"
          value={application.ssnMasked || "Masked"}
        />
        <Row label="Email" value={application.email} />
        <Row
          label="Contact"
          value={
            application.preferredContactMethod
              ? contactMethodLabels[application.preferredContactMethod]
              : "—"
          }
        />
        <Row
          label="Address"
          value={`${application.streetAddress || ""} ${application.city || ""} ${application.state} ${application.zip}${application.county ? ` · ${application.county}` : ""}`.trim()}
        />
        {application.householdMembers?.length ? (
          <Row
            label="People"
            value={application.householdMembers
              .map((member) => {
                const age = member.age === null ? "age n/a" : `${member.age}`;
                return `${member.fullName} (${member.relationship}, ${age})`;
              })
              .join("; ")}
          />
        ) : null}
        <Row
          label="Income band"
          value={
            application.incomeBand
              ? incomeBandLabels[application.incomeBand]
              : "—"
          }
        />
        {application.annualIncome ? (
          <Row label="Approximate income" value={`$${application.annualIncome}`} />
        ) : null}
        {application.selectedPlan ? (
          <Row
            label="Plan of interest"
            value={`${application.selectedPlan.issuer} · ${application.selectedPlan.name} (${application.selectedPlan.metal}) — not enrollment`}
          />
        ) : null}
        <Row
          label="Agent assistance consent"
          value={
            application.agentAssistanceConsent
              ? `Recorded ${application.agentAssistanceConsentAt ? formatSubmittedAt(application.agentAssistanceConsentAt) : ""}`.trim()
              : "Not recorded"
          }
        />
      </dl>

      <p className="text-sm leading-7 text-muted-foreground">
        Ready to submit or submitted means a licensed producer should enroll on{" "}
        <a
          href="https://www.wahealthplanfinder.org"
          className="underline underline-offset-3"
        >
          Healthplanfinder
        </a>
        . Washington is a state-based Marketplace. Acashi does not complete that
        step here. Your Social Security number is masked on this page.
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-1 break-all", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
