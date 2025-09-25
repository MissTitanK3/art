'use client';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { useWizard } from './WizardContext';

export default function TestReportToggle() {
  const { testReportEnabled, setTestReportEnabled } = useWizard();
  const { t } = useTranslations();

  return (
    <div className="bg-white/10 rounded p-4 shadow max-w-2xl mx-auto mb-6 border">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">{t('testReport')}</h2>

        <label className="relative inline-block w-11 h-6 cursor-pointer">
          <input
            type="checkbox"
            checked={testReportEnabled}
            onChange={() => setTestReportEnabled(!testReportEnabled)}
            className="sr-only peer"
          />
          <div className="w-full h-full bg-gray-800 rounded-full peer-checked:bg-green-500 transition-colors" />
          <div className="absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      <p className="text-xs text-gray-200">{t('testReportDescription')}</p>
    </div>
  );
}
