import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentAssistanceConsentText,
  applicationToCsv,
  applicationToExportPayload,
  emailsMatch,
  isApplicationId,
  normalizeApplicationStatus,
  parseApplicationDraft,
  reduceApplicationSave,
  reduceProducerPatch,
  validateWizardStep,
} from "./application.ts";

const member = {
  id: "n8K2mP0qR1sT",
  fullName: "Ada Lovelace",
  age: 36,
  relationship: "self",
  tobaccoUse: "no",
  seekingCoverage: true,
};

const valid = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "415-555-0100",
  preferredContactMethod: "email",
  state: "CA",
  zip: "94107",
  county: "San Francisco",
  householdMembers: [member],
  incomeBand: "50000_74999",
  annualIncome: "62000",
  employmentStatus: "employed",
  employerName: "Analytical Engines",
  employerOffersCoverage: "no",
  hasCurrentCoverage: "no",
  currentCoverageType: "none",
  losingCoverageSoon: "no",
  notes: "Open enrollment question.",
  acceptedDisclaimer: true,
  agentAssistanceConsent: true,
};

test("accepts a complete application", () => {
  const parsed = parseApplicationDraft(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.draft.email, "ada@example.com");
  assert.equal(parsed.draft.householdMembers.length, 1);
  assert.equal(parsed.draft.zip, "94107");
  assert.equal(parsed.draft.county, "San Francisco");
  assert.equal(parsed.draft.agentAssistanceConsent, true);
});

test("lowercases email and requires disclaimer plus agent consent", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    email: "Ada@Example.COM",
    acceptedDisclaimer: false,
    agentAssistanceConsent: false,
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.match(parsed.errors.acceptedDisclaimer ?? "", /HealthCare\.gov/);
  assert.match(parsed.errors.agentAssistanceConsent ?? "", /consent/);
});

test("rejects invalid ZIP, phone, and household member age", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    zip: "9410",
    phone: "555",
    householdMembers: [{ ...member, age: -1 }],
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.zip);
  assert.ok(parsed.errors.phone);
  assert.ok(parsed.errors.householdMembers);
});

test("accepts ZIP+4 and +1 phone", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    zip: "94107-1234",
    phone: "+1 (415) 555-0100",
  });
  assert.equal(parsed.ok, true);
});

test("partial save requires a valid email only", () => {
  const parsed = parseApplicationDraft(
    { email: "ada@example.com", fullName: "Ada" },
    "partial"
  );
  assert.equal(parsed.ok, true);
  const missing = parseApplicationDraft({ fullName: "Ada" }, "partial");
  assert.equal(missing.ok, false);
  if (missing.ok) return;
  assert.ok(missing.errors.email);
});

test("wizard contact step requires name, email, phone, and contact method", () => {
  const parsed = parseApplicationDraft({ email: "ada@example.com" }, "partial");
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const errors = validateWizardStep("contact", parsed.draft);
  assert.ok(errors.fullName);
  assert.ok(errors.phone);
});

test("application ids, emails, and legacy statuses match as expected", () => {
  assert.equal(isApplicationId("abc"), false);
  assert.equal(isApplicationId("n8K2mP0qR1sT"), true);
  assert.equal(emailsMatch("Ada@Example.com", "ada@example.com"), true);
  assert.equal(emailsMatch("ada@example.com", "other@example.com"), false);
  assert.equal(normalizeApplicationStatus("received"), "new");
  assert.equal(normalizeApplicationStatus("ready_for_marketplace"), "ready_to_submit");
  assert.equal(normalizeApplicationStatus("in_progress"), "in_progress");
});

test("create then submit stamps consent IP and moves in_progress to new", () => {
  const draft = parseApplicationDraft(valid);
  assert.equal(draft.ok, true);
  if (!draft.ok) return;

  const created = reduceApplicationSave({
    existing: null,
    draft: { ...draft.draft, acceptedDisclaimer: false, agentAssistanceConsent: false },
    submit: false,
    ip: "203.0.113.9",
    now: "2026-09-16T12:00:00.000Z",
    agentName: "Devo",
    agentNpn: "12345678",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.record.status, "in_progress");
  assert.equal(created.record.agentAssistanceConsentAt, null);

  const submitted = reduceApplicationSave({
    existing: created.record,
    draft: draft.draft,
    submit: true,
    ip: "203.0.113.9",
    now: "2026-09-16T12:05:00.000Z",
    agentName: "Devo",
    agentNpn: "12345678",
  });
  assert.equal(submitted.ok, true);
  if (!submitted.ok) return;
  assert.equal(submitted.record.status, "new");
  assert.equal(submitted.record.agentAssistanceConsentIp, "203.0.113.9");
  assert.equal(submitted.record.agentAssistanceConsentText, agentAssistanceConsentText);
  assert.equal(submitted.record.completedAt, "2026-09-16T12:05:00.000Z");
  assert.equal(submitted.record.statusHistory.at(-1)?.status, "new");
});

test("locked applications reject consumer updates", () => {
  const parsed = parseApplicationDraft(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const created = reduceApplicationSave({
    existing: null,
    draft: parsed.draft,
    submit: true,
    ip: "203.0.113.9",
    now: "2026-09-16T12:00:00.000Z",
    agentName: "Devo",
    agentNpn: "",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  created.record.status = "submitted";
  const updated = reduceApplicationSave({
    existing: created.record,
    draft: parsed.draft,
    submit: false,
    ip: "203.0.113.9",
    now: "2026-09-16T13:00:00.000Z",
    agentName: "Devo",
    agentNpn: "",
  });
  assert.equal(updated.ok, false);
  if (updated.ok) return;
  assert.equal(updated.status, 409);
});

test("producer status change writes history and export includes NPN", () => {
  const parsed = parseApplicationDraft(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const created = reduceApplicationSave({
    existing: null,
    draft: parsed.draft,
    submit: true,
    ip: "198.51.100.2",
    now: "2026-09-16T12:00:00.000Z",
    agentName: "Devo",
    agentNpn: "999",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const patched = reduceProducerPatch({
    existing: created.record,
    status: "ready_to_submit",
    statusNote: "Ready for HealthSherpa.",
    now: "2026-09-16T14:00:00.000Z",
  });
  assert.equal(patched.ok, true);
  if (!patched.ok) return;
  assert.equal(patched.record.status, "ready_to_submit");
  assert.match(patched.record.statusHistory.at(-1)?.note ?? "", /HealthSherpa/);

  const payload = applicationToExportPayload(patched.record);
  assert.equal(payload.producer.agentNpn, "999");
  assert.match(payload.purpose, /HealthSherpa/);
  assert.match(payload.ffmAssist, /PY2027/);

  const csv = applicationToCsv(patched.record);
  assert.match(csv, /ready_to_submit/);
  assert.match(csv, /Ada Lovelace/);
  assert.match(csv, /198\.51\.100\.2/);
});

test("adult household members need a tobacco answer", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    householdMembers: [{ ...member, tobaccoUse: "not_asked" }],
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.householdMembers);
});
