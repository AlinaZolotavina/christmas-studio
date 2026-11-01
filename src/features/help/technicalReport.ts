export interface TechnicalReportContext {
  appVersion: string;
  browser: string;
  storageStatus: 'loading' | 'saving' | 'saved' | 'error';
  errorCount: number;
  warningCount: number;
}

const count = (value: number) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/** An explicit allowlist: never accept or serialize a project, issue messages or storage raw. */
export function buildTechnicalReport(context: TechnicalReportContext): string {
  return JSON.stringify({
    appVersion: context.appVersion,
    browser: context.browser,
    storage: context.storageStatus,
    validation: { errors: count(context.errorCount), warnings: count(context.warningCount) },
  }, null, 2);
}

export function getIssuesUrl(configured: unknown): string | null {
  if (typeof configured !== 'string' || !configured.trim()) return null;
  try {
    const url = new URL(configured);
    return url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password && /^\/[^/]+\/[^/]+\/issues(?:\/new)?\/?$/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}
