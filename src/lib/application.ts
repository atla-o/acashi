import type { PlanInterest } from "./plans.ts";
import { sanitizePlanInterest } from "./plans.ts";
import {
  decryptSsn,
  encryptSsn,
  formatSsn,
  isValidSsn,
  normalizeSsn,
  ssnLast4,
} from "./ssn.ts";
import {
  homeLicenseRegulator,
  homeLicenseState,
  isWashingtonCounty,
  isWashingtonZip,
  normalizeWashingtonCounty,
  washingtonCounties,
} from "./washington.ts";

export const agentAssistanceConsentText =
  "I authorize a licensed insurance agent or broker to assist me with applying for and enrolling in health coverage through Washington Healthplanfinder, the state-based Marketplace operated by the Washington Health Benefit Exchange (WAHBE). I understand this agent may collect and use the information in this application — including my Social Security number — to help me complete enrollment on Healthplanfinder (wahealthplanfinder.org). This authorization is part of my application record and may be retained as required. I understand that granting this authorization does not complete enrollment, does not determine eligibility or a premium tax credit, does not bind a plan, and does not guarantee a subsidy. Washington does not use HealthCare.gov as its Marketplace and does not use Covered California.";

export const consentVersion = "2026-09-acashi-wa-hpf";

export {
  homeLicenseRegulator,
  homeLicenseState,
  isWashingtonCounty,
  isWashingtonZip,
  normalizeWashingtonCounty,
  washingtonCounties,
};
export type { WashingtonCounty } from "./washington.ts";
export type { PlanInterest } from "./plans.ts";

export const applicationStatuses = [
  "new",
  "in_progress",
  "ready_to_submit",
  "submitted",
  "effectuated",
  "closed",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

const legacyStatuses: Record<string, ApplicationStatus> = {
  received: "new",
  in_review: "in_progress",
  needs_info: "in_progress",
  ready_for_marketplace: "ready_to_submit",
};

export function normalizeApplicationStatus(value: unknown): ApplicationStatus | null {
  if (typeof value !== "string") return null;
  if (applicationStatuses.includes(value as ApplicationStatus)) {
    return value as ApplicationStatus;
  }
  return legacyStatuses[value] ?? null;
}

export const statusLabels: Record<ApplicationStatus, string> = {
  new: "New",
  in_progress: "In progress",
  ready_to_submit: "Ready to submit",
  submitted: "Submitted",
  effectuated: "Effectuated",
  closed: "Closed",
};

export const statusCopy: Record<ApplicationStatus, string> = {
  new: "Acashi has the completed application. An Admin producer has not started it yet.",
  in_progress:
    "This file is being completed by the applicant or worked by a producer. It is not enrollment.",
  ready_to_submit:
    "The file is ready for a licensed producer to help the household enroll on Washington Healthplanfinder. This site does not submit to the Exchange.",
  submitted:
    "A licensed producer has handed this file off for Healthplanfinder enrollment. Confirm on Healthplanfinder or with the producer. Acashi is not the Exchange.",
  effectuated:
    "Coverage is marked as started. Confirm official Healthplanfinder or insurer notices — Acashi is not the Exchange.",
  closed:
    "This application is closed. That is not a denial of coverage. Enrollment still happens on Washington Healthplanfinder.",
};

export const consumerEditableStatuses: ApplicationStatus[] = [
  "new",
  "in_progress",
];

export function isConsumerEditable(status: ApplicationStatus) {
  return consumerEditableStatuses.includes(status);
}

export const contactMethods = ["email", "phone", "either"] as const;
export type ContactMethod = (typeof contactMethods)[number];

export const contactMethodLabels: Record<ContactMethod, string> = {
  email: "Email",
  phone: "Phone",
  either: "Either email or phone",
};

export const incomeBands = [
  "under_25000",
  "25000_49999",
  "50000_74999",
  "75000_99999",
  "100000_149999",
  "150000_or_more",
  "prefer_not",
] as const;

export type IncomeBand = (typeof incomeBands)[number];

export const incomeBandLabels: Record<IncomeBand, string> = {
  under_25000: "Under $25,000",
  "25000_49999": "$25,000–$49,999",
  "50000_74999": "$50,000–$74,999",
  "75000_99999": "$75,000–$99,999",
  "100000_149999": "$100,000–$149,999",
  "150000_or_more": "$150,000 or more",
  prefer_not: "Prefer not to say",
};

export const relationships = [
  "self",
  "spouse",
  "domestic_partner",
  "child",
  "parent",
  "other",
] as const;

export type Relationship = (typeof relationships)[number];

export const relationshipLabels: Record<Relationship, string> = {
  self: "Self",
  spouse: "Spouse",
  domestic_partner: "Domestic partner",
  child: "Child",
  parent: "Parent",
  other: "Other",
};

export const employmentStatuses = [
  "employed",
  "self_employed",
  "unemployed",
  "retired",
  "student",
  "other",
] as const;

export type EmploymentStatus = (typeof employmentStatuses)[number];

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  employed: "Employed",
  self_employed: "Self-employed",
  unemployed: "Unemployed",
  retired: "Retired",
  student: "Student",
  other: "Other",
};

