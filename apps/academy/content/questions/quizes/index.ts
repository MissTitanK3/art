import { abolitionEthicsQuestions } from '../abolitionEthicsQuestions';
import { academyOverviewQuestions } from '../academyOverviewQuestions';
import { adminToolsQuestions } from '../adminToolsQuestions';
import { aslInterpreterMicroBadgeQuestions } from '../aslInterpreterMicroBadgeQuestions';
import { burnerPhonesSecurityCultureQuestions } from '../burnerPhonesSecurityCultureQuestions';
import { bystanderSupportQuestions } from '../bystanderSupportQuestions';
import { careSupportQuestions } from '../careSupportQuestions';
import { checkpointMonitoringQuestions } from '../checkpointMonitoringQuestions';
import { childSpecialistQuestions } from '../childSpecialistQuestions';
import { communityConsentQuestions } from '../communityConsentQuestions';
import { communityDefenseCenterQuestions } from '../communityDefenseCenterQuestions';
import { courtSupportQuestions } from '../courtSupportQuestions';
import { createAPodQuestions } from '../createAPodQuestions';
import { dealingWithChaosQuestions } from '../dealingWithChaosQuestions';
import { decolonizationLandContextQuestions } from '../decolonizationLandContextQuestions';
import { deescalationBasicsQuestions } from '../deescalationBasicsQuestions';
import { digitalResilienceCommsQuestions } from '../digitalResilienceCommsQuestions';
import { digitalSecurityBasicsQuestions } from '../digitalSecurityBasicsQuestions';
import { dispatchCoordinationQuestions } from '../dispatchCoordinationQuestions';
import { documentationSafetyQuestions } from '../documentationSafetyQuestions';
import { encryption101Questions } from '../encryption101Questions';
import { escalationEvacuationQuestions } from '../escalationEvacuationQuestions';
import { ethicalDilemmasMutualAidQuestions } from '../ethicalDilemmasMutualAidQuestions';
import { fieldSafetyQuestions } from '../fieldSafetyQuestions';
import { fourthAmendmentRightsQuestions } from '../fourthAmendmentRightsQuestions';
import { heatmapVerificationQuestions } from '../heatmapVerificationQuestions';
import { howToReportQuestions } from '../howToReportQuestions';
import { iceTeaWatchQuestions } from '../iceTeaWatchQuestions';
import { interPodRegionalCoordinationQuestions } from '../interPodRegionalCoordinationQuestions';
import { introToIceTeaQuestions } from '../introToIceTeaQuestions';
import { knowYourRightsBasicsQuestions } from '../knowYourRightsBasicsQuestions';
import { lawEnforcementInteractionQuestions } from '../lawEnforcementInteractionQuestions';
import { legalFollowThroughJailSupportQuestions } from '../legalFollowThroughJailSupportQuestions';
import { legalObserverBasicsQuestions } from '../legalObserverBasicsQuestions';
import { logisticsResourceManagementQuestions } from '../logisticsResourceManagementQuestions';
import { mediaAwarenessVolunteersQuestions } from '../mediaAwarenessVolunteersQuestions';
import { mediaDisinformationHandlingQuestions } from '../mediaDisinformationHandlingQuestions';
import { medicalBasicsFieldSafetyQuestions } from '../medicalBasicsFieldSafetyQuestions';
import { mentalHealthResilienceQuestions } from '../mentalHealthResilienceQuestions';
import { mentoringNewDispatchersQuestions } from '../mentoringNewDispatchersQuestions';
import { meshNetworksHardwareQuestions } from '../meshNetworksHardwareQuestions';
import { meshNetworksIntroQuestions } from '../meshNetworksIntroQuestions';
import { meshNetworksLargeScaleQuestions } from '../meshNetworksLargeScaleQuestions';
import { meshNetworksPodOpsQuestions } from '../meshNetworksPodOpsQuestions';
import { movementStrategyEscalationLogicQuestions } from '../movementStrategyEscalationLogicQuestions';
import { mutualAidHistoryQuestions } from '../mutualAidHistoryQuestions';
import { mythOfTotalAnonymityQuestions } from '../mythOfTotalAnonymityQuestions';
import { outreachMessagingCommunityTrustQuestions } from '../outreachMessagingCommunityTrustQuestions';
import { radioCommsQuestions } from '../radioCommsQuestions';
import { reportReviewingQuestions } from '../reportReviewingQuestions';
import { respondingToDispatchCallsQuestions } from '../respondingToDispatchCallsQuestions';
import { riskAndResponsibilityQuestions } from '../riskAndResponsibilityQuestions';
import { runnersAndRidesQuestions } from '../runnersAndRidesQuestions';
import { signalTipsQuestions } from '../signalTipsQuestions';
import { solidarityEconomicsResourceEthicsQuestions } from '../solidarityEconomicsResourceEthicsQuestions';
import { spiritualMoralSupportQuestions } from '../spiritualMoralSupportQuestions';
import { stateCorporateSuppressionTacticsQuestions } from '../stateCorporateSuppressionTacticsQuestions';
import { survivorEscortMicroBadgeQuestions } from '../survivorEscortMicroBadgeQuestions';
import { techJammingQuestions } from '../techJammingQuestions';
import { trainingTheTrainersQuestions } from '../trainingTheTrainersQuestions';
import { translatorMicroBadgeQuestions } from '../translatorMicroBadgeQuestions';
import { trustAndEthicsInDispatchQuestions } from '../trust-and-ethics-in-dispatch';
import { vehicleSpecialistMicroBadgeQuestions } from '../vehicleSpecialistMicroBadgeQuestions';
import { whyWeDoThisQuestions } from '../whyWeDoThisQuestions';

