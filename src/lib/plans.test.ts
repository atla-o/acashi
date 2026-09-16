import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countyForZip,
  planById,
  plansForCounty,
  premiumForCounty,
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
