import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentAssistanceConsentText,
  applicationRecordFromStored,
  applicationToCsv,
  applicationToExportPayload,
  emailsMatch,
  emptyApplicationDraft,
  homeLicenseState,
  householdMembersFromStored,
  isApplicationId,
  isWashingtonZip,
  normalizeApplicationStatus,
  parseApplicationDraft,
  producerApplication,
  publicApplication,
  reduceApplicationSave,
  reduceProducerPatch,
  sanitizeHouseholdMember,
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
  dateOfBirth: "1989-12-10",
  ssn: "536-90-1111",
  email: "ada@example.com",
  phone: "206-555-0100",
  preferredContactMethod: "email",
  streetAddress: "100 Yesler Way",
  city: "Seattle",
  state: "WA",
  zip: "98101",
  county: "King",
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
  assert.equal(parsed.draft.zip, "98101");
  assert.equal(parsed.draft.county, "King");
  assert.equal(parsed.draft.state, "WA");
  assert.equal(parsed.draft.dateOfBirth, "1989-12-10");
  assert.equal(parsed.draft.ssn, "536901111");
  assert.equal(parsed.draft.streetAddress, "100 Yesler Way");
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
  assert.match(parsed.errors.acceptedDisclaimer ?? "", /Healthplanfinder/);
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
    zip: "98101-1234",
    phone: "+1 (206) 555-0100",
  });
  assert.equal(parsed.ok, true);
});

test("defaults new drafts to Washington and accepts King County wording", () => {
  assert.equal(emptyApplicationDraft.state, homeLicenseState);
  assert.equal(isWashingtonZip("98101"), true);
  assert.equal(isWashingtonZip("94107"), false);
  const parsed = parseApplicationDraft({
    ...valid,
    county: "King County",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.draft.county, "King");
});

test("rejects a California ZIP when state is Washington", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    zip: "94107",
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.match(parsed.errors.zip ?? "", /98001/);
});

