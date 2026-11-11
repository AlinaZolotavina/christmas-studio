import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useState } from 'react';
import { ArrowRight, Check, Clipboard, ExternalLink, HelpCircle, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Field } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import type { ValidationIssue } from '../../domain/types';
import { buildTechnicalReport, getIssuesUrl } from './technicalReport';
import packageInfo from '../../../package.json';
import './help.css';
import { assetUrl } from '../../content/assets';
import { helpStepArtwork } from '../../data/site-art';
import { helpContent } from './helpContent';
function HelpStepIcon({ step }: {
    step: keyof typeof helpStepArtwork;
}) {
    const artwork = helpStepArtwork[step];
    return <img className="guide-step__icon" src={assetUrl(artwork.src)} width={44} height={44} alt="" aria-hidden="true" draggable={false}/>;
}
export interface HelpDialogProps {
    product?: 'tags' | 'postcards';
    saveStatus: 'loading' | 'saving' | 'saved' | 'error';
    onClose: () => void;
    onStartTour: () => void;
    issues?: readonly Pick<ValidationIssue, 'severity'>[];
}
export function HelpDialog({ product = 'tags', saveStatus, onClose, onStartTour, issues = [] }: HelpDialogProps) {
    const content = helpContent[product];
    const [tab, setTab] = useState<'guide' | 'faq' | 'support'>('guide');
    const [description, setDescription] = useState('');
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const [confirmClose, setConfirmClose] = useState<'close' | 'tour' | null>(null);
    const validIssuesUrl = getIssuesUrl(import.meta.env.VITE_GITHUB_ISSUES_URL);
    const currentIssues = issues;
    const report = buildTechnicalReport({ appVersion: packageInfo.version, browser: navigator.userAgent, storageStatus: saveStatus, errorCount: currentIssues.filter(issue => issue.severity === 'error').length, warningCount: currentIssues.filter(issue => issue.severity === 'warning').length });
    const reportWithDescription = description.trim() ? t("help.common.reportDescription", { description: description.trim(), report }) : report;
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(reportWithDescription);
            setCopied(true);
            setCopyError(false);
        }
        catch {
            setCopyError(true);
        }
    };
    const requestClose = () => { if (description.trim() && !copied)
        setConfirmClose('close');
    else
        onClose(); };
    const startTour = () => { if (description.trim() && !copied)
        setConfirmClose('tour');
    else {
        onClose();
        onStartTour();
    } };
    if (confirmClose)
        return <Modal title={t("help.common.closeDescriptionTitle")} onClose={() => setConfirmClose(null)} footer={<><Button variant="secondary" onClick={() => setConfirmClose(null)}>{t("help.common.continueDescription")}</Button><Button onClick={() => { onClose(); if (confirmClose === 'tour')
            onStartTour(); }}>{t("help.common.closeWithoutCopy")}</Button></>}><p className="muted">{t("help.common.unsavedDescription")}</p></Modal>;
    return <Modal className="help-dialog" title={t("help.common.guideTitle")} onClose={requestClose} wide footer={tab === 'support' ? <><Button variant="secondary" onClick={() => setTab('guide')}>{t("help.common.backToHelp")}</Button><Button variant="quiet" onClick={requestClose}>{t("help.common.returnToEditor")}</Button></> : <><Button variant="quiet" onClick={requestClose}>{t("help.common.returnToEditor")}</Button><Button onClick={startTour}><Sparkles size={16}/>{t("help.common.startTour")}</Button></>}><div className="help-tabs" role="tablist" aria-label={t("help.common.tabs.label")}><button role="tab" aria-selected={tab === 'guide'} onClick={() => setTab('guide')}>{t("help.common.tabs.start")}</button><button role="tab" aria-selected={tab === 'faq'} onClick={() => setTab('faq')}>{t("help.common.tabs.faq")}</button><button role="tab" aria-selected={tab === 'support'} onClick={() => setTab('support')}>{t("help.common.tabs.support")}</button></div>
    {tab === 'guide' && <div className="help-guide"><h3>{content.title}</h3><ol className="guide-steps">{content.steps.map(step => <li key={step.icon}><HelpStepIcon step={step.icon}/><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol><section className="help-shortcuts" aria-labelledby="help-shortcuts-title"><h4 id="help-shortcuts-title">{t("help.common.shortcuts.title")}</h4><div className="help-shortcuts__items"><div>{rich("help.common.shortcuts.undo", {}, { span: <span /> })}<kbd>Ctrl / ⌘ + Z</kbd></div><div>{rich("help.common.shortcuts.redo", {}, { span: <span /> })}<kbd>Ctrl / ⌘ + Shift + Z</kbd></div><div>{rich("help.common.shortcuts.editText", {}, { span: <span /> })}<kbd>{t("help.common.shortcuts.doubleClick")}</kbd></div></div></section></div>}
    {tab === 'faq' && <div className="faq-list">{content.questions.map((question, index) => <details key={question.title} open={index === 0}><summary>{question.icon === 'storage' ? <ShieldCheck size={17}/> : question.icon === 'print' ? <Printer size={17}/> : <HelpCircle size={17}/>}{question.title}</summary><p>{question.text}</p></details>)}</div>}
    {tab === 'support' && <div className="support-panel"><p className="muted">{t("help.common.support.intro")}</p><Field label={t("help.common.support.description")}><textarea aria-label={t("help.common.support.description")} value={description} onChange={(event) => { setDescription(event.target.value); setCopied(false); }} placeholder={t("help.common.support.placeholder")} rows={4} maxLength={10000}/></Field><div className="report-heading"><h3>{t("help.common.support.report")}</h3><span><ShieldCheck size={13}/>{content.reportLabel}</span></div><pre className="technical-report">{report}</pre><div className="support-actions"><Button onClick={() => void copy()}><Clipboard size={16}/>{copied ? t("help.common.support.copied") : t("help.common.support.copy")}{copied && <Check size={14}/>}</Button>{validIssuesUrl ? <a className="button button--secondary" href={validIssuesUrl} target="_blank" rel="noopener noreferrer">{t("help.common.support.openIssues")}<ExternalLink size={15}/></a> : <><Button variant="secondary" disabled><ExternalLink size={15}/>{t("help.common.support.issuesUnavailable")}</Button><p className="field__hint">{t("help.common.support.unconfigured")}</p></>}</div>{copyError && <Field label={t("help.common.support.manualCopy")}><textarea value={reportWithDescription} readOnly onFocus={(event) => event.target.select()} rows={6}/></Field>}<p className="support-privacy">{t("help.common.support.privacy")}</p></div>}
    {tab === 'guide' && <button className="text-link help-support-link" onClick={() => setTab('support')}>{t("help.common.support.title")}<ArrowRight size={15}/></button>}
  </Modal>;
}
