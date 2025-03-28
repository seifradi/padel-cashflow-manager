
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
  formatCurrency: (amount: number) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get language from localStorage, default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      return savedLanguage === 'fr' ? 'fr' : 'en';
    }
    return 'en';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
    console.log(`Language changed to: ${language}`);
  }, [language]);

  const setLanguage = (lang: Language) => {
    console.log(`Setting language to: ${lang}`);
    setLanguageState(lang);
  };

  // Get translations for current language
  const currentTranslations = translations[language] || translations['en'];

  // Format currency based on language
  const formatCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  // Whether current language is RTL
  const isRtl = false; // Currently neither English nor French are RTL languages

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      translations: currentTranslations,
      formatCurrency,
      isRtl
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
