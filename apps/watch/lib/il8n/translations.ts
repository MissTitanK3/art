// Translation strings for supported languages
export type TranslationKey =
  | 'homeTitle'
  | 'reportTitle'
  | 'privacyTagline'
  | 'troubleWithApp'
  | 'startReport'
  | 'viewHeatmap'
  | 'supportProject'
  | 'home'
  | 'locationPrompt'
  | 'uploadMedia'
  | 'next'
  | 'back'
  | 'optionalNote'
  | 'gpsError'
  | 'quickExit'
  | 'warning'
  | 'visibleReports'
  | 'noReports'
  | 'agencies'
  | 'reported'
  | 'timeAgo'
  | 'reportWizard'
  | 'whoDidYouSee'
  | 'tapAllThatApply'
  | 'other'
  | 'placeholderAgencyExample'
  | 'tapMapOrGPS'
  | 'submit'
  | 'zoomOutForSafety'
  | 'haveMedia'
  | 'mediaFundingNotice'
  | 'whyUpload'
  | 'mediaPrivacyNote'
  | 'finish'
  | 'liveReportPreview'
  | 'otherAgency'
  | 'noneSelected'
  | 'location'
  | 'media'
  | 'notSet'
  | 'noFileUploaded'
  | 'findMe'
  | 'locationDenied'
  | 'copyToClipboard'
  | 'copiedToClipboard'
  | 'kyrTitle'
  | 'kyrIntro'
  | 'arrestFormTitle'
  | 'locationLabel'
  | 'timeLabel'
  | 'nameLabel'
  | 'dobLabel'
  | 'anumberLabel'
  | 'agencyLabel'
  | 'warrantLabel'
  | 'entryLabel'
  | 'contactLabel'
  | 'kidsLabel'
  | 'healthLabel'
  | 'identityLabel'
  | 'courtHistoryLabel'
  | 'nextStepsLabel'
  | 'callsLabel'
  | 'lawyerLabel'
  | 'arrestSubTitle'
  | 'arrestDesc'
  | 'languageSupportInvite'
  | 'translationTemplate'
  | 'includesReference'
  | 'existingTranslations'
  | 'kyrSection1Title'
  | 'kyrSection1Bullet1'
  | 'kyrSection1Bullet2'
  | 'kyrSection1Bullet3'
  | 'kyrSection1Bullet4'
  | 'kyrSection1Bullet5'
  | 'kyrSection2Title'
  | 'kyrSection2Intro'
  | 'kyrSection2Bullet1'
  | 'kyrSection2Bullet2'
  | 'kyrSection2Bullet3'
  | 'kyrSection2Bullet4'
  | 'kyrSection2Bullet5'
  | 'kyrSection2Bullet6'
  | 'kyrSection2Bullet7'
  | 'kyrSection2Bullet8'
  | 'kyrSection2Bullet9'
  | 'kyrSection2Note1'
  | 'kyrSection2Note2'
  | 'requestLanguageSupport'
  | 'agency.ICE'
  | 'agency.Police'
  | 'agency.State Police'
  | 'agency.Sheriff'
  | 'agency.Border Patrol'
  | 'agency.Immigration Court'
  | 'agency.Unmarked'
  | 'agency.Military'
  | 'agency.Detention Facility'
  | 'transparencyTitle'
  | 'transparencyWhyTitle'
  | 'transparencyWhyText'
  | 'transparencyCollectTitle'
  | 'transparencyCollectList1'
  | 'transparencyCollectList2'
  | 'transparencyCollectList3'
  | 'transparencyCollectList4'
  | 'transparencyCollectList5'
  | 'transparencyCollectList6'
  | 'transparencyCollectList7'
  | 'transparencyCollectList8'
  | 'transparencyAnonNote'
  | 'transparencyTypesTitle'
  | 'transparencyRecentReports'
  | 'transparencyInspectTitle'
  | 'transparencyInspectDesktop'
  | 'transparencyInspectMobile'
  | 'transparencyQueuedExplain'
  | 'transparencyFormDataExplain'
  | 'transparencyReportExplain'
  | 'githubCardTitle'
  | 'githubCardText'
  | 'dismissalTitle'
  | 'dismissalIntroStart'
  | 'dismissalIntroHighlight1'
  | 'dismissalIntroMid'
  | 'dismissalIntroHighlight2'
  | 'dismissalPoint1'
  | 'dismissalPoint2'
  | 'dismissalPoint3'
  | 'dismissalProtection'
  | 'dismissalSupport'
  | 'dismissalFlowchartAlt'
  | 'githubCardLink'
  | 'officerMovement'
  | 'moving'
  | 'stationary'
  | 'directionOfTravel'
  | 'emergencyIndicators'
  | 'lights'
  | 'sirens'
  | 'officerDirection'
  | 'lightsOn'
  | 'lightsOff'
  | 'sirensOn'
  | 'sirensOff'
  | 'haveMedia'
  | 'optionalNote'
  | 'mediaFundingNotice'
  | 'whyUpload'
  | 'mediaPrivacyNote'
  | 'direction.North'
  | 'direction.NorthEast'
  | 'direction.East'
  | 'direction.SouthEast'
  | 'direction.South'
  | 'direction.SouthWest'
  | 'direction.West'
  | 'direction.NorthWest'
  | 'yes'
  | 'no'
  | 'movementUnknown'
  | 'officerDirectionUnknown'
  | 'transparencyOfficerNote'
  | 'joinDispatch'
  | 'joinDispatchTitle'
  | 'joinDispatchIntro'
  | 'joinDispatchNote'
  | 'joinDispatchContactButton'
  | 'joinDispatchRolesTitle'
  | 'joinDispatchFooter'
  | 'joinDispatchRole.dispatcher'
  | 'joinDispatchRole.deescalation'
  | 'joinDispatchRole.court'
  | 'joinDispatchRole.legal'
  | 'joinDispatchRole.mentalHealth'
  | 'joinDispatchRole.medic'
  | 'joinDispatchRole.checkpoint'
  | 'joinDispatchRole.child'
  | 'joinDispatchRole.translator'
  | 'joinDispatchRole.tech'
  | 'joinDispatchLanguageNote'
  | 'verifiedByDispatch'
  | 'anonymous'
  | 'filterAgencies'
  | 'resetFilters'
  | 'immigrantResourcesTitle'
  | 'noResourcesYet'
  | 'Donations'
  | 'Report ICE Presence'
  | 'Legal Aid & Attorneys'
  | 'Preparation & Planning'
  | 'Foster Care & Guardianship'
  | 'Legal Documents'
  | 'Notary Services'
  | 'LGBTQ+ Resources'
  | 'Self Care'
  | 'Translation & Interpretation'
  | 'Rapid Response Networks'
  | 'Organizations/Coalitions'
  | 'Volunteering'
  | 'locationNoticePrefix'
  | 'transparencyPage'
  | 'locationNoticeSuffix'
  | 'dataSeizureTitle'
  | 'dataSeizureLawsTitle'
  | 'dataSeizureLawCLOUD'
  | 'dataSeizureLawFISA'
  | 'dataSeizureLawPatriot'
  | 'dataSeizureMitigationTitle'
  | 'dataSeizureMitigationEncryption'
  | 'dataSeizureMitigationForeignHost'
  | 'dataSeizureMitigationMinimalData'
  | 'dataSeizureMitigationLocalTools'
  | 'dataSeizureGDPRTitle'
  | 'dataSeizureGDPRDesc'
  | 'dataSeizureTLDR'
  | 'transparencySafeTitle'
  | 'transparencySafeIntro1'
  | 'transparencySafeIntro2'
  | 'transparencySafeIntro3'
  | 'transparencySafeIntro4'
  | 'transparencySafeWhyTitle'
  | 'transparencySafeWhyDesc'
  | 'transparencySafeWhyBullet1'
  | 'transparencySafeWhyBullet2'
  | 'transparencySafeWhyBullet3'
  | 'transparencySafeWhyBullet4'
  | 'transparencySafeWhyOutro'
  | 'transparencySafeProtectTitle'
  | 'transparencySafeProtectIntro'
  | 'transparencySafeProtectBullet1'
  | 'transparencySafeProtectBullet2'
  | 'transparencySafeProtectBullet3'
  | 'transparencySafeProtectBullet4'
  | 'transparencySafeProtectBullet5'
  | 'transparencySafeLessonTitle'
  | 'transparencySafeLesson1'
  | 'transparencySafeLesson2'
  | 'transparencySafeOutro'
  | 'contactUs'
  | 'test'
  | 'testReport'
  | 'testReportDescription'
  | 'mapControlsTitle'
  | 'mapControlsOpen'
  | 'mapControlsZoomIn'
  | 'mapControlsZoomOut'
  | 'mapControlsRegion'
  | 'mapControlsCity'
  | 'mapControlsNeighborhood'
  | 'mapControlsStreet'
  | 'mapControlsReset'
  | 'mapControlsUS'
  | 'mapControlsClose'
  | 'goToAcademy'
  | 'goToDispatch';

