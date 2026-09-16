"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl space-y-5 px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Error
      </p>
      <h1 className="font-heading text-4xl tracking-tight">
        This page did not load.
      </h1>
      <p className="text-sm leading-7 text-muted-foreground">
        Try again, or return to Marketplace. Acashi is not emergency
        care and not Healthplanfinder.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Marketplace
        </Link>
      </div>
    </div>
  );
}
