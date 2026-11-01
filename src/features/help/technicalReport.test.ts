import { describe, expect, it } from 'vitest';
import { buildTechnicalReport, getIssuesUrl } from './technicalReport';

describe('support report privacy', () => {
  it('serializes only allowlisted diagnostics even when the input contains a project and raw data', () => {
    const context = {
      appVersion: '1.0.0', browser: 'Test Browser', storageStatus: 'error' as const, errorCount: 2, warningCount: 1,
      project: { name: 'Private project', cards: [{ text: { content: 'Секретное поздравление' }, illustration: { assetId: 'private-image' } }] },
      raw: 'sensitive localStorage backup', issues: [{ message: 'Private user content' }],
    };
    const report = buildTechnicalReport(context);
    expect(JSON.parse(report)).toEqual({ appVersion: '1.0.0', browser: 'Test Browser', storage: 'error', validation: { errors: 2, warnings: 1 } });
    for (const secret of ['Секретное поздравление', 'private-image', 'Private project', 'sensitive localStorage backup', 'Private user content']) expect(report).not.toContain(secret);
  });

  it('uses finite, non-negative diagnostic counts', () => {
    const report = JSON.parse(buildTechnicalReport({ appVersion: '1', browser: 'Browser', storageStatus: 'saved', errorCount: NaN, warningCount: -1 }));
    expect(report.validation).toEqual({ errors: 0, warnings: 0 });
  });

  it('enables only explicitly configured GitHub Issues links', () => {
    expect(getIssuesUrl(undefined)).toBeNull();
    expect(getIssuesUrl('javascript:alert(1)')).toBeNull();
    expect(getIssuesUrl('https://github.com.attacker.test/owner/repo/issues')).toBeNull();
    expect(getIssuesUrl('https://attacker@github.com/owner/repo/issues')).toBeNull();
    expect(getIssuesUrl('https://github.com/owner/repo')).toBeNull();
    expect(getIssuesUrl('https://github.com/owner/repo/issues')).toBe('https://github.com/owner/repo/issues');
  });
});
