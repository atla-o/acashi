import plansData from "../data/wa-plans.json" with { type: "json" };
import zipsData from "../data/wa-zips.json" with { type: "json" };
import {
  isWashingtonCounty,
  normalizeWashingtonCounty,
} from "./washington.ts";

export const planYear = plansData.planYear;
export const planSource = plansData.source;
export const planSourceUrl = plansData.sourceUrl;
export const landscapeNote = plansData.landscapeNote;
export const landscapePremiumAge = plansData.premiumAge;

export type LandscapePlan = {
  id: string;
  name: string;
  issuerId: string;
  issuer: string;
  metal: string;
  planType: string | null;
  deductible: number | null;
  premiums: Record<string, number>;
  counties: string[];
};

export type PlanInterest = {
  id: string;
  name: string;
  issuer: string;
  metal: string;
  planType: string | null;
  deductible: number | null;
  premium: number | null;
  premiumAge: number;
  county: string;
  zip: string;
  planYear: number;
};

export type ZipPlace = {
  county: string;
  city: string;
};

const catalog = plansData.plans as LandscapePlan[];
const zipIndex = zipsData.zips as Record<string, ZipPlace>;

export function zipFive(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, 5);
}

export function placeForZip(value: string): ZipPlace | null {
  const five = zipFive(value);
  return zipIndex[five] ?? null;
}

export function countyForZip(value: string) {
  return placeForZip(value)?.county ?? null;
}

export function ratingAreaForCounty(county: string) {
  const normalized = normalizeWashingtonCounty(county);
  for (const [area, counties] of Object.entries(plansData.ratingAreas)) {
    if ((counties as string[]).includes(normalized)) return area;
  }
  return null;
}

export function premiumForCounty(plan: LandscapePlan, county: string) {
  const area = ratingAreaForCounty(county);
  if (!area) return null;
  const premium = plan.premiums[area];
  return typeof premium === "number" ? premium : null;
}

export function plansForCounty(county: string) {
  if (!isWashingtonCounty(county)) return [];
  const normalized = normalizeWashingtonCounty(county);
  return catalog
    .filter((plan) => plan.counties.includes(normalized))
    .map((plan) => ({
      ...plan,
      premium: premiumForCounty(plan, normalized),
    }))
    .sort((a, b) => {
      const metal = metalRank(a.metal) - metalRank(b.metal);
      if (metal !== 0) return metal;
      const prem = (a.premium ?? 1e9) - (b.premium ?? 1e9);
      if (prem !== 0) return prem;
      return a.name.localeCompare(b.name);
    });
}

export function planById(id: string) {
  return catalog.find((plan) => plan.id === id) ?? null;
}

export function toPlanInterest(input: {
  plan: LandscapePlan;
  county: string;
  zip: string;
}): PlanInterest {
  return {
    id: input.plan.id,
    name: input.plan.name,
    issuer: input.plan.issuer,
    metal: input.plan.metal,
    planType: input.plan.planType,
    deductible: input.plan.deductible,
    premium: premiumForCounty(input.plan, input.county),
    premiumAge: landscapePremiumAge,
    county: normalizeWashingtonCounty(input.county),
    zip: zipFive(input.zip),
    planYear,
  };
}

export function sanitizePlanInterest(input: unknown): PlanInterest | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  if (typeof body.id !== "string" || !body.id.trim()) return null;
  const known = planById(body.id.trim());
  const county =
    typeof body.county === "string" ? normalizeWashingtonCounty(body.county) : "";
  const zip = typeof body.zip === "string" ? zipFive(body.zip) : "";
  if (known) {
    return toPlanInterest({ plan: known, county: county || known.counties[0] || "", zip });
  }
  if (typeof body.name !== "string" || !body.name.trim()) return null;
  const premium =
    typeof body.premium === "number" && Number.isFinite(body.premium)
      ? body.premium
      : null;
  const deductible =
    typeof body.deductible === "number" && Number.isFinite(body.deductible)
      ? body.deductible
      : null;
  return {
    id: body.id.trim().slice(0, 32),
    name: body.name.trim().slice(0, 160),
    issuer: typeof body.issuer === "string" ? body.issuer.trim().slice(0, 80) : "",
    metal: typeof body.metal === "string" ? body.metal.trim().slice(0, 32) : "",
    planType:
      typeof body.planType === "string" ? body.planType.trim().slice(0, 16) : null,
    deductible,
    premium,
    premiumAge: landscapePremiumAge,
    county,
    zip,
    planYear,
  };
}

export function formatUsd(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function metalRank(metal: string) {
  const order: Record<string, number> = {
    Catastrophic: 0,
    Bronze: 1,
    "Expanded Bronze": 2,
    Silver: 3,
    Gold: 4,
    Platinum: 5,
  };
  return order[metal] ?? 9;
}

export const allIssuers = Array.from(
  new Set(catalog.map((plan) => plan.issuer))
).sort();

export const allMetals = Array.from(
  new Set(catalog.map((plan) => plan.metal))
).sort((a, b) => metalRank(a) - metalRank(b));
