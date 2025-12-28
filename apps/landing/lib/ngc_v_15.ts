/* eslint-disable */
// Auto-generated from Next-Generation Constitution (Version 15.0) markdown source.
// Plain-text content only. No markdown formatting.
//
// Recommended rendering approach:
// - Traverse NGC_V15.root children.
// - Render blocks in order.
// - Treat node.label as a display prefix (e.g. "Article I", "Section 0").
// - Use node.kind to decide UI chrome.

export type NGCHeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type NGCBlock = NGCParagraphBlock | NGCKeyValueBlock | NGCListBlock | NGCQuoteBlock | NGCHrBlock;

export interface NGCParagraphBlock {
  type: 'p';
  text: string;
}

export interface NGCKeyValueBlock {
  type: 'kv';
  key: string;
  value: string;
}

export interface NGCListItem {
  text: string;
  /** Optional nested blocks tied to this list item. Usually nested lists or supporting paragraphs. */
  blocks?: NGCBlock[];
}

export interface NGCListBlock {
  type: 'list';
  ordered: boolean;
  items: NGCListItem[];
}

export interface NGCQuoteBlock {
  type: 'quote';
  text: string;
}

export interface NGCHrBlock {
  type: 'hr';
}

export type NGCNodeKind = 'root' | 'preamble' | 'article' | 'section' | 'subsection' | 'topic';

export interface NGCNode {
  id: string;
  kind: NGCNodeKind;
  level: NGCHeadingLevel;
  /** Display label like "Article I", "Section 0", "Subsection A". Null when not present. */
  label: string | null;
  /** Human title without numbering label. */
  title: string;
  blocks: NGCBlock[];
  children: NGCNode[];
}

export interface NGCDocumentMeta {
  sourceTitle: string;
  version: string;
  compiledRevisionDate: string; // YYYY-MM-DD
}

export interface NGCDocument {
  meta: NGCDocumentMeta;
  root: NGCNode;
}

/** Depth-first traversal. */
export function walkNodes(root: NGCNode, fn: (node: NGCNode) => void): void {
  fn(root);
  for (const child of root.children) walkNodes(child, fn);
}

/** Builds an id -> node index for fast lookup in TSX. */
export function buildNodeIndex(root: NGCNode): Record<string, NGCNode> {
  const index: Record<string, NGCNode> = {};
  walkNodes(root, (n) => {
    index[n.id] = n;
  });
  return index;
}

/** Convenience: returns all direct children matching a kind. */
export function childrenOfKind(node: NGCNode, kind: NGCNodeKind): NGCNode[] {
  return node.children.filter((c) => c.kind === kind);
}

