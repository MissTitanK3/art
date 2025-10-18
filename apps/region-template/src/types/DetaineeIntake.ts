/**
 * Intake document for locating and advocating for a detained individual.
 * Designed for integration with Always Ready Dispatch.
 */
export interface DetaineeIntake {
  // === A. Header: Case Metadata ===
  caseId: string; // internal dispatch ID
  detentionDateTime?: string; // ISO timestamp of detention
  detentionLocation?: string; // street / facility / city / state
  arrestingAgency?: string; // ICE, CBP, Police + ICE hold, etc.
  witnessContacts?: ContactInfo[]; // who saw the detention occur
  dispatcherContact?: ContactInfo; // person submitting this intake

  // === B. Subject Identification ===
  fullName?: string;
  aliases?: string[];
  dateOfBirth?: string; // YYYY-MM-DD
  countryOfBirth?: string;
  genderIdentity?: string;
  pronouns?: string;
  languagesSpoken?: string[];
  aNumber?: string; // Alien Registration Number (A123456789)
  photoUrl?: string;
  physicalDescription?: string;

  // === C. Detention Details ===
  lastKnownFacility?: string; // name of jail or ICE facility
  lastKnownCity?: string;
  arrestingOfficers?: string[];
  statedReasonForDetention?: string;
  knownTransfers?: TransferRecord[];
  belongingsLeftBehind?: string;
  dependentsLeftBehind?: string;

  // === D. Legal & Support Info ===
  familyContacts?: ContactInfo[];
  priorAttorney?: string;
  preferredLegalAidOrgs?: string[];
  interpreterNeeded?: boolean;
  urgentNeeds?: string[]; // e.g. medical, medication, childcare

  // === E. Verification Notes ===
  informationSources?: InfoSource[];
  lastUpdated?: string; // ISO timestamp
  confidenceRating?: number; // 1–5 overall data reliability

  // === System Metadata ===
  createdAt?: string;
  createdBy?: string;
  version?: number;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  relation?: string; // e.g. witness, family, dispatcher
}

export interface TransferRecord {
  fromFacility?: string;
  toFacility?: string;
  transferDate?: string;
  method?: string; // e.g. van, flight, unknown
}

export interface InfoSource {
  field: string; // which field this info applies to
  sourceType: 'witness' | 'document' | 'phone' | 'other';
  details?: string; // description or citation
  timestamp?: string;
  confidence?: number; // 1–5 scale
}