export const QUIZ_MAP: Record<string, typeof academyOverviewQuestions> = {
  'academy-overview': academyOverviewQuestions,
  'abolition-ethics': abolitionEthicsQuestions,
  'bystander-support': bystanderSupportQuestions,
  'care-support': careSupportQuestions,
  'checkpoint-monitoring': checkpointMonitoringQuestions,
  'child-specialist': childSpecialistQuestions,
  'community-consent': communityConsentQuestions,
  'court-support': courtSupportQuestions,
  'deescalation-basics': deescalationBasicsQuestions,
  'dispatch-coordination': dispatchCoordinationQuestions,
  'documentation-safety': documentationSafetyQuestions,
  'encryption-101': encryption101Questions,
  'field-safety': fieldSafetyQuestions,
  'heatmap-verification': heatmapVerificationQuestions,
  'how-to-report': howToReportQuestions,
  'ice-tea-watch': iceTeaWatchQuestions,
  'interacting-with-law-enforcement': lawEnforcementInteractionQuestions,
  'kyr-basics': knowYourRightsBasicsQuestions,
  'legal-observer': legalObserverBasicsQuestions,
  'mutual-aid-history': mutualAidHistoryQuestions,
  'report-reviewing': reportReviewingQuestions,
  'risk-and-responsibility': riskAndResponsibilityQuestions,
  'runners-and-rides': runnersAndRidesQuestions,
  'tech-jamming': techJammingQuestions,
  'why-we-do-this': whyWeDoThisQuestions,
  'intro-to-ice-tea': introToIceTeaQuestions,
  'digital-security-basics': digitalSecurityBasicsQuestions,
  'responding-to-dispatch-calls': respondingToDispatchCallsQuestions,
  'trust-and-ethics-in-dispatch': trustAndEthicsInDispatchQuestions,
  'dealing-with-chaos': dealingWithChaosQuestions,
  'admin-tools': adminToolsQuestions,
  'mentoring-new-dispatchers': mentoringNewDispatchersQuestions,
  'radio-communications': radioCommsQuestions,
  'community-defense-center': communityDefenseCenterQuestions,
  'signal-tips': signalTipsQuestions,
  'asl-interpreter-micro-badge': aslInterpreterMicroBadgeQuestions,
  'create-a-pod': createAPodQuestions,
  'decolonization-land-context': decolonizationLandContextQuestions,
  'digital-resilience-contingency-comms': digitalResilienceCommsQuestions,
  'escalation-evacuation-protocols': escalationEvacuationQuestions,
  'ethical-dilemmas-mutual-aid': ethicalDilemmasMutualAidQuestions,
  'spiritual-moral-support-micro-badge': spiritualMoralSupportQuestions,
  'fourth-amendment-rights': fourthAmendmentRightsQuestions,
  'inter-pod-regional-coordination': interPodRegionalCoordinationQuestions,
  'legal-followthrough-jail-support': legalFollowThroughJailSupportQuestions,
  'logistics-resource-management': logisticsResourceManagementQuestions,
  'media-awareness-volunteers': mediaAwarenessVolunteersQuestions,
  'media-disinformation-handling': mediaDisinformationHandlingQuestions,
  'medical-basics-field-safety': medicalBasicsFieldSafetyQuestions,
  'mental-health-resilience': mentalHealthResilienceQuestions,
  'movement-strategy-escalation-logic': movementStrategyEscalationLogicQuestions,
  'solidarity-economics-resource-ethics': solidarityEconomicsResourceEthicsQuestions,
  'state-corporate-suppression-tactics': stateCorporateSuppressionTacticsQuestions,
  'survivor-escort-micro-badge': survivorEscortMicroBadgeQuestions,
  'training-the-trainers': trainingTheTrainersQuestions,
  'translator-micro-badge': translatorMicroBadgeQuestions,
  'vehicle-specialist-micro-badge': vehicleSpecialistMicroBadgeQuestions,
  'burner-phones-security-culture': burnerPhonesSecurityCultureQuestions,
  'myth-of-total-anonymity': mythOfTotalAnonymityQuestions,
  'mesh-networks-intro': meshNetworksIntroQuestions,
  'mesh-networks-pod-ops': meshNetworksPodOpsQuestions,
  'meshtastic-large-scale': meshNetworksLargeScaleQuestions,
  'mesh-networks-hardware-guide': meshNetworksHardwareQuestions,
  'outreach-messaging-community-trust': outreachMessagingCommunityTrustQuestions,
};

export type CourseSlug = keyof typeof QUIZ_MAP;
