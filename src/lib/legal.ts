export const productName = "Acashi";
export const parentBrand = "Devo";
export const publisher = "Devo / atla-o";
export const familyUrl = "https://devoutshaman.com";
export const publicHost = "https://acashi.devoutshaman.com";
export const healthcareGov = "https://www.healthcare.gov";

export const tagline =
  "Washington FFM application portal. Capture a complete HealthCare.gov file and agent-assistance consent. Not Covered California.";

export const portalDisclaimer =
  "Acashi is not HealthCare.gov and is not a state-based marketplace. Washington uses the Federally-Facilitated Marketplace (FFM) on HealthCare.gov — not Covered California. Eligibility, plan selection, and enrollment happen on HealthCare.gov or with a licensed producer. This site does not quote plans, recommend carriers, or guarantee a subsidy. Until FFM enrollment assistance is available for plan year 2027 (registration/certification listing), Acashi captures application data and consent for handoff to a licensed producer (for example HealthSherpa or manual enrollment). Producer licensing for this portal is through the Washington Office of the Insurance Commissioner (OIC).";

export const shortDisclaimer = portalDisclaimer;

export {
  agentAssistanceConsentText,
  consentVersion,
  homeLicenseRegulator,
  homeLicenseState,
} from "./application";

export const whatWeAre = [
  "A Devo lateral-health portal for Washington households who want ACA Marketplace coverage on HealthCare.gov (FFM) and, when eligible, a premium tax credit.",
  "A multi-step application: contact, household, Washington location (state, ZIP, county), income, employment, existing coverage, and retainable agent-assistance consent.",
  "A status monitor and a producer desk so a Washington OIC-licensed producer can ready a file for HealthSherpa or manual enrollment until FFM assist opens for PY2027.",
];

export const whatWeAreNot = [
  "Not HealthCare.gov, not Covered California, and not an FFM/EDE web-broker.",
  "Not a quote, carrier recommendation, subsidy calculation, or guarantee of eligibility.",
  "Not a determination of special enrollment, Medicaid, CHIP, or employer coverage.",
  "Not complete until a licensed agent enrolls the household on HealthCare.gov.",
];

export const enrollmentInfo = [
  {
    title: "What enrollment is",
    body: "Enrollment means applying for an ACA health plan for a coverage year, picking a plan, and having that plan take effect. Acashi collects a complete file and consent so a licensed producer can help. This site does not enroll you, bind coverage, or issue a member ID.",
  },
  {
    title: "Premium tax credits (APTC)",
    body: "Many Marketplace applicants qualify for an advance premium tax credit based on expected household income and family size. That credit lowers the monthly premium. Acashi asks for an income band or amount so a producer has context. It does not calculate a credit, check IRS data, or guarantee a subsidy.",
  },
  {
    title: "Washington uses HealthCare.gov",
    body: "Washington is an FFM state. Consumers enroll on HealthCare.gov. There is no Covered California flow here and no state-based marketplace application on this site. Open enrollment and special enrollment windows are set by the federal Marketplace, not by Acashi.",
  },
  {
    title: "Licensed producer",
    body: "A licensed insurance producer assists with the application. Founder licensing for this portal is Washington OIC. Agent name and NPN are stored on the file (env defaults, editable on the producer desk). Authorizing assistance is not the same as being enrolled.",
  },
  {
    title: "How to finish",
    body: "Complete the Acashi wizard, including agent-assistance consent. A producer reviews the file and hands it to HealthSherpa or completes enrollment on HealthCare.gov. Until PY2027 FFM registration/certification listing is open, this portal is capture and handoff only.",
  },
] as const;

export const siblings = [
  { name: "Phenomatch", note: "Phenotype matching" },
  { name: "Antiporn", note: "Device restriction" },
  { name: "Lessfret", note: "Coaching and care coordination" },
  { name: "Lightround", note: "Counterdecadence fund" },
] as const;