export const coverageTypes = [
  "none",
  "employer",
  "medicaid",
  "medicare",
  "marketplace",
  "other",
] as const;

export type CoverageType = (typeof coverageTypes)[number];

export const coverageTypeLabels: Record<CoverageType, string> = {
  none: "No coverage",
  employer: "Employer or job-based",
  medicaid: "Medicaid or CHIP",
  medicare: "Medicare",
  marketplace: "Marketplace / Healthplanfinder",
  other: "Other",
};

export const yesNoUnsure = ["yes", "no", "unsure"] as const;
export type YesNoUnsure = (typeof yesNoUnsure)[number];

export const yesNoUnsureLabels: Record<YesNoUnsure, string> = {
  yes: "Yes",
  no: "No",
  unsure: "Not sure",
};

export const tobaccoAnswers = ["yes", "no", "not_asked"] as const;
export type TobaccoAnswer = (typeof tobaccoAnswers)[number];

export const tobaccoAnswerLabels: Record<TobaccoAnswer, string> = {
  yes: "Yes",
  no: "No",
  not_asked: "Not asked",
};

export const wizardSteps = [
  { id: "identity", label: "You" },
  { id: "address", label: "Address" },
  { id: "household", label: "Household" },
  { id: "income", label: "Income" },
  { id: "coverage", label: "Coverage" },
  { id: "consent", label: "Consent" },
] as const;

export type WizardStepId = (typeof wizardSteps)[number]["id"];

export const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

export type UsState = (typeof usStates)[number]["code"];

export type HouseholdMember = {
  id: string;
  fullName: string;
  age: number | null;
  relationship: Relationship;
  tobaccoUse: TobaccoAnswer;
  seekingCoverage: boolean;
};

export type StatusActor = "applicant" | "producer" | "system";

export type StatusHistoryEntry = {
  status: ApplicationStatus;
  at: string;
  by: StatusActor;
  note: string;
};

export type ApplicationDraft = {
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  preferredContactMethod: ContactMethod | "";
  streetAddress: string;
  city: string;
  state: UsState | "";
  zip: string;
  county: string;
  householdMembers: HouseholdMember[];
  incomeBand: IncomeBand | "";
  annualIncome: string;
  employmentStatus: EmploymentStatus | "";
  employerName: string;
  employerOffersCoverage: YesNoUnsure | "";
  hasCurrentCoverage: YesNoUnsure | "";
  currentCoverageType: CoverageType | "";
  losingCoverageSoon: YesNoUnsure | "";
  notes: string;
  selectedPlan: PlanInterest | null;
  acceptedDisclaimer: boolean;
  agentAssistanceConsent: boolean;
};

