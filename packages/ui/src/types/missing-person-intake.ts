/**
 * Shared types for missing person intake records.
 */
export interface DetaineeIntake {
  caseId: string;
  detentionDateTime?: string;
  detentionLocation?: string;
  arrestingAgency?: string;
  witnessContacts?: ContactInfo[];
  dispatcherContact?: ContactInfo;
  fullName?: string;
  aliases?: string[];
  dateOfBirth?: string;
  countryOfBirth?: string;
  genderIdentity?: string;
  pronouns?: string;
  languagesSpoken?: string[];
  aNumber?: string;
  photoUrl?: string;
  physicalDescription?: string;
  lastKnownFacility?: string;
  lastKnownCity?: string;
  arrestingOfficers?: string[];
  statedReasonForDetention?: string;
  knownTransfers?: TransferRecord[];
  belongingsLeftBehind?: string;
  dependentsLeftBehind?: string;
  familyContacts?: ContactInfo[];
  priorAttorney?: string;
  preferredLegalAidOrgs?: string[];
  interpreterNeeded?: boolean;
  urgentNeeds?: string[];
  informationSources?: InfoSource[];
  lastUpdated?: string;
  confidenceRating?: number;
  createdAt?: string;
  createdBy?: string;
  version?: number;
}

export interface DetaineeIntakeFormValues extends DetaineeIntake {
  detentionDateTime?: string;
  detentionLocation?: string;
  arrestingAgency?: string;
  witnessContacts: ContactInfo[];
  dispatcherContact: ContactInfo;
  aliases: string[];
  languagesSpoken: string[];
  arrestingOfficers: string[];
  knownTransfers: TransferRecord[];
  familyContacts: ContactInfo[];
  preferredLegalAidOrgs: string[];
  urgentNeeds: string[];
  informationSources: InfoSource[];
  belongingsLeftBehind?: string;
  dependentsLeftBehind?: string;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  relation?: string;
}

export interface TransferRecord {
  fromFacility?: string;
  toFacility?: string;
  transferDate?: string;
  method?: string;
}

export type InfoSourceType = "witness" | "document" | "phone" | "other";

export interface InfoSource {
  field: string;
  sourceType: InfoSourceType;
  details?: string;
  timestamp?: string;
  confidence?: number;
}
