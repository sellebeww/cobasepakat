import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './en';
import { id, type MessageKey } from './id';

export type Locale = 'id' | 'en';
const DICTS: Record<Locale, Record<MessageKey, string>> = { id, en };
const KEY = 'cobasepakat_locale';

export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  const raw = DICTS[locale][key] ?? id[key] ?? key;
  return params ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : raw;
}

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    /* penyimpanan diblokir */
  }
  return 'id'; // bawaan: Indonesia
}

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
}
const I18nContext = createContext<Ctx>({ locale: 'id', setLocale: () => undefined, t: (k, p) => translate('id', k, p) });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* abaikan */
    }
  }, []);
  const value = useMemo<Ctx>(() => ({ locale, setLocale, t: (k, p) => translate(locale, k, p) }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export type { MessageKey };
