import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  enrollmentInfo,
  enrollmentPath,
  healthplanfinder,
  homeLicenseRegulator,
  parentBrand,
} from "@/lib/legal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enrollment on Healthplanfinder",
};

export default function EnrollmentPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Washington · Healthplanfinder · WAHBE
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight md:text-5xl">
        How enrollment works
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        Washington residents enroll on{" "}
        <a href={healthplanfinder} className="underline underline-offset-3">
          Healthplanfinder
        </a>
        , the state-based Marketplace. Acashi is not the Exchange, not
        HealthCare.gov, and not an official quote. A licensed producer assists.{" "}
        {parentBrand} uses its existing legal entity; licensing for this market
        is {homeLicenseRegulator}.
      </p>

      <ol className="mt-12 grid gap-px bg-foreground/10 sm:grid-cols-3">
        {enrollmentPath.map((step, index) => (
          <li key={step.title} className="bg-background px-5 py-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="font-heading mt-2 text-2xl tracking-tight">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <ol className="mt-16 space-y-10">
        {enrollmentInfo.map((section) => (
          <li key={section.title} className="max-w-2xl">
            <h2 className="font-heading text-2xl tracking-tight">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {section.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Browse plans
        </Link>
        <Link
          href="/apply"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Start an application
        </Link>
        <a
          href={healthplanfinder}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Finish on Healthplanfinder
        </a>
      </div>
    </div>
  );
}
