import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emailsMatch,
  isApplicationId,
  parseApplicationDraft,
} from "./application.ts";

const valid = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "415-555-0100",
  state: "CA",
  zip: "94107",
  householdSize: 2,
  incomeBand: "50000_74999",
  annualIncome: "62000",
  preferredContactMethod: "email",
  notes: "Open enrollment question.",
  acceptedDisclaimer: true,
};

test("accepts a complete application", () => {
  const parsed = parseApplicationDraft(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.draft.email, "ada@example.com");
  assert.equal(parsed.draft.householdSize, 2);
  assert.equal(parsed.draft.zip, "94107");
});

test("lowercases email and requires disclaimer", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    email: "Ada@Example.COM",
    acceptedDisclaimer: false,
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.match(parsed.errors.acceptedDisclaimer ?? "", /broker/);
});

test("rejects invalid ZIP, phone, and household size", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    zip: "9410",
    phone: "555",
    householdSize: 0,
  });
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.ok(parsed.errors.zip);
  assert.ok(parsed.errors.phone);
  assert.ok(parsed.errors.householdSize);
});

test("accepts ZIP+4 and +1 phone", () => {
  const parsed = parseApplicationDraft({
    ...valid,
    zip: "94107-1234",
    phone: "+1 (415) 555-0100",
  });
  assert.equal(parsed.ok, true);
});

test("application ids and emails match as expected", () => {
  assert.equal(isApplicationId("abc"), false);
  assert.equal(isApplicationId("n8K2mP0qR1sT"), true);
  assert.equal(emailsMatch("Ada@Example.com", "ada@example.com"), true);
  assert.equal(emailsMatch("ada@example.com", "other@example.com"), false);
});
