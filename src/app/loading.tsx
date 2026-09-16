export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-20" role="status" aria-live="polite">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Loading
      </p>
      <div className="h-10 max-w-xs bg-foreground/8" />
      <div className="h-4 max-w-xl bg-foreground/6" />
      <div className="h-4 max-w-md bg-foreground/6" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
