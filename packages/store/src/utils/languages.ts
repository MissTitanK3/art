import { NormalizedLanguage } from '../types/language.ts';
import { ALIASES, SAFE_TWO_LETTER } from '@workspace/ui/lib/constants/language';

export function canonicalKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[._]/g, ' ')
    .replace(/\(.*?\)/g, '')
    .trim();
}

export function normalizeLanguage(inputRaw: string): NormalizedLanguage | null {
  const key = canonicalKey(inputRaw);
  if (!key) return null;

  // Direct hits
  if (ALIASES[key]) return ALIASES[key];

  // Heuristics for common hints users type
  if (/^portuguese.*brazil/.test(key)) return { tag: 'pt-BR', display_name: 'Portuguese (Brazil)' };
  if (/^portuguese.*portugal/.test(key)) return { tag: 'pt-PT', display_name: 'Portuguese (Portugal)' };
  if (/^arabic.*egypt/.test(key)) return { tag: 'ar-EG', display_name: 'Arabic (Egypt)' };
  if (/^chinese.*simplified/.test(key)) return { tag: 'zh-Hans', display_name: 'Chinese (Simplified)' };
  if (/^chinese.*traditional/.test(key)) return { tag: 'zh-Hant', display_name: 'Chinese (Traditional)' };

  // Cautious 2-letter fallbacks
  const guess2 = key.slice(0, 2);
  if (SAFE_TWO_LETTER[guess2]) return SAFE_TWO_LETTER[guess2];

  return null;
}

export function tokenize(input: string): string[] {
  return input
    .split(/[;,/|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}
