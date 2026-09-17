/** PY2026 APTC estimate from public IRS / HHS tables. Not an official determination. */

export const coverageYear = 2026;
export const fplGuidelineYear = 2025;
export const fplSource =
  "HHS 2025 poverty guidelines (48 contiguous states), used for plan-year 2026 premium tax credit calculations.";
export const applicablePercentSource =
  "IRS Rev. Proc. 2025-25 applicable percentage table for taxable years beginning in 2026. IRA enhanced credits expired after 2025; the 400% FPL cap applies.";

/** 2025 HHS FPL, 48 states + D.C. Household sizes 1–8. */
const fpl48 = [15650, 21150, 26650, 32150, 37650, 43150, 48650, 54150];
const fplAdditional = 5500;

/** Washington Apple Health adult MAGI expansion (133% + 5% disregard). */
export const washingtonMedicaidMagiFpl = 1.38;
export const aptcFloorFpl = 1.0;
export const aptcCapFpl = 4.0;

type PercentBand = {
  min: number;
  max: number;
  start: number;
  end: number;
};

/** Inclusive min, exclusive max except the 400% end band. */
const applicableBands: PercentBand[] = [
  { min: 0, max: 1.33, start: 0.021, end: 0.021 },
  { min: 1.33, max: 1.5, start: 0.0314, end: 0.0419 },
  { min: 1.5, max: 2, start: 0.0419, end: 0.066 },
  { min: 2, max: 2.5, start: 0.066, end: 0.0844 },
  { min: 2.5, max: 3, start: 0.0844, end: 0.0996 },
  { min: 3, max: 4, start: 0.0996, end: 0.0996 },
];

export type SubsidyReason =
  | "need_income"
  | "likely_apple_health"
  | "below_poverty"
  | "over_400_fpl"
  | "aptc";

export type SubsidyEstimate = {
  reason: SubsidyReason;
  eligible: boolean;
  householdSize: number;
  annualIncome: number;
  fplGuideline: number;
  fplRatio: number;
  applicablePercent: number | null;
  expectedAnnual: number | null;
  expectedMonthly: number | null;
  benchmarkMonthly: number | null;
  aptcMonthlyHousehold: number;
  aptcMonthlyPerEnrollee: number;
  label: string;
  detail: string;
};

export function federalPovertyGuideline(householdSize: number) {
  const n = Math.max(1, Math.min(15, Math.floor(householdSize)));
  if (n <= 8) return fpl48[n - 1];
  return fpl48[7] + (n - 8) * fplAdditional;
}

export function fplRatio(annualIncome: number, householdSize: number) {
  const fpl = federalPovertyGuideline(householdSize);
  if (fpl <= 0) return 0;
  return annualIncome / fpl;
}

export function applicablePercentage(ratio: number): number | null {
  if (!Number.isFinite(ratio) || ratio < 0) return null;
  if (ratio > aptcCapFpl) return null;
  if (ratio === aptcCapFpl) return 0.0996;
  for (const band of applicableBands) {
    if (ratio >= band.max) continue;
    if (ratio < band.min) continue;
    const span = band.max - band.min;
    if (span <= 0) return band.start;
    const t = (ratio - band.min) / span;
    return band.start + t * (band.end - band.start);
  }
  return null;
}

