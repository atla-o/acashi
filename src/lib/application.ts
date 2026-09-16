export const agentAssistanceConsentText =
  "I authorize a licensed insurance agent or broker to assist me with applying for and enrolling in health coverage through the Health Insurance Marketplace. I understand this agent may collect and use the information in this application to help me complete enrollment on the official exchange (HealthCare.gov or my state-based marketplace). This authorization is part of my application record and may be retained as required. I understand that granting this authorization does not complete enrollment, does not determine eligibility or a premium tax credit, and does not guarantee a subsidy or a plan.";

export const consentVersion = "2026-09-acashi-portal";

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
  new: "Acashi has the completed application. A producer has not started it yet.",
  in_progress:
    "This file is being completed by the applicant or worked by a producer. It is not enrollment.",
  ready_to_submit:
    "The file is ready for a licensed agent to enroll the household on the official Marketplace. This site does not submit to FFM.",
  submitted:
    "A licensed agent has handed this file off for Marketplace enrollment (HealthSherpa or manual). Confirm on HealthCare.gov or with the agent.",
  effectuated:
    "Coverage is marked as started. Confirm official Marketplace or insurer notices — Acashi is not the exchange.",
  closed:
    "This application is closed. That is not a denial of coverage. Enrollment still happens on the official marketplace.",
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
  marketplace: "Marketplace / HealthCare.gov",
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
  { id: "contact", label: "Contact" },
  { id: "location", label: "Location" },
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
  email: string;
  phone: string;
  preferredContactMethod: ContactMethod | "";
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
  acceptedDisclaimer: boolean;
  agentAssistanceConsent: boolean;
};

export type ApplicationRecord = ApplicationDraft & {
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
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationDraft | "householdMembers" | "submit", string>
>;

export const emptyApplicationDraft: ApplicationDraft = {
  fullName: "",
  email: "",
  phone: "",
  preferredContactMethod: "email",
  state: "",
  zip: "",
  county: "",
  householdMembers: [],
  incomeBand: "",
  annualIncome: "",
  employmentStatus: "",
  employerName: "",
  employerOffersCoverage: "",
  hasCurrentCoverage: "",
  currentCoverageType: "",
  losingCoverageSoon: "",
  notes: "",
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

export function trim(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function sanitizeMember(input: unknown): HouseholdMember {
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

export function sanitizeApplicationDraft(input: unknown): ApplicationDraft {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const membersInput = Array.isArray(body.householdMembers)
    ? body.householdMembers
    : [];
  let householdMembers = membersInput.slice(0, MAX_MEMBERS).map(sanitizeMember);

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

  return {
    fullName: trim(body.fullName, MAX_NAME),
    email: trim(body.email, MAX_EMAIL).toLowerCase(),
    phone: trim(body.phone, MAX_PHONE),
    preferredContactMethod: isContactMethod(body.preferredContactMethod)
      ? body.preferredContactMethod
      : "",
    state: isState(stateRaw) ? stateRaw : "",
    zip: trim(body.zip, 10),
    county: trim(body.county, MAX_COUNTY),
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
  }
  if (draft.annualIncome && !/^\d+(\.\d{1,2})?$/.test(draft.annualIncome)) {
    errors.annualIncome = "Use a number, or leave this blank and pick a band.";
  }
}

export function validateWizardStep(
  step: WizardStepId,
  draft: ApplicationDraft
): ApplicationFieldErrors {
  const errors: ApplicationFieldErrors = {};

  if (step === "contact") {
    if (!draft.fullName) errors.fullName = "Enter your full name.";
    else if (draft.fullName.length < 2) errors.fullName = "Name is too short.";
    if (!draft.email) errors.email = "Enter an email address.";
    if (!draft.phone) errors.phone = "Enter a phone number.";
    if (!isContactMethod(draft.preferredContactMethod)) {
      errors.preferredContactMethod = "Choose how we should reach you.";
    }
  }

  if (step === "location") {
    if (!isState(draft.state)) errors.state = "Choose a state.";
    if (!draft.zip) errors.zip = "Enter a ZIP code.";
    if (!draft.county) errors.county = "Enter a county.";
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
        "Confirm that Acashi is not HealthCare.gov and does not enroll you here.";
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
  mode: "partial" | "complete"
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
    return { ...errors, ...validateWizardStep(step.id, draft) };
  }, {});
}

export function parseApplicationDraft(
  input: unknown,
  mode: "partial" | "complete" = "complete"
):
  | { ok: true; draft: ApplicationDraft }
  | { ok: false; errors: ApplicationFieldErrors } {
  const draft = sanitizeApplicationDraft(input);
  const errors = validateApplicationDraft(draft, mode);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, draft };
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
    email: record.email,
    phone: record.phone,
    preferredContactMethod: record.preferredContactMethod,
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
    acceptedDisclaimer: record.acceptedDisclaimer,
    agentAssistanceConsent: record.agentAssistanceConsent,
    agentAssistanceConsentAt: record.agentAssistanceConsentAt,
    disclaimerAcceptedAt: record.disclaimerAcceptedAt,
    consentVersion: record.consentVersion,
    status: record.status,
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
  };
}

export function producerApplication(record: ApplicationRecord) {
  return {
    ...publicApplication(record),
    statusHistory: record.statusHistory,
    agentAssistanceConsentIp: record.agentAssistanceConsentIp,
    agentAssistanceConsentText: record.agentAssistanceConsentText,
    producerNotes: record.producerNotes,
    agentName: record.agentName,
    agentNpn: record.agentNpn,
  };
}

export function draftFromRecord(record: ApplicationRecord): ApplicationDraft {
  return {
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    preferredContactMethod: record.preferredContactMethod,
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
    acceptedDisclaimer: record.acceptedDisclaimer,
    agentAssistanceConsent: record.agentAssistanceConsent,
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
  const status: ApplicationStatus = input.submit ? "new" : "in_progress";
  let record: ApplicationRecord = {
    ...input.draft,
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
  };
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
  const errors = validateApplicationDraft(input.draft, mode);
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

  let record: ApplicationRecord = {
    ...input.existing,
    ...input.draft,
    householdSize: householdSizeOf(input.draft),
    updatedAt: input.now,
    agentName: input.existing.agentName || input.agentName,
    agentNpn: input.existing.agentNpn || input.agentNpn,
  };

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
      "Handoff for HealthSherpa or manual Marketplace enrollment. Not an FFM/EDE submission. Acashi is not HealthCare.gov.",
    ffmAssist: "Waits on PY2027 registration/certification listing (RCL).",
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
    ["email", record.email],
    ["phone", record.phone],
    ["preferredContactMethod", record.preferredContactMethod],
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

