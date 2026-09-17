"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  estimateSubsidy,
  netPremiumAfterAptc,
  parseAnnualIncome,
  type SubsidyEstimate,
} from "@/lib/aptc";
import {
  formatUsd,
  landscapeNote,
  landscapePremiumAge,
  metalRank,
  placeForZip,
  planSource,
  planYear,
  plansForCounty,
  secondLowestSilverPremium,
  toPlanInterest,
  zipFive,
  zipForCounty,
  type LandscapePlan,
} from "@/lib/plans";
import { FINDER_PREFS_STORAGE_KEY, SELECTED_PLAN_STORAGE_KEY } from "@/lib/site";
import { cn } from "@/lib/utils";

const DEFAULT_ZIP = "98101";
const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type FinderPrefs = {
  zip: string;
  county: string;
  income: string;
  people: number;
};

type PricedPlan = LandscapePlan & {
  premium: number | null;
  netPremium: number | null;
};

function readFinderPrefs(): FinderPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FINDER_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FinderPrefs>;
    const people =
      typeof parsed.people === "number" && Number.isFinite(parsed.people)
        ? Math.max(1, Math.min(8, Math.floor(parsed.people)))
        : 1;
    return {
      zip: typeof parsed.zip === "string" ? parsed.zip : "",
      county: typeof parsed.county === "string" ? parsed.county : "",
      income: typeof parsed.income === "string" ? parsed.income : "",
      people,
    };
  } catch {
    return null;
  }
}