export function parseAnnualIncome(value: string) {
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const amount = Number.parseFloat(digits);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function estimateSubsidy(input: {
  annualIncome: number | null;
  householdSize: number;
  benchmarkMonthlyPerEnrollee: number | null;
}): SubsidyEstimate {
  const householdSize = Math.max(1, Math.floor(input.householdSize || 1));
  const annualIncome = input.annualIncome;
  const fplGuideline = federalPovertyGuideline(householdSize);

  if (annualIncome === null) {
    return {
      reason: "need_income",
      eligible: false,
      householdSize,
      annualIncome: 0,
      fplGuideline,
      fplRatio: 0,
      applicablePercent: null,
      expectedAnnual: null,
      expectedMonthly: null,
      benchmarkMonthly: null,
      aptcMonthlyHousehold: 0,
      aptcMonthlyPerEnrollee: 0,
      label: "Enter annual household income",
      detail:
        "Income is compared to the 2025 HHS poverty guideline for this household size, then to the 2026 IRS applicable-percentage table. That shows whether a premium tax credit is legally available. It is not a Healthplanfinder determination.",
    };
  }

  const ratio = fplRatio(annualIncome, householdSize);
  const fplPct = Math.round(ratio * 1000) / 10;
  const base = {
    householdSize,
    annualIncome,
    fplGuideline,
    fplRatio: ratio,
    benchmarkMonthly: input.benchmarkMonthlyPerEnrollee,
  };

  if (ratio < aptcFloorFpl) {
    return {
      ...base,
      reason: "below_poverty",
      eligible: false,
      applicablePercent: null,
      expectedAnnual: null,
      expectedMonthly: null,
      aptcMonthlyHousehold: 0,
      aptcMonthlyPerEnrollee: 0,
      label: `About ${fplPct}% FPL — Marketplace APTC generally not available`,
      detail:
        "Household income is under 100% of the 2025 poverty guideline. In Washington, most people in this range use Apple Health (Medicaid), not a Marketplace premium tax credit. A narrow exception exists for some lawfully present immigrants who are Medicaid-ineligible — confirm on Healthplanfinder.",
    };
  }

  if (ratio <= washingtonMedicaidMagiFpl) {
    return {
      ...base,
      reason: "likely_apple_health",
      eligible: false,
      applicablePercent: null,
      expectedAnnual: null,
      expectedMonthly: null,
      aptcMonthlyHousehold: 0,
      aptcMonthlyPerEnrollee: 0,
      label: `About ${fplPct}% FPL — likely Apple Health, not Marketplace APTC`,
      detail:
        "Washington expanded Medicaid. Adults through 138% FPL MAGI (133% plus the 5% disregard) are generally Apple Health–eligible, which blocks Marketplace APTC. Confirm on Healthplanfinder / Washington Healthplanfinder.",
    };
  }

  if (ratio > aptcCapFpl) {
    return {
      ...base,
      reason: "over_400_fpl",
      eligible: false,
      applicablePercent: null,
      expectedAnnual: null,
      expectedMonthly: null,
      aptcMonthlyHousehold: 0,
      aptcMonthlyPerEnrollee: 0,
      label: `About ${fplPct}% FPL — over the 400% FPL cap for 2026`,
      detail:
        "Enhanced IRA premium tax credits expired after 2025. For 2026, §36B again limits the credit to household income not more than 400% of FPL. This household is over that legal cap, so estimated net premiums are the landscape list rates.",
    };
  }

  const applicablePercent = applicablePercentage(ratio);
  if (applicablePercent === null) {
    return {
      ...base,
      reason: "over_400_fpl",
      eligible: false,
      applicablePercent: null,
      expectedAnnual: null,
      expectedMonthly: null,
      aptcMonthlyHousehold: 0,
      aptcMonthlyPerEnrollee: 0,
      label: "Income is outside the 2026 APTC table",
      detail: applicablePercentSource,
    };
  }

  const expectedAnnual = roundMoney(annualIncome * applicablePercent);
  const expectedMonthly = roundMoney(expectedAnnual / 12);
  const per = input.benchmarkMonthlyPerEnrollee;
  const benchmarkMonthly =
    per === null || per === undefined ? null : roundMoney(per * householdSize);
  const aptcMonthlyHousehold =
    benchmarkMonthly === null
      ? 0
      : roundMoney(Math.max(0, benchmarkMonthly - expectedMonthly));
  const aptcMonthlyPerEnrollee = roundMoney(aptcMonthlyHousehold / householdSize);

  return {
    ...base,
    reason: "aptc",
    eligible: aptcMonthlyHousehold > 0,
    applicablePercent,
    expectedAnnual,
    expectedMonthly,
    benchmarkMonthly,
    aptcMonthlyHousehold,
    aptcMonthlyPerEnrollee,
    label: aptcMonthlyHousehold > 0
      ? `About ${fplPct}% FPL — premium tax credit is an option`
      : `About ${fplPct}% FPL — contribution meets or exceeds the benchmark`,
    detail: `Required contribution is ${(applicablePercent * 100).toFixed(2)}% of MAGI under IRS Rev. Proc. 2025-25. Benchmark is the second-lowest-cost Silver landscape premium (age-40 list rate × household size). Estimated APTC is that benchmark minus the required contribution, not below $0. Applied to each plan up to that plan’s premium. Catastrophic plans do not take APTC. Not an official Healthplanfinder quote.`,
  };
}

export function netPremiumAfterAptc(input: {
  listPremium: number | null;
  metal: string;
  estimate: SubsidyEstimate;
}): number | null {
  if (input.listPremium === null || Number.isNaN(input.listPremium)) return null;
  if (input.metal === "Catastrophic") return input.listPremium;
  if (!input.estimate.eligible || input.estimate.aptcMonthlyPerEnrollee <= 0) {
    return input.listPremium;
  }
  return roundMoney(
    Math.max(0, input.listPremium - input.estimate.aptcMonthlyPerEnrollee)
  );
}
