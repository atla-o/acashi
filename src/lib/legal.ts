export const productName = "Acashi";
export const parentBrand = "Devo";
export const publisher = "Devo / atla-o";
export const familyUrl = "https://devoutshaman.com";
export const publicHost = "https://acashi.devoutshaman.com";
export const healthcareGov = "https://www.healthcare.gov";

export const tagline =
  "ACA Marketplace application portal. Capture a complete file and agent-assistance consent. Enrollment is on the official exchange.";

export const portalDisclaimer =
  "Acashi is not HealthCare.gov and is not a state-based marketplace. Eligibility, plan selection, and enrollment happen on the official exchange or with a licensed agent. This site does not quote plans, recommend carriers, or guarantee a subsidy. Until Federally-Facilitated Marketplace (FFM) enrollment assistance is available for plan year 2027 (registration/certification listing), Acashi captures application data and consent for handoff to a licensed producer (for example HealthSherpa or manual enrollment).";

export const shortDisclaimer = portalDisclaimer;

export {
  agentAssistanceConsentText,
  consentVersion,
} from "./application";

export const whatWeAre = [
  "A Devo lateral-health portal for people who want ACA Marketplace coverage and, when eligible, a premium tax credit.",
  "A multi-step application: contact, household, location, income, employment, existing coverage, and retainable agent-assistance consent.",
  "A status monitor and a producer desk so Devo can ready a file for HealthSherpa or manual enrollment until FFM assist opens for PY2027.",
];

export const whatWeAreNot = [
  "Not HealthCare.gov, a state-based marketplace, or an FFM/EDE web-broker.",
  "Not a quote, carrier recommendation, subsidy calculation, or guarantee of eligibility.",
  "Not a determination of special enrollment, Medicaid, CHIP, or employer coverage.",
  "Not complete until a licensed agent enrolls the household on the official exchange.",
];

export const siblings = [
  { name: "Phenomatch", note: "Phenotype matching" },
  { name: "Antiporn", note: "Device restriction" },
  { name: "Lessfret", note: "Coaching and care coordination" },
  { name: "Lightround", note: "Counterdecadence fund" },
] as const;
