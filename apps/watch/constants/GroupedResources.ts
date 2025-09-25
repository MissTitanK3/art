export type Resource = {
  title: string;
  url: string;
  description?: string;
};

export type GroupedResources = {
  [state: string]: {
    [category: string]: Resource[];
  };
};

export const resourceData: GroupedResources = {
  Nationwide: {
    'Know Your Rights': [
      {
        title: 'Recursos para familias inmigrantes (PDF)',
        url: 'https://www.nyc.gov/assets/immigrants/downloads/pdf/standby_guardian_draft_2_spanish.pdf',
      },
      {
        title: 'ACLU Know Your Rights',
        url: 'https://www.aclu.org/know-your-rights/immigrants-rights',
      },
      {
        title: 'Red Cards: Know Your Rights',
        url: 'https://www.ilrc.org/red-cards-tarjetas-rojas',
      },
      {
        title: 'Judicial vs Administrative Warrants',
        url: 'https://www.motionlaw.com/the-difference-between-judicial-and-administrative-warrants/',
      },
      {
        title: 'DACA Resources: United We Dream',
        url: 'https://unitedwedream.org/our-work/daca/',
      },
      {
        title: 'Immigration Defense Project',
        url: 'https://www.immigrantdefenseproject.org/',
      },
      {
        title: 'What to do if you see ICE (Infographic)',
        url: 'https://www.immigrantdefenseproject.org/infographics/#2-ice-on-the-streets',
      },
      {
        title: 'ICE Red Cards for Nonverbal/Disabled Individuals',
        url: 'https://docs.google.com/document/d/1Iv7XmO0Bk7M7Kq_bSGnAilwKTomV2WckW28OQUzIHxc/edit',
      },
    ],
    'Report ICE Presence': [
      {
        title: 'Protect: Protect The Community App',
        url: 'https://apps.apple.com/us/app/protect-protect-the-community/id6741365828',
      },
      {
        title: 'Chismosas Sightings',
        url: 'https://padlet.com/bebe050420/chismosas-sightings-lf0l47ljszbto2uj',
      },
      {
        title: 'Report ICE Sighting - Juntos Seguros',
        url: 'https://juntosseguros.com',
      },
      {
        title: 'Report a Raid - United We Dream',
        url: 'https://unitedwedream.org',
      },
      {
        title: 'Consulapp Contigo',
        url: 'https://apps.apple.com/us/app/consulapp-contigo/id6740634286',
      },
      {
        title: 'ICE Sightings List Nationwide (Google Sheet)',
        url: 'https://docs.google.com/spreadsheets/u/0/d/1YjzP-5jh6t38XXWtodhvswEy-VkooopLokY8az6QoEo/htmlview',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Find an Immigration Lawyer (AILA)',
        url: 'https://www.ailalawyer.com/',
      },
      {
        title: 'Holland Law Firm',
        url: 'https://hollandlawfirmpllc.com/deportation-defense',
      },
      {
        title: 'Martinez Immigration Attorney (OR, CA, TX)',
        url: 'https://www.martinezimmigration.net/consultation/',
      },
    ],
    'Preparation & Planning': [
      {
        title: 'ILRC Immigration Preparedness Toolkit',
        url: 'https://www.ilrc.org/resources/community/immigration-preparedness-toolkit',
      },
      {
        title: 'Employer Guide - What to do if ICE comes to work',
        url: 'https://www.nilc.org/wp-content/uploads/2017/07/EmployerGuide-NELP-NILC-2017-07-1.pdf',
      },
    ],
    'Foster Care & Guardianship': [
      {
        title: 'Children’s Bureau Foster Care Programs',
        url: 'https://www.acf.hhs.gov/cb/focus-areas/foster-care',
      },
      {
        title: 'Foster US Kids',
        url: 'https://www.fosteruskids.org/usa',
      },
      {
        title: 'What is a Standby Guardianship?',
        url: 'https://www.nyc.gov/site/immigrants/legal-resources/immigrant-caregivers.page',
      },
    ],
    'Legal Documents': [
      {
        title: 'Power of Attorney Form',
        url: 'https://templates.legal/power-of-attorney/',
      },
      {
        title: 'Standby Guardianship Form',
        url: 'https://childrenslawcenter.org/wp-content/uploads/2021/09/Designation-of-Standby-Guardian-Form_0.pdf',
      },
    ],
    'Notary Services': [
      {
        title: 'Nationwide Notary - Jennifer Schlangen',
        url: 'https://app.notaryhub.com/notary/jennifer-schlangen',
      },
    ],
    'LGBTQ+ Resources': [
      {
        title: 'LGBTQ+ Immigration Help - Immigration Equality',
        url: 'https://immigrationequality.org/legal/legal-help/#Contact_Us',
      },
    ],
    'Self Care': [
      {
        title: 'Rest is Radical Toolkit',
        url: 'https://unitedwedream.org/resources/resilience-community-care-toolkit/',
      },
    ],
    'Translation & Interpretation': [
      {
        title: 'Immigration Translators',
        url: 'https://immigrationtranslators.com/',
      },
      {
        title: 'Fernandez-Molero Certified Translations',
        url: 'https://www.proimmigrationusa.com/en/certified-translations/',
      },
    ],
  },
  Alabama: {
    'Rapid Response Networks': [
      {
        title: 'Alabama Rapid Response Hotline',
        url: 'https://www.acij.org/what-we-do',
        description:
          'Statewide hotline and community protection network by the Alabama Coalition for Immigrant Justice.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Love Immigration - Immigration Attorney',
        url: 'https://loveimmigration.com',
      },
      {
        title: 'Immigration Legal Service Directory (AL)',
        url: 'https://www.immigrationadvocates.org/nonprofit/legaldirectory/search?state=AL',
      },
      {
        title: 'Solano Immigration Lawyers - Alabama',
        url: 'https://solanofirm.com/alabama-immigration-lawyer-near-me-alabama/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU Alabama Immigration Contacts and Resources',
        url: 'https://www.aclualabama.org/en/about/contact-us',
      },
      {
        title: 'Alabama Coalition for Immigrant Justice',
        url: 'https://www.acij.org/what-we-do',
      },
    ],
    Volunteering: [
      {
        title: 'Volunteer with ACIJ',
        url: 'https://acij.ourpowerbase.net/volunteer',
      },
    ],
    Donations: [
      {
        title: 'Donate to Alabama Coalition for Immigrant Justice',
        url: 'https://acij.ourpowerbase.net/es/civicrm/contribute/transact?reset=1&id=1',
      },
    ],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
  },
  Alaska: {
    'Rapid Response Networks': [
      {
        title: 'Alaska Rapid Response Support (via ACLU/Local Orgs)',
        url: 'https://www.acluak.org/',
        description:
          'While no centralized hotline is listed, ACLU Alaska offers immigration-related advocacy and guidance.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Margaret D. Stock - Cascadia Cross-Border Law',
        url: 'https://cascadialawalaska.com/attorneys/margaret-d-stock/',
      },
      {
        title: 'Nations Law Group (Anchorage, AK)',
        url: 'https://nationslawak.com/deportation-defense-lawyer/',
      },
      {
        title: 'Maquillan and Holman Law, LLC (Anchorage)',
        url: 'https://visamerica.com/legal-services/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Alaska',
        url: 'https://www.acluak.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Arizona: {
    'Rapid Response Networks': [
      {
        title: 'Missing Migrant Hotline (Arizona/New Mexico)',
        url: '',
        description: 'Call No More Deaths: 520-585-5881 for missing migrants crossing the border.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Global Hearts United Lawyers',
        url: 'https://globalheartsunited.com/?utm_campaign=gmb',
      },
      {
        title: 'Federal Immigration Lawyers',
        url: 'https://www.ficpc.com/',
      },
      {
        title: 'Maria Jones Law Firm',
        url: '',
        description: 'Phone: 602-566-9305',
      },
      {
        title: 'Christopher J. Stender',
        url: '',
        description: 'Phone: 602-254-5353',
      },
      {
        title: 'Ortega Law Group',
        url: '',
        description: 'Phone: 866-571-0652',
      },
      {
        title: 'Big Chad Arizona Immigration Attorney',
        url: '',
        description: 'Phone: 602-553-0000',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU Arizona Immigration Contacts and Resources',
        url: 'https://www.acluaz.org/en/immigration',
      },
      {
        title: 'Florence Immigrant and Refugee Rights Project',
        url: 'https://firrp.org/',
      },
      {
        title: 'Trans Queer Pueblo',
        url: 'https://www.tqpueblo.org/?fbclid=IwAR3B7mGvjKqapYzNP-JES_rSB4QKpl79zu9_YIjaJHS0bS6NKLTy9aMC3yE',
      },
      {
        title: 'Chicanos Por La Causa - Arizona',
        url: 'https://cplc.org/regions/arizona',
      },
    ],
    Donations: [
      {
        title: 'Florence Immigrant and Refugee Rights Project - Donate',
        url: 'https://firrp.org/ways-to-give/',
      },
    ],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Arkansas: {
    'Rapid Response Networks': [
      {
        title: 'Arkansas United Rapid Response Hotline',
        url: '',
        description: 'Call 479-763-2822 to Report ICE Presence or seek help.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Murad Law Firm Immigration Law',
        url: 'https://www.muradfirm.com/',
      },
      {
        title: 'Miller, Butler, Schneider, Pawlik & Rozzell, PLLC (Rogers, AR)',
        url: 'https://arkattorneys.com/',
      },
      {
        title: 'Hall, Booth, Smith Attorneys at Law',
        url: 'https://hallboothsmith.com/services/immigration/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Arkansas',
        url: 'https://www.acluarkansas.org/',
      },
      {
        title: 'Arkansas United',
        url: 'https://arkansasunited.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  California: {
    'Rapid Response Networks': [
      {
        title: 'California Rapid Response Hotlines',
        url: 'https://www.ccijustice.org/find-your-local-rr-hotline',
        description: 'Find your local rapid response hotline to Report ICE Presence across California.',
      },
      {
        title: 'California State Trust Act Hotline',
        url: '',
        description: 'Call 1-844-878-7801 for statewide legal assistance related to ICE enforcement.',
      },
      {
        title: 'PáseLa Voz ICE Alerts',
        url: '',
        description: 'Free text alert system. Call or text 1-415-715-9990 to activate.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Pro Bono Legal Services List (California)',
        url: 'https://www.justice.gov/eoir/file/ProBonoCA/dl',
      },
      {
        title: 'Bolour/Carl Immigration Group',
        url: 'https://americanvisas.net/immigration-law/deportation/',
      },
      {
        title: 'Manduley & Camisassa (Los Angeles)',
        url: 'https://abogadosinmigracionlosangeles.la/Abogados-Defensa-Deportacion-Los-Angeles',
      },
      {
        title: 'Law Firm of Amish Vashistha, APLC',
        url: 'https://www.lawfirmav.com/immigration/deportation-removal-defense/',
      },
      {
        title: 'Attorney Eric Price',
        url: 'https://www.abogadoericprice.com/',
      },
      {
        title: 'Martinez Immigration Attorney (CA)',
        url: 'https://www.martinezimmigration.net/consultation/',
      },
      {
        title: 'Daniel Shanfield Immigration Defense P.C.',
        url: 'https://www.immigration-defense.com/deportation-defense/',
      },
      {
        title: 'KPB Immigration Law Firm',
        url: 'https://www.kpbimmigrationlawfirm.com/practices',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Northern California',
        url: 'https://www.aclunc.org/home',
      },
      {
        title: 'ACLU of Southern California',
        url: 'https://www.aclusocal.org/',
      },
      {
        title: 'ACLU of California',
        url: 'https://www.acluca.org/',
      },
      {
        title: 'Chicanos Por La Causa - California',
        url: 'https://cplc.org/regions/california',
      },
      {
        title: 'Diversity Coalition SLO County',
        url: 'https://www.diversityslo.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Colorado: {
    'Rapid Response Networks': [
      {
        title: 'Colorado Rapid Response Network Hotline',
        url: '',
        description: 'Call 1-844-864-8341 for statewide immigration enforcement response.',
      },
      {
        title: 'Colorado Rapid Response Network Facebook Page',
        url: 'https://m.facebook.com/@CORapidResponseNetwork/?wtsid=rdr_0mYefdYPeXTpCZEnM&hr=1',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Pro Bono Legal Services for Colorado',
        url: 'https://www.justice.gov/eoir/file/ProBonoCO/dl',
      },
      {
        title: 'El Refugio (Aurora, CO)',
        url: 'https://www.elrefugiolaw.com/',
      },
      {
        title: 'Shaftel Law US Immigration Law Experts',
        url: 'https://www.lawshaftel.com/',
      },
      {
        title: 'Hernandez & Associates, P.C. (Denver, CO)',
        url: 'https://www.hdezlaw.com/Immigration-Law/',
      },
      {
        title: 'Joseph & Hall Immigration - LGBTQ+ Deportation Defense',
        url: 'https://www.immigrationissues.com/practice-area/lgbt-issues/deportation-defense/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Colorado Immigrant Rights Coalition',
        url: 'https://coloradoimmigrant.org/',
      },
      {
        title: 'ACLU of Colorado',
        url: 'https://www.aclu-co.org',
      },
      {
        title: 'Chicanos Por La Causa - Colorado',
        url: 'https://cplc.org/regions/colorado',
      },
    ],
    Volunteering: [
      {
        title: 'Volunteer with Colorado Immigrant Rights Coalition',
        url: 'https://coloradoimmigrant.org/get-involved/volunteering/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
  },
  Connecticut: {
    'Rapid Response Networks': [
      {
        title: 'Connecticut Immigrant Rights Alliance (CIRA) ICE Watch',
        url: 'https://ctimmigrantrights.org/',
        description: 'ICE raid response network and advocacy coordination through CIRA.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Connecticut Institute for Refugees and Immigrants (CIRI)',
        url: 'https://cirict.org/',
      },
      {
        title: 'Greater Hartford Legal Aid',
        url: 'https://www.ghla.org/',
      },
      {
        title: 'Pro Bono Legal Services List (CT)',
        url: 'https://www.justice.gov/eoir/file/ProBonoCT/download',
      },
      {
        title: 'Esperanza Center for Law & Advocacy',
        url: 'https://esperanzact.org/immigration',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Connecticut Immigrant Rights Alliance (CIRA)',
        url: 'https://ctimmigrantrights.org/',
      },
      {
        title: 'ACLU of Connecticut',
        url: 'https://www.acluct.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Delaware: {
    'Legal Aid & Attorneys': [
      {
        title: 'Community Legal Aid Society (CLASI)',
        url: 'https://www.declasi.org/',
      },
      {
        title: 'Pro Bono Legal Services List (DE)',
        url: 'https://www.justice.gov/eoir/page/file/1205426/download',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Delaware',
        url: 'https://www.aclu-de.org/en/issues/immigrants-rights',
      },
      {
        title: 'Herman Legal Group – Delaware Immigration Lawyers',
        url: 'https://www.lawfirm4immigrants.com/immigration-lawyer-delaware/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Florida: {
    'Rapid Response Networks': [
      {
        title: 'FL Immigrant Coalition (FLIC) Rapid Response Hotline',
        url: '',
        description: 'Call or text 1-888-600-5762 to Report ICE Presence in Florida.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Florida Immigration Pro Bono Directory',
        url: 'https://www.justice.gov/eoir/page/file/1205421/download',
      },
      {
        title: 'AILA South Florida Lawyer Search',
        url: 'https://www.ailalawyer.com/',
      },
      {
        title: 'Church World Service South Florida Immigration Legal Program',
        url: 'https://cwsglobal.org/our-work/refugees-and-immigrants/immigration-legal-services/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Florida Immigrant Coalition (FLIC)',
        url: 'https://floridaimmigrant.org/',
      },
      {
        title: 'ACLU of Florida - Immigrants’ Rights',
        url: 'https://www.aclufl.org/en/issues/immigrants-rights',
      },
      {
        title: 'Chicanos Por La Causa - Florida',
        url: 'https://cplc.org/regions/florida',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    Volunteering: [],
  },
  Georgia: {
    'Rapid Response Networks': [
      {
        title: 'Georgia Latino Alliance for Human Rights (GLAHR) ICE Watch',
        url: 'https://glahr.org/',
        description: 'Report ICE raids by calling or texting 1-404-590-1511.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Georgia Immigration Pro Bono Legal Services Directory',
        url: 'https://www.justice.gov/eoir/page/file/1205422/download',
      },
      {
        title: 'Georgia Asylum & Immigration Network (GAIN)',
        url: 'https://georgiaasylum.org/',
      },
      {
        title: 'Asian Americans Advancing Justice - Atlanta',
        url: 'https://www.advancingjustice-atlanta.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Georgia Latino Alliance for Human Rights (GLAHR)',
        url: 'https://glahr.org/',
      },
      {
        title: 'ACLU of Georgia - Immigrants’ Rights',
        url: 'https://www.acluga.org/en/issues/immigrants-rights',
      },
      {
        title: 'Asian Americans Advancing Justice - Atlanta',
        url: 'https://www.advancingjustice-atlanta.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Hawaii: {
    'Legal Aid & Attorneys': [
      {
        title: 'Hawaii Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205423/download',
      },
      {
        title: 'Legal Aid Society of Hawaii - Immigration Unit',
        url: 'https://www.legalaidhawaii.org/immigration-law.html',
      },
      {
        title: 'Hawaii Immigrant Justice Center at Legal Aid',
        url: 'https://www.legalaidhawaii.org/hijc.html',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Hawaii',
        url: 'https://www.acluhi.org/',
      },
      {
        title: 'Hawaii Coalition for Immigrant Rights',
        url: 'https://www.hcir.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Idaho: {
    'Legal Aid & Attorneys': [
      {
        title: 'Idaho Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205424/download',
      },
      {
        title: 'Immigrant Justice Idaho',
        url: 'https://www.immigrantjusticeidaho.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Immigrant Justice Idaho',
        url: 'https://www.immigrantjusticeidaho.org/',
      },
      {
        title: 'ACLU of Idaho - Immigrants’ Rights',
        url: 'https://www.acluidaho.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Illinois: {
    'Rapid Response Networks': [
      {
        title: 'Family Support Hotline – Illinois Coalition for Immigrant and Refugee Rights (ICIRR)',
        url: 'https://www.icirr.org/',
        description: 'Call 1-855-HELP-MY-FAMILY (1-855-435-7693) to Report ICE Presence or get legal help.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Illinois Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205425/download',
      },
      {
        title: 'National Immigrant Justice Center (NIJC)',
        url: 'https://immigrantjustice.org/',
      },
      {
        title: 'Ascend Justice',
        url: 'https://www.ascendjustice.org/',
      },
      {
        title: 'Legal Aid Chicago – Immigration Project',
        url: 'https://legalaidchicago.org/practice-areas/immigration/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Illinois Coalition for Immigrant and Refugee Rights (ICIRR)',
        url: 'https://www.icirr.org/',
      },
      {
        title: 'ACLU of Illinois - Immigrants’ Rights',
        url: 'https://www.aclu-il.org/en/issues/immigrants-rights',
      },
      {
        title: 'National Immigrant Justice Center',
        url: 'https://immigrantjustice.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Indiana: {
    'Legal Aid & Attorneys': [
      {
        title: 'Indiana Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205427/download',
      },
      {
        title: 'Neighborhood Christian Legal Clinic (Indianapolis)',
        url: 'https://www.nclegalclinic.org/immigration',
      },
      {
        title: 'Catholic Charities – Immigration Services',
        url: 'https://www.archindy.org/cc/indianapolis/immigration.html',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Indiana Undocumented Youth Alliance (IUYA)',
        url: 'https://www.iuya.org/',
      },
      {
        title: 'ACLU of Indiana – Immigrants’ Rights',
        url: 'https://www.aclu-in.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Iowa: {
    'Legal Aid & Attorneys': [
      {
        title: 'Iowa Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205428/download',
      },
      {
        title: 'Iowa Migrant Movement for Justice (Iowa MMJ)',
        url: 'https://www.iowammj.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Iowa Migrant Movement for Justice (Iowa MMJ)',
        url: 'https://www.iowammj.org/',
      },
      {
        title: 'ACLU of Iowa – Immigrants’ Rights',
        url: 'https://www.aclu-ia.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Kansas: {
    'Legal Aid & Attorneys': [
      {
        title: 'Kansas Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205429/download',
      },
      {
        title: 'Catholic Charities of Northeast Kansas – Immigration Services',
        url: 'https://catholiccharitiesks.org/immigration-services',
      },
      {
        title: 'International Rescue Committee (IRC) – Wichita',
        url: 'https://www.rescue.org/united-states/wichita-ks',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Kansas – Immigrants’ Rights',
        url: 'https://www.aclukansas.org/en/issues/immigrants-rights',
      },
      {
        title: 'International Rescue Committee – Wichita',
        url: 'https://www.rescue.org/united-states/wichita-ks',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Kentucky: {
    'Legal Aid & Attorneys': [
      {
        title: 'Kentucky Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205430/download',
      },
      {
        title: 'Maxwell Street Legal Clinic (Lexington)',
        url: 'https://kylaw.org/legal-help/maxwell-street-legal-clinic/',
      },
      {
        title: 'Catholic Charities of Louisville – Immigration Legal Services',
        url: 'https://cclou.org/immigration-legal-services/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Kentucky – Immigrants’ Rights',
        url: 'https://www.aclu-ky.org/en/issues/immigrants-rights',
      },
      {
        title: 'Kentucky Equal Justice Center',
        url: 'https://www.kyequaljustice.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Louisiana: {
    'Legal Aid & Attorneys': [
      {
        title: 'Louisiana Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205431/download',
      },
      {
        title: 'Immigration Services – Catholic Charities Archdiocese of New Orleans',
        url: 'https://www.ccano.org/immigration-and-refugee-services/',
      },
      {
        title: 'Southern Poverty Law Center – Southeast Immigrant Freedom Initiative',
        url: 'https://www.splcenter.org/sefi',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Louisiana – Immigrants’ Rights',
        url: 'https://www.laaclu.org/en/issues/immigrants-rights',
      },
      {
        title: 'Southern Poverty Law Center',
        url: 'https://www.splcenter.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Maine: {
    'Legal Aid & Attorneys': [
      {
        title: 'Maine Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205432/download',
      },
      {
        title: 'Immigrant Legal Advocacy Project (ILAP)',
        url: 'https://ilapmaine.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Immigrant Legal Advocacy Project (ILAP)',
        url: 'https://ilapmaine.org/',
      },
      {
        title: 'ACLU of Maine – Immigrants’ Rights',
        url: 'https://www.aclumaine.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Maryland: {
    'Rapid Response Networks': [
      {
        title: 'Sanctuary DMV ICE Watch',
        url: 'https://www.sanctuarydmv.org/',
        description:
          'Volunteer-powered rapid response network to monitor and respond to ICE presence in the DC/MD/VA area.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Maryland Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205433/download',
      },
      {
        title: 'CAIR Coalition – Legal Services for Detained Immigrants',
        url: 'https://www.caircoalition.org/',
      },
      {
        title: 'Public Justice Center – Immigrant Rights Project',
        url: 'https://www.publicjustice.org/our-work/immigrants-rights/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'CASA de Maryland',
        url: 'https://wearecasa.org/',
      },
      {
        title: 'ACLU of Maryland – Immigrants’ Rights',
        url: 'https://www.aclu-md.org/en/issues/immigrants-rights',
      },
      {
        title: 'CAIR Coalition',
        url: 'https://www.caircoalition.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Massachusetts: {
    'Rapid Response Networks': [
      {
        title: 'Boston Immigrant Justice Accompaniment Network (BIJAN)',
        url: 'https://beyondbondboston.org/',
        description: 'Coordinates accompaniment and bail support for detained immigrants in Massachusetts.',
      },
      {
        title: 'MIRA Coalition ICE Raid Hotline',
        url: 'https://www.miracoalition.org/',
        description: 'Call 1-800-223-5001 to report ICE raids or seek legal assistance.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Massachusetts Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205434/download',
      },
      {
        title: 'Greater Boston Legal Services (GBLS)',
        url: 'https://www.gbls.org/',
      },
      {
        title: 'Political Asylum/Immigration Representation (PAIR) Project',
        url: 'https://www.pairproject.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Massachusetts Immigrant and Refugee Advocacy (MIRA) Coalition',
        url: 'https://www.miracoalition.org/',
      },
      {
        title: 'ACLU of Massachusetts – Immigrants’ Rights',
        url: 'https://www.aclum.org/en/issues/immigrants-rights',
      },
      {
        title: 'Boston Immigrant Justice Accompaniment Network (BIJAN)',
        url: 'https://beyondbondboston.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Michigan: {
    'Rapid Response Networks': [
      {
        title: 'Michigan Immigrant Rights Center (MIRC) ICE Hotline',
        url: 'https://michiganimmigrant.org/',
        description: 'Call 1-734-239-6863 to Report ICE Presence and access legal resources.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Michigan Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205435/download',
      },
      {
        title: 'Michigan Immigrant Rights Center (MIRC)',
        url: 'https://michiganimmigrant.org/',
      },
      {
        title: 'Freedom House Detroit – Immigration Legal Services',
        url: 'https://www.freedomhousedetroit.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Michigan Immigrant Rights Center (MIRC)',
        url: 'https://michiganimmigrant.org/',
      },
      {
        title: 'ACLU of Michigan – Immigrants’ Rights',
        url: 'https://www.aclumich.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Minnesota: {
    'Rapid Response Networks': [
      {
        title: 'MIRAC - Minnesota Immigrant Rights Action Committee',
        url: 'https://mirac1.wordpress.com/',
        description: 'Activist-led immigrant rights defense and ICE watch group based in the Twin Cities.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Minnesota Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205436/download',
      },
      {
        title: 'Immigrant Law Center of Minnesota (ILCM)',
        url: 'https://www.ilcm.org/',
      },
      {
        title: 'Mid-Minnesota Legal Aid – Immigration Law Project',
        url: 'https://mylegalaid.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Immigrant Law Center of Minnesota (ILCM)',
        url: 'https://www.ilcm.org/',
      },
      {
        title: 'ACLU of Minnesota – Immigrants’ Rights',
        url: 'https://www.aclu-mn.org/en/issues/immigrants-rights',
      },
      {
        title: 'MIRAC - Minnesota Immigrant Rights Action Committee',
        url: 'https://mirac1.wordpress.com/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Mississippi: {
    'Legal Aid & Attorneys': [
      {
        title: 'Mississippi Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205437/download',
      },
      {
        title: "Mississippi Center for Justice – Immigrants' Rights",
        url: 'https://mscenterforjustice.org/campaign/immigrants-rights/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Mississippi Center for Justice',
        url: 'https://mscenterforjustice.org/',
      },
      {
        title: 'ACLU of Mississippi – Immigrants’ Rights',
        url: 'https://www.aclu-ms.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Missouri: {
    'Rapid Response Networks': [
      {
        title: 'Missouri Immigrant & Refugee Advocates (MIRA) Rapid Response',
        url: 'https://www.mira-mo.org/',
        description: 'Statewide advocacy and rapid response coordination for immigrant rights in Missouri.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Missouri Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205438/download',
      },
      {
        title: 'Legal Services of Eastern Missouri – Immigration Law Project',
        url: 'https://lsem.org/',
      },
      {
        title: 'Migrant and Immigrant Community Action (MICA) Project',
        url: 'https://www.mica-project.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Missouri Immigrant & Refugee Advocates (MIRA)',
        url: 'https://www.mira-mo.org/',
      },
      {
        title: 'ACLU of Missouri – Immigrants’ Rights',
        url: 'https://www.aclu-mo.org/en/issues/immigrants-rights',
      },
      {
        title: 'Migrant and Immigrant Community Action (MICA) Project',
        url: 'https://www.mica-project.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Montana: {
    'Legal Aid & Attorneys': [
      {
        title: 'Montana Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205439/download',
      },
      {
        title: 'Montana Legal Services Association',
        url: 'https://www.mtlsa.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Montana – Immigrants’ Rights',
        url: 'https://www.aclumontana.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Nebraska: {
    'Legal Aid & Attorneys': [
      {
        title: 'Nebraska Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205440/download',
      },
      {
        title: 'Justice For Our Neighbors - Nebraska',
        url: 'https://jfon-ne.org/',
      },
      {
        title: 'Immigrant Legal Center – Nebraska',
        url: 'https://www.immigrantlc.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Nebraska – Immigrants’ Rights',
        url: 'https://www.aclunebraska.org/en/issues/immigrants-rights',
      },
      {
        title: 'Immigrant Legal Center',
        url: 'https://www.immigrantlc.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Nevada: {
    'Rapid Response Networks': [
      {
        title: 'ARRIBA Las Vegas Worker Center – ICE Watch',
        url: 'https://arribalasvegas.org/',
        description: 'Community-led ICE watch and immigrant worker advocacy organization.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Nevada Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205441/download',
      },
      {
        title: 'UNLV Immigration Clinic',
        url: 'https://law.unlv.edu/clinics/immigration',
      },
      {
        title: 'Legal Aid Center of Southern Nevada – Immigration Services',
        url: 'https://www.lacsn.org/what-we-do/immigration',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ARRIBA Las Vegas Worker Center',
        url: 'https://arribalasvegas.org/',
      },
      {
        title: 'ACLU of Nevada – Immigrants’ Rights',
        url: 'https://www.aclunv.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'New Hampshire': {
    'Legal Aid & Attorneys': [
      {
        title: 'New Hampshire Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205442/download',
      },
      {
        title: 'NH Legal Assistance – Immigration Resources',
        url: 'https://www.nhla.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of New Hampshire – Immigrants’ Rights',
        url: 'https://www.aclu-nh.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  'New Jersey': {
    'Rapid Response Networks': [
      {
        title: 'New Jersey Alliance for Immigrant Justice (NJAIJ)',
        url: 'https://www.njimmigrantjustice.org/',
        description: 'Coalition advancing policies to protect immigrants, including ICE watch and advocacy.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'New Jersey Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205443/download',
      },
      {
        title: 'American Friends Service Committee – Immigrant Rights Program',
        url: 'https://afsc.org/program/immigrant-rights-program-newark',
      },
      {
        title: 'Legal Services of New Jersey – Immigration Representation',
        url: 'https://www.lsnj.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'New Jersey Alliance for Immigrant Justice (NJAIJ)',
        url: 'https://www.njimmigrantjustice.org/',
      },
      {
        title: 'ACLU of New Jersey – Immigrants’ Rights',
        url: 'https://www.aclu-nj.org/theissues/immigrantsrights/',
      },
      {
        title: 'American Friends Service Committee – Immigrant Rights Program',
        url: 'https://afsc.org/program/immigrant-rights-program-newark',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'New Mexico': {
    'Rapid Response Networks': [
      {
        title: 'New Mexico Dream Team – ICE Rapid Response',
        url: 'https://www.nmdreamteam.org/',
        description: 'Youth-led immigrant rights organization supporting ICE watch and deportation defense.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'New Mexico Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205444/download',
      },
      {
        title: 'New Mexico Immigrant Law Center',
        url: 'https://nmilc.org/',
      },
      {
        title: 'Catholic Charities of Central New Mexico – Immigration & Citizenship Legal Services',
        url: 'https://www.ccasfnm.org/immigration-and-citizenship-legal-assistance',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'New Mexico Immigrant Law Center',
        url: 'https://nmilc.org/',
      },
      {
        title: 'New Mexico Dream Team',
        url: 'https://www.nmdreamteam.org/',
      },
      {
        title: 'ACLU of New Mexico – Immigrants’ Rights',
        url: 'https://www.aclu-nm.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'New York': {
    'Rapid Response Networks': [
      {
        title: 'New York Immigrant Family Unity Project (NYIFUP)',
        url: 'https://www.vera.org/projects/new-york-immigrant-family-unity-project',
        description: 'Provides free legal representation to detained immigrants in NYC-area immigration courts.',
      },
      {
        title: 'ActionNYC',
        url: 'https://www.nyc.gov/actionnyc',
        description: 'City-run initiative connecting New Yorkers to free, safe immigration legal help.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'New York Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205445/download',
      },
      {
        title: 'Legal Aid Society – Immigration Law Unit',
        url: 'https://legalaidnyc.org/',
      },
      {
        title: 'Make the Road New York – Legal Services',
        url: 'https://maketheroadny.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'New York Immigration Coalition (NYIC)',
        url: 'https://www.nyic.org/',
      },
      {
        title: 'ACLU of New York (NYCLU) – Immigrants’ Rights',
        url: 'https://www.nyclu.org/en/issues/immigrants-rights',
      },
      {
        title: 'Make the Road New York',
        url: 'https://maketheroadny.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'North Carolina': {
    'Rapid Response Networks': [
      {
        title: 'Siembra NC – Deportation Defense',
        url: 'https://www.siembranc.org/',
        description: 'Grassroots immigrant-led group offering deportation defense and ICE raid response.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'North Carolina Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205446/download',
      },
      {
        title: 'Charlotte Center for Legal Advocacy – Immigrant Justice Program',
        url: 'https://charlottelegaladvocacy.org/',
      },
      {
        title: 'North Carolina Justice Center – Immigrant and Refugee Rights Project',
        url: 'https://www.ncjustice.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Siembra NC',
        url: 'https://www.siembranc.org/',
      },
      {
        title: 'ACLU of North Carolina – Immigrants’ Rights',
        url: 'https://www.acluofnorthcarolina.org/en/issues/immigrants-rights',
      },
      {
        title: 'North Carolina Justice Center',
        url: 'https://www.ncjustice.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'North Dakota': {
    'Legal Aid & Attorneys': [
      {
        title: 'North Dakota Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205447/download',
      },
      {
        title: 'Legal Services of North Dakota',
        url: 'https://www.legalassist.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of North Dakota – Immigrants’ Rights',
        url: 'https://www.aclund.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Ohio: {
    'Legal Aid & Attorneys': [
      {
        title: 'Ohio Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205448/download',
      },
      {
        title: 'Advocates for Basic Legal Equality (ABLE)',
        url: 'https://www.ablelaw.org/',
      },
      {
        title: 'Community Refugee & Immigration Services (CRIS)',
        url: 'https://www.crisohio.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Ohio Immigrant Alliance',
        url: 'https://www.ohioimmigrant.org/',
      },
      {
        title: 'ACLU of Ohio – Immigrants’ Rights',
        url: 'https://www.acluohio.org/en/issues/immigrants-rights',
      },
      {
        title: 'Community Refugee & Immigration Services (CRIS)',
        url: 'https://www.crisohio.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Oklahoma: {
    'Legal Aid & Attorneys': [
      {
        title: 'Oklahoma Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205449/download',
      },
      {
        title: 'Catholic Charities of Eastern Oklahoma – Immigration Legal Services',
        url: 'https://cceok.org/immigration',
      },
      {
        title: 'Legal Aid Services of Oklahoma',
        url: 'https://www.legalaidok.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Dream Action Oklahoma (DAOK)',
        url: 'https://www.facebook.com/DreamActionOK/',
      },
      {
        title: 'ACLU of Oklahoma – Immigrants’ Rights',
        url: 'https://www.acluok.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Oregon: {
    'Rapid Response Networks': [
      {
        title: 'Portland Immigrant Rights Coalition (PIRC) Rapid Response',
        url: 'https://www.portlandoregon.gov/oni/article/675083',
        description: 'Community-based ICE raid response and deportation defense coordination in Portland.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Oregon Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205450/download',
      },
      {
        title: 'Innovation Law Lab',
        url: 'https://innovationlawlab.org/',
      },
      {
        title: 'Immigration Counseling Service (ICS)',
        url: 'https://www.ics-law.org/',
      },
      {
        title: 'Legal Aid Services of Oregon',
        url: 'https://lasoregon.org',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Causa Oregon',
        url: 'https://causaoregon.org/',
      },
      {
        title: 'ACLU of Oregon – Immigrants’ Rights',
        url: 'https://www.aclu-or.org/en/issues/immigrants-rights',
      },
      {
        title: 'Innovation Law Lab',
        url: 'https://innovationlawlab.org/',
      },
      {
        title: 'Unidos- Bridging Communities',
        url: 'https://unidosyamhillcounty.org',
      },
      {
        title: 'Campo Uno- St. Matthew Catholic Church & School',
        url: 'https://www.stmatthewhillsboro.org/migrant-camp',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Pennsylvania: {
    'Rapid Response Networks': [
      {
        title: 'Juntos – ICE Watch & Deportation Defense',
        url: 'https://vamosjuntos.org/',
        description: 'Philadelphia-based Latinx immigrant rights group coordinating ICE raid alerts and support.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Pennsylvania Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205451/download',
      },
      {
        title: 'HIAS Pennsylvania – Legal Services for Immigrants',
        url: 'https://hiaspa.org/',
      },
      {
        title: 'Nationalities Service Center – Immigration Legal Services',
        url: 'https://nscphila.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Juntos',
        url: 'https://vamosjuntos.org/',
      },
      {
        title: 'ACLU of Pennsylvania – Immigrants’ Rights',
        url: 'https://www.aclupa.org/en/issues/immigrants-rights',
      },
      {
        title: 'HIAS Pennsylvania',
        url: 'https://hiaspa.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'Rhode Island': {
    'Legal Aid & Attorneys': [
      {
        title: 'Rhode Island Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205452/download',
      },
      {
        title: 'Dorcas International Institute of Rhode Island – Immigration Services',
        url: 'https://diiri.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Rhode Island – Immigrants’ Rights',
        url: 'https://www.riaclu.org/en/issues/immigrants-rights',
      },
      {
        title: 'Dorcas International Institute of Rhode Island',
        url: 'https://diiri.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  'South Carolina': {
    'Legal Aid & Attorneys': [
      {
        title: 'South Carolina Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205453/download',
      },
      {
        title: 'South Carolina Legal Services – Immigration Law',
        url: 'https://sclegal.org/',
      },
      {
        title: 'Catholic Charities of South Carolina – Immigration Services',
        url: 'https://charitiessc.org/immigration-services',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of South Carolina – Immigrants’ Rights',
        url: 'https://www.aclusc.org/en/issues/immigrants-rights',
      },
      {
        title: 'SC Appleseed Legal Justice Center – Immigration',
        url: 'https://www.scjustice.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  'South Dakota': {
    'Legal Aid & Attorneys': [
      {
        title: 'South Dakota Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205454/download',
      },
      {
        title: 'East River Legal Services',
        url: 'https://erlservices.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of South Dakota – Immigrants’ Rights',
        url: 'https://www.aclusd.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Tennessee: {
    'Legal Aid & Attorneys': [
      {
        title: 'Tennessee Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205455/download',
      },
      {
        title: 'Tennessee Immigrant and Refugee Rights Coalition (TIRRC) – Legal Services',
        url: 'https://www.tnimmigrant.org/',
      },
      {
        title: 'Community Legal Center – Immigration Law',
        url: 'https://www.clcmemphis.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Tennessee Immigrant and Refugee Rights Coalition (TIRRC)',
        url: 'https://www.tnimmigrant.org/',
      },
      {
        title: 'ACLU of Tennessee – Immigrants’ Rights',
        url: 'https://www.aclu-tn.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Texas: {
    'Rapid Response Networks': [
      {
        title: 'RAICES Texas – Rapid Response & Bond Fund',
        url: 'https://www.raicestexas.org/',
        description: 'RAICES provides rapid response, legal services, and support for detained immigrants.',
      },
      {
        title: 'Houston Rapid Response Network (HRRN)',
        url: 'https://www.houstonimmigration.org/hrrn',
        description: 'Community-led ICE raid hotline and verification network for the Houston area.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Texas Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205456/download',
      },
      {
        title: 'RAICES Texas – Legal Services',
        url: 'https://www.raicestexas.org/',
      },
      {
        title: 'American Gateways – Immigration Legal Services',
        url: 'https://www.americangateways.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Texas Civil Rights Project – Immigrant Rights',
        url: 'https://txcivilrights.org/programs/immigrant-rights/',
      },
      {
        title: 'ACLU of Texas – Immigrants’ Rights',
        url: 'https://www.aclutx.org/en/issues/immigrants-rights',
      },
      {
        title: 'RAICES Texas',
        url: 'https://www.raicestexas.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Utah: {
    'Legal Aid & Attorneys': [
      {
        title: 'Utah Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205457/download',
      },
      {
        title: 'Catholic Community Services of Utah – Immigration Program',
        url: 'https://www.ccsutah.org/services/immigration',
      },
      {
        title: 'Holy Cross Ministries – Immigration Legal Services',
        url: 'https://www.holycrossministries.org/immigration-legal-services/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Utah Immigration Collaborative',
        url: 'https://www.utahimmigration.org/',
      },
      {
        title: 'ACLU of Utah – Immigrants’ Rights',
        url: 'https://www.acluutah.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Vermont: {
    'Legal Aid & Attorneys': [
      {
        title: 'Vermont Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205458/download',
      },
      {
        title: 'Vermont Legal Aid – Immigration Assistance',
        url: 'https://www.vtlegalaid.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Vermont – Immigrants’ Rights',
        url: 'https://www.acluvt.org/en/issues/immigrants-rights',
      },
      {
        title: 'Association of Africans Living in Vermont (AALV)',
        url: 'https://www.aalv-vt.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Virginia: {
    'Rapid Response Networks': [
      {
        title: 'La ColectiVA – ICE Raid Response & Hotline',
        url: 'https://www.lacolectivava.org/',
        description: 'Grassroots collective offering immigrant solidarity and ICE raid response in Northern Virginia.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Virginia Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205459/download',
      },
      {
        title: 'Legal Aid Justice Center – Immigrant Advocacy Program',
        url: 'https://www.justice4all.org/',
      },
      {
        title: 'Catholic Charities of Arlington – Migration and Refugee Services',
        url: 'https://www.ccda.net/need-help/migration-and-refugee-services/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Virginia Coalition for Immigrant Rights',
        url: 'https://virginiaimmigrantrights.org/',
      },
      {
        title: 'ACLU of Virginia – Immigrants’ Rights',
        url: 'https://www.acluva.org/en/issues/immigrants-rights',
      },
      {
        title: 'La ColectiVA',
        url: 'https://www.lacolectivava.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  Washington: {
    'Rapid Response Networks': [
      {
        title: 'Washington Immigrant Solidarity Network (WAISN) – ICE Rapid Response',
        url: 'https://www.waisn.org/',
        description: 'Statewide network providing community defense and rapid response to ICE presence.',
      },
    ],
    'Legal Aid & Attorneys': [
      {
        title: 'Washington Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205460/download',
      },
      {
        title: 'Northwest Immigrant Rights Project (NWIRP)',
        url: 'https://www.nwirp.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Washington – Immigrants’ Rights',
        url: 'https://www.aclu-wa.org/issues/immigrants-rights',
      },
      {
        title: 'Washington Immigrant Solidarity Network (WAISN)',
        url: 'https://www.waisn.org/',
      },
      {
        title: 'Northwest Immigrant Rights Project (NWIRP)',
        url: 'https://www.nwirp.org/',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    Volunteering: [],
  },
  'West Virginia': {
    'Legal Aid & Attorneys': [
      {
        title: 'West Virginia Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205461/download',
      },
      {
        title: 'Legal Aid of West Virginia',
        url: 'https://www.lawv.net/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of West Virginia – Immigrants’ Rights',
        url: 'https://www.acluwv.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Wisconsin: {
    'Legal Aid & Attorneys': [
      {
        title: 'Wisconsin Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205462/download',
      },
      {
        title: 'Catholic Charities – Archdiocese of Milwaukee Immigration Services',
        url: 'https://www.ccmke.org/Our-Services/Immigration-Legal-Services.htm',
      },
      {
        title: 'Centro Legal – Milwaukee',
        url: 'https://centrolegalwisconsin.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'Voces de la Frontera',
        url: 'https://vdlf.org/',
      },
      {
        title: 'ACLU of Wisconsin – Immigrants’ Rights',
        url: 'https://www.aclu-wi.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
  Wyoming: {
    'Legal Aid & Attorneys': [
      {
        title: 'Wyoming Immigration Legal Services Directory (Pro Bono List)',
        url: 'https://www.justice.gov/eoir/page/file/1205463/download',
      },
      {
        title: 'Legal Aid of Wyoming',
        url: 'https://www.lawyoming.org/',
      },
    ],
    'Organizations/Coalitions': [
      {
        title: 'ACLU of Wyoming – Immigrants’ Rights',
        url: 'https://www.acluwy.org/en/issues/immigrants-rights',
      },
    ],
    Donations: [],
    'Report ICE Presence': [],
    'Preparation & Planning': [],
    'Foster Care & Guardianship': [],
    'Legal Documents': [],
    'Notary Services': [],
    'LGBTQ+ Resources': [],
    'Self Care': [],
    'Translation & Interpretation': [],
    'Rapid Response Networks': [],
    Volunteering: [],
  },
};

// Donations: [],
// 'Report ICE Presence': [],
// 'Legal Aid & Attorneys': [],
// 'Preparation & Planning': [],
// 'Foster Care & Guardianship': [],
// 'Legal Documents': [],
// 'Notary Services': [],
// 'LGBTQ+ Resources': [],
// 'Self Care': [],
// 'Translation & Interpretation': [],
// 'Rapid Response Networks': [],
// 'Organizations/Coalitions': [],
// Volunteering: [],