export type ApplicationRecord = Omit<ApplicationDraft, "ssn"> & {
  id: string;
  status: ApplicationStatus;
  householdSize: number;
  submittedAt: string;
  updatedAt: string;
  completedAt: string | null;
  statusHistory: StatusHistoryEntry[];
  disclaimerAcceptedAt: string | null;
  agentAssistanceConsentAt: string | null;
  agentAssistanceConsentIp: string | null;
  agentAssistanceConsentText: string | null;
  consentVersion: string | null;
  producerNotes: string;
  agentName: string;
  agentNpn: string;
  ssnCiphertext: string;
  ssnLast4: string;
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationDraft | "householdMembers" | "submit" | "ssn", string>
>;

export const emptyApplicationDraft: ApplicationDraft = {
  fullName: "",
  dateOfBirth: "",
  ssn: "",
  email: "",
  phone: "",
  preferredContactMethod: "email",
  streetAddress: "",
  city: "",
  state: homeLicenseState,
  zip: "",
  county: "",
  householdMembers: [
    {
      id: "member-self",
      fullName: "",
      age: null,
      relationship: "self",
      tobaccoUse: "not_asked",
      seekingCoverage: true,
    },
  ],
  incomeBand: "",
  annualIncome: "",
  employmentStatus: "",
  employerName: "",
  employerOffersCoverage: "",
  hasCurrentCoverage: "",
  currentCoverageType: "",
  losingCoverageSoon: "",
  notes: "",
  selectedPlan: null,
  acceptedDisclaimer: false,
  agentAssistanceConsent: false,
};

export function newHouseholdMember(
  relationship: Relationship = "self",
  id = crypto.randomUUID()
): HouseholdMember {
  return {
    id,
    fullName: "",
    age: null,
    relationship,
    tobaccoUse: "not_asked",
    seekingCoverage: true,
  };
}

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 32;
const MAX_NOTES = 2000;
const MAX_INCOME = 20;
const MAX_COUNTY = 80;
const MAX_EMPLOYER = 120;
const MAX_MEMBERS = 15;
const MAX_STREET = 120;
const MAX_CITY = 80;

export function trim(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDob(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) return false;
  const age = Math.floor((todayUtc - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age >= 0 && age <= 120;
}

export function ageFromDob(value: string) {
  if (!isDob(value)) return null;
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age -= 1;
  return age;
}

function isZip(value: string) {
  return /^\d{5}(-\d{4})?$/.test(value);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function isPhone(value: string) {
  const n = digits(value);
  if (n.length === 10) return true;
  if (n.length === 11 && n.startsWith("1")) return true;
  return false;
}

function isState(value: unknown): value is UsState {
  return usStates.some((state) => state.code === value);
}

function isIncomeBand(value: unknown): value is IncomeBand {
  return incomeBands.includes(value as IncomeBand);
}

function isContactMethod(value: unknown): value is ContactMethod {
  return contactMethods.includes(value as ContactMethod);
}

function isRelationship(value: unknown): value is Relationship {
  return relationships.includes(value as Relationship);
}

function isEmploymentStatus(value: unknown): value is EmploymentStatus {
  return employmentStatuses.includes(value as EmploymentStatus);
}

function isCoverageType(value: unknown): value is CoverageType {
  return coverageTypes.includes(value as CoverageType);
}

function isYesNoUnsure(value: unknown): value is YesNoUnsure {
  return yesNoUnsure.includes(value as YesNoUnsure);
}

function isTobaccoAnswer(value: unknown): value is TobaccoAnswer {
  return tobaccoAnswers.includes(value as TobaccoAnswer);
}

function parseInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
}

function sanitizeMemberId(value: unknown) {
  if (typeof value === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(value)) {
    return value;
  }
  return crypto.randomUUID();
}

export function sanitizeHouseholdMember(input: unknown): HouseholdMember {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const age = parseInteger(body.age);
  return {
    id: sanitizeMemberId(body.id),
    fullName: trim(body.fullName, MAX_NAME),
    age: age !== null && age >= 0 && age <= 120 ? age : null,
    relationship: isRelationship(body.relationship)
      ? body.relationship
      : "other",
    tobaccoUse: isTobaccoAnswer(body.tobaccoUse)
      ? body.tobaccoUse
      : "not_asked",
    seekingCoverage: body.seekingCoverage !== false,
  };
}

export function householdMembersFromStored(
  value: unknown,
  fallbackName: string
): HouseholdMember[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((member) => sanitizeHouseholdMember(member));
  }
  return [
    {
      id: "legacy-self",
      fullName: fallbackName,
      age: null,
      relationship: "self",
      tobaccoUse: "not_asked",
      seekingCoverage: true,
    },
  ];
}

function storedToIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    return value;
  }
  if (value && typeof value === "object") {
    const withDate = value as { toDate?: unknown; seconds?: unknown };
    if (typeof withDate.toDate === "function") {
      const date = (withDate.toDate as () => Date).call(value);
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    if (typeof withDate.seconds === "number") {
      return new Date(withDate.seconds * 1000).toISOString();
    }
  }
  return new Date().toISOString();
}

function storedToIsoOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return storedToIso(value);
}

export function statusHistoryFromStored(value: unknown): StatusHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const status = normalizeApplicationStatus(row.status);
    if (!status) return [];
    const at = storedToIsoOrNull(row.at);
    if (!at) return [];
    const by =
      row.by === "applicant" || row.by === "producer" || row.by === "system"
        ? row.by
        : "system";
    return [
      {
        status,
        at,
        by,
        note: typeof row.note === "string" ? row.note : "",
      },
    ];
  });
}

