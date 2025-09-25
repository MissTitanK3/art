'use client';

import { useLanguage } from '@/lib/il8n/provider';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const buttonStyle = (active: boolean) =>
    `px-4 py-2 min-w-[100px] rounded-md text-lg font-medium backdrop-blur-md border transition-all shadow
     ${
       active
         ? 'bg-blue-500/30 border-blue-400 text-white hover:bg-blue-500/40'
         : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
     }
     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300/40`;

  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => setLanguage('en')}
        className={buttonStyle(language === 'en')}
        aria-pressed={language === 'en'}>
        English
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={buttonStyle(language === 'es')}
        aria-pressed={language === 'es'}>
        Español
      </button>
    </div>
  );
}
