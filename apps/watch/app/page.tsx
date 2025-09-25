'use client';
import AddToHomescreenTutorial from '@/components/AddToHomescreenTutorial';
import CopyEmail from '@/components/CopyEmail';
import CourtAppearance from '@/components/CourtAppearance';
import KnowYourRights from '@/components/KnowYourRights';
import LanguageSwitcher from '@/components/language-toggle/LToggle';
import ICEArrestQuestions from '@/components/Questions';
import LinkButton from '@/components/ui/FrostedLink';
import { useTranslations } from '@/lib/il8n/useTranslations';
import Image from 'next/image';
// import Link from 'next/link';

export default function Home() {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full m-auto flex flex-col justify-center text-center items-center">
        <Image src="/logo.svg" alt="ICE Tea Watch Logo" width={400} height={40} className="mb-10" />
        <h1 className="text-4xl font-bold">{t('homeTitle')}</h1>
        <p className="text-lg">{t('privacyTagline')}</p>
      </div>
      <LanguageSwitcher />
      <div className="flex justify-center gap-4 mt-8 flex-col">
        <LinkButton label={t('supportProject')} variant="primary" target="_blank" />
        <LinkButton label={t('requestLanguageSupport')} variant="primary" href="/req-language-support" />
        <LinkButton label={t('transparencyTitle')} variant="primary" href="/transparency" />
        <LinkButton label={t('joinDispatch')} variant="primary" href="/join-dispatch" />
        <LinkButton label={t('immigrantResourcesTitle')} variant="primary" href="/resources" />
        <LinkButton
          label={t('goToAcademy')}
          variant="primary"
          target="_blank"
          href="https://academy.peoplesrebellion.org"
        />
        <LinkButton
          label={t('goToDispatch')}
          variant="primary"
          target="_blank"
          href="https://dispatch.peoplesrebellion.org"
        />

        <div className="flex flex-col text-center py-20 justify-center m-auto">
          <h4>{t('troubleWithApp')}</h4>
          <div className="flex flex-col text-center py-5 justify-center m-auto">
            <CopyEmail />
          </div>
          <AddToHomescreenTutorial />
          <CourtAppearance />
          <ICEArrestQuestions />
        </div>
      </div>
      <KnowYourRights />
    </div>
  );
}
