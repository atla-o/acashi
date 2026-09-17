import Link from "next/link";
import {
  familyUrl,
  healthplanfinder,
  parentBrand,
  productName,
  publicHost,
  shortDisclaimer,
  siblings,
  tagline,
  whatWeAre,
  whatWeAreNot,
} from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-white text-black">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
              {productName}
            </p>
            <p className="text-[11px] leading-5 text-black/70">{tagline}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
              What this is
            </p>
            <ul className="space-y-1.5 text-[11px] leading-5 text-black/70">
              {whatWeAre.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">
              What this is not
            </p>
            <ul className="space-y-1.5 text-[11px] leading-5 text-black/70">
              {whatWeAreNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[11px] leading-5 text-black/60">{shortDisclaimer}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-black/75">
          <Link href="/" className="hover:text-black">
            Marketplace
          </Link>
          <Link href="/apply" className="hover:text-black">
            Apply
          </Link>
          <Link href="/enrollment" className="hover:text-black">
            Enrollment
          </Link>
          <Link href="/account" className="hover:text-black">
            Account
          </Link>
          <Link href="/admin" className="hover:text-black">
            Admin
          </Link>
          <a href={healthplanfinder} className="hover:text-black">
            Healthplanfinder
          </a>
        </div>

        <p className="text-[10px] leading-4 text-black/45">
          {siblings.map((sibling) => sibling.name).join(" · ")}. A {parentBrand}{" "}
          product. Mark{" "}
          <a
            href={familyUrl}
            className="underline underline-offset-2 hover:text-black/70"
          >
            o
          </a>
          .{" "}
          <a
            href={familyUrl}
            className="underline underline-offset-2 hover:text-black/70"
          >
            devoutshaman.com
          </a>
          .{" "}
          <a
            href={publicHost}
            className="underline underline-offset-2 hover:text-black/70"
          >
            acashi.devoutshaman.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
