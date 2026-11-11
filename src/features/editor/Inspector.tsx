import { localized, t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, Circle, ImagePlus, Italic, Plus, Search, Shapes, Star, Trash2, X } from 'lucide-react';
import type { Background, Box, Card, Decoration, ProjectDocument, Scope, Selection, Shape, TextElement } from '../../domain/types';
import { MAX_DECORATIONS, MAX_TEXT_LENGTH } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { assetUrl, getAsset } from '../../content/assets';
import { fonts, getFont } from '../../content/fonts';
import { fitTextBox } from '../../rendering/text';
import { categories, getAvailableMotifs, images, searchImages } from '../../data/images';
import { Button, ColorPalette, Field, IconButton } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import type { InspectorTab } from './StudioShell';
import './inspector.css';
interface Props {
    project: ProjectDocument;
    card: Card;
    tab: InspectorTab;
    selection: Selection;
    onSelect: (selection: Selection) => void;
    onCommand: (command: Command) => OperationResult;
    recentColors: string[];
    onRecentColor: (color: string) => void;
}
type GeometryRequest = {
    shape: Shape;
    width: number;
    height: number;
    scope: Scope;
};
const shapeLabels: Record<Shape, string> = { tag: t("editor.tags.inspector.shapes.tag"), rectangle: t("editor.tags.inspector.shapes.rectangle"), square: t("editor.tags.inspector.shapes.square"), circle: t("editor.tags.inspector.shapes.circle"), oval: t("editor.tags.inspector.shapes.oval") };
const shapeList: Shape[] = ['tag', 'rectangle', 'square', 'circle', 'oval'];
const baseColors = ['#315C4C', '#923C42', '#C99C56', '#E8D8BE', '#D9E7EC', '#FFFFFF', '#262B28'];
/** Numeric edits commit once on blur/Enter, preserving meaningful document history. */
export function NumberField({ label, value, onCommit, unit, min, max, step = 0.1 }: {
    label: string;
    value: number;
    onCommit: (value: number) => void;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
}) {
    const display = (number: number) => Number(number.toFixed(2)).toString();
    const [draft, setDraft] = useState(display(value));
    const edited = useRef(false);
    useEffect(() => { setDraft(display(value)); edited.current = false; }, [value]);
    const commit = () => {
        if (!edited.current)
            return;
        edited.current = false;
        const parsed = Number(draft.replace(',', '.'));
        if (!draft.trim() || !Number.isFinite(parsed)) {
            setDraft(display(value));
            return;
        }
        const next = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, parsed));
        setDraft(display(next));
        if (next !== value)
            onCommit(next);
    };
    return <Field label={label}><div className="input-unit"><input type="text" inputMode="decimal" aria-label={label} value={draft} onChange={(event) => { edited.current = true; setDraft(event.target.value); }} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter')
        event.currentTarget.blur(); if (event.key === 'Escape') {
        edited.current = false;
        setDraft(display(value));
        event.stopPropagation();
    } if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        edited.current = false;
        const next = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, value + (event.key === 'ArrowUp' ? step : -step)));
        onCommit(Number(next.toFixed(2)));
    } }}/>{unit && <span>{unit}</span>}</div></Field>;
}
function BoxFields({ box, onChange, lockRatio = false, max }: {
    box: Box;
    onChange: (patch: Partial<Box>) => void;
    lockRatio?: boolean;
    max?: number;
}) {
    const size = (key: 'width' | 'height', value: number) => {
        const mm = value * 10;
        if (lockRatio)
            onChange({ [key]: mm, [key === 'width' ? 'height' : 'width']: (key === 'width' ? box.height / box.width : box.width / box.height) * mm });
        else
            onChange({ [key]: mm });
    };
    return <div className="number-grid"><NumberField label={t("editor.tags.inspector.horizontal")} value={box.x / 10} unit={t("editor.tags.inspector.centimeters")} onCommit={(value) => onChange({ x: value * 10 })}/><NumberField label={t("editor.tags.inspector.vertical")} value={box.y / 10} unit={t("editor.tags.inspector.centimeters")} onCommit={(value) => onChange({ y: value * 10 })}/><NumberField label={t("editor.tags.inspector.width")} value={box.width / 10} unit={t("editor.tags.inspector.centimeters")} min={0.05} max={max} onCommit={(value) => size('width', value)}/><NumberField label={t("editor.tags.inspector.height")} value={box.height / 10} unit={t("editor.tags.inspector.centimeters")} min={0.05} max={max} onCommit={(value) => size('height', value)}/></div>;
}
function ColorField({ label, value, onChange, recentColors, optional = false }: {
    label: string;
    value: string | null;
    onChange: (color: string | null) => void;
    recentColors: string[];
    optional?: boolean;
}) {
    return <div className="color-field"><div className="color-field__heading"><h3>{label}</h3>{optional && <label className="small-switch"><input type="checkbox" checked={value !== null} onChange={(event) => onChange(event.target.checked ? '#C99C56' : null)}/>{rich("editor.tags.inspector.enable", {}, { span: <span /> })}</label>}</div>{value !== null && <><ColorPalette value={value} onChange={onChange} colors={baseColors}/><div className="color-value"><input type="color" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}/><span>{value.toUpperCase()}</span></div>{recentColors.length > 0 && <div className="recent-colors">{rich("editor.tags.inspector.recent", {}, { span: <span /> })}<ColorPalette value={value} onChange={onChange} colors={recentColors}/></div>}</>}</div>;
}
export function Inspector({ project, card, tab, selection, onSelect, onCommand, recentColors, onRecentColor }: Props) {
    const [scope, setScope] = useState<Scope>('current');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [geometry, setGeometry] = useState<GeometryRequest | null>(null);
    const [removeType, setRemoveType] = useState<Decoration['type'] | null>(null);
    const selectedDecoration = card.decorations.find((item) => item.id === selection.decorationId);
    const font = getFont(card.text.fontId);
    const send = (command: Command, useScope = true) => {
        const supportsScope = ['update-text', 'update-illustration', 'update-background', 'resize-card', 'add-decoration', 'set-hole', 'apply-decoration-type', 'remove-decoration-type'].includes(command.type);
        const result = onCommand(useScope && supportsScope ? { ...command, scope } as Command : command);
        if (!result.error)
            setScope('current');
        return result;
    };
    const color = (value: string, command: Command) => { const result = send(command); if (!result.error)
        onRecentColor(value); };
    const text = (patch: Partial<TextElement>, useScope = true) => send({ type: 'update-text', cardId: card.id, patch }, useScope);
    const background = (patch: Partial<Background>) => send({ type: 'update-background', cardId: card.id, patch });
    const filteredImages = searchImages(query, { category: category || undefined, subcategory: subcategory || undefined });
    const availableMotifs = useMemo(() => getAvailableMotifs(category || undefined), [category]);
    const requestGeometry = (patch: Partial<Pick<Card, 'shape' | 'width' | 'height'>>) => setGeometry({ shape: patch.shape ?? card.shape, width: patch.width ?? card.width, height: patch.height ?? card.height, scope });
    const decorationStyle = (patch: Partial<Omit<Decoration, 'id' | 'type'>>) => { if (selectedDecoration)
        send({ type: 'update-decoration', cardId: card.id, decorationId: selectedDecoration.id, patch }, false); };
    const typeCount = removeType ? (scope === 'all' ? project.cards : [card]).reduce((total, item) => total + item.decorations.filter((decoration) => decoration.type === removeType).length, 0) : 0;
    return <>
    <div className="inspector-scope">{rich("editor.tags.inspector.applyTo", {}, { span: <span /> })}<div className="scope-control"><button className={scope === 'current' ? 'is-active' : ''} type="button" onClick={() => setScope('current')}>{t("editor.tags.inspector.currentCard")}</button><button className={scope === 'all' ? 'is-active' : ''} type="button" onClick={() => setScope('all')}>{t("editor.tags.inspector.wholeSet")}</button></div>{scope === 'all' && <p className="field__hint">{t("editor.tags.inspector.applyOnce")}</p>}</div>
    {tab === 'text' && <>
      <div className="panel-heading"><h2>{t("editor.tags.inspector.text.title")}</h2></div>
      <Field label={t("editor.tags.inspector.text.content")}><textarea aria-label={t("editor.tags.inspector.text.content")} value={card.text.content} onFocus={() => onSelect({ kind: 'text' })} onChange={(event) => text({ content: event.target.value }, false)} maxLength={MAX_TEXT_LENGTH} rows={3} placeholder={t("editor.tags.inspector.text.placeholder")}/><span className="character-count">{card.text.content.length} / {MAX_TEXT_LENGTH}</span></Field>
      <section className="panel-section"><h3>{t("editor.tags.inspector.text.fontMood")}</h3><div className="font-controls"><select aria-label={t("editor.tags.inspector.text.fontFamily")} value={card.text.fontId} onChange={(event) => { const next = getFont(event.target.value as TextElement['fontId']); text({ fontId: next.id, weight: next.bold ? card.text.weight : 'normal', italic: next.italic ? card.text.italic : false }); }}>{fonts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><NumberField label={t("editor.tags.inspector.text.fontSize")} value={card.text.fontSize} min={6} max={72} unit="pt" step={1} onCommit={(value) => text({ fontSize: value })}/></div>
      <div className="text-fit-control"><Button variant="secondary" onClick={() => { const { x, width, height } = fitTextBox(card.text); text({ x, width, height }, false); }}>{t("editor.tags.inspector.text.fitBox")}</Button><p className="field__hint">{t("editor.tags.inspector.text.fitBoxHint")}</p></div>
      <div className="format-toolbar"><div><IconButton label={t("editor.tags.inspector.text.bold")} disabled={!font.bold} aria-pressed={card.text.weight === 'bold'} className={card.text.weight === 'bold' ? 'is-active' : ''} onClick={() => text({ weight: card.text.weight === 'bold' ? 'normal' : 'bold' })}><Bold size={18}/></IconButton><IconButton label={t("editor.tags.inspector.text.italic")} disabled={!font.italic} aria-pressed={card.text.italic} className={card.text.italic ? 'is-active' : ''} onClick={() => text({ italic: !card.text.italic })}><Italic size={18}/></IconButton></div><div>{([{ align: 'left', icon: AlignLeft }, { align: 'center', icon: AlignCenter }, { align: 'right', icon: AlignRight }] as const).map(({ align, icon: Icon }) => <IconButton key={align} label={t(align === 'left' ? "editor.tags.inspector.text.alignLeft" : align === 'center' ? "editor.tags.inspector.text.alignCenter" : "editor.tags.inspector.text.alignRight")} aria-pressed={card.text.align === align} className={card.text.align === align ? 'is-active' : ''} onClick={() => text({ align })}><Icon size={18}/></IconButton>)}</div></div></section>
      <section className="panel-section"><ColorField label={t("editor.tags.inspector.text.color")} value={card.text.color} recentColors={recentColors} onChange={(value) => { if (value)
            color(value, { type: 'update-text', cardId: card.id, patch: { color: value } }); }}/></section>
      <section className="panel-section"><h3>{t("editor.tags.inspector.text.geometry")}</h3><BoxFields box={card.text} onChange={(patch) => text(patch, false)}/><p className="field__hint inspector-footnote">{t("editor.tags.inspector.text.geometryHint")}</p></section>
    </>}
    {tab === 'illustration' && <>
      <div className="panel-heading"><h2>{t("editor.tags.inspector.image.title")}</h2></div>
      <section className="panel-section image-picker"><h3>{t("editor.tags.inspector.image.choose")}</h3><p className="selected-art-name">{t("editor.tags.inspector.image.current", { assetName: getAsset(card.illustration.assetId).name })}</p>
      <label className="library-search"><Search size={16}/><input aria-label={t("editor.tags.inspector.image.search")} value={query} placeholder={t("editor.tags.inspector.image.searchPlaceholder")} onChange={(event) => setQuery(event.target.value)}/>{query && <button type="button" aria-label={t("editor.tags.inspector.image.clearSearch")} onClick={() => setQuery('')}><X size={14}/></button>}</label>
      <div className="library-filters"><select aria-label={t("editor.tags.inspector.image.category")} value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory(''); }}><option value="">{t("editor.tags.inspector.image.allCategories")}</option>{categories.map((item) => <option key={item.id} value={item.id}>{localized(item.name)}</option>)}</select><select aria-label={t("editor.tags.inspector.image.motif")} value={subcategory} onChange={(event) => setSubcategory(event.target.value)}><option value="">{t("editor.tags.inspector.image.allMotifs")}</option>{availableMotifs.map((item) => <option key={item.id} value={item.id}>{localized(item.name)}</option>)}</select></div>
      <div className="library-result-count">{t("editor.tags.inspector.image.resultCount", { count: filteredImages.length, total: images.length })}</div><div className="image-library">{filteredImages.map((image) => <button key={image.id} type="button" title={localized(image.name)} aria-label={t("editor.tags.inspector.image.replace", { imageName: localized(image.name) })} aria-pressed={card.illustration.assetId === image.id} className={card.illustration.assetId === image.id ? 'is-selected' : ''} onClick={() => { send({ type: 'update-illustration', cardId: card.id, patch: { assetId: image.id } }); onSelect({ kind: 'illustration' }); }}><img src={assetUrl(`art/${image.id}-preview.webp`)} alt="" loading="lazy"/>{card.illustration.assetId === image.id && <span><Check size={12}/></span>}</button>)}</div>{!filteredImages.length && <div className="library-empty"><ImagePlus size={25}/>{rich("editor.tags.inspector.image.noResults", {}, { strong: <strong /> })}<p>{t("editor.tags.inspector.image.noResultsHint")}</p><button type="button" className="text-link" onClick={() => { setQuery(''); setCategory(''); setSubcategory(''); }}>{t("editor.tags.inspector.image.showAll")}</button></div>}
      </section>
      <section className="panel-section"><h3>{t("editor.tags.inspector.image.geometry")}</h3><BoxFields box={card.illustration} lockRatio onChange={(patch) => send({ type: 'update-illustration', cardId: card.id, patch })}/><div className="rotation-field"><NumberField label={t("editor.tags.inspector.image.rotation")} value={card.illustration.rotation} unit="°" min={-360} max={360} step={1} onCommit={(value) => send({ type: 'update-illustration', cardId: card.id, patch: { rotation: value } })}/></div><p className="field__hint inspector-footnote">{t("editor.tags.inspector.image.aspectHint")}</p></section>

    </>}
    {tab === 'background' && <>
      <div className="panel-heading"><h2>{t("editor.tags.inspector.background.title")}</h2></div><Field label={t("editor.tags.inspector.background.type")}><select value={card.background.kind} onChange={(event) => { const kind = event.target.value as Background['kind']; background({ kind, colors: kind === 'solid' ? [card.background.colors[0]] : card.background.colors.length >= 2 ? card.background.colors : [card.background.colors[0], '#FFFFFF'] }); }}><option value="solid">{t("editor.tags.inspector.background.solid")}</option><option value="linear">{t("editor.tags.inspector.background.linear")}</option><option value="radial">{t("editor.tags.inspector.background.radial")}</option></select></Field>
      <section className="panel-section background-colors">{card.background.colors.map((value, index) => <div key={index}><ColorField label={card.background.kind === 'solid' ? t("editor.tags.inspector.background.color") : t("editor.tags.inspector.background.stopColor", { position: index + 1 })} value={value} recentColors={recentColors} onChange={(next) => { if (next) {
            const colors = [...card.background.colors];
            colors[index] = next;
            color(next, { type: 'update-background', cardId: card.id, patch: { colors } });
        } }}/>{card.background.kind !== 'solid' && card.background.colors.length > 2 && <button type="button" className="text-link" onClick={() => background({ colors: card.background.colors.filter((_, position) => position !== index) })}>{t("editor.tags.inspector.background.removeColor")}</button>}</div>)}{card.background.kind !== 'solid' && card.background.colors.length < 3 && <Button variant="secondary" onClick={() => background({ colors: [...card.background.colors, '#D9E7EC'] })}><Plus size={14}/>{t("editor.tags.inspector.background.thirdColor")}</Button>}{card.background.kind === 'linear' && <NumberField label={t("editor.tags.inspector.background.angle")} value={card.background.angle} unit="°" min={0} max={360} step={1} onCommit={(value) => background({ angle: value })}/>}{card.background.kind === 'radial' && <div className="number-grid"><NumberField label={t("editor.tags.inspector.background.centerX")} value={card.background.centerX * 100} unit="%" min={0} max={100} step={1} onCommit={(value) => background({ centerX: value / 100 })}/><NumberField label={t("editor.tags.inspector.background.centerY")} value={card.background.centerY * 100} unit="%" min={0} max={100} step={1} onCommit={(value) => background({ centerY: value / 100 })}/></div>}</section>
      <section className="panel-section"><h3>{t("editor.tags.inspector.background.presets")}</h3><div className="background-presets">{[{ name: t("editor.tags.inspector.background.winterMorning"), colors: ['#E0EAF0', '#FFFFFF'], kind: 'linear' }, { name: t("editor.tags.inspector.background.pineForest"), colors: ['#E8EFE1', '#FCF6E7'], kind: 'linear' }, { name: t("editor.tags.inspector.background.candlelight"), colors: ['#FFF3CD', '#F9E5DE', '#FDF9EE'], kind: 'radial' }].map((preset) => <button key={preset.name} type="button" title={preset.name} aria-label={preset.name} style={{ background: preset.kind === 'radial' ? `radial-gradient(circle,${preset.colors.join(',')})` : `linear-gradient(135deg,${preset.colors.join(',')})` }} onClick={() => background({ kind: preset.kind as Background['kind'], colors: preset.colors, angle: 90, centerX: 0.5, centerY: 0.5 })}/>)}</div></section>
      <section className="panel-section"><h3><Shapes size={16}/>{rich("editor.tags.inspector.decoration.heading", { count: card.decorations.length, maxDecorations: MAX_DECORATIONS }, { span: <span className="count-badge"/> })}</h3><div className="decoration-options"><button type="button" disabled={scope === 'current' && card.decorations.length >= MAX_DECORATIONS} onClick={() => send({ type: 'add-decoration', cardId: card.id, patch: { type: 'circle' } })}><Circle size={23} strokeWidth={1.3}/>{t("editor.tags.inspector.decoration.addCircle")}<Plus size={13}/></button><button type="button" disabled={scope === 'current' && card.decorations.length >= MAX_DECORATIONS} onClick={() => send({ type: 'add-decoration', cardId: card.id, patch: { type: 'star' } })}><Star size={23} strokeWidth={1.3}/>{t("editor.tags.inspector.decoration.addStar")}<Plus size={13}/></button></div>{scope === 'all' && <p className="field__hint inspector-footnote">{t("editor.tags.inspector.decoration.addAllHint")}</p>}<div className="decoration-list">{card.decorations.map((item, index) => <div className={selection.decorationId === item.id ? 'is-selected' : ''} key={item.id}><button type="button" onClick={() => onSelect({ kind: 'decoration', decorationId: item.id })}>{item.type === 'circle' ? <Circle size={14}/> : <Star size={14}/>}<span>{item.type === 'circle' ? t("editor.tags.inspector.shapes.circle") : t("editor.tags.inspector.decoration.star")} {index + 1}</span></button><IconButton label={t(item.type === 'circle' ? "editor.tags.inspector.decoration.removeCircle" : "editor.tags.inspector.decoration.removeStar", { position: index + 1 })} onClick={() => { send({ type: 'remove-decoration', cardId: card.id, decorationId: item.id }, false); if (selection.decorationId === item.id)
            onSelect({ kind: 'card' }); }}><Trash2 size={14}/></IconButton></div>)}</div></section>
      {selectedDecoration && <section className="panel-section decoration-settings"><h3>{t(selectedDecoration.type === 'circle' ? "editor.tags.inspector.decoration.circleSettings" : "editor.tags.inspector.decoration.starSettings")}</h3><BoxFields box={selectedDecoration} max={2} onChange={decorationStyle}/><div className="decoration-colors"><ColorField label={t("editor.tags.inspector.decoration.fill")} optional value={selectedDecoration.fill} recentColors={recentColors} onChange={(value) => { decorationStyle({ fill: value }); if (value)
            onRecentColor(value); }}/><ColorField label={t("editor.tags.inspector.decoration.stroke")} optional value={selectedDecoration.stroke} recentColors={recentColors} onChange={(value) => { decorationStyle({ stroke: value }); if (value)
            onRecentColor(value); }}/></div>{selectedDecoration.stroke && <NumberField label={t("editor.tags.inspector.decoration.strokeWidth")} unit="pt" value={selectedDecoration.strokeWidth} min={0.25} max={3} step={0.25} onCommit={(value) => decorationStyle({ strokeWidth: value })}/>}{selectedDecoration.type === 'star' && <NumberField label={t("editor.tags.inspector.decoration.starPoints")} value={selectedDecoration.points} min={4} max={8} step={1} onCommit={(value) => decorationStyle({ points: Math.round(value) })}/>}<Button variant="secondary" className="full-width" onClick={() => send({ type: 'apply-decoration-type', cardId: card.id, scope, decorationType: selectedDecoration.type, patch: { fill: selectedDecoration.fill, stroke: selectedDecoration.stroke, strokeWidth: selectedDecoration.strokeWidth, points: selectedDecoration.points } })}>{t(selectedDecoration.type === 'circle' ? "editor.tags.inspector.decoration.applyCircles" : "editor.tags.inspector.decoration.applyStars")}</Button><p className="field__hint inspector-footnote">{t("editor.tags.inspector.decoration.applyAllHint")}</p><button type="button" className="text-link danger-link" onClick={() => setRemoveType(selectedDecoration.type)}><Trash2 size={14}/>{t(selectedDecoration.type === 'circle' ? "editor.tags.inspector.decoration.removeCircles" : "editor.tags.inspector.decoration.removeStars")}</button></section>}
    </>}
    {tab === 'card' && <>
      <div className="panel-heading"><h2>{t("editor.tags.inspector.card.title")}</h2></div>
      <section className="panel-section"><h3>{t("editor.tags.inspector.card.geometry")}</h3><div className="shape-options">{shapeList.map((shape) => <button key={shape} type="button" aria-label={shapeLabels[shape]} aria-pressed={card.shape === shape} title={shapeLabels[shape]} className={card.shape === shape ? 'is-selected' : ''} onClick={() => { if (shape !== card.shape)
            requestGeometry({ shape }); }}><span className={`shape-symbol shape-symbol--${shape}`}/></button>)}</div><div className="number-grid geometry-fields"><NumberField label={card.shape === 'circle' ? t("editor.tags.inspector.card.diameter") : card.shape === 'square' ? t("editor.tags.inspector.card.side") : t("editor.tags.inspector.card.width")} value={card.width / 10} min={0.5} max={29.7} unit={t("editor.tags.inspector.centimeters")} onCommit={(value) => requestGeometry({ width: value * 10 })}/>{card.shape !== 'circle' && card.shape !== 'square' && <NumberField label={t("editor.tags.inspector.card.height")} value={card.height / 10} min={0.5} max={29.7} unit={t("editor.tags.inspector.centimeters")} onCommit={(value) => requestGeometry({ height: value * 10 })}/>}</div><p className="field__hint inspector-footnote">{t("editor.tags.inspector.card.printHint")}</p></section>
      <section className="panel-section"><div className="toggle-row"><div><h3>{t("editor.tags.inspector.hole.title")}</h3><p className="field__hint">{t("editor.tags.inspector.hole.currentOnly")}</p></div><label className="toggle"><input type="checkbox" aria-label={t("editor.tags.inspector.hole.current")} checked={card.hole !== null} onChange={(event) => send({ type: 'set-hole', cardId: card.id, enabled: event.target.checked }, false)}/><span /></label></div>{card.hole && <><div className="number-grid geometry-fields"><NumberField label={t("editor.tags.inspector.hole.x")} value={card.hole.x / 10} unit={t("editor.tags.inspector.centimeters")} min={0} onCommit={(value) => send({ type: 'move-hole', cardId: card.id, patch: { x: value * 10, y: card.hole!.y } }, false)}/><NumberField label={t("editor.tags.inspector.hole.y")} value={card.hole.y / 10} unit={t("editor.tags.inspector.centimeters")} min={0} onCommit={(value) => send({ type: 'move-hole', cardId: card.id, patch: { x: card.hole!.x, y: value * 10 } }, false)}/></div><p className="field__hint inspector-footnote">{t("editor.tags.inspector.hole.diameter", { diameter: Number(Math.min(card.width * 0.07, 5).toFixed(2)) })}</p></>}<div className="toggle-row project-hole-toggle"><div><h3>{t("editor.tags.inspector.hole.wholeSet")}</h3><p className="field__hint">{t("editor.tags.inspector.hole.toggleAll")}</p></div><label className="toggle"><input type="checkbox" aria-label={t("editor.tags.inspector.hole.wholeSet")} checked={project.holeEnabled} onChange={(event) => send({ type: 'set-project-hole', enabled: event.target.checked }, false)}/><span /></label></div></section>
    </>}
    {geometry && <Modal title={t("editor.tags.inspector.resize.title")} onClose={() => setGeometry(null)} footer={<><Button variant="secondary" onClick={() => setGeometry(null)}>{t("common.cancel")}</Button><Button onClick={() => { const result = onCommand({ type: 'resize-card', cardId: card.id, scope: geometry.scope, patch: { shape: geometry.shape, width: geometry.width, height: geometry.height } }); if (!result.error) {
        setGeometry(null);
        setScope('current');
    } }}>{t("editor.tags.inspector.resize.apply")}</Button></>}><p className="muted">{t(geometry.scope === 'all' ? "editor.tags.inspector.resize.wholeSet" : "editor.tags.inspector.resize.currentCard", { shape: shapeLabels[geometry.shape], width: Number((geometry.width / 10).toFixed(2)), height: Number(((geometry.shape === 'circle' || geometry.shape === 'square' ? geometry.width : geometry.height) / 10).toFixed(2)) })}</p><div className="inline-note geometry-warning">{t("editor.tags.inspector.resize.warning")}</div></Modal>}
    {removeType && <Modal title={t(removeType === 'circle' ? "editor.tags.inspector.removeDecorations.circlesTitle" : "editor.tags.inspector.removeDecorations.starsTitle")} onClose={() => setRemoveType(null)} footer={<><Button variant="secondary" onClick={() => setRemoveType(null)}>{t("common.cancel")}</Button><Button onClick={() => { const result = send({ type: 'remove-decoration-type', cardId: card.id, scope, decorationType: removeType }); if (!result.error) {
        setRemoveType(null);
        onSelect({ kind: 'card' });
    } }}>{t("editor.tags.inspector.removeDecorations.action", { count: typeCount })}</Button></>}><p className="muted">{t(removeType === 'circle' ? scope === 'all' ? "editor.tags.inspector.removeDecorations.circlesAll" : "editor.tags.inspector.removeDecorations.circlesCurrent" : scope === 'all' ? "editor.tags.inspector.removeDecorations.starsAll" : "editor.tags.inspector.removeDecorations.starsCurrent", { count: typeCount })}</p></Modal>}
  </>;
}
