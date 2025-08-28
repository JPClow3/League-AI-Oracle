import { useSettings } from './useSettings';
import { translations } from '../lib/i18n';

// A type-safe key for our translations
export type TranslationKey = keyof (typeof translations)['en'];

export const useTranslation = () => {
  const { settings, setSettings } = useSettings();
  const lang = settings.language || 'en';

  const t = (key: TranslationKey): string => {
    // Fallback logic: if a key doesn't exist in the current language, use English.
    // If it doesn't exist in English, return the key itself.
    return translations[lang][key] || translations['en'][key] || key;
  };

  const setLang = (newLang: 'en' | 'pt') => {
    setSettings({ language: newLang });
  };

  return { t, lang, setLang };
};
