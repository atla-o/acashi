import {
  isApplicationId,
  normalizeApplicationStatus,
  parseApplicationDraft,
  producerApplication,
  publicApplication,
  reduceApplicationSave,
  reduceProducerPatch,
} from "@/lib/application";
import {
  listApplications,
  putApplication,
  readApplication,
  readApplicationById,
  storeUnavailableMessage,
} from "@/lib/application-store";
import { producerDefaults } from "@/lib/producer";

type JsonResult = {
  status: number;
  body: Record<string, unknown>;
};

function asObject(input: unknown) {
  return input && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};
}

export async function createOrSaveApplication(input: {
  body: unknown;
  ip: string;
  submitDefault?: boolean;
}): Promise<JsonResult> {
  const body = asObject(input.body);
  const submit = body.submit === true || input.submitDefault === true;

  const id = typeof body.id === "string" ? body.id.trim() : "";
  let existing = null;
  if (id) {
    if (!isApplicationId(id)) {
      return {
        status: 400,
        body: { ok: false, error: "Application id is not valid." },
      };
    }
    existing = await readApplicationById(id);
    if (!existing) {
      return {
        status: 404,
        body: { ok: false, error: "No application matched that id." },
      };
    }
  }

  const parsed = parseApplicationDraft(body, submit ? "complete" : "partial", {
    ssnOnFile: Boolean(existing?.ssnLast4 || existing?.ssnCiphertext),
  });
  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        error: submit
          ? "Check the required fields before submitting."
          : "Check the highlighted fields.",
        errors: parsed.errors,
      },
    };
  }

  const reduced = reduceApplicationSave({
    existing,
    draft: parsed.draft,
    submit,
    ip: input.ip,
    now: new Date().toISOString(),
    ...producerDefaults(),
  });

  if (!reduced.ok) {
    return {
      status: reduced.status,
      body: {
        ok: false,
        error: reduced.error,
        ...(reduced.errors ? { errors: reduced.errors } : {}),
      },
    };
  }

  try {
    const application = await putApplication(reduced.record);
    return {
      status: existing ? 200 : 201,
      body: { ok: true, application: publicApplication(application) },
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.startsWith("Acashi wrote")
        ? error.message
        : storeUnavailableMessage();
    return { status: 503, body: { ok: false, error: message } };
  }
}

export async function lookupPublicApplication(
  id: string,
  email: string
): Promise<JsonResult> {
  if (!id || !email) {
    return {
      status: 400,
      body: { ok: false, error: "Application id and email are required." },
    };
  }

  try {
    const application = await readApplication(id, email);
    if (!application) {
      return {
        status: 404,
        body: { ok: false, error: "No application matched that id and email." },
      };
    }
    return {
      status: 200,
      body: { ok: true, application: publicApplication(application) },
    };
  } catch {
    return {
      status: 503,
      body: { ok: false, error: storeUnavailableMessage() },
    };
  }
}

export async function listProducerApplications(statusFilter?: string) {
  const status = statusFilter
    ? normalizeApplicationStatus(statusFilter)
    : undefined;
  if (statusFilter && !status) {
    return {
      status: 400,
      body: { ok: false, error: "Choose a valid pipeline status." },
    } satisfies JsonResult;
  }

  try {
    const applications = await listApplications(status ?? undefined);
    return {
      status: 200,
      body: {
        ok: true,
        applications: applications.map(producerApplication),
      },
    } satisfies JsonResult;
  } catch {
    return {
      status: 503,
      body: { ok: false, error: storeUnavailableMessage() },
    } satisfies JsonResult;
  }
}

export async function getProducerApplication(id: string): Promise<JsonResult> {
  if (!isApplicationId(id)) {
    return { status: 400, body: { ok: false, error: "Application id is not valid." } };
  }
  try {
    const application = await readApplicationById(id);
    if (!application) {
      return { status: 404, body: { ok: false, error: "No application with that id." } };
    }
    return {
      status: 200,
      body: { ok: true, application: producerApplication(application) },
    };
  } catch {
    return {
      status: 503,
      body: { ok: false, error: storeUnavailableMessage() },
    };
  }
}

export async function patchProducerApplication(
  id: string,
  body: unknown
): Promise<JsonResult> {
  if (!isApplicationId(id)) {
    return { status: 400, body: { ok: false, error: "Application id is not valid." } };
  }

  const patch = asObject(body);
  try {
    const existing = await readApplicationById(id);
    if (!existing) {
      return { status: 404, body: { ok: false, error: "No application with that id." } };
    }
    const reduced = reduceProducerPatch({
      existing,
      status: patch.status,
      statusNote: patch.statusNote,
      producerNotes: patch.producerNotes,
      agentName: patch.agentName,
      agentNpn: patch.agentNpn,
      now: new Date().toISOString(),
    });
    if (!reduced.ok) {
      return { status: reduced.status, body: { ok: false, error: reduced.error } };
    }
    const application = await putApplication(reduced.record);
    return {
      status: 200,
      body: { ok: true, application: producerApplication(application) },
    };
  } catch {
    return {
      status: 503,
      body: { ok: false, error: storeUnavailableMessage() },
    };
  }
}
