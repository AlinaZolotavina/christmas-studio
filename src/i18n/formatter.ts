export type Catalog = { [key: string]: string | Catalog };
export type MessageParams = Record<string, unknown>;

function lookup(catalog: Catalog, key: string): string | Catalog | undefined {
  let value: string | Catalog | undefined = catalog;
  for (const part of key.split('.')) {
    if (typeof value !== 'object' || !Object.hasOwn(value, part)) return undefined;
    value = value[part];
  }
  return value;
}

/** A missing translation falls back as a whole, including its plural rules. */
export function resolveMessage(catalogs: Record<string, Catalog>, key: string, params: MessageParams, language: string, fallback = 'ru'): string {
  let sourceLocale = catalogs[language] ? language : fallback;
  let value = lookup(catalogs[sourceLocale], key);
  if (value === undefined) { value = lookup(catalogs[fallback], key); sourceLocale = fallback; }
  if (value && typeof value === 'object' && typeof value.other === 'string') {
    if (typeof params.count !== 'number' || !Number.isFinite(params.count)) throw new Error(`Translation ${key} requires a numeric count`);
    const form = new Intl.PluralRules(sourceLocale).select(params.count);
    const selected = value[form] ?? value.other;
    if (typeof selected === 'string') return selected;
  }
  if (typeof value === 'string') return value;
  throw new Error(`Unknown translation: ${key}`);
}

/** Replace each named parameter once; parameter content is never parsed as a template. */
export function interpolate(source: string, params: MessageParams, key: string): string {
  return source.replace(/\{([A-Za-z]\w*)\}/g, (_, name: string) => {
    if (!Object.hasOwn(params, name)) throw new Error(`Missing translation parameter ${name} in ${key}`);
    return params[name] == null ? '' : String(params[name]);
  });
}