export function applicationRecordFromStored(
  id: string,
  data: Record<string, unknown>
): ApplicationRecord | null {
  if (typeof data.fullName !== "string" || typeof data.email !== "string") {
    return null;
  }

  const status = normalizeApplicationStatus(data.status);
  if (!status) return null;

  const householdMembers = householdMembersFromStored(
    data.householdMembers,
    data.fullName
  );
  const preferredContactMethod =
    data.preferredContactMethod === "phone" ||
    data.preferredContactMethod === "either" ||
    data.preferredContactMethod === "email"
      ? data.preferredContactMethod
      : "";

  return {
    id,
    fullName: data.fullName,
    email: data.email,
    phone: typeof data.phone === "string" ? data.phone : "",
    dateOfBirth: typeof data.dateOfBirth === "string" ? data.dateOfBirth : "",
    streetAddress: typeof data.streetAddress === "string" ? data.streetAddress : "",
    city: typeof data.city === "string" ? data.city : "",
    preferredContactMethod,
    state:
      typeof data.state === "string"
        ? (data.state as ApplicationRecord["state"])
        : "",
    zip: typeof data.zip === "string" ? data.zip : "",
    county: typeof data.county === "string" ? data.county : "",
    householdMembers,
    householdSize:
      typeof data.householdSize === "number"
        ? data.householdSize
        : householdSizeOf({ householdMembers }),
    incomeBand:
      typeof data.incomeBand === "string"
        ? (data.incomeBand as ApplicationRecord["incomeBand"])
        : "",
    annualIncome: typeof data.annualIncome === "string" ? data.annualIncome : "",
    employmentStatus:
      typeof data.employmentStatus === "string"
        ? (data.employmentStatus as ApplicationRecord["employmentStatus"])
        : "",
    employerName: typeof data.employerName === "string" ? data.employerName : "",
    employerOffersCoverage:
      data.employerOffersCoverage === "yes" ||
      data.employerOffersCoverage === "no" ||
      data.employerOffersCoverage === "unsure"
        ? data.employerOffersCoverage
        : "",
    hasCurrentCoverage:
      data.hasCurrentCoverage === "yes" ||
      data.hasCurrentCoverage === "no" ||
      data.hasCurrentCoverage === "unsure"
        ? data.hasCurrentCoverage
        : "",
    currentCoverageType:
      typeof data.currentCoverageType === "string"
        ? (data.currentCoverageType as ApplicationRecord["currentCoverageType"])
        : "",
    losingCoverageSoon:
      data.losingCoverageSoon === "yes" ||
      data.losingCoverageSoon === "no" ||
      data.losingCoverageSoon === "unsure"
        ? data.losingCoverageSoon
        : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    selectedPlan: sanitizePlanInterest(data.selectedPlan),
    acceptedDisclaimer: data.acceptedDisclaimer === true,
    agentAssistanceConsent: data.agentAssistanceConsent === true,
    status,
    submittedAt: storedToIso(data.submittedAt),
    updatedAt: storedToIso(data.updatedAt ?? data.submittedAt),
    completedAt: storedToIsoOrNull(data.completedAt),
    statusHistory: statusHistoryFromStored(data.statusHistory),
    disclaimerAcceptedAt: storedToIsoOrNull(data.disclaimerAcceptedAt),
    agentAssistanceConsentAt: storedToIsoOrNull(data.agentAssistanceConsentAt),
    agentAssistanceConsentIp:
      typeof data.agentAssistanceConsentIp === "string"
        ? data.agentAssistanceConsentIp
        : null,
    agentAssistanceConsentText:
      typeof data.agentAssistanceConsentText === "string"
        ? data.agentAssistanceConsentText
        : null,
    consentVersion:
      typeof data.consentVersion === "string" ? data.consentVersion : null,
    producerNotes: typeof data.producerNotes === "string" ? data.producerNotes : "",
    agentName: typeof data.agentName === "string" ? data.agentName : "",
    agentNpn: typeof data.agentNpn === "string" ? data.agentNpn : "",
    ssnCiphertext: typeof data.ssnCiphertext === "string" ? data.ssnCiphertext : "",
    ssnLast4: typeof data.ssnLast4 === "string" ? data.ssnLast4.slice(0, 4) : "",
  };
}

export function sanitizeApplicationDraft(input: unknown): ApplicationDraft {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const membersInput = Array.isArray(body.householdMembers)
    ? body.householdMembers
    : [];
  let householdMembers = membersInput
    .slice(0, MAX_MEMBERS)
    .map(sanitizeHouseholdMember);

  if (
    householdMembers.length === 0 &&
    typeof body.householdSize === "number" &&
    body.householdSize >= 1
  ) {
    householdMembers = [newHouseholdMember("self")];
    householdMembers[0].fullName = trim(body.fullName, MAX_NAME);
  }

  const stateRaw =
    typeof body.state === "string" ? body.state.trim().toUpperCase() : "";
  const state = isState(stateRaw) ? stateRaw : "";
  const countyRaw = trim(body.county, MAX_COUNTY);
  const county =
    state === homeLicenseState
      ? normalizeWashingtonCounty(countyRaw)
      : countyRaw;

  return {
    fullName: trim(body.fullName, MAX_NAME),
    dateOfBirth: trim(body.dateOfBirth, 10),
    ssn: normalizeSsn(body.ssn),
    email: trim(body.email, MAX_EMAIL).toLowerCase(),
    phone: trim(body.phone, MAX_PHONE),
    preferredContactMethod: isContactMethod(body.preferredContactMethod)
      ? body.preferredContactMethod
      : "",
    streetAddress: trim(body.streetAddress, MAX_STREET),
    city: trim(body.city, MAX_CITY),
    state,
    zip: trim(body.zip, 10),
    county,
    householdMembers,
    incomeBand: isIncomeBand(body.incomeBand) ? body.incomeBand : "",
    annualIncome: trim(body.annualIncome, MAX_INCOME).replace(/[$,\s]/g, ""),
    employmentStatus: isEmploymentStatus(body.employmentStatus)
      ? body.employmentStatus
      : "",
    employerName: trim(body.employerName, MAX_EMPLOYER),
    employerOffersCoverage: isYesNoUnsure(body.employerOffersCoverage)
      ? body.employerOffersCoverage
      : "",
    hasCurrentCoverage: isYesNoUnsure(body.hasCurrentCoverage)
      ? body.hasCurrentCoverage
      : "",
    currentCoverageType: isCoverageType(body.currentCoverageType)
      ? body.currentCoverageType
      : "",
    losingCoverageSoon: isYesNoUnsure(body.losingCoverageSoon)
      ? body.losingCoverageSoon
      : "",
    notes: trim(body.notes, MAX_NOTES),
    selectedPlan: sanitizePlanInterest(body.selectedPlan),
    acceptedDisclaimer: body.acceptedDisclaimer === true,
    agentAssistanceConsent: body.agentAssistanceConsent === true,
  };
}

