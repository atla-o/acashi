"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";
import { washingtonCounties } from "@/lib/application";
import {
  allIssuers,
  allMetals,
  formatUsd,
  landscapeNote,
  landscapePremiumAge,
  placeForZip,
  planSource,
  planYear,
  plansForCounty,
  toPlanInterest,
  zipFive,
  zipForCounty,
  type LandscapePlan,
} from "@/lib/plans";
import { SELECTED_PLAN_STORAGE_KEY } from "@/lib/site";
import { cn } from "@/lib/utils";

const DEFAULT_ZIP = "98101";
const DEFAULT_COUNTY = "King";

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
  const [metal, setMetal] = useState("all");
  const [issuer, setIssuer] = useState("all");
  const [zipError, setZipError] = useState<string | null>(null);

  const activeCounty = county;
  const plans = useMemo(
    () => (activeCounty ? plansForCounty(activeCounty) : []),
    [activeCounty]
  );
  const filtered = useMemo(
    () =>
      plans.filter((plan) => {
        if (metal !== "all" && plan.metal !== metal) return false;
        if (issuer !== "all" && plan.issuer !== issuer) return false;
        return true;
      }),
    [plans, metal, issuer]
  );

  function applyZip(value: string) {
    setZip(value);
    const five = value.replace(/\D/g, "").slice(0, 5);
    if (five.length < 5) {
      setZipError(null);
      return;
    }
    const place = placeForZip(five);
    if (!place) {
      setZipError("That ZIP is not in the Washington landscape file.");
      return;
    }
    setZipError(null);
    setCounty(place.county);
  }

  function selectPlan(plan: LandscapePlan & { premium: number | null }) {
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
    router.push(`/apply?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="ZIP"
          htmlFor="planZip"
          hint="Washington ZIP. We map it to a county from public postal data."
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
        <Field
          label="County"
          htmlFor="planCounty"
          hint="Or pick a county if you do not want to use ZIP."
        >
          <select
            id="planCounty"
            value={activeCounty}
            className={fieldClass()}
            onChange={(event) => {
              setCounty(event.target.value);
              setZipError(null);
            }}
          >
            <option value="">Select county</option>
            {washingtonCounties.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {!activeCounty ? (
        <p className="text-sm leading-7 text-muted-foreground">
          Enter a Washington ZIP or choose {DEFAULT_COUNTY} County to scroll
          PY{planYear} medical plans. Example: {DEFAULT_ZIP}.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Metal level"
              value={metal}
              className={cn(fieldClass(), "w-auto min-w-40")}
              onChange={(event) => setMetal(event.target.value)}
            >
              <option value="all">All metals</option>
              {allMetals.map((value) => (
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
              {allIssuers.map((value) => (
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
            {landscapeNote} Source: {planSource}
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
                          Age {landscapePremiumAge} premium
                        </dt>
                        <dd>{formatUsd(plan.premium)} / mo</dd>
                      </div>
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
