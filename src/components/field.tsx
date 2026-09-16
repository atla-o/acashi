import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </label>
      {hint ? (
        <p className="text-sm leading-6 text-muted-foreground">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldClass(invalid?: boolean) {
  return cn(
    "h-10 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-foreground",
    invalid ? "border-destructive" : "border-foreground/15"
  );
}

export function areaClass(invalid?: boolean) {
  return cn(
    "w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus-visible:border-foreground",
    invalid ? "border-destructive" : "border-foreground/15"
  );
}
