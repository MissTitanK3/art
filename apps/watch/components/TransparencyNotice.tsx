'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';

export default function TransparencyNotice() {
  const { t } = useTranslations();

  const bulletKeys: TranslationKey[] = [
    'transparencySafeWhyBullet1',
    'transparencySafeWhyBullet2',
    'transparencySafeWhyBullet3',
    'transparencySafeWhyBullet4',
  ];

  const protectBulletKeys: TranslationKey[] = [
    'transparencySafeProtectBullet1',
    'transparencySafeProtectBullet2',
    'transparencySafeProtectBullet3',
    'transparencySafeProtectBullet4',
    'transparencySafeProtectBullet5',
  ];

  return (
    <div className="prose prose-invert max-w-3xl mx-auto my-12 p-4 border border-muted rounded-xl bg-background">
      <h1 className="text-2xl font-bold">{t('transparencySafeTitle')}</h1>

      <p>
        {t('transparencySafeIntro1')}{' '}
        <Link
          href="https://www.filescan.io/uploads/6866c9377423ff017c3f09b8/reports/39e09b3e-dfc3-40bb-b655-5bc57b6e4118/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline inline-flex items-center gap-1">
          FileScan.io <ExternalLink size={16} />
        </Link>{' '}
        {t('transparencySafeIntro2')}
      </p>

      <p>
        {t('transparencySafeIntro3')}{' '}
        <Link
          href="https://www.virustotal.com/gui/url/feb45e0b415f667e8875bd73e103de3bb57a26460e378e7d929d4a6380425530"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline inline-flex items-center gap-1">
          VirusTotal <ExternalLink size={16} />
        </Link>{' '}
        {t('transparencySafeIntro4')}
      </p>

      <h2 className="text-xl font-semibold mt-8">{t('transparencySafeWhyTitle')}</h2>
      <p className="mt-2">{t('transparencySafeWhyDesc')}</p>

      <ul className="mt-4 space-y-3 list-none">
        <ul className="mt-4 space-y-3 list-none">
          {bulletKeys.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-1 text-yellow-300">⚠️</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </ul>

      <p>{t('transparencySafeWhyOutro')}</p>

      <h2 className="text-xl font-semibold mt-8">{t('transparencySafeProtectTitle')}</h2>
      <p>{t('transparencySafeProtectIntro')}</p>

      <ul className="mt-4 space-y-3 list-none">
        {protectBulletKeys.map((key) => (
          <li key={key} className="flex items-start gap-3">
            <span className="mt-1 text-green-400">✔️</span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8">{t('transparencySafeLessonTitle')}</h2>
      <p>{t('transparencySafeLesson1')}</p>
      <p>{t('transparencySafeLesson2')}</p>

      <p className="mt-6">
        {t('transparencySafeOutro')}{' '}
        <Link href="/contact" className="underline text-blue-400">
          {t('contactUs')}
        </Link>
        .
      </p>
    </div>
  );
}