test("does not accept a Covered California / out-of-state complete file", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    state: "CA",
    zip: "94107",
    county: "San Francisco",
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.match(parsed.errors.state ?? "", /Washington Healthplanfinder/);
  assert.match(agentAssistanceConsentText, /Healthplanfinder/);
  assert.match(agentAssistanceConsentText, /Covered California/);
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

test("wizard identity step requires name, date of birth, SSN, email, and phone", () => {
  const parsed = parseApplicationDraft({ email: "ada@example.com" }, "partial");
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const errors = validateWizardStep("identity", parsed.draft);
  assert.ok(errors.fullName);
  assert.ok(errors.dateOfBirth);
  assert.ok(errors.ssn);
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
  assert.match(payload.purpose, /Healthplanfinder/);
  assert.equal("ffmAssist" in payload, false);

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

test("coerces stored household members instead of type-guarding them", () => {
  const members = householdMembersFromStored(
    [
      {
        id: "child-01ab",
        fullName: "  Ada Jr  ",
        age: "7",
        relationship: "not-a-relationship",
        seekingCoverage: false,
      },
      "junk",
    ],
    "Fallback"
  );
  assert.equal(members.length, 2);
  assert.equal(members[0].fullName, "Ada Jr");
  assert.equal(members[0].age, 7);
  assert.equal(members[0].relationship, "other");
  assert.equal(members[0].tobaccoUse, "not_asked");
  assert.equal(members[0].seekingCoverage, false);
  assert.equal(members[1].fullName, "");
  assert.equal(members[1].relationship, "other");

  const legacy = householdMembersFromStored(undefined, "Ada Lovelace");
  assert.equal(legacy[0].id, "legacy-self");
  assert.equal(legacy[0].fullName, "Ada Lovelace");

  const sanitized = sanitizeHouseholdMember({
    id: "n8K2mP0qR1sT",
    fullName: "Ada Lovelace",
    age: 36,
    relationship: "self",
    tobaccoUse: "no",
  });
  assert.equal(sanitized.seekingCoverage, true);
});

test("full wizard record round-trips through stored shape with writing NPN", () => {
  const spouse = {
    id: "spouse-9k2m",
    fullName: "William King",
    age: 38,
    relationship: "spouse",
    tobaccoUse: "no",
    seekingCoverage: true,
  };
  const parsed = parseApplicationDraft({
    ...valid,
    householdMembers: [member, spouse],
    notes: "WA Healthplanfinder file for producer handoff.",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const created = reduceApplicationSave({
    existing: null,
    draft: parsed.draft,
    submit: true,
    ip: "203.0.113.40",
    now: "2026-09-16T18:00:00.000Z",
    agentName: "Devo",
    agentNpn: "",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.record.householdMembers.length, 2);
  assert.equal(created.record.householdSize, 2);
  assert.equal(created.record.county, "King");
  assert.equal(created.record.state, "WA");
  assert.equal(created.record.incomeBand, "50000_74999");
  assert.equal(created.record.annualIncome, "62000");
  assert.equal(created.record.employmentStatus, "employed");
  assert.equal(created.record.employerName, "Analytical Engines");
  assert.equal(created.record.dateOfBirth, "1989-12-10");
  assert.equal(created.record.streetAddress, "100 Yesler Way");
  assert.equal(created.record.ssnLast4, "1111");
  assert.ok(created.record.ssnCiphertext.startsWith("v1."));
  assert.equal("ssn" in created.record, false);
  assert.equal(created.record.consentVersion, "2026-09-acashi-wa-hpf");
  assert.equal(created.record.agentAssistanceConsentIp, "203.0.113.40");

  const assigned = reduceProducerPatch({
    existing: created.record,
    agentName: "Licensed Writer",
    agentNpn: "12345678",
    status: "ready_to_submit",
    statusNote: "Writing producer NPN on file. Existing entity — no setup UI.",
    now: "2026-09-16T18:10:00.000Z",
  });
  assert.equal(assigned.ok, true);
  if (!assigned.ok) return;
  assert.equal(assigned.record.agentName, "Licensed Writer");
  assert.equal(assigned.record.agentNpn, "12345678");

  const { id, ...stored } = assigned.record;
  const firestoreLike = {
    ...stored,
    submittedAt: { seconds: Date.parse(stored.submittedAt) / 1000 },
    updatedAt: new Date(stored.updatedAt),
    householdMembers: stored.householdMembers.map((row) => ({
      ...row,
      age: String(row.age),
    })),
  };
  const revived = applicationRecordFromStored(id, firestoreLike);
  assert.ok(revived);
  if (!revived) return;
  assert.equal(revived.fullName, "Ada Lovelace");
  assert.equal(revived.email, "ada@example.com");
  assert.equal(revived.phone, "206-555-0100");
  assert.equal(revived.zip, "98101");
  assert.equal(revived.county, "King");
  assert.equal(revived.householdMembers[1].fullName, "William King");
  assert.equal(revived.householdMembers[1].age, 38);
  assert.equal(revived.householdMembers[1].relationship, "spouse");
  assert.equal(revived.annualIncome, "62000");
  assert.equal(revived.employerOffersCoverage, "no");
  assert.equal(revived.hasCurrentCoverage, "no");
  assert.equal(revived.losingCoverageSoon, "no");
  assert.equal(revived.agentName, "Licensed Writer");
  assert.equal(revived.agentNpn, "12345678");
  assert.equal(revived.status, "ready_to_submit");
  assert.equal(revived.agentAssistanceConsent, true);
  assert.equal(revived.agentAssistanceConsentText, agentAssistanceConsentText);
  assert.equal(revived.statusHistory.length >= 2, true);

  const publicView = publicApplication(revived);
  assert.equal("agentNpn" in publicView, false);
  assert.equal("ssn" in publicView, false);
  assert.equal("ssnCiphertext" in publicView, false);
  assert.equal(publicView.ssnMasked, "•••-••-1111");
  const producerView = producerApplication(revived);
  assert.equal(producerView.agentNpn, "12345678");
  assert.equal(producerView.agentName, "Licensed Writer");
  assert.equal(producerView.ssn, "536-90-1111");

  const payload = applicationToExportPayload(revived);
  assert.equal(payload.producer.agentNpn, "12345678");
  assert.match(payload.purpose, /Healthplanfinder/);
});

