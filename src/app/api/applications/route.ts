import { NextResponse } from "next/server";
import {
  createOrSaveApplication,
  lookupPublicApplication,
} from "@/lib/application-service";
import { clientIp } from "@/lib/producer";

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

  try {
    const result = await createOrSaveApplication({
      body,
      ip: clientIp(request),
      submitDefault: false,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Acashi could not store this application. Try again." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send a JSON application." },
      { status: 400 }
    );
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (typeof record.id !== "string" || !record.id.trim()) {
    return NextResponse.json(
      { ok: false, error: "Application id is required to save progress." },
      { status: 400 }
    );
  }

  try {
    const result = await createOrSaveApplication({
      body,
      ip: clientIp(request),
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Acashi could not store this application. Try again." },
      { status: 503 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  const email = url.searchParams.get("email")?.trim() ?? "";

  try {
    const result = await lookupPublicApplication(id, email);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Acashi could not look up that application." },
      { status: 503 }
    );
  }
}
