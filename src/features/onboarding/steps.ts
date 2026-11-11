import { t } from '../../i18n';
export interface TourStep {
    target: string;
    title: string;
    paragraphs: string[];
}
/** Approved reference copy is stored in tests/fixtures/tour-reference.md. */
export const tourSteps: TourStep[] = [
    {
        target: '.inspector-tabs, .mobile-dock',
        title: t("onboarding.tags.content.title"),
        paragraphs: [
            t("onboarding.tags.content.edit"),
            t("onboarding.tags.content.move"),
        ],
    },
    {
        target: '.inspector, .mobile-dock',
        title: t("onboarding.tags.background.title"),
        paragraphs: [
            t("onboarding.tags.background.edit"),
            t("onboarding.tags.background.mobile"),
        ],
    },
    {
        target: '.thumbnail-strip, .inspector-tabs [data-tab="cards"], .mobile-dock',
        title: t("onboarding.tags.cards.title"),
        paragraphs: [
            t("onboarding.tags.cards.navigation"),
            t("onboarding.tags.cards.applyAll"),
        ],
    },
    {
        target: '.history-controls',
        title: t("onboarding.tags.undo.title"),
        paragraphs: [
            t("onboarding.tags.undo.description"),
            t("onboarding.tags.undo.shortcuts"),
        ],
    },
    {
        target: '.inspector-footer, .inspector-tabs [data-tab="export"], .mobile-dock',
        title: t("onboarding.tags.export.title"),
        paragraphs: [
            t("onboarding.tags.export.open"),
            t("onboarding.tags.export.validation"),
            t("onboarding.tags.export.print"),
        ],
    },
];
