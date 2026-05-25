'use client';

import { useNavigationStore } from '@/stores/navigation-store';
import { translations, type TranslationKey } from '@/lib/i18n';

export function useTranslation() {
  const language = useNavigationStore((s) => s.language);

  function t(key: string): string {
    const lang = translations[language] as unknown as Record<string, unknown>;
    const keys = key.split('.');
    let result: unknown = lang;
    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }

  return { t, language };
}
