import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export type LanguageCode = 'en' | 'ru';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language?.substring(0, 2) as LanguageCode) || 'en';

  const changeLanguage = useCallback(async (code: LanguageCode) => {
    await i18n.changeLanguage(code);
    document.documentElement.lang = code;
  }, [i18n]);

  return {
    currentLanguage,
    changeLanguage,
    languages: LANGUAGES,
  };
}
