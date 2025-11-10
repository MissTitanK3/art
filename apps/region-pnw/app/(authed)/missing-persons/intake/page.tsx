import { MissingPersonIntakeDataLayer } from "@/components/dataLayer/missing-persons/MissingPersonIntakeDataLayer";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

export default function MissingPersonsIntakePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-16">
      <div className="space-y-2">
        <Link
          href="/missing-persons"
          className="inline-block text-sm text-muted-foreground"
        >
          Back
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Missing Persons Intake
        </h1>
        <p className="text-muted-foreground">
          Capture all available details about a detention so legal aid partners
          can mobilize quickly.
        </p>
      </div>
      <Alert>
        <AlertTitle>Collect only what’s needed</AlertTitle>
        <AlertDescription>
          Prioritize identifiers (name, DOB, pronouns, A‑Number), where/when it
          happened, agency/facility, transfers, interpreter needs, and a
          contact. Avoid sensitive extras you don’t need.
        </AlertDescription>
      </Alert>
      <MissingPersonIntakeDataLayer />
    </div>
  );
}
