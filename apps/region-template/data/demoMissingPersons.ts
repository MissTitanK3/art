import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { getMissingPersonSlug } from "@workspace/ui/lib/missing-persons";

const now = new Date();
const daysAgo = (count: number) => {
  const copy = new Date(now);
  copy.setDate(copy.getDate() - count);
  return copy.toISOString();
};

export const demoMissingPersons: DetaineeIntake[] = [
  {
    caseId: "CASE-2410-001",
    detentionDateTime: daysAgo(3),
    detentionLocation: "Oakland, CA",
    arrestingAgency: "ICE",
    witnessContacts: [
      {
        name: "Rosa Delgado",
        relation: "Witness",
        phone: "(510) 555-1098",
      },
    ],
    dispatcherContact: {
      name: "Jordan Smith",
      relation: "Dispatcher",
      email: "dispatch@ardwatch.org",
    },
    fullName: "Luis Hernandez",
    aliases: ["Luis H."],
    dateOfBirth: "1989-02-14",
    countryOfBirth: "Guatemala",
    pronouns: "he/him",
    languagesSpoken: ["Spanish", "English"],
    aNumber: "A204567809",
    lastKnownFacility: "Yuba County Jail",
    lastKnownCity: "Marysville, CA",
    statedReasonForDetention: "Alleged visa overstay",
    knownTransfers: [
      {
        fromFacility: "ICE Field Office, San Francisco",
        toFacility: "Yuba County Jail",
        transferDate: daysAgo(2),
        method: "van",
      },
    ],
    urgentNeeds: ["Medication for diabetes", "Legal representation"],
    familyContacts: [
      {
        name: "Maria Hernandez",
        relation: "Spouse",
        phone: "(510) 555-4411",
      },
    ],
    priorAttorney: "East Bay Legal Aid",
    preferredLegalAidOrgs: ["Immigrant Legal Resource Center"],
    interpreterNeeded: false,
    informationSources: [
      {
        field: "lastKnownFacility",
        sourceType: "phone",
        details: "Confirmed with facility intake desk",
        timestamp: daysAgo(1),
        confidence: 4,
      },
    ],
    lastUpdated: daysAgo(1),
    confidenceRating: 4,
    createdAt: daysAgo(3),
    createdBy: "dispatch_bot",
    version: 2,
  },
  {
    caseId: "CASE-2410-002",
    detentionDateTime: daysAgo(1),
    detentionLocation: "El Paso, TX",
    arrestingAgency: "CBP",
    witnessContacts: [
      {
        name: "Border Rights Watch",
        relation: "NGO Observer",
        email: "alerts@brw.net",
      },
    ],
    dispatcherContact: {
      name: "Amara Lee",
      relation: "Rapid Response Lead",
      phone: "(915) 555-9345",
    },
    fullName: "Unknown – traveling with minor child",
    aliases: ["Mother + Child case"],
    languagesSpoken: ["Spanish"],
    lastKnownFacility: "El Paso Processing Center",
    lastKnownCity: "El Paso, TX",
    statedReasonForDetention: "Title 8 expedited removal",
    belongingsLeftBehind: "All luggage seized",
    dependentsLeftBehind: "Minor child detained separately",
    urgentNeeds: ["Family reunification", "Pediatric medical review"],
    interpreterNeeded: true,
    informationSources: [
      {
        field: "urgentNeeds",
        sourceType: "witness",
        details: "Child coughing heavily during transfer",
        timestamp: daysAgo(1),
        confidence: 3,
      },
    ],
    lastUpdated: daysAgo(1),
    confidenceRating: 3,
    createdAt: daysAgo(1),
    createdBy: "dispatch_bot",
    version: 1,
  },
  {
    caseId: "CASE-2410-003",
    detentionDateTime: daysAgo(7),
    detentionLocation: "Queens, NY",
    arrestingAgency: "Police + ICE hold",
    witnessContacts: [],
    dispatcherContact: {
      name: "Nyasha Patel",
      relation: "Community Legal Liaison",
      email: "nyasha@ardny.org",
    },
    fullName: "Mei Lin",
    aliases: [],
    dateOfBirth: "1995-07-09",
    countryOfBirth: "China",
    pronouns: "she/her",
    languagesSpoken: ["Mandarin", "English"],
    aNumber: "A299874510",
    lastKnownFacility: "Hudson County Correctional Facility",
    lastKnownCity: "Kearny, NJ",
    statedReasonForDetention: "Administrative ICE hold after traffic stop",
    urgentNeeds: ["Dialysis coordination"],
    familyContacts: [
      {
        name: "Wen Lin",
        relation: "Parent",
        phone: "(917) 555-8822",
      },
    ],
    preferredLegalAidOrgs: ["Make the Road NY"],
    interpreterNeeded: false,
    informationSources: [
      {
        field: "urgentNeeds",
        sourceType: "phone",
        details: "Facility medical staff flagged need for dialysis",
        timestamp: daysAgo(6),
        confidence: 5,
      },
    ],
    lastUpdated: daysAgo(2),
    confidenceRating: 5,
    createdAt: daysAgo(7),
    createdBy: "nyc_dispatch",
    version: 3,
  },
  {
    caseId: "CASE-2410-004",
    detentionDateTime: daysAgo(9),
    detentionLocation: "Seattle, WA",
    arrestingAgency: "ICE",
    dispatcherContact: {
      name: "Owen Harris",
      relation: "Dispatcher",
      phone: "(206) 555-7731",
    },
    fullName: "Arjun Kapoor",
    dateOfBirth: "1984-11-01",
    countryOfBirth: "India",
    pronouns: "he/him",
    languagesSpoken: ["Hindi", "English"],
    lastKnownFacility: "Northwest Detention Center",
    lastKnownCity: "Tacoma, WA",
    statedReasonForDetention: "Visa overstay investigation",
    urgentNeeds: [],
    familyContacts: [
      {
        name: "Priya Kapoor",
        relation: "Sibling",
        email: "priya@example.com",
      },
    ],
    interpreterNeeded: false,
    informationSources: [
      {
        field: "lastKnownFacility",
        sourceType: "document",
        details: "ICE transfer notice",
        timestamp: daysAgo(8),
        confidence: 4,
      },
    ],
    lastUpdated: daysAgo(3),
    confidenceRating: 4,
    createdAt: daysAgo(9),
    createdBy: "dispatch_bot",
    version: 1,
  },
  {
    caseId: "CASE-2410-005",
    detentionDateTime: daysAgo(12),
    detentionLocation: "Chicago, IL",
    arrestingAgency: "ICE",
    dispatcherContact: {
      name: "Isabel Cruz",
      relation: "Community Partner",
      email: "isabel.cruz@solidaritynow.org",
    },
    fullName: "Raquel Alvarez",
    aliases: ["Rachel"],
    dateOfBirth: "1992-04-23",
    countryOfBirth: "Mexico",
    pronouns: "she/they",
    languagesSpoken: ["Spanish", "English"],
    lastKnownFacility: "Pulaski County Jail",
    lastKnownCity: "Little Rock, AR",
    statedReasonForDetention: "Transfer pending removal proceedings",
    knownTransfers: [
      {
        fromFacility: "McHenry County Jail",
        toFacility: "Pulaski County Jail",
        transferDate: daysAgo(4),
        method: "flight",
      },
    ],
    belongingsLeftBehind: "Personal medication, laptop, legal paperwork",
    urgentNeeds: ["Hormone therapy medication refill", "Attorney coordination"],
    familyContacts: [
      {
        name: "Sofia Alvarez",
        relation: "Partner",
        phone: "(312) 555-2010",
      },
    ],
    preferredLegalAidOrgs: ["NIJC", "Transgender Law Center"],
    interpreterNeeded: false,
    informationSources: [
      {
        field: "knownTransfers",
        sourceType: "document",
        details: "ICE transfer paperwork provided by attorney",
        timestamp: daysAgo(4),
        confidence: 4,
      },
    ],
    lastUpdated: daysAgo(2),
    confidenceRating: 4,
    createdAt: daysAgo(12),
    createdBy: "chicago_dispatch",
    version: 4,
  },
];

export function findMissingPersonBySlug(slug: string): DetaineeIntake | null {
  if (!slug) return null;
  return (
    demoMissingPersons.find(
      (record) => getMissingPersonSlug(record) === slug,
    ) ?? null
  );
}