function addFormatErrors(
  draft: ApplicationDraft,
  errors: ApplicationFieldErrors
) {
  if (draft.email && !isEmail(draft.email)) {
    errors.email = "Enter a valid email.";
  }
  if (draft.phone && !isPhone(draft.phone)) {
    errors.phone = "Enter a 10-digit US phone number.";
  }
  if (draft.zip && !isZip(draft.zip)) {
    errors.zip = "Use a 5-digit ZIP, or ZIP+4.";
  } else if (
    draft.zip &&
    draft.state === homeLicenseState &&
    !isWashingtonZip(draft.zip)
  ) {
    errors.zip =
      "Washington ZIPs are 98001–99403. This portal is for Healthplanfinder, not HealthCare.gov or Covered California.";
  }
  if (draft.dateOfBirth && !isDob(draft.dateOfBirth)) {
    errors.dateOfBirth = "Use a real date of birth (YYYY-MM-DD).";
  }
  if (draft.ssn && !isValidSsn(draft.ssn)) {
    errors.ssn = "Enter a 9-digit Social Security number.";
  }
  if (draft.annualIncome && !/^\d+(\.\d{1,2})?$/.test(draft.annualIncome)) {
    errors.annualIncome = "Use a number, or leave this blank and pick a band.";
  }
}

export function validateWizardStep(
  step: WizardStepId,
  draft: ApplicationDraft,
  options: { ssnOnFile?: boolean } = {}
): ApplicationFieldErrors {
  const errors: ApplicationFieldErrors = {};

  if (step === "identity") {
    if (!draft.fullName) errors.fullName = "Enter your full name.";
    else if (draft.fullName.length < 2) errors.fullName = "Name is too short.";
    if (!draft.dateOfBirth) errors.dateOfBirth = "Enter your date of birth.";
    if (!draft.ssn && !options.ssnOnFile) {
      errors.ssn = "Enter your Social Security number.";
    }
    if (!draft.email) errors.email = "Enter an email address.";
    if (!draft.phone) errors.phone = "Enter a phone number.";
    if (!isContactMethod(draft.preferredContactMethod)) {
      errors.preferredContactMethod = "Choose how we should reach you.";
    }
  }

  if (step === "address") {
    if (!draft.streetAddress) errors.streetAddress = "Enter a street address.";
    if (!draft.city) errors.city = "Enter a city.";
    if (!isState(draft.state)) errors.state = "Choose a state.";
    else if (draft.state !== homeLicenseState) {
      errors.state = "Acashi is for Washington Healthplanfinder applications.";
    }
    if (!draft.zip) errors.zip = "Enter a ZIP code.";
    if (!draft.county) {
      errors.county = "Choose a Washington county.";
    } else if (!isWashingtonCounty(draft.county)) {
      errors.county = "Choose a Washington county.";
    }
  }

  if (step === "household") {
    if (draft.householdMembers.length < 1) {
      errors.householdMembers = "Add at least yourself.";
    } else {
      const hasSelf = draft.householdMembers.some(
        (member) => member.relationship === "self"
      );
      if (!hasSelf) {
        errors.householdMembers = "Include one person marked as self.";
      }
      const invalid = draft.householdMembers.find((member) => {
        if (!member.fullName || member.fullName.length < 2) return true;
        if (member.age === null || member.age < 0 || member.age > 120) {
          return true;
        }
        if (member.age >= 18 && member.tobaccoUse === "not_asked") return true;
        return false;
      });
      if (invalid) {
        errors.householdMembers =
          "Each person needs a name, age, and relationship. People 18 or older need a tobacco answer.";
      }
    }
  }

  if (step === "income") {
    if (!isIncomeBand(draft.incomeBand)) {
      errors.incomeBand = "Choose an income band, or prefer not to say.";
    }
    if (!isEmploymentStatus(draft.employmentStatus)) {
      errors.employmentStatus = "Choose an employment status.";
    }
  }

  if (step === "coverage") {
    if (!isYesNoUnsure(draft.hasCurrentCoverage)) {
      errors.hasCurrentCoverage = "Tell us whether anyone has coverage now.";
    } else if (draft.hasCurrentCoverage === "yes" && !draft.currentCoverageType) {
      errors.currentCoverageType = "Choose the kind of coverage.";
    }
    if (!isYesNoUnsure(draft.losingCoverageSoon)) {
      errors.losingCoverageSoon =
        "Tell us whether anyone is losing coverage soon.";
    }
  }

  if (step === "consent") {
    if (!draft.acceptedDisclaimer) {
      errors.acceptedDisclaimer =
        "Confirm that Acashi is not Healthplanfinder and does not enroll you here.";
    }
    if (!draft.agentAssistanceConsent) {
      errors.agentAssistanceConsent =
        "Agent-assistance consent is required to keep a retainable authorization.";
    }
  }

  addFormatErrors(draft, errors);
  return errors;
}

