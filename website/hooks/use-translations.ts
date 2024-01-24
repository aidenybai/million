import { useRouter } from 'next/router';
import { translations } from '../translations';

// This type represents the structure of each language's translations
type Translation = (typeof translations)['en-US'];

/**
 * The function returns the translations for the current locale if it exists in the translations
 * object.
 * @returns The translations object for the specified locale, if it exists in the translations object.
 */
export function useTranslations(): Translation {
  const { locale = 'en-US' } = useRouter();

  if (locale in translations) {
    return translations[locale];
  }

  // backup locale
  return translations['en-US'];
}
