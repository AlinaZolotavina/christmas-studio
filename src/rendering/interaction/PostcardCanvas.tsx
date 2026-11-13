import { t } from '../../i18n';
import type { PostcardCommand } from '../../domain/postcards/commands';
import type { Postcard, PostcardSelection } from '../../domain/postcards/types';
import { getPostcardSize } from '../../domain/postcards/types';
import { validatePostcard } from '../../application/export/postcardValidation';
import { getPostcardFontState } from '../postcard-fonts';
import { PostcardSvg } from '../PostcardSvg';
import { SceneCanvas, type CanvasAdapter, type CanvasIssue } from './SceneCanvas';
export interface PostcardCanvasProps {
    postcard: Postcard;
    selection: PostcardSelection;
    onSelectionChange(selection: PostcardSelection): void;
    onCommit(command: PostcardCommand): unknown;
    fitKey?: string | number;
}
export function PostcardCanvas({ postcard, selection, onSelectionChange, onCommit, fitKey }: PostcardCanvasProps) {
    const adapter: CanvasAdapter<Postcard, PostcardSelection> = {
        id: value => value.id, size: getPostcardSize, key: value => value ?? '', backgroundSelection: null, cycleOnClick: false,
        label: t("editor.common.postcardCanvas"),
        deleteLabel: t('editor.postcards.delete'),
        elements: value => value.elements.map(element => ({ key: element.id, selection: element.id, box: element, rotation: element.rotation, locked: element.locked, deleteAction: true, resize: element.type === 'text' ? 'free' : 'aspect', rotationStep: 15, text: element.type === 'text' ? getPostcardFontState(element).text : undefined })),
        transform(value, elementId, patch) {
            const element = value.elements.find(item => item.id === elementId);
            if (!element || element.locked)
                return value;
            return { ...value, elements: value.elements.map(item => item.id === elementId ? { ...item, ...patch } : item) };
        },
        commit(value, elementId) {
            const element = value.elements.find(item => item.id === elementId);
            if (element && !element.locked)
                onCommit({ type: 'update-element', postcardId: postcard.id, elementId: element.id, patch: { x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation } });
        },
        updateText(elementId, content) {
            const element = postcard.elements.find(item => item.id === elementId);
            if (element?.type === 'text' && !element.locked)
                onCommit({ type: 'update-element', postcardId: postcard.id, elementId: element.id, patch: { content } });
        },
        remove(elementId) {
            const element = postcard.elements.find(item => item.id === elementId);
            if (element && !element.locked) {
                onCommit({ type: 'remove-element', postcardId: postcard.id, elementId: element.id });
                onSelectionChange(null);
            }
        },
        render: value => <PostcardSvg postcard={value} quality="print" idPrefix="editable-postcard"/>,
        issues(value) {
            const issues = validatePostcard(value);
            return value.elements.flatMap(element => {
                const found = issues.filter(issue => issue.elementId === element.id);
                return found.length ? [{ key: element.id, kind: element.id, box: element, severity: found.some(issue => issue.severity === 'error') ? 'error' : 'warning', message: found.map(issue => issue.message).join(' ') } as CanvasIssue] : [];
            });
        },
    };
    return <SceneCanvas document={postcard} selection={selection} onSelectionChange={onSelectionChange} adapter={adapter} fitKey={fitKey}/>;
}
export default PostcardCanvas;
