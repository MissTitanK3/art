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

export const ngcData: NGC = {
  preamble: {
    forward:
      'We, the people of diverse communities—geographic, cultural, and ideological—united by a shared commitment to human dignity, equity, and ecological responsibility, establish this Constitution as a living document to uphold the inalienable rights of all individuals and promote the common good for present and future generations.',
    subTitle:
      'Mindful of humanity’s democratic evolution and ongoing struggles for justice, we seek to form a society where:',
    points: [
      {
        id: '1',
        content: 'Power flows from the people upward, ensuring governance remains accountable and participatory.',
      },
      {
        id: '2',
        content:
          'Government structures protect the vulnerable while promoting liberty, autonomy, and opportunity for all.',
      },
      {
        id: '3',
        content:
          'Natural resources and the environment are safeguarded as shared assets fundamental to life and cultural continuity.',
      },
      {
        id: '4',
        content:
          'Conflicts are resolved through restorative principles, prioritizing reconciliation over punitive measures.',
      },
      {
        id: '5',
        content:
          'Technological advancements serve the public good, ensuring transparency, privacy, and equitable access.',
      },
      {
        id: '6',
        content: 'Governance is continually evaluated and improved to meet the evolving needs of society.',
      },
      {
        id: '7',
        content: 'Civic education and public engagement ensure an informed and active citizenry.',
      },
      {
        id: '8',
        content:
          'The people retain the right to dismantle or reconstitute the government should it fail in its duty to serve the public good.',
      },
      {
        id: '9',
        content:
          'Explicit safeguards against authoritarianism and fascism ensure that power is never concentrated in a single entity or ideology.',
      },
      {
        id: '10',
        content:
          'Economic and political structures are protected from corporate control and single-party rule, ensuring genuine democratic plurality.',
      },
      {
        id: '11',
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
          id: '1',
          title: 'Popular Sovereignty & Decentralized Governance',
          content: [
            {
              preface: 'Source of Authority:',
              statement:
                'All legitimate political authority arises from the consent and active participation of the people.',
            },
            {
              preface: 'Communities Defined:',
              statement:
                'Communities self-define their structure based on geographic proximity, cultural affinity, or shared purpose, provided they operate democratically and uphold fundamental rights.',
            },
            {
              preface: 'Environmental Stewardship:',
              statement:
                'Governance at all levels integrates ecological responsibility, ensuring that policies respect scientifically defined planetary boundaries (e.g., climate stability, biodiversity loss, freshwater use) and prioritize the well-being of future generations.',
            },
            {
              preface: 'Technological Responsibility:',
              statement:
                'Ethical frameworks ensure technological advancements are used transparently and equitably, with safeguards against misuse. A Technology Ethics Council (Article IV, Section 3) will oversee compliance.',
            },
            {
              preface: 'Governance Oversight:',
              statement:
                'A Public Review Commission is established to evaluate governmental efficiency, equity, and accountability every five years. Its findings will be publicly accessible and trigger mandatory reforms if systemic failures are identified.',
            },
            {
              preface: 'Civic Literacy & Education:',
              statement:
                'A mandatory Civic Literacy Program will educate all citizens on governance structures, democratic rights, and responsibilities. Funding will be allocated equitably across communities.',
            },
            {
              preface: 'Right to Dissolve Government:',
              statement:
                'If the government ceases to uphold its responsibilities, a public referendum can be initiated to dissolve or restructure it, requiring a supermajority vote (two-thirds of valid ballots cast).',
            },
            {
              preface: 'Anti-Authoritarian Safeguards:',
              statement:
                'Any attempt to consolidate power, suppress dissent, or erode democratic institutions shall trigger automatic intervention by an Independent Oversight Committee, which has the authority to suspend offending actions pending investigation. The Committee’s members are appointed through a transparent, multi-stakeholder process and serve staggered six-year terms, subject to public recall.',
            },
            {
              preface: 'Citizen Recall Power:',
              statement:
                'A Citizen Recall Mechanism allows the public to remove any official by referendum vote if corruption or authoritarian behavior is identified. A petition signed by 10% of the electorate is required to initiate a recall.',
            },
            {
              preface: 'Explicit Ban on Single-Party Rule and Corporate-Controlled Governance:',
              statement:
                'To protect against economic and political monopolization, no single political party or corporate entity shall dominate governance structures at any level. A party or entity controlling more than 50% of seats or decision-making power for two consecutive terms will trigger an automatic review and potential dissolution of its political influence.',
            },
          ],
        },
        {
          id: '2',
          title: 'Oversight Bodies & Coordination',
          content: [
            {
              preface: 'Oversight Coordination Council (OCC):',
              statement:
                'The OCC ensures clarity in the mandates, funding, and jurisdiction of all oversight bodies, including the Public Review Commission, Independent Oversight Committee, Technology Ethics Council, and others.',
            },
            {
              preface: 'Selection & Qualifications:',
              statement:
                'Members of oversight bodies will be selected through a transparent, merit-based process involving public nominations and multi-stakeholder vetting. Qualifications for each body will be detailed in an Annex to this Constitution.',
            },
            {
              preface: 'Funding & Independence:',
              statement:
                'Funding for oversight bodies will be allocated from a pooled, independent budget to ensure autonomy. Each body must publish annual financial reports for public accountability.',
            },
            {
              preface: 'Conflict Resolution:',
              statement:
                'The Federal High Court will resolve jurisdictional disputes between oversight bodies, ensuring efficient and fair governance.',
            },
          ],
        },
      ],
    },
    {
      id: 'II',
      title: 'Governance Structures',
      sections: [
        {
          id: '1',
          title: 'Community Councils',
          content: [
            {
              preface: 'Mandate:',
              statement:
                'Manage local services (education, healthcare, security) through participatory budgeting and transparent procedures.',
            },
            {
              preface: 'Voting Rights:',
              statement:
                'Manage local services (education, healthcare, security) through participatory budgeting and transparent procedures.',
              subSections: [
                {
                  id: '1',
                  content:
                    'All adult residents (16+ years old) have full voting rights. This age threshold reflects the principle that individuals contributing to society (e.g., through work or taxation) should have a voice in governance.',
                },
                {
                  id: '2',
                  content:
                    'Youth aged 12-15 may participate in debates as non-voting delegates and have binding advisory votes on issues directly affecting them (e.g., education, climate).',
                },
              ],
            },
            {
              preface: 'Leadership Competency:',
              statement:
                'Leadership positions require competency-based evaluations to ensure governance is led by individuals with necessary skills, ethical decision-making, and crisis management expertise. Annual performance reviews will be conducted by an independent panel.',
            },
          ],
        },
        {
          id: '2',
          title: 'Regional Councils',
          content: [
            {
              preface: 'Purpose:',
              statement:
                'Address large-scale concerns (e.g., infrastructure, environmental policies) beyond local capabilities.',
            },
            {
              preface: 'Representation:',
              statement: 'Each community selects two democratic delegates through transparent elections.',
            },
            {
              preface: 'Decision-Making:',
              statement: 'A two-thirds majority is required for binding resolutions, ensuring broad consensus.',
            },
            {
              preface: 'Term Limits:',
              statement: 'Delegates serve three-year terms, max two consecutive terms.',
            },
            {
              preface: 'Accountability:',
              statement:
                'Delegates must hold quarterly public forums to report on progress and address community concerns.',
            },
          ],
        },
        {
          id: '3',
          title: 'Federated Assembly',
          content: [
            {
              preface: 'Scope:',
              statement: 'Manages cross-regional issues, including human rights standards and ecological policies.',
            },
            {
              preface: 'Subsidiarity Principle:',
              statement:
                'Power remains at the most local feasible level. Federal intervention is permitted only when local or regional efforts are insufficient.',
            },
            {
              preface: 'Representation & Voting:',
              statement: 'Equal delegation per region; simple majority required for non-emergency actions.',
            },
            {
              preface: 'Sunset Clause:',
              statement:
                'New federal powers expire after two years unless reaffirmed by a two-thirds majority of the Federated Assembly and ratified by public referendum.',
            },
            {
              preface: 'Public Referenda:',
              statement: 'Major national decisions must be ratified through public referenda every decade.',
            },
            {
              preface: 'Emergency Governance Protocol:',
              statement:
                'A Resilience Council coordinates emergency responses in times of war, pandemics, or ecological disasters. Emergency measures expire after six months unless extended by a supermajority vote of the Federated Assembly and public referendum.',
            },
            {
              preface: 'Federal High Court:',
              statement:
                'A Federal High Court is established to unify interpretations of constitutional principles and resolve disputes between regional and federal authorities. Its judges are appointed through a transparent, merit-based process and serve 12-year terms.',
            },
          ],
        },
      ],
    },
    {
      id: 'III',
      title: 'Justice & Dispute Resolution',
      sections: [
        {
          id: '1',
          title: 'Restorative Justice Focus',
          content: [
            {
              preface: 'Principle:',
              statement:
                'Emphasizes repair, rehabilitation, and reintegration, reducing punitive measures unless necessary.',
            },
            {
              preface: 'Applicability:',
              statement:
                'Used in civil and criminal matters, except for severe offenses requiring security measures. Severe offenses include homicide, terrorism, and large-scale corruption.',
            },
            {
              preface: 'Implementation:',
              statement:
                'Restorative Justice Programs will be established in every community, funded by a combination of local and federal resources. Annual evaluations will ensure effectiveness and equity.',
            },
          ],
        },
        {
          id: '2',
          title: 'Community Mediation & Courts',
          content: [
            {
              preface: 'Mediation Councils:',
              statement:
                'Trained, diverse mediators ensure timely and impartial resolutions. Mediators must undergo annual certification to maintain standards.',
            },
            {
              preface: 'Local Courts:',
              statement:
                'Transparent and based on evidence, fairness, and community well-being. Judges are elected by the community and subject to recall.',
            },
            {
              preface: 'Appeals:',
              statement:
                'Escalate from local courts to regional appellate councils, ensuring fairness. Appeals must be resolved within six months, with extensions granted only for exceptional circumstances.',
            },
            {
              preface: 'Protection Against Abuse:',
              statement:
                'Individuals retain rights against arbitrary detention or unfair trials. A Legal Ombudsman will investigate complaints of judicial misconduct.',
            },
            {
              preface: 'Ban on For-Profit Prisons & Mass Surveillance Policing:',
              statement:
                'To prevent exploitation and authoritarian overreach, the use of private incarceration facilities and predictive policing based on mass surveillance is prohibited. Violations will result in immediate termination of contracts and legal penalties.',
            },
          ],
        },
      ],
    },
    {
      id: 'IV',
      title: 'Bill of Rights',
      sections: [
        {
          id: '1',
          title: 'Fundamental Rights',
          content: [
            {
              preface: 'Right to Self-Governance:',
              statement:
                'Individuals and communities have the right to self-determination under democratic principles.',
            },
            {
              preface: 'Freedom of Speech & Expression:',
              statement:
                'All individuals have the right to voice their beliefs, thoughts, and cultural expressions without suppression. Hate speech and incitement to violence are excluded from this protection. A Hate Speech Review Board, under the Federal High Court, will evaluate allegations to ensure consistency and fairness.',
            },
            {
              preface: 'Right to Privacy:',
              statement:
                'Personal data, digital identity, and personal communications are protected against unlawful surveillance. A Data Protection Authority will enforce compliance and investigate breaches.',
            },
            {
              preface: 'Right to Economic Dignity:',
              statement:
                'Every person has the right to work in fair conditions and receive equitable compensation. A Living Wage Commission will set and periodically adjust minimum wage standards.',
            },
            {
              preface: 'Right to a Sustainable Environment:',
              statement:
                'Communities have a right to a clean and sustainable environment for present and future generations. Environmental Impact Assessments (EIAs) are mandatory for all projects exceeding a defined budget or environmental footprint threshold.',
            },
          ],
        },
        {
          id: '2',
          title: 'Justice & Protection Rights',
          content: [
            {
              preface: 'Right to Due Process:',
              statement:
                'Individuals are entitled to fair and just legal proceedings, including the right to a speedy trial, legal representation, and presumption of innocence.',
            },
            {
              preface: 'Right to Basic Needs:',
              statement:
                'Every individual has the right to healthcare, shelter, and nourishment. Governments must allocate a minimum of 20% of their annual budget to social welfare programs.',
            },
            {
              preface: 'Right to Future Generational Equity:',
              statement:
                'Major legislative policies must include future-oriented impact reviews to safeguard the well-being of future generations. A Future Generations Ombudsman will oversee compliance.',
            },
            {
              preface: 'Right to Protest & Dissent:',
              statement:
                'All individuals retain the right to organize, assemble, and engage in nonviolent demonstrations against the government or private entities that infringe on public freedoms. Law enforcement must facilitate peaceful protests and avoid excessive force.',
            },
            {
              preface: 'Whistleblower Protections:',
              statement:
                'Individuals exposing corruption in governance or corporations are legally protected from retaliation. A Whistleblower Protection Agency will provide legal and financial support to whistleblowers.',
            },
          ],
        },
        {
          id: '3',
          title: 'Economic & Technological Rights',
          content: [
            {
              preface: 'Right to Fair Labor Practices:',
              statement:
                'Every individual has the right to fair wages, safe work environments, and collective bargaining. Unions and worker cooperatives are legally protected and encouraged.',
            },
            {
              preface: 'Protection Against Corporate Exploitation:',
              statement:
                'No individual shall be subjected to exploitative working conditions. Worker-owned enterprises will receive tax incentives and government support.',
            },
            {
              preface: 'Technological Equity & Digital Rights:',
              statement:
                'All individuals and communities must have access to essential digital infrastructure. A Digital Equity Fund will subsidize internet access and technology for underserved communities.',
            },
            {
              preface: 'Ethical AI Oversight:',
              statement:
                'A Technology Ethics Council will evaluate AI, automation, and emerging technologies for public safety, fairness, and impact on employment. AI systems must undergo mandatory audits for bias and transparency.',
            },
            {
              preface: 'Open-Source Standardization:',
              statement:
                'Government-supported AI and public data systems must be transparent and publicly auditable. Proprietary algorithms used in public decision-making are prohibited.',
            },
          ],
        },
        {
          id: '4',
          title: 'Cultural & Educational Rights',
          content: [
            {
              preface: 'Right to Education:',
              statement:
                'Every individual has the right to free and accessible education at all levels, fostering critical thinking, civic awareness, and personal development. Education budgets must prioritize underserved communities.',
            },
            {
              preface: 'Right to Cultural Preservation:',
              statement:
                'Communities have the right to preserve, develop, and transmit their cultural heritage and traditions without interference. A Cultural Heritage Fund will support these efforts.',
            },
            {
              preface: 'Right to Language Protection:',
              statement:
                'Indigenous and minority languages shall be recognized, preserved, and promoted through education and public use. Bilingual education programs will be mandatory in regions with significant minority populations.',
            },
            {
              preface: 'Right to Artistic & Scientific Freedom:',
              statement:
                'Creative and scientific expression shall be protected from censorship or undue restrictions, ensuring innovation and cultural flourishing. Funding for the arts and sciences will be guaranteed at a minimum of 2% of GDP.',
            },
          ],
        },
        {
          id: '5',
          title: 'Health & Well-Being Rights',
          content: [
            {
              preface: 'Right to Universal Healthcare:',
              statement:
                'Every individual has the right to accessible, high-quality healthcare, including mental health services and preventative care. Healthcare systems must be publicly funded and free at the point of service.',
            },
            {
              preface: 'Right to Reproductive Autonomy:',
              statement:
                'Individuals have the right to make informed choices regarding their reproductive health, free from coercion or restriction. Comprehensive reproductive healthcare, including abortion, will be universally accessible.',
            },
            {
              preface: 'Right to Safe Living Conditions:',
              statement:
                'No person shall be subjected to hazardous living environments that endanger their health or safety. Housing standards will be enforced by local councils with periodic inspections.',
            },
            {
              preface: 'Right to Clean Water & Food Security:',
              statement:
                'Governments and communities must ensure access to clean drinking water and nutritious food as a basic human right. Agricultural policies will prioritize sustainability and local food production.',
            },
          ],
        },
        {
          id: '6',
          title: 'Security & Non-Discrimination Rights',
          content: [
            {
              preface: 'Freedom from Discrimination:',
              statement:
                'No person shall face discrimination based on race, ethnicity, gender, sexual orientation, disability, religion, or any other protected status. Affirmative action programs will address historical inequities.',
            },
            {
              preface: 'Right to Gender Equality:',
              statement:
                'Equal rights, protections, and opportunities shall be ensured regardless of gender identity or expression. Gender-neutral policies will be mandatory in all public institutions.',
            },
            {
              preface: 'Right to Asylum & Refugee Protection:',
              statement:
                'Individuals fleeing persecution, violence, or climate crises shall have the right to seek asylum and humane treatment. Asylum applications must be processed within six months.',
            },
            {
              preface: 'Community-Led Public Safety:',
              statement:
                'Law enforcement must be accountable to the communities they serve, emphasizing de-escalation, restorative justice, and non-militarized policing. Police budgets will be reallocated to community services and mental health support.',
            },
            {
              preface: 'Right to Cybersecurity & Digital Protection:',
              statement:
                'Individuals have the right to secure digital identities, protection from cybercrimes, and transparency regarding data collection practices. Cybersecurity education will be integrated into school curricula.',
            },
          ],
        },
        {
          id: '7',
          title: 'Rights of Future Generations',
          content: [
            {
              preface: 'Intergenerational Justice:',
              statement:
                'All legislative and economic policies must consider their impact on future generations. A Future Generations Impact Assessment will be mandatory for all major policies.',
            },
            {
              preface: 'Climate Protection Rights:',
              statement:
                'Governments must adopt policies ensuring the long-term sustainability of the planet. Carbon neutrality targets will be legally binding.',
            },
            {
              preface: 'Right to Scientific Advancement & Ethical Innovation:',
              statement:
                'Individuals shall have access to the benefits of scientific progress, free from unethical restrictions or exploitation. Research funding will prioritize public health, environmental sustainability, and social equity.',
            },
          ],
        },
        {
          id: '8',
          title: 'Rights of Non-Human Life',
          content: [
            {
              preface: 'Animal Welfare Protections:',
              statement:
                'Cruelty to animals is prohibited, and biodiversity must be preserved. Factory farming practices that cause undue suffering will be phased out within 10 years.',
            },
            {
              preface: 'Environmental Personhood:',
              statement:
                'Ecosystems critical to planetary stability (e.g., forests, rivers, oceans) may be granted legal protections to prevent destruction. A Guardianship Council will represent these ecosystems in legal proceedings.',
            },
          ],
        },
        {
          id: '9',
          title: 'Global Solidarity & Humanitarian Rights',
          content: [
            {
              preface: 'Right to Global Cooperation:',
              statement:
                'Nations, regions, and individuals have the right to collaborate on issues of planetary importance. A Global Solidarity Fund will support international development and disaster relief.',
            },
            {
              preface: 'Right to Disaster Relief & Humanitarian Aid:',
              statement:
                'Communities impacted by natural disasters, conflict, or famine shall receive aid from national and global partners. Humanitarian aid will be depoliticized and distributed based on need.',
            },
          ],
        },
      ],
    },
    {
      id: 'V',
      title: 'Transition Plan',
      sections: [
        {
          id: '',
          title: '',
          content: [
            {
              preface: 'Phased Implementation:',
              statement:
                'This Constitution will be implemented in phases over 10 years, with milestones for decentralization, civic education, and technological equity.',
            },
            {
              preface: 'Global Collaboration:',
              statement:
                'A Global Transition Council will facilitate international cooperation on shared challenges, including climate change and technological ethics.',
            },
            {
              preface: 'Public Consultation:',
              statement:
                'Annual public forums will gather feedback on the Constitution’s implementation, ensuring it remains adaptive and responsive.',
            },
            {
              preface: 'Economic Transition:',
              statement:
                'A Transitional Economic Council will oversee the shift to worker-owned enterprises and fair labor practices, ensuring a just and equitable transition.',
            },
            {
              preface: 'Conflict Resolution Mechanism:',
              statement:
                'A Cultural and Ideological Mediation Council will address potential clashes between cultural or ideological values, promoting dialogue and reconciliation.',
            },
            {
              preface: 'Technological Implementation:',
              statement:
                'The Digital Equity Fund and Technology Ethics Council will be funded through a combination of public budgets, corporate contributions, and international grants, ensuring sustainable operations.',
            },
            {
              preface: 'Decentralization and Cohesion:',
              statement:
                'A National Cohesion Council will ensure that decentralization does not compromise national or global cohesion, particularly for cross-border issues like climate change and pandemics.',
            },
            {
              preface: 'Public Engagement:',
              statement:
                'Participatory budgeting will be mandated at all levels of governance, ensuring ongoing public involvement in decision-making processes.',
            },
          ],
        },
      ],
    },
    {
      id: 'VI',
      title: 'Foreign Policy, Defense, & Global Cooperation',
      sections: [
        {
          id: '1',
          title: 'Foreign Relations',
          content: [
            {
              preface: 'Foreign Relations Council:',
              statement:
                'A Foreign Relations Council will oversee diplomacy, trade agreements, and international treaties. Treaties must be ratified by a two-thirds majority of the Federated Assembly and a public referendum.',
            },
            {
              preface: 'Global Solidarity Fund:',
              statement:
                'This fund will support international development, disaster relief, and climate adaptation efforts. Contributions will be based on a progressive scale tied to regional GDP.',
            },
          ],
        },
        {
          id: '2',
          title: 'Defense & Security',
          content: [
            {
              preface: 'Civil-Military Relations:',
              statement:
                'A civilian-led Defense Council will oversee national defense, ensuring that military forces are subordinate to democratic governance.',
            },
            {
              preface: 'Emergency Defense Protocol:',
              statement:
                'In times of external aggression, the Resilience Council will coordinate defense efforts. Emergency defense measures expire after six months unless extended by a supermajority vote of the Federated Assembly and a public referendum.',
            },
            {
              preface: 'Prohibition of Offensive Wars:',
              statement:
                'This Constitution renounces the use of military force for territorial expansion or economic gain.',
            },
          ],
        },
      ],
    },
    {
      id: 'VII',
      title: 'Economic & Fiscal Framework',
      sections: [
        {
          id: '1',
          title: 'Property Rights',
          content: [
            {
              preface: 'Private Property:',
              statement:
                'Individuals and communities have the right to own and use property, subject to regulations that prevent exploitation, environmental harm, or excessive concentration of wealth.',
            },
            {
              preface: 'Land Ownership:',
              statement:
                'Land ownership is limited to prevent monopolization. A Land Stewardship Council will oversee equitable land distribution and resolve disputes.',
            },
            {
              preface: 'Intellectual Property:',
              statement:
                'Intellectual property rights are protected but must not hinder access to essential knowledge or technologies. A Public Knowledge Fund will subsidize open-access research and innovation.',
            },
          ],
        },
        {
          id: '2',
          title: 'Fiscal Policy',
          content: [
            {
              preface: 'Taxation:',
              statement:
                'A progressive tax system will fund public services, with rates determined by regional councils based on local needs and equity principles.',
            },
            {
              preface: 'Budgetary Process:',
              statement:
                'Participatory budgeting will be mandatory at all levels of governance. Annual budgets must allocate a minimum of 20% to social welfare and 2% to arts and sciences.',
            },
            {
              preface: 'Monetary Policy:',
              statement:
                'A Public Banking System will manage currency and monetary policy, ensuring stability and equitable access to credit. Regional banks will operate under federal guidelines.',
            },
          ],
        },
        {
          id: '3',
          title: 'Resource Prioritization',
          content: [
            {
              preface: 'Core Minimum Obligations:',
              statement:
                'In times of resource scarcity, funding will prioritize basic rights (e.g., healthcare, food, water, shelter) over non-essential programs.',
            },
            {
              preface: 'Economic Resilience Fund:',
              statement:
                'A reserve fund will be established to address economic downturns, natural disasters, or other crises.',
            },
          ],
        },
      ],
    },
    {
      id: 'VIII',
      title: 'Emergency Powers & Safeguards',
      sections: [
        {
          id: '1',
          title: 'Emergency Declarations',
          content: [
            {
              preface: 'Definition:',
              statement:
                'An emergency is defined as a situation posing an immediate threat to public safety, national security, or ecological stability.',
            },
            {
              preface: 'Declaration Process:',
              statement:
                'Emergency declarations require approval by a two-thirds majority of the Federated Assembly and the Resilience Council.',
            },
            {
              preface: 'Transparency & Accountability:',
              statement:
                'All emergency measures must be accompanied by a public report justifying their necessity. Measures expire after six months unless extended by a supermajority vote and public referendum.',
            },
          ],
        },
        {
          id: '2',
          title: 'Safeguards Against Abuse',
          content: [
            {
              preface: 'Judicial Review:',
              statement:
                'The Federal High Court may review emergency measures to ensure they comply with constitutional principles.',
            },
            {
              preface: 'Public Oversight:',
              statement:
                'A Citizens’ Emergency Oversight Panel will monitor the implementation of emergency measures and report findings to the public.',
            },
          ],
        },
      ],
    },
    {
      id: 'IX',
      title: 'Amendment Process',
      sections: [
        {
          id: '',
          title: '',
          content: [
            {
              preface: 'Proposal:',
              statement:
                'Amendments may be proposed by a two-thirds majority of the Federated Assembly, a petition signed by 10% of the electorate, or a recommendation from the Public Review Commission.',
            },
            {
              preface: 'Ratification:',
              statement:
                'Amendments must be approved by a two-thirds majority of the Federated Assembly and ratified by a public referendum.',
            },
            {
              preface: 'Emergency Amendments:',
              statement:
                'In exceptional circumstances, amendments may be fast-tracked with approval from the Federal High Court and a supermajority of the Federated Assembly.',
            },
          ],
        },
      ],
    },
  ],
  epilogue:
    'This Next-Generation Constitution remains adaptive and participatory, integrating past lessons while evolving with new challenges. Rooted in local autonomy but oriented toward global solidarity, it aspires to safeguard freedom, justice, and collective well-being for all communities—present and future.',
};

