import Link from "next/link";
import {
  familyUrl,
  parentBrand,
  productName,
  publicHost,
  shortDisclaimer,
  siblings,
} from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-background/55">
            Disclaimer
          </p>
          <p className="max-w-xl text-sm leading-6 text-background/80">
            {shortDisclaimer}
          </p>
        </div>
        <div className="space-y-4 text-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-background/55">
            {productName}
          </p>
          <ul className="space-y-2 text-background/80">
            <li>
              <Link href="/" className="hover:text-background">
                Apply
              </Link>
            </li>
            <li>
              <Link href="/status" className="hover:text-background">
                Application status
              </Link>
            </li>
            <li>
              <Link href="/producer" className="hover:text-background">
                Producer desk
              </Link>
            </li>
            <li>
              <a
                href="https://www.healthcare.gov"
                className="hover:text-background"
              >
                HealthCare.gov
              </a>
            </li>
          </ul>
          <p className="text-[11px] uppercase tracking-[0.2em] text-background/55">
            Devo siblings
          </p>
          <ul className="space-y-1 text-background/80">
            {siblings.map((sibling) => (
              <li key={sibling.name}>
                {sibling.name}
                <span className="text-background/50"> — {sibling.note}</span>
              </li>
            ))}
          </ul>
          <p className="pt-4 text-xs leading-5 text-background/50">
            A {parentBrand} product. Mark{" "}
            <a
              href={familyUrl}
              className="underline underline-offset-3 hover:text-background/80"
            >
              o
            </a>
            . Public family:{" "}
            <a
              href={familyUrl}
              className="underline underline-offset-3 hover:text-background/80"
            >
              devoutshaman.com
            </a>
            . Public host:{" "}
            <a
              href={publicHost}
              className="underline underline-offset-3 hover:text-background/80"
            >
              acashi.devoutshaman.com
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
