import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-5 px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Missing
      </p>
      <h1 className="font-heading text-4xl tracking-tight">
        That page is not here.
      </h1>
      <p className="text-sm leading-7 text-muted-foreground">
        The surfaces in this product are the application form and the status
        monitor.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Apply
        </Link>
        <Link
          href="/status"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Status
        </Link>
      </div>
    </div>
  );
}
