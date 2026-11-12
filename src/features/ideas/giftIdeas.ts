import catalog from '../../data/giftCatalog.json';
import nameAliases from '../../data/giftNameAliases.json';
import { getLocale } from '../../i18n';

export const recipientIds = ['all', 'toddlers', 'children', 'teenagers', 'girls', 'boys', 'mom', 'dad'] as const;
export const categoryIds = ['toys-games', 'creativity', 'stationery', 'accessories', 'beauty-care', 'home', 'sweets-drinks', 'other'] as const;
export type RecipientId = typeof recipientIds[number];
export type GiftCategoryId = typeof categoryIds[number];
export interface GiftIdea {
  id: string;
  name: string;
  nameEn?: string;
  recipients: Exclude<RecipientId, 'all'>[];
  categories: GiftCategoryId[];
}
export interface SavedGiftItem {
  id: string;
  name: string;
  kind: 'catalog' | 'custom';
  addedAt: number;
}
export const giftCatalog = catalog as GiftIdea[];
export const GIFT_STORAGE_KEY = 'gift-ideas.my-list';
const normalizeName = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru').replaceAll('ё', 'е');
const aliases = new Map(Object.entries(nameAliases).map(([name, canonical]) => [normalizeName(name), normalizeName(canonical)]));
const englishNames = new Map(giftCatalog.filter(gift => gift.nameEn).map(gift => [normalizeName(gift.nameEn!), normalizeName(gift.name)]));
export const giftNameKey = (name: string) => aliases.get(normalizeName(name)) ?? englishNames.get(normalizeName(name)) ?? normalizeName(name);

/** Catalog identity stays language-independent; custom text is always preserved. */
export function giftDisplayName(item: GiftIdea | SavedGiftItem, language = getLocale()): string {
  if ('kind' in item && item.kind === 'custom') return item.name;
  const gift = 'recipients' in item ? item : giftCatalog.find(gift => gift.id === item.id || giftNameKey(gift.name) === giftNameKey(item.name));
  return language === 'en' ? gift?.nameEn ?? item.name : gift?.name ?? item.name;
}

export function filterGiftIdeas(items: GiftIdea[], recipient: RecipientId, selectedTypes: GiftCategoryId[], language = getLocale()): GiftIdea[] {
  return items.filter(item => (recipient === 'all' || item.recipients.includes(recipient)) &&
    (!selectedTypes.length || item.categories.some(category => selectedTypes.includes(category))))
    .sort((left, right) => giftDisplayName(left, language).localeCompare(giftDisplayName(right, language), language));
}

/** Accept older saved lists, preserving insertion order and removing duplicate ideas. */
export function decodeGiftList(raw: string | null): SavedGiftItem[] {
  const data: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(data)) throw new Error('Invalid gift list');
  const names = new Set<string>(), ids = new Set<string>();
  return data.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string' ||
      !('name' in item) || typeof item.name !== 'string' || !item.name.trim() ||
      !('kind' in item) || !['catalog', 'custom'].includes(String(item.kind))) return [];
    const canonical = item.kind === 'catalog' ? giftCatalog.find(gift => giftNameKey(gift.name) === giftNameKey(item.name as string)) : undefined;
    const name = canonical?.name ?? item.name.trim(), key = giftNameKey(name), id = canonical?.id ?? item.id;
    if (ids.has(id) || names.has(key)) return [];
    ids.add(id); names.add(key);
    return [{ id, name, kind: item.kind as SavedGiftItem['kind'],
      addedAt: 'addedAt' in item && typeof item.addedAt === 'number' && Number.isFinite(item.addedAt) ? item.addedAt : 0 }];
  });
}
