import { beforeEach, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';
import { initializeAnalytics } from '../../analytics';
import { downloadGiftPdf } from './giftPdf';
import { loadLocalResourceBytes, releaseLocalResourceBytes } from '../../infrastructure/resources';

const pdf = vi.hoisted(() => ({
    addFileToVFS: vi.fn(), addFont: vi.fn(), setFont: vi.fn(), setProperties: vi.fn(),
    setTextColor: vi.fn(), setFontSize: vi.fn(), text: vi.fn(), splitTextToSize: vi.fn(() => ['Gift']),
    setDrawColor: vi.fn(), setLineWidth: vi.fn(), rect: vi.fn(), addPage: vi.fn(), save: vi.fn(),
}));
vi.mock('jspdf', () => ({ jsPDF: class { constructor() { return pdf; } } }));
vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }));
vi.mock('../../infrastructure/resources', () => ({ loadLocalResourceBytes: vi.fn(), releaseLocalResourceBytes: vi.fn() }));

const items = [{ id: 'private-id', kind: 'custom' as const, name: 'Private gift text', addedAt: 0 }];
beforeEach(() => {
    vi.clearAllMocks();
    pdf.save.mockReset();
    vi.mocked(loadLocalResourceBytes).mockResolvedValue(new Uint8Array([0, 1, 2]));
    initializeAnalytics();
});

it('tracks each successful gift PDF save without including gift data', async () => {
    await downloadGiftPdf(items);
    await downloadGiftPdf(items);
    expect(pdf.save).toHaveBeenCalledWith('my-gift-list.pdf', { returnPromise: true });
    expect(vi.mocked(posthog.capture).mock.calls).toEqual([['gift_list_export'], ['gift_list_export']]);
});

it('does not track a failed generation and releases the local font', async () => {
    vi.mocked(loadLocalResourceBytes).mockRejectedValueOnce(new Error('Font unavailable'));
    await expect(downloadGiftPdf(items)).rejects.toThrow('Font unavailable');
    expect(posthog.capture).not.toHaveBeenCalled();
    expect(pdf.save).not.toHaveBeenCalled();
    expect(releaseLocalResourceBytes).toHaveBeenCalledWith('fonts/PTSans-Regular.ttf');
});

it('does not track a failed asynchronous save', async () => {
    pdf.save.mockRejectedValueOnce(new Error('Save failed'));
    await expect(downloadGiftPdf(items)).rejects.toThrow('Save failed');
    expect(posthog.capture).not.toHaveBeenCalled();
});

it('does not generate or track an empty list', async () => {
    await downloadGiftPdf([]);
    expect(pdf.save).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
});
