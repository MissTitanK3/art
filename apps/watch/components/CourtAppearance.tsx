'use client';

import { useTranslations } from '@/lib/il8n/useTranslations';
import Link from 'next/link';

export default function CourtAppearance() {
  const { t } = useTranslations();

  return (
    <div className="bg-yellow-200 border-l-4 border-yellow-500 text-black p-8 rounded-xl shadow-sm my-6">
      <h2 className="text-xl font-bold mb-2">{t('dismissalTitle')}</h2>
      <div className="my-5">
        <Link
          className="px-6 py-2 border rounded-xl"
          href={'https://www.tiktok.com/@victorywar01/video/7509510403471248671?is_from_webapp=1&sender_device=pc'}>
          TikTok @victorywar01
        </Link>
      </div>
      <p className="mb-2">
        {t('dismissalIntroStart')} <strong>{t('dismissalIntroHighlight1')}</strong> {t('dismissalIntroMid')}{' '}
        <strong>{t('dismissalIntroHighlight2')}</strong>.
      </p>
      <ul className="list-disc list-inside mb-2 space-y-1">
        <li>{t('dismissalPoint1')}</li>
        <li>{t('dismissalPoint2')}</li>
        <li>{t('dismissalPoint3')}</li>
      </ul>
      <p className="mb-2">{t('dismissalProtection')}</p>
      <p className="text-sm text-yellow-700 italic">{t('dismissalSupport')}</p>
    </div>
  );
}