export function validateApplicationDraft(
  draft: ApplicationDraft,
  mode: "partial" | "complete",
  options: { ssnOnFile?: boolean } = {}
): ApplicationFieldErrors {
  if (mode === "partial") {
    const errors: ApplicationFieldErrors = {};
    if (!draft.email) {
      errors.email = "Enter an email so you can save and resume.";
    }
    addFormatErrors(draft, errors);
    return errors;
  }

  return wizardSteps.reduce<ApplicationFieldErrors>((errors, step) => {
    return { ...errors, ...validateWizardStep(step.id, draft, options) };
  }, {});
}

export function parseApplicationDraft(
  input: unknown,
  mode: "partial" | "complete" = "complete",
  options: { ssnOnFile?: boolean } = {}
):
  | { ok: true; draft: ApplicationDraft }
  | { ok: false; errors: ApplicationFieldErrors } {
  const draft = sanitizeApplicationDraft(input);
  const errors = validateApplicationDraft(draft, mode, options);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, draft };
}

export function persistableDraft(draft: ApplicationDraft): ApplicationDraft {
  return { ...draft, ssn: "" };
}

export function isApplicationId(value: string) {
  return /^[A-Za-z0-9_-]{8,128}$/.test(value);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function emailsMatch(stored: string, provided: string) {
  return normalizeEmail(stored) === normalizeEmail(provided);
}

export function formatSubmittedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function householdSizeOf(draft: Pick<ApplicationDraft, "householdMembers">) {
  return Math.max(draft.householdMembers.length, 1);
}

export function applyConsentAudit(
  record: ApplicationRecord,
  draft: ApplicationDraft,
  ip: string,
  now: string
): ApplicationRecord {
  const next = { ...record };
  if (draft.acceptedDisclaimer && !next.disclaimerAcceptedAt) {
    next.disclaimerAcceptedAt = now;
  }
  if (draft.agentAssistanceConsent && !next.agentAssistanceConsentAt) {
    next.agentAssistanceConsentAt = now;
    next.agentAssistanceConsentIp = ip || "unknown";
    next.agentAssistanceConsentText = agentAssistanceConsentText;
    next.consentVersion = consentVersion;
  }
  return next;
}

export function appendStatusHistory(
  history: StatusHistoryEntry[],
  entry: StatusHistoryEntry
) {
  const last = history[history.length - 1];
  if (
    last &&
    last.status === entry.status &&
    last.by === entry.by &&
    last.note === entry.note
  ) {
    return history;
  }
  return [...history, entry].slice(-40);
}

export function publicApplication(record: ApplicationRecord) {
  return {
    id: record.id,
    fullName: record.fullName,
    dateOfBirth: record.dateOfBirth,
    email: record.email,
    phone: record.phone,
    preferredContactMethod: record.preferredContactMethod,
    streetAddress: record.streetAddress,
    city: record.city,
    state: record.state,
    zip: record.zip,
    county: record.county,
    householdMembers: record.householdMembers,
    householdSize: record.householdSize,
    incomeBand: record.incomeBand,
    annualIncome: record.annualIncome,
    employmentStatus: record.employmentStatus,
    employerName: record.employerName,
    employerOffersCoverage: record.employerOffersCoverage,
    hasCurrentCoverage: record.hasCurrentCoverage,
    currentCoverageType: record.currentCoverageType,
    losingCoverageSoon: record.losingCoverageSoon,
    notes: record.notes,
    selectedPlan: record.selectedPlan,
    acceptedDisclaimer: record.acceptedDisclaimer,
    agentAssistanceConsent: record.agentAssistanceConsent,
    agentAssistanceConsentAt: record.agentAssistanceConsentAt,
    disclaimerAcceptedAt: record.disclaimerAcceptedAt,
    consentVersion: record.consentVersion,
    status: record.status,
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
    ssnMasked: record.ssnLast4 ? `•••-••-${record.ssnLast4}` : "",
    ssnOnFile: Boolean(record.ssnLast4 || record.ssnCiphertext),
  };
}

export function producerApplication(record: ApplicationRecord) {
  const ssn = record.ssnCiphertext ? decryptSsn(record.ssnCiphertext) : null;
  return {
    ...publicApplication(record),
    statusHistory: record.statusHistory,
    agentAssistanceConsentIp: record.agentAssistanceConsentIp,
    agentAssistanceConsentText: record.agentAssistanceConsentText,
    producerNotes: record.producerNotes,
    agentName: record.agentName,
    agentNpn: record.agentNpn,
    ssn: ssn ? formatSsn(ssn) : "",
    ssnLast4: record.ssnLast4,
  };
}

export function draftFromRecord(record: ApplicationRecord): ApplicationDraft {
  return {
    fullName: record.fullName,
    dateOfBirth: record.dateOfBirth,
    ssn: "",
    email: record.email,
    phone: record.phone,
    preferredContactMethod: record.preferredContactMethod,
    streetAddress: record.streetAddress,
    city: record.city,
    state: record.state,
    zip: record.zip,
    county: record.county,
    householdMembers: record.householdMembers,
    incomeBand: record.incomeBand,
    annualIncome: record.annualIncome,
    employmentStatus: record.employmentStatus,
    employerName: record.employerName,
    employerOffersCoverage: record.employerOffersCoverage,
    hasCurrentCoverage: record.hasCurrentCoverage,
    currentCoverageType: record.currentCoverageType,
    losingCoverageSoon: record.losingCoverageSoon,
    notes: record.notes,
    selectedPlan: record.selectedPlan,
    acceptedDisclaimer: record.acceptedDisclaimer,
    agentAssistanceConsent: record.agentAssistanceConsent,
  };
}

function applySsn(record: ApplicationRecord, draft: ApplicationDraft): ApplicationRecord {
  if (!draft.ssn) return record;
  return {
    ...record,
    ssnCiphertext: encryptSsn(draft.ssn),
    ssnLast4: ssnLast4(draft.ssn),
  };
}

export function createApplicationRecord(input: {
  id: string;
  draft: ApplicationDraft;
  submit: boolean;
  ip: string;
  now: string;
  agentName: string;
  agentNpn: string;
}): ApplicationRecord {
  const { ssn: _ssn, ...rest } = input.draft;
  void _ssn;
  const status: ApplicationStatus = input.submit ? "new" : "in_progress";
  let record: ApplicationRecord = {
    ...rest,
    id: input.id,
    status,
    householdSize: householdSizeOf(input.draft),
    submittedAt: input.now,
    updatedAt: input.now,
    completedAt: input.submit ? input.now : null,
    statusHistory: [
      {
        status,
        at: input.now,
        by: "applicant",
        note: input.submit
          ? "Applicant completed consent and submitted."
          : "Applicant started a draft.",
      },
    ],
    disclaimerAcceptedAt: null,
    agentAssistanceConsentAt: null,
    agentAssistanceConsentIp: null,
    agentAssistanceConsentText: null,
    consentVersion: null,
    producerNotes: "",
    agentName: input.agentName,
    agentNpn: input.agentNpn,
    ssnCiphertext: "",
    ssnLast4: "",
  };
  record = applySsn(record, input.draft);
  if (input.submit) {
    record = applyConsentAudit(record, input.draft, input.ip, input.now);
  }
  return record;
}

export function reduceApplicationSave(input: {
  existing: ApplicationRecord | null;
  draft: ApplicationDraft;
  submit: boolean;
  ip: string;
  now: string;
  agentName: string;
  agentNpn: string;
}):
  | { ok: true; record: ApplicationRecord }
  | { ok: false; error: string; status: number; errors?: ApplicationFieldErrors } {
  const mode = input.submit ? "complete" : "partial";
  const ssnOnFile = Boolean(
    input.existing?.ssnLast4 || input.existing?.ssnCiphertext
  );
  const errors = validateApplicationDraft(input.draft, mode, { ssnOnFile });
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: input.submit
        ? "Check the required fields before submitting."
        : "Check the highlighted fields.",
      status: 400,
      errors,
    };
  }

  if (!input.existing) {
    return {
      ok: true,
      record: createApplicationRecord({
        id: crypto.randomUUID(),
        draft: input.draft,
        submit: input.submit,
        ip: input.ip,
        now: input.now,
        agentName: input.agentName,
        agentNpn: input.agentNpn,
      }),
    };
  }

  if (!isConsumerEditable(input.existing.status)) {
    return {
      ok: false,
      error:
        "This application is locked for producer handoff. Contact the producer if something changed.",
      status: 409,
    };
  }

  const { ssn: _ssn, ...draftRest } = input.draft;
  void _ssn;

  let record: ApplicationRecord = {
    ...input.existing,
    ...draftRest,
    householdSize: householdSizeOf(input.draft),
    updatedAt: input.now,
    agentName: input.existing.agentName || input.agentName,
    agentNpn: input.existing.agentNpn || input.agentNpn,
    ssnCiphertext: input.existing.ssnCiphertext,
    ssnLast4: input.existing.ssnLast4,
  };
  record = applySsn(record, input.draft);

  if (input.submit) {
    record = applyConsentAudit(record, input.draft, input.ip, input.now);
    record.completedAt = record.completedAt ?? input.now;
    if (record.status === "in_progress") {
      record.status = "new";
      record.statusHistory = appendStatusHistory(record.statusHistory, {
        status: "new",
        at: input.now,
        by: "applicant",
        note: "Applicant completed consent and submitted.",
      });
    }
  }

  return { ok: true, record };
}

