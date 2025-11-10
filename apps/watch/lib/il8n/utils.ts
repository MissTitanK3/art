import { TRANSLATIONS, SupportedLang } from "./translations";

const supported = Object.keys(TRANSLATIONS) as SupportedLang[];

export function detectBrowserLanguage(): SupportedLang {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language!.split("-")[0] as SupportedLang;
  return supported.includes(lang) ? lang : "en";
}
