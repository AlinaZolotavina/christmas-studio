import { t } from '../../i18n';
import type { TourStep } from '../onboarding/steps';
export const POSTCARD_TOUR_KEY = 'christmas-studio:postcards:tour-offered';
export const postcardTourSteps: TourStep[] = [
    { target: '.inspector-tabs, .mobile-dock', title: t("onboarding.postcards.content.title"), paragraphs: [t("onboarding.postcards.content.edit"), t("onboarding.postcards.content.move")] },
    { target: '[data-tab="background"], .mobile-dock', title: t("onboarding.postcards.background.title"), paragraphs: [t("onboarding.postcards.background.edit"), t("onboarding.postcards.background.format")] },
    { target: '[data-tab="layers"], .mobile-dock', title: t("onboarding.postcards.layers.title"), paragraphs: [t("onboarding.postcards.layers.actions"), t("onboarding.postcards.layers.undo")] },
    { target: '.thumbnail-strip, [data-tab="cards"]', title: t("onboarding.postcards.cards.title"), paragraphs: [t("onboarding.postcards.cards.count"), t("onboarding.postcards.cards.reorder")] },
    { target: '.inspector-footer, [data-tab="export"]', title: t("onboarding.postcards.export.title"), paragraphs: [t("onboarding.postcards.export.validation"), t("onboarding.postcards.export.formats")] },
];
