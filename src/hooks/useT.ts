import { useLanguageStore } from '@/stores/language-store';
import { translations } from '@/lib/i18n';

export function useT() {
  const language = useLanguageStore(s => s.language);
  const setLanguage = useLanguageStore(s => s.setLanguage);
  return { t: translations[language], language, setLanguage };
}
