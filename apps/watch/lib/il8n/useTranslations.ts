'use client';
import { useLanguage } from './provider';

export const useTranslations = () => {
  const { t } = useLanguage();
  return { t };
};
