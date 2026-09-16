import { Firestore, Timestamp } from "@google-cloud/firestore";
import type { ApplicationDraft, ApplicationRecord } from "@/lib/application";
import { emailsMatch, isApplicationId } from "@/lib/application";
import { GCP_PROJECT_ID, gcp } from "@/lib/gcp";

let client: Firestore | null = null;
const memory = new Map<string, ApplicationRecord>();

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

function asRecord(
  id: string,
  data: Record<string, unknown>
): ApplicationRecord | null {
  if (
    typeof data.fullName !== "string" ||
    typeof data.email !== "string" ||
    typeof data.phone !== "string" ||
    typeof data.state !== "string" ||
    typeof data.zip !== "string" ||
    typeof data.householdSize !== "number" ||
    typeof data.incomeBand !== "string" ||
    typeof data.preferredContactMethod !== "string" ||
    typeof data.status !== "string"
  ) {
    return null;
  }

  return {
    id,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    state: data.state as ApplicationRecord["state"],
    zip: data.zip,
    householdSize: data.householdSize,
    incomeBand: data.incomeBand as ApplicationRecord["incomeBand"],
    annualIncome: typeof data.annualIncome === "string" ? data.annualIncome : "",
    preferredContactMethod:
      data.preferredContactMethod as ApplicationRecord["preferredContactMethod"],
    notes: typeof data.notes === "string" ? data.notes : "",
    acceptedDisclaimer: data.acceptedDisclaimer === true,
    status: data.status as ApplicationRecord["status"],
    submittedAt: toIso(data.submittedAt),
    updatedAt: toIso(data.updatedAt ?? data.submittedAt),
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
            new Error(
              `Firestore in GCP project ${GCP_PROJECT_ID} timed out.`
            )
          );
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function writeApplication(
  draft: ApplicationDraft
): Promise<ApplicationRecord> {
  const now = new Date().toISOString();

  if (memoryStoreEnabled()) {
    const id = crypto.randomUUID();
    const record: ApplicationRecord = {
      ...draft,
      id,
      status: "received",
      submittedAt: now,
      updatedAt: now,
    };
    memory.set(id, record);
    return record;
  }

  const receivedAt = Timestamp.now();
  const ref = collection().doc();
  await withTimeout(
    ref.set({
      ...draft,
      status: "received",
      submittedAt: receivedAt,
      updatedAt: receivedAt,
      source: "acashi-web",
      projectId: gcp.projectId,
    })
  );

  const stored = await readApplication(ref.id, draft.email);
  if (!stored) {
    throw new Error("Acashi wrote the application but could not read it back.");
  }
  return stored;
}

export async function readApplication(
  id: string,
  email: string
): Promise<ApplicationRecord | null> {
  if (!isApplicationId(id)) return null;

  if (memoryStoreEnabled()) {
    const record = memory.get(id);
    if (!record || !emailsMatch(record.email, email)) return null;
    return record;
  }

  const snap = await withTimeout(collection().doc(id).get());
  if (!snap.exists) return null;
  const record = asRecord(snap.id, (snap.data() ?? {}) as Record<string, unknown>);
  if (!record || !emailsMatch(record.email, email)) return null;
  return record;
}

export function storeUnavailableMessage() {
  return `Acashi could not reach records in GCP project ${GCP_PROJECT_ID}. Try again.`;
}
