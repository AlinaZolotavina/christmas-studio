import { describe, expect, it } from 'vitest';
import { interpolate, resolveMessage, type Catalog } from './formatter';

const catalogs: Record<string, Catalog> = {
  ru: {
    cards: { one: '{count} открытка', few: '{count} открытки', many: '{count} открыток', other: '{count} открытки' },
    fallbackCards: { one: '{count} карточка', few: '{count} карточки', many: '{count} карточек', other: '{count} карточки' },
    project: 'Проект «{projectName}»: {count}',
  },
  en: {
    cards: { one: '{count} card', other: '{count} cards' },
    project: '{count} cards in “{projectName}”',
  },
};
const translate = (key: string, count: number, language: string) => interpolate(resolveMessage(catalogs, key, { count }, language), { count }, key);

describe('localization messages', () => {
  it('does not mistake a category named other for a plural message', () => {
    const dictionaries = { en: { categories: { all: 'All types', 'toys-games': 'Toys & games', other: 'Other' } } };
    expect(resolveMessage(dictionaries, 'categories.all', {}, 'en', 'en')).toBe('All types');
    expect(resolveMessage(dictionaries, 'categories.other', {}, 'en', 'en')).toBe('Other');
    expect(() => resolveMessage(dictionaries, 'categories', { count: 2 }, 'en', 'en')).toThrow('Unknown translation');
  });
  it.each([[0, '0 открыток'], [1, '1 открытка'], [2, '2 открытки'], [5, '5 открыток'], [11, '11 открыток'], [21, '21 открытка'], [24, '24 открытки'], [31, '31 открытка'], [1.5, '1.5 открытки']] as const)('chooses the Russian form for %s', (count, expected) => {
    expect(translate('cards', count, 'ru')).toBe(expected);
  });
  it.each([[0, '0 cards'], [1, '1 card'], [2, '2 cards'], [21, '21 cards']] as const)('chooses the English form for %s', (count, expected) => {
    expect(translate('cards', count, 'en')).toBe(expected);
  });
  it('uses Russian plural rules when an English message is missing', () => {
    expect(translate('fallbackCards', 21, 'en')).toBe('21 карточка');
    expect(translate('cards', 5, 'de')).toBe('5 открыток');
  });
  it('lets the translation reorder named parameters without interpreting their content', () => {
    const params = { count: 2, projectName: '<b>{count}</b>' };
    expect(interpolate(resolveMessage(catalogs, 'project', params, 'en'), params, 'project')).toBe('2 cards in “<b>{count}</b>”');
  });
  it('reports a missing parameter or an invalid plural count', () => {
    expect(() => interpolate('{projectName}', {}, 'project')).toThrow('projectName');
    expect(() => resolveMessage(catalogs, 'cards', { count: '2' }, 'ru')).toThrow('numeric count');
    expect(() => resolveMessage(catalogs, 'cards', { count: NaN }, 'ru')).toThrow('numeric count');
    expect(() => resolveMessage(catalogs, 'unknown', {}, 'ru')).toThrow('Unknown translation');
  });
});
