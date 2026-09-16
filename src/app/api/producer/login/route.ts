import { NextResponse } from "next/server";
import {
  createProducerSessionToken,
  PRODUCER_COOKIE,
  producerAuthConfigured,
  producerCookieOptions,
  producerCredentialsMatch,
} from "@/lib/producer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!producerAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin portal is not configured. Set ACASHI_PRODUCER_PASSWORD or ACASHI_PRODUCER_MAGIC.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send a password or magic token." },
      { status: 400 }
    );
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const password = typeof record.password === "string" ? record.password : "";
  const token = typeof record.token === "string" ? record.token : "";

  if (!producerCredentialsMatch({ password, token })) {
    return NextResponse.json(
      { ok: false, error: "Those Admin credentials did not match." },
      { status: 401 }
    );
  }

  const session = createProducerSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PRODUCER_COOKIE, session, producerCookieOptions());
  return response;
}
