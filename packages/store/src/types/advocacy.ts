export type AdvocacyGroupType =
  | "legal_aid"
  | "civil_rights"
  | "immigrant_justice"
  | "media_advocacy"
  | "public_defender"
  | "other";

export type AdvocacyPreferredFormat = "pdf" | "web" | "feed";

export type AdvocacyGroup = {
  id: string;
  name: string;
  type: AdvocacyGroupType | null;
  jurisdiction: string | null;
  contact_emails: string[] | null;
  contact_phones: string[] | null;
  contact_faxes: string[] | null;
  contact_signal: string | null;
  preferred_format: AdvocacyPreferredFormat | null;
  active_status: boolean;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdvocacyDeliveryStatus = "queued" | "sent" | "failed" | "skipped";

export type AdvocacyDeliveryLog = {
  id: string;
  group_id: string | null;
  case_id: string;
  format: AdvocacyPreferredFormat | null;
  status: AdvocacyDeliveryStatus | null;
  details: Record<string, unknown> | null;
  attempted_at?: string | null;
};
