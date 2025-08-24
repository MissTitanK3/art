import { NormalizedLanguage } from '@workspace/store/types/language.ts';

export const ALIASES: Record<string, NormalizedLanguage> = {
  // Core
  english: { tag: 'en', display_name: 'English' },
  spanish: { tag: 'es', display_name: 'Spanish' },
  español: { tag: 'es', display_name: 'Spanish' },
  portuguese: { tag: 'pt', display_name: 'Portuguese' },
  português: { tag: 'pt', display_name: 'Portuguese' },
  'brazilian portuguese': { tag: 'pt-BR', display_name: 'Portuguese (Brazil)' },
  'european portuguese': { tag: 'pt-PT', display_name: 'Portuguese (Portugal)' },

  french: { tag: 'fr', display_name: 'French' },
  german: { tag: 'de', display_name: 'German' },
  russian: { tag: 'ru', display_name: 'Russian' },
  ukrainian: { tag: 'uk', display_name: 'Ukrainian' },
  polish: { tag: 'pl', display_name: 'Polish' },
  italian: { tag: 'it', display_name: 'Italian' },
  romanian: { tag: 'ro', display_name: 'Romanian' },
  greek: { tag: 'el', display_name: 'Greek' },

  // Arabic & variants
  arabic: { tag: 'ar', display_name: 'Arabic' },
  'levantine arabic': { tag: 'ar-x-levantine', display_name: 'Arabic (Levantine)' },
  'egyptian arabic': { tag: 'ar-EG', display_name: 'Arabic (Egypt)' },

  // Chinese & Sinosphere
  chinese: { tag: 'zh', display_name: 'Chinese' },
  mandarin: { tag: 'cmn', display_name: 'Chinese (Mandarin)' },
  cantonese: { tag: 'yue', display_name: 'Cantonese' },
  'zh-hans': { tag: 'zh-Hans', display_name: 'Chinese (Simplified)' },
  'zh-hant': { tag: 'zh-Hant', display_name: 'Chinese (Traditional)' },

  // South & Central Asia
  hindi: { tag: 'hi', display_name: 'Hindi' },
  urdu: { tag: 'ur', display_name: 'Urdu' },
  bengali: { tag: 'bn', display_name: 'Bengali' },
  punjabi: { tag: 'pa', display_name: 'Punjabi' },
  'punjabi (gurmukhi)': { tag: 'pa-Guru', display_name: 'Punjabi (Gurmukhi)' },
  'punjabi (shahmukhi)': { tag: 'pa-Arab', display_name: 'Punjabi (Shahmukhi)' },
  farsi: { tag: 'fa-IR', display_name: 'Persian (Iran)' },
  persian: { tag: 'fa-IR', display_name: 'Persian (Iran)' },
  dari: { tag: 'fa-AF', display_name: 'Dari (Afghanistan)' },
  pashto: { tag: 'ps', display_name: 'Pashto' },
  kurdish: { tag: 'ku', display_name: 'Kurdish' },
  'kurdish (sorani)': { tag: 'ckb', display_name: 'Kurdish (Sorani)' },
  'kurdish (kurmanji)': { tag: 'kmr', display_name: 'Kurdish (Kurmanji)' },

  // SE/E Asia
  tagalog: { tag: 'fil', display_name: 'Filipino/Tagalog' },
  filipino: { tag: 'fil', display_name: 'Filipino/Tagalog' },
  vietnamese: { tag: 'vi', display_name: 'Vietnamese' },
  thai: { tag: 'th', display_name: 'Thai' },
  burmese: { tag: 'my', display_name: 'Burmese' },
  myanmar: { tag: 'my', display_name: 'Burmese' },
  khmer: { tag: 'km', display_name: 'Khmer' },
  japanese: { tag: 'ja', display_name: 'Japanese' },
  korean: { tag: 'ko', display_name: 'Korean' },
  hmong: { tag: 'hmn', display_name: 'Hmong' },

  // Africa
  swahili: { tag: 'sw', display_name: 'Swahili' },
  somali: { tag: 'so', display_name: 'Somali' },
  amharic: { tag: 'am', display_name: 'Amharic' },
  tigrinya: { tag: 'ti', display_name: 'Tigrinya' },
  hausa: { tag: 'ha', display_name: 'Hausa' },
  yoruba: { tag: 'yo', display_name: 'Yoruba' },
  igbo: { tag: 'ig', display_name: 'Igbo' },

  // Americas
  'haitian creole': { tag: 'ht', display_name: 'Haitian Creole' },
  quechua: { tag: 'qu', display_name: 'Quechua' },
  navajo: { tag: 'nv', display_name: 'Navajo' },

  // Middle East & others
  turkish: { tag: 'tr', display_name: 'Turkish' },
  hebrew: { tag: 'he', display_name: 'Hebrew' },
  yiddish: { tag: 'yi', display_name: 'Yiddish' },
};

export const SAFE_TWO_LETTER: Record<string, NormalizedLanguage> = {
  en: { tag: 'en', display_name: 'English' },
  es: { tag: 'es', display_name: 'Spanish' },
  fr: { tag: 'fr', display_name: 'French' },
  de: { tag: 'de', display_name: 'German' },
  pt: { tag: 'pt', display_name: 'Portuguese' },
  it: { tag: 'it', display_name: 'Italian' },
  ru: { tag: 'ru', display_name: 'Russian' },
  ar: { tag: 'ar', display_name: 'Arabic' },
  zh: { tag: 'zh', display_name: 'Chinese' },
  hi: { tag: 'hi', display_name: 'Hindi' },
  ur: { tag: 'ur', display_name: 'Urdu' },
  fa: { tag: 'fa-IR', display_name: 'Persian (Iran)' },
};

export const SUGGESTIONS: NormalizedLanguage[] = [
  { tag: 'en', display_name: 'English' },
  { tag: 'es', display_name: 'Spanish' },
  { tag: 'pt-BR', display_name: 'Portuguese (Brazil)' },
  { tag: 'pt-PT', display_name: 'Portuguese (Portugal)' },
  { tag: 'fr', display_name: 'French' },
  { tag: 'de', display_name: 'German' },
  { tag: 'ru', display_name: 'Russian' },
  { tag: 'uk', display_name: 'Ukrainian' },
  { tag: 'ar', display_name: 'Arabic' },
  { tag: 'ar-x-levantine', display_name: 'Arabic (Levantine)' },
  { tag: 'cmn', display_name: 'Chinese (Mandarin)' },
  { tag: 'yue', display_name: 'Cantonese' },
  { tag: 'zh-Hans', display_name: 'Chinese (Simplified)' },
  { tag: 'zh-Hant', display_name: 'Chinese (Traditional)' },
  { tag: 'vi', display_name: 'Vietnamese' },
  { tag: 'fil', display_name: 'Filipino/Tagalog' },
  { tag: 'ja', display_name: 'Japanese' },
  { tag: 'ko', display_name: 'Korean' },
  { tag: 'so', display_name: 'Somali' },
  { tag: 'am', display_name: 'Amharic' },
  { tag: 'ti', display_name: 'Tigrinya' },
  { tag: 'fa-IR', display_name: 'Persian (Iran)' },
  { tag: 'fa-AF', display_name: 'Dari (Afghanistan)' },
  { tag: 'ps', display_name: 'Pashto' },
  { tag: 'ckb', display_name: 'Kurdish (Sorani)' },
  { tag: 'kmr', display_name: 'Kurdish (Kurmanji)' },
];

export const PROFICIENCIES = ['native', 'fluent', 'conversational', 'basic', 'nonverbal'] as const;