export function reduceProducerPatch(input: {
  existing: ApplicationRecord;
  status?: unknown;
  statusNote?: unknown;
  producerNotes?: unknown;
  agentName?: unknown;
  agentNpn?: unknown;
  now: string;
}):
  | { ok: true; record: ApplicationRecord }
  | { ok: false; error: string; status: number } {
  const next: ApplicationRecord = { ...input.existing, updatedAt: input.now };

  if (input.producerNotes !== undefined) {
    if (typeof input.producerNotes !== "string") {
      return { ok: false, error: "Producer notes must be text.", status: 400 };
    }
    next.producerNotes = input.producerNotes.trim().slice(0, 4000);
  }

  if (input.agentName !== undefined) {
    if (typeof input.agentName !== "string") {
      return { ok: false, error: "Agent name must be text.", status: 400 };
    }
    next.agentName = input.agentName.trim().slice(0, 120);
  }

  if (input.agentNpn !== undefined) {
    if (typeof input.agentNpn !== "string") {
      return { ok: false, error: "NPN must be text.", status: 400 };
    }
    next.agentNpn = input.agentNpn.trim().slice(0, 20);
  }

  if (input.status !== undefined) {
    const status = normalizeApplicationStatus(input.status);
    if (!status) {
      return { ok: false, error: "Choose a valid pipeline status.", status: 400 };
    }
    const note =
      typeof input.statusNote === "string"
        ? input.statusNote.trim().slice(0, 500)
        : "";
    next.status = status;
    if (status !== input.existing.status || note) {
      next.statusHistory = appendStatusHistory(next.statusHistory, {
        status,
        at: input.now,
        by: "producer",
        note: note || `Producer set status to ${statusLabels[status]}.`,
      });
    }
  }

  return { ok: true, record: next };
}

