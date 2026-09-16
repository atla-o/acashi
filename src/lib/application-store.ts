import { Firestore, Timestamp } from "@google-cloud/firestore";
import type {
  ApplicationDraft,
  ApplicationRecord,
  ApplicationStatus,
  HouseholdMember,
  StatusHistoryEntry,
} from "@/lib/application";
import {
  emailsMatch,
  householdSizeOf,
  isApplicationId,
  normalizeApplicationStatus,
  reduceApplicationSave,
} from "@/lib/application";
import { GCP_PROJECT_ID, gcp } from "@/lib/gcp";
import { producerDefaults } from "@/lib/producer";

let client: Firestore | null = null;

const globalForStore = globalThis as typeof globalThis & {
  __acashiApplications?: Map<string, ApplicationRecord>;
};

function memoryMap() {
  if (!globalForStore.__acashiApplications) {
    globalForStore.__acashiApplications = new Map<string, ApplicationRecord>();
  }
  return globalForStore.__acashiApplications;
}

function memoryStoreEnabled() {
  return process.env.ACASHI_STORE === "memory";
}

function firestore() {
  if (!client) {
    const projectId = gcp.projectId;
    if (projectId !== GCP_PROJECT_ID) {
      console.warn(
        `Acashi expected GCP project ${GCP_PROJECT_ID}; using ${projectId}.`
      );
    }
    client = new Firestore({
      projectId,
      ignoreUndefinedProperties: true,
      ...(gcp.firestoreDatabase && gcp.firestoreDatabase !== "(default)"
        ? { databaseId: gcp.firestoreDatabase }
        : {}),
    });
  }
  return client;
}

function collection() {
  return firestore().collection(gcp.collections.applications);
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function toIsoOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return toIso(value);
}

function asMembers(value: unknown, fallbackName: string): HouseholdMember[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(
      (member): member is HouseholdMember =>
        Boolean(member) &&
        typeof member === "object" &&
        typeof (member as HouseholdMember).fullName === "string"
    );
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

function asHistory(value: unknown): StatusHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const status = normalizeApplicationStatus(row.status);
    if (!status || typeof row.at !== "string") return [];
    const by =
      row.by === "applicant" || row.by === "producer" || row.by === "system"
        ? row.by
        : "system";
    return [
      {
        status,
        at: row.at,
        by,
        note: typeof row.note === "string" ? row.note : "",
      },
    ];
  });
}

function asRecord(
  id: string,
  data: Record<string, unknown>
): ApplicationRecord | null {
  if (typeof data.fullName !== "string" || typeof data.email !== "string") {
    return null;
  }

  const status = normalizeApplicationStatus(data.status);
  if (!status) return null;

  const householdMembers = asMembers(data.householdMembers, data.fullName);
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
    preferredContactMethod,
    state: typeof data.state === "string" ? (data.state as ApplicationRecord["state"]) : "",
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
    acceptedDisclaimer: data.acceptedDisclaimer === true,
    agentAssistanceConsent: data.agentAssistanceConsent === true,
    status,
    submittedAt: toIso(data.submittedAt),
    updatedAt: toIso(data.updatedAt ?? data.submittedAt),
    completedAt: toIsoOrNull(data.completedAt),
    statusHistory: asHistory(data.statusHistory),
    disclaimerAcceptedAt: toIsoOrNull(data.disclaimerAcceptedAt),
    agentAssistanceConsentAt: toIsoOrNull(data.agentAssistanceConsentAt),
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
  };
}

function firestorePayload(record: ApplicationRecord) {
  const data: Record<string, unknown> = { ...record };
  delete data.id;
  return {
    ...data,
    submittedAt: Timestamp.fromDate(new Date(record.submittedAt)),
    updatedAt: Timestamp.fromDate(new Date(record.updatedAt)),
    completedAt: record.completedAt
      ? Timestamp.fromDate(new Date(record.completedAt))
      : null,
    source: "acashi-web",
    projectId: gcp.projectId,
  };
}

async function withTimeout<T>(promise: Promise<T>, ms = 8000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(`Firestore in GCP project ${GCP_PROJECT_ID} timed out.`)
          );
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function resetMemoryStore() {
  memoryMap().clear();
}

export async function putApplication(
  record: ApplicationRecord
): Promise<ApplicationRecord> {
  if (memoryStoreEnabled()) {
    memoryMap().set(record.id, record);
    return record;
  }

  await withTimeout(
    collection().doc(record.id).set(firestorePayload(record), { merge: true })
  );
  const stored = await readApplicationById(record.id);
  if (!stored) {
    throw new Error("Acashi wrote the application but could not read it back.");
  }
  return stored;
}

export async function readApplication(
  id: string,
  email: string
): Promise<ApplicationRecord | null> {
  const record = await readApplicationById(id);
  if (!record || !emailsMatch(record.email, email)) return null;
  return record;
}

export async function readApplicationById(
  id: string
): Promise<ApplicationRecord | null> {
  if (!isApplicationId(id)) return null;

  if (memoryStoreEnabled()) {
    return memoryMap().get(id) ?? null;
  }

  const snap = await withTimeout(collection().doc(id).get());
  if (!snap.exists) return null;
  return asRecord(snap.id, (snap.data() ?? {}) as Record<string, unknown>);
}

export async function listApplications(status?: ApplicationStatus) {
  if (memoryStoreEnabled()) {
    const rows = Array.from(memoryMap().values()).sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1
    );
    return status ? rows.filter((row) => row.status === status) : rows;
  }

  const query = collection().orderBy("updatedAt", "desc").limit(200);
  const snap = await withTimeout(query.get());
  const rows = snap.docs.flatMap((doc) => {
    const record = asRecord(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
    return record ? [record] : [];
  });
  return status ? rows.filter((row) => row.status === status) : rows;
}

export async function writeApplication(
  draft: ApplicationDraft
): Promise<ApplicationRecord> {
  const now = new Date().toISOString();
  const reduced = reduceApplicationSave({
    existing: null,
    draft,
    submit: true,
    ip: "unknown",
    now,
    ...producerDefaults(),
  });
  if (!reduced.ok) {
    throw new Error(reduced.error);
  }
  return putApplication(reduced.record);
}

export function storeUnavailableMessage() {
  return `Acashi could not reach records in GCP project ${GCP_PROJECT_ID}. Try again.`;
}
