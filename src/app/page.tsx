import { PlanBrowser } from "@/components/plan-browser";
import { healthplanfinder } from "@/lib/legal";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 py-8 md:py-10">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
          Find a health plan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Washington ZIP plus household income. List rates update with an
          estimated premium tax credit from 2025 FPL and the 2026 IRS table —
          not an official Healthplanfinder determination, not enrollment. Finish
          on{" "}
          <a href={healthplanfinder} className="underline underline-offset-3">
            Healthplanfinder
          </a>
          .
        </p>
        <div className="mt-6">
          <PlanBrowser />
        </div>
      </section>
    </div>
  );
}
