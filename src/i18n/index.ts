import ru from '../locales/ru.json';
import { interpolate, resolveMessage, type Catalog, type MessageParams } from './formatter';
export type { Catalog, MessageParams } from './formatter';
type Paths<T> = T extends string ? never : T extends { other: string } ? never : {
  [K in keyof T & string]: T[K] extends string | { other: string } ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string];
export type MessageKey = Paths<typeof ru>;

// Locale dictionaries are discovered automatically; components use the same stable keys.
const files = import.meta.glob<Catalog>('../locales/*.json', { eager: true, import: 'default' });
const catalogs: Record<string, Catalog> = { ru };
for (const [filename, catalog] of Object.entries(files)) {
  const language = filename.split('/').at(-1)!.replace(/\.json$/, '');
  catalogs[language] = catalog;
}
export const availableLocales = Object.keys(catalogs).sort();
const storageKey = 'christmas-studio.locale';
function initialLocale() {
  try {
    const saved = globalThis.localStorage?.getItem(storageKey);
    if (saved && catalogs[saved]) return saved;
  } catch { /* Storage can be unavailable; Russian remains usable. */ }
  return 'ru';
}
const locale = initialLocale();
export const getLocale = () => locale;

/** Reload rebuilds module-level UI catalogs in the selected language. Projects stay intact. */
export function setLocale(next: string): boolean {
  if (!catalogs[next] || next === locale) return false;
  try { localStorage.setItem(storageKey, next); } catch { return false; }
  window.location.reload();
  return true;
}

/** Resolve the plural form using the language of the catalog actually providing it. */
export function message(key: MessageKey, params: MessageParams = {}, language = locale): string {
  return resolveMessage(catalogs, key, params, language);
}

export function t(key: MessageKey, params: MessageParams = {}, language = locale): string {
  return interpolate(message(key, params, language), params, key);
}

export function localized(label: { ru: string; en?: string; [key: string]: string | undefined }): string {
  return label[locale] ?? label.ru;
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`));
}
