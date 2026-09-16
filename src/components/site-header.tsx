import { SiteNav } from "@/components/site-nav";
import { familyUrl } from "@/lib/legal";

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-5">
        <a
          href={familyUrl}
          className="font-heading text-xl leading-none tracking-tight"
          aria-label="Devo — devoutshaman.com"
        >
          o
        </a>
        <div className="mt-3">
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
