import { SupportedLang } from './translations';

export function detectBrowserLanguage(): SupportedLang {
  if (typeof window === 'undefined') return 'en'; // fallback
  const lang = navigator.language.split('-')[0]; // e.g. 'en-US' → 'en'
  return ['en', 'es'].includes(lang) ? (lang as SupportedLang) : 'en';
}
