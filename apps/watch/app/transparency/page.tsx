'use client';

import { DataAccessExplainer } from '@/components/DataAccessExplainer';
import GitHubCard from '@/components/GithubCard';
import TransparencyNotice from '@/components/TransparencyNotice';
import { useTranslations } from '@/lib/il8n/useTranslations';

export default function TransparencyPage() {
  const { t } = useTranslations();

  return (
    <div className="p-6 max-w-4xl mx-auto text-base leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">{t('transparencyTitle')}</h1>
      <TransparencyNotice />
      <DataAccessExplainer />
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t('transparencyWhyTitle')}</h2>
        <p> {t('transparencyWhyText')}</p>
        <p>{t('mediaPrivacyNote')}</p>
      </section>

      <GitHubCard />

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t('transparencyCollectTitle')}</h2>
        <ul className="list-disc ml-6">
          <li>{t('transparencyCollectList1')}</li>
          <li>{t('transparencyCollectList2')}</li>
          <li>{t('transparencyCollectList3')}</li>
          <li>{t('transparencyCollectList4')}</li>
          <li>{t('transparencyCollectList5')}</li>
          <li>{t('transparencyCollectList6')}</li>
          <li>{t('transparencyCollectList7')}</li>
          <li>{t('transparencyCollectList8')}</li>
        </ul>

        <p className="mt-2">{t('transparencyAnonNote')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t('transparencyTypesTitle')}</h2>

        <div className="mb-4">
          <h3 className="text-xl font-semibold">ReportFormData</h3>
          <pre className="bg-gray-700 text-sm p-4 overflow-x-auto">
            {`export type ReportFormData = {
  agency_type: string[];
  agency_other: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  media_url: File | null;
  officer_moving?: boolean;
  officer_direction?: 
    | 'North'
    | 'NorthEast'
    | 'East'
    | 'SouthEast'
    | 'South'
    | 'SouthWest'
    | 'West'
    | 'NorthWest';
  lights_on?: boolean;
  sirens_on?: boolean;
};`}
          </pre>

          <p>{t('transparencyFormDataExplain')}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold">Report</h3>
          <pre className="bg-gray-700 text-sm p-4 overflow-x-auto">
            {`export type Report = {
  id: string;
  agency_type: string[];
  agency_other: string;
  location: {
    lat: number;
    lng: number;
  };
  media_url: string | null;
  timestamp: string; // ISO
  officer_moving?: boolean;
  officer_direction?: 
    | 'North'
    | 'NorthEast'
    | 'East'
    | 'SouthEast'
    | 'South'
    | 'SouthWest'
    | 'West'
    | 'NorthWest';
  lights_on?: boolean;
  sirens_on?: boolean;
};`}
          </pre>

          <p>{t('transparencyReportExplain')}</p>
          <p className="mt-2">{t('transparencyOfficerNote')}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t('transparencyInspectTitle')}</h2>
        <p>{t('transparencyInspectDesktop')}</p>
        <p className="mt-2">
          {t('transparencyInspectMobile')}{' '}
          <a href="https://httptoolkit.tech/" className="underline text-blue-600" target="_blank">
            HTTP Toolkit
          </a>
          .
        </p>
      </section>
    </div>
  );
}