export const AnnexOversight: Section[] = [
  {
    id: '1',
    title: 'Public Review Commission (PRC)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Evaluate governmental efficiency, equity, and accountability every five years.',
      },
      {
        preface: 'Composition Members:',
        statement: '15 members, including experts in governance, economics, law, and civil society representatives.',
      },
      {
        preface: 'Selection:',
        statement:
          'Members are nominated by regional councils and confirmed by the Federated Assembly through a transparent, merit-based process.',
      },
      {
        preface: 'Qualifications:',
        statement:
          'Advanced degrees in relevant fields (e.g., public administration, law, economics) or equivalent professional experience.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content:
              '6 years, with staggered terms to ensure continuity. No member may serve more than two consecutive terms.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose financial and professional interests annually. Those with conflicts must recuse themselves from related decisions.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a two-thirds vote of the Federated Assembly or a public recall petition signed by 15% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Independent Oversight Committee (IOC)',
    content: [
      {
        preface: 'Mandate:',
        statement:
          'Monitor and intervene against attempts to consolidate power, suppress dissent, or erode democratic institutions.',
      },
      {
        preface: 'Composition Members:',
        statement: '9 members, including legal scholars, human rights advocates, and former judges.',
      },
      {
        preface: 'Selection:',
        statement:
          'Appointed through a multi-stakeholder process involving civil society organizations, regional councils, and the Federal High Court.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in constitutional law, human rights, or anti-authoritarian governance.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '6 years, with one-third of members rotating every 2 years.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must divest from political or corporate affiliations and disclose potential conflicts annually.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a supermajority vote of the Federated Assembly or a public recall petition signed by 20% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Technology Ethics Council (TEC)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Oversee the ethical use of technology, ensuring transparency, equity, and public safety.',
      },
      {
        preface: 'Composition Members:',
        statement: '12 members, including technologists, ethicists, legal experts, and civil society representatives.',
      },
      {
        preface: 'Selection:',
        statement: 'Nominated by regional councils and confirmed by the Federated Assembly.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Advanced degrees in technology, ethics, or related fields, or equivalent professional experience.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '5 years, with no more than two consecutive terms.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any financial or professional ties to technology companies and recuse themselves from related decisions.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Data Protection Authority (DPA)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Enforce data privacy laws and investigate breaches of personal data.',
      },
      {
        preface: 'Composition Members:',
        statement: '7 members, including cybersecurity experts, legal scholars, and privacy advocates.',
      },
      {
        preface: 'Selection:',
        statement: 'Appointed by the Federated Assembly based on recommendations from regional councils.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in data protection, cybersecurity, or privacy law.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '4 years, renewable once.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must divest from any corporate interests in data collection or processing and disclose potential conflicts annually.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Whistleblower Protection Agency (WPA)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Provide legal and financial support to whistleblowers exposing corruption or misconduct.',
      },
      {
        preface: 'Composition Members:',
        statement: '5 members, including legal experts, former whistleblowers, and civil society representatives.',
      },
      {
        preface: 'Selection:',
        statement: 'Appointed by the Federated Assembly through a transparent, merit-based process.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in whistleblower protection, labor rights, or anti-corruption efforts.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '5 years, with no more than two consecutive terms.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any financial or professional ties to entities that may be subject to whistleblower complaints.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'Future Generations Ombudsman (FGO)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Oversee compliance with future-oriented impact reviews and intergenerational justice principles.',
      },
      {
        preface: 'Composition Members:',
        statement: '3 ombudsmen, including experts in environmental science, economics, and ethics.',
      },
      {
        preface: 'Selection:',
        statement: 'Appointed by the Federated Assembly based on recommendations from regional councils.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Advanced degrees in relevant fields or equivalent professional experience.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '6 years, with no more than two consecutive terms.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any financial or professional ties to industries with significant environmental impacts.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a two-thirds vote of the Federated Assembly or a public recall petition signed by 15% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '7',
    title: 'Guardianship Council (GC)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Represent ecosystems granted environmental personhood in legal proceedings.',
      },
      {
        preface: 'Composition Members:',
        statement: '9 members, including ecologists, indigenous leaders, and legal experts.',
      },
      {
        preface: 'Selection:',
        statement:
          'Appointed by the Federated Assembly through a multi-stakeholder process involving environmental organizations and indigenous communities.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in environmental law, ecology, or indigenous rights.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '5 years, renewable once.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any financial or professional ties to industries impacting ecosystems under their guardianship.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '8',
    title: 'Cultural & Ideological Mediation Council (CIMC)',
    content: [
      {
        preface: 'Mandate:',
        statement:
          'Address conflicts arising from cultural or ideological differences, promoting dialogue and reconciliation.',
      },
      {
        preface: 'Composition Members:',
        statement: '7 members, including cultural leaders, mediators, and human rights advocates.',
      },
      {
        preface: 'Selection:',
        statement:
          'Appointed by the Federated Assembly based on recommendations from regional councils and civil society organizations.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in conflict resolution, cultural studies, or human rights.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '4 years, renewable once.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any affiliations with political or ideological groups and recuse themselves from related cases.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '9',
    title: 'Living Wage Commission (LWC)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Set and periodically adjust minimum wage standards to ensure economic dignity.',
      },
      {
        preface: 'Composition Members:',
        statement: '5 members, including economists, labor rights advocates, and business representatives.',
      },
      {
        preface: 'Selection:',
        statement: 'Appointed by the Federated Assembly through a transparent, merit-based process.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in labor economics, social policy, or business ethics.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '4 years, renewable once.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content: 'Members must disclose any financial or professional ties to businesses or labor unions.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
  {
    id: '10',
    title: 'Hate Speech Review Board (HSRB)',
    content: [
      {
        preface: 'Mandate:',
        statement: 'Evaluate allegations of hate speech and incitement to violence, ensuring consistency and fairness.',
      },
      {
        preface: 'Composition Members:',
        statement: '7 members, including legal scholars, human rights advocates, and linguists.',
      },
      {
        preface: 'Selection:',
        statement: 'Appointed by the Federal High Court through a transparent, merit-based process.',
      },
      {
        preface: 'Qualifications:',
        statement: 'Demonstrated expertise in free speech law, human rights, or linguistics.',
        subSections: [
          {
            id: '1',
            title: 'Term:',
            content: '5 years, renewable once.',
          },
          {
            id: '1',
            title: 'Conflict-of-Interest Rules:',
            content:
              'Members must disclose any political or ideological affiliations and recuse themselves from related cases.',
          },
          {
            id: '1',
            title: 'Removal:',
            content:
              'Members may be removed by a majority vote of the Federated Assembly or a public recall petition signed by 10% of the electorate.',
          },
        ],
      },
    ],
  },
];
export const AnnexOaths: SubSection[] = [
  {
    id: '1',
    title: 'Oath of Office for Elected Officials (Community, Regional, Federated Levels)',
    content:
      'I, [Name], solemnly swear (or affirm) to uphold and defend the Next-Generation Constitution. I will act with integrity, fairness, and justice, ensuring that power remains accountable to the people. I will safeguard human rights, promote environmental stewardship, and uphold democratic values. I pledge to act transparently, ethically, and always in the best interest of the people and future generations. I acknowledge that my authority is granted by the people and may be revoked by them at any time. This I swear, without fear or favor, under my own conscience and the trust of the people.',
  },
  {
    id: '2',
    title: 'Oath for Members of the Oversight Coordination Council (OCC)',
    content:
      'I, [Name], do solemnly swear (or affirm) to serve as a guardian of accountability, ensuring that governance structures operate in accordance with the principles of decentralization, transparency, and public service. I will act impartially, maintain independence from political and corporate influence, and ensure that all oversight bodies fulfill their mandate with integrity. I pledge to enforce the ethical and legal standards set forth in this Constitution, serving as a steward of public trust and equity for all communities. I will never abuse oversight powers for personal or political gain.',
  },
  {
    id: '3',
    title: 'Oath for the Public Review Commission (PRC)',
    content:
      'I, [Name], swear (or affirm) to objectively and rigorously evaluate the efficiency, equity, and accountability of government institutions. I will ensure that public funds are managed responsibly, that governance remains participatory and decentralized, and that the principles of justice and fairness are upheld. I pledge to make my findings transparent, unbiased, and accessible to all, always prioritizing the well-being of present and future generations. I will never allow partisan interests to compromise the Commission’s integrity.',
  },
  {
    id: '4',
    title: 'Oath for the Independent Oversight Committee (IOC)',
    content:
      'I, [Name], solemnly swear (or affirm) to act as a safeguard against the consolidation of power, suppression of dissent, and the erosion of democratic institutions. I will remain vigilant in identifying and addressing threats to democracy, human rights, and civil liberties. I will perform my duties without partiality, resisting all pressures of political, corporate, or ideological influence. I pledge to uphold the principles of balance and accountability, ensuring that no entity or individual wields unchecked power. My allegiance is to the people and the enduring principles of justice and equity.',
  },
  {
    id: '5',
    title: 'Oath for the Technology Ethics Council (TEC)',
    content:
      'I, [Name], swear (or affirm) to uphold the ethical use of technology, ensuring transparency, accountability, and fairness in all technological advancements. I will oversee the responsible implementation of artificial intelligence, data systems, and digital infrastructure, safeguarding privacy and equitable access for all. I pledge to prevent the misuse of technology for authoritarian control, discrimination, or economic exploitation, ensuring that digital innovation serves the common good.',
  },
  {
    id: '6',
    title: 'Oath for the Data Protection Authority (DPA)',
    content:
      'I, [Name], solemnly swear (or affirm) to protect personal data, privacy, and digital rights from unlawful surveillance and exploitation. I will uphold the highest standards of cybersecurity and data governance, ensuring compliance with the Next-Generation Constitution’s protections. I will act with diligence, impartiality, and in service to the public interest, defending individuals from digital oppression and exploitation. I will never misuse my position to manipulate or control digital information.',
  },
  {
    id: '7',
    title: 'Oath for the Whistleblower Protection Agency (WPA)',
    content:
      'I, [Name], swear (or affirm) to uphold the rights and protections of those who expose corruption, injustice, and abuses of power. I will ensure that whistleblowers receive legal, financial, and institutional support, free from retaliation. I pledge to remain neutral in my investigations, prioritizing evidence and truth above all else. I will defend transparency and accountability, ensuring that no individual is silenced for standing against wrongdoing.',
  },
  {
    id: '8',
    title: 'Oath for the Future Generations Ombudsman (FGO)',
    content:
      'I, [Name], solemnly swear (or affirm) to safeguard the interests of future generations, ensuring that policies and governance decisions account for long-term sustainability, climate stability, and intergenerational equity. I will hold governments accountable for their obligations to the planet and future citizens, ensuring that their voices—though yet unborn—are represented in present-day governance. I will never allow short-term gains to undermine long-term survival.',
  },
  {
    id: '9',
    title: 'Oath for the Guardianship Council (GC)',
    content:
      'I, [Name], swear (or affirm) to serve as a steward and legal protector of the ecosystems granted environmental personhood. I will ensure that forests, rivers, oceans, and other critical ecosystems are defended from destruction and exploitation. I will act as a voice for the natural world, ensuring that ecological preservation remains a fundamental pillar of governance, justice, and human survival. I acknowledge that my role extends beyond human interests, protecting all living systems from irreversible harm.',
  },
  {
    id: '10',
    title: 'Oath for the Cultural & Ideological Mediation Council (CIMC)',
    content:
      'I, [Name], swear (or affirm) to promote dialogue, understanding, and reconciliation between diverse cultures, traditions, and ideological perspectives. I will work to resolve conflicts with fairness and sensitivity, ensuring that all people—regardless of background—are given an equal voice. I will advocate for mutual respect and cooperation, ensuring that cultural heritage and human dignity are upheld in all governance decisions. I pledge to seek resolutions that honor diversity without reinforcing oppression.',
  },
  {
    id: '11',
    title: 'Oath for the Living Wage Commission (LWC)',
    content:
      'I, [Name], solemnly swear (or affirm) to ensure fair economic policies that promote dignity, equity, and worker protections. I will oversee the establishment of fair wages and labor rights, ensuring that no person is exploited or left behind in economic policies. I will act with impartiality, resisting external pressures from businesses or political entities that seek to undermine economic justice for all.',
  },
  {
    id: '12',
    title: 'Oath for the Hate Speech Review Board (HSRB)',
    content:
      'I, [Name], solemnly swear (or affirm) to ensure that allegations of hate speech and incitement to violence are addressed fairly and without bias. I will maintain a careful balance between the protection of individual expression and the safety and dignity of communities. My judgments shall uphold justice, peace, and respect for human rights. I pledge to act with impartiality and transparency, and to prevent the misuse of hate speech laws for political suppression or ideological control. I will remain accountable to the public interest, and defend the principles of equity and free expression as enshrined in the Next-Generation Constitution.',
  },
  {
    id: '13',
    title: 'Oath for the Federal High Court (Judges & Legal Officials)',
    content:
      'I, [Name], do solemnly swear (or affirm) to uphold the rule of law, ensuring that justice is impartial, fair, and free from external influence. I will apply the Next-Generation Constitution faithfully, interpreting its principles with wisdom and integrity. I will ensure equal treatment under the law, resisting all forms of prejudice, favoritism, or corruption. My decisions shall be guided solely by evidence, legal precedent, and the pursuit of justice for all.',
  },
  {
    id: '14',
    title: 'Oath for the Defense Council (Civilian Oversight Members)',
    content:
      'I, [Name], solemnly swear (or affirm) to ensure that national defense remains subordinate to democratic governance. I will oversee defense policies with transparency and integrity, ensuring that military and security measures are aligned with constitutional principles. I will never allow defense forces to be used for authoritarian control, corporate exploitation, or aggression beyond justified protection.',
  },
  {
    id: '15',
    title: 'Oath for Emergency & Resilience Responders',
    content:
      'I, [Name], solemnly swear (or affirm) to serve in times of crisis with diligence, courage, and responsibility. I will act to preserve human life, protect communities, and mitigate harm in emergencies. I will uphold humanitarian principles, ensuring that disaster relief and public safety measures are equitable and free from political interference. I will never exploit an emergency for personal, financial, or political gain.',
  },
  {
    id: '16',
    title: 'Oath of Civic Participation for Engaged Citizens',
    content:
      'I, [Name], solemnly swear (or affirm) to uphold the principles and spirit of the Next-Generation Constitution as an engaged citizen. Though I do not hold an official service position, I pledge to actively participate in civic life by promoting democratic values, transparency, and accountability. I will educate myself and others, engage in constructive public discourse, and support efforts that enhance community well-being, social justice, and environmental stewardship. I commit to defending and advancing these principles in my daily actions, ensuring that our collective future is secure and equitable for all.',
  },
];
