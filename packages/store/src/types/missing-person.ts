export interface MissingPersonRecord {
  caseId: string;
  detentionDateTime?: string;
  detentionLocation?: string;
  arrestingAgency?: string;
  witnessContacts?: ContactReference[];
  dispatcherContact?: ContactReference;
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
  knownTransfers?: TransferReference[];
  belongingsLeftBehind?: string;
  dependentsLeftBehind?: string;
  familyContacts?: ContactReference[];
  priorAttorney?: string;
  preferredLegalAidOrgs?: string[];
  interpreterNeeded?: boolean;
  urgentNeeds?: string[];
  informationSources?: InformationSourceReference[];
  lastUpdated?: string;
  confidenceRating?: number;
  createdAt?: string;
  createdBy?: string;
  version?: number;
}

export interface ContactReference {
  name: string;
  phone?: string;
  email?: string;
  relation?: string;
}

export interface TransferReference {
  fromFacility?: string;
  toFacility?: string;
  transferDate?: string;
  method?: string;
}

export interface InformationSourceReference {
  field: string;
  sourceType: "witness" | "document" | "phone" | "other";
  details?: string;
  timestamp?: string;
  confidence?: number;
}