export function PlanBrowser({
  initialZip = "",
  initialCounty = "",
}: {
  initialZip?: string;
  initialCounty?: string;
}) {
  const router = useRouter();
  const [zip, setZip] = useState(initialZip);
  const [county, setCounty] = useState(initialCounty);
  const [income, setIncome] = useState("");
  const [people, setPeople] = useState(1);
  const [metal, setMetal] = useState("all");
  const [issuer, setIssuer] = useState("all");
  const [zipError, setZipError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const activeCounty = county;
  const place = placeForZip(zip);
  const annualIncome = parseAnnualIncome(income);
  const benchmark = activeCounty ? secondLowestSilverPremium(activeCounty) : null;
  const estimate = useMemo(
    () =>
      estimateSubsidy({
        annualIncome,
        householdSize: people,
        benchmarkMonthlyPerEnrollee: benchmark,
      }),
    [annualIncome, people, benchmark]
  );

  const plans = useMemo(
    () => (activeCounty ? plansForCounty(activeCounty) : []),
    [activeCounty]
  );
  const filtered = useMemo(() => {
    const rows: PricedPlan[] = plans
      .filter((plan) => {
        if (metal !== "all" && plan.metal !== metal) return false;
        if (issuer !== "all" && plan.issuer !== issuer) return false;
        return true;
      })
      .map((plan) => ({
        ...plan,
        netPremium: netPremiumAfterAptc({
          listPremium: plan.premium,
          metal: plan.metal,
          estimate,
        }),
      }));
    return rows.sort((a, b) => {
      const metalCmp = metalRank(a.metal) - metalRank(b.metal);
      if (metalCmp !== 0) return metalCmp;
      const net = (a.netPremium ?? 1e9) - (b.netPremium ?? 1e9);
      if (net !== 0) return net;
      const prem = (a.premium ?? 1e9) - (b.premium ?? 1e9);
      if (prem !== 0) return prem;
      return a.name.localeCompare(b.name);
    });
  }, [plans, metal, issuer, estimate]);

  useEffect(() => {
    const prefs = readFinderPrefs();
    if (!initialZip && prefs?.zip) applyZip(prefs.zip);
    if (!initialCounty && prefs?.county && !prefs.zip) setCounty(prefs.county);
    if (prefs?.income) setIncome(prefs.income);
    if (prefs?.people) setPeople(prefs.people);
    setHydrated(true);
    // Prefs hydrate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        FINDER_PREFS_STORAGE_KEY,
        JSON.stringify({ zip, county, income, people } satisfies FinderPrefs)
      );
    } catch {
      /* ignore quota */
    }
  }, [hydrated, zip, county, income, people]);

  function applyZip(value: string) {
    setZip(value);
    const five = value.replace(/\D/g, "").slice(0, 5);
    if (five.length < 5) {
      setZipError(null);
      return;
    }
    const nextPlace = placeForZip(five);
    if (!nextPlace) {
      setZipError("That ZIP is not in the Washington landscape file.");
      return;
    }
    setZipError(null);
    setCounty(nextPlace.county);
  }

  function selectPlan(plan: PricedPlan) {
    const interest = toPlanInterest({
      plan,
      county: activeCounty,
      zip: zipFive(zip) || zipForCounty(activeCounty),
    });
    window.localStorage.setItem(
      SELECTED_PLAN_STORAGE_KEY,
      JSON.stringify(interest)
    );
    const params = new URLSearchParams({
      plan: interest.id,
      county: interest.county,
    });
    if (interest.zip) params.set("zip", interest.zip);
    if (annualIncome !== null) params.set("income", String(annualIncome));
    params.set("people", String(people));
    router.push(`/apply?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="ZIP"
          htmlFor="planZip"
          hint={
            place
              ? `${place.city}, ${place.county} County — county is taken from this ZIP.`
              : "Washington ZIP. County is taken from public postal data."
          }
          error={zipError ?? undefined}
        >
          <input
            id="planZip"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder={DEFAULT_ZIP}
            value={zip}
            className={fieldClass(Boolean(zipError))}
            onChange={(event) => applyZip(event.target.value)}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <Field
            label="Annual household income"
            htmlFor="planIncome"
            hint="Expected 2026 MAGI. Compared to 2025 FPL and the 2026 IRS applicable-percentage table, including the 400% FPL cap."
          >
            <input
              id="planIncome"
              inputMode="decimal"
              autoComplete="off"
              placeholder="32000"
              value={income}
              className={fieldClass()}
              onChange={(event) => setIncome(event.target.value)}
            />
          </Field>
          <Field
            label="People"
            htmlFor="planPeople"
            hint="Tax household."
          >
            <select
              id="planPeople"
              value={people}
              className={fieldClass()}
              onChange={(event) => setPeople(Number.parseInt(event.target.value, 10) || 1)}
            >
              {HOUSEHOLD_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {!activeCounty ? (
        <p className="text-sm leading-7 text-muted-foreground">
          Enter a Washington ZIP to scroll PY{planYear} medical plans. Income
          shows whether a premium tax credit is legally available and what the
          listed plans would cost after that estimate. Example: {DEFAULT_ZIP}.
        </p>
      ) : (
        <>
          <SubsidyBanner
            estimate={estimate}
            benchmark={benchmark}
            county={activeCounty}
          />

          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Metal level"
              value={metal}
              className={cn(fieldClass(), "w-auto min-w-40")}
              onChange={(event) => setMetal(event.target.value)}
            >
              <option value="all">All metals</option>
              {Array.from(new Set(plans.map((plan) => plan.metal)))
                .sort((a, b) => metalRank(a) - metalRank(b))
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </select>
            <select
              aria-label="Issuer"
              value={issuer}
              className={cn(fieldClass(), "w-auto min-w-52")}
              onChange={(event) => setIssuer(event.target.value)}
            >
              <option value="all">All issuers</option>
              {Array.from(new Set(plans.map((plan) => plan.issuer)))
                .sort((a, b) => a.localeCompare(b))
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </select>
            <p className="self-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {filtered.length} plan{filtered.length === 1 ? "" : "s"} ·{" "}
              {activeCounty} County · age {landscapePremiumAge} list rate
            </p>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            {landscapeNote} Source: {planSource}. Estimated net premiums use the
            second-lowest-cost Silver in this county as the APTC benchmark. Not
            an official Healthplanfinder determination.
          </p>

          {filtered.length === 0 ? (
            <p className="text-sm leading-7 text-muted-foreground">
              No medical plans in this filter for {activeCounty} County.
            </p>
          ) : (
            <ul className="divide-y divide-foreground/10 border border-foreground/10">
              {filtered.map((plan) => (
                <li
                  key={plan.id}
                  className="grid gap-4 px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-foreground/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em]">
                        {plan.metal}
                      </span>
                      {plan.planType ? (
                        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {plan.planType}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-heading text-2xl tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{plan.issuer}</p>
                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {estimate.eligible && plan.metal !== "Catastrophic"
                            ? "Estimated after APTC"
                            : `Age ${landscapePremiumAge} premium`}
                        </dt>
                        <dd>
                          {formatUsd(
                            estimate.eligible && plan.metal !== "Catastrophic"
                              ? plan.netPremium
                              : plan.premium
                          )}{" "}
                          / mo
                        </dd>
                      </div>
                      {estimate.eligible && plan.metal !== "Catastrophic" ? (
                        <div>
                          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            Age {landscapePremiumAge} list rate
                          </dt>
                          <dd>{formatUsd(plan.premium)} / mo</dd>
                        </div>
                      ) : null}
                      {plan.metal === "Catastrophic" && estimate.eligible ? (
                        <div>
                          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            APTC
                          </dt>
                          <dd>Does not apply</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          Individual deductible
                        </dt>
                        <dd>{formatUsd(plan.deductible)}</dd>
                      </div>
                    </dl>
                  </div>
                  <Button
                    type="button"
                    className="h-10 rounded-sm px-4"
                    onClick={() => selectPlan(plan)}
                  >
                    Save interest
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function SubsidyBanner({
  estimate,
  benchmark,
  county,
}: {
  estimate: SubsidyEstimate;
  benchmark: number | null;
  county: string;
}) {
  return (
    <div className="space-y-2 border border-foreground/10 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {estimate.label}
      </p>
      {estimate.reason === "aptc" && estimate.eligible ? (
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Estimated APTC
            </dt>
            <dd>{formatUsd(estimate.aptcMonthlyHousehold)} / mo household</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Per listed enrollee
            </dt>
            <dd>{formatUsd(estimate.aptcMonthlyPerEnrollee)} / mo</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Required contribution
            </dt>
            <dd>{formatUsd(estimate.expectedMonthly)} / mo</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {county} 2nd-lowest Silver
            </dt>
            <dd>
              {formatUsd(benchmark)} / mo age {landscapePremiumAge}
            </dd>
          </div>
        </dl>
      ) : null}
      <p className="text-sm leading-7 text-muted-foreground">{estimate.detail}</p>
    </div>
  );
}
