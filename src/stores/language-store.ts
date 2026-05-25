import { create } from 'zustand';
import type { Language } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: Record<string, Record<string, string>>) => Record<string, string>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: (typeof window !== 'undefined' ? localStorage.getItem('rss_lang') : null) as Language || 'en',

  setLanguage: (lang: Language) => {
    localStorage.setItem('rss_lang', lang);
    set({ language: lang });
  },

  t: (translations) => {
    const { language } = get();
    const dict = translations as unknown as Record<Language, Record<string, string>>;
    return dict[language] || dict.en;
  },
}));
