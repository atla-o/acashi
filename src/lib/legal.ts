export const productName = "Acashi";
export const parentBrand = "Devo";
export const publisher = "Devo / atla-o";
export const familyUrl = "https://devoutshaman.com";
export const publicHost = "https://acashi.devoutshaman.com";
export const healthplanfinder = "https://www.wahealthplanfinder.org";
export const wahbe = "https://www.wahbexchange.org";

export const tagline =
  "Washington Healthplanfinder interest portal. Browse public plan landscape data, save a file, and finish enrollment on the state Marketplace.";

export const portalDisclaimer =
  "Acashi is not Washington Healthplanfinder, not the Washington Health Benefit Exchange (WAHBE), and not HealthCare.gov. Washington is a state-based Marketplace: consumers enroll on Healthplanfinder (wahealthplanfinder.org). Plan premiums shown here are CMS public landscape / Exchange PUF data for plan year 2026 — not a personalized APTC quote, not a binder, and not an official Exchange determination. Selecting a plan records interest only. A licensed producer (Washington OIC) assists; final enrollment happens on Healthplanfinder. This site does not scrape Healthplanfinder, calculate official APTC, or act as an EDE/web-broker.";

export const shortDisclaimer = portalDisclaimer;

export {
  agentAssistanceConsentText,
  consentVersion,
  homeLicenseRegulator,
  homeLicenseState,
} from "./application.ts";

export const whatWeAre = [
  "A Devo lateral-health portal for Washington households who want ACA coverage on Washington Healthplanfinder and, when eligible, a premium tax credit.",
  "A three-step flow: browse public PY2026 medical plans by ZIP or county, apply with name, date of birth, address, income, SSN, and household, then watch status.",
  "An account monitor for consumers and an Admin desk for a Washington OIC-licensed producer (pipeline, file, status, export).",
];

export const whatWeAreNot = [
  "Not Healthplanfinder, not WAHBE, not HealthCare.gov, and not an EDE/web-broker.",
  "Not a personalized quote, carrier recommendation, official APTC calculation, or guarantee of eligibility.",
  "Not a determination of special enrollment, Medicaid, Apple Health, CHIP, or employer coverage.",
  "Not complete until a licensed producer helps you enroll on Healthplanfinder.",
];

export const enrollmentPath = [
  {
    title: "Browse",
    body: "Pick a Washington ZIP or county and scroll public plan landscape data (metal, issuer, premium indicator, deductible). Selection is interest only.",
  },
  {
    title: "Apply",
    body: "Enter name, date of birth, address, income, SSN, and household. A licensed producer stores the file. This is not enrollment.",
  },
  {
    title: "Enroll on Healthplanfinder",
    body: "Finish on Washington Healthplanfinder. A licensed producer assists. Plan selection and effectuation happen on the official state Marketplace, not here.",
  },
] as const;

export const enrollmentInfo = [
  {
    title: "What enrollment is",
    body: "Enrollment means applying for an ACA health plan for a coverage year, choosing a plan on Washington Healthplanfinder, and having that plan take effect with an issuer. Acashi collects a complete interest file and consent so a licensed producer can help. This site does not enroll you, bind coverage, quote a net premium after APTC, or issue a member ID.",
  },
  {
    title: "Premium tax credits (APTC)",
    body: "Many Marketplace applicants qualify for an advance premium tax credit based on expected household income and family size. The credit can lower the monthly premium. Cost-sharing reductions may also apply on some silver plans when income is in range. Acashi asks for income so a producer has context. It does not calculate a credit, check IRS data, or guarantee a subsidy. Landscape premiums are public list rates, not your price after a credit.",
  },
  {
    title: "Washington uses Healthplanfinder",
    body: "Washington is a state-based Marketplace operated by the Washington Health Benefit Exchange (WAHBE). Consumers enroll on Healthplanfinder (wahealthplanfinder.org) — not HealthCare.gov, not the Federally-Facilitated Marketplace, and not Covered California. Open enrollment and special enrollment windows are set by WAHBE, not by Acashi.",
  },
  {
    title: "Licensed producer",
    body: "A licensed insurance producer assists with the application. This portal uses Devo’s existing legal entity — there is no company-setup step. The writing producer’s name and National Producer Number (NPN) are stored on each file. Founder licensing for the Washington market is the Office of the Insurance Commissioner (OIC). Authorizing assistance is not the same as being enrolled.",
  },
  {
    title: "How to finish",
    body: "Browse plans, complete the Acashi application (including agent-assistance consent), then go to Healthplanfinder yourself or wait for the producer. Until you submit on Healthplanfinder, you do not have Marketplace coverage from this site.",
  },
] as const;

export const siblings = [
  { name: "Phenomatch", note: "Phenotype matching" },
  { name: "Antiporn", note: "Device restriction" },
  { name: "Lessfret", note: "Coaching and care coordination" },
  { name: "Lightround", note: "Counterdecadence fund" },
] as const;
