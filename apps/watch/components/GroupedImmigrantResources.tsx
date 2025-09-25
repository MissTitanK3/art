'use client';

import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { CollapsibleSection } from './CollapsibleSection';
import { Resource, resourceData } from '@/constants/GroupedResources';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';

const GroupedImmigrantResources: React.FC = () => {
  const [search, setSearch] = useState('');
  const { t } = useTranslations();

  const matchesSearch = (text: string) => text.toLowerCase().includes(search.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('immigrantResourcesTitle')}</h1>

      <SearchBar query={search} onChange={setSearch} />

      {Object.entries(resourceData).map(([state, categories]) => {
        const filteredCategories = Object.entries(categories).reduce((acc, [category, resources]) => {
          const filtered = resources.filter((r) => matchesSearch(r.title));
          acc[category] = filtered; // Always include the category, even if it's empty
          return acc;
        }, {} as Record<string, Resource[]>);

        const hasAnyMatch = Object.values(filteredCategories).some((r) => r.length > 0);
        if (!hasAnyMatch && search) return null;

        return (
          <CollapsibleSection key={state} title={state}>
            {Object.entries(filteredCategories).map(([category, resources]) => (
              <CollapsibleSection
                key={`${state}:${category}`}
                title={`${t(category as TranslationKey)} ${resources.length > 0 ? `(${resources.length})` : '– ⚠️'}`}>
                <ul className="list-none list-inside space-y-3">
                  {resources.length > 0 ? (
                    resources.map((res, i) => (
                      <li key={i}>
                        <div className="flex flex-col">
                          <div>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline">
                              {res.title}
                            </a>{' '}
                            -&nbsp;<span className="break-words">{res.url}</span>
                          </div>
                          {res.description && <p className="text-sm mt-1 whitespace-pre-wrap">{res.description}</p>}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm italic text-gray-500">{t('noResourcesYet')}</li>
                  )}
                </ul>
              </CollapsibleSection>
            ))}
          </CollapsibleSection>
        );
      })}
    </div>
  );
};

export default GroupedImmigrantResources;
