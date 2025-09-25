'use client';

import { FaGithub } from 'react-icons/fa';
import { useTranslations } from '@/lib/il8n/useTranslations';

export default function GitHubCard() {
  const { t } = useTranslations();

  return (
    <div className="my-8 p-4 border border-gray-200 rounded-2xl shadow-md bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-4">
        <FaGithub className="text-2xl" />
        <div>
          <h3 className="text-lg font-semibold">{t('githubCardTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('githubCardText')}</p>
          <a
            href="https://github.com/MissTitanK3/icetea-watch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-black text-white rounded hover:bg-gray-800">
            {t('githubCardLink')}
          </a>
        </div>
      </div>
    </div>
  );
}
