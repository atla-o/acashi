import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getProducerApplication,
  patchProducerApplication,
} from "@/lib/application-service";
import {
  PRODUCER_COOKIE,
  verifyProducerSessionToken,
} from "@/lib/producer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireProducer() {
  const jar = await cookies();
  const token = jar.get(PRODUCER_COOKIE)?.value ?? "";
  return verifyProducerSessionToken(token);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireProducer())) {
    return NextResponse.json(
      { ok: false, error: "Admin sign-in required." },
      { status: 401 }
    );
  }
  const { id } = await context.params;
  const result = await getProducerApplication(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireProducer())) {
    return NextResponse.json(
      { ok: false, error: "Admin sign-in required." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send a JSON status update." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const result = await patchProducerApplication(id, body);
  return NextResponse.json(result.body, { status: result.status });
}