export const roleKeys: TranslationKey[] = [
  'joinDispatchRole.dispatcher',
  'joinDispatchRole.deescalation',
  'joinDispatchRole.court',
  'joinDispatchRole.legal',
  'joinDispatchRole.mentalHealth',
  'joinDispatchRole.medic',
  'joinDispatchRole.checkpoint',
  'joinDispatchRole.child',
  'joinDispatchRole.translator',
  'joinDispatchRole.tech',
];
export const TRANSLATIONS: {
  en: Record<TranslationKey, string>;
  es: Record<TranslationKey, string>;
  [lang: string]: Record<TranslationKey, string>;
} = {
  en: {
    goToAcademy: 'Go To Academy',
    goToDispatch: 'Go To Dispatch',
    mapControlsTitle: 'Map Controls',
    mapControlsOpen: 'Open map keyboard controls',
    mapControlsClose: 'Close map keyboard controls',
    mapControlsZoomIn: 'Zoom In',
    mapControlsZoomOut: 'Zoom Out',
    mapControlsUS: 'Country View (Zoom 3)',
    mapControlsRegion: 'Region View (Zoom 7)',
    mapControlsCity: 'City View (Zoom 10)',
    mapControlsNeighborhood: 'Street (Zoom 13)',
    mapControlsStreet: 'Street Level (Zoom 16)',
    mapControlsReset: 'Reset Zoom',
    test: 'TEST',
    testReport: 'Test Report',
    testReportDescription:
      'Toggle this on to test submitting reports. The report will be visible for 5 minutes before auto-deleting.',
    Donations: 'Donations',
    'Report ICE Presence': 'Report ICE Presence',
    'Legal Aid & Attorneys': 'Legal Aid & Attorneys',
    'Preparation & Planning': 'Preparation & Planning',
    'Foster Care & Guardianship': 'Foster Care & Guardianship',
    'Legal Documents': 'Legal Documents',
    'Notary Services': 'Notary Services',
    'LGBTQ+ Resources': 'LGBTQ+ Resources',
    'Self Care': 'Self Care',
    'Translation & Interpretation': 'Translation & Interpretation',
    'Rapid Response Networks': 'Rapid Response Networks',
    'Organizations/Coalitions': 'Organizations/Coalitions',
    Volunteering: 'Volunteering',
    locationNoticePrefix:
      'To load the map and help you place the pin, this step needs temporary access to your location. When your device prompts you, we recommend choosing “Allow this time.” Your location is used only to center the map — it is never stored, collected, or shared. Learn more on our',
    transparencyPage: 'Transparency page',
    locationNoticeSuffix: '.',

    // Homepage
    immigrantResourcesTitle: 'Immigrant Action Resources by State & Category',
    noResourcesYet: 'No Resources Yet',
    homeTitle: 'ART Watch',
    privacyTagline: 'Privacy-safe community reporting for ICE and law enforcement presence.',
    startReport: 'Start Report',
    viewHeatmap: 'View Heatmap',
    supportProject: 'Support The Project (ko-fi)',
    requestLanguageSupport: 'Request Language Support',
    troubleWithApp:
      'If you have any trouble with the app, email us and let us know whats going on! That way we can fix it.',
    yes: 'Yes',
    no: 'No',
    noneSelected: 'None selected',
    notSet: 'Not set',
    // Court Appearance
    dismissalTitle: '⚠️ Court Dismissal Doesn’t Mean You’re Safe',
    dismissalIntroStart: 'If someone’s case is',
    dismissalIntroHighlight1: 'dismissed in immigration court',
    dismissalIntroMid: ', it means the judge is closing the case — but it does',
    dismissalIntroHighlight2: 'not mean they are protected from deportation',
    dismissalPoint1: 'ICE can still detain and deport someone through expedited removal.',
    dismissalPoint2: 'Dismissals often happen for technical or policy reasons — not because status is secure.',
    dismissalPoint3: 'If someone has no lawful status, they may still be at risk even after a dismissal.',
    dismissalProtection:
      'The only way to be fully protected is to secure lawful status (asylum, green card, etc.). Even then, it’s important to stay aware of changing laws and ICE tactics.',
    dismissalSupport: 'Community support, rapid response, and accurate reporting can protect our people.',
    dismissalFlowchartAlt: 'Flowchart showing how dismissal does not prevent deportation',

    // Heatmap
    reportTitle: 'Community Report Heatmap',
    'agency.ICE': 'ICE',
    'agency.Police': 'Police',
    'agency.State Police': 'State Police',
    'agency.Sheriff': 'Sheriff',
    'agency.Border Patrol': 'Border Patrol',
    'agency.Immigration Court': 'Immigration Court',
    'agency.Detention Facility': 'Detention Facility',
    'agency.Unmarked': 'Unmarked',
    'agency.Military': 'Military',
    // English
    officerDirection: 'Direction of Travel',
    lightsOn: 'Lights On',
    lightsOff: 'Lights Off',
    sirensOn: 'Sirens On',
    sirensOff: 'Sirens Off',
    movementUnknown: 'Movement not reported',
    verifiedByDispatch: 'Verified By Dispatch',
    filterAgencies: 'Filter Agencies',
    resetFilters: 'Reset Filters',

    // Heatlayer
    visibleReports: 'Visible Reports',
    noReports: 'No reports in current view.',
    agencies: 'Agencies:',
    reported: 'Reported:',
    timeAgo: ' ago',
    findMe: 'Where am I?',
    locationDenied: 'Location access was denied or is unavailable.',
    anonymous: 'Anonymous',

    // Wizard
    reportWizard: 'Report Wizard',
    whoDidYouSee: 'Who did you see?',
    tapAllThatApply: 'Tap all that apply.',
    other: 'Other:',
    placeholderAgencyExample: 'e.g., Federal Marshals, Private Contractor',
    tapMapOrGPS: 'Tap the map or allow GPS.',
    submit: 'Submit',
    zoomOutForSafety: 'For safety, zoom out if this location is too specific.',
    haveMedia: 'Do you have photo or video?',
    mediaFundingNotice: 'When we get community funding, we will be able to add photo and video submissions.',
    whyUpload: 'Why upload?',
    mediaPrivacyNote:
      'Media is never shown publicly. Only verified community partners can review reports. EXIF data is stripped.',
    optionalNote: 'Optional, but helps with credibility.',

    // Wizards
    officerMovement: 'Officer Movement',
    moving: 'Moving',
    stationary: 'Stationary',
    directionOfTravel: 'Direction of Travel',
    'direction.North': 'North',
    'direction.NorthEast': 'Northeast',
    'direction.East': 'East',
    'direction.SouthEast': 'Southeast',
    'direction.South': 'South',
    'direction.SouthWest': 'Southwest',
    'direction.West': 'West',
    'direction.NorthWest': 'Northwest',
    emergencyIndicators: 'Emergency Indicators',
    lights: 'Lights',
    sirens: 'Sirens',
    officerDirectionUnknown: 'Direction not reported',

    // FormPreview
    liveReportPreview: 'Live Report Preview',
    otherAgency: 'Other Agency:',
    location: 'Location:',
    media: 'Media:',
    noFileUploaded: 'No file uploaded',

    locationPrompt: 'Where did it happen?',
    uploadMedia: 'Upload media',
    gpsError: 'No GPS detected. Please enter an address.',

    // General
    next: 'Continue',
    back: 'Back',
    home: 'Home',
    quickExit: 'Quick Exit',
    warning: '⚠️ Do not geotag individuals. This map is for broad community awareness only.',
    finish: 'Finish',
    copyToClipboard: 'Copy To Clipboard',
    copiedToClipboard: 'Copied To Clipboard!',

    // Know your rights
    kyrTitle: 'Know Your Rights',
    kyrIntro:
      'All individuals in the United States have rights, regardless of immigration status. The following information can help you protect yourself and your family, and defend your rights.',

    kyrSection1Title: '1. Create a safety plan',
    kyrSection1Bullet1: 'Identify your emergency contacts and memorize their phone numbers.',
    kyrSection1Bullet2: 'Provide your child’s school or day care with an emergency contact to pick up your child.',
    kyrSection1Bullet3:
      'Provide written authorization for your emergency contact to make medical and legal decisions for your child.',
    kyrSection1Bullet4:
      'Tell your loved ones that if you are detained by ICE, they can try to find you using ICE’s detainee locator: https://locator.ice.gov/odls/#/search',
    kyrSection1Bullet5: 'Learn about guardianship options if you are a parent in Illinois or Indiana (PDF guides).',

    kyrSection2Title: '2. Defend your rights',
    kyrSection2Intro:
      'All persons in the United States have constitutional protections, including the right to remain silent. During any interaction with law enforcement:',
    kyrSection2Bullet1:
      'Stay calm. Do not run, argue, resist, or fight the officer. Keep your hands visible. Notify them before reaching for anything.',
    kyrSection2Bullet2: 'Do not lie about your immigration status or provide false documents.',
    kyrSection2Bullet3:
      'At a traffic stop, ask whether the officer is from ICE or CBP. Immigration officers sometimes call themselves “police.”',
    kyrSection2Bullet4:
      'If you are documented: Carry proof of status (e.g., green card or work permit) if you are over 18.',
    kyrSection2Bullet5:
      'If you are undocumented: You can remain silent. Do not answer questions about your immigration status.',
    kyrSection2Bullet6: 'If someone knocks on your door: Don’t open it. ICE needs a judge-signed warrant to enter.',
    kyrSection2Bullet7: 'If outdoors and ICE is nearby: Move indoors if possible.',
    kyrSection2Bullet8: 'If you are a citizen and feel safe: Record or document the event without interfering.',
    kyrSection2Bullet9: 'Do not post unverified alerts or put yourself in harm’s way.',

    kyrSection2Note1: 'ICE “warrants” are not signed by judges. They do not give agents permission to enter your home.',
    kyrSection2Note2:
      'Teach children not to open the door. Officers cannot enter without consent unless they have a proper warrant.',

    // Request Language Support
    languageSupportInvite:
      "If your language isn't supported yet, you're welcome to help translate! Use the template below and email it to:",
    translationTemplate: 'Translation Template',
    existingTranslations: 'Existing Translations',
    includesReference: 'This includes English and Spanish for reference.',

    // Questions
    arrestFormTitle: 'ICE Arrest Intake Form',
    arrestSubTitle: 'If Someone is Arrested by ICE',
    arrestDesc: 'Ask these questions to get the most important information quickly.',
    locationLabel: 'Where are you right now?',
    timeLabel: 'When were you taken?',
    nameLabel: 'Full name',
    dobLabel: 'Date of birth',
    anumberLabel: 'A-number (if known)',
    agencyLabel: 'Who arrested you? (ICE, police, etc.)',
    warrantLabel: 'Did they show a warrant? Was it signed by a judge?',
    entryLabel: 'Did they enter your home or stop you in public?',
    contactLabel: 'Who should we contact for you?',
    kidsLabel: 'Do you have children or dependents who need care?',
    healthLabel: 'Any medical conditions, medications, or disabilities?',
    identityLabel: 'Are you especially at risk in detention?',
    courtHistoryLabel: 'Have you had any court date or removal order before?',
    nextStepsLabel: 'Have they told you what happens next?',
    callsLabel: 'Are they letting you make calls?',
    lawyerLabel: 'Do you already have a lawyer? If yes, who?',

    // Transparency
    transparencyTitle: 'Transparency & Data Use',
    transparencyWhyTitle: 'Why Transparency Matters',
    transparencyWhyText:
      'ART Watch is a community tool built to protect, not to surveil. We believe in radical transparency — that means you deserve to know what data we collect, why, and how it’s used.',
    transparencyCollectTitle: 'What We Collect',
    transparencyCollectList1: 'Agency type — who you saw',
    transparencyCollectList2: 'Optional "Other" agency name',
    transparencyCollectList3: 'Approximate location (~1km fuzzed)',
    transparencyCollectList4: 'Optional media (photo/video)',
    transparencyCollectList5: 'Timestamp',
    transparencyCollectList6: 'Whether the officer was moving or stationary',
    transparencyCollectList7: 'Direction the officer was traveling (if moving)',
    transparencyCollectList8: 'Whether emergency lights or sirens were activated',

    transparencyAnonNote: '🛡️ Reports are anonymous. We don’t store your name, phone, or IP.',
    transparencyTypesTitle: 'How We Define a Report (In Code)',
    transparencyRecentReports: 'Explore Recent Reports',
    transparencyInspectTitle: 'See It Yourself',
    transparencyInspectDesktop:
      'On desktop, right-click → Inspect → Network tab → look for a POST to /api/report. This shows you exactly what’s being sent.',
    transparencyInspectMobile: 'Want to verify on mobile? Try using HTTP Toolkit.',
    transparencyQueuedExplain: "This keeps your data on your device until you're ready to submit.",
    transparencyFormDataExplain:
      'This is what your device creates when you fill out the report form. No personal info is included.',
    transparencyReportExplain: 'This is the final format saved in our secure Supabase database.',

    dataSeizureTitle: 'U.S. Government Access to Your Data',
    dataSeizureLawsTitle: '🔒 Laws That Allow U.S. Data Seizure',
    dataSeizureLawCLOUD: 'CLOUD Act: U.S. law enforcement can compel U.S. providers to hand over data stored anywhere.',
    dataSeizureLawFISA: 'FISA §702: Enables warrantless surveillance on non-U.S. persons outside the U.S.',
    dataSeizureLawPatriot: 'Patriot Act: Allows secret court orders for certain surveillance operations.',

    dataSeizureMitigationTitle: '🛡️ Can You Prevent or Resist This?',
    dataSeizureMitigationEncryption: 'Use strong encryption (with user-held keys) to make seized data unreadable.',
    dataSeizureMitigationForeignHost: 'Host outside the U.S. only if the provider has no U.S. legal presence.',
    dataSeizureMitigationMinimalData: 'Store only what you absolutely need — no data, no seizure.',
    dataSeizureMitigationLocalTools: 'Prefer local-first and open-source tools to avoid cloud exposure.',

    dataSeizureGDPRTitle: 'GDPR and Schrems II',
    dataSeizureGDPRDesc:
      'Legal safeguards like SCCs and the DPF help with GDPR compliance but do not stop U.S. surveillance.',
    dataSeizureTLDR: 'If it’s hosted in the U.S., assume it can be accessed. Encrypt or limit what you store.',
    transparencySafeTitle: '🔍 Is This Website Safe?',
    transparencySafeIntro1: 'Someone used a tool called',
    transparencySafeIntro2:
      'to check if our website is dangerous. That tool guessed that our site *might* be “suspicious” — like a scam or a trick. But that’s just a guess, not proof.',
    transparencySafeIntro3: 'So, we double-checked using a much bigger tool called',
    transparencySafeIntro4:
      '. It uses 90+ security companies to test websites — like a giant team of digital watchdogs. All of them agreed: our site is safe. No malware. No scams. No trickery.',

    transparencySafeWhyTitle: '🤔 Why Did FileScan Say That?',
    transparencySafeWhyDesc: 'FileScan didn’t find anything bad — it just got confused. It flagged our site because:',
    transparencySafeWhyBullet1: 'Our site uses a lot of code (which is normal for modern websites)',
    transparencySafeWhyBullet2: 'We have buttons that ask you to take action (like “Submit a report”)',
    transparencySafeWhyBullet3: 'We use standard web tags that help your browser load pages properly',
    transparencySafeWhyBullet4: 'We link to social media (like Facebook or TikTok)',
    transparencySafeWhyOutro:
      "These are all totally normal things for websites that help people share or take action. But FileScan's robot might not know that.",

    transparencySafeProtectTitle: '🔒 How We Keep You Safe',
    transparencySafeProtectIntro: 'Here’s what we do to protect your privacy and safety:',
    transparencySafeProtectBullet1: 'You don’t have to make an account to use our site',
    transparencySafeProtectBullet2: 'We don’t show ads or track you',
    transparencySafeProtectBullet3:
      'We don’t collect names, phone numbers, or personal details — only what’s happening and where',
    transparencySafeProtectBullet4: 'We host our site with trusted, secure tools (like Vercel and Supabase)',
    transparencySafeProtectBullet5: 'We build this project openly, so others can see how it works',

    transparencySafeLessonTitle: '📚 A Quick Lesson',
    transparencySafeLesson1:
      'Just like a smoke detector can go off from burnt toast, some website scanners give “false alarms.” That’s why it’s important to double-check using more than one tool.',
    transparencySafeLesson2:
      'Not every red flag means danger — sometimes, it just means “let’s look closer.” And that’s what we did.',
    transparencySafeOutro: 'If you still have questions or want to learn more, feel free to',
    contactUs: 'contact us',

    // Github Card
    githubCardTitle: 'Source Code on GitHub',
    githubCardText: 'Want to verify everything for yourself? Browse the source, open an issue, or contribute.',
    githubCardLink: 'View on GitHub',
    transparencyOfficerNote:
      'We collect officer movement, direction, and emergency signal use to help contextualize agency behavior and build better patterns for community safety. These are optional, and no identifying info about users is stored.',
    // Join Dispatch
    joinDispatch: 'Join Dispatch',
    joinDispatchTitle: 'Join the ART Dispatch Network',
    joinDispatchIntro:
      'We’re looking for committed community members to serve as dispatchers or respond in the field when law enforcement or ICE presence is reported.',
    joinDispatchNote: 'This work saves lives. It requires discretion, coordination, and courage.',
    joinDispatchContactButton: 'Start at dispatch.peoplesrebellion.org',

    joinDispatchRolesTitle: 'Roles We’re Seeking',
    'joinDispatchRole.dispatcher': 'Dispatcher (remote, verified)',
    'joinDispatchRole.deescalation': 'De-escalation Lead',
    'joinDispatchRole.court': 'Court Support',
    'joinDispatchRole.legal': 'Legal Observer',
    'joinDispatchRole.mentalHealth': 'Mental Health Support',
    'joinDispatchRole.medic': 'Medic / First Aid',
    'joinDispatchRole.checkpoint': 'Checkpoint Monitor',
    'joinDispatchRole.child': 'Child Specialist',
    'joinDispatchRole.translator': 'Language Translator',
    'joinDispatchRole.tech': 'Tech / Signal Jammer',

    joinDispatchFooter:
      'All roles are volunteer-based. Some involve remote coordination, while others are in-person response. We provide training, peer support, and escalation protocols to keep each other safe.',
    joinDispatchLanguageNote:
      '⚠️ Dispatch coordination is currently conducted in English. Spanish-speaking volunteers are welcome, but basic English proficiency is required.',
  },
  es: {
    goToAcademy: 'Ir a la Academia',
    goToDispatch: 'Ir al Despacho',
    mapControlsTitle: 'Controles del Mapa',
    mapControlsOpen: 'Abrir controles del mapa con el teclado',
    mapControlsClose: 'Cerrar controles del mapa',
    mapControlsZoomIn: 'Acercar',
    mapControlsZoomOut: 'Alejar',
    mapControlsUS: 'Vista del campo (Zoom 3)',
    mapControlsRegion: 'Vista regional (Zoom 7)',
    mapControlsCity: 'Vista de ciudad (Zoom 10)',
    mapControlsNeighborhood: 'Calle (Zoom 13)',
    mapControlsStreet: 'Nivel de calle (Zoom 16)',
    mapControlsReset: 'Restablecer zoom',
    test: 'Prueba',
    testReport: 'Reporte de prueba',
    testReportDescription:
      'Activa esto para probar el envío de reportes. El reporte será visible durante 5 minutos y luego se eliminará automáticamente.',
    Donations: 'Donaciones',
    'Report ICE Presence': 'Reportar Presencia de ICE',
    'Legal Aid & Attorneys': 'Asistencia Legal y Abogados',
    'Preparation & Planning': 'Preparación y Planificación',
    'Foster Care & Guardianship': 'Cuidado Temporal y Tutela',
    'Legal Documents': 'Documentos Legales',
    'Notary Services': 'Servicios de Notaría',
    'LGBTQ+ Resources': 'Recursos LGBTQ+',
    'Self Care': 'Cuidado Personal',
    'Translation & Interpretation': 'Traducción e Interpretación',
    'Rapid Response Networks': 'Redes de Respuesta Rápida',
    'Organizations/Coalitions': 'Organizaciones/Coaliciones',
    Volunteering: 'Voluntariado',
    // Homepage
    immigrantResourcesTitle: 'Recursos de Acción para Inmigrantes por Estado y Categoría',
    noResourcesYet: 'Aún no hay recursos',
    locationNoticePrefix:
      'Para cargar el mapa y ayudarte a colocar el marcador, este paso necesita acceso temporal a tu ubicación. Cuando tu dispositivo lo pida, te recomendamos seleccionar “Permitir solo esta vez”. Tu ubicación se usa únicamente para centrar el mapa — nunca se almacena, recopila ni comparte. Más información en nuestra',
    transparencyPage: 'página de transparencia',
    locationNoticeSuffix: '.',

    homeTitle: 'Vigilancia ART',
    privacyTagline: 'Reportes comunitarios seguros y privados sobre ICE y presencia policial.',
    startReport: 'Iniciar reporte',
    viewHeatmap: 'Ver mapa de calor',
    supportProject: 'Apoya el proyecto (ko-fi)',
    requestLanguageSupport: 'Solicitar soporte de idioma',
    troubleWithApp:
      'Si tienes algún problema con la app, envíanos un correo y cuéntanos qué pasa. ¡Así podremos solucionarlo!',

    yes: 'Sí',
    no: 'No',
    noneSelected: 'Ninguno seleccionado',
    notSet: 'No establecido',

    // Court Appearance
    dismissalTitle: '⚠️ El cierre del caso en la corte no significa que estés a salvo',
    dismissalIntroStart: 'Si el caso de alguien es',
    dismissalIntroHighlight1: 'cerrado en la corte de inmigración',
    dismissalIntroMid: ', significa que el juez está cerrando el caso — pero eso no',
    dismissalIntroHighlight2: 'significa que esa persona esté protegida contra la deportación',
    dismissalPoint1: 'ICE todavía puede detener y deportar a alguien mediante la deportación expedita.',
    dismissalPoint2:
      'Los cierres de caso a menudo ocurren por razones técnicas o políticas — no porque la persona tenga un estatus legal seguro.',
    dismissalPoint3:
      'Si alguien no tiene estatus migratorio legal, aún puede estar en riesgo incluso después del cierre del caso.',
    dismissalProtection:
      'La única forma de estar completamente protegide es obtener estatus legal (asilo, residencia, etc.). Aun así, es importante estar al tanto de los cambios en las leyes y las tácticas de ICE.',
    dismissalSupport:
      'El apoyo comunitario, la respuesta rápida y los reportes precisos pueden proteger a nuestra gente.',
    dismissalFlowchartAlt: 'Diagrama que muestra que el cierre de un caso no evita la deportación',

    // Heatmap
    reportTitle: 'Mapa de Reportes Comunitarios',
    'agency.ICE': 'ICE',
    'agency.Police': 'Policía',
    'agency.State Police': 'Policía Estatal',
    'agency.Sheriff': 'Alguacil',
    'agency.Border Patrol': 'Patrulla Fronteriza',
    'agency.Immigration Court': 'Tribunal de Inmigración',
    'agency.Detention Facility': 'Centro de Detención',
    'agency.Unmarked': 'Sin identificar',
    'agency.Military': 'Militar',
    // Spanish
    officerDirection: 'Dirección de viaje',
    lightsOn: 'Luces encendidas',
    lightsOff: 'Luces apagadas',
    sirensOn: 'Sirenas encendidas',
    sirensOff: 'Sirenas apagadas',
    movementUnknown: 'Movimiento no reportado',
    officerDirectionUnknown: 'Dirección no reportada',
    verifiedByDispatch: 'Verificado por Despacho',
    filterAgencies: 'Filtrar Agencias',
    resetFilters: 'Restablecer filtros',

    // Heatlayer
    visibleReports: 'Reportes visibles',
    noReports: 'No hay reportes en la vista actual.',
    agencies: 'Agencias:',
    reported: 'Reportado:',
    timeAgo: ' hace',
    findMe: '¿Dónde estoy?',
    locationDenied: 'El acceso a la ubicación fue denegado o no está disponible.',
    anonymous: 'Anónimo',

    // Wizard
    reportWizard: 'Asistente de Reporte',
    whoDidYouSee: '¿A quién viste?',
    tapAllThatApply: 'Toca todas las que correspondan.',
    other: 'Otro:',
    placeholderAgencyExample: 'p. ej., Alguaciles Federales, Contratista Privado',
    tapMapOrGPS: 'Toca el mapa o permite el GPS.',
    submit: 'Enviar',
    zoomOutForSafety: 'Por seguridad, aleja el mapa si esta ubicación es demasiado específica.',
    haveMedia: '¿Tienes foto o video?',
    mediaFundingNotice: 'Cuando recibamos financiación comunitaria, podremos añadir envíos de fotos y videos.',
    whyUpload: '¿Por qué subir?',
    mediaPrivacyNote:
      'Los archivos nunca se muestran públicamente. Solo socios comunitarios verificados pueden revisar los reportes. Los datos EXIF se eliminan.',
    optionalNote: 'Opcional, pero mejora la credibilidad.',
    officerMovement: 'Movimiento del oficial',
    moving: 'En movimiento',
    stationary: 'Estacionado',
    directionOfTravel: 'Dirección del viaje',
    'direction.North': 'Norte',
    'direction.NorthEast': 'Noreste',
    'direction.East': 'Este',
    'direction.SouthEast': 'Sureste',
    'direction.South': 'Sur',
    'direction.SouthWest': 'Suroeste',
    'direction.West': 'Oeste',
    'direction.NorthWest': 'Noroeste',
    emergencyIndicators: 'Indicadores de emergencia',
    lights: 'Luces',
    sirens: 'Sirenas',

    // FormPreview
    liveReportPreview: 'Vista previa del reporte en vivo',
    otherAgency: 'Otra agencia:',
    location: 'Ubicación:',
    media: 'Archivo:',
    noFileUploaded: 'No se subió ningún archivo',

    locationPrompt: '¿Dónde ocurrió?',
    uploadMedia: 'Subir archivo',
    gpsError: 'No se detectó GPS. Ingresa una dirección manual.',

    // General
    home: 'Inicio',
    next: 'Continuar',
    back: 'Atrás',
    quickExit: 'Salida rápida',
    finish: 'Finalizar',
    warning: '⚠️ No geolocalices a individuos. Este mapa es solo para conciencia comunitaria.',
    copyToClipboard: 'Copiar al portapapeles',
    copiedToClipboard: '¡Copiado al portapapeles!',

    // Know your rights
    kyrTitle: 'Conozca sus derechos',
    kyrIntro:
      'Todas las personas en los Estados Unidos tienen derechos, sin importar su estatus migratorio. Esta información puede ayudarle a protegerse y proteger a su familia.',

    kyrSection1Title: '1. Cree un plan de seguridad',
    kyrSection1Bullet1: 'Identifique sus contactos de emergencia y memorice sus números.',
    kyrSection1Bullet2: 'Proporcione a la escuela o guardería de su hijo/a un contacto de emergencia para recogerlo/a.',
    kyrSection1Bullet3:
      'Autorice por escrito a su contacto de emergencia para tomar decisiones médicas y legales por su hijo/a.',
    kyrSection1Bullet4:
      'Diga a sus seres queridos que, si lo detiene ICE, pueden intentar encontrarlo usando este localizador: https://locator.ice.gov/odls/#/search',
    kyrSection1Bullet5: 'Lea más sobre tutela legal para inmigrantes en Illinois e Indiana (PDF).',

    kyrSection2Title: '2. Defienda sus derechos',
    kyrSection2Intro:
      'Todas las personas en EE. UU. tienen protecciones constitucionales, incluido el derecho a guardar silencio. Durante cualquier interacción con autoridades:',
    kyrSection2Bullet1:
      'Mantenga la calma. No corra, discuta ni pelee. Mantenga sus manos visibles y anuncie cualquier movimiento.',
    kyrSection2Bullet2: 'No mienta sobre su estatus migratorio ni entregue documentos falsos.',
    kyrSection2Bullet3:
      'En un control de tránsito, pregunte si el oficial es de ICE o CBP. A veces se hacen pasar por "policía".',
    kyrSection2Bullet4: 'Si tiene estatus legal: Lleve siempre prueba de su estatus si es mayor de 18 años.',
    kyrSection2Bullet5:
      'Si no tiene papeles: Puede guardar silencio. No está obligado a responder preguntas sobre su estatus.',
    kyrSection2Bullet6: 'Si tocan su puerta: No la abra. ICE necesita una orden firmada por un juez para entrar.',
    kyrSection2Bullet7: 'Si está afuera y ve a ICE: Muévase a un lugar seguro bajo techo.',
    kyrSection2Bullet8: 'Si es ciudadano y se siente seguro: Grabe o anote lo que observe sin interferir.',
    kyrSection2Bullet9: 'No publique información no verificada ni se arriesgue innecesariamente.',

    kyrSection2Note1: 'Las "órdenes" de ICE no están firmadas por jueces y no permiten entrar a su casa.',
    kyrSection2Note2:
      'Enseñe a sus hijos a no abrir la puerta. Los agentes no pueden entrar sin su consentimiento o una orden judicial válida.',

    // Request Language Support
    languageSupportInvite:
      'Si tu idioma aún no está disponible, ¡puedes ayudar a traducir! Usa la plantilla a continuación y envíala por correo a:',
    translationTemplate: 'Plantilla de traducción',
    existingTranslations: 'Traducciones existentes',
    includesReference: 'Esto incluye inglés y español como referencia.',
    // Questions
    arrestFormTitle: 'Formulario de Detención por ICE',
    arrestSubTitle: 'Si Alguien es Arrestado por ICE',
    arrestDesc: 'Haz estas preguntas para obtener la información más importante rápidamente.',
    locationLabel: '¿Dónde estás ahora?',
    timeLabel: '¿Cuándo te detuvieron?',
    nameLabel: 'Nombre completo',
    dobLabel: 'Fecha de nacimiento',
    anumberLabel: 'Número A (si lo sabes)',
    agencyLabel: '¿Quién te arrestó? (ICE, policía, etc.)',
    warrantLabel: '¿Mostraron una orden judicial? ¿Firmada por un juez?',
    entryLabel: '¿Entraron a tu casa o te detuvieron en público?',
    contactLabel: '¿A quién debemos contactar por ti?',
    kidsLabel: '¿Tienes hijos o dependientes que necesiten cuidado?',
    healthLabel: '¿Condiciones médicas, medicamentos o discapacidades?',
    identityLabel: '¿Estás en riesgo especial en detención?',
    courtHistoryLabel: '¿Has tenido una cita en corte o una orden de deportación antes?',
    nextStepsLabel: '¿Te han dicho qué pasará ahora?',
    callsLabel: '¿Te permiten hacer llamadas?',
    lawyerLabel: '¿Tienes abogado? Si sí, ¿quién?',

    // Transparency
    transparencyTitle: 'Transparencia y Uso de Datos',
    transparencyWhyTitle: 'Por Qué Importa la Transparencia',
    transparencyWhyText:
      'ART Watch es una herramienta comunitaria construida para proteger, no para vigilar. Creemos en la transparencia radical — eso significa que mereces saber qué datos recogemos, por qué, y cómo se usan.',
    transparencyCollectTitle: 'Qué Recogemos',
    transparencyCollectList1: 'Tipo de agencia — a quién viste',
    transparencyCollectList2: 'Nombre opcional de "Otra" agencia',
    transparencyCollectList3: 'Ubicación aproximada (~1 km de margen)',
    transparencyCollectList4: 'Medios opcionales (foto/video)',
    transparencyCollectList5: 'Marca de tiempo',
    transparencyCollectList6: 'Whether the officer was moving or stationary',
    transparencyCollectList7: 'Direction the officer was traveling (if moving)',
    transparencyCollectList8: 'Whether emergency lights or sirens were activated',

    transparencyAnonNote: '🛡️ Los reportes son anónimos. No almacenamos tu nombre, teléfono ni IP.',
    transparencyTypesTitle: 'Cómo Definimos un Reporte (En Código)',
    transparencyRecentReports: 'Explorar Reportes Recientes',
    transparencyInspectTitle: 'Verifica Tú Mismo',
    transparencyInspectDesktop:
      'En computadora, haz clic derecho → Inspeccionar → pestaña Red → busca un POST a /api/report. Ahí puedes ver exactamente lo que se envía.',
    transparencyInspectMobile: '¿Quieres verificar desde el móvil? Prueba usando HTTP Toolkit.',
    transparencyQueuedExplain: 'Esto guarda tu información en tu dispositivo hasta que estés listo/a para enviarla.',
    transparencyFormDataExplain:
      'Esto es lo que tu dispositivo genera cuando llenas el formulario. No incluye información personal.',
    transparencyReportExplain:
      'Este es el formato final guardado de forma segura en nuestra base de datos en Supabase.',
    dataSeizureTitle: 'Acceso del Gobierno de EE.UU. a tus datos',
    dataSeizureLawsTitle: '🔒 Leyes que permiten la incautación de datos en EE.UU.',
    dataSeizureLawCLOUD:
      'Ley CLOUD: Las autoridades pueden exigir datos a proveedores de EE.UU., aunque estén almacenados en el extranjero.',
    dataSeizureLawFISA: 'FISA §702: Permite vigilancia sin orden judicial a personas fuera de EE.UU.',
    dataSeizureLawPatriot: 'Ley Patriota: Permite órdenes judiciales secretas para ciertos tipos de vigilancia.',

    dataSeizureMitigationTitle: '🛡️ ¿Se puede prevenir o resistir esto?',
    dataSeizureMitigationEncryption:
      'Usa cifrado fuerte (con claves del usuario) para que los datos incautados no sean legibles.',
    dataSeizureMitigationForeignHost:
      'Alojar fuera de EE.UU. solo ayuda si el proveedor no tiene presencia legal en EE.UU.',
    dataSeizureMitigationMinimalData: 'Guarda solo lo esencial — si no hay datos, no hay nada que incautar.',
    dataSeizureMitigationLocalTools: 'Prefiere herramientas locales y de código abierto para evitar la nube.',

    dataSeizureGDPRTitle: 'GDPR y Schrems II',
    dataSeizureGDPRDesc:
      'Las garantías legales como SCC y DPF ayudan con el cumplimiento del RGPD, pero no detienen la vigilancia de EE.UU.',
    dataSeizureTLDR: 'Si está alojado en EE.UU., asume que puede ser accedido. Cifra o minimiza lo que almacenas.',
    transparencySafeTitle: '🔍 ¿Este sitio web es seguro?',
    transparencySafeIntro1: 'Alguien usó una herramienta llamada',
    transparencySafeIntro2:
      'para verificar si nuestro sitio era peligroso. Esa herramienta supuso que nuestro sitio *podría* ser “sospechoso”, como una estafa. Pero eso es solo una suposición, no una prueba.',
    transparencySafeIntro3: 'Así que revisamos nuevamente con una herramienta mucho más grande llamada',
    transparencySafeIntro4:
      '. Usa más de 90 compañías de seguridad para analizar sitios web — como un gran equipo de guardianes digitales. Todas coincidieron: nuestro sitio es seguro. Sin malware. Sin estafas. Sin engaños.',

    transparencySafeWhyTitle: '🤔 ¿Por qué FileScan dijo eso?',
    transparencySafeWhyDesc: 'FileScan no encontró nada malo — solo se confundió. Marcó nuestro sitio porque:',
    transparencySafeWhyBullet1: 'Usamos mucho código (lo cual es normal en sitios modernos)',
    transparencySafeWhyBullet2: 'Tenemos botones que invitan a tomar acción (como “Enviar un reporte”)',
    transparencySafeWhyBullet3: 'Usamos etiquetas web estándar para que tu navegador cargue bien las páginas',
    transparencySafeWhyBullet4: 'Enlazamos a redes sociales (como Facebook o TikTok)',
    transparencySafeWhyOutro:
      'Todo esto es completamente normal en sitios que ayudan a compartir o tomar acción. Pero el robot de FileScan tal vez no lo sepa.',

    transparencySafeProtectTitle: '🔒 Cómo te protegemos',
    transparencySafeProtectIntro: 'Esto es lo que hacemos para cuidar tu privacidad y seguridad:',
    transparencySafeProtectBullet1: 'No necesitas crear una cuenta para usar nuestro sitio',
    transparencySafeProtectBullet2: 'No mostramos anuncios ni te rastreamos',
    transparencySafeProtectBullet3: 'No recopilamos nombres, teléfonos ni datos personales — solo lo que pasó y dónde',
    transparencySafeProtectBullet4: 'Alojamos el sitio con herramientas seguras y confiables (como Vercel y Supabase)',
    transparencySafeProtectBullet5:
      'Construimos este proyecto de forma abierta, para que cualquiera pueda ver cómo funciona',

    transparencySafeLessonTitle: '📚 Una lección rápida',
    transparencySafeLesson1:
      'Igual que una alarma de humo puede sonar por una tostada quemada, algunas herramientas dan “falsas alarmas”. Por eso es importante revisar con más de una.',
    transparencySafeLesson2:
      'No toda bandera roja significa peligro — a veces solo quiere decir “miremos más de cerca”. Y eso fue lo que hicimos.',
    transparencySafeOutro: 'Si aún tienes preguntas o quieres saber más, puedes',
    contactUs: 'contactarnos',

    // Github Card
    githubCardTitle: 'Código fuente en GitHub',
    githubCardText: '¿Quieres verificar todo por ti mismo/a? Explora el código, abre un problema o contribuye.',
    githubCardLink: 'Ver en GitHub',
    transparencyOfficerNote:
      'Recolectamos información sobre el movimiento del oficial, dirección y uso de señales de emergencia para contextualizar el comportamiento de las agencias y mejorar la seguridad comunitaria. Estos datos son opcionales y no se almacena información identificable del usuario.',
    // Join Dispatch
    joinDispatch: 'Únete al Despacho',

    joinDispatchTitle: 'Únete a la Red de Despacho ART',
    joinDispatchIntro:
      'Buscamos personas comprometidas con la comunidad para actuar como despachadoras o responder en el terreno cuando se reporta presencia policial o de ICE.',
    joinDispatchNote: 'Este trabajo salva vidas. Requiere discreción, coordinación y valentía.',
    joinDispatchContactButton: 'Comienza en dispatch.peoplesrebellion.org',

    joinDispatchRolesTitle: 'Roles que estamos buscando',
    'joinDispatchRole.dispatcher': 'Despachador/a (remoto, verificado)',
    'joinDispatchRole.deescalation': 'Líder de Desescalamiento',
    'joinDispatchRole.court': 'Apoyo en la Corte',
    'joinDispatchRole.legal': 'Observador/a Legal',
    'joinDispatchRole.mentalHealth': 'Apoyo en Salud Mental',
    'joinDispatchRole.medic': 'Médico/a / Primeros Auxilios',
    'joinDispatchRole.checkpoint': 'Monitor de Retenes',
    'joinDispatchRole.child': 'Especialista en Infancia',
    'joinDispatchRole.translator': 'Traductor/a de Idiomas',
    'joinDispatchRole.tech': 'Tecnología / Inhibidor de Señales',

    joinDispatchFooter:
      'Todos los roles son voluntarios. Algunos implican coordinación remota, mientras que otros requieren respuesta presencial. Ofrecemos entrenamiento, apoyo entre pares y protocolos de escalamiento para cuidarnos entre todos.',
    joinDispatchLanguageNote:
      '⚠️ La coordinación del despacho actualmente se realiza en inglés. Personas voluntarias que hablen español son bienvenidas, pero se requiere comprensión básica de inglés.',
  },
  // Add more languages as needed
};

export type SupportedLang = keyof typeof TRANSLATIONS;
