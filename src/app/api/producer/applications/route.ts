import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listProducerApplications } from "@/lib/application-service";
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

export async function GET(request: Request) {
  if (!(await requireProducer())) {
    return NextResponse.json(
      { ok: false, error: "Producer sign-in required." },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() ?? "";
  const result = await listProducerApplications(status || undefined);
  return NextResponse.json(result.body, { status: result.status });
}
