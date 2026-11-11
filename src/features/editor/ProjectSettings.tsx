import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useState } from 'react';
import { Check, Layers2 } from 'lucide-react';
import type { Card, ProjectDocument, Shape } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { Button, Field } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { NumberField } from './Inspector';
export function ProjectSettings({ project, card, onCommand, onClose, onReset }: {
    project: ProjectDocument;
    card: Card;
    onCommand: (command: Command) => OperationResult;
    onClose: () => void;
    onReset?: () => void;
}) {
    const [name, setName] = useState(project.name);
    const [shape, setShape] = useState<Shape>(card.shape);
    const [width, setWidth] = useState(card.width);
    const [height, setHeight] = useState(card.height);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState(false);
    const rename = () => {
        if (name === project.name)
            return true;
        const result = onCommand({ type: 'rename-project', name: name.trim() });
        setError(result.error ?? '');
        return !result.error;
    };
    const finish = () => { if (rename())
        onClose(); };
    const applyGeometry = () => {
        const result = onCommand({ type: 'resize-card', cardId: card.id, scope: 'all', patch: { shape, width, height } });
        setError(result.error ?? '');
        setApplied(!result.error);
    };
    return <Modal title={t("editor.tags.settings.title")} onClose={finish} footer={<Button onClick={finish}>{t("common.done")}<Check size={16}/></Button>}><div className="settings-form">
    <Field label={t("editor.tags.settings.name")}><input aria-label={t("editor.tags.settings.name")} value={name} onChange={event => setName(event.target.value)} onBlur={rename} maxLength={120}/></Field>
    <div className="project-summary"><Layers2 size={22}/><div>{rich("editor.tags.settings.count", { count: project.cardCount }, { strong: <strong /> })}<p>{t("editor.tags.settings.creationHint")}</p></div></div>
    <Field label={t("editor.tags.settings.shape")}><select aria-label={t("editor.tags.settings.shape")} value={shape} onChange={event => { setShape(event.target.value as Shape); setApplied(false); }}><option value="tag">{t("editor.tags.settings.shapes.tag")}</option><option value="rectangle">{t("editor.tags.settings.shapes.rectangle")}</option><option value="square">{t("editor.tags.settings.shapes.square")}</option><option value="circle">{t("editor.tags.settings.shapes.circle")}</option><option value="oval">{t("editor.tags.settings.shapes.oval")}</option></select></Field>
    <div className="number-grid"><NumberField label={shape === 'circle' ? t("editor.tags.settings.diameter") : shape === 'square' ? t("editor.tags.settings.side") : t("editor.tags.settings.width")} value={width / 10} min={0.5} max={29.7} unit={t("editor.tags.settings.centimeters")} onCommit={value => { setWidth(value * 10); setApplied(false); }}/>{shape !== 'circle' && shape !== 'square' && <NumberField label={t("editor.tags.settings.height")} value={height / 10} min={0.5} max={29.7} unit={t("editor.tags.settings.centimeters")} onCommit={value => { setHeight(value * 10); setApplied(false); }}/>}</div>
    <p className="geometry-notice" role="note">{t("editor.tags.settings.resizeHint", { count: project.cardCount })}</p>
    <Button variant="secondary" onClick={applyGeometry}>{t("editor.tags.settings.applyAll")}</Button>
    {applied && <p className="field__hint" role="status">{t("editor.tags.settings.updated")}</p>}
    {error && <p className="project-settings-error" role="alert">{error}</p>}
    <div className="toggle-row"><div><h3>{t("editor.tags.settings.hole.title")}</h3><p className="field__hint">{t("editor.tags.settings.hole.toggleAll")}</p></div><label className="toggle"><input type="checkbox" aria-label={t("editor.tags.settings.hole.label")} checked={project.holeEnabled} onChange={event => onCommand({ type: 'set-project-hole', enabled: event.target.checked })}/><span /></label></div>
    <p className="muted">{t("editor.tags.settings.individualHint")}</p>
    {onReset && <button type="button" className="project-reset-link" onClick={onReset}>{t("editor.tags.settings.reset")}</button>}
  </div></Modal>;
}
