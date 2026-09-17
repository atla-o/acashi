import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applicablePercentage,
  aptcCapFpl,
  estimateSubsidy,
  federalPovertyGuideline,
  fplRatio,
  netPremiumAfterAptc,
  parseAnnualIncome,
  washingtonMedicaidMagiFpl,
} from "./aptc.ts";

test("uses 2025 HHS 48-state FPL figures for PY2026", () => {
  assert.equal(federalPovertyGuideline(1), 15650);
  assert.equal(federalPovertyGuideline(2), 21150);
  assert.equal(federalPovertyGuideline(4), 32150);
  assert.equal(federalPovertyGuideline(8), 54150);
  assert.equal(federalPovertyGuideline(9), 59650);
});

test("parses typed income and ignores currency junk", () => {
  assert.equal(parseAnnualIncome(""), null);
  assert.equal(parseAnnualIncome("  "), null);
  assert.equal(parseAnnualIncome("$32,000"), 32000);
  assert.equal(parseAnnualIncome("32000.40"), 32000);
});

test("Rev. Proc. 2025-25 applicable percentages interpolate inside bands and cap at 400% FPL", () => {
  assert.equal(applicablePercentage(1.0), 0.021);
  assert.equal(applicablePercentage(1.329), 0.021);
  assert.equal(applicablePercentage(1.33), 0.0314);
  assert.equal(applicablePercentage(1.5), 0.0419);
  assert.equal(applicablePercentage(2), 0.066);
  assert.equal(applicablePercentage(3), 0.0996);
  assert.equal(applicablePercentage(4), 0.0996);
  assert.equal(applicablePercentage(4.0001), null);
  const mid = applicablePercentage(1.75);
  assert.ok(mid !== null && mid > 0.0419 && mid < 0.066);
});

test("income under 100% FPL is not Marketplace APTC", () => {
  const estimate = estimateSubsidy({
    annualIncome: 8000,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.equal(estimate.reason, "below_poverty");
  assert.equal(estimate.eligible, false);
  assert.equal(estimate.aptcMonthlyPerEnrollee, 0);
});

test("Washington MAGI expansion blocks APTC through 138% FPL", () => {
  const fpl = federalPovertyGuideline(1);
  const atCap = Math.round(fpl * washingtonMedicaidMagiFpl);
  const blocked = estimateSubsidy({
    annualIncome: atCap,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.ok(blocked.fplRatio <= washingtonMedicaidMagiFpl);
  assert.equal(blocked.reason, "likely_apple_health");
  assert.equal(blocked.eligible, false);

  const open = estimateSubsidy({
    annualIncome: atCap + 1,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.ok(open.fplRatio > washingtonMedicaidMagiFpl);
  assert.equal(open.reason, "aptc");
  assert.equal(open.eligible, true);
  assert.ok(open.aptcMonthlyPerEnrollee > 0);
});

test("income over 400% FPL has no 2026 premium tax credit", () => {
  const over = Math.floor(federalPovertyGuideline(1) * aptcCapFpl) + 1;
  assert.ok(fplRatio(over, 1) > 4);
  const estimate = estimateSubsidy({
    annualIncome: over,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.equal(estimate.reason, "over_400_fpl");
  assert.equal(estimate.eligible, false);
  assert.equal(
    netPremiumAfterAptc({
      listPremium: 412,
      metal: "Silver",
      estimate,
    }),
    412
  );
});

test("APTC equals benchmark minus required contribution and can zero a cheaper plan", () => {
  const estimate = estimateSubsidy({
    annualIncome: 32000,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.equal(estimate.reason, "aptc");
  assert.equal(estimate.eligible, true);
  assert.ok(estimate.expectedMonthly !== null);
  assert.equal(
    estimate.aptcMonthlyHousehold,
    Math.round((400 - estimate.expectedMonthly!) * 100) / 100
  );

  const silverNet = netPremiumAfterAptc({
    listPremium: 400,
    metal: "Silver",
    estimate,
  });
  assert.equal(silverNet, estimate.expectedMonthly);

  const cheapBronze = netPremiumAfterAptc({
    listPremium: 50,
    metal: "Bronze",
    estimate,
  });
  assert.equal(cheapBronze, 0);

  const catastrophic = netPremiumAfterAptc({
    listPremium: 180,
    metal: "Catastrophic",
    estimate,
  });
  assert.equal(catastrophic, 180);
});

test("household size scales the Silver benchmark and the FPL denominator", () => {
  const one = estimateSubsidy({
    annualIncome: 70000,
    householdSize: 1,
    benchmarkMonthlyPerEnrollee: 400,
  });
  const four = estimateSubsidy({
    annualIncome: 70000,
    householdSize: 4,
    benchmarkMonthlyPerEnrollee: 400,
  });
  assert.equal(one.reason, "over_400_fpl");
  assert.equal(four.reason, "aptc");
  assert.equal(four.benchmarkMonthly, 1600);
  assert.ok(four.aptcMonthlyHousehold > four.aptcMonthlyPerEnrollee);
});
