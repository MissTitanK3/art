'use client';

import { TranslationKey } from '@/lib/il8n/translations';
import { useTranslations } from '@/lib/il8n/useTranslations';
import Image from 'next/image';
import FrostedLink from '@/components/ui/FrostedLink';

const KYR_GROUPS = {
  section1: [
    'kyrSection1Bullet1',
    'kyrSection1Bullet2',
    'kyrSection1Bullet3',
    'kyrSection1Bullet4',
    'kyrSection1Bullet5',
  ],
  section2: [
    'kyrSection2Bullet1',
    'kyrSection2Bullet2',
    'kyrSection2Bullet3',
    'kyrSection2Bullet4',
    'kyrSection2Bullet5',
    'kyrSection2Bullet6',
    'kyrSection2Bullet7',
    'kyrSection2Bullet8',
    'kyrSection2Bullet9',
  ],
  notes: ['kyrSection2Note1', 'kyrSection2Note2'],
};

export default function KnowYourRights() {
  const { t } = useTranslations();

  return (
    <section className="max-w-3xl mx-auto px-4 text-base leading-relaxe text-gray-300">
      <h1 className="text-3xl font-bold mb-4">{t('kyrTitle')}</h1>
      <p className="mb-6">{t('kyrIntro')}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-left">{t('kyrSection1Title')}</h2>
      <ul className="list-disc pl-12 space-y-2 text-left">
        {KYR_GROUPS.section1.map((key) => (
          <li key={key}>{t(key as TranslationKey)}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-left">{t('kyrSection2Title')}</h2>
      <p className="mb-4">{t('kyrSection2Intro')}</p>
      <ul className="list-disc pl-12 space-y-2 text-left">
        {KYR_GROUPS.section2.map((key) => (
          <li key={key}>{t(key as TranslationKey)}</li>
        ))}
      </ul>

      <div className="mt-6 border-t border-gray-300 pt-4 space-y-3 text-sm text-left">
        {KYR_GROUPS.notes.map((key) => (
          <p key={key} className="italic">
            ⚠️ {t(key as TranslationKey)}
          </p>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-300 pt-4 space-y-3 text-sm text-left mx-auto w-full flex flex-col justify-center items-center">
        <Image src="/ICE-admin-warrant-sample.jpg" height={500} width={375} alt="Ice Admin Warrant" />
        <Image src="/ICE-Detainer-Sample.jpg" height={500} width={375} alt="Ice Admin Warrant" />
        <Image src="/Judicial-warrant-sample2.jpg" height={500} width={375} alt="Ice Admin Warrant" />
      </div>
      <div
        className="mt-6 py-4 space-y-3 text-lg text-center mx-auto w-full flex flex-col justify-center items-center
  rounded-2xl backdrop-blur-md bg-red-600/30 border border-red-400 text-white shadow-md">
        <p className="text-base font-semibold">Source:</p>
        <FrostedLink
          label="https://immigrantjustice.org/know-your-rights/ice-encounter"
          href="https://immigrantjustice.org/know-your-rights/ice-encounter"
          target="_blank"
          variant="secondary"
        />
      </div>
    </section>
  );
}
