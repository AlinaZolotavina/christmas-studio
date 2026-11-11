import { t } from '../../i18n';
type Step = {
    icon: 'template' | 'edit' | 'check' | 'print';
    title: string;
    text: string;
};
type Question = {
    icon?: 'storage' | 'print';
    title: string;
    text: string;
};
interface HelpContent {
    title: string;
    reportLabel: string;
    steps: Step[];
    questions: Question[];
}
const customImageQuestion: Question = { title: t("help.common.faq.upload.question"), text: t("help.common.faq.upload.answer") };
export const helpContent: Record<'tags' | 'postcards', HelpContent> = {
    tags: {
        title: t("help.tags.title"),
        reportLabel: t("help.tags.reportPrivacy"),
        steps: [
            { icon: 'template', title: t("help.tags.steps.choose.title"), text: t("help.tags.steps.choose.description") },
            { icon: 'edit', title: t("help.tags.steps.edit.title"), text: t("help.tags.steps.edit.description") },
            { icon: 'check', title: t("help.common.steps.check.title"), text: t("help.tags.steps.check.description") },
            { icon: 'print', title: t("help.common.steps.download.title"), text: t("help.tags.steps.download.description") },
        ],
        questions: [
            { icon: 'storage', title: t("help.common.faq.storage.question"), text: t("help.tags.faq.storage.answer") },
            { icon: 'print', title: t("help.common.faq.printSize.question"), text: t("help.tags.faq.printSize.answer") },
            { title: t("help.tags.faq.download.question"), text: t("help.tags.faq.download.answer") },
            { title: t("help.common.faq.textOverflow.question"), text: t("help.tags.faq.textOverflow.answer") },
            customImageQuestion,
            { title: t("help.tags.faq.cardCount.question"), text: t("help.tags.faq.cardCount.answer") },
            { title: t("help.tags.faq.import.question"), text: t("help.tags.faq.import.answer") },
            { title: t("help.tags.faq.applyAll.question"), text: t("help.tags.faq.applyAll.answer") },
            { title: t("help.common.faq.save.question"), text: t("help.tags.faq.save.answer") },
        ],
    },
    postcards: {
        title: t("help.postcards.title"),
        reportLabel: t("help.postcards.reportPrivacy"),
        steps: [
            { icon: 'template', title: t("help.postcards.steps.choose.title"), text: t("help.postcards.steps.choose.description") },
            { icon: 'edit', title: t("help.postcards.steps.edit.title"), text: t("help.postcards.steps.edit.description") },
            { icon: 'check', title: t("help.common.steps.check.title"), text: t("help.postcards.steps.check.description") },
            { icon: 'print', title: t("help.common.steps.download.title"), text: t("help.postcards.steps.download.description") },
        ],
        questions: [
            { icon: 'storage', title: t("help.common.faq.storage.question"), text: t("help.postcards.faq.storage.answer") },
            { icon: 'print', title: t("help.common.faq.printSize.question"), text: t("help.postcards.faq.printSize.answer") },
            { title: t("help.postcards.faq.download.question"), text: t("help.postcards.faq.download.answer") },
            { title: t("help.common.faq.textOverflow.question"), text: t("help.postcards.faq.textOverflow.answer") },
            { title: t("help.postcards.faq.lettering.question"), text: t("help.postcards.faq.lettering.answer") },
            { title: t("help.postcards.faq.format.question"), text: t("help.postcards.faq.format.answer") },
            { title: t("help.postcards.faq.layers.question"), text: t("help.postcards.faq.layers.answer") },
            customImageQuestion,
            { title: t("help.postcards.faq.cardCount.question"), text: t("help.postcards.faq.cardCount.answer") },
            { title: t("help.postcards.faq.import.question"), text: t("help.postcards.faq.import.answer") },
            { title: t("help.postcards.faq.applyAll.question"), text: t("help.postcards.faq.applyAll.answer") },
            { title: t("help.common.faq.save.question"), text: t("help.postcards.faq.save.answer") },
        ],
    },
};
