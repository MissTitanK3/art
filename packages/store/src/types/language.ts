export type NormalizedLanguage = {
  tag: string; // canonical BCP-47 tag (e.g., 'es', 'pt-BR', 'yue')
  display_name: string;
  proficiency?: 'native' | 'fluent' | 'conversational' | 'basic' | 'nonverbal';
};
