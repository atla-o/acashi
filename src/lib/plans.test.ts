import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countyForZip,
  planById,
  plansForCounty,
  premiumForCounty,
  secondLowestSilverPremium,
  zipForCounty,
} from "./plans.ts";

test("maps a Seattle ZIP to King County", () => {
  assert.equal(countyForZip("98101"), "King");
  assert.equal(countyForZip("98101-1234"), "King");
  assert.equal(countyForZip("94107"), null);
});

test("returns real PY2026 medical plans for King County", () => {
  const plans = plansForCounty("King");
  assert.ok(plans.length > 10);
  const sample = plans[0];
  assert.ok(sample.id);
  assert.ok(sample.issuer);
  assert.ok(sample.metal);
  assert.ok(sample.name);
  assert.equal(typeof sample.premium, "number");
  assert.ok(sample.counties.includes("King"));
});

test("looks up a known plan id from the cached PUF subset", () => {
  const plans = plansForCounty("King");
  const found = planById(plans[0].id);
  assert.ok(found);
  if (!found) return;
  assert.equal(found.name, plans[0].name);
  const premium = premiumForCounty(found, "King");
  assert.equal(typeof premium, "number");
});

test("finds a Washington ZIP for a county when the consumer only picks county", () => {
  const zip = zipForCounty("King");
  assert.ok(/^\d{5}$/.test(zip));
  assert.equal(countyForZip(zip), "King");
});

test("second-lowest Silver premium is the APTC benchmark for the county", () => {
  const silvers = plansForCounty("King")
    .filter((plan) => plan.metal === "Silver" && typeof plan.premium === "number")
    .map((plan) => plan.premium as number)
    .sort((a, b) => a - b);
  assert.ok(silvers.length >= 2);
  assert.equal(secondLowestSilverPremium("King"), silvers[1]);
  assert.ok(silvers[1] > silvers[0]);
});
