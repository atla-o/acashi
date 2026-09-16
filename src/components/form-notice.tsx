import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { healthplanfinder, portalDisclaimer } from "@/lib/legal";
import { CircleAlert, Info } from "lucide-react";

export function ScopeNotice() {
  return (
    <Alert className="border-foreground/12 bg-muted/40 px-4 py-3">
      <Info />
      <AlertTitle>Washington Healthplanfinder. Not HealthCare.gov.</AlertTitle>
      <AlertDescription className="mt-1 text-pretty">
        {portalDisclaimer} Official Marketplace:{" "}
        <a href={healthplanfinder}>
          {healthplanfinder.replace("https://www.", "")}
        </a>
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
        Each step stores progress. Social Security numbers are encrypted and are
        not kept in this browser. After you submit, Acashi keeps the application
        id here and on the account page.
      </AlertDescription>
    </Alert>
  );
}
