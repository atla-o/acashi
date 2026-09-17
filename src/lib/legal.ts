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
  "Acashi is not Washington Healthplanfinder, not the Washington Health Benefit Exchange (WAHBE), and not HealthCare.gov. Washington is a state-based Marketplace: consumers enroll on Healthplanfinder (wahealthplanfinder.org). Plan premiums shown here start from CMS public landscape / Exchange PUF data for plan year 2026. When you enter income, Acashi estimates APTC from the 2025 HHS poverty guidelines and IRS Rev. Proc. 2025-25 (including the 400% FPL cap). That estimate is not an official Exchange determination, not a binder, and not enrollment. Selecting a plan records interest only. A licensed producer (Washington OIC) assists; final enrollment happens on Healthplanfinder. This site does not scrape Healthplanfinder or act as an EDE/web-broker.";

export const shortDisclaimer = portalDisclaimer;

export {
  agentAssistanceConsentText,
  consentVersion,
  homeLicenseRegulator,
  homeLicenseState,
} from "./application.ts";

export const whatWeAre = [
  "A Devo lateral-health portal for Washington households who want ACA coverage on Washington Healthplanfinder and, when eligible, a premium tax credit.",
  "A three-step flow: browse public PY2026 medical plans by ZIP and household income, apply with name, date of birth, address, income, SSN, and household, then watch status.",
  "An account monitor for consumers and an Admin desk for a Washington OIC-licensed producer (pipeline, file, status, export).",
];

export const whatWeAreNot = [
  "Not Healthplanfinder, not WAHBE, not HealthCare.gov, and not an EDE/web-broker.",
  "Not a carrier recommendation, official Healthplanfinder APTC determination, or guarantee of eligibility.",
  "Not a determination of special enrollment, Medicaid, Apple Health, CHIP, or employer coverage.",
  "Not complete until a licensed producer helps you enroll on Healthplanfinder.",
];

export const enrollmentPath = [
  {
    title: "Browse",
    body: "Pick a Washington ZIP and household income, then scroll public plan landscape data with estimated net premiums after APTC. Selection is interest only.",
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
    body: "Enrollment means applying for an ACA health plan for a coverage year, choosing a plan on Washington Healthplanfinder, and having that plan take effect with an issuer. Acashi collects a complete interest file and consent so a licensed producer can help. This site does not enroll you, bind coverage, issue a member ID, or replace an official Healthplanfinder APTC determination.",
  },
  {
    title: "Premium tax credits (APTC)",
    body: "Many Marketplace applicants qualify for an advance premium tax credit based on expected household income and family size. For 2026 the IRA enhanced credits have expired, so the credit is again limited to household income at or below 400% of FPL. Washington Apple Health generally covers MAGI through 138% FPL, which blocks Marketplace APTC. The Marketplace finder estimates a credit from those legal limits, the IRS applicable-percentage table, and the county’s second-lowest-cost Silver landscape premium, and it can bring a listed premium to $0. That is not an official Healthplanfinder quote, does not check IRS data, and does not guarantee a subsidy.",
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
