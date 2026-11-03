import { describe, expect, it } from 'vitest';
import { TERMS_VERSION } from '../../content/legalMetadata';
import { TERMS_ACCEPTANCE_KEY, TermsAcceptancePreference } from './termsAcceptance';

describe('terms acceptance preference', () => {
  it('persists only the current version and a timestamp after explicit acceptance', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const preference = new TermsAcceptancePreference(() => storage, () => new Date('2026-11-03T12:00:00Z'));
    expect(preference.hasAccepted()).toBe(false);
    expect(values.size).toBe(0);
    preference.accept();
    expect(JSON.parse(values.get(TERMS_ACCEPTANCE_KEY)!)).toEqual({ version: TERMS_VERSION, acceptedAt: '2026-11-03T12:00:00.000Z' });
    expect(new TermsAcceptancePreference(() => storage).hasAccepted()).toBe(true);
  });
  it('does not treat old versions or malformed records as acceptance', () => {
    for (const raw of ['true', '{bad json', JSON.stringify({ version: 'old', acceptedAt: '2026-11-03' }), JSON.stringify({ version: TERMS_VERSION, acceptedAt: 'invalid' })]) {
      const preference = new TermsAcceptancePreference(() => ({ getItem: () => raw, setItem: () => undefined }));
      expect(preference.hasAccepted()).toBe(false);
    }
  });
  it('keeps an explicit acceptance in memory if browser storage is denied', () => {
    const preference = new TermsAcceptancePreference(() => { throw new Error('Storage denied'); });
    expect(preference.hasAccepted()).toBe(false);
    expect(() => preference.accept()).not.toThrow();
    expect(preference.hasAccepted()).toBe(true);
  });
});
