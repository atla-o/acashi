import type { Metadata } from "next";
import { ProducerPipeline } from "@/components/producer-pipeline";
import type { ApplicationRecord } from "@/lib/application";
import {
  listApplications,
  storeUnavailableMessage,
} from "@/lib/application-store";
import { producerDefaults } from "@/lib/producer";

export const metadata: Metadata = {
  title: "Admin pipeline",
};

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const agent = producerDefaults();
  let applications: ApplicationRecord[] = [];
  let loadError: string | null = null;
  try {
    applications = await listApplications();
  } catch {
    loadError = storeUnavailableMessage();
  }
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Admin · pipeline
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight md:text-5xl">
        Applications
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        Washington Healthplanfinder files. Move new → in progress → ready to
        submit, then export JSON or CSV for producer handoff. Existing legal
        entity — writing producer{" "}
        <span className="text-foreground">{agent.agentName || "—"}</span>
        {agent.agentNpn ? ` · NPN ${agent.agentNpn}` : ""}. Status changes are
        stored on the application. SSN is shown on the open file, not on this
        list.
      </p>
      <div className="mt-12">
        {loadError ? (
          <p
            role="alert"
            className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
          >
            {loadError}
          </p>
        ) : (
          <ProducerPipeline applications={applications} />
        )}
      </div>
    </div>
  );
}
