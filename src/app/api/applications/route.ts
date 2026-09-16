import { NextResponse } from "next/server";
import { parseApplicationDraft, publicApplication } from "@/lib/application";
import {
  readApplication,
  storeUnavailableMessage,
  writeApplication,
} from "@/lib/application-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send a JSON application." },
      { status: 400 }
    );
  }

  const parsed = parseApplicationDraft(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "Check the required fields.", errors: parsed.errors },
      { status: 400 }
    );
  }

  try {
    const application = await writeApplication(parsed.draft);
    return NextResponse.json(
      { ok: true, application: publicApplication(application) },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.startsWith("Acashi wrote")
        ? error.message
        : storeUnavailableMessage();
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  const email = url.searchParams.get("email")?.trim() ?? "";

  if (!id || !email) {
    return NextResponse.json(
      { ok: false, error: "Application id and email are required." },
      { status: 400 }
    );
  }

  try {
    const application = await readApplication(id, email);
    if (!application) {
      return NextResponse.json(
        { ok: false, error: "No application matched that id and email." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      application: publicApplication(application),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: storeUnavailableMessage() },
      { status: 503 }
    );
  }
}
