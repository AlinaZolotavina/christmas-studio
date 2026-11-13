import { useEffect } from 'react';
import type { createSectionTracker } from '../analytics';

/** Mount alongside the section, inside its Suspense boundary when applicable. */
export function SectionAnalytics({ section, tracker }: { section: string; tracker: ReturnType<typeof createSectionTracker> }) {
    useEffect(() => { tracker.opened(section); });
    return null;
}