export const NGC_V15: NGCDocument = {
  meta: {
    version: '15.0',
    compiledRevisionDate: '2025-12-27',
    sourceTitle: 'Next-Generation Constitution',
  },
  root: {
    id: 'ngc-v15',
    kind: 'root',
    level: 0,
    title: 'Next-Generation Constitution',
    label: null,
    blocks: [],
    children: [
      {
        id: 'next-generation-constitution',
        kind: 'topic',
        level: 1,
        label: null,
        title: 'Next-Generation Constitution',
        blocks: [],
        children: [],
      },
      {
        id: 'preamble',
        kind: 'preamble',
        level: 1,
        label: null,
        title: 'Preamble',
        blocks: [
          {
            type: 'p',
            text: 'We, the people of diverse communities-geographic, cultural, and ideological-united by a shared commitment to human dignity, equity, and ecological responsibility, establish this Constitution as a living document to uphold the inalienable rights of all individuals and promote the common good for present and future generations.',
          },
          {
            type: 'p',
            text: 'Mindful of humanity’s democratic evolution and ongoing struggles for justice, we seek to form a society where:',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              {
                text: 'Power flows from the people upward, ensuring governance remains accountable and participatory.',
              },
              {
                text: 'Government structures protect the vulnerable while promoting liberty, autonomy, and opportunity for all.',
              },
              {
                text: 'Natural resources and the environment are safeguarded as shared assets fundamental to life and cultural continuity.',
              },
              {
                text: 'Conflicts are resolved through restorative principles, prioritizing reconciliation over punitive measures.',
              },
              {
                text: 'Technological advancements serve the public good, ensuring transparency, privacy, and equitable access.',
              },
              {
                text: 'Governance is continually evaluated and improved to meet the evolving needs of society.',
              },
              {
                text: 'Civic education and public engagement ensure an informed, empowered population.',
              },
              {
                text: 'Safeguards against authoritarianism and fascism ensure that power is never concentrated in a single entity or ideology.',
              },
              {
                text: 'Economic and political structures are protected from corporate control and structural capture, ensuring genuine democratic plurality.',
              },
              {
                text: 'Governance shall be transparent, decentralized, and adaptable, ensuring rights and responsibilities are upheld under shared principles of freedom, equity, and mutual care.',
              },
            ],
          },
        ],
        children: [
          {
            id: 'article-i-foundations-of-governance',
            kind: 'article',
            level: 2,
            label: 'Article I',
            title: 'Foundations of Governance',
            blocks: [],
            children: [
              {
                id: 'section-0-definitions-interpretation',
                kind: 'section',
                level: 3,
                label: 'Section 0',
                title: 'Definitions & Interpretation',
                blocks: [
                  {
                    type: 'p',
                    text: 'For purposes of this Constitution:',
                  },
                ],
                children: [
                  {
                    id: 'community',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Community',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Community is a self-organizing, democratic body of residents formed by geographic proximity, cultural affinity, or shared purpose, that meets minimum rights and transparency requirements under this Constitution. Only Communities with defined geographic jurisdiction may exercise coercive public powers; non-territorial Communities may govern internal association matters only, and may not deny constitutional rights to residents.',
                      },
                      {
                        type: 'p',
                        text: 'A Community must adopt a public charter defining membership boundaries, decision procedures, fiscal transparency, and rights protections consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: 'A Community must provide equal political participation for Adult Residents within its jurisdiction and must not exclude eligible residents through discrimination, intimidation, or arbitrary procedures.',
                      },
                      {
                        type: 'p',
                        text: 'Community status may not be used to evade constitutional rights, oversight, or anti-capture rules.',
                      },
                      {
                        type: 'p',
                        text: 'Disputes as to Community status, boundaries, or compliance are subject to expedited review by the Federal High Court upon petition by affected residents or referral by the Public Review Commission.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'A Community is a locally self-governing group that must run democratically, protect rights, and cannot use its status to dodge oversight.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'region',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Region',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Region is a federation of one or more Communities organized for coordination of infrastructure, environmental stewardship, public services, and dispute resolution at a scale larger than a single Community.',
                      },
                      {
                        type: 'p',
                        text: 'A Region must adopt a public charter defining member Communities, delegated functions, funding mechanisms, and inter-community dispute procedures consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: 'Regional boundaries and membership may not be manipulated to dilute representation, evade rights enforcement, or entrench power.',
                      },
                      {
                        type: 'p',
                        text: 'Disputes as to Regional status, boundaries, or compliance are subject to expedited review by the Federal High Court.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'A Region is a group of Communities that work together on bigger issues, and it cannot rig its boundaries or members to dodge rights or entrench power.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'adult-resident',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Adult Resident',
                    blocks: [
                      {
                        type: 'p',
                        text: 'An Adult Resident is any resident aged 18 or older. Adult Residents have full voting rights unless a court determines incapacity through due process and a least-restrictive standard. Residence standards and proof may be defined by law, provided they are non-discriminatory and do not impose undue burden.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'An Adult Resident is anyone 18+ who lives there and can vote, unless a court narrowly finds incapacity with due process.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'electorate',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Electorate',
                    blocks: [
                      {
                        type: 'p',
                        text: 'The Electorate is the set of Adult Residents eligible to vote in the relevant jurisdiction at the time the vote is held.',
                      },
                      {
                        type: 'p',
                        text: 'Eligibility rules must be viewpoint-neutral, non-discriminatory, and administered uniformly.',
                      },
                      {
                        type: 'p',
                        text: 'Administrative barriers to voting, including unreasonable documentation demands, unequal access, or discriminatory purge practices, are prohibited.',
                      },
                      {
                        type: 'p',
                        text: 'Disputes about eligibility, registration, or access must have a timely cure process and an appeal path, with expedited judicial review for rights-impacting disputes.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'The Electorate is the set of eligible adult residents for that vote, and the rules must be fair, uniform, and easy to challenge and fix.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'valid-ballots-cast',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Valid Ballots Cast',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Valid Ballots Cast are ballots that satisfy verification and anti-fraud procedures established by law and do not contain disqualifying defects. Non-participation does not count as a ballot cast.',
                      },
                      {
                        type: 'p',
                        text: 'Verification and defect rules must be neutral, accessible, and accompanied by a reasonable opportunity to cure non-fraud defects.',
                      },
                      {
                        type: 'p',
                        text: 'Disqualification rules must be narrowly tailored to prevent fraud or preserve election integrity, and may not be used to suppress participation.',
                      },
                      {
                        type: 'p',
                        text: 'Audit, recount, and challenge procedures must be transparent and subject to judicial review.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'These are ballots that meet neutral integrity rules, and people must get a fair chance to fix non-fraud mistakes.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'political-party',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Political Party',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Political Party is any organization that nominates candidates, endorses candidates as an organization, coordinates electoral activity, or materially directs election-related spending to influence governance decisions.',
                      },
                      {
                        type: 'p',
                        text: '“Political Party” includes materially controlled affiliates and coordinated entities acting as functional arms of the party, as defined by law consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: 'Neutral civic associations that do not coordinate electoral activity as defined herein are not Political Parties.',
                      },
                      {
                        type: 'p',
                        text: 'Issue advocacy that does not endorse or oppose an identified candidate and does not coordinate spending with a candidate or party shall not, by itself, constitute Political Party activity.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'A Political Party is any organized group that runs or coordinates election influence, including controlled affiliates that function as part of it.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'corporate-entity',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Corporate Entity',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Corporate Entity is any for-profit entity or other legal person that engages in commerce, including subsidiaries and controlled affiliates, and including materially compensated contractors acting on its behalf as defined by law consistent with this Constitution.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'A Corporate Entity is any business-like legal actor involved in commerce, including subsidiaries and paid agents acting for it.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'control',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Control',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Control is direct or indirect power to materially direct governance outcomes, including through majority ownership, voting rights, contractual leverage, dominant funding, media concentration, lobbying spend, procurement dependence, platform gatekeeping, coordinated political spending, or other material influence as defined by law consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: '“Materially direct” means influence sufficient to impair democratic accountability, pluralism, or rights enforcement, or to determine outcomes in appointments, procurement, enforcement, or elections.',
                      },
                      {
                        type: 'p',
                        text: 'Control assessments must consider de facto influence, coordinated action, and intermediary arrangements, not only formal ownership or titles.',
                      },
                      {
                        type: 'p',
                        text: 'Attempts to evade Control rules through shells, contract splitting, pass-through entities, or coordinated affiliates shall be treated as a single controlling interest.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'Control means real-world power to sway government outcomes, even indirectly, and shell games do not avoid the rule.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'systemic-failure',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Systemic Failure',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Systemic Failure is a persistent, documented inability of a public institution to meet constitutional obligations, evidenced by repeated rights violations, audit findings, corruption, discriminatory outcomes, or material service collapse.',
                      },
                      {
                        type: 'p',
                        text: 'A finding of Systemic Failure may be made by the Public Review Commission, an independent audit designated by law, or a court of competent jurisdiction.',
                      },
                      {
                        type: 'p',
                        text: 'Findings must be supported by publicly stated criteria, evidence standards, and a reasoned report, with redactions only as strictly necessary for privacy, safety, or active investigations.',
                      },
                      {
                        type: 'p',
                        text: 'Institutions subject to a Systemic Failure finding must receive a defined corrective pathway and remain subject to ongoing public reporting and judicial review.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'Systemic Failure means a proven, repeated breakdown of constitutional duties, and any finding must be evidence-based, public, and reviewable.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'emergency',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Emergency',
                    blocks: [
                      {
                        type: 'p',
                        text: 'An Emergency is a temporary condition posing an immediate and significant threat to public safety, national security, or ecological stability, where ordinary legal processes are insufficient for timely response.',
                      },
                      {
                        type: 'p',
                        text: 'Emergency declarations and permissible emergency measures are governed by Article VIII and must be specific as to scope, geography, duration, and invoked powers.',
                      },
                      {
                        type: 'p',
                        text: 'Emergency authority may not be used to suspend elections, abolish courts, eliminate oversight bodies, authorize mass surveillance, permit indefinite detention, or censor political dissent.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'An Emergency is a short-term crisis that justifies limited extra powers, but it can never be used to suspend democracy, courts, or core freedoms.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'ecological-stability',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Ecological Stability',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Ecological Stability means measurable conditions within scientifically defined planetary boundaries, including climate stability, biodiversity, freshwater availability, soil health, and pollution thresholds.',
                      },
                      {
                        type: 'p',
                        text: 'Metrics and thresholds used for legal determinations must rely on the best available scientific evidence and be published with methods and uncertainty ranges.',
                      },
                      {
                        type: 'p',
                        text: 'Where metrics are set or updated by law, the process must be transparent, evidence-based, and subject to judicial review for arbitrariness or capture.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'Ecological Stability means staying within science-based environmental limits, using transparent metrics that can be challenged in court.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'trained-civic-pool',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Trained Civic Pool',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Trained Civic Pool is a publicly administered roster of eligible Adult Residents who have completed standardized training and verification required for service in designated civic roles, including sortition-based offices and mixed-selection bodies.',
                      },
                      {
                        type: 'p',
                        text: 'The pool must be administered by an independent public administrator institutionally separate from the bodies that draw from it, overseen by the Public Review Commission, and audited annually.',
                      },
                      {
                        type: 'p',
                        text: 'Enrollment must be voluntary, free, accessible, and non-discriminatory, with reasonable identity verification to prevent duplication and fraud.',
                      },
                      {
                        type: 'p',
                        text: 'Minimum training must cover constitutional duties, conflicts and recusals, anti-corruption, privacy, records obligations, and anti-intimidation reporting, with required accommodations.',
                      },
                      {
                        type: 'p',
                        text: 'Tampering, coercion, or bribery intended to influence pool composition or selection outcomes is a grave constitutional offense.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'This is a voluntary, accessible list of trained people eligible for certain civic roles, protected against tampering and coercion.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'major-vendor',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Major Vendor',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Major Vendor is a Corporate Entity, including subsidiaries, controlled affiliates, or materially compensated contractors, that meets any threshold defined below within a jurisdiction in any rolling twelve-month period, or as an average across the prior three fiscal years:',
                      },
                      {
                        type: 'list',
                        ordered: true,
                        items: [
                          {
                            text: 'holds public contracts with total value equal to or exceeding the greater of one percent of total jurisdiction procurement spend or an inflation-indexed monetary threshold defined by law; or',
                          },
                          {
                            text: 'provides twenty percent or more of spend within a procurement category designated by law as essential, safety-critical, or rights-impacting; or',
                          },
                          {
                            text: 'holds thirty percent or more market share in a procurement-relevant market, or is found by an independent competition authority or court to possess dominant market power; or',
                          },
                          {
                            text: 'is designated by independent audit as creating material single-point-of-failure risk due to concentration, sole-source dependency, platform gatekeeping, or lack of viable substitutes.',
                            blocks: [
                              {
                                type: 'p',
                                text: 'Anti-evasion rules shall aggregate affiliates and coordinated contractors and shall treat contract splitting and pass-through arrangements as a single vendor relationship.',
                              },
                              {
                                type: 'kv',
                                key: 'Plain meaning.',
                                value:
                                  'A Major Vendor is a big or dominant contractor that creates capture or single-point-of-failure risk, and affiliates or split contracts still count together.',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'senior',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Senior',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Senior role is a role held by an individual within a Political Party, Corporate Entity, union, nonprofit, or government body that meets any criterion below within the prior twenty-four months:',
                      },
                      {
                        type: 'list',
                        ordered: true,
                        items: [
                          {
                            text: 'has final or substantial decision-making authority over policy, enforcement priorities, election administration, procurement, budgeting, executive hiring, litigation strategy, regulatory strategy, or large-scale public communications; or',
                          },
                          {
                            text: 'reports directly to a chief executive, executive committee, board, or equivalent governing body, or supervises a unit with authority over rights-impacting decisions; or',
                          },
                          {
                            text: 'holds a title customarily indicating executive authority, including director, commissioner, chief, vice president, partner, general counsel, head of public policy, head of government relations, head of compliance, or equivalent titles defined by law, which creates a rebuttable presumption of seniority; or',
                          },
                          {
                            text: 'receives total compensation in the top five percent within the organization in the relevant jurisdiction, or above an inflation-indexed public threshold defined by law, provided compensation is not the sole basis for designation; or',
                          },
                          {
                            text: 'is found by independent audit or court to exercise material influence over governance outcomes through funding control, media control, platform gatekeeping, or procurement leverage.',
                            blocks: [
                              {
                                type: 'p',
                                text: 'Seniority determinations shall consider de facto authority, including consulting and intermediary roles, and may not be evaded by title manipulation.',
                              },
                              {
                                type: 'kv',
                                key: 'Plain meaning.',
                                value:
                                  'A Senior is someone with substantial decision power or influence in an organization, even if they try to hide it behind titles or contracts.',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'interpretation',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Interpretation',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Interpretation means rights and duties in this Constitution are to be interpreted in good faith to maximize human dignity, democratic accountability, and ecological stewardship, and to minimize arbitrary power.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'Read this Constitution to expand human dignity, democracy, and environmental care, and to reduce arbitrary power.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'severability',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Severability',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Severability means if any provision is held invalid, remaining provisions remain in force unless they are inseparable.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'If one part is struck down, the rest still applies unless it cannot function without the invalid part.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'essential-safety-critical-or-rights-impacting-procurement-category',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Essential, Safety-Critical, or Rights-Impacting Procurement Category',
                    blocks: [
                      {
                        type: 'p',
                        text: 'An Essential, Safety-Critical, or Rights-Impacting Procurement Category is a procurement classification designated under law for goods or services whose failure, denial, manipulation, or capture would foreseeably cause substantial harm to life, health, safety, constitutional rights, democratic processes, or continuity of core public services.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'This is a label for goods or services where failure or capture would predictably harm life, rights, democracy, or core public services.',
                      },
                      {
                        type: 'p',
                        text: 'Minimum Criteria. A category qualifies if it meets one or more of the following:',
                      },
                      {
                        type: 'list',
                        ordered: true,
                        items: [
                          {
                            text: 'supports delivery of constitutionally guaranteed basic services, including healthcare, education, water, food systems, housing support, emergency response, or essential utilities;',
                          },
                          {
                            text: 'supports election administration, civic identity systems, public records systems, courts, oversight bodies, or other core democratic infrastructure;',
                          },
                          {
                            text: 'involves sensitive personal data, communications, surveillance-adjacent capabilities, identity verification, or large-scale data processing used for public decision-making;',
                          },
                          {
                            text: 'provides safety-critical infrastructure, including energy, water treatment, transportation, communications backbone, disaster response logistics, or public health supply chains;',
                          },
                          {
                            text: 'creates material single-point-of-failure risk due to concentration, sole-source dependency, switching barriers, or vendor lock-in;',
                          },
                          {
                            text: 'has a demonstrated history of fraud, corruption, price-gouging, coercive leverage, discriminatory outcomes, or systemic service collapse in the jurisdiction.',
                            blocks: [
                              {
                                type: 'kv',
                                key: 'Plain meaning.',
                                value:
                                  'A category qualifies if it is necessary for basic services, democratic infrastructure, sensitive data use, safety-critical systems, high concentration risk, or a proven pattern of abuse or collapse.',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'kv',
                        key: 'Designation Process.',
                        value:
                          'Designations must be made through a public process with published criteria, public notice and comment, and a written findings report explaining why the designation is necessary, proportionate, and least restrictive.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'The government must publicly justify the label using clear criteria, public input, and a written explanation.',
                      },
                      {
                        type: 'kv',
                        key: 'Review and Sunset.',
                        value:
                          'Each designation must be reviewed at least every three years and automatically sunsets unless renewed by written findings using the criteria in subsection.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'The label must be re-checked regularly and expires automatically unless renewed with written justification.',
                      },
                      {
                        type: 'kv',
                        key: 'Anti-Evasion Rule.',
                        value:
                          'A procurement category may not be subdivided, renamed, or reclassified for the purpose or effect of avoiding constitutional thresholds, conflict-of-interest rules, audit duties, or Major Vendor determinations. Where subdivision occurs, thresholds shall apply to the combined functional category.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'You cannot rename or split a category to dodge thresholds or oversight, the functional whole still counts.',
                      },
                      {
                        type: 'kv',
                        key: 'Dispute Resolution.',
                        value:
                          'Any Adult Resident, relevant oversight body, or affected vendor may challenge a designation or non-designation. Challenges receive expedited review by the Federal High Court, which may order re-designation, consolidation, or other tailored remedies consistent with this Constitution.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'People, oversight bodies, and affected vendors can challenge the label quickly, and the top court can order fixes.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'resident',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Resident',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Resident is a person whose primary living presence is within the relevant jurisdiction, as defined by law consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: 'Residence rules must be non-discriminatory, accessible, and may not be conditioned on property ownership, employment status, incarceration history, or housing status.',
                      },
                      {
                        type: 'p',
                        text: 'No Resident may be denied constitutional protections due to lack of fixed address, immigration status, or inability to produce burdensome documentation, provided identity and residency may be reasonably verified through least-restrictive means.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'A Resident lives there in real life, and the rules cannot be designed to exclude poor, unhoused, or disfavored people.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'jurisdiction',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Jurisdiction',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Jurisdiction means the scope of lawful authority to govern, enforce, tax, adjudicate, or administer public functions.',
                      },
                      {
                        type: 'p',
                        text: 'Jurisdiction may be territorial (defined geographic boundaries) or functional (a defined public function authorized by law).',
                      },
                      {
                        type: 'p',
                        text: 'No body may expand its Jurisdiction by implication, contract, or private agreement; Jurisdiction must be granted by this Constitution or by law consistent with it.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'Jurisdiction is the legally granted scope of power, and it cannot be self-expanded.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'rights-impacting-decision',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Rights-Impacting Decision',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Rights-Impacting Decision is any public or publicly delegated decision that materially affects a person’s liberty, bodily autonomy, privacy, political participation, access to courts, housing, employment benefits, education, healthcare, essential services, legal status, or exposure to surveillance or force.',
                      },
                      {
                        type: 'p',
                        text: 'A decision is Rights-Impacting if it (a) denies, conditions, delays, or burdens access to a protected right or essential service, (b) increases exposure to coercive enforcement, or (c) uses personal data to make eligibility, prioritization, or enforcement determinations.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'If a decision can meaningfully change someone’s rights, safety, or access to essentials, it is rights-impacting.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'competency-based-evaluation',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Competency-Based Evaluation',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Competency-Based Evaluation is an assessment of skills and ethical fitness required for a specific public role, conducted under published standards, validated for relevance and bias, with accommodations, an appeal path, and judicial review for arbitrariness or discrimination.',
                      },
                      {
                        type: 'p',
                        text: 'Competency standards must be viewpoint-neutral and may not use party affiliation, ideology, protected characteristics, or proxy measures.',
                      },
                      {
                        type: 'p',
                        text: 'Where competency evaluations are required for public roles, the standards and assessments must be administered by an independent body designated by law, with:',
                      },
                      {
                        type: 'list',
                        ordered: true,
                        items: [
                          {
                            text: 'published rubrics and scoring criteria,',
                          },
                          {
                            text: 'periodic bias and validity audits,',
                          },
                          {
                            text: 'public reporting of aggregate outcomes,',
                          },
                          {
                            text: 'appeal and retest rights,',
                          },
                          {
                            text: 'protections against capture by private credentialing monopolies.',
                            blocks: [
                              {
                                type: 'kv',
                                key: 'Plain meaning.',
                                value: 'Competency checks must be fair, transparent, and not a political gate.',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'internal-association-matter',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Internal Association Matter',
                    blocks: [
                      {
                        type: 'p',
                        text: 'An Internal Association Matter is a rule or decision of a non-territorial Community or civic association that governs only voluntary membership, internal governance, and private association activities.',
                      },
                      {
                        type: 'p',
                        text: 'Internal Association Matters may not determine access to public services, housing, employment, education, healthcare, public spaces, voting, legal process, or safety services, and may not impose coercive penalties.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'Private groups can govern themselves, but cannot become shadow-government.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'prior-restraint',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Prior Restraint',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Prior Restraint means an order preventing publication or speech before it occurs.',
                      },
                      {
                        type: 'p',
                        text: 'Prior Restraint is prohibited except where a court finds, by clear and convincing evidence, a specific and imminent threat of grave bodily harm that cannot be mitigated by less restrictive means, and the order is narrowly scoped and time-limited.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'Pre-banning speech is basically forbidden, with a tiny emergency exception.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'large-scale-corruption',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Large-Scale Corruption',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Large-Scale Corruption means corruption involving (a) systemic procurement fraud, (b) capture of enforcement or oversight bodies, (c) coordinated bribery or coercion affecting elections or rights enforcement, or (d) corruption whose financial scale or institutional impact is designated by law under objective thresholds and subject to judicial review.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'This is corruption big enough to distort governance outcomes.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'terrorism',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Terrorism',
                    blocks: [
                      {
                        type: 'p',
                        text: 'Terrorism means intentional violence or credible violent threat against civilians or noncombatants to coerce public action or governmental decision-making, as defined by law consistent with human rights and subject to strict judicial review.',
                      },
                      {
                        type: 'p',
                        text: 'Terrorism definitions may not be expanded to criminalize lawful protest, labor action, civil disobedience, journalism, or political opposition.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'Terrorism is real violence aimed at coercion, not a label for dissent.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'public-body',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Public Body',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Public Body is any entity that exercises governmental authority, performs a function created by law, administers public funds, or is authorized to make, enforce, or implement rules or decisions binding on Residents, including agencies, councils, commissions, courts, authorities, and publicly created corporations, whether at Community, Regional, or Federated level.',
                      },
                      {
                        type: 'p',
                        text: 'A Public Body includes any private or nonprofit actor to the extent it performs a Public Function under delegation, contract, license, or mandate.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value:
                          'If it acts like government or performs government work, it must follow the Constitution.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'public-function',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Public Function',
                    blocks: [
                      {
                        type: 'p',
                        text: 'A Public Function is any function that is constitutionally required, legally mandated, or publicly delegated, including: election administration; courts and dispute resolution; detention and enforcement; provision or administration of essential services; rights-impacting eligibility determinations; management of public records; public procurement; and any function involving coercive power, surveillance authority, or Rights-Impacting Decisions.',
                      },
                      {
                        type: 'p',
                        text: 'A function remains a Public Function even if performed by a contractor, platform, nonprofit, union, cooperative, or other private actor, where the actor’s decisions materially affect access to rights, services, protections, or legal status.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: 'Government cannot outsource a duty and escape constitutional limits.',
                      },
                    ],
                    children: [],
                  },
                  {
                    id: 'essential-service',
                    kind: 'topic',
                    level: 4,
                    label: null,
                    title: 'Essential Service',
                    blocks: [
                      {
                        type: 'p',
                        text: 'An Essential Service is any service whose denial, failure, manipulation, or capture would foreseeably cause substantial harm to life, health, safety, constitutional rights, democratic processes, or continuity of core public services, including healthcare, emergency response, education, water, sanitation, food systems, shelter access, power and utilities, communications backbone, and rights-impacting public administration systems as defined by law consistent with this Constitution.',
                      },
                      {
                        type: 'p',
                        text: 'Where the term “essential services” is used as a basis to limit rights, it must be interpreted narrowly and subject to strict scrutiny, with written findings demonstrating necessity, proportionality, and least-restrictive means.',
                      },
                      {
                        type: 'p',
                        text: 'For avoidance of doubt, when “Essential Service” is used as a basis to limit rights, it shall be treated as coextensive with the Essential, Safety-Critical, or Rights-Impacting Procurement Category definition in this Section.',
                      },
                      {
                        type: 'kv',
                        key: 'Plain meaning.',
                        value: '“Essential” means life, safety, rights, and core governance, not convenience.',
                      },
                    ],
                    children: [],
                  },
                ],
              },
              {
                id: 'section-1-popular-sovereignty-decentralized-governance',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Popular Sovereignty & Decentralized Governance',
                blocks: [
                  {
                    type: 'p',
                    text: 'Source of Authority: All legitimate political authority arises from the consent and active participation of the people.',
                  },
                  {
                    type: 'p',
                    text: 'Communities Defined: Communities self-define their structure based on geographic proximity, cultural affinity, or shared purpose, provided they operate democratically and uphold fundamental rights.',
                  },
                  {
                    type: 'p',
                    text: 'Environmental Stewardship: Governance at all levels integrates ecological responsibility, ensuring that policies respect scientifically defined planetary boundaries (e.g., climate stability, biodiversity loss, freshwater use) and prioritize the well-being of future generations.',
                  },
                  {
                    type: 'p',
                    text: 'Technological Responsibility: Ethical frameworks ensure technological advancements are used transparently and equitably, with safeguards against misuse. The Technology Ethics Council oversees compliance. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Governance Oversight: A Public Review Commission evaluates governmental efficiency, equity, and accountability every five years. Its findings are publicly accessible and trigger mandatory reforms if systemic failures are identified. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Civic Literacy & Education: A mandatory Civic Literacy Program will educate all residents on governance structures, democratic rights, and responsibilities. Funding will be allocated equitably across communities.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Dissolve Government: If the government ceases to uphold its responsibilities or becomes oppressive, the people retain the right to dissolve it through a constitutional process, requiring a supermajority public referendum and oversight by the Federal High Court.',
                  },
                  {
                    type: 'p',
                    text: 'Subsidiarity Principle: Power remains at the most local feasible level, with higher levels intervening only when necessary for coordination, resource distribution, or rights protection.',
                  },
                  {
                    type: 'p',
                    text: 'Anti-Authoritarian Safeguards: Any concentration of power, suppression of dissent, or violation of democratic processes triggers intervention by an Independent Oversight Committee, which may issue temporary suspensions of offending actions pending judicial review. Suspensions must be time-limited, narrowly scoped, and immediately reviewable by the Federal High Court. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Resident Recall Power: A Citizen Recall Mechanism allows the public to remove any official by referendum vote if corruption or authoritarian behavior is identified. A petition signed by 10% of the electorate is required to initiate a recall.',
                  },
                  {
                    type: 'p',
                    text: 'To prevent harassment and governance paralysis:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'no more than one recall election for the same office may be held within a rolling 12-month period absent a judicial finding of newly discovered, material corruption;',
                      },
                      {
                        text: 'petition circulation must provide secure methods that reduce doxxing risk, with protected reporting channels for intimidation;',
                      },
                      {
                        text: 'fraudulent signature gathering, coercion, retaliation, and doxxing campaigns in connection with recall are grave constitutional offenses;',
                      },
                      {
                        text: 'courts must provide expedited review for credible claims of intimidation or discriminatory enforcement in recall processes.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Anti-Entrenchment & Anti-Capture Safeguards: Electoral victories do not by themselves constitute illegitimate domination. Structural entrenchment and capture are prohibited. The following constitute prima facie entrenchment or capture when they materially impair pluralism, free elections, or rights enforcement:',
                          },
                        ],
                      },
                      {
                        text: 'Manipulation of election rules to lock in incumbency, including discriminatory ballot access, intimidation, suppression, or unequal administration.',
                      },
                      {
                        text: 'Gerrymandering or districting methods that systematically dilute representation without neutral justification.',
                      },
                      {
                        text: 'Concentration of media, communications infrastructure, or platform distribution that prevents fair political communication, including undisclosed algorithmic suppression or amplification in public channels.',
                      },
                      {
                        text: 'Capture of courts, election administration, public prosecution, security services, or oversight bodies for partisan advantage.',
                      },
                      {
                        text: 'Corruption or procurement dependence where a Corporate Entity or donor network materially dictates policy, enforcement, or appointments.',
                      },
                      {
                        text: 'Retaliation against whistleblowers, journalists, organizers, or political opponents through unlawful surveillance, detention, threats, or economic coercion.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Anti-Entrenchment Review: A petition signed by 5% of the Electorate in the relevant jurisdiction, a finding by the Public Review Commission, or a two-thirds vote of the Oversight Coordination Council may initiate review. The Federal High Court must hear the matter on an expedited schedule.',
                          },
                          {
                            type: 'p',
                            text: 'Permitted Remedies: Where entrenchment or capture is found, remedies may include annulment of tainted rules, independent election administration, redistricting, campaign finance resets, dissolution or reconstitution of unlawfully captured boards, disqualification of officials for proven corruption, and re-run elections under neutral supervision. Remedies must be tailored, time-limited, and publicly justified.',
                          },
                          {
                            type: 'p',
                            text: 'Non-Interference Rule: No remedy may suspend basic rights, dissolve communities by force, or criminalize lawful political opposition. Structural safeguards target capture mechanisms, not ideology.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-oversight-bodies-coordination',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Oversight Bodies & Coordination',
                blocks: [
                  {
                    type: 'p',
                    text: 'Oversight Coordination Council (OCC): The OCC ensures clarity in the mandates, funding, and jurisdiction of oversight bodies. It resolves disputes between oversight agencies and prevents redundancy or conflicts. Selection, tenure, removal, and composition are governed by Article X. Coordination Rule: When multiple bodies have plausible jurisdiction, the OCC assigns a lead body and a support role within 30 days, and the lead body controls timelines and scope.',
                  },
                  {
                    type: 'p',
                    text: 'OCC Boundaries: Each constitutional oversight body must publish a public charter defining its jurisdiction, powers, evidence standards, enforcement tools, appeal path, and budget ceiling. Overlapping jurisdiction must be resolved by written memorandum or, if disputed, by expedited review in the Federal High Court within 60 days.',
                  },
                  {
                    type: 'p',
                    text: 'Budget and Audits: Oversight bodies are subject to annual independent audits. Enforcement actions must be logged publicly with redactions only as strictly necessary for safety, privacy, or ongoing investigations.',
                  },
                  {
                    type: 'p',
                    text: 'Fast Dispute Resolution: When two bodies issue conflicting directives, the narrower directive applies temporarily while an expedited review is heard. No oversight body may unilaterally expand its mandate without legislative authorization and judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Public Review Commission: Reviews governance every five years. If a Systemic Failure (as defined in Article I, Section 0) is identified, mandatory reforms and corrective legislation are required within 12 months. Selection, tenure, removal, and composition are governed by Article X. Scope: The Public Review Commission performs periodic system-level audits and performance reviews, and may refer suspected violations to the appropriate enforcement or adjudicatory body; it does not prosecute or adjudicate individual cases.',
                  },
                  {
                    type: 'p',
                    text: 'Within 90 days of a Systemic Failure finding, the responsible institution must publish a Corrective Action Plan (CAP) stating root causes, measurable milestones, budget needs, and a timeline not exceeding 12 months unless extended by court order for good cause.',
                  },
                  {
                    type: 'p',
                    text: 'If the legislature or responsible body fails to enact or implement necessary corrective measures within 12 months, the Federal High Court may:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'order a court-supervised compliance plan,',
                      },
                      {
                        text: 'impose targeted budget holds on noncompliant discretionary programs of the responsible institution,',
                      },
                      {
                        text: 'appoint a time-limited independent compliance administrator with narrowly defined authority to implement the CAP, and',
                      },
                      {
                        text: 'require periodic public reporting until compliance is achieved.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Remedies must be tailored, time-limited, and may not suspend elections, abolish courts, or eliminate oversight bodies.',
                          },
                          {
                            type: 'p',
                            text: 'Independent Oversight Committee: Investigates corruption, authoritarian actions, and abuse of power. It may issue temporary suspensions of actions pending judicial review. Selection, tenure, removal, and composition are governed by Article X. Scope: The Independent Oversight Committee investigates abuse of power and rights-impacting misconduct by public officials and agencies; it does not duplicate routine audits or regulate private entities except as necessary to investigate public corruption or coercion.',
                          },
                          {
                            type: 'p',
                            text: 'Whistleblower Protection Agency: Protects individuals reporting corruption, rights violations, or safety threats. Retaliation is prohibited and punishable. Selection, tenure, removal, and composition are governed by Article X. Scope: The Whistleblower Protection Agency receives protected disclosures, prevents retaliation, and may compel corrective action for retaliation; it refers underlying wrongdoing to the competent body.',
                          },
                          {
                            type: 'p',
                            text: 'Non-Duplication: No oversight body may open a parallel investigation into the same facts without written findings of necessity and OCC notice.',
                          },
                          {
                            type: 'p',
                            text: 'Default workflow: PRC audits, WPA receives disclosures, IOC investigates abuse, OCC assigns lead jurisdiction, and courts adjudicate disputes.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-governance-innovation-accountability',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Governance Innovation & Accountability',
                blocks: [
                  {
                    type: 'p',
                    text: 'Periodic Constitutional Review: Every 20 years, a Constitutional Review Assembly is convened to propose updates. Any amendments must follow Article IX.',
                  },
                  {
                    type: 'p',
                    text: 'Open Data and Transparency: Government decisions, budgets, and contracts must be publicly accessible, with exceptions only for narrowly defined privacy or safety needs.',
                  },
                  {
                    type: 'p',
                    text: 'Any redaction of public records, audits, enforcement logs, contracts, or decisions must:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'be narrowly limited to specific information whose disclosure would create a concrete and articulable risk to personal safety, privacy, or an active investigation;',
                      },
                      {
                        text: 'be accompanied by a written justification stating the basis, scope, and duration;',
                      },
                      {
                        text: 'be recorded in a public Redaction Log stating the record type, redaction category, and scheduled review date;',
                      },
                      {
                        text: 'be reviewed at least every 90 days and automatically expire unless renewed with written findings;',
                      },
                      {
                        text: 'be subject to expedited challenge by any Resident or affected party, with judicial review available.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'All public bodies must maintain a public records system with:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'a right of access to records within defined response deadlines set by law;',
                      },
                      {
                        text: 'minimum retention periods for budgets, contracts, enforcement logs, election records, and oversight findings;',
                      },
                      {
                        text: 'preservation holds upon notice of litigation, audit, or investigation;',
                      },
                      {
                        text: 'penalties for willful destruction, falsification, or concealment of records.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Anti-Corruption Safeguards: Public officials must disclose assets and conflicts of interest. Violations result in removal and legal penalties.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: 'section-4-selection-tenure-and-anti-capture-standards',
                kind: 'section',
                level: 3,
                label: 'Section 4',
                title: 'Selection, Tenure, and Anti-Capture Standards',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection, tenure, removal, conflicts of interest, anti-intimidation protections, sortition integrity, and the Office Registry are governed by Article X. In the event of conflict, Article X controls unless an Article expressly states it supersedes Article X.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-5-supremacy-preemption-and-conflict-of-laws',
                kind: 'section',
                level: 3,
                label: 'Section 5',
                title: 'Supremacy, Preemption, and Conflict-of-Laws',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Supremacy of This Constitution.',
                    value:
                      'This Constitution is the supreme law. Any act, rule, contract, policy, or custom inconsistent with this Constitution is void to the extent of inconsistency.',
                  },
                  {
                    type: 'kv',
                    key: 'Hierarchy of Law.',
                    value:
                      'Where rules conflict, the following order applies, subject to rights protection and lawful delegation:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'This Constitution.',
                      },
                      {
                        text: 'Federated law enacted consistent with this Constitution.',
                      },
                      {
                        text: 'Regional law enacted consistent with this Constitution and federated law.',
                      },
                      {
                        text: 'Community law enacted consistent with this Constitution and higher law.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Rights Floor and Local Variation.',
                    value:
                      'No jurisdiction may provide less protection than this Constitution. Communities and Regions may provide greater protections and benefits, provided they do not violate equal protection, democratic participation, or anti-capture rules.',
                  },
                  {
                    type: 'kv',
                    key: 'Delegation Limits.',
                    value:
                      'No public body may delegate coercive authority, rights-impacting decision authority, or essential public service control to a private actor except under:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'a clear law specifying scope, duration, oversight, auditability, appeal paths, and remedies; and',
                      },
                      {
                        text: 'compliance with Article X conflicts, procurement, and anti-capture standards; and',
                      },
                      {
                        text: 'judicial review availability for affected Residents.',
                      },
                      {
                        text: 'any delegated actor performing a Public Function is a Public Body for purposes of this Constitution to the extent of that function.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Conflict Resolution and Interim Rule.',
                    value:
                      'When a conflict-of-laws dispute materially affects rights, election administration, detention, surveillance, or emergency limits:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'any Resident or oversight body has standing to seek expedited review by the Federal High Court; and',
                      },
                      {
                        text: 'interim relief may be granted to prevent irreparable harm; and',
                      },
                      {
                        text: 'pending final resolution, the rule that is least rights-restrictive applies unless a court finds a compelling necessity under strict scrutiny.',
                        blocks: [
                          {
                            type: 'kv',
                            key: 'Plain meaning.',
                            value:
                              'The constitution outranks everything. Federated law outranks regional, regional outranks communities. No one can go below the rights floor. If laws clash and rights are at stake, courts decide fast, and the least rights-restrictive rule applies meanwhile.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-ii-governance-structures',
            kind: 'article',
            level: 2,
            label: 'Article II',
            title: 'Governance Structures',
            blocks: [],
            children: [
              {
                id: 'section-1-community-councils',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Community Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Mandate: Manage local services (education, healthcare, security) through participatory budgeting and transparent procedures.',
                  },
                  {
                    type: 'p',
                    text: 'Voting Rights:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'All adult residents (18+ years old) have full voting rights. This age threshold reflects the principle that individuals contributing to society (e.g., through work or taxation) should have a voice in governance.',
                      },
                      {
                        text: 'Youth aged 12-17 may participate in debates as non-voting delegates and have binding advisory votes that require a written response and recorded consideration, on issues directly affecting them (e.g., education, climate).',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Leadership Competency: Leadership positions require competency-based evaluations to ensure governance is led by individuals with necessary skills, ethical decision-making, and crisis response capacity.',
                          },
                          {
                            type: 'p',
                            text: 'Recall and Term Limits: Community leaders serve no more than two consecutive four-year terms and are subject to recall via public petition and referendum.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-regional-councils',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Regional Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Mandate: Coordinate large-scale concerns (e.g., infrastructure, environmental policies) between communities.',
                  },
                  {
                    type: 'p',
                    text: 'Resource Allocation: Ensure equitable distribution of resources between communities, prioritizing marginalized or resource-poor areas.',
                  },
                  {
                    type: 'p',
                    text: 'Dispute Resolution: Resolve conflicts between communities through mediation and binding arbitration where necessary.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-federated-assembly',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Federated Assembly',
                blocks: [
                  {
                    type: 'p',
                    text: 'Mandate: Address national-level issues (foreign policy, monetary policy, universal rights enforcement) while ensuring subsidiarity.',
                  },
                  {
                    type: 'p',
                    text: 'Representation: The Federated Assembly represents regions using proportional methods with minority-representation protections. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: All sessions must be public, recorded, and accessible. Closed sessions require judicial approval.',
                  },
                  {
                    type: 'p',
                    text: 'Major Decisions: Constitutional changes, war declarations, and major public spending programs require a two-thirds majority of the Federated Assembly and ratified by public referendum.',
                  },
                  {
                    type: 'p',
                    text: 'Public Referenda: At least once every decade, a national referendum must be held on a docket of major questions as defined by law, and major decisions designated by this Constitution require referendum ratification.',
                  },
                  {
                    type: 'p',
                    text: 'Emergency Governance Protocol: Emergency declarations and measures are governed exclusively by Article VIII.',
                  },
                  {
                    type: 'p',
                    text: 'Federal High Court: A Federal High Court is established to unify interpretations of constitutional principles and resolve disputes between regional and federal authorities. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-4-legislative-process-public-transparency',
                kind: 'section',
                level: 3,
                label: 'Section 4',
                title: 'Legislative Process & Public Transparency',
                blocks: [
                  {
                    type: 'p',
                    text: 'Public Drafting: All proposed laws must be published in plain language and full legal text before a final vote, with a minimum public comment period of 30 days, except as limited under Article VIII.',
                  },
                  {
                    type: 'p',
                    text: 'Committee Review: The Federated Assembly and Regional Councils must maintain public committees with recorded votes, disclosed conflicts of interest, and published findings.',
                  },
                  {
                    type: 'p',
                    text: 'Voting Rules: Ordinary laws require a majority of members present, with quorum defined by law. Rights-limiting laws require a two-thirds majority and an explicit findings report demonstrating necessity, proportionality, and least-restrictive means.',
                  },
                  {
                    type: 'p',
                    text: 'Publication and Effective Dates: All enacted laws must be published in a public registry, including implementation guidance, budget impact, and enforcement authority. Laws take effect no sooner than 14 days after publication unless urgent and narrowly justified.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-5-executive-administration-implementation',
                kind: 'section',
                level: 3,
                label: 'Section 5',
                title: 'Executive Administration & Implementation',
                blocks: [
                  {
                    type: 'p',
                    text: 'Purpose: Execution of law is an administrative function, not an independent source of political power.',
                  },
                  {
                    type: 'p',
                    text: 'Federal Executive Secretariat: A Federal Executive Secretariat is established to implement laws, execute budgets, coordinate agencies, and manage inter-regional services. It has no authority to legislate.',
                  },
                  {
                    type: 'p',
                    text: 'Appointment and Removal: The Secretariat is led by an Administrator-General. Senior administrators must meet competency standards and are subject to conflict-of-interest and anti-corruption rules. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Agency Creation and Limits: Agencies may be created only by law, with a defined mandate, sunset review, and audit requirements. Delegated rulemaking must remain within clear statutory bounds and is subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Executive actions, contracts, and procurement decisions must be publicly logged, with narrow redactions for privacy and security. Emergency procurement remains subject to Article VIII reporting and postmortem audit.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-6-elections-administration-integrity',
                kind: 'section',
                level: 3,
                label: 'Section 6',
                title: 'Elections Administration & Integrity',
                blocks: [
                  {
                    type: 'p',
                    text: 'An Independent Elections Administration Authority is established in each jurisdiction with responsibility for election administration, voter access, ballot integrity, audits, and transparent certification.',
                  },
                  {
                    type: 'p',
                    text: 'Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'The IEAA shall:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'maintain a secure, accessible voter registry with timely cure processes;',
                      },
                      {
                        text: 'administer elections and referenda using uniform, public procedures;',
                      },
                      {
                        text: 'ensure equal access to voting including reasonable accommodations, accessible polling, and non-discriminatory documentation standards;',
                      },
                      {
                        text: 'publish ballot design and counting procedures to prevent confusion and arbitrary rejection;',
                      },
                      {
                        text: 'operate transparent post-election audits and recount procedures under published standards;',
                      },
                      {
                        text: 'maintain chain-of-custody and evidence logs for ballots and tabulation systems;',
                      },
                      {
                        text: 'investigate and refer intimidation, suppression, fraud, or administrative misconduct to the competent enforcement body.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'For election systems and services, the IEAA must:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'treat election administration as an Essential, Safety-Critical, or Rights-Impacting Procurement Category;',
                      },
                      {
                        text: 'prohibit undisclosed vendor influence over ballot access, tabulation, certification, or audit methods;',
                      },
                      {
                        text: 'require public disclosure of election vendor contracts, pricing, and conflicts, with narrow redactions only for specific security details;',
                      },
                      {
                        text: 'prohibit proprietary black-box systems for tabulation, audit, or voter eligibility determinations.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'Minimum audit standards shall be established by law consistent with this Constitution and must include:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'risk-limiting or functionally equivalent audits for tabulation accuracy;',
                      },
                      {
                        text: 'public reporting of methods, sample selection, error rates, and corrective actions;',
                      },
                      {
                        text: 'preserved public evidence sufficient for judicial review.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'Where territorial districts exist, aligning districts must follow neutral criteria established by law consistent with this Constitution, and may not be manipulated to dilute representation.',
                  },
                  {
                    type: 'p',
                    text: 'Where proportional methods are used, allocation formulas must be published, stable, and subject to judicial review for arbitrariness or discriminatory effect.',
                  },
                  {
                    type: 'p',
                    text: 'No emergency declaration may alter election dates, ballot access rules, counting rules, or audit requirements except by:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'a specific law limited to the emergency period,',
                      },
                      {
                        text: 'written findings satisfying necessity, proportionality, and least-restrictive means, and',
                      },
                      {
                        text: 'expedited review by the Federal High Court.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'The IEAA may issue binding administrative directives necessary to administer elections and protect voting access.',
                  },
                  {
                    type: 'p',
                    text: 'Interference with IEAA duties, including intimidation, suppression, sabotage of audits, or unlawful refusal to comply with lawful directives, is a grave constitutional offense.',
                  },
                  {
                    type: 'p',
                    text: 'The IEAA has standing to seek expedited relief in the Federal High Court to enjoin interference or compel compliance.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-iii-justice-dispute-resolution',
            kind: 'article',
            level: 2,
            label: 'Article III',
            title: 'Justice & Dispute Resolution',
            blocks: [],
            children: [
              {
                id: 'section-1-restorative-justice-focus',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Restorative Justice Focus',
                blocks: [
                  {
                    type: 'p',
                    text: 'Principle: Emphasizes repair, rehabilitation, and reintegration, reducing punitive measures unless necessary.',
                  },
                  {
                    type: 'p',
                    text: 'Applicability: Used in civil and criminal matters, except for severe offenses requiring security measures. Severe offenses include homicide, terrorism, and large-scale corruption.',
                  },
                  {
                    type: 'p',
                    text: 'Implementation: Restorative Justice Programs will be established in every community, funded by a combination of local and federal resources. Annual evaluations will ensure effectiveness and equity.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-community-mediation-courts',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Community Mediation & Courts',
                blocks: [
                  {
                    type: 'p',
                    text: 'Mediation Councils: Trained, diverse mediators ensure timely and impartial resolutions.',
                  },
                  {
                    type: 'p',
                    text: 'Local Courts: Judges are elected by the community and are removable only by judicial discipline for cause, and by impeachment for corruption, under Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Appeals: All parties have the right to appeal adverse judgments or orders under procedures defined by law consistent with due process, including timely access to the record and a reasoned decision.',
                  },
                  {
                    type: 'p',
                    text: 'Protection Against Abuse: Individuals retain rights against arbitrary detention or unfair trials. A Legal Ombudsman investigates complaints of judicial misconduct. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Ban on For-Profit Prisons & Mass Surveillance Policing: To prevent exploitation and authoritarian overreach, the use of private incarceration facilities and predictive policing based on mass surveillance is prohibited. Violations will result in immediate termination of contracts and legal penalties.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-federal-high-court-constitutional-review',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Federal High Court & Constitutional Review',
                blocks: [
                  {
                    type: 'p',
                    text: 'Federal High Court: Ensures uniform constitutional interpretation, resolves disputes between jurisdictions, and oversees key rights enforcement mechanisms.',
                  },
                  {
                    type: 'p',
                    text: 'Constitutional Complaints: Any resident may bring a complaint alleging constitutional rights violations. The Court must provide expedited review for urgent rights threats.',
                  },
                  {
                    type: 'p',
                    text: 'Judicial Accountability: Judges are subject to ethical review, asset disclosure, and removal for corruption or abuse, under a high threshold to protect independence.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-iv-bill-of-rights',
            kind: 'article',
            level: 2,
            label: 'Article IV',
            title: 'Bill of Rights',
            blocks: [],
            children: [
              {
                id: 'section-0-enforcement-standing-remedies',
                kind: 'section',
                level: 3,
                label: 'Section 0',
                title: 'Enforcement, Standing, & Remedies',
                blocks: [
                  {
                    type: 'p',
                    text: 'Direct Enforceability: Rights in this Article are enforceable in court. Any resident with a credible claim of harm, or any public-interest organization meeting standing requirements defined by law, may bring suit. Unless expressly limited to Residents or Adult Residents, the rights in this Article apply to all persons within the jurisdiction.',
                  },
                  {
                    type: 'p',
                    text: 'Remedies: Courts may grant declaratory relief, injunctions, damages, exclusion of unlawfully obtained evidence, restoration of benefits, and structural remedies including supervised compliance plans.',
                  },
                  {
                    type: 'p',
                    text: 'Progressive Realization: Economic and social rights requiring sustained public resources (including guaranteed GDP floors) are subject to progressive realization, but governments must demonstrate good faith, non-discrimination, and measurable progress. Retrogression requires clear justification under strict scrutiny.',
                  },
                  {
                    type: 'p',
                    text: 'Expedited Review: Claims involving detention, surveillance, voting access, censorship, or emergency derogations must receive priority scheduling and a decision within 90 days when practicable.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-1-fundamental-rights',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Fundamental Rights',
                blocks: [
                  {
                    type: 'p',
                    text: 'Right to Self-Governance: Individuals and communities have the right to self-determination under democratic principles.',
                  },
                  {
                    type: 'p',
                    text: 'Freedom of Speech & Expression: All individuals have the right to voice their beliefs, thoughts, and cultural expressions without suppression. Narrow, viewpoint-neutral limits may apply only to direct and intentional incitement to imminent violence, targeted harassment that deprives others of equal access to public life, and coordinated threats. Any restriction must satisfy necessity, proportionality, and least-restrictive means.',
                  },
                  {
                    type: 'p',
                    text: 'Due Process for Speech Allegations: A Speech Integrity Panel, under the Federal High Court, may review allegations under clear, published standards. The burden of proof is on the state or complainant. Orders must be written, time-limited, and appealable. No panel may ban political viewpoints or suppress criticism of the government. The Panel may only review cases arising from alleged violations under this Article and may not initiate proceedings absent a filed complaint. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Privacy: Personal data, digital identity, and personal communications are protected against unlawful surveillance. A Data Protection Authority will enforce compliance and investigate breaches. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Economic Dignity: Every person has the right to work in fair conditions and receive a living wage. Worker ownership and democratic workplaces are encouraged through incentives and protections.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Education: Every individual has the right to free, high-quality education, including civic literacy and vocational training.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Healthcare: As guaranteed in Article IV, Section 5.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Housing: Every individual has the right to safe, stable housing. Governments must ensure sufficient housing supply and ensure no person is forced to live without safe shelter.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Food & Water: Access to nutritious food and clean water is a fundamental right, protected from commodification in ways that deny universal access.',
                  },
                  {
                    type: 'p',
                    text: 'Freedom of Assembly & Association: Individuals may organize, protest, and form associations without repression, subject only to narrow safety constraints.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-democratic-rights',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Democratic Rights',
                blocks: [
                  {
                    type: 'p',
                    text: 'Right to Vote: All adult residents have the right to vote in all elections and referendums within their jurisdiction.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Transparent Governance: Government actions and budgets must be publicly accessible.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Petition & Referendum: Residents may initiate referenda and recalls under the thresholds defined in this Constitution.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-digital-and-technological-rights',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Digital and Technological Rights',
                blocks: [
                  {
                    type: 'p',
                    text: 'Right to Digital Equity: Access to the internet and digital tools is a public good. A Digital Equity Fund will ensure universal access.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Algorithmic Transparency: Any algorithm used in public decision-making must be transparent, auditable, and explainable. Proprietary black-box decision systems are prohibited for rights-impacting decisions. Rights-impacting decisions include determinations of eligibility, access to essential services, liberty restrictions, surveillance targeting, housing, employment benefits, and legal status.',
                  },
                  {
                    type: 'p',
                    text: 'Technology Ethics Council: Oversees compliance with technological rights and ethical standards, with subpoena power and public reporting duties. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'Public bodies and publicly delegated systems must collect and retain only the minimum personal data necessary for a lawful purpose.',
                  },
                  {
                    type: 'p',
                    text: 'Secondary use of personal data for unrelated purposes is prohibited absent informed consent or a judicial order under strict standards.',
                  },
                  {
                    type: 'p',
                    text: 'Retention limits must be set by law and enforced by the Data Protection Authority, with deletion required when data is no longer necessary.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-4-environmental-rights',
                kind: 'section',
                level: 3,
                label: 'Section 4',
                title: 'Environmental Rights',
                blocks: [
                  {
                    type: 'p',
                    text: 'Right to a Healthy Environment: All individuals have the right to live in an ecologically stable environment.',
                  },
                  {
                    type: 'p',
                    text: 'Rights of Nature: Ecosystems may be granted legal standing, represented by guardians to protect their integrity.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-5-health-well-being-rights',
                kind: 'section',
                level: 3,
                label: 'Section 5',
                title: 'Health & Well-Being Rights',
                blocks: [
                  {
                    type: 'p',
                    text: 'Right to Universal Healthcare: Every individual has the right to accessible, high-quality healthcare, including mental health services and preventative care. Healthcare systems must be publicly funded and free at the point of service.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Reproductive Autonomy: Individuals have the right to make informed choices regarding their reproductive health, free from coercion or restriction. Comprehensive reproductive healthcare, including abortion, will be universally accessible.',
                  },
                  {
                    type: 'p',
                    text: 'Right to Artistic & Scientific Freedom: Creative and scientific expression shall be protected from censorship or undue restrictions, ensuring innovation and cultural flourishing. Funding for the arts and sciences will be guaranteed.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-6-equal-protection-and-non-discrimination',
                kind: 'section',
                level: 3,
                label: 'Section 6',
                title: 'Equal Protection and Non-Discrimination',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Equal Protection.',
                    value:
                      'All persons are entitled to equal protection of the laws. No public body, and no private actor performing a public function, may deny equal protection in rights, services, protections, burdens, or enforcement.',
                  },
                  {
                    type: 'kv',
                    key: 'Non-Discrimination.',
                    value:
                      'Discrimination is prohibited in any public function, including voting, education, healthcare, housing support, employment benefits, courts, policing, emergency services, and access to public spaces. Prohibited bases include:',
                  },
                  {
                    type: 'p',
                    text: 'Race, color, ethnicity, nationality, religion, sex, gender, gender identity, sexual orientation, disability, age, pregnancy, family status, language, veteran status, political viewpoint, housing status, immigration status, prior incarceration status, or any other status defined by law consistent with this Constitution.',
                  },
                  {
                    type: 'kv',
                    key: 'Discriminatory Effect Standard.',
                    value: 'A policy or practice violates this Section if:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'it intentionally discriminates; or',
                      },
                      {
                        text: 'it has a substantial discriminatory effect without a necessity that is evidence-based, proportionate, and least-restrictive.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Burden and Proof.',
                    value: 'Where a credible showing of discriminatory effect is made:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'The government bears the burden to prove necessity, proportionality, and least-restrictive means; and',
                      },
                      {
                        text: 'The burden includes demonstrating that less discriminatory alternatives were considered and rejected with written findings.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Accommodation and Accessibility.',
                    value:
                      'Reasonable accommodations for disability, language access, and access barriers are required for public services and democratic participation, unless the government proves undue hardship under a strict standard.',
                  },
                  {
                    type: 'kv',
                    key: 'Anti-Retaliation.',
                    value:
                      'Retaliation against any person for asserting rights under this Section is prohibited and constitutes cause for removal and civil liability where appropriate.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value:
                      'The government and its contractors must treat people fairly. You cannot discriminate, and you cannot hide behind “neutral” rules that predictably harm a group unless it is truly necessary and least restrictive.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-7-criminal-procedure-detention-and-enforcement-limits',
                kind: 'section',
                level: 3,
                label: 'Section 7',
                title: 'Criminal Procedure, Detention, and Enforcement Limits',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Habeas Corpus and Prompt Review.',
                    value:
                      'Any detained person has the right to challenge detention. A neutral judicial officer must review detention promptly under deadlines set by law, and in no case later than 48 hours absent extraordinary circumstances proven in court.',
                  },
                  {
                    type: 'kv',
                    key: 'No Indefinite Detention.',
                    value:
                      'Indefinite detention is prohibited. Any detention must be authorized by law, time-limited, and subject to ongoing judicial review.',
                  },
                  {
                    type: 'kv',
                    key: 'Due Process and Fair Trial.',
                    value: 'In criminal matters and any rights-impacting enforcement:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'notice of charges or allegations,',
                      },
                      {
                        text: 'access to evidence,',
                      },
                      {
                        text: 'right to counsel,',
                      },
                      {
                        text: 'right to a public hearing before a neutral decision-maker,',
                      },
                      {
                        text: 'right to confront and challenge evidence,',
                      },
                      {
                        text: 'right to a reasoned written decision, and',
                      },
                      {
                        text: 'right to appeal.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Implementing law shall ensure counsel is provided to those unable to pay.',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Search, Seizure, and Surveillance Limits.',
                    value:
                      'Searches, seizures, and targeted surveillance require a warrant issued by an independent court based on probable cause, describing with particularity the scope, target, and duration. General warrants are prohibited.',
                  },
                  {
                    type: 'kv',
                    key: 'Data and Device Protection.',
                    value:
                      'Access to personal communications, devices, and digital accounts is treated as highly sensitive and requires heightened necessity and minimization standards defined by law consistent with this Constitution.',
                  },
                  {
                    type: 'kv',
                    key: 'Exclusion and Remedies.',
                    value:
                      'Evidence obtained through unlawful search, seizure, surveillance, coercion, or material due process violations is inadmissible in any rights-impacting proceeding, subject only to narrow exceptions defined by law consistent with this Constitution and subject to strict judicial review.',
                  },
                  {
                    type: 'kv',
                    key: 'Bail and Pretrial Limits.',
                    value:
                      'Pretrial detention is permitted only where the government proves by clear and convincing evidence that no less restrictive conditions can reasonably ensure appearance or prevent imminent serious harm. Wealth-based detention is prohibited.',
                  },
                  {
                    type: 'kv',
                    key: 'Conditions and Treatment.',
                    value:
                      'Cruel, inhuman, or degrading treatment is prohibited. Detention conditions must meet minimum health, safety, and dignity standards defined by law, enforceable in court.',
                  },
                  {
                    type: 'kv',
                    key: 'Use of Force.',
                    value:
                      'Use of force by public agents must be necessary, proportional, and least harmful. Lethal force is permitted only where strictly necessary to prevent imminent threat of death or grave bodily harm. All serious force incidents require independent investigation and public reporting consistent with privacy and safety standards.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value:
                      'Detention and enforcement must have hard limits. Courts must review quickly. Warrants must be specific. Unlawfully obtained evidence gets thrown out. Force has strict rules.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-8-labor-rights-and-press-protections',
                kind: 'section',
                level: 3,
                label: 'Section 8',
                title: 'Labor Rights and Press Protections',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Labor Rights.',
                    value: 'Workers have the right to:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'organize, join, and form unions and worker associations;',
                      },
                      {
                        text: 'bargain collectively;',
                      },
                      {
                        text: 'engage in concerted activity including strikes, subject only to narrow, evidence-based limits necessary to prevent immediate and substantial harm to life or essential services, using least-restrictive means.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'No Political Suppression via Employment.',
                    value:
                      'No public body and no major vendor performing public functions may condition employment, contracting, housing access, or essential services on political viewpoint or lawful organizing activity.',
                  },
                  {
                    type: 'kv',
                    key: 'Press and Journalism Protections.',
                    value: 'Freedom of the press is protected. No public body may:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'censor lawful journalism;',
                      },
                      {
                        text: 'retaliate against journalists or publishers for lawful reporting; or',
                      },
                      {
                        text: 'compel disclosure of confidential sources except under strict judicial standards where necessary to prevent imminent and grave bodily harm and no less restrictive means exists.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Anti-SLAPP and Legal Harassment Protection.',
                    value:
                      'Implementing law shall provide expedited dismissal and fee-shifting remedies for lawsuits primarily intended to intimidate, silence, or financially exhaust speech, journalism, organizing, or petitioning.',
                  },
                  {
                    type: 'kv',
                    key: 'Records Access Reinforcement.',
                    value:
                      'The right to public records access and retention protections stated elsewhere in this Constitution is enforceable as a right under this Article, with standing and remedies under Section 0.',
                  },
                  {
                    type: 'p',
                    text: 'In any conflict among clauses in this Section, the interpretation most protective of the right to organize and strike shall control, except where necessary to prevent imminent risk to life under the standards herein. For purposes of any restriction under this Section, “essential services” shall be defined consistently with Article I, Section 0 (Essential, Safety-Critical, or Rights-Impacting Procurement Category) and interpreted narrowly.',
                  },
                  {
                    type: 'p',
                    text: 'Any limit on organizing, concerted activity, or strikes based on essential services must satisfy strict scrutiny, supported by written findings showing necessity, proportionality, and least-restrictive means.',
                  },
                  {
                    type: 'p',
                    text: 'No injunction may be issued against a strike absent clear and convincing evidence of an imminent risk to life, and any injunction must be narrowly scoped and limited to the minimum duration necessary.',
                  },
                  {
                    type: 'p',
                    text: 'Implementing law shall guarantee minimum service continuity through least-restrictive measures, which may include emergency staffing pools, mutual aid agreements, temporary reassignments, and contingency operations, but shall not compel labor, impose punitive detention conditions, or condition basic rights or necessities on labor. Failure to enact or maintain minimum service continuity measures consistent with this Section constitutes a rights violation enforceable under Section 0 remedies, including structural compliance orders.',
                  },
                  {
                    type: 'p',
                    text: 'No continuity plan may be used as a pretext for union busting or permanent replacement.',
                  },
                  {
                    type: 'p',
                    text: 'Permanent replacement of striking workers in essential services is prohibited absent a court finding of large-scale corruption or sabotage.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value:
                      'Workers can organize and strike. Journalism and sources are protected. The law must stop lawsuits used to silence people.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-9-freedom-from-slavery-and-forced-labor',
                kind: 'section',
                level: 3,
                label: 'Section 9',
                title: 'Freedom from Slavery and Forced Labor',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Freedom from Slavery and Forced Labor.',
                    value:
                      'Slavery and involuntary servitude are prohibited. Forced labor is prohibited in all contexts, including detention, incarceration, or other state custody.',
                  },
                  {
                    type: 'p',
                    text: 'Work programs in custody are permitted only if participation is voluntary, conditions meet health and dignity standards defined by law, and compensation is no less than the jurisdictional living wage (or a higher floor set by law), and is not conditioned on access to basic needs, safety, medical care, family contact, grievance processes, or legal process. Any custodial work program that fails the voluntariness or compensation requirements of this Section is unlawful and shall be enjoined upon suit under Section 0.',
                  },
                  {
                    type: 'p',
                    text: 'The “living wage” shall be defined by law using a transparent cost-of-living method and reviewed at least annually.',
                  },
                  {
                    type: 'p',
                    text: 'No person may be compelled to labor to satisfy private debts, private profit, or political coercion.',
                  },
                  {
                    type: 'p',
                    text: 'No person in custody may waive the protections of this Section, and any purported waiver is void.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value:
                      'No forced work. Custody work must be genuinely voluntary and not tied to survival or rights.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-10-freedom-of-conscience-religion-and-belief',
                kind: 'section',
                level: 3,
                label: 'Section 10',
                title: 'Freedom of Conscience, Religion, and Belief',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Freedom of Conscience.',
                    value:
                      'All persons have the right to freedom of conscience, belief, and religion, including the right to change beliefs, to hold no religion, and to practice or not practice without coercion or penalty.',
                  },
                  {
                    type: 'p',
                    text: 'No Public Body may impose a religious test, compel religious observance, or deny rights, services, or protections based on religion or belief.',
                  },
                  {
                    type: 'p',
                    text: 'No Public Body may endorse, fund, or privilege a religion in a manner that denies equal protection or coerces participation.',
                  },
                  {
                    type: 'p',
                    text: 'Any limitation must satisfy necessity, proportionality, and least-restrictive means, and must be viewpoint-neutral.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value: 'The state cannot force beliefs or punish people for beliefs.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-11-freedom-of-movement-and-the-right-to-exit',
                kind: 'section',
                level: 3,
                label: 'Section 11',
                title: 'Freedom of Movement and the Right to Exit',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Freedom of Movement.',
                    value:
                      'All persons have the right to move freely within the jurisdiction, to relocate residence, and to travel, subject only to narrow limits necessary to protect public safety and consistent with due process.',
                  },
                  {
                    type: 'kv',
                    key: 'Right to Exit.',
                    value:
                      'All persons have the right to leave the jurisdiction. Restrictions on exit are prohibited except pursuant to a court order based on individualized findings and strict standards defined by law, or as a time-limited emergency measure that satisfies Article VIII and strict scrutiny.',
                  },
                  {
                    type: 'kv',
                    key: 'Plain meaning.',
                    value: 'People can move and leave, and the state needs strong reasons to stop them.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-v-transition-plan',
            kind: 'article',
            level: 2,
            label: 'Article V',
            title: 'Transition Plan',
            blocks: [
              {
                type: 'p',
                text: 'Phased Implementation: This Constitution will be implemented in phases over 10 years, with milestones for decentralization, civic education, and technological equity.',
              },
              {
                type: 'p',
                text: 'Global Collaboration: A Global Transition Council will facilitate international cooperation on shared challenges, including climate change and technological ethics.',
              },
              {
                type: 'p',
                text: 'Public Consultation: Annual public forums will gather feedback on the Constitution’s implementation, ensuring it remains adaptive and responsive.',
              },
              {
                type: 'p',
                text: 'Economic Transition: A Transitional Economic Council will oversee the shift to worker-owned enterprises and fair labor practices, ensuring a just and equitable transition.',
              },
              {
                type: 'p',
                text: 'Conflict Resolution Mechanism: A Cultural and Ideological Mediation Council will address potential clashes between cultural or ideological values, promoting dialogue and reconciliation.',
              },
              {
                type: 'p',
                text: 'Technological Implementation: The Digital Equity Fund and Technology Ethics Council will be funded through a combination of public budgets, corporate contributions, and international grants, ensuring sustainable operations.',
              },
              {
                type: 'p',
                text: 'Decentralization and Cohesion: A National Cohesion Council will ensure that decentralization does not compromise national or global cohesion, particularly for cross-border issues like climate change and pandemics.',
              },
              {
                type: 'p',
                text: 'Public Engagement: Participatory budgeting will be mandated at all levels of governance, ensuring ongoing public involvement in decision-making processes.',
              },
              {
                type: 'p',
                text: 'Transition institutions created under this Article are limited to the powers expressly stated and may not exercise coercive authority unless explicitly authorized by this Constitution.',
              },
              {
                type: 'p',
                text: 'Each transition institution must have a defined sunset date and dissolves automatically unless renewed by law with written findings and judicial review for capture risk.',
              },
              {
                type: 'p',
                text: 'In any conflict, constitutional rights and the elected legislative process control.',
              },
            ],
            children: [],
          },
          {
            id: 'article-vi-foreign-policy-defense-global-cooperation',
            kind: 'article',
            level: 2,
            label: 'Article VI',
            title: 'Foreign Policy, Defense, & Global Cooperation',
            blocks: [
              {
                type: 'p',
                text: 'Peace-Centered Diplomacy: Foreign policy prioritizes peace-building, humanitarian aid, and cooperation.',
              },
              {
                type: 'p',
                text: 'Defense: Defensive capacity is maintained strictly for protection against aggression. Militarization for profit or expansion is prohibited.',
              },
              {
                type: 'p',
                text: 'Global Agreements: The Federated Assembly may enter treaties and global compacts that uphold human rights, ecological protection, and fair trade.',
              },
              {
                type: 'p',
                text: 'Refugee and Asylum Rights: Individuals fleeing persecution or ecological catastrophe have the right to asylum under fair procedures.',
              },
            ],
            children: [],
          },
          {
            id: 'article-vii-economic-fiscal-framework',
            kind: 'article',
            level: 2,
            label: 'Article VII',
            title: 'Economic & Fiscal Framework',
            blocks: [],
            children: [
              {
                id: 'section-1-economic-justice',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Economic Justice',
                blocks: [
                  {
                    type: 'p',
                    text: 'Worker Ownership: Worker-owned cooperatives and democratic enterprises are prioritized through incentives and supportive laws.',
                  },
                  {
                    type: 'p',
                    text: 'Anti-Monopoly Safeguards: Corporate monopolies and cartel behavior are prohibited. Breakups and structural remedies are permitted.',
                  },
                  {
                    type: 'p',
                    text: 'Universal Basic Services: Healthcare, education, housing support, and essential utilities are guaranteed.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-fiscal-responsibility',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Fiscal Responsibility',
                blocks: [
                  {
                    type: 'p',
                    text: 'Progressive Taxation: Tax policy must be progressive and reduce wealth inequality.',
                  },
                  {
                    type: 'p',
                    text: 'Public Budgets: Budgets are transparent, participatory at local levels, and subject to audit.',
                  },
                  {
                    type: 'p',
                    text: 'Monetary Policy: A public monetary authority must manage currency and monetary policy, ensuring stability and equitable access to credit. Regional banks will operate under federal guidelines.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-resource-prioritization',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Resource Prioritization',
                blocks: [
                  {
                    type: 'p',
                    text: 'Core Minimum Obligations: In times of resource scarcity, funding will prioritize basic rights (e.g., healthcare, food, water, shelter) over non-essential programs.',
                  },
                  {
                    type: 'p',
                    text: 'Economic Resilience Fund: A reserve fund will be established to address economic downturns, natural disasters, or other crises.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-viii-emergency-powers-safeguards',
            kind: 'article',
            level: 2,
            label: 'Article VIII',
            title: 'Emergency Powers & Safeguards',
            blocks: [],
            children: [
              {
                id: 'section-1-emergency-declarations',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Emergency Declarations',
                blocks: [
                  {
                    type: 'p',
                    text: 'Definition: An emergency is a temporary condition posing an immediate and significant threat to public safety, national security, or ecological stability, where ordinary legal processes are insufficient for timely response.',
                  },
                  {
                    type: 'p',
                    text: 'Declaration Process: Emergency declarations require approval by a two-thirds majority of the Federated Assembly and the Resilience Council. Declarations must specify scope, geography, duration, and the precise powers invoked.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency & Public Notice: Every declaration must be accompanied by a public report stating facts, objectives, alternatives considered, and why less-restrictive tools are inadequate.',
                  },
                  {
                    type: 'p',
                    text: 'Duration and Renewal: Emergency measures expire after 60 days unless renewed. Renewals require a two-thirds vote of the Federated Assembly. Any emergency extending beyond 180 days requires a public referendum for continuation.',
                  },
                  {
                    type: 'p',
                    text: 'The Resilience Council evaluates emergency evidence, recommends permissible measures under this Article, monitors implementation risks, and issues written public reasoning.',
                  },
                  {
                    type: 'p',
                    text: 'Recommendations must be based on published evidentiary standards, including:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'specific threat description and scope,',
                      },
                      {
                        text: 'measurable objectives,',
                      },
                      {
                        text: 'alternatives considered,',
                      },
                      {
                        text: 'rights impacts and mitigation steps,',
                      },
                      {
                        text: 'why less-restrictive tools are inadequate.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'Members must disclose conflicts and recuse where conflicts are material.',
                  },
                  {
                    type: 'p',
                    text: 'No member may hold a Senior role in a Major Vendor materially involved in emergency procurement, surveillance-adjacent services, detention services, or emergency logistics in the jurisdiction within the prior 24 months.',
                  },
                  {
                    type: 'p',
                    text: 'Minority dissent statements must be published with the recommendation.',
                  },
                  {
                    type: 'p',
                    text: 'All votes, recusals, and evidence summaries must be logged publicly with narrow redactions.',
                  },
                  {
                    type: 'p',
                    text: 'Resilience Council recommendations and conflict determinations are subject to expedited review by the Federal High Court.',
                  },
                  {
                    type: 'p',
                    text: 'Exclusive Governance of Emergency Measures. Emergency declarations, emergency measures, and any extensions, renewals, or referendum requirements are governed exclusively by this Article. No other Article may be construed to expand emergency authority beyond the closed list and safeguards herein.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-closed-list-of-permitted-emergency-measures',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Closed List of Permitted Emergency Measures',
                blocks: [
                  {
                    type: 'p',
                    text: 'Only the following measures may be authorized by emergency declaration, and only to the extent necessary:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'Accelerated procurement for essential supplies, with immediate publication of vendors, prices, and conflict disclosures.',
                      },
                      {
                        text: 'Temporary redeployment of public personnel and resources.',
                      },
                      {
                        text: 'Time-limited restrictions on access to specific unsafe zones.',
                      },
                      {
                        text: 'Temporary rationing or price controls for essential goods to prevent hoarding and exploitation.',
                      },
                      {
                        text: 'Temporary public health measures grounded in evidence, with exemptions where feasible.',
                      },
                      {
                        text: 'Temporary suspension of non-essential regulatory requirements that would materially delay response, excluding rights protections.',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Prohibited Measures: No emergency declaration may suspend elections, abolish courts, eliminate oversight bodies, authorize mass surveillance, permit indefinite detention, or censor political dissent.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: 'section-3-rights-derogation-standard',
                kind: 'section',
                level: 3,
                label: 'Section 3',
                title: 'Rights Derogation Standard',
                blocks: [
                  {
                    type: 'p',
                    text: 'Any emergency measure that limits rights must satisfy necessity, proportionality, and least-restrictive means. Written findings are mandatory. Measures affecting detention, surveillance, speech, assembly, voting, or bodily autonomy require expedited judicial review.',
                  },
                ],
                children: [],
              },
              {
                id: 'section-4-oversight-review-and-postmortem',
                kind: 'section',
                level: 3,
                label: 'Section 4',
                title: 'Oversight, Review, and Postmortem',
                blocks: [
                  {
                    type: 'p',
                    text: 'Judicial Review: The Federal High Court may review emergency declarations and measures on an expedited schedule and may enjoin unlawful actions immediately.',
                  },
                  {
                    type: 'p',
                    text: 'Residents’ Emergency Oversight Panel: A Residents’ Emergency Oversight Panel monitors implementation, receives complaints, and publishes biweekly public reports. Selection, tenure, removal, and composition are governed by Article X.',
                  },
                  {
                    type: 'p',
                    text: 'After-Action Accountability: Within 90 days of the end of an emergency, a public postmortem must be issued detailing actions taken, rights impacts, expenditures, outcomes, and lessons learned. Failure to publish triggers automatic budget holds on the responsible agency and mandatory hearings.',
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'article-ix-amendment-process',
            kind: 'article',
            level: 2,
            label: 'Article IX',
            title: 'Amendment Process',
            blocks: [
              {
                type: 'p',
                text: 'Proposal: Amendments may be proposed by a two-thirds majority of the Federated Assembly, a petition signed by 10% of the electorate, or a recommendation from the Public Review Commission.',
              },
              {
                type: 'p',
                text: 'Ratification: Amendments must be approved by a two-thirds majority of the Federated Assembly and ratified by a majority public referendum.',
              },
              {
                type: 'p',
                text: 'Protected Principles: Amendments may not abolish (a) democratic self-governance through free and fair elections, (b) the enforceability of fundamental rights in Article IV, or (c) the duty of ecological stewardship. This limitation bars abolition or nullification of these cores, and does not prohibit ordinary policy change consistent with them.',
              },
            ],
            children: [],
          },
          {
            id: 'article-x-selection-tenure-and-institutional-integrity',
            kind: 'article',
            level: 2,
            label: 'Article X',
            title: 'Selection, Tenure, and Institutional Integrity',
            blocks: [],
            children: [
              {
                id: 'section-1-universal-standards',
                kind: 'section',
                level: 3,
                label: 'Section 1',
                title: 'Universal Standards',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Purpose.',
                    value:
                      'This Article establishes uniform rules for selection, tenure, removal, transparency, and anti-capture safeguards for all constitutional offices, councils, commissions, panels, agencies, authorities, courts, and emergency bodies.',
                  },
                  {
                    type: 'kv',
                    key: 'Required Elements.',
                    value:
                      'No constitutional body may exercise coercive, adjudicatory, oversight, fiscal, procurement, or rights-impacting authority unless its selection method, eligibility, incompatibilities, term structure, removal process, and disclosure obligations are stated in this Article.',
                  },
                  {
                    type: 'kv',
                    key: 'Selection Methods.',
                    value: 'The following selection methods are recognized:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Elected: chosen by the relevant electorate through a secret ballot.',
                      },
                      {
                        text: 'Appointed: selected by a specified selector through a public process.',
                      },
                      {
                        text: 'Sortition: randomly selected from an eligible pool under publicly auditable procedures.',
                      },
                      {
                        text: 'Mixed: selected through two or more independent channels.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Eligible individuals must be Adult Residents of the relevant jurisdiction, unless otherwise stated.',
                      },
                      {
                        text: 'Additional qualifications must be competency-based, viewpoint-neutral, and narrowly tailored.',
                      },
                      {
                        text: 'Individuals convicted of corruption or violent political intimidation are ineligible for constitutional office for a period defined by law, subject to judicial review for proportionality.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Incompatibilities Baseline.',
                    value: 'No person may concurrently hold:',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'An executive enforcement role and an oversight or audit role over the same domain.',
                      },
                      {
                        text: 'A judicial role and a prosecutorial, police, detention, or intelligence authority role.',
                      },
                      {
                        text: 'A procurement authority role and any compensated relationship with vendors eligible for public contracts.',
                      },
                      {
                        text: 'A leadership role in a political party and membership in or on election administration, oversight, or adjudicatory bodies, except as nonvoting testimony roles as defined by law.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'A minimum 24-month cooling-off period applies from senior lobbying, major procurement-vendor leadership, or senior corporate regulatory affairs roles into related regulatory, oversight, election, or adjudicatory bodies.',
                      },
                      {
                        text: 'A minimum 24-month cooling-off period applies from senior oversight roles into executive leadership of agencies substantially overseen by that body.',
                      },
                      {
                        text: '“Senior” and “major vendor” shall be defined by law using objective thresholds, and shall include controlled affiliates and materially compensated contractors.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Terms must be fixed and public.',
                      },
                      {
                        text: 'Seats shall be staggered where feasible so that no more than one-half of seats expire within a single cycle.',
                      },
                      {
                        text: 'Where a term limit is not stated, the default limit is two consecutive terms.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Removal mechanisms are limited to recall, impeachment, judicial removal for cause, administrative removal for cause, or automatic disqualification.',
                      },
                      {
                        text: 'Removals require written charges, timely hearing rights, a reasoned decision with findings, and an appeal path.',
                      },
                      {
                        text: 'Temporary suspension is permitted only to prevent imminent or irreparable harm, and must be followed by a prompt hearing.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Members must disclose assets, significant income sources, gifts above a modest threshold, outside employment, and material family conflicts, as defined by law.',
                      },
                      {
                        text: 'Material conflicts require recusal.',
                      },
                      {
                        text: 'Votes, decisions, enforcement actions, and budgets must be logged publicly, with redactions only as strictly necessary for privacy, safety, or active investigations.',
                      },
                      {
                        text: 'Willful nondisclosure or false disclosure triggers automatic suspension pending hearing, and may constitute cause for removal.',
                      },
                    ],
                  },
                  {
                    type: 'p',
                    text: 'Certain constitutional functions require protected baseline funding to prevent capture by defunding.',
                  },
                  {
                    type: 'p',
                    text: 'The following must receive baseline appropriations sufficient for independent operation: courts; election administration authorities; Public Review Commission; Oversight Coordination Council; Independent Oversight Committee; Whistleblower Protection Agency; Data Protection Authority; Technology Ethics Council; Civic Literacy Program; Trained Civic Pool administration; Residents’ Emergency Oversight Panel.',
                  },
                  {
                    type: 'p',
                    text: 'Implementing law shall establish objective minimum funding floors using a per-capita formula or a fixed percentage of the jurisdiction’s general fund, indexed for inflation and workload.',
                  },
                  {
                    type: 'p',
                    text: 'If the legislature fails to enact a compliant appropriation, a continuing appropriation at the prior year’s inflation-adjusted level shall automatically apply.',
                  },
                  {
                    type: 'p',
                    text: 'Any Resident or oversight body has standing to challenge unconstitutional underfunding, and courts may order specific appropriations as structural remedies where necessary for constitutional compliance.',
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Threats, harassment, retaliation, doxxing, or coercion directed at officials, sortition participants, whistleblowers, witnesses, journalists, or petition organizers are prohibited and punishable.',
                      },
                      {
                        text: 'Oversight and judicial bodies shall have protected baseline budgets for independent counsel, security, and continuity.',
                      },
                      {
                        text: 'No removal, recall, or discipline process may be conducted using intimidation, discriminatory enforcement, or unlawful surveillance.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'Sortition shall use publicly auditable procedures, including publication of eligibility rules, sampling method, and anonymized selection statistics.',
                      },
                      {
                        text: 'Jurisdictions shall fund training, accessibility accommodations, and compensation sufficient to make participation feasible, and implementing law shall treat these as mandatory baseline appropriations not subject to discretionary reduction below the minimum necessary for feasible participation.',
                      },
                      {
                        text: 'Opt-out is permitted for hardship, with replacement by next eligible draw.',
                      },
                      {
                        text: 'Tampering with sortition is a grave constitutional offense.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Office Registry.',
                    value:
                      'A public registry shall list every constitutional body and office, including powers, membership, selection rules, terms, vacancies, recusals, budgets, and enforcement logs, and shall provide a plain-language summary updated at least annually.',
                  },
                  {
                    type: 'kv',
                    key: 'Requirement.',
                    value:
                      'No individual may assume or exercise constitutional authority, nor exercise delegated Public Function authority on behalf of a Public Body, unless they have sworn or affirmed the oath required by this subsection.',
                  },
                  {
                    type: 'kv',
                    key: 'Timing and Record.',
                    value:
                      'The oath shall be administered before the individual assumes authority. The oath record shall be filed in the Office Registry. A public record shall include the oath text, date, and office, with redactions only as strictly necessary for personal safety.',
                  },
                  {
                    type: 'kv',
                    key: 'Permitted Content and Limits.',
                    value:
                      'The oath shall bind the individual to constitutional duties and lawful compliance only. The oath shall not require endorsement of any ideology, party, religion, or policy platform, and shall not impose a religious test.',
                  },
                  {
                    type: 'kv',
                    key: 'Minimum Oath Content.',
                    value: 'The oath shall include, at minimum, duties to:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'uphold this Constitution and the rights in Article IV;',
                      },
                      {
                        text: 'act in good faith consistent with Article I, Section 0 (Interpretation);',
                      },
                      {
                        text: 'obey lawful orders of the Federal High Court and comply with lawful temporary suspensions issued within constitutional scope;',
                      },
                      {
                        text: 'refuse to carry out orders or directives the individual reasonably believes are unconstitutional, and promptly seek review through protected channels defined by law;',
                      },
                      {
                        text: 'disclose material conflicts of interest and comply with recusal rules; and',
                      },
                      {
                        text: 'preserve records and evidence as required by this Constitution and law consistent with it.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Coercion and Conscience Protections.',
                    value:
                      'The oath may be sworn or affirmed. No person shall be penalized for choosing affirmation rather than swearing. Any oath obtained by coercion, threat, retaliation, or unlawful surveillance is void, and the coercive act constitutes a grave constitutional offense.',
                  },
                  {
                    type: 'kv',
                    key: 'High-Risk Role Addendum.',
                    value:
                      'For roles exercising any of the following: election administration, adjudication, detention authority, oversight and investigation, surveillance approval, public procurement in Essential, Safety-Critical, or Rights-Impacting Procurement Categories, or public data systems used for Rights-Impacting Decisions, implementing law shall require an additional oath addendum committing to:',
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'strict neutrality and equal access in rights-impacting administration;',
                      },
                      {
                        text: 'prompt reporting of bribery, coercion, vendor interference, intimidation, retaliation, or tampering to the competent oversight body;',
                      },
                      {
                        text: 'heightened records, auditability, and evidence log duties; and',
                      },
                      {
                        text: 'recusal and disqualification safeguards exceeding the baseline where necessary to prevent capture.',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    ordered: true,
                    items: [
                      {
                        text: 'A willful and material breach of the oath constitutes cause for removal under this Article, subject to written charges, hearing rights, a reasoned decision with findings, and an appeal path.',
                      },
                      {
                        text: '“Willful and material” means a knowing or reckless violation that foreseeably causes substantial harm to rights, democratic processes, public integrity, or lawful oversight, or that involves corruption, intimidation, unlawful surveillance, records destruction, or refusal to comply with lawful constitutional orders.',
                      },
                      {
                        text: 'Knowing false swearing or materially false oath filings constitute a grave constitutional offense punishable by law, consistent with due process and proportionality.',
                      },
                    ],
                  },
                  {
                    type: 'kv',
                    key: 'Annual Reaffirmation and Amendment Acknowledgment.',
                    value:
                      'Implementing law shall require annual reaffirmation for continuing officeholders, and an acknowledgment following any constitutional amendment, limited to confirming continued duty to comply with the amended text.',
                  },
                ],
                children: [],
              },
              {
                id: 'universal-oath-of-constitutional-duty-all-constitutional-offices-and-public-function-delegates',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'Universal Oath of Constitutional Duty (all constitutional offices and Public Function delegates)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I swear or affirm, without reservation, that I will uphold and defend this Constitution and the rights it guarantees. I will act in good faith to maximize human dignity, democratic accountability, and ecological stewardship, and to minimize arbitrary power. I will disclose material conflicts of interest, recuse when required, preserve and produce records as required, and comply with lawful orders of the Federal High Court and other constitutional authorities acting within their lawful scope. If I reasonably believe an order or directive is unconstitutional, I will refuse to carry it out and will promptly seek review through lawful, protected channels.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-elections-administration-ieaa-and-election-workers-with-delegated-authority',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'High-Risk Addendum: Elections Administration (IEAA and election workers with delegated authority)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will administer elections and referenda with neutrality, equal access, and uniform procedures. I will protect ballot integrity and the right to vote, provide timely cure processes, maintain chain-of-custody and evidence logs, and cooperate with audits and judicial review. I will report intimidation, suppression, fraud, vendor interference, or tampering to the competent oversight body and the courts when required. I will not permit undisclosed vendor influence or black-box decision systems in any rights-impacting election function.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-courts-and-adjudication-local-courts-regional-appellate-councils-federal-high-court-tribunals-panels',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'High-Risk Addendum: Courts and Adjudication (Local Courts, Regional Appellate Councils, Federal High Court, tribunals, panels)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will decide matters independently, impartially, and with due process. I will provide reasoned decisions, respect precedent and constitutional limits, disclose conflicts and recuse when required, and protect access to courts. I will not allow intimidation, retaliation, corruption, or improper influence to affect adjudication. I will protect records, evidence, and the integrity of proceedings, and will ensure expedited review where this Constitution requires it.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-oversight-and-investigation-prc-occ-ioc-wpa-inspectors-auditors',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'High-Risk Addendum: Oversight and Investigation (PRC, OCC, IOC, WPA, inspectors, auditors)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will conduct oversight and investigations based on evidence, published standards, and due process. I will avoid duplication without necessity, honor OCC lead-jurisdiction assignments, and document scope and timelines. I will protect whistleblowers, witnesses, and journalists from retaliation, and I will refer matters to the competent body rather than exceeding my mandate. I will publish required logs and reports with only the narrowest necessary redactions, and I will submit to audit and judicial review.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-detention-enforcement-and-use-of-force-authority-public-custody-detention-decision-makers-enforcement-commanders',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'High-Risk Addendum: Detention, Enforcement, and Use-of-Force Authority (public custody, detention decision-makers, enforcement commanders)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will respect the absolute prohibition of torture and cruel, inhuman, or degrading treatment. I will ensure prompt judicial review, prohibit indefinite detention, and uphold due process, access to counsel, and humane conditions. I will authorize or use force only when necessary, proportional, and least harmful, and will ensure independent investigation and required public reporting for serious force incidents. I will never compel labor, and I will ensure any work in custody is voluntary and compensated no less than the jurisdictional living wage, and never conditioned on basic needs or rights.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-procurement-and-contracting-in-essential-safety-critical-or-rights-impacting-categories-procurement-authorities-contracting-officers-emergency-procurement-leads',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'High-Risk Addendum: Procurement and Contracting in Essential, Safety-Critical, or Rights-Impacting Categories (procurement authorities, contracting officers, emergency procurement leads)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will conduct procurement to prevent capture, corruption, and single-point-of-failure risk. I will disclose conflicts, prohibit vendor interference, and reject contract splitting or pass-through arrangements intended to evade thresholds or oversight. I will publish required contract terms, pricing, and conflict disclosures, with only narrowly necessary security redactions. I will protect continuity of essential services, ensure auditability, maintain evidence logs, and cooperate with independent audits and judicial review.”',
                  },
                ],
                children: [],
              },
              {
                id: 'high-risk-addendum-public-data-identity-and-rights-impacting-decision-systems-dpa-system-owners-administrators-delegated-platform-operators',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'High-Risk Addendum: Public Data, Identity, and Rights-Impacting Decision Systems (DPA, system owners, administrators, delegated platform operators)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that I will protect privacy and constitutional limits on surveillance. I will implement data minimization, purpose limitation, retention limits, and secure access controls. I will not deploy or rely on proprietary black-box systems for rights-impacting decisions, and will ensure transparency, auditability, and explainability as required by this Constitution. I will report breaches promptly, preserve logs and evidence, and cooperate with DPA enforcement, audits, and judicial review.”',
                  },
                ],
                children: [],
              },
              {
                id: 'optional-addendum-emergency-powers-and-response-resilience-council-emergency-administrators-residents-emergency-oversight-panel',
                kind: 'topic',
                level: 3,
                label: null,
                title:
                  'Optional Addendum: Emergency Powers and Response (Resilience Council, emergency administrators, Residents’ Emergency Oversight Panel)',
                blocks: [
                  {
                    type: 'p',
                    text: '“I affirm that emergency authority is limited, time-bound, and governed exclusively by Article VIII. I will recommend or implement only measures within the closed list, supported by written findings of necessity, proportionality, and least-restrictive means. I will not use emergency authority to suspend elections, abolish courts, eliminate oversight, authorize mass surveillance, permit indefinite detention, or censor political dissent. I will support public notice, evidence summaries, oversight reporting, and postmortem accountability.”',
                  },
                ],
                children: [],
              },
              {
                id: 'section-2-office-roster-and-rules',
                kind: 'section',
                level: 3,
                label: 'Section 2',
                title: 'Office Roster and Rules',
                blocks: [
                  {
                    type: 'kv',
                    key: 'Authority.',
                    value:
                      'The following bodies are constituted with the stated selection and tenure rules. Where another Article provides a selection rule, this Article governs any omitted details and controls in the event of conflict unless the other Article expressly states it supersedes this Article.',
                  },
                ],
                children: [
                  {
                    id: 'subsection-a-community-and-regional-governance',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection A',
                    title: 'Community and Regional Governance',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'community-councils',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Community Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Elected by the community electorate through secret ballot.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility: Adult Residents of the community.',
                  },
                  {
                    type: 'p',
                    text: 'Incompatibilities: No concurrent service as senior local police or detention leadership, local judge, or senior local procurement authority.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years, staggered so approximately one-half of seats are elected every two years. Maximum two consecutive terms.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Recall under Article I thresholds; judicial removal for corruption or rights violations upon clear and convincing evidence.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Public meetings, recorded sessions, published budgets, and disclosures.',
                  },
                ],
                children: [],
              },
              {
                id: 'regional-councils',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Regional Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Sixty percent elected using proportional methods; forty percent selected by sortition from a trained civic pool.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility: Adult Residents of the region; sortition pool excludes senior party officers and senior corporate officers.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Elected seats four years; sortition seats two years; staggered so no more than one-quarter of total seats turn over in any single year.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Elected seats via recall; sortition seats by judicial removal for cause; impeachment for corruption by two-thirds vote of the council subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Votes, resource allocation formulas, and arbitration procedures public with narrow privacy protections.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-b-national-legislature-and-executive-administration',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection B',
                    title: 'National Legislature and Executive Administration',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'federated-assembly',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Federated Assembly',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Elected by regions using proportional representation with minority representation protections.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility: Adult Residents.',
                  },
                  {
                    type: 'p',
                    text: 'Incompatibilities: No concurrent service on the Federal High Court, OCC, Public Review Commission, or as Administrator-General.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years; staggering permitted by law, consistent with fair representation.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Recall; impeachment for corruption or grave abuse by two-thirds vote, subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Committee votes recorded; lobbying contacts logged; campaign finance disclosures required.',
                  },
                ],
                children: [],
              },
              {
                id: '1-administrator-general',
                kind: 'topic',
                level: 3,
                label: null,
                title: '(1) Administrator-General',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Nominated by the Federated Assembly and confirmed through a public hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility: Competency standards required.',
                  },
                  {
                    type: 'p',
                    text: 'Incompatibilities: No senior party office during term; cooling-off applies.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six years, renewable once, with confirmation cycle offset from general elections where feasible.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Majority removal by the Federated Assembly with written findings; recall; judicial removal for corruption or rights violations.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Procurement logs, contracts, and disclosures required.',
                  },
                ],
                children: [],
              },
              {
                id: '2-senior-administrators-and-agency-heads',
                kind: 'topic',
                level: 3,
                label: null,
                title: '(2) Senior Administrators and Agency Heads',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed by the Administrator-General following a public committee hearing and published competency findings.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Five years, staggered across agencies.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Administrative removal for cause with appeal; judicial process for corruption.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Disclosures, recusals, audits, and public action logs required.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-c-courts-justice-and-adjudicatory-bodies',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection C',
                    title: 'Courts, Justice, and Adjudicatory Bodies',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'local-courts',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Local Courts',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Judges elected by the community electorate through secret ballot.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility: Legal competency standards defined by law.',
                  },
                  {
                    type: 'p',
                    text: 'Incompatibilities: No prosecutor or police command role in the same community within four years.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six years, staggered.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Preferred method is judicial discipline for cause. Recall is permitted only if implementing law establishes strong anti-intimidation protections consistent with Article X, Section 1, Anti-Intimidation and Retaliation.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Published decisions with privacy protections; disclosures and recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'regional-appellate-councils',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Regional Appellate Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Majority appointed by a regional merit commission with public hearings; minority selected by sortition as trained lay adjudicators with oversight functions defined by law.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Eight-year nonrenewable, staggered.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial discipline for cause; impeachment for corruption by two-thirds vote of Regional Council subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Published opinions, disclosures, and recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'federal-high-court',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Federal High Court',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed through a transparent, merit-based process following nomination by a Judicial Selection Panel.',
                  },
                  {
                    type: 'p',
                    text: 'Judicial Selection Panel: Mixed. One-third selected by sortition from a trained civic pool, one-third selected by accredited legal professional bodies, and one-third confirmed by the Federated Assembly in public session.',
                  },
                  {
                    type: 'p',
                    text: 'Eligibility and incompatibilities: Demonstrated legal competence required; no senior party office within six years; no senior corporate counsel, lobbying, or surveillance-vendor leadership within four years in domains regularly litigated before the Court.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Twelve-year nonrenewable, staggered so no more than one-fifth of seats expire in any two-year period.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Removal only for cause through an independent judicial discipline tribunal, or impeachment for corruption by two-thirds vote of the Federated Assembly. No recall.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Published opinions; disclosures; recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'legal-ombudsman',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Legal Ombudsman',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed by the Public Review Commission and confirmed by the Regional Council through public hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six-year nonrenewable.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; impeachment by two-thirds vote of the Regional Council for corruption, subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Anonymized public reporting; disclosures and recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'mediation-councils',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Mediation Councils',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Sortition from a trained mediator pool maintained by each community.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Two years, rolling cohorts.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; temporary suspension permitted only with prompt hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency and conflicts: Aggregate anonymized reporting; disclosures and recusals required.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-d-oversight-and-integrity-institutions',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection D',
                    title: 'Oversight and Integrity Institutions',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'public-review-commission',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Public Review Commission',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Seventy percent sortition from a trained civic review pool; thirty percent appointed technical experts via public hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Five years, staggered so one-fifth expires annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Methods, datasets, and findings public with privacy protections.',
                  },
                ],
                children: [],
              },
              {
                id: 'oversight-coordination-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Oversight Coordination Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. One-third appointed by the Federated Assembly with minority protections, one-third appointed by the Public Review Commission, one-third selected by sortition from a qualified civic audit pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six years, staggered annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; impeachment for corruption by two-thirds vote of the Federated Assembly.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Charters, memoranda, directives, and dispute resolutions public.',
                  },
                ],
                children: [],
              },
              {
                id: 'independent-oversight-committee',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Independent Oversight Committee',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed through a transparent, multi-stakeholder process with public notice, comment, and published reasons.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six years, staggered so no more than one-third of seats expire in any two-year period.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Subject to recall under Article I thresholds; judicial removal for cause.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Enforcement logs public with narrow redactions; disclosures and recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'whistleblower-protection-agency',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Whistleblower Protection Agency',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Director appointed by the Administrator-General and confirmed by public hearing; Internal Inspector selected by sortition from qualified civic audit pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Director six years renewable once; Inspector three years.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; Director removable by majority of the Federated Assembly with written findings.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Anonymized reports and retaliation outcomes public; disclosures required.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-e-rights-and-technology-institutions',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection E',
                    title: 'Rights and Technology Institutions',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'data-protection-authority',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Data Protection Authority',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. One-half appointed by the Federated Assembly with minority protections, one-half selected by sortition from a trained digital rights and technical civic pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Six years, staggered so one-third expires every two years.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; impeachment for corruption by two-thirds vote of the Federated Assembly.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Breach notices, audits, and enforcement actions public with narrow redactions.',
                  },
                ],
                children: [],
              },
              {
                id: 'technology-ethics-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Technology Ethics Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. One-third elected by accredited professional associations, one-third appointed by the Public Review Commission, one-third selected by sortition from trained public members.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years, staggered so one-quarter expires annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; impeachment for corruption by two-thirds vote of the Oversight Coordination Council subject to judicial review.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Subpoena use and findings logged; reports published regularly.',
                  },
                ],
                children: [],
              },
              {
                id: 'speech-integrity-panel',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Speech Integrity Panel',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed by the Federal High Court from a publicly vetted roster created under law.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Three years, staggered annually; maximum two consecutive terms.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial discipline removal for cause.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Published standards; written orders; anonymized summaries published.',
                  },
                ],
                children: [],
              },
              {
                id: 'rights-of-nature-guardians',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Rights of Nature Guardians',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Appointed by Regional Council from a shortlist nominated by affected communities and recognized indigenous or customary ecological bodies; at least one seat selected by sortition from trained local stewards.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Five years, staggered.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Annual ecosystem reports; disclosures and recusals required.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-f-transition-institutions',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection F',
                    title: 'Transition Institutions',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'global-transition-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Global Transition Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Appointed. Delegations appointed by the Federated Assembly through public hearing and published reasons.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years, staggered where feasible.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Federated Assembly majority removal with written findings; judicial removal for corruption.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Positions and votes public with narrow diplomacy exceptions.',
                  },
                ],
                children: [],
              },
              {
                id: 'transitional-economic-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Transitional Economic Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. One-third elected by worker cooperatives and recognized labor councils, one-third appointed by the Federated Assembly, one-third selected by sortition from the trained public-interest economics pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years, staggered so one-quarter expires annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; impeachment for corruption by two-thirds vote of the Federated Assembly.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Public models, assumptions, and distributional impact reports.',
                  },
                ],
                children: [],
              },
              {
                id: 'cultural-and-ideological-mediation-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Cultural and Ideological Mediation Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Majority selected by sortition from a trained facilitation pool; minority appointed cultural liaisons nominated by communities.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Three years, staggered annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Anonymized outcomes; disclosures and recusals required.',
                  },
                ],
                children: [],
              },
              {
                id: 'national-cohesion-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'National Cohesion Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Appointed by the Federated Assembly with minority protections, with a portion selected by sortition from a trained civic pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Five years, staggered so one-fifth expires annually.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Federated Assembly majority removal with written findings; judicial removal for abuse of power.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Metrics, budgets, and decisions published.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'subsection-g-economic-and-emergency-institutions',
                    kind: 'subsection',
                    level: 4,
                    label: 'Subsection G',
                    title: 'Economic and Emergency Institutions',
                    blocks: [],
                    children: [],
                  },
                ],
              },
              {
                id: 'public-monetary-authority',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Public Monetary Authority',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed with independence protections. Board appointed by supermajority vote of the Federated Assembly with minority protections; a minority of seats selected by sortition from trained public-interest finance pool; Chair confirmed by public hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Eight years, staggered so no more than one-quarter expire in any two-year period; Chair serves four years within Board term.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Removal only for cause through judicial discipline procedures, or impeachment for corruption by two-thirds vote of the Federated Assembly. No recall.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Decisions and minutes published with a narrowly defined time delay where necessary for stability; audits required; disclosures mandatory.',
                  },
                ],
                children: [],
              },
              {
                id: 'resilience-council',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Resilience Council',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Mixed. Majority appointed by the Federated Assembly with minority protections; minority selected by sortition from trained emergency-response civic pool.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Four years, staggered; emergency activation limited to declared emergencies.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Federated Assembly majority removal with written findings; judicial removal for rights violations.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Emergency recommendations, votes, and conflicts logged publicly.',
                  },
                ],
                children: [],
              },
              {
                id: 'residents-emergency-oversight-panel',
                kind: 'topic',
                level: 3,
                label: null,
                title: 'Residents’ Emergency Oversight Panel',
                blocks: [
                  {
                    type: 'p',
                    text: 'Selection: Sortition from a rapid mobilization pool maintained by law.',
                  },
                  {
                    type: 'p',
                    text: 'Term: Service for the duration of the declared emergency, with cohort rotation at least every sixty days.',
                  },
                  {
                    type: 'p',
                    text: 'Removal: Judicial removal for cause; temporary suspension permitted only with prompt hearing.',
                  },
                  {
                    type: 'p',
                    text: 'Transparency: Biweekly public reports; disclosures and recusals required.',
                  },
                  {
                    type: 'hr',
                  },
                ],
                children: [
                  {
                    id: 'section-3-risk-controls-and-interpretive-rules',
                    kind: 'section',
                    level: 4,
                    label: 'Section 3',
                    title: 'Risk Controls and Interpretive Rules',
                    blocks: [
                      {
                        type: 'kv',
                        key: 'No Unstated Powers.',
                        value:
                          'No individual, body, appointment or elected position may infer powers from its selection method. Powers must be granted by this Constitution or by law consistent with it.',
                      },
                      {
                        type: 'kv',
                        key: 'Judicial Independence and Recall Limits.',
                        value:
                          'Courts and judicial bodies shall not be subject to recall unless implementing law proves, through public findings and judicial review, that anti-intimidation protections are sufficient to prevent coercion, retaliation, and discriminatory targeting.',
                      },
                      {
                        type: 'kv',
                        key: 'Complexity Control.',
                        value:
                          'Where Mixed selection is used, implementing law shall publish plain-language explanations, ballot design standards, and operational procedures to ensure comprehensibility and equal access.',
                      },
                      {
                        type: 'kv',
                        key: 'Contractor and Affiliate Evasion.',
                        value:
                          'Conflict-of-interest and cooling-off rules apply to controlled affiliates, materially compensated contractors, and agents acting on behalf of Corporate Entities or political organizations as defined by law.',
                      },
                      {
                        type: 'kv',
                        key: 'Disclosure Enforcement.',
                        value:
                          'Willful nondisclosure, false disclosure, or failure to recuse constitutes cause for removal and may trigger automatic temporary suspension pending hearing.',
                      },
                      {
                        type: 'kv',
                        key: 'Compliance with Constitutional Orders.',
                        value:
                          'Orders and suspensions issued under this Constitution by the Federal High Court, and temporary suspensions issued by the Independent Oversight Committee within its lawful scope, are immediately binding upon notice.',
                      },
                      {
                        type: 'kv',
                        key: 'Noncompliance and Contempt.',
                        value: 'Willful noncompliance by an official or agency constitutes:',
                      },
                      {
                        type: 'list',
                        ordered: true,
                        items: [
                          {
                            text: 'cause for removal,',
                          },
                          {
                            text: 'grounds for immediate temporary suspension pending hearing, and',
                          },
                          {
                            text: 'contempt of constitutional authority punishable by law, including personal civil liability where appropriate.',
                          },
                        ],
                      },
                      {
                        type: 'kv',
                        key: 'Rapid Enforcement.',
                        value:
                          'The Federal High Court shall maintain an expedited enforcement docket for constitutional compliance disputes, including noncompliance with emergency limits, voting access, surveillance limits, and oversight suspensions.',
                      },
                      {
                        type: 'p',
                        text: 'The Court may issue interim orders to prevent irreparable harm, with prompt full hearing thereafter.',
                      },
                    ],
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'appendix-x-form-index-and-case-types',
            kind: 'topic',
            level: 2,
            label: null,
            title: 'Appendix X: Form Index and Case Types',
            blocks: [
              {
                type: 'list',
                ordered: false,
                items: [
                  {
                    text: 'Form Code',
                  },
                  {
                    text: 'Title',
                  },
                  {
                    text: 'Purpose',
                  },
                  {
                    text: 'Who may file',
                  },
                  {
                    text: 'Where filed (Community, Region, Federation)',
                  },
                  {
                    text: 'Deciding body',
                  },
                  {
                    text: 'Publication class (Public, Limited, Sealed)',
                  },
                  {
                    text: 'Default time window (if any)',
                  },
                ],
              },
            ],
            children: [
              {
                id: '0-universal-case-and-records',
                kind: 'topic',
                level: 3,
                label: null,
                title: '0) Universal Case and Records',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'UNI-001 Case Cover Sheet',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: opens a case file for any process. Who files: any authorized filer. Publication: Public or Limited.',
                          },
                        ],
                      },
                      {
                        text: 'UNI-002 Evidence and Attachment Log',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: standardizes evidence submission and chain. Publication: matches case.',
                          },
                        ],
                      },
                      {
                        text: 'UNI-003 Notice of Filing and Service Log',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: proves who was notified and when. Publication: Public summary, details Limited if needed.',
                          },
                        ],
                      },
                      {
                        text: 'UNI-004 Redaction Request and Redaction Log Entry',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: safety and privacy handling with accountability. Publication: Public log, sealed content protected.',
                          },
                        ],
                      },
                      {
                        text: 'UNI-005 Decision Record and Findings',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: captures ruling, vote, or determination with reasons. Publication: Public unless Sealed by rule.',
                          },
                        ],
                      },
                      {
                        text: 'UNI-006 Appeal Notice',
                        blocks: [
                          {
                            type: 'p',
                            text: 'Purpose: triggers review path. Publication: Public.',
                          },
                        ],
                      },
                    ],
                  },
                ],
                children: [],
              },
            ],
          },
          {
            id: 'form-registry-by-domain',
            kind: 'topic',
            level: 2,
            label: null,
            title: 'Form Registry by domain',
            blocks: [],
            children: [
              {
                id: '1-identity-standing-and-participation',
                kind: 'topic',
                level: 3,
                label: null,
                title: '1) Identity, Standing, and Participation',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'ID-001 Adult Resident Registration or Verification',
                      },
                      {
                        text: 'ID-002 Voter Eligibility Registration or Update',
                      },
                      {
                        text: 'ID-003 Conflict of Interest Disclosure',
                      },
                      {
                        text: 'ID-004 Recusal Declaration',
                      },
                      {
                        text: 'ID-005 Public Interest Standing Statement',
                      },
                      {
                        text: 'ID-006 Oath Acceptance and Term Start',
                      },
                      {
                        text: 'ID-007 Term End, Resignation, Removal Acknowledgment',
                      },
                      {
                        text: 'ID-008 Accessibility Needs Request',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '2-community-and-regional-governance-operations',
                kind: 'topic',
                level: 3,
                label: null,
                title: '2) Community and Regional Governance Operations',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'GOV-001 Meeting Notice and Agenda Publication',
                      },
                      {
                        text: 'GOV-002 Meeting Minutes and Decision Record',
                      },
                      {
                        text: 'GOV-003 Public Comment Submission',
                      },
                      {
                        text: 'GOV-004 Proposal Intake',
                      },
                      {
                        text: 'GOV-005 Working Group Charter Request',
                      },
                      {
                        text: 'GOV-006 Community Charter Draft and Adoption Packet',
                      },
                      {
                        text: 'GOV-007 Inter-Community Compact Proposal',
                      },
                      {
                        text: 'GOV-008 Inter-Region Compact Proposal',
                      },
                      {
                        text: 'GOV-009 Records Publication and Redaction Log Entry',
                      },
                      {
                        text: 'GOV-010 Public Records Request',
                      },
                      {
                        text: 'GOV-011 Public Records Response and Withholding Justification',
                      },
                      {
                        text: 'GOV-012 Petition to Place Item on Agenda',
                      },
                      {
                        text: 'GOV-013 Ethics Complaint Intake',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '3-elections-and-referenda-administration',
                kind: 'topic',
                level: 3,
                label: null,
                title: '3) Elections and Referenda Administration',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'ELX-001 Candidate Filing',
                      },
                      {
                        text: 'ELX-002 Candidate Withdrawal',
                      },
                      {
                        text: 'ELX-003 Ballot Access Challenge',
                      },
                      {
                        text: 'ELX-004 Ballot Measure Draft Submission',
                      },
                      {
                        text: 'ELX-005 Ballot Measure Legal Sufficiency Review Request',
                      },
                      {
                        text: 'ELX-006 Petition Signature Sheet and Attestation',
                      },
                      {
                        text: 'ELX-007 Petition Verification Report',
                      },
                      {
                        text: 'ELX-008 Referendum Trigger Notice',
                      },
                      {
                        text: 'ELX-009 Election Observer Credential Request',
                      },
                      {
                        text: 'ELX-010 Election Incident Report',
                      },
                      {
                        text: 'ELX-011 Recount Request',
                      },
                      {
                        text: 'ELX-012 Election Contest Filing',
                      },
                      {
                        text: 'ELX-013 Election Remedy Order',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '4-sortition-and-civic-pool-operations',
                kind: 'topic',
                level: 3,
                label: null,
                title: '4) Sortition and Civic Pool Operations',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'SOR-001 Civic Pool Enrollment',
                      },
                      {
                        text: 'SOR-002 Civic Pool Training Completion',
                      },
                      {
                        text: 'SOR-003 Availability and Hardship Exemption Request',
                      },
                      {
                        text: 'SOR-004 Conflict Screening for Sortition',
                      },
                      {
                        text: 'SOR-005 Selection Notice and Acceptance',
                      },
                      {
                        text: 'SOR-006 Decline With Cause',
                      },
                      {
                        text: 'SOR-007 Removal for Misconduct or Incapacity',
                      },
                      {
                        text: 'SOR-008 Service Compensation Claim',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '5-legislation-and-rulemaking',
                kind: 'topic',
                level: 3,
                label: null,
                title: '5) Legislation and Rulemaking',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'LEG-001 Bill or Ordinance Proposal',
                      },
                      {
                        text: 'LEG-002 Co-Sponsor Add Remove',
                      },
                      {
                        text: 'LEG-003 Fiscal Note Request',
                      },
                      {
                        text: 'LEG-004 Fiscal Note Report',
                      },
                      {
                        text: 'LEG-005 Committee Referral and Docket Entry',
                      },
                      {
                        text: 'LEG-006 Amendment to Bill',
                      },
                      {
                        text: 'LEG-007 Public Comment Window Notice',
                      },
                      {
                        text: 'LEG-008 Hearing Record and Findings',
                      },
                      {
                        text: 'LEG-009 Final Passage Certification',
                      },
                      {
                        text: 'LEG-010 Executive Implementation Directive',
                      },
                      {
                        text: 'LEG-011 Implementation Status Report',
                      },
                      {
                        text: 'LEG-012 Rulemaking Notice',
                      },
                      {
                        text: 'LEG-013 Rulemaking Comment Submission',
                      },
                      {
                        text: 'LEG-014 Rulemaking Final Rule and Basis Statement',
                      },
                      {
                        text: 'LEG-015 Sunset Review Report',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '6-budgeting-public-finance-and-procurement',
                kind: 'topic',
                level: 3,
                label: null,
                title: '6) Budgeting, Public Finance, and Procurement',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'FIN-001 Annual Budget Proposal',
                      },
                      {
                        text: 'FIN-002 Budget Line Item Request',
                      },
                      {
                        text: 'FIN-003 Appropriation Bill Packet',
                      },
                      {
                        text: 'FIN-004 Budget Amendment Request',
                      },
                      {
                        text: 'FIN-005 Participatory Budget Proposal',
                      },
                      {
                        text: 'FIN-006 Participatory Budget Vote Ballot',
                      },
                      {
                        text: 'FIN-007 Expenditure Authorization Request',
                      },
                      {
                        text: 'FIN-008 Emergency Expenditure Authorization',
                      },
                      {
                        text: 'FIN-009 Contracting Request',
                      },
                      {
                        text: 'FIN-010 Competitive Bid Notice',
                      },
                      {
                        text: 'FIN-011 Bid Submission',
                      },
                      {
                        text: 'FIN-012 Bid Evaluation Record',
                      },
                      {
                        text: 'FIN-013 Contract Award and Disclosure',
                      },
                      {
                        text: 'FIN-014 Vendor Conflict Disclosure',
                      },
                      {
                        text: 'FIN-015 Grant Application Submission',
                      },
                      {
                        text: 'FIN-016 Grant Award and Conditions',
                      },
                      {
                        text: 'FIN-017 Financial Audit Plan',
                      },
                      {
                        text: 'FIN-018 Financial Audit Report',
                      },
                      {
                        text: 'FIN-019 Corrective Action Plan',
                      },
                      {
                        text: 'FIN-020 Asset Register Update',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '7-oversight-integrity-anti-capture-whistleblowing',
                kind: 'topic',
                level: 3,
                label: null,
                title: '7) Oversight, Integrity, Anti-Capture, Whistleblowing',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'OVS-001 Oversight Complaint Intake',
                      },
                      {
                        text: 'OVS-002 Request for Investigation',
                      },
                      {
                        text: 'OVS-003 Lead Jurisdiction Assignment',
                      },
                      {
                        text: 'OVS-004 Information Demand or Records Hold Notice',
                      },
                      {
                        text: 'OVS-005 Audit Initiation Notice',
                      },
                      {
                        text: 'OVS-006 Audit Findings Report',
                      },
                      {
                        text: 'OVS-007 Investigation Findings and Referral',
                      },
                      {
                        text: 'OVS-008 Whistleblower Protected Disclosure Intake',
                      },
                      {
                        text: 'OVS-009 Whistleblower Retaliation Complaint',
                      },
                      {
                        text: 'OVS-010 Protective Measures Order',
                      },
                      {
                        text: 'OVS-011 Ethics Violation Charge',
                      },
                      {
                        text: 'OVS-012 Sanctions Decision Record',
                      },
                      {
                        text: 'OVS-013 Oversight Annual Report',
                      },
                      {
                        text: 'OVS-014 Oversight Body Boundary Statement',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '8-justice-mediation-restorative-process-courts',
                kind: 'topic',
                level: 3,
                label: null,
                title: '8) Justice, Mediation, Restorative Process, Courts',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'JUS-001 Mediation Request',
                      },
                      {
                        text: 'JUS-002 Mediation Intake and Consent',
                      },
                      {
                        text: 'JUS-003 Restorative Conference Request',
                      },
                      {
                        text: 'JUS-004 Restorative Agreement Draft',
                      },
                      {
                        text: 'JUS-005 Restorative Agreement Completion Verification',
                      },
                      {
                        text: 'JUS-006 Civil Complaint Filing',
                      },
                      {
                        text: 'JUS-007 Criminal Charge Filing',
                      },
                      {
                        text: 'JUS-008 Summons or Notice of Proceedings',
                      },
                      {
                        text: 'JUS-009 Evidence Submission and Chain of Custody',
                      },
                      {
                        text: 'JUS-010 Protective Order Request',
                      },
                      {
                        text: 'JUS-011 Detention Review Request',
                      },
                      {
                        text: 'JUS-012 Warrant Application',
                      },
                      {
                        text: 'JUS-013 Court Order and Findings',
                      },
                      {
                        text: 'JUS-014 Appeal Notice',
                      },
                      {
                        text: 'JUS-015 Constitutional Review Petition',
                      },
                      {
                        text: 'JUS-016 Enforcement Motion',
                      },
                      {
                        text: 'JUS-017 Remedy Compliance Report',
                      },
                      {
                        text: 'JUS-018 Expungement or Record Seal Request',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '9-rights-data-protection-technology-governance',
                kind: 'topic',
                level: 3,
                label: null,
                title: '9) Rights, Data Protection, Technology Governance',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'RGT-001 Rights Violation Complaint Intake',
                      },
                      {
                        text: 'RGT-002 Injunctive Relief Request',
                      },
                      {
                        text: 'RGT-003 Public Interest Litigation Intake',
                      },
                      {
                        text: 'DPA-001 Personal Data Access Request',
                      },
                      {
                        text: 'DPA-002 Personal Data Correction Request',
                      },
                      {
                        text: 'DPA-003 Personal Data Deletion Request',
                      },
                      {
                        text: 'DPA-004 Processing Objection Request',
                      },
                      {
                        text: 'DPA-005 Data Breach Notification',
                      },
                      {
                        text: 'DPA-006 Algorithmic Impact Assessment Submission',
                      },
                      {
                        text: 'DPA-007 Surveillance Authorization Request',
                      },
                      {
                        text: 'DPA-008 Surveillance Use Report and Sunset',
                      },
                      {
                        text: 'DPA-009 Data Sharing Agreement Disclosure',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '10-environment-land-resources-infrastructure',
                kind: 'topic',
                level: 3,
                label: null,
                title: '10) Environment, Land, Resources, Infrastructure',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'ENV-001 Environmental Impact Statement Submission',
                      },
                      {
                        text: 'ENV-002 Public Comment on Environmental Review',
                      },
                      {
                        text: 'ENV-003 Permit Application',
                      },
                      {
                        text: 'ENV-004 Permit Decision and Conditions',
                      },
                      {
                        text: 'ENV-005 Environmental Harm Incident Report',
                      },
                      {
                        text: 'ENV-006 Remediation Plan',
                      },
                      {
                        text: 'ENV-007 Remediation Completion Verification',
                      },
                      {
                        text: 'ENV-008 Resource Allocation Proposal',
                      },
                      {
                        text: 'ENV-009 Infrastructure Project Proposal Packet',
                      },
                      {
                        text: 'ENV-010 Maintenance and Safety Inspection Report',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '11-emergency-powers-and-safeguards',
                kind: 'topic',
                level: 3,
                label: null,
                title: '11) Emergency Powers and Safeguards',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'EMG-001 Emergency Declaration Request',
                      },
                      {
                        text: 'EMG-002 Emergency Declaration Issuance and Scope',
                      },
                      {
                        text: 'EMG-003 Emergency Order',
                      },
                      {
                        text: 'EMG-004 Emergency Extension Request',
                      },
                      {
                        text: 'EMG-005 Emergency Oversight Review Trigger',
                      },
                      {
                        text: 'EMG-006 Rights Limitation Justification Statement',
                      },
                      {
                        text: 'EMG-007 Post-Emergency After Action Report',
                      },
                      {
                        text: 'EMG-008 Emergency Spending Report',
                      },
                    ],
                  },
                ],
                children: [],
              },
              {
                id: '12-constitutional-amendment-and-protected-principles',
                kind: 'topic',
                level: 3,
                label: null,
                title: '12) Constitutional Amendment and Protected Principles',
                blocks: [
                  {
                    type: 'list',
                    ordered: false,
                    items: [
                      {
                        text: 'AMD-001 Amendment Proposal Text Submission',
                      },
                      {
                        text: 'AMD-002 Amendment Sponsorship Certification',
                      },
                      {
                        text: 'AMD-003 Amendment Petition Signature Packet',
                      },
                      {
                        text: 'AMD-004 Amendment Ballot Placement Certification',
                      },
                      {
                        text: 'AMD-005 Amendment Ratification Election Record',
                      },
                      {
                        text: 'AMD-006 Judicial Pre-Clearance Request',
                      },
                      {
                        text: 'AMD-007 Amendment Codification Notice',
                      },
                    ],
                  },
                ],
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const NGC_V15_INDEX = buildNodeIndex(NGC_V15.root);