export function applicationToExportPayload(record: ApplicationRecord) {
  return {
    exportedAt: new Date().toISOString(),
    purpose:
      "Handoff for a licensed producer to assist enrollment on Washington Healthplanfinder (WAHBE). Not an EDE/web-broker submission. Not HealthCare.gov. Acashi is not the official Exchange. Plan selection on this file is interest only.",
    marketplace: "Washington Healthplanfinder",
    producer: {
      agentName: record.agentName,
      agentNpn: record.agentNpn,
    },
    consent: {
      acceptedDisclaimer: record.acceptedDisclaimer,
      disclaimerAcceptedAt: record.disclaimerAcceptedAt,
      agentAssistanceConsent: record.agentAssistanceConsent,
      agentAssistanceConsentAt: record.agentAssistanceConsentAt,
      agentAssistanceConsentIp: record.agentAssistanceConsentIp,
      agentAssistanceConsentText: record.agentAssistanceConsentText,
      consentVersion: record.consentVersion,
    },
    application: producerApplication(record),
  };
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function applicationToCsv(record: ApplicationRecord) {
  const members = record.householdMembers
    .map((member) => {
      const age = member.age === null ? "" : String(member.age);
      return `${member.fullName} (${relationshipLabels[member.relationship]}, ${age}, tobacco ${member.tobaccoUse})`;
    })
    .join("; ");

  const rows: Array<[string, string]> = [
    ["id", record.id],
    ["status", record.status],
    ["submittedAt", record.submittedAt],
    ["updatedAt", record.updatedAt],
    ["completedAt", record.completedAt ?? ""],
    ["fullName", record.fullName],
    ["dateOfBirth", record.dateOfBirth],
    ["ssn", decryptSsn(record.ssnCiphertext) ?? ""],
    ["email", record.email],
    ["phone", record.phone],
    ["preferredContactMethod", record.preferredContactMethod],
    ["streetAddress", record.streetAddress],
    ["city", record.city],
    ["state", record.state],
    ["zip", record.zip],
    ["county", record.county],
    ["householdSize", String(record.householdSize)],
    ["householdMembers", members],
    ["incomeBand", record.incomeBand],
    ["annualIncome", record.annualIncome],
    ["employmentStatus", record.employmentStatus],
    ["employerName", record.employerName],
    ["employerOffersCoverage", record.employerOffersCoverage],
    ["hasCurrentCoverage", record.hasCurrentCoverage],
    ["currentCoverageType", record.currentCoverageType],
    ["losingCoverageSoon", record.losingCoverageSoon],
    ["notes", record.notes],
    [
      "selectedPlan",
      record.selectedPlan
        ? `${record.selectedPlan.issuer} ${record.selectedPlan.name} (${record.selectedPlan.id})`
        : "",
    ],
    ["producerNotes", record.producerNotes],
    ["agentName", record.agentName],
    ["agentNpn", record.agentNpn],
    ["acceptedDisclaimer", String(record.acceptedDisclaimer)],
    ["disclaimerAcceptedAt", record.disclaimerAcceptedAt ?? ""],
    ["agentAssistanceConsent", String(record.agentAssistanceConsent)],
    ["agentAssistanceConsentAt", record.agentAssistanceConsentAt ?? ""],
    ["agentAssistanceConsentIp", record.agentAssistanceConsentIp ?? ""],
    ["consentVersion", record.consentVersion ?? ""],
  ];

  return `${rows.map(([key]) => csvEscape(key)).join(",")}\n${rows
    .map(([, value]) => csvEscape(value))
    .join(",")}\n`;
}

