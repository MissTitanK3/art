'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/il8n/useTranslations';
import LinkButton from '@/components/ui/FrostedLink';
import { FrostedButton } from '@/components/ui/FrostedButton';
import { TRANSLATIONS } from '@/lib/il8n/translations';

function CopyTemplateButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return <FrostedButton onClick={copy}>{copied ? 'Copied!' : 'Copy Template'}</FrostedButton>;
}

function ColorizedJson({ json }: { json: string }) {
  return (
    <pre className="bg-gray-900 text-sm text-white font-mono p-4 rounded border overflow-x-auto max-h-96 leading-relaxed">
      {json.split('\n').map((line, idx) => {
        const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
        const valueMatch = line.match(/:\s*"([^"]*)"/);

        const indent = line.match(/^\s*/)?.[0] || '';

        return (
          <div key={idx}>
            <span className="text-gray-600">{indent}</span>
            {keyMatch && <span className="text-yellow-400">{`"${keyMatch[1]}"`}</span>}
            {keyMatch && <span className="text-white">: </span>}
            {valueMatch ? (
              <span className="text-green-400">{`"${valueMatch[1]}"`}</span>
            ) : (
              <span className="text-gray-400">{line.trim().replace(/^".*":\s*/, '')}</span>
            )}
          </div>
        );
      })}
    </pre>
  );
}

function CollapsibleJson({ label, json }: { label: string; json: object }) {
  const [open, setOpen] = useState(false);

  const renderLines = (obj: object) => {
    const jsonStr = JSON.stringify(obj, null, 2);
    return jsonStr.split('\n').map((line, idx) => {
      const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
      const valueMatch = line.match(/:\s*"([^"]*)"/);
      const indent = line.match(/^\s*/)?.[0] || '';

      return (
        <div key={idx} className="whitespace-pre leading-relaxed font-mono">
          <span className="text-gray-600">{indent}</span>
          {keyMatch && <span className="text-yellow-400">{`"${keyMatch[1]}"`}</span>}
          {keyMatch && <span className="text-white">: </span>}
          {valueMatch ? (
            <span className="text-green-400">{`"${valueMatch[1]}"`}</span>
          ) : (
            <span className="text-gray-300">{line.trim().replace(/^".*":\s*/, '')}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="mb-4">
      <FrostedButton onClick={() => setOpen((o) => !o)}>{open ? `▼ ${label}` : `▶ ${label}`}</FrostedButton>
      {open && (
        <div className="bg-gray-900 text-sm text-white p-4 rounded border overflow-x-auto max-h-96">
          {renderLines(json)}
        </div>
      )}
    </div>
  );
}

export default function RequestLanguageSupportPage() {
  const [template, setTemplate] = useState('');
  const { t } = useTranslations();

  useEffect(() => {
    const keys = Object.keys(TRANSLATIONS.en) as (keyof (typeof TRANSLATIONS)['en'])[];
    const obj = keys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);
    setTemplate(JSON.stringify(obj, null, 2));
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-evenly">
        <LinkButton size="2xl" variant="red" label={t('quickExit')} href="https://wikipedia.org" />
      </div>
      <h1 className="text-3xl font-bold">🌍 {t('requestLanguageSupport')}</h1>
      <p className="text-lg">
        {t('languageSupportInvite')}{' '}
        <a href="mailto:icetea@peoplesrebellion.org" className="underline text-blue-600">
          icetea@peoplesrebellion.org
        </a>
        .
      </p>

      <section>
        <div className="flex items-center justify-between mb-2 flex-col gap-2">
          <h2 className="text-2xl font-semibold">📝 {t('translationTemplate')}</h2>
          <CopyTemplateButton text={template} />
        </div>
        <ColorizedJson json={template} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">📚 {t('existingTranslations')}</h2>
        {Object.entries(TRANSLATIONS).map(([lang, content]) => (
          <CollapsibleJson key={lang} label={`[${lang}]`} json={content} />
        ))}
      </section>
    </main>
  );
}
