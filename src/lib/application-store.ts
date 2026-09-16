import { Firestore, Timestamp } from "@google-cloud/firestore";
import type {
  ApplicationDraft,
  ApplicationRecord,
  ApplicationStatus,
} from "@/lib/application";
import {
  applicationRecordFromStored,
  emailsMatch,
  isApplicationId,
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

function asRecord(
  id: string,
  data: Record<string, unknown>
): ApplicationRecord | null {
  return applicationRecordFromStored(id, {
    ...data,
    submittedAt: toIso(data.submittedAt),
    updatedAt: toIso(data.updatedAt ?? data.submittedAt),
    completedAt: toIsoOrNull(data.completedAt),
    disclaimerAcceptedAt: toIsoOrNull(data.disclaimerAcceptedAt),
    agentAssistanceConsentAt: toIsoOrNull(data.agentAssistanceConsentAt),
  });
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
