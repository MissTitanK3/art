'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { roleKeys } from '@/lib/il8n/translations';

export default function JoinDispatchPage() {
  const { t } = useTranslations();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('joinDispatchTitle')}</h1>
        <p className="text-lg text-gray-300">{t('joinDispatchIntro')}</p>
        <p className="text-md text-gray-400">{t('joinDispatchNote')}</p>
        <Link
          href="https://dispatch.peoplesrebellion.org/"
          target="_blank"
          className="inline-block mt-4 px-6 py-3 bg-blue-700 text-white font-bold rounded hover:bg-blue-800 transition">
          🔗 {t('joinDispatchContactButton')}
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🚨 {t('joinDispatchRolesTitle')}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleKeys.map((key) => (
            <li
              key={key}
              className="bg-gray-800 rounded-lg px-4 py-3 shadow border border-gray-700 text-white text-sm sm:text-base">
              {t(key)}
            </li>
          ))}
        </ul>
      </section>

      <section className="text-sm text-gray-400 border-t pt-4">
        <p>{t('joinDispatchFooter')}</p>
        <p className="text-sm text-yellow-400">{t('joinDispatchLanguageNote')}</p>
      </section>
    </main>
  );
}
