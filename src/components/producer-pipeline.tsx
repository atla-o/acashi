"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  applicationStatuses,
  formatSubmittedAt,
  pipelineApplication,
  statusLabels,
  type ApplicationStatus,
} from "@/lib/application";
import { cn } from "@/lib/utils";

type PipelineRow = ReturnType<typeof pipelineApplication>;

export function ProducerPipeline({
  applications,
}: {
  applications: PipelineRow[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [signingOut, setSigningOut] = useState(false);

  const counts = useMemo(() => {
    const next = Object.fromEntries(
      applicationStatuses.map((status) => [status, 0])
    ) as Record<ApplicationStatus, number>;
    for (const row of applications) {
      next[row.status] += 1;
    }
    return next;
  }, [applications]);

  const rows =
    filter === "all"
      ? applications
      : applications.filter((row) => row.status === filter);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/producer/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-px bg-foreground/10">
          <FilterChip
            label={`All ${applications.length}`}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {applicationStatuses.map((status) => (
            <FilterChip
              key={status}
              label={`${statusLabels[status]} ${counts[status]}`}
              active={filter === status}
              onClick={() => setFilter(status)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-sm px-4"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm leading-7 text-muted-foreground">
          No applications yet. When a consumer saves or submits an application,
          the file lands here.
        </p>
      ) : null}

      {applications.length > 0 && rows.length === 0 ? (
        <p className="text-sm leading-7 text-muted-foreground">
          Nothing in this status.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto border border-foreground/10">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-foreground/10 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Where</th>
                <th className="px-4 py-3 font-medium">Plan interest</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Writer</th>
                <th className="px-4 py-3 font-medium">Consent</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-foreground/8 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/${row.id}`} className="underline-offset-3 hover:underline">
                      {row.fullName || "Unnamed"}
                    </Link>
                    <p className="text-xs text-muted-foreground">{row.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.county || row.state || "—"} {row.zip}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.selectedPlan
                      ? `${row.selectedPlan.metal} · ${row.selectedPlan.issuer}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{statusLabels[row.status]}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.agentName || "—"}
                    {row.agentNpn ? (
                      <p className="text-xs">NPN {row.agentNpn}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.agentAssistanceConsent ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSubmittedAt(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-background px-3 py-2 text-xs",
        active && "bg-foreground text-background"
      )}
    >
      {label}
    </button>
  );
}
