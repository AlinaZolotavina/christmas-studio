import { TERMS_VERSION } from '../../content/legalMetadata';

export const TERMS_ACCEPTANCE_KEY = 'advent-tag-studio:terms-acceptance';
export interface TermsAcceptance { version: string; acceptedAt: string }
interface AcceptanceStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }

/** The record belongs to this browser; it is never a server-side identity or signature. */
export class TermsAcceptancePreference {
  private acceptedInSession = false;
  constructor(private storage: () => AcceptanceStorage, private now = () => new Date()) {}
  hasAccepted(): boolean {
    if (this.acceptedInSession) return true;
    try {
      const record: unknown = JSON.parse(this.storage().getItem(TERMS_ACCEPTANCE_KEY) ?? 'null');
      return typeof record === 'object' && record !== null && 'version' in record && record.version === TERMS_VERSION && 'acceptedAt' in record && typeof record.acceptedAt === 'string' && Number.isFinite(Date.parse(record.acceptedAt));
    } catch { return false; }
  }
  accept(): TermsAcceptance {
    const record = { version: TERMS_VERSION, acceptedAt: this.now().toISOString() };
    this.acceptedInSession = true;
    try { this.storage().setItem(TERMS_ACCEPTANCE_KEY, JSON.stringify(record)); }
    catch { /* The editor may still work in memory when persistent storage is unavailable. */ }
    return record;
  }
}

export const termsAcceptance = new TermsAcceptancePreference(() => window.localStorage);
