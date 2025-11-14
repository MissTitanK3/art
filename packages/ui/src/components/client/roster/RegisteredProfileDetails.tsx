import { Loader2 } from "lucide-react";

type RegisteredProfileDetailsProps = {
  loading: boolean;
  hasProfile: boolean;
  details: Array<{ label: string; value: string }>;
};

export function RegisteredProfileDetails({
  loading,
  hasProfile,
  details,
}: RegisteredProfileDetailsProps) {
  return (
    <section className="rounded-md border border-dashed bg-muted/40 p-3">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">Registered Profile</h3>
        <p className="text-xs text-muted-foreground">
          This volunteer is synced from their user profile. Details shown below
          reflect what they chose to share.
        </p>
      </div>
      {loading && !hasProfile ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
        </div>
      ) : null}
      <dl className="grid gap-2 text-xs">
        {details.map((detail) => (
          <div key={detail.label} className="grid gap-0.5">
            <dt className="font-medium text-foreground">{detail.label}</dt>
            <dd className="text-muted-foreground">{detail.value}</dd>
          </div>
        ))}
        {details.length === 0 ? (
          <p className="text-muted-foreground">No shared details available.</p>
        ) : null}
      </dl>
    </section>
  );
}
