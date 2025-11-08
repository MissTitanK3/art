'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TRANSLATIONS } from '@/lib/il8n/translations';
import { FrostedButton } from '@/components/ui/FrostedButton';

type LanguageSupportPanelProps = {
  compact?: boolean;
};

function CopyTemplateButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <FrostedButton onClick={handleCopy} variant="secondary" size="altMd">
      {copied ? 'Copied!' : 'Copy Template'}
    </FrostedButton>
  );
}

function ColorizedJson({ json }: { json: string }) {
  const lines = json ? json.split('\n') : ['Loading...'];

  const renderLine = (line: string, idx: number) => {
    const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
    const valueMatch = line.match(/:\s*"([^"]*)"/);
    const indent = line.match(/^\s*/)?.[0] || '';

    return (
      <div key={idx} className="leading-relaxed font-mono">
        <span className="text-gray-500">{indent}</span>
        {keyMatch && <span className="text-yellow-300">{`"${keyMatch[1]}"`}</span>}
        {keyMatch && <span className="text-white">: </span>}
        {valueMatch ? (
          <span className="text-green-300">{`"${valueMatch[1]}"`}</span>
        ) : (
          <span className="text-gray-300">{line.trim().replace(/^".*":\s*/, '')}</span>
        )}
      </div>
    );
  };

  return (
    <pre className="bg-white/5 text-xs text-white font-mono p-3 rounded border border-white/10 overflow-x-auto max-h-64">
      {lines.map(renderLine)}
    </pre>
  );
}

function CollapsibleJson({ label, json }: { label: string; json: object }) {
  const [open, setOpen] = useState(false);
  const lines = JSON.stringify(json, null, 2).split('\n');

  const renderLine = (line: string, idx: number) => {
    const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
    const valueMatch = line.match(/:\s*"([^"]*)"/);
    const indent = line.match(/^\s*/)?.[0] || '';

    return (
      <div key={idx} className="leading-relaxed font-mono">
        <span className="text-gray-500">{indent}</span>
        {keyMatch && <span className="text-yellow-300">{`"${keyMatch[1]}"`}</span>}
        {keyMatch && <span className="text-white">: </span>}
        {valueMatch ? (
          <span className="text-green-300">{`"${valueMatch[1]}"`}</span>
        ) : (
          <span className="text-gray-300">{line.trim().replace(/^".*":\s*/, '')}</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <FrostedButton onClick={() => setOpen((o) => !o)} variant="secondary" size="altMd">
        {open ? `▼ ${label}` : `▶ ${label}`}
      </FrostedButton>
      {open && (
        <pre className="bg-white/5 text-xs text-white font-mono p-3 rounded border border-white/10 overflow-y-auto max-h-48 mt-2">
          {lines.map(renderLine)}
        </pre>
      )}
    </div>
  );
}

export default function LanguageSupportPanel({ compact }: LanguageSupportPanelProps) {
  const { t } = useTranslations();
  const [template, setTemplate] = useState('');

  useEffect(() => {
    const keys = Object.keys(TRANSLATIONS.en) as (keyof (typeof TRANSLATIONS)['en'])[];
    const structure = keys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);
    setTemplate(JSON.stringify(structure, null, 2));
  }, []);

  const textSize = compact ? 'text-sm' : 'text-base';
  const sectionGap = compact ? 'space-y-3' : 'space-y-5';

  return (
    <div className={`text-white ${textSize} ${sectionGap}`}>
      {!compact && <h2 className="text-2xl font-bold">🌍 {t('requestLanguageSupport')}</h2>}

      <p className="text-white/80">
        {t('languageSupportInvite')}{' '}
        <a href="mailto:icetea@peoplesrebellion.org" className="text-blue-300 underline">
          icetea@peoplesrebellion.org
        </a>
        .
      </p>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">📝 {t('translationTemplate')}</h3>
          <CopyTemplateButton text={template} />
        </div>
        {template ? <ColorizedJson json={template} /> : <p className="text-sm text-white/60">Loading template...</p>}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">📚 {t('existingTranslations')}</h3>
        {Object.entries(TRANSLATIONS).map(([lang, content]) => (
          <CollapsibleJson key={lang} label={`[${lang}]`} json={content} />
        ))}
      </section>
    </div>
  );
}
