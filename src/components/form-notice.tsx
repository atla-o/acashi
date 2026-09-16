import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { healthcareGov, portalDisclaimer } from "@/lib/legal";
import { CircleAlert, Info } from "lucide-react";

export function ScopeNotice() {
  return (
    <Alert className="border-foreground/12 bg-muted/40 px-4 py-3">
      <Info />
      <AlertTitle>Washington FFM. Not Covered California.</AlertTitle>
      <AlertDescription className="mt-1 text-pretty">
        {portalDisclaimer} Official marketplace:{" "}
        <a href={healthcareGov}>{healthcareGov.replace("https://", "")}</a>
        .
      </AlertDescription>
    </Alert>
  );
}

export function StatusHint() {
  return (
    <Alert className="border-foreground/12 px-4 py-3">
      <CircleAlert />
      <AlertTitle>Save as you go. Keep your application id</AlertTitle>
      <AlertDescription className="mt-1">
        Each step stores progress. After you submit, Acashi keeps the
        application id in this browser and shows a status monitor. You can also
        look it up later with that id and the email you used.
      </AlertDescription>
    </Alert>
  );
}
