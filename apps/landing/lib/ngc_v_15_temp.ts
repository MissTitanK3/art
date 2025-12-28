export type NGC = {
  preamble: Preamble;
  articles: Article[];
  epilogue: string;
};

export type Preamble = {
  forward: string;
  subTitle: string;
  points: {
    id: string;
    content: string;
  }[];
};

export type Article = {
  id: string; // "I", "II", "III", etc.
  title: string; // "Foundations of Governance"
  sections: Section[];
};

export type Section = {
  id: string; // "1", "2", etc.
  title: string; // "Popular Sovereignty"
  content: Content[]; // Paragraphs
};

export type Content = {
  preface: string;
  statement: string;
  subSections?: SubSection[];
};

export type SubSection = {
  id: string; // "a", "b", etc.
  title?: string;
  content: string;
};

export const ngcData_v15: Partial<NGC> = {
  preamble: {
    forward:
      'We, the people of diverse communities-geographic, cultural, and ideological-united by a shared commitment to human dignity, equity, and ecological responsibility, establish this Constitution as a living document to uphold the inalienable rights of all individuals and promote the common good for present and future generations.',
    subTitle:
      'Mindful of humanity’s democratic evolution and ongoing struggles for justice, we seek to form a society where:',
    points: [
      {
        id: `I`,
        content: `Power flows from the people upward, ensuring governance remains accountable and participatory.`,
      },
      {
        id: `II`,
        content:
          'Government structures protect the vulnerable while promoting liberty, autonomy, and opportunity for all.',
      },
      {
        id: `III`,
        content:
          'Natural resources and the environment are safeguarded as shared assets fundamental to life and cultural continuity.',
      },
      {
        id: `IV`,
        content:
          'Conflicts are resolved through restorative principles, prioritizing reconciliation over punitive measures.',
      },
      {
        id: `V`,
        content:
          'Technological advancements serve the public good, ensuring transparency, privacy, and equitable access.',
      },
      {
        id: `VI`,
        content: 'Governance is continually evaluated and improved to meet the evolving needs of society.',
      },
      {
        id: `VII`,
        content: 'Civic education and public engagement ensure an informed, empowered population.',
      },
      {
        id: `VIII`,
        content:
          'Safeguards against authoritarianism and fascism ensure that power is never concentrated in a single entity or ideology.',
      },
      {
        id: `IX`,
        content:
          'Economic and political structures are protected from corporate control and structural capture, ensuring genuine democratic plurality.',
      },
      {
        id: `X`,
        content:
          'Governance shall be transparent, decentralized, and adaptable, ensuring rights and responsibilities are upheld under shared principles of freedom, equity, and mutual care.',
      },
    ],
  },
  articles: [
    {
      id: 'I',
      title: 'Foundations of Governance',
      sections: [
        {
          id: '0',
          title: 'Definitions & Interpretation',
          content: [
            {
              preface: 'Community:',
              statement:
                'A Community is a self-organizing, democratic body of residents formed by geographic proximity, cultural affinity, or shared purpose, that meets minimum rights and transparency requirements under this Constitution. Only Communities with defined geographic jurisdiction may exercise coercive public powers; non-territorial Communities may govern internal association matters only, and may not deny constitutional rights to residents.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Must adopt a public charter defining membership boundaries, decision procedures, fiscal transparency, and rights protections consistent with this Constitution.',
                },
                {
                  id: 'b',
                  content:
                    'Must provide equal political participation for Adult Residents within its jurisdiction and may not exclude eligible residents through discrimination, intimidation, or arbitrary procedures.',
                },
                {
                  id: 'c',
                  content: 'May not use Community status to evade constitutional rights, oversight, or anti-capture rules.',
                },
                {
                  id: 'd',
                  content:
                    'Disputes about Community status, boundaries, or compliance receive expedited review by the Federal High Court upon petition by affected residents or referral by the Public Review Commission.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Community is a locally self-governing group that must run democratically, protect rights, and cannot use its status to dodge oversight.',
                },
              ],
            },
            {
              preface: 'Region:',
              statement:
                'A Region is a federation of one or more Communities organized for coordination of infrastructure, environmental stewardship, public services, and dispute resolution at a scale larger than a single Community.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Must adopt a public charter defining member Communities, delegated functions, funding mechanisms, and inter-community dispute procedures consistent with this Constitution.',
                },
                {
                  id: 'b',
                  content: 'Regional boundaries and membership may not be manipulated to dilute representation, evade rights enforcement, or entrench power.',
                },
                {
                  id: 'c',
                  content: 'Disputes about Regional status, boundaries, or compliance receive expedited review by the Federal High Court.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Region is a coordination layer made of Communities that cannot rig boundaries or membership to entrench power or evade rights.',
                },
              ],
            },
            {
              preface: 'Adult Resident:',
              statement:
                'An Adult Resident is any resident aged 18 or older with full voting rights unless a court determines incapacity through due process and a least-restrictive standard. Residence standards and proof may be defined by law, provided they are non-discriminatory and do not impose undue burden.',
              subSections: [
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'An Adult Resident is anyone 18 or older who lives there and can vote, unless a court narrowly finds incapacity with due process.',
                },
              ],
            },
            {
              preface: 'Electorate:',
              statement: 'The Electorate is the set of Adult Residents eligible to vote in the relevant jurisdiction at the time the vote is held.',
              subSections: [
                {
                  id: 'a',
                  content: 'Eligibility rules must be viewpoint-neutral, non-discriminatory, and administered uniformly.',
                },
                {
                  id: 'b',
                  content:
                    'Administrative barriers to voting, including unreasonable documentation demands, unequal access, or discriminatory purge practices, are prohibited.',
                },
                {
                  id: 'c',
                  content:
                    'Disputes about eligibility, registration, or access must have a timely cure process and an appeal path, with expedited judicial review for rights-impacting disputes.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'The Electorate is the set of eligible adult residents for that vote, and the rules must be fair, uniform, and easy to challenge and fix.',
                },
              ],
            },
            {
              preface: 'Valid Ballots Cast:',
              statement:
                'Valid Ballots Cast are ballots that satisfy verification and anti-fraud procedures established by law and do not contain disqualifying defects. Non-participation does not count as a ballot cast.',
              subSections: [
                {
                  id: 'a',
                  content: 'Verification and defect rules must be neutral, accessible, and accompanied by a reasonable opportunity to cure non-fraud defects.',
                },
                {
                  id: 'b',
                  content:
                    'Disqualification rules must be narrowly tailored to prevent fraud or preserve election integrity, and may not be used to suppress participation.',
                },
                {
                  id: 'c',
                  content: 'Audit, recount, and challenge procedures must be transparent and subject to judicial review.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'These are ballots that meet neutral integrity rules, and people must get a fair chance to fix non-fraud mistakes.',
                },
              ],
            },
            {
              preface: 'Political Party:',
              statement:
                'A Political Party is any organization that nominates candidates, endorses candidates as an organization, coordinates electoral activity, or materially directs election-related spending to influence governance decisions.',
              subSections: [
                {
                  id: 'a',
                  content:
                    '"Political Party" includes materially controlled affiliates and coordinated entities acting as functional arms of the party, as defined by law consistent with this Constitution.',
                },
                {
                  id: 'b',
                  content: 'Neutral civic associations that do not coordinate electoral activity as defined here are not Political Parties.',
                },
                {
                  id: 'c',
                  content:
                    'Issue advocacy that does not endorse or oppose an identified candidate and does not coordinate spending with a candidate or party is not, by itself, Political Party activity.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Political Party is any organized group that runs or coordinates election influence, including controlled affiliates that function as part of it.',
                },
              ],
            },
            {
              preface: 'Corporate Entity:',
              statement:
                'A Corporate Entity is any for-profit entity or other legal person that engages in commerce, including subsidiaries and controlled affiliates, and including materially compensated contractors acting on its behalf as defined by law consistent with this Constitution.',
              subSections: [
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Corporate Entity is any business-like legal actor involved in commerce, including subsidiaries and paid agents acting for it.',
                },
              ],
            },
            {
              preface: 'Control:',
              statement:
                'Control is direct or indirect power to materially direct governance outcomes, including through majority ownership, voting rights, contractual leverage, dominant funding, media concentration, lobbying spend, procurement dependence, platform gatekeeping, coordinated political spending, or other material influence as defined by law consistent with this Constitution.',
              subSections: [
                {
                  id: 'a',
                  content:
                    '"Materially direct" means influence sufficient to impair democratic accountability, pluralism, or rights enforcement, or to determine outcomes in appointments, procurement, enforcement, or elections.',
                },
                {
                  id: 'b',
                  content: 'Control assessments must consider de facto influence, coordinated action, and intermediary arrangements, not only formal ownership or titles.',
                },
                {
                  id: 'c',
                  content: 'Attempts to evade Control rules through shells, contract splitting, pass-through entities, or coordinated affiliates are treated as a single controlling interest.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Control means real-world power to sway government outcomes, even indirectly, and shell games do not avoid the rule.',
                },
              ],
            },
            {
              preface: 'Systemic Failure:',
              statement:
                'A Systemic Failure is a persistent, documented inability of a public institution to meet constitutional obligations, evidenced by repeated rights violations, audit findings, corruption, discriminatory outcomes, or material service collapse.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'A finding of Systemic Failure may be made by the Public Review Commission, an independent audit designated by law, or a court of competent jurisdiction.',
                },
                {
                  id: 'b',
                  content:
                    'Findings must be supported by publicly stated criteria, evidence standards, and a reasoned report, with redactions only as strictly necessary for privacy, safety, or active investigations.',
                },
                {
                  id: 'c',
                  content:
                    'Institutions subject to a Systemic Failure finding must receive a defined corrective pathway and remain subject to ongoing public reporting and judicial review.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Systemic Failure means a proven, repeated breakdown of constitutional duties, and any finding must be evidence-based, public, and reviewable.',
                },
              ],
            },
            {
              preface: 'Emergency:',
              statement:
                'An Emergency is a temporary condition posing an immediate and significant threat to public safety, national security, or ecological stability, where ordinary legal processes are insufficient for timely response.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Emergency declarations and permissible emergency measures are governed by Article VIII and must be specific as to scope, geography, duration, and invoked powers.',
                },
                {
                  id: 'b',
                  content:
                    'Emergency authority may not be used to suspend elections, abolish courts, eliminate oversight bodies, authorize mass surveillance, permit indefinite detention, or censor political dissent.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'An Emergency is a short-term crisis that justifies limited extra powers, but it can never be used to suspend democracy, courts, or core freedoms.',
                },
              ],
            },
            {
              preface: 'Ecological Stability:',
              statement:
                'Ecological Stability means measurable conditions within scientifically defined planetary boundaries, including climate stability, biodiversity, freshwater availability, soil health, and pollution thresholds.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Metrics and thresholds used for legal determinations must rely on the best available scientific evidence and be published with methods and uncertainty ranges.',
                },
                {
                  id: 'b',
                  content:
                    'Where metrics are set or updated by law, the process must be transparent, evidence-based, and subject to judicial review for arbitrariness or capture.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Ecological Stability means staying within science-based environmental limits, using transparent metrics that can be challenged in court.',
                },
              ],
            },
            {
              preface: 'Trained Civic Pool:',
              statement:
                'A Trained Civic Pool is a publicly administered roster of eligible Adult Residents who have completed standardized training and verification required for service in designated civic roles, including sortition-based offices and mixed-selection bodies.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'The pool must be administered by an independent public administrator institutionally separate from the bodies that draw from it, overseen by the Public Review Commission, and audited annually.',
                },
                {
                  id: 'b',
                  content:
                    'Enrollment must be voluntary, free, accessible, and non-discriminatory, with reasonable identity verification to prevent duplication and fraud.',
                },
                {
                  id: 'c',
                  content:
                    'Minimum training must cover constitutional duties, conflicts and recusals, anti-corruption, privacy, records obligations, and anti-intimidation reporting, with required accommodations.',
                },
                {
                  id: 'd',
                  content: 'Tampering, coercion, or bribery intended to influence pool composition or selection outcomes is a grave constitutional offense.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'This is a voluntary, accessible list of trained people eligible for certain civic roles, protected against tampering and coercion.',
                },
              ],
            },
            {
              preface: 'Major Vendor:',
              statement:
                'A Major Vendor is a Corporate Entity, including subsidiaries, controlled affiliates, or materially compensated contractors, that meets any threshold defined below within a jurisdiction in any rolling twelve-month period, or as an average across the prior three fiscal years:',
              subSections: [
                {
                  id: '1',
                  content:
                    'Holds public contracts with total value equal to or exceeding the greater of one percent of total jurisdiction procurement spend or an inflation-indexed monetary threshold defined by law.',
                },
                {
                  id: '2',
                  content:
                    'Provides twenty percent or more of spend within a procurement category designated by law as essential, safety-critical, or rights-impacting.',
                },
                {
                  id: '3',
                  content:
                    'Holds thirty percent or more market share in a procurement-relevant market, or is found by an independent competition authority or court to possess dominant market power.',
                },
                {
                  id: '4',
                  content:
                    'Is designated by independent audit as creating material single-point-of-failure risk due to concentration, sole-source dependency, platform gatekeeping, or lack of viable substitutes.',
                },
                {
                  id: 'a',
                  content: 'Anti-evasion rules aggregate affiliates and coordinated contractors and treat contract splitting and pass-through arrangements as a single vendor relationship.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Major Vendor is a big or dominant contractor that creates capture or single-point-of-failure risk, and affiliates or split contracts still count together.',
                },
              ],
            },
            {
              preface: 'Senior:',
              statement:
                'A Senior role is a role held by an individual within a Political Party, Corporate Entity, union, nonprofit, or government body that meets any criterion below within the prior twenty-four months:',
              subSections: [
                {
                  id: '1',
                  content:
                    'Has final or substantial decision-making authority over policy, enforcement priorities, election administration, procurement, budgeting, executive hiring, litigation strategy, regulatory strategy, or large-scale public communications.',
                },
                {
                  id: '2',
                  content:
                    'Reports directly to a chief executive, executive committee, board, or equivalent governing body, or supervises a unit with authority over rights-impacting decisions.',
                },
                {
                  id: '3',
                  content:
                    'Holds a title customarily indicating executive authority, including director, commissioner, chief, vice president, partner, general counsel, head of public policy, head of government relations, head of compliance, or equivalent titles defined by law, creating a rebuttable presumption of seniority.',
                },
                {
                  id: '4',
                  content:
                    'Receives total compensation in the top five percent within the organization in the relevant jurisdiction, or above an inflation-indexed public threshold defined by law, provided compensation is not the sole basis for designation.',
                },
                {
                  id: '5',
                  content:
                    'Is found by independent audit or court to exercise material influence over governance outcomes through funding control, media control, platform gatekeeping, or procurement leverage.',
                },
                {
                  id: 'a',
                  content: 'Seniority determinations consider de facto authority, including consulting and intermediary roles, and may not be evaded by title manipulation.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Senior is someone with substantial decision power or influence in an organization, even if they try to hide it behind titles or contracts.',
                },
              ],
            },
            {
              preface: 'Interpretation:',
              statement:
                'Interpretation means rights and duties in this Constitution are to be interpreted in good faith to maximize human dignity, democratic accountability, and ecological stewardship, and to minimize arbitrary power.',
              subSections: [
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Read this Constitution to expand human dignity, democracy, and environmental care, and to reduce arbitrary power.',
                },
              ],
            },
            {
              preface: 'Severability:',
              statement:
                'Severability means if any provision is held invalid, remaining provisions remain in force unless they are inseparable.',
              subSections: [
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'If one part is struck down, the rest still applies unless it cannot function without the invalid part.',
                },
              ],
            },
            {
              preface: 'Essential, Safety-Critical, or Rights-Impacting Procurement Category:',
              statement:
                'An Essential, Safety-Critical, or Rights-Impacting Procurement Category is a procurement classification designated under law for goods or services whose failure, denial, manipulation, or capture would foreseeably cause substantial harm to life, health, safety, constitutional rights, democratic processes, or continuity of core public services.',
              subSections: [
                {
                  id: 'a',
                  content: 'Plain meaning: This is a label for goods or services where failure or capture would predictably harm life, rights, democracy, or core public services.',
                },
                {
                  id: 'b',
                  title: 'Minimum Criteria',
                  content:
                    'A category qualifies if it meets one or more of the following: supports delivery of constitutionally guaranteed basic services (including healthcare, education, water, food systems, housing support, emergency response, or essential utilities); supports election administration, civic identity systems, public records systems, courts, oversight bodies, or other core democratic infrastructure; involves sensitive personal data, communications, surveillance-adjacent capabilities, identity verification, or large-scale data processing used for public decision-making; provides safety-critical infrastructure (including energy, water treatment, transportation, communications backbone, disaster response logistics, or public health supply chains); creates material single-point-of-failure risk due to concentration, sole-source dependency, switching barriers, or vendor lock-in; has a demonstrated history of fraud, corruption, price-gouging, coercive leverage, discriminatory outcomes, or systemic service collapse in the jurisdiction. Plain meaning: It qualifies if it is necessary for basic services, democratic infrastructure, sensitive data use, safety-critical systems, high concentration risk, or a proven pattern of abuse or collapse.',
                },
                {
                  id: 'c',
                  title: 'Designation Process',
                  content:
                    'Designations must be made through a public process with published criteria, public notice and comment, and a written findings report explaining why the designation is necessary, proportionate, and least restrictive. Plain meaning: The government must publicly justify the label using clear criteria, public input, and a written explanation.',
                },
                {
                  id: 'd',
                  title: 'Review and Sunset',
                  content:
                    'Each designation must be reviewed at least every three years and automatically sunsets unless renewed by written findings using the criteria in this subsection. Plain meaning: The label must be re-checked regularly and expires automatically unless renewed with written justification.',
                },
                {
                  id: 'e',
                  title: 'Anti-Evasion Rule',
                  content:
                    'A procurement category may not be subdivided, renamed, or reclassified to avoid constitutional thresholds, conflict-of-interest rules, audit duties, or Major Vendor determinations. Where subdivision occurs, thresholds apply to the combined functional category. Plain meaning: You cannot rename or split a category to dodge thresholds or oversight; the functional whole still counts.',
                },
                {
                  id: 'f',
                  title: 'Dispute Resolution',
                  content:
                    'Any Adult Resident, relevant oversight body, or affected vendor may challenge a designation or non-designation. Challenges receive expedited review by the Federal High Court, which may order re-designation, consolidation, or other tailored remedies consistent with this Constitution. Plain meaning: People, oversight bodies, and affected vendors can challenge the label quickly, and the top court can order fixes.',
                },
              ],
            },
            {
              preface: 'Resident:',
              statement:
                'A Resident is a person whose primary living presence is within the relevant jurisdiction, as defined by law consistent with this Constitution.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Residence rules must be non-discriminatory, accessible, and may not be conditioned on property ownership, employment status, incarceration history, or housing status.',
                },
                {
                  id: 'b',
                  content:
                    'No Resident may be denied constitutional protections due to lack of fixed address, immigration status, or inability to produce burdensome documentation, provided identity and residency may be reasonably verified through least-restrictive means.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'A Resident lives there in real life, and the rules cannot be designed to exclude poor, unhoused, or disfavored people.',
                },
              ],
            },
            {
              preface: 'Jurisdiction:',
              statement:
                'Jurisdiction means the scope of lawful authority to govern, enforce, tax, adjudicate, or administer public functions.',
              subSections: [
                {
                  id: 'a',
                  content: 'Jurisdiction may be territorial (defined geographic boundaries) or functional (a defined public function authorized by law).',
                },
                {
                  id: 'b',
                  content:
                    'No body may expand its Jurisdiction by implication, contract, or private agreement; Jurisdiction must be granted by this Constitution or by law consistent with it.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Jurisdiction is the legally granted scope of power, and it cannot be self-expanded.',
                },
              ],
            },
            {
              preface: 'Rights-Impacting Decision:',
              statement:
                "A Rights-Impacting Decision is any public or publicly delegated decision that materially affects a person's liberty, bodily autonomy, privacy, political participation, access to courts, housing, employment benefits, education, healthcare, essential services, legal status, or exposure to surveillance or force.",
              subSections: [
                {
                  id: 'a',
                  content:
                    'A decision is Rights-Impacting if it denies, conditions, delays, or burdens access to a protected right or essential service, increases exposure to coercive enforcement, or uses personal data to make eligibility, prioritization, or enforcement determinations.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: "If a decision can meaningfully change someone's rights, safety, or access to essentials, it is rights-impacting.",
                },
              ],
            },
            {
              preface: 'Competency-Based Evaluation:',
              statement:
                'A Competency-Based Evaluation is an assessment of skills and ethical fitness required for a specific public role, conducted under published standards, validated for relevance and bias, with accommodations, an appeal path, and judicial review for arbitrariness or discrimination.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Competency standards must be viewpoint-neutral and may not use party affiliation, ideology, protected characteristics, or proxy measures.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Competency checks must be fair, transparent, and not a political gate.',
                },
              ],
            },
            {
              preface: 'Competency Standards Administrator:',
              statement:
                'Where competency evaluations are required for public roles, the standards and assessments must be administered by an independent body designated by law.',
              subSections: [
                {
                  id: 'a',
                  content: 'Must publish rubrics and scoring criteria.',
                },
                {
                  id: 'b',
                  content: 'Must conduct periodic bias and validity audits.',
                },
                {
                  id: 'c',
                  content: 'Must provide public reporting of aggregate outcomes.',
                },
                {
                  id: 'd',
                  content: 'Must guarantee appeal and retest rights.',
                },
                {
                  id: 'e',
                  content: 'Must include protections against capture by private credentialing monopolies.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Competency checks must be run by an independent, transparent administrator with audits, appeals, and anti-monopoly safeguards.',
                },
              ],
            },
            {
              preface: 'Internal Association Matter:',
              statement:
                'An Internal Association Matter is a rule or decision of a non-territorial Community or civic association that governs only voluntary membership, internal governance, and private association activities.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Internal Association Matters may not determine access to public services, housing, employment, education, healthcare, public spaces, voting, legal process, or safety services, and may not impose coercive penalties.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Private groups can govern themselves, but cannot become shadow-government.',
                },
              ],
            },
            {
              preface: 'Prior Restraint:',
              statement: 'Prior Restraint means an order preventing publication or speech before it occurs.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Prior Restraint is prohibited except where a court finds, by clear and convincing evidence, a specific and imminent threat of grave bodily harm that cannot be mitigated by less restrictive means, and the order is narrowly scoped and time-limited.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Pre-banning speech is basically forbidden, with a tiny emergency exception.',
                },
              ],
            },
            {
              preface: 'Large-Scale Corruption:',
              statement:
                'Large-Scale Corruption means corruption involving systemic procurement fraud, capture of enforcement or oversight bodies, coordinated bribery or coercion affecting elections or rights enforcement, or corruption whose financial scale or institutional impact is designated by law under objective thresholds and subject to judicial review.',
              subSections: [
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'This is corruption big enough to distort governance outcomes.',
                },
              ],
            },
            {
              preface: 'Terrorism:',
              statement:
                'Terrorism means intentional violence or credible violent threat against civilians or noncombatants to coerce public action or governmental decision-making, as defined by law consistent with human rights and subject to strict judicial review.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Terrorism definitions may not be expanded to criminalize lawful protest, labor action, civil disobedience, journalism, or political opposition.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Terrorism is real violence aimed at coercion, not a label for dissent.',
                },
              ],
            },
            {
              preface: 'Public Body:',
              statement:
                'A Public Body is any entity that exercises governmental authority, performs a function created by law, administers public funds, or is authorized to make, enforce, or implement rules or decisions binding on Residents, including agencies, councils, commissions, courts, authorities, and publicly created corporations, whether at Community, Regional, or Federated level.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'A Public Body includes any private or nonprofit actor to the extent it performs a Public Function under delegation, contract, license, or mandate.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'If it acts like government or performs government work, it must follow the Constitution.',
                },
              ],
            },
            {
              preface: 'Public Function:',
              statement:
                'A Public Function is any function that is constitutionally required, legally mandated, or publicly delegated, including election administration; courts and dispute resolution; detention and enforcement; provision or administration of essential services; rights-impacting eligibility determinations; management of public records; public procurement; and any function involving coercive power, surveillance authority, or Rights-Impacting Decisions.',
              subSections: [
                {
                  id: 'a',
                  content:
                    "A function remains a Public Function even if performed by a contractor, platform, nonprofit, union, cooperative, or other private actor, where the actor's decisions materially affect access to rights, services, protections, or legal status.",
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: 'Government cannot outsource a duty and escape constitutional limits.',
                },
              ],
            },
            {
              preface: 'Essential Service:',
              statement:
                'An Essential Service is any service whose denial, failure, manipulation, or capture would foreseeably cause substantial harm to life, health, safety, constitutional rights, democratic processes, or continuity of core public services, including healthcare, emergency response, education, water, sanitation, food systems, shelter access, power and utilities, communications backbone, and rights-impacting public administration systems as defined by law consistent with this Constitution.',
              subSections: [
                {
                  id: 'a',
                  content:
                    'Where the term "essential services" is used as a basis to limit rights, it must be interpreted narrowly and subject to strict scrutiny, with written findings demonstrating necessity, proportionality, and least-restrictive means.',
                },
                {
                  id: 'b',
                  content:
                    'For avoidance of doubt, when "Essential Service" is used as a basis to limit rights, it is treated as coextensive with the Essential, Safety-Critical, or Rights-Impacting Procurement Category definition in this Section.',
                },
                {
                  id: 'plain',
                  title: 'Plain meaning',
                  content: '"Essential" means life, safety, rights, and core governance, not convenience.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  epilogue: '',
};
