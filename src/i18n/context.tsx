
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';
import useLocalStorage from '@/hooks/useLocalStorage';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<string>('app-language', 'en');

  const t = (key: string): string => {
    if (!translations[language]) {
      return translations['en'][key] || key;
    }
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
