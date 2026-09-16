import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationWizard } from "@/components/application-wizard";
import { healthplanfinder } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Apply",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Application
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight md:text-5xl">
        Washington Healthplanfinder file
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        Name, date of birth, address, income, Social Security number, and
        household. A licensed producer assists. Enrollment is on{" "}
        <a href={healthplanfinder} className="underline underline-offset-3">
          Healthplanfinder
        </a>
        , not on this site. Plan interest from the Marketplace list is optional
        and not binding.
      </p>
      <div className="mt-12 max-w-2xl">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading application…</p>}>
          <ApplicationWizard />
        </Suspense>
      </div>
    </div>
  );
}
