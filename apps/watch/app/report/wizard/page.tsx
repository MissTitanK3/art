'use client';

import AgencyStep from '@/components/wizard/AgencyStep';
import LocationStep from '@/components/wizard/LocationStep';
import MediaStep from '@/components/wizard/MediaStep';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';
import { useWizard } from '@/components/wizard/WizardContext';
import LinkButton from '@/components/ui/FrostedLink';
import TestReportToggle from '@/components/wizard/TestReportToggle';

function FormDataPreview() {
  const { t } = useTranslations();
  const { formData } = useWizard();

  return (
    <div className={`p-4 rounded border text-sm space-y-2`}>
      <h3 className="font-semibold text-base">{t('liveReportPreview')}</h3>
      <div>
        <strong>{t('agencies')}:</strong>{' '}
        {formData.agency_type.length > 0
          ? formData.agency_type.map((agency) => t(`agency.${agency}` as TranslationKey)).join(', ')
          : t('noneSelected')}
      </div>

      {formData.agency_other && (
        <div>
          <strong>{t('otherAgency')}:</strong> {formData.agency_other}
        </div>
      )}

      <div>
        <strong>{t('location')}</strong>{' '}
        {formData.location ? `${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}` : t('notSet')}
      </div>

      {formData.officer_moving !== undefined && (
        <div>
          <strong>{t('officerMovement')}:</strong>{' '}
          {formData.officer_moving === true
            ? t('moving')
            : formData.officer_moving === false
            ? t('stationary')
            : t('notSet')}
        </div>
      )}

      {formData.officer_direction !== undefined && (
        <div>
          <strong>{t('directionOfTravel')}:</strong> {t(`direction.${formData.officer_direction}` as TranslationKey)}
        </div>
      )}

      {formData.lights_on !== undefined && (
        <div>
          <strong>{t('lights')}:</strong> {formData.lights_on ? t('yes') : t('no')}
        </div>
      )}

      {formData.sirens_on !== undefined && (
        <div>
          <strong>{t('sirens')}:</strong> {formData.sirens_on ? t('yes') : t('no')}
        </div>
      )}

      <div>
        <strong>{t('media')}</strong> {formData.media_url ? formData.media_url.name : t('noFileUploaded')}
      </div>
    </div>
  );
}

export default function WizardPage() {
  const { t } = useTranslations();
  const { step } = useWizard();

  const renderStep = () => {
    switch (step) {
      case 0:
        return <LocationStep />;
      case 1:
        return <AgencyStep />;
      case 2:
        return <MediaStep />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-evenly items-center">
        <LinkButton size="2xl" variant="red" label={t('quickExit')} href="https://wikipedia.org" />
      </div>
      <TestReportToggle />

      {renderStep()}

      <div className="md:col-span-1">
        <div className="px-4 py-2 my-4 text-sm text-gray-800 bg-white/60 rounded shadow max-w-2xl mx-auto">
          <p>
            {t('locationNoticePrefix')}{' '}
            <a
              href="/transparency"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-800 hover:text-blue-900">
              {t('transparencyPage')}
            </a>
            {t('locationNoticeSuffix')}
          </p>
        </div>

        <FormDataPreview />
      </div>
    </div>
  );
}
