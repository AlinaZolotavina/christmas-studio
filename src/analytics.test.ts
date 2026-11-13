import { beforeEach, describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';

vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }));

async function setup() {
    const analytics = await import('./analytics');
    analytics.initializeAnalytics();
    return analytics;
}

beforeEach(() => {
    vi.resetModules();
    vi.mocked(posthog.init).mockReset();
    vi.mocked(posthog.capture).mockReset();
});

describe('explicit cookieless analytics', () => {
    it('initializes once without automatic events, storage identity, profiles or replay', async () => {
        const analytics = await setup();
        analytics.initializeAnalytics();
        expect(posthog.init).toHaveBeenCalledTimes(1);
        expect(posthog.init).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            api_host: 'https://eu.i.posthog.com', cookieless_mode: 'always', person_profiles: 'never',
            autocapture: false, capture_pageview: false, capture_pageleave: false,
            capture_exceptions: false, capture_dead_clicks: false,
            disable_session_recording: true, capture_performance: false, enable_heatmaps: false,
        }));
        const config = vi.mocked(posthog.init).mock.calls[0][1]!;
        expect(config).not.toHaveProperty('debug');
        expect(config).not.toHaveProperty('opt_out_capturing_by_default');
        expect(posthog.capture).not.toHaveBeenCalled();
    });

    it('removes user data and SDK URL/identity properties at the outgoing event boundary', async () => {
        await setup();
        const hook = vi.mocked(posthog.init).mock.calls[0][1]!.before_send;
        if (typeof hook !== 'function') throw new Error('Expected a privacy filter');
        const outgoing = hook({
            event: 'tag_pdf_export', uuid: 'event-only-uuid', timestamp: new Date(0),
            properties: {
                token: 'public-project-token', distinct_id: 'persistent-user-id',
                $host: 'example.org',
                $device_id: 'device-id', $session_id: 'session-id',
                $current_url: 'https://example.org/?email=private@example.org',
                $referrer: 'https://example.org/private', email: 'private@example.org',
                ip: '192.0.2.1', projectId: 'private-id', projectName: 'private title',
                content: 'Private greeting', gifts: ['Private gift'], localStorage: 'private',
            },
            $set: { email: 'private@example.org' },
        });
        expect(outgoing).toEqual({
            event: 'tag_pdf_export', uuid: 'event-only-uuid', timestamp: new Date(0),
            properties: { token: 'public-project-token', distinct_id: '$posthog_cookieless',
                $cookieless_mode: true, $process_person_profile: false, $host: 'example.org' },
        });
        for (const event of ['analytics_test', '$pageview', '$autocapture', '$snapshot', '$identify', '$exception', '$dead_click']) {
            expect(hook({ event, uuid: 'event-uuid', properties: {} })).toBeNull();
        }
    });

    it.each([
        ['editor', 'tag_editor_open'], ['editor/postcards', 'card_editor_open'], ['ideas/gifts', 'gift_catalog_open'],
    ])('counts an actual visit to %s once, including repeated render/StrictMode effects', async (route, event) => {
        const { createSectionTracker } = await setup();
        const tracker = createSectionTracker('home');
        tracker.navigate(route);
        expect(posthog.capture).not.toHaveBeenCalled(); // navigation intent is not a mount
        tracker.opened('home');
        tracker.opened(route);
        tracker.opened(route);
        tracker.navigate(route); // the matching hashchange is not another visit
        tracker.opened(route);
        expect(posthog.capture).toHaveBeenCalledExactlyOnceWith(event);
        tracker.navigate('about');
        tracker.navigate(route);
        tracker.opened(route);
        expect(posthog.capture).toHaveBeenCalledTimes(2);
    });

    it.each(['editor', 'editor/postcards'])('excludes restored %s until the visitor continues', async route => {
        const { createSectionTracker } = await setup();
        const tracker = createSectionTracker(route);
        tracker.opened(route);
        tracker.opened(route);
        expect(posthog.capture).not.toHaveBeenCalled();
        tracker.continueEditor();
        tracker.opened(route);
        tracker.opened(route);
        expect(posthog.capture).toHaveBeenCalledTimes(1);
    });

    it('counts a direct gift catalogue visit, without counting unrelated sections', async () => {
        const { createSectionTracker } = await setup();
        const tracker = createSectionTracker('ideas/gifts');
        tracker.opened('ideas/gifts');
        tracker.opened('ideas/gifts');
        tracker.navigate('about');
        tracker.opened('about');
        expect(posthog.capture).toHaveBeenCalledExactlyOnceWith('gift_catalog_open');
    });

    it.each(['tag_pdf_export', 'card_pdf_export', 'gift_list_export'] as const)('counts %s after download completion and counts repeat exports', async event => {
        const { trackPdfDownload } = await setup();
        let complete!: () => void;
        const operation = trackPdfDownload(event, () => new Promise<void>(resolve => { complete = resolve; }));
        expect(posthog.capture).not.toHaveBeenCalled();
        complete();
        await operation;
        expect(posthog.capture).toHaveBeenCalledExactlyOnceWith(event);
        await trackPdfDownload(event, () => undefined);
        expect(vi.mocked(posthog.capture).mock.calls).toEqual([[event], [event]]);
    });

    it.each(['tag_pdf_export', 'card_pdf_export', 'gift_list_export'] as const)('does not count %s on download failure or cancellation', async event => {
        const { trackPdfDownload } = await setup();
        await expect(trackPdfDownload(event, () => { throw new Error('download failed'); })).rejects.toThrow('download failed');
        await expect(trackPdfDownload(event, () => Promise.reject(new DOMException('Cancelled', 'AbortError')))).rejects.toThrow('Cancelled');
        expect(posthog.capture).not.toHaveBeenCalled();
    });

    it('keeps downloads working if initialization or capture fails', async () => {
        vi.mocked(posthog.init).mockImplementationOnce(() => { throw new Error('SDK blocked'); });
        const analytics = await import('./analytics');
        expect(() => analytics.initializeAnalytics()).not.toThrow();
        await expect(analytics.trackPdfDownload('tag_pdf_export', () => 'download started')).resolves.toBe('download started');
        analytics.initializeAnalytics();
        vi.mocked(posthog.capture).mockImplementation(() => { throw new Error('Network unavailable'); });
        await expect(analytics.trackPdfDownload('card_pdf_export', () => 'download started')).resolves.toBe('download started');
        expect(() => analytics.createSectionTracker('ideas/gifts').opened('ideas/gifts')).not.toThrow();
    });
});
