import * as React from "react";

import { Badge } from "@workspace/ui/primitives/badge";

import type {
  ContactInfo,
  InfoSource,
  TransferRecord,
} from "@workspace/ui/types/missing-person-intake";

export function formatText(
  value?: React.ReactNode,
  fallback = "Not provided"
): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? (
      trimmed
    ) : (
      <span className="text-muted-foreground">{fallback}</span>
    );
  }
  if (Array.isArray(value) && value.length === 0) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return value;
}

export function formatDateTime(
  value?: string,
  fallback = "Not provided"
): React.ReactNode {
  if (!value) return <span className="text-muted-foreground">{fallback}</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function formatList(
  values?: string[],
  fallback = "Not provided"
): React.ReactNode {
  if (!values || values.length === 0) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} variant="outline">
          {value}
        </Badge>
      ))}
    </div>
  );
}

export function formatContacts(
  records?: ContactInfo[],
  fallback = "No contacts recorded"
): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return (
    <div className="space-y-2 text-sm">
      {records.map((contact, index) => (
        <div key={`${contact.name}-${contact.relation ?? index}`}>
          <div className="font-medium text-foreground">{contact.name}</div>
          <div className="text-muted-foreground">
            {[contact.relation, contact.phone, contact.email]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function formatTransfers(
  records?: TransferRecord[],
  fallback = "No documented transfers"
): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return (
    <div className="space-y-2 text-sm">
      {records.map((transfer, index) => (
        <div key={`${transfer.transferDate}-${transfer.toFacility}-${index}`}>
          <div className="font-medium text-foreground">
            {transfer.toFacility ?? "Unknown facility"}
          </div>
          <div className="text-muted-foreground">
            {transfer.fromFacility ? `From ${transfer.fromFacility}` : null}
            {transfer.fromFacility && transfer.transferDate ? " · " : null}
            {transfer.transferDate
              ? new Date(transfer.transferDate).toLocaleString()
              : null}
            {transfer.method ? ` · ${transfer.method}` : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function formatInfoSources(
  records?: InfoSource[],
  fallback = "No verification notes recorded"
): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return (
    <div className="space-y-3 text-sm">
      {records.map((source, index) => (
        <div key={`${source.field}-${index}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{source.field}</Badge>
            <Badge variant="secondary">{source.sourceType}</Badge>
            {source.confidence ? (
              <Badge variant="outline">Confidence {source.confidence}/5</Badge>
            ) : null}
          </div>
          {source.details ? (
            <div className="text-muted-foreground">{source.details}</div>
          ) : null}
          {source.timestamp ? (
            <div className="text-xs text-muted-foreground">
              Logged {new Date(source.timestamp).toLocaleString()}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
