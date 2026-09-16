import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusMonitor } from "@/components/status-monitor";

export const metadata: Metadata = {
  title: "Application status",
};

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Monitor
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight md:text-5xl">
        Application status
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        Look up a file with its application id and the email used on the form.
        After a successful submit, this browser keeps the id. Status is
        received, in review, needs info, ready for marketplace, or closed.
      </p>
      <div className="mt-12">
        <Suspense fallback={<StatusLoading />}>
          <StatusMonitor />
        </Suspense>
      </div>
    </div>
  );
}

function StatusLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Loading
      </p>
      <div className="h-10 max-w-xs bg-foreground/8" />
      <div className="h-4 max-w-xl bg-foreground/6" />
      <span className="sr-only">Loading status monitor…</span>
    </div>
  );
}
