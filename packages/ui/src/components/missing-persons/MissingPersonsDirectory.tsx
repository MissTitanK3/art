import * as React from "react";
import { AlertTriangle, Search } from "lucide-react";

import type { DetaineeIntake } from "../../types/missing-person-intake";
import { getMissingPersonSlug } from "../../lib/missing-persons";

import { Badge } from "../badge";
import { Button } from "../button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

type UrgencyFilter = "all" | "urgent" | "none";

export interface MissingPersonsDirectoryProps {
  records?: DetaineeIntake[];
  fetchUrl?: string;
  /**
   * Optionally override how the view-details link is generated for each record.
   */
  getRecordHref?: (record: DetaineeIntake) => string;
  /**
   * Allows callers to customise the anchor element used for the view-details button.
   * Defaults to a simple anchor tag to avoid coupling to a routing library.
   */
  renderRecordLink?: (
    href: string,
    record: DetaineeIntake,
    label: string,
  ) => React.ReactNode;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Updated today";
  }
  if (diffDays === 1) {
    return "Updated 1 day ago";
  }
  if (diffDays < 7) {
    return `Updated ${diffDays} days ago`;
  }
  return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
}

const defaultRecordHref = (record: DetaineeIntake) =>
  `/missing-persons/${getMissingPersonSlug(record)}`;

const defaultRenderRecordLink = (
  href: string,
  _record: DetaineeIntake,
  label: string,
) => <a href={href}>{label}</a>;

function mergeRecords(
  remote: DetaineeIntake[],
  local: DetaineeIntake[],
): DetaineeIntake[] {
  const merged = new Map<string, DetaineeIntake>();

  const addRecord = (
    record: DetaineeIntake,
    index: number,
    origin: string,
  ) => {
    const key =
      record.caseId ??
      record.fullName ??
      record.aNumber ??
      record.createdAt ??
      `${origin}-${index}`;
    if (!merged.has(key)) {
      merged.set(key, record);
    }
  };

  local.forEach((record, index) => addRecord(record, index, "local"));
  remote.forEach((record, index) => addRecord(record, index, "remote"));

  return Array.from(merged.values());
}

