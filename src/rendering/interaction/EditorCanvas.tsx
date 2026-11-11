import { t } from '../../i18n';
import type { Command } from '../../domain/commands';
import type { Card, Selection } from '../../domain/types';
import { holeDiameter, isHoleInside } from '../../domain/geometry';
import { validateCard } from '../../domain/validation';
import { layoutText } from '../text';
import { CardSvg } from '../CardSvg';
import { SceneCanvas, type CanvasAdapter, type CanvasIssue } from './SceneCanvas';
import type { CanvasElement } from './scene-interaction';
interface Props {
    card: Card;
    selection: Selection;
    onSelectionChange: (selection: Selection) => void;
    onCommit: (command: Command) => unknown;
    fitKey?: string | number;
}
const key = (selection: Selection) => selection.kind === 'decoration' ? `decoration/${selection.decorationId}` : selection.kind;
/** The v1 tag facade retains its commands and historical interaction policies. */
export function EditorCanvas({ card, selection, onSelectionChange, onCommit, fitKey }: Props) {
    const adapter: CanvasAdapter<Card, Selection> = {
        id: value => value.id, size: value => value, key, backgroundSelection: { kind: 'card' }, cycleOnClick: true,
        label: t("editor.common.tagCanvas"),
        elements(value) {
            const elements: (CanvasElement<Selection> & {
                text?: Card['text'];
            })[] = value.decorations.map(item => ({ key: `decoration/${item.id}`, selection: { kind: 'decoration', decorationId: item.id }, box: item, rotation: 0, locked: false, resize: 'tag-decoration', maxSize: 20, deleteAction: true }));
            elements.push({ key: 'illustration', selection: { kind: 'illustration' }, box: value.illustration, rotation: value.illustration.rotation, locked: false, resize: 'aspect', rotationStep: 0, shiftRotationStep: 15 });
            elements.push({ key: 'text', selection: { kind: 'text' }, box: value.text, rotation: 0, locked: false, resize: 'free', text: value.text });
            if (value.hole) {
                const d = holeDiameter(value);
                elements.push({ key: 'hole', selection: { kind: 'hole' }, box: { x: value.hole.x - d / 2, y: value.hole.y - d / 2, width: d, height: d }, rotation: 0, locked: false, resize: 'none', hitPadding: 0.8, hitShape: 'circle', snapReference: false });
            }
            return elements;
        },
        transform(value, chosen, patch) {
            if (chosen.kind === 'text')
                return { ...value, text: { ...value.text, ...patch } };
            if (chosen.kind === 'illustration')
                return { ...value, illustration: { ...value.illustration, ...patch } };
            if (chosen.kind === 'decoration')
                return { ...value, decorations: value.decorations.map(item => item.id === chosen.decorationId ? { ...item, ...patch } : item) };
            if (chosen.kind === 'hole' && value.hole) {
                const d = holeDiameter(value), hole = { x: patch.x !== undefined ? patch.x + d / 2 : value.hole.x, y: patch.y !== undefined ? patch.y + d / 2 : value.hole.y };
                return isHoleInside(value, hole) ? { ...value, hole } : value;
            }
            return value;
        },
        commit(value, chosen) {
            if (chosen.kind === 'text')
                onCommit({ type: 'update-text', cardId: card.id, patch: { x: value.text.x, y: value.text.y, width: value.text.width, height: value.text.height } });
            if (chosen.kind === 'illustration')
                onCommit({ type: 'update-illustration', cardId: card.id, patch: value.illustration });
            if (chosen.kind === 'decoration') {
                const item = value.decorations.find(item => item.id === chosen.decorationId);
                if (item)
                    onCommit({ type: 'update-decoration', cardId: card.id, decorationId: item.id, patch: item });
            }
            if (chosen.kind === 'hole' && value.hole)
                onCommit({ type: 'move-hole', cardId: card.id, patch: value.hole });
        },
        updateText(chosen, content) { if (chosen.kind === 'text')
            onCommit({ type: 'update-text', cardId: card.id, patch: { content } }); },
        remove(chosen) { if (chosen.kind === 'decoration' && chosen.decorationId) {
            onCommit({ type: 'remove-decoration', cardId: card.id, decorationId: chosen.decorationId });
            onSelectionChange({ kind: 'card' });
        } },
        render: value => <CardSvg card={value} idPrefix="editable"/>,
        issues(value) {
            const issues = validateCard(value, { textOverflow: layoutText(value.text).overflow });
            return (['text', 'illustration', 'decoration'] as const).flatMap(kind => {
                const found = issues.filter(issue => issue.element === kind);
                const box = kind === 'text' ? value.text : kind === 'illustration' ? value.illustration : value.decorations.find(item => item.id === selection.decorationId) ?? value.decorations[0];
                return found.length && box ? [{ key: kind, kind, box, severity: found.some(issue => issue.severity === 'error') ? 'error' : 'warning', message: found.map(issue => issue.message).join(' ') } as CanvasIssue] : [];
            });
        },
    };
    return <SceneCanvas document={card} selection={selection} onSelectionChange={onSelectionChange} adapter={adapter} fitKey={fitKey}/>;
}
export default EditorCanvas;
