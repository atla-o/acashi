import { ApplicationWizard } from "@/components/application-wizard";
import { Separator } from "@/components/ui/separator";
import {
  parentBrand,
  productName,
  tagline,
  whatWeAre,
  whatWeAreNot,
} from "@/lib/legal";

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-foreground/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24">
          <div className="space-y-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {parentBrand} · lateral health
            </p>
            <h1 className="font-heading max-w-xl text-5xl leading-[1.05] tracking-tight md:text-7xl">
              {productName}
            </h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              {tagline}
            </p>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">
              Affordable Care Act marketplace coverage can come with a premium
              tax credit. Acashi is a producer application portal: complete
              household data, retainable agent-assistance consent, then handoff.
              It does not sell a plan or complete enrollment on this site.
            </p>
          </div>
          <aside className="self-end space-y-4 border border-foreground/10 p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              In one sentence
            </p>
            <p className="text-sm leading-6">
              Save a complete Marketplace file here. A licensed agent enrolls
              you on the official exchange. This is not HealthCare.gov.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-b border-foreground/10 bg-muted/30">
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

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Application
        </p>
        <h2 className="font-heading mt-3 text-4xl tracking-tight">
          Marketplace application
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Six short steps. Save progress any time. Income is approximate.
          Acashi does not compute a credit, quote a plan, or enroll you.
          After submit, the status monitor uses your application id and email.
        </p>
        <Separator className="my-10" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <aside className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Open enrollment and special enrollment windows are set by the
              federal or state marketplace, not by Acashi. If you already know
              you need a plan, start on HealthCare.gov while this file is in
              review.
            </p>
            <p>
              Pipeline: new → in progress → ready to submit → submitted →
              effectuated, or closed. Ready to submit means a licensed agent
              can hand the file to HealthSherpa or enroll manually. FFM
              enrollment assist waits on PY2027 RCL. Closed is not a coverage
              denial.
            </p>
            <p>
              Devo is on a path to get licensed and use FFM when plan year 2027
              opens. Until then this portal captures a complete file and
              consent. It does not pretend to be the exchange.
            </p>
          </aside>
          <ApplicationWizard />
        </div>
      </section>
    </div>
  );
}
