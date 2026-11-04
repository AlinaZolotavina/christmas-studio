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

function HelpStepIcon({ step }: { step: keyof typeof helpStepArtwork }) {
  const artwork = helpStepArtwork[step];
  return <img className="guide-step__icon" src={assetUrl(artwork.src)} width={44} height={44} alt="" aria-hidden="true" draggable={false} />;
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
  const reportWithDescription = `${description.trim() ? `Описание проблемы:\n${description.trim()}\n\n` : ''}${report}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(reportWithDescription); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };
  const requestClose = () => { if (description.trim() && !copied) setConfirmClose('close'); else onClose(); };
  const startTour = () => { if (description.trim() && !copied) setConfirmClose('tour'); else { onClose(); onStartTour(); } };
  if (confirmClose) return <Modal title="Закрыть описание проблемы?" onClose={() => setConfirmClose(null)} footer={<><Button variant="secondary" onClick={() => setConfirmClose(null)}>Продолжить описание</Button><Button onClick={() => { onClose(); if (confirmClose === 'tour') onStartTour(); }}>Закрыть без копирования</Button></>}><p className="muted">Введённое описание ещё не скопировано и исчезнет после закрытия. Можно вернуться и скопировать его вместе с отчётом.</p></Modal>;
  return <Modal className="help-dialog" title="Как пользоваться редактором" onClose={requestClose} wide footer={tab === 'support' ? <><Button variant="secondary" onClick={() => setTab('guide')}>Назад к справке</Button><Button variant="quiet" onClick={requestClose}>Вернуться к творчеству</Button></> : <><Button variant="quiet" onClick={requestClose}>Вернуться к творчеству</Button><Button onClick={startTour}><Sparkles size={16} /> Пройти тур</Button></>}><div className="help-tabs" role="tablist" aria-label="Разделы справки"><button role="tab" aria-selected={tab === 'guide'} onClick={() => setTab('guide')}>Начало работы</button><button role="tab" aria-selected={tab === 'faq'} onClick={() => setTab('faq')}>Частые вопросы</button><button role="tab" aria-selected={tab === 'support'} onClick={() => setTab('support')}>Помощь</button></div>
    {tab === 'guide' && <div className="help-guide"><h3>{content.title}</h3><ol className="guide-steps">{content.steps.map(step => <li key={step.icon}><HelpStepIcon step={step.icon} /><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol><section className="help-shortcuts" aria-labelledby="help-shortcuts-title"><h4 id="help-shortcuts-title">Полезные сочетания клавиш:</h4><div className="help-shortcuts__items"><div><span>Отменить действие</span><kbd>Ctrl / ⌘ + Z</kbd></div><div><span>Повторить действие</span><kbd>Ctrl / ⌘ + Shift + Z</kbd></div><div><span>Редактировать текст</span><kbd>Двойной клик</kbd></div></div></section></div>}
    {tab === 'faq' && <div className="faq-list">{content.questions.map((question, index) => <details key={question.title} open={index === 0}><summary>{question.icon === 'storage' ? <ShieldCheck size={17} /> : question.icon === 'print' ? <Printer size={17} /> : <HelpCircle size={17} />}{question.title}</summary><p>{question.text}</p></details>)}</div>}
    {tab === 'support' && <div className="support-panel"><p className="muted">Расскажите, что произошло. Можно скопировать описание вместе с техническим отчётом и приложить к обращению.</p><Field label="Описание проблемы"><textarea aria-label="Описание проблемы" value={description} onChange={(event) => { setDescription(event.target.value); setCopied(false); }} placeholder="Что вы делали, что ожидали и что произошло?" rows={4} maxLength={10000} /></Field><div className="report-heading"><h3>Технический отчёт</h3><span><ShieldCheck size={13} />{content.reportLabel}</span></div><pre className="technical-report">{report}</pre><div className="support-actions"><Button onClick={() => void copy()}><Clipboard size={16} />{copied ? 'Скопировано' : 'Скопировать описание и отчёт'}{copied && <Check size={14} />}</Button>{validIssuesUrl ? <a className="button button--secondary" href={validIssuesUrl} target="_blank" rel="noopener noreferrer">Открыть GitHub Issues <ExternalLink size={15} /></a> : <><Button variant="secondary" disabled><ExternalLink size={15} /> GitHub Issues недоступны</Button><p className="field__hint">Адрес обращений для этой мастерской пока не настроен. Технический отчёт можно скопировать.</p></>}</div>{copyError && <Field label="Выделите и скопируйте текст вручную"><textarea value={reportWithDescription} readOnly onFocus={(event) => event.target.select()} rows={6} /></Field>}<p className="support-privacy">Обращение не отправляется автоматически. Вы сами решаете, какую информацию передать.</p></div>}
    {tab === 'guide' && <button className="text-link help-support-link" onClick={() => setTab('support')}>Нужна помощь? <ArrowRight size={15} /></button>}
  </Modal>;
}
