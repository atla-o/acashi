export const applicationStatuses = [
  "received",
  "in_review",
  "needs_info",
  "ready_for_marketplace",
  "closed",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const statusLabels: Record<ApplicationStatus, string> = {
  received: "Received",
  in_review: "In review",
  needs_info: "Needs info",
  ready_for_marketplace: "Ready for marketplace",
  closed: "Closed",
};

export const statusCopy: Record<ApplicationStatus, string> = {
  received:
    "Acashi has the application. A reviewer has not started it yet.",
  in_review:
    "Someone at Acashi is looking at the information you sent.",
  needs_info:
    "Something is missing or unclear. Watch for contact using the method you chose.",
  ready_for_marketplace:
    "The file is ready for you to enroll on HealthCare.gov or your state marketplace. Acashi does not enroll you.",
  closed:
    "This application is closed. It is not a denial of coverage — enrollment still happens on the official marketplace.",
};

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

export type ApplicationDraft = {
  fullName: string;
  email: string;
  phone: string;
  state: UsState;
  zip: string;
  householdSize: number;
  incomeBand: IncomeBand;
  annualIncome: string;
  preferredContactMethod: ContactMethod;
  notes: string;
  acceptedDisclaimer: boolean;
};

export type ApplicationRecord = ApplicationDraft & {
  id: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationDraft, string>
>;

export const emptyApplicationDraft: ApplicationDraft = {
  fullName: "",
  email: "",
  phone: "",
  state: "CA",
  zip: "",
  householdSize: 1,
  incomeBand: "50000_74999",
  annualIncome: "",
  preferredContactMethod: "email",
  notes: "",
  acceptedDisclaimer: false,
};

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 32;
const MAX_NOTES = 2000;
const MAX_INCOME = 20;

function trim(value: unknown, max: number) {
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

function parseHouseholdSize(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
}

export function parseApplicationDraft(input: unknown):
  | { ok: true; draft: ApplicationDraft }
  | { ok: false; errors: ApplicationFieldErrors } {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const fullName = trim(body.fullName, MAX_NAME);
  const email = trim(body.email, MAX_EMAIL).toLowerCase();
  const phone = trim(body.phone, MAX_PHONE);
  const state = typeof body.state === "string" ? body.state.trim().toUpperCase() : "";
  const zip = trim(body.zip, 10);
  const householdSize = parseHouseholdSize(body.householdSize);
  const incomeBand = body.incomeBand;
  const annualIncome = trim(body.annualIncome, MAX_INCOME).replace(/[$,\s]/g, "");
  const preferredContactMethod = body.preferredContactMethod;
  const notes = trim(body.notes, MAX_NOTES);
  const acceptedDisclaimer = body.acceptedDisclaimer === true;

  const errors: ApplicationFieldErrors = {};

  if (!fullName) errors.fullName = "Enter your full name.";
  else if (fullName.length < 2) errors.fullName = "Name is too short.";

  if (!email) errors.email = "Enter an email address.";
  else if (!isEmail(email)) errors.email = "Enter a valid email.";

  if (!phone) errors.phone = "Enter a phone number.";
  else if (!isPhone(phone)) errors.phone = "Enter a 10-digit US phone number.";

  if (!isState(state)) errors.state = "Choose a state.";
  if (!zip) errors.zip = "Enter a ZIP code.";
  else if (!isZip(zip)) errors.zip = "Use a 5-digit ZIP, or ZIP+4.";

  if (householdSize === null) errors.householdSize = "Enter household size.";
  else if (householdSize < 1 || householdSize > 15) {
    errors.householdSize = "Household size must be between 1 and 15.";
  }

  if (!isIncomeBand(incomeBand)) {
    errors.incomeBand = "Choose an income band.";
  }

  if (annualIncome) {
    if (!/^\d+(\.\d{1,2})?$/.test(annualIncome)) {
      errors.annualIncome = "Use a number, or leave this blank and pick a band.";
    }
  }

  if (!isContactMethod(preferredContactMethod)) {
    errors.preferredContactMethod = "Choose how we should reach you.";
  }

  if (!acceptedDisclaimer) {
    errors.acceptedDisclaimer =
      "Confirm that you understand Acashi is not a broker and does not enroll you.";
  }

  if (
    Object.keys(errors).length > 0 ||
    !isState(state) ||
    householdSize === null ||
    !isIncomeBand(incomeBand) ||
    !isContactMethod(preferredContactMethod)
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    draft: {
      fullName,
      email,
      phone,
      state,
      zip,
      householdSize,
      incomeBand,
      annualIncome,
      preferredContactMethod,
      notes,
      acceptedDisclaimer,
    },
  };
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

export function publicApplication(record: ApplicationRecord) {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    state: record.state,
    zip: record.zip,
    householdSize: record.householdSize,
    incomeBand: record.incomeBand,
    annualIncome: record.annualIncome,
    preferredContactMethod: record.preferredContactMethod,
    notes: record.notes,
    status: record.status,
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
  };
}
