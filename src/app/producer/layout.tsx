import type { ReactNode } from "react";

export default function ProducerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-foreground/10 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-5 py-2 text-[11px] uppercase tracking-[0.18em]">
          Producer desk · Washington OIC · FFM / HealthCare.gov · PY2027 RCL
        </div>
      </div>
      {children}
    </div>
  );
}
