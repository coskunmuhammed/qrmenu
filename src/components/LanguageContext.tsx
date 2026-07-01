'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import tr from '@/locales/tr.json';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import de from '@/locales/de.json';
import ar from '@/locales/ar.json';

export type Language = 'tr' | 'en' | 'ru' | 'de' | 'ar';

const locales = { tr, en, ru, de, ar };

type TranslationKeys = keyof typeof tr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    const savedLang = localStorage.getItem('qr_menu_lang') as Language;
    if (Object.keys(locales).includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (Object.keys(locales).includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('qr_menu_lang', lang);
    }
  };

  const t = (key: TranslationKeys): string => {
    const dict = locales[language] || locales['tr'];
    return (dict as any)[key] || (locales['tr'] as any)[key] || String(key);
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
