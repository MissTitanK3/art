import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import MissingPersonsServerDataLayer from "@/components/dataLayer/missing-persons/MissingPersonsServerDataLayer";

export default async function MissingPersonsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Missing Persons Directory</h1>
          <p className="text-muted-foreground max-w-2xl">
            Track all currently detained individuals, monitor urgent needs, and route each case to the right responders.
            Use search to quickly locate a case, or open a record to print and export an updated report.
          </p>
        </div>
        <Button asChild>
          <Link href="/missing-persons/intake">Add new intake</Link>
        </Button>
      </div>

      <MissingPersonsServerDataLayer />
    </div>
  );
}
