"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Field, areaClass, fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  applicationStatuses,
  coverageTypeLabels,
  employmentStatusLabels,
  formatSubmittedAt,
  incomeBandLabels,
  producerApplication,
  relationshipLabels,
  statusLabels,
  type ApplicationStatus,
} from "@/lib/application";

type ProducerView = ReturnType<typeof producerApplication>;

export function ProducerDetail({
  application: initial,
  agentDefaults,
}: {
  application: ProducerView;
  agentDefaults: { agentName: string; agentNpn: string };
}) {
  const [application, setApplication] = useState(initial);
  const [status, setStatus] = useState<ApplicationStatus>(initial.status);
  const [statusNote, setStatusNote] = useState("");
  const [producerNotes, setProducerNotes] = useState(initial.producerNotes);
  const [agentName, setAgentName] = useState(
    initial.agentName || agentDefaults.agentName
  );
  const [agentNpn, setAgentNpn] = useState(initial.agentNpn || agentDefaults.agentNpn);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/producer/applications/${application.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          statusNote,
          producerNotes,
          agentName,
          agentNpn,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; application: ProducerView }
        | { ok: false; error?: string }
        | null;
      if (!response.ok || !payload || !payload.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Could not update this application."
        );
        return;
      }
      setApplication(payload.application);
      setStatus(payload.application.status);
      setStatusNote("");
      setProducerNotes(payload.application.producerNotes);
      setAgentName(payload.application.agentName);
      setAgentNpn(payload.application.agentNpn);
      setNotice("Saved.");
    } catch {
      setError("Acashi could not be reached. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground">
            Admin pipeline
          </Link>
          <span> / file</span>
        </p>
        <h1 className="font-heading mt-3 text-4xl tracking-tight">
          {application.fullName || "Unnamed applicant"}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{application.id}</p>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="border border-foreground/12 px-4 py-3 text-sm">
          {notice}
        </p>
      ) : null}

      <form onSubmit={onSave} className="space-y-6 border border-foreground/10 px-4 py-5">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              value={status}
              className={fieldClass()}
              onChange={(event) =>
                setStatus(event.target.value as ApplicationStatus)
              }
            >
              {applicationStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Status note"
            htmlFor="statusNote"
            hint="Stored on the status history when you save."
          >
            <input
              id="statusNote"
              value={statusNote}
              className={fieldClass()}
              onChange={(event) => setStatusNote(event.target.value)}
            />
          </Field>
          <Field
            label="Writing producer"
            htmlFor="agentName"
            hint="Licensed producer who writes this file. Existing legal entity — no company setup on this site."
          >
            <input
              id="agentName"
              value={agentName}
              className={fieldClass()}
              onChange={(event) => setAgentName(event.target.value)}
            />
          </Field>
          <Field
            label="NPN"
            htmlFor="agentNpn"
            hint="National Producer Number of the writing producer. Defaults from ACASHI_AGENT_NPN."
          >
            <input
              id="agentNpn"
              value={agentNpn}
              className={fieldClass()}
              onChange={(event) => setAgentNpn(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Producer notes" htmlFor="producerNotes">
          <textarea
            id="producerNotes"
            rows={4}
            value={producerNotes}
            className={areaClass()}
            onChange={(event) => setProducerNotes(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving} className="h-10 rounded-sm px-4">
            {saving ? "Saving…" : "Save status"}
          </Button>
          <a
            href={`/api/producer/applications/${application.id}/export?format=json`}
            className="inline-flex h-10 items-center rounded-sm border border-foreground/15 px-4 text-sm"
          >
            Export JSON
          </a>
          <a
            href={`/api/producer/applications/${application.id}/export?format=csv`}
            className="inline-flex h-10 items-center rounded-sm border border-foreground/15 px-4 text-sm"
          >
            Export CSV
          </a>
        </div>
      </form>

      <section className="grid gap-8 lg:grid-cols-2">
        <dl className="space-y-4 text-sm leading-6">
          <Row label="Email" value={application.email} />
          <Row label="Phone" value={application.phone} />
          <Row label="Date of birth" value={application.dateOfBirth || "—"} />
          <Row
            label="Social Security number"
            value={application.ssn || application.ssnMasked || "—"}
          />
          <Row
            label="Address"
            value={`${application.streetAddress || ""} ${application.city || ""} ${application.state} ${application.zip} ${application.county}`.trim()}
          />
          <Row
            label="Income"
            value={`${application.incomeBand ? incomeBandLabels[application.incomeBand] : "—"} ${application.annualIncome ? `· $${application.annualIncome}` : ""}`.trim()}
          />
          <Row
            label="Employment"
            value={`${application.employmentStatus ? employmentStatusLabels[application.employmentStatus] : "—"} ${application.employerName}`.trim()}
          />
          <Row
            label="Coverage now"
            value={`${application.hasCurrentCoverage || "—"} ${application.currentCoverageType ? coverageTypeLabels[application.currentCoverageType] : ""} ${application.losingCoverageSoon ? `· losing soon: ${application.losingCoverageSoon}` : ""}`.trim()}
          />
          <Row
            label="Plan of interest"
            value={
              application.selectedPlan
                ? `${application.selectedPlan.issuer} · ${application.selectedPlan.name} (${application.selectedPlan.metal}) — interest only`
                : "None"
            }
          />
          <Row label="Applicant notes" value={application.notes || "—"} />
        </dl>
        <div className="space-y-4 text-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Household
          </p>
          <ul className="space-y-2">
            {application.householdMembers.map((member) => (
              <li key={member.id} className="border border-foreground/10 px-3 py-3">
                {member.fullName || "Unnamed"} ·{" "}
                {relationshipLabels[member.relationship]} · age{" "}
                {member.age ?? "n/a"}
                {member.age !== null && member.age >= 18
                  ? ` · tobacco ${member.tobaccoUse}`
                  : ""}
                {member.seekingCoverage ? " · seeking coverage" : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Consent audit
        </p>
        <p>
          Disclaimer: {application.acceptedDisclaimer ? "yes" : "no"}
          {application.disclaimerAcceptedAt
            ? ` · ${formatSubmittedAt(application.disclaimerAcceptedAt)}`
            : ""}
        </p>
        <p>
          Agent assistance: {application.agentAssistanceConsent ? "yes" : "no"}
          {application.agentAssistanceConsentAt
            ? ` · ${formatSubmittedAt(application.agentAssistanceConsentAt)}`
            : ""}
        </p>
        <p>IP: {application.agentAssistanceConsentIp || "—"}</p>
        <p>Version: {application.consentVersion || "—"}</p>
        {application.agentAssistanceConsentText ? (
          <p className="text-muted-foreground">{application.agentAssistanceConsentText}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Status history
        </p>
        {application.statusHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <ol className="space-y-2 text-sm">
            {application.statusHistory
              .slice()
              .reverse()
              .map((entry, index) => (
                <li key={`${entry.at}-${entry.status}-${index}`} className="border-b border-foreground/8 pb-2">
                  <span className="font-medium">{statusLabels[entry.status]}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {entry.by} · {formatSubmittedAt(entry.at)}
                  </span>
                  {entry.note ? (
                    <p className="text-muted-foreground">{entry.note}</p>
                  ) : null}
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">{value || "—"}</dd>
    </div>
  );
}
