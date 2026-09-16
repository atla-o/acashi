import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProducerLoginForm } from "@/components/producer-login-form";
import {
  PRODUCER_COOKIE,
  producerAuthConfigured,
  verifyProducerSessionToken,
} from "@/lib/producer-auth";

export const metadata: Metadata = {
  title: "Producer sign in",
};

export default async function ProducerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const jar = await cookies();
  const session = jar.get(PRODUCER_COOKIE)?.value ?? "";
  if (verifyProducerSessionToken(session)) {
    redirect("/producer");
  }

  const params = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-5 py-16 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Producer desk
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight md:text-5xl">
        Sign in
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        Password or magic-link gate for Devo ops. This desk is not HealthCare.gov
        and does not submit to FFM. Enrollment assist waits on PY2027 RCL.
      </p>
      <div className="mt-10">
        <ProducerLoginForm
          configured={producerAuthConfigured()}
          magicToken={params.token ?? ""}
          error={params.error ?? ""}
        />
      </div>
    </div>
  );
}
