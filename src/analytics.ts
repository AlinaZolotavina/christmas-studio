import posthog from 'posthog-js';

const events = [
    'tag_editor_open', 'card_editor_open', 'gift_catalog_open',
    'tag_pdf_export', 'card_pdf_export', 'gift_list_export',
] as const;
type AnalyticsEvent = typeof events[number];
type PdfExportEvent = Extract<AnalyticsEvent, `${string}_export`>;
let initialized = false;

/** Analytics failures must never prevent editing or exporting. */
export function initializeAnalytics() {
    if (initialized) return;
    try {
        posthog.init('phc_pHV4XusCXogvzVsbhsyFp6ABbDqhqKHMR22ska99vQuc', {
            api_host: 'https://eu.i.posthog.com',
            cookieless_mode: 'always',
            person_profiles: 'never',
            autocapture: false,
            capture_exceptions: false,
            capture_dead_clicks: false,
            capture_pageview: false,
            capture_pageleave: false,
            disable_session_recording: true,
            capture_performance: false,
            enable_heatmaps: false,
            disable_surveys: true,
            advanced_disable_feature_flags: true,
            before_send: event => {
                if (!event || !events.includes(event.event as AnalyticsEvent)) return null;
                // Only protocol fields survive. Drop URL/referrer, user input,
                // session/device IDs and properties from the SDK or future callers.
                return {
                    event: event.event,
                    timestamp: event.timestamp,
                    uuid: event.uuid,
                    properties: {
                        token: event.properties.token,
                        distinct_id: '$posthog_cookieless',
                        $cookieless_mode: true,
                        $process_person_profile: false,
                        // Required by PostHog's cookieless hash pipeline; no path or query.
                        $host: event.properties.$host,
                    },
                };
            },
        });
        initialized = true;
    } catch { /* Analytics is optional, including when blocked by the browser. */ }
}

function capture(event: AnalyticsEvent) {
    if (!initialized) return;
    try { posthog.capture(event); } catch { /* No user-facing analytics errors. */ }
}

const sectionEvents: Record<string, AnalyticsEvent> = {
    editor: 'tag_editor_open',
    'editor/postcards': 'card_editor_open',
    'ideas/gifts': 'gift_catalog_open',
};

/** In-memory visits; automatically restored editor routes deliberately do not count. */
export function createSectionTracker(initialRoute: string) {
    let route = initialRoute;
    let eligible = initialRoute === 'ideas/gifts';
    let opened = false;
    return {
        navigate(next: string) {
            if (next === route) return;
            route = next;
            eligible = true;
            opened = false;
        },
        continueEditor() { eligible = true; },
        opened(section: string) {
            if (section !== route || !eligible || opened || !sectionEvents[section]) return;
            opened = true;
            capture(sectionEvents[section]);
        },
    };
}

/** Called after generation and cancellation checks, with the actual download action. */
export async function trackPdfDownload<T>(event: PdfExportEvent, download: () => T | Promise<T>): Promise<T> {
    const result = await download();
    capture(event);
    return result;
}
