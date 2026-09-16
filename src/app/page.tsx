import { PlanBrowser } from "@/components/plan-browser";
import { Separator } from "@/components/ui/separator";
import {
  healthplanfinder,
  homeLicenseRegulator,
  productName,
  tagline,
  whatWeAre,
  whatWeAreNot,
} from "@/lib/legal";
import { landscapeNote, planSource, planYear } from "@/lib/plans";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
          Find a health plan
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Washington ZIP or county. Scroll public PY{planYear} medical plans,
          then save interest. Premiums are landscape list rates, not a
          personalized APTC quote. Selection is not enrollment. Finish on{" "}
          <a href={healthplanfinder} className="underline underline-offset-3">
            Healthplanfinder
          </a>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          {landscapeNote} {planSource}
        </p>
        <Separator className="my-8" />
        <PlanBrowser />
      </section>

      <section className="border-y border-foreground/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-20">
          <div className="space-y-6">
            <h2 className="font-heading max-w-xl text-4xl leading-[1.05] tracking-tight md:text-5xl">
              {productName}
            </h2>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              {tagline}
            </p>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">
              Washington is a state-based Marketplace. Households enroll on{" "}
              <a href={healthplanfinder} className="underline underline-offset-3">
                Healthplanfinder
              </a>
              , often with a premium tax credit. A licensed producer assists.
              Licensing path: {homeLicenseRegulator}.
            </p>
          </div>
          <aside className="self-end space-y-4 border border-foreground/10 p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              In one sentence
            </p>
            <p className="text-sm leading-6">
              Scroll real Washington plans, file an application, and finish on
              Healthplanfinder. This is not the official Exchange and not
              HealthCare.gov.
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="font-heading text-3xl tracking-tight">What this is</h2>
            <ul className="mt-6 space-y-4">
              {whatWeAre.map((item) => (
                <li key={item} className="text-sm leading-7 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-3xl tracking-tight">
              What this is not
            </h2>
            <ul className="mt-6 space-y-4">
              {whatWeAreNot.map((item) => (
                <li key={item} className="text-sm leading-7 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
