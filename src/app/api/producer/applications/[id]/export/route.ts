import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  applicationToCsv,
  applicationToExportPayload,
} from "@/lib/application";
import { readApplicationById, storeUnavailableMessage } from "@/lib/application-store";
import {
  PRODUCER_COOKIE,
  verifyProducerSessionToken,
} from "@/lib/producer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const token = jar.get(PRODUCER_COOKIE)?.value ?? "";
  if (!verifyProducerSessionToken(token)) {
    return NextResponse.json(
      { ok: false, error: "Admin sign-in required." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  try {
    const application = await readApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { ok: false, error: "No application with that id." },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
    const filename = `acashi-${id}.${format}`;

    if (format === "csv") {
      return new NextResponse(applicationToCsv(application), {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(applicationToExportPayload(application), null, 2),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-disposition": `attachment; filename="${filename}"`,
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: storeUnavailableMessage() },
      { status: 503 }
    );
  }
}