export function MissingPersonsDirectory({
  records = [],
  fetchUrl,
  getRecordHref = defaultRecordHref,
  renderRecordLink = defaultRenderRecordLink,
}: MissingPersonsDirectoryProps) {
  const [query, setQuery] = React.useState("");
  const [urgencyFilter, setUrgencyFilter] =
    React.useState<UrgencyFilter>("all");
  const [remoteRecords, setRemoteRecords] = React.useState<DetaineeIntake[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!fetchUrl) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(fetchUrl!);
        if (!res.ok) throw new Error("Failed to fetch records");
        const json = await res.json();
        if (active) {
          setRemoteRecords(Array.isArray(json.records) ? json.records : []);
        }
      } catch (err) {
        if (active) {
          console.warn("MissingPersonsDirectory: failed to fetch", err);
          setError("Unable to load live missing person records.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [fetchUrl]);

  const allRecords = React.useMemo(() => {
    if (!fetchUrl && records.length === 0) return [];
    return mergeRecords(remoteRecords, records);
  }, [records, remoteRecords, fetchUrl]);

  const searchableRecords = React.useMemo(() => allRecords ?? [], [allRecords]);

  const filteredRecords = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return searchableRecords.filter((record) => {
      const urgentCount = record.urgentNeeds?.length ?? 0;

      if (urgencyFilter === "urgent" && urgentCount === 0) {
        return false;
      }
      if (urgencyFilter === "none" && urgentCount > 0) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        record.caseId,
        record.fullName,
        ...(record.aliases ?? []),
        record.aNumber,
        record.detentionLocation,
        record.lastKnownFacility,
        record.lastKnownCity,
        record.arrestingAgency,
        record.dispatcherContact?.name,
        ...(record.urgentNeeds ?? []),
        ...(record.languagesSpoken ?? []),
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        )
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [searchableRecords, query, urgencyFilter]);

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">
          Loading missing person directory…
        </p>
      ) : null}
      {error ? <p className="text-sm text-amber-600">{error}</p> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, case ID, facility, or need…"
              className="pl-8"
            />
          </div>

          <Select
            value={urgencyFilter}
            onValueChange={(value) => setUrgencyFilter(value as UrgencyFilter)}
          >
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="Urgency filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cases</SelectItem>
              <SelectItem value="urgent">Urgent needs only</SelectItem>
              <SelectItem value="none">No flagged needs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          onClick={() => setQuery("")}
          className="self-start md:self-auto"
        >
          Clear search
        </Button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
          <AlertTriangle className="h-6 w-6" />
          <p>No missing persons match your filters right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecords.map((record) => {
            const slug = getMissingPersonSlug(record);
            const viewHref = getRecordHref(record);
            const urgentNeeds = record.urgentNeeds ?? [];
            const displayName =
              record.fullName?.trim() || "Unidentified individual";
            const lastLocation =
              record.lastKnownFacility ||
              record.lastKnownCity ||
              record.detentionLocation ||
              "Unknown";

            const confidence = record.confidenceRating ?? null;
            const interpreterBadge = record.interpreterNeeded ? (
              <Badge variant="outline">Interpreter needed</Badge>
            ) : null;
            return (
              <Card
                key={record.caseId ?? slug}
                className="flex h-full flex-col border-border/70"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{displayName}</CardTitle>
                  <CardDescription className="space-y-1 text-sm">
                    <div className="font-medium text-foreground">
                      {record.caseId ?? "Pending case ID"}
                    </div>
                    {record.detentionDateTime ? (
                      <div>Detained {formatDate(record.detentionDateTime)}</div>
                    ) : null}
                    {record.aNumber ? (
                      <div>A-Number {record.aNumber}</div>
                    ) : null}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="space-y-1 text-sm">
                    <div className="text-xs uppercase text-muted-foreground">
                      Last known location
                    </div>
                    <div className="font-medium text-foreground">
                      {lastLocation}
                    </div>
                    {record.arrestingAgency ? (
                      <div className="text-muted-foreground">
                        {record.arrestingAgency}
                      </div>
                    ) : null}
                    {record.knownTransfers?.length ? (
                      <div className="text-xs text-muted-foreground">
                        Last transfer{" "}
                        {formatDate(
                          record.knownTransfers[
                            record.knownTransfers.length - 1
                          ]?.transferDate,
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="text-xs uppercase text-muted-foreground">
                      Profile
                    </div>
                    <div className="text-muted-foreground">
                      {record.pronouns ? `Pronouns: ${record.pronouns}` : null}
                      {record.pronouns && record.languagesSpoken?.length
                        ? " · "
                        : null}
                      {record.languagesSpoken?.length
                        ? `Languages: ${record.languagesSpoken.join(", ")}`
                        : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {interpreterBadge}
                      {confidence ? (
                        <Badge variant="secondary">
                          Confidence {confidence}/5
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="text-xs uppercase text-muted-foreground">
                      Urgent needs
                    </div>
                    {urgentNeeds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {urgentNeeds.slice(0, 3).map((need) => (
                          <Badge key={need} variant="destructive">
                            {need}
                          </Badge>
                        ))}
                        {urgentNeeds.length > 3 ? (
                          <Badge variant="outline">
                            +{urgentNeeds.length - 3} more
                          </Badge>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        None flagged
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div>{formatRelativeDate(record.lastUpdated)}</div>
                    {record.lastUpdated ? (
                      <div className="text-xs">
                        {formatDate(record.lastUpdated)}
                      </div>
                    ) : null}
                  </div>
                  <Button asChild size="sm">
                    {renderRecordLink(viewHref, record, "View details")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
