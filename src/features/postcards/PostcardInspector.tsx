import { localized, t } from '../../i18n';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Lock, Plus, Search, Trash2, Unlock } from 'lucide-react';
import type { OperationResult } from '../../domain/commands';
import type { PostcardCommand } from '../../domain/postcards/commands';
import type { Postcard, PostcardBackground, PostcardElement, PostcardElementPatch, PostcardFormat } from '../../domain/postcards/types';
import { getPostcardSize, MAX_POSTCARD_ELEMENTS } from '../../domain/postcards/types';
import { createDecorationElement, createImageElement, createLetteringElement, createTextElement } from '../../domain/postcards/project';
import { categories, getAvailableMotifs, getImage, searchImages } from '../../data/images';
import { lettering, letteringCategories } from '../../data/lettering';
import { backgrounds, backgroundCategories } from '../../data/backgrounds';
import { decorations, decorationCategories } from '../../data/decorations';
import { assetUrl } from '../../content/assets';
import { getPostcardResource, type PostcardResourceKind } from '../../content/postcard-assets';
import { fonts } from '../../content/fonts';
import { Button, ColorPalette, Field, IconButton } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { NumberField } from '../editor/Inspector';
import { PostcardCornerRadiusField } from './PostcardCornerRadiusField';
import { fitTextBox } from '../../rendering/text';
import { getPostcardFontState, getPostcardTextMeasurer } from '../../rendering/postcard-fonts';
import type { FontId } from '../../domain/types';
import '../../features/editor/inspector.css';
export type PostcardTab = 'text' | 'image' | 'decoration' | 'background' | 'layers' | 'cards' | 'export';
export const postcardFormatLabels: Record<PostcardFormat, string> = { 'a6-portrait': t("editor.postcards.formats.portrait"), 'a6-landscape': t("editor.postcards.formats.landscape"), square: t("editor.postcards.formats.square") };
export function postcardElementLabel(element: PostcardElement) {
    if (element.type === 'text')
        return element.content.trim().slice(0, 48) || t("editor.postcards.elements.emptyText");
    if (element.type === 'image') {
        const entry = getImage(element.assetId);
        return entry ? localized(entry.name) : t('editor.postcards.elements.illustration');
    }
    if (element.type === 'lettering') {
        const entry = lettering.find(entry => entry.id === element.assetId);
        return entry ? localized(entry.name) : t('editor.postcards.elements.lettering');
    }
    if (element.assetId) {
        const entry = decorations.find(entry => entry.id === element.assetId);
        return entry ? localized(entry.name) : t('editor.postcards.elements.decoration');
    }
    return { circle: t('editor.postcards.shapes.circle'), star: t('editor.postcards.shapes.star'), line: t('editor.postcards.shapes.line') }[element.shape];
}
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replaceAll('ё', 'е');
const blankBackground = (): PostcardBackground => ({ kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 });
function ColorSetting({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return <section className="postcard-color-setting"><h3>{label}</h3><ColorPalette value={value} onChange={onChange}/></section>;
}
export function PostcardInspector({ postcard, tab, selection, onSelect, onCommand }: {
    postcard: Postcard;
    tab: PostcardTab;
    selection: string | null;
    onSelect: (id: string | null) => void;
    onCommand: (command: PostcardCommand) => OperationResult;
}) {
    const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [motif, setMotif] = useState('');
    const [textMode, setTextMode] = useState<'custom' | 'lettering'>(() => postcard.elements.find(item => item.id === selection)?.type === 'lettering' ? 'lettering' : 'custom');
    const [format, setFormat] = useState<PostcardFormat | null>(null);
    const element = postcard.elements.find(item => item.id === selection);
    const resourceTab = tab === 'text' && textMode === 'lettering' ? 'lettering' : tab;
    useEffect(() => { if (element?.type === 'text')
        setTextMode('custom');
    else if (element?.type === 'lettering')
        setTextMode('lettering'); }, [selection, postcard.id]);
    const size = getPostcardSize(postcard), full = postcard.elements.length >= MAX_POSTCARD_ELEMENTS;
    const send = (command: PostcardCommand) => onCommand(command);
    const patch = (value: PostcardElementPatch) => element && send({ type: 'update-element', postcardId: postcard.id, elementId: element.id, patch: value });
    const add = (item: PostcardElement) => {
        const centered = { ...item, x: Math.max(0, (size.width - item.width) / 2), y: Math.max(0, (size.height - item.height) / 2) };
        if (!send({ type: 'add-element', postcardId: postcard.id, element: centered }).error)
            onSelect(item.id);
    };
    const changeBackground = (background: PostcardBackground) => send({ type: 'update-background', postcardId: postcard.id, background });
    const records = useMemo(() => {
        if (resourceTab === 'image')
            return searchImages(query, { category: category || undefined, subcategory: motif || undefined });
        const pool = resourceTab === 'lettering' ? lettering : resourceTab === 'background' ? backgrounds : decorations;
        const words = normalize(query).split(/\s+/).filter(Boolean);
        return pool.filter(entry => (!category || entry.category === category) && words.every(word => normalize([entry.id, entry.name.ru, entry.name.en, ...entry.tags, ...entry.tagsEn, ...entry.aliases].join(' ')).includes(word)));
    }, [resourceTab, query, category, motif]);
    const library = (kind: PostcardResourceKind) => <>
    <div className="library-search"><Search size={16}/><input aria-label={t(kind === 'image' ? "library.postcards.searchIllustrations" : kind === 'lettering' ? "library.postcards.searchLettering" : kind === 'background' ? "library.postcards.searchBackgrounds" : "library.postcards.searchDecorations")} value={query} onChange={event => setQuery(event.target.value)} placeholder={t("library.postcards.searchPlaceholder")}/></div>
    <div className="library-filters"><select aria-label={t("library.postcards.category")} value={category} onChange={event => { setCategory(event.target.value); setMotif(''); }}><option value="">{t("library.postcards.allCategories")}</option>{(kind === 'image' ? categories : kind === 'lettering' ? letteringCategories : kind === 'background' ? backgroundCategories : decorationCategories).filter(item => kind === 'image' || (kind === 'lettering' ? lettering : kind === 'background' ? backgrounds : decorations).some(entry => entry.category === item.id)).map(item => <option key={item.id} value={item.id}>{localized(item.name)}</option>)}</select>{kind === 'image' && <select aria-label={t("library.postcards.motif")} value={motif} onChange={event => setMotif(event.target.value)}><option value="">{t("library.postcards.allMotifs")}</option>{getAvailableMotifs(category || undefined).map(item => <option key={item.id} value={item.id}>{localized(item.name)}</option>)}</select>}</div>
    <p className="library-result-count">{t("library.postcards.resultCount", { count: records.length })}</p>
    <div className="image-library" aria-label={t("library.postcards.label")}>{records.map(entry => {
            const resource = getPostcardResource(kind, entry.id);
            if (!resource)
                return null;
            return <button type="button" key={entry.id} title={localized(entry.name)} aria-label={t(kind === 'background' ? "library.postcards.selectBackground" : "library.postcards.add", { assetName: localized(entry.name) })} disabled={kind !== 'background' && full} onClick={() => { if (kind === 'background')
                changeBackground({ kind: 'image', assetId: entry.id, color: '#FFFFFF' });
            else if (kind === 'image')
                add(createImageElement(entry.id));
            else if (kind === 'lettering')
                add(createLetteringElement(entry.id));
            else
                add(createDecorationElement({ assetId: entry.id, width: 40, height: 40 * resource.height / resource.width })); }}><img src={assetUrl(resource.preview)} alt="" loading="lazy" draggable={false}/></button>;
        })}</div>{!records.length && <p className="library-empty">{query ? t("library.postcards.empty") : t("library.postcards.comingSoon")}</p>}
  </>;
    const compatible = element && ((tab === 'text' && (textMode === 'custom' ? element.type === 'text' : element.type === 'lettering')) || (tab === 'image' && element.type === 'image') || (tab === 'decoration' && element.type === 'decoration'));
    return <>
    {tab === 'text' && <><div className="panel-heading"><h2>{t("editor.postcards.text.title")}</h2><p>{t("editor.postcards.text.hint")}</p></div><div className="postcard-text-modes" role="group" aria-label={t("editor.postcards.text.mode")}><Button variant={textMode === 'custom' ? 'primary' : 'secondary'} aria-pressed={textMode === 'custom'} onClick={() => { setTextMode('custom'); onSelect(null); setQuery(''); setCategory(''); setMotif(''); }}>{t("editor.postcards.text.custom")}</Button><Button variant={textMode === 'lettering' ? 'primary' : 'secondary'} aria-pressed={textMode === 'lettering'} onClick={() => { setTextMode('lettering'); onSelect(null); setQuery(''); setCategory(''); setMotif(''); }}>{t("editor.postcards.text.lettering")}</Button></div>{textMode === 'custom' ? <Button variant="secondary" disabled={full} onClick={() => add(createTextElement())}><Plus size={16}/>{t("editor.postcards.text.add")}</Button> : library('lettering')}</>}
    {tab === 'image' && <><div className="panel-heading"><h2>{t("editor.postcards.illustrations.title")}</h2><p>{t("editor.postcards.illustrations.hint")}</p></div>{library('image')}</>}
    {tab === 'decoration' && <><div className="panel-heading"><h2>{t("editor.postcards.elements.decoration")}</h2></div><div className="postcard-shapes">{(['circle', 'star', 'line'] as const).map(shape => <Button key={shape} variant="secondary" disabled={full} onClick={() => add(createDecorationElement({ shape, ...(shape === 'line' ? { width: 35, height: 1, fill: null, stroke: '#C2A26B', strokeWidth: 1 } : {}) }))}><Plus size={14}/>{{ circle: t("editor.postcards.shapes.circle"), star: t("editor.postcards.shapes.star"), line: t("editor.postcards.shapes.line") }[shape]}</Button>)}</div>{decorations.length ? library('decoration') : <p className="field__hint">{t("editor.postcards.decorations.empty")}</p>}</>}
    {full && ['text', 'image', 'lettering', 'decoration'].includes(tab) && <p role="status" className="inline-note">{t("editor.postcards.elementLimit")}</p>}
    {compatible && element && <section className="panel-section postcard-element-properties"><h3>{postcardElementLabel(element)}</h3>{element.locked && <p className="inline-note"><Lock size={15}/>{t("editor.postcards.lockedElement")}</p>}
      {element.type === 'text' && <><p role="status" className="field__hint">{getPostcardFontState(element).status === 'loading' ? t("editor.postcards.fontLoading") : null}</p>{getPostcardFontState(element).message && <p role={getPostcardFontState(element).status === 'error' ? 'alert' : 'status'} className="inline-note">{getPostcardFontState(element).message}</p>}</>}
      <fieldset disabled={element.locked}><div className="number-grid"><NumberField label={t("editor.postcards.geometry.x")} value={element.x} unit={t("editor.postcards.geometry.millimeters")} onCommit={x => patch({ x })}/><NumberField label={t("editor.postcards.geometry.y")} value={element.y} unit={t("editor.postcards.geometry.millimeters")} onCommit={y => patch({ y })}/><NumberField label={t("editor.postcards.geometry.width")} value={element.width} unit={t("editor.postcards.geometry.millimeters")} min={0.1} onCommit={width => patch({ width })}/><NumberField label={t("editor.postcards.geometry.height")} value={element.height} unit={t("editor.postcards.geometry.millimeters")} min={0.1} onCommit={height => patch({ height })}/></div><NumberField label={t("editor.postcards.geometry.rotation")} value={element.rotation} unit="°" step={15} onCommit={rotation => patch({ rotation })}/>
      {element.type === 'text' ? <>
        <Field label={t("editor.postcards.text.content")}><textarea value={element.content} maxLength={6000} rows={4} onChange={event => patch({ content: event.target.value })}/></Field>
        <div className="font-controls"><Field label={t("editor.postcards.text.fontFamily")}><select aria-label={t("editor.postcards.text.fontFamily")} value={element.fontId} onChange={event => patch({ fontId: event.target.value as FontId })}>{fonts.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}</select></Field><NumberField label={t("editor.postcards.text.fontSize")} value={element.fontSize} unit="pt" min={6} max={200} step={1} onCommit={fontSize => patch({ fontSize })}/></div>
        <div className="postcard-inline-controls"><label><input type="checkbox" checked={element.weight === 'bold'} onChange={event => patch({ weight: event.target.checked ? 'bold' : 'normal' })}/>{t("editor.postcards.text.bold")}</label><label><input type="checkbox" checked={element.italic} onChange={event => patch({ italic: event.target.checked })}/>{t("editor.postcards.text.italic")}</label></div>
        <Field label={t("editor.postcards.text.alignment")}><select value={element.align} onChange={event => patch({ align: event.target.value as 'left' | 'center' | 'right' })}><option value="left">{t("editor.postcards.text.left")}</option><option value="center">{t("editor.postcards.text.center")}</option><option value="right">{t("editor.postcards.text.right")}</option></select></Field>
        <div className="number-grid"><NumberField label={t("editor.postcards.text.lineHeight")} value={element.lineHeight} min={0.5} max={4} step={0.1} onCommit={lineHeight => patch({ lineHeight })}/><NumberField label={t("editor.postcards.text.letterSpacing")} value={element.letterSpacing} unit="pt" min={-20} max={100} onCommit={letterSpacing => patch({ letterSpacing })}/></div>
        <ColorSetting label={t("editor.postcards.text.color")} value={element.color} onChange={color => patch({ color })}/>
        <label className="postcard-effect-toggle"><input type="checkbox" checked={element.stroke !== null} onChange={event => patch({ stroke: event.target.checked ? { color: '#C2A26B', width: 0.5 } : null })}/>{t("editor.postcards.text.stroke")}</label>{element.stroke && <><ColorSetting label={t("editor.postcards.text.strokeColor")} value={element.stroke.color} onChange={color => patch({ stroke: { ...element.stroke!, color } })}/><NumberField label={t("editor.postcards.text.strokeWidth")} value={element.stroke.width} unit="pt" min={0} max={20} onCommit={width => patch({ stroke: { ...element.stroke!, width } })}/></>}
        <label className="postcard-effect-toggle"><input type="checkbox" checked={element.shadow !== null} onChange={event => patch({ shadow: event.target.checked ? { color: '#777777', offsetX: 0.5, offsetY: 0.5, blur: 0.2 } : null })}/>{t("editor.postcards.text.shadow")}</label>{element.shadow && <><ColorSetting label={t("editor.postcards.text.shadowColor")} value={element.shadow.color} onChange={color => patch({ shadow: { ...element.shadow!, color } })}/><div className="number-grid"><NumberField label={t("editor.postcards.text.shadowX")} value={element.shadow.offsetX} unit={t("editor.postcards.geometry.millimeters")} onCommit={offsetX => patch({ shadow: { ...element.shadow!, offsetX } })}/><NumberField label={t("editor.postcards.text.shadowY")} value={element.shadow.offsetY} unit={t("editor.postcards.geometry.millimeters")} onCommit={offsetY => patch({ shadow: { ...element.shadow!, offsetY } })}/><NumberField label={t("editor.postcards.text.shadowBlur")} value={element.shadow.blur} unit={t("editor.postcards.geometry.millimeters")} min={0} max={30} onCommit={blur => patch({ shadow: { ...element.shadow!, blur } })}/></div></>}
        <Button variant="secondary" onClick={() => { const resolved = getPostcardFontState(element).text; const fitted = fitTextBox(resolved, getPostcardTextMeasurer(element)); patch({ x: fitted.x, width: fitted.width, height: fitted.height }); }}>{t("editor.postcards.text.fitBox")}</Button>
      </> : <><NumberField label={t("editor.postcards.opacity")} value={element.opacity * 100} unit="%" min={0} max={100} step={5} onCommit={opacity => patch({ opacity: opacity / 100 })}/>{element.type === 'decoration' && !element.assetId && <><label className="postcard-effect-toggle"><input type="checkbox" checked={element.fill !== null} onChange={event => patch({ fill: event.target.checked ? '#C2A26B' : null })}/>{t("editor.postcards.shape.fill")}</label>{element.fill && <ColorSetting label={t("editor.postcards.shape.color")} value={element.fill} onChange={fill => patch({ fill })}/>}<label className="postcard-effect-toggle"><input type="checkbox" checked={element.stroke !== null} onChange={event => patch({ stroke: event.target.checked ? '#36523C' : null })}/>{t("editor.postcards.shape.stroke")}</label>{element.stroke && <><ColorSetting label={t("editor.postcards.text.strokeColor")} value={element.stroke} onChange={stroke => patch({ stroke })}/><NumberField label={t("editor.postcards.text.strokeWidth")} value={element.strokeWidth} unit="pt" min={0} max={20} onCommit={strokeWidth => patch({ strokeWidth })}/></>}{element.shape === 'star' && <NumberField label={t("editor.postcards.shape.starPoints")} value={element.points} min={4} max={12} step={1} onCommit={points => patch({ points: Math.round(points) })}/>}</>}</>}
      <div className="postcard-align-controls" aria-label={t("editor.postcards.align.label")}>{[{ label: t("editor.postcards.align.left"), patch: { x: 3 } }, { label: t("editor.postcards.align.centerX"), patch: { x: (size.width - element.width) / 2 } }, { label: t("editor.postcards.align.right"), patch: { x: size.width - element.width - 3 } }, { label: t("editor.postcards.align.top"), patch: { y: 3 } }, { label: t("editor.postcards.align.centerY"), patch: { y: (size.height - element.height) / 2 } }, { label: t("editor.postcards.align.bottom"), patch: { y: size.height - element.height - 3 } }].map(item => <Button key={item.label} variant="quiet" onClick={() => patch(item.patch)}>{item.label}</Button>)}</div></fieldset>
      <div className="postcard-element-actions"><Button variant="secondary" disabled={full} onClick={() => send({ type: 'duplicate-element', postcardId: postcard.id, elementId: element.id })}><Copy size={15}/>{t("editor.postcards.duplicate")}</Button><Button variant="quiet" disabled={element.locked} onClick={() => { if (!send({ type: 'remove-element', postcardId: postcard.id, elementId: element.id }).error)
            onSelect(null); }}><Trash2 size={15}/>{t("editor.postcards.delete")}</Button></div>
    </section>}
    {tab === 'background' && <><div className="panel-heading"><h2>{t("editor.postcards.background.title")}</h2></div><section className="postcard-format-settings"><Field label={t("editor.postcards.background.format")}><select value={postcard.format} onChange={event => setFormat(event.target.value as PostcardFormat)}>{Object.entries(postcardFormatLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field><PostcardCornerRadiusField value={postcard.cornerRadius ?? 0} onChange={cornerRadius => send({ type: 'set-corner-radius', postcardId: postcard.id, cornerRadius })}/></section><Field label={t("editor.postcards.background.type")}><select value={postcard.background.kind} onChange={event => { const kind = event.target.value; if (kind === 'image') {
        if (backgrounds[0])
            changeBackground({ kind, assetId: backgrounds[0].id, color: '#FFFFFF' });
    }
    else {
        const old = postcard.background.kind === 'image' ? blankBackground() : postcard.background;
        if (old.kind !== 'image')
            changeBackground({ ...old, kind: kind as 'solid' | 'linear' | 'radial', colors: kind === 'solid' ? [old.colors[0]] : old.colors.length > 1 ? old.colors : [old.colors[0], '#D9E7EC'] });
    } }}><option value="image" disabled={!backgrounds.length}>{t("editor.postcards.background.image")}</option><option value="solid">{t("editor.postcards.background.solid")}</option><option value="linear">{t("editor.postcards.background.linear")}</option><option value="radial">{t("editor.postcards.background.radial")}</option></select></Field>{postcard.background.kind === 'image' ? <>{library('background')}<p className="field__hint">{t("editor.postcards.background.cropHint")}</p></> : <>{postcard.background.colors.map((color, index) => <ColorSetting key={index} label={postcard.background.kind === 'solid' ? t("editor.postcards.background.color") : t("editor.postcards.background.stopColor", { position: index + 1 })} value={color} onChange={next => { if (postcard.background.kind !== 'image') {
        const colors = [...postcard.background.colors];
        colors[index] = next;
        changeBackground({ ...postcard.background, colors });
    } }}/>)}{postcard.background.kind !== 'solid' && <Button variant="secondary" onClick={() => { if (postcard.background.kind !== 'image')
        changeBackground({ ...postcard.background, colors: postcard.background.colors.length < 3 ? [...postcard.background.colors, '#E8D8BE'] : postcard.background.colors.slice(0, 2) }); }}>{postcard.background.colors.length < 3 ? t("editor.postcards.background.addColor") : t("editor.postcards.background.removeColor")}</Button>}{postcard.background.kind === 'linear' && <NumberField label={t("editor.postcards.background.angle")} value={postcard.background.angle} unit="°" min={0} max={360} step={1} onCommit={angle => postcard.background.kind !== 'image' && changeBackground({ ...postcard.background, angle })}/>}{postcard.background.kind === 'radial' && <div className="number-grid"><NumberField label={t("editor.postcards.background.centerX")} value={postcard.background.centerX * 100} unit="%" min={0} max={100} onCommit={centerX => postcard.background.kind !== 'image' && changeBackground({ ...postcard.background, centerX: centerX / 100 })}/><NumberField label={t("editor.postcards.background.centerY")} value={postcard.background.centerY * 100} unit="%" min={0} max={100} onCommit={centerY => postcard.background.kind !== 'image' && changeBackground({ ...postcard.background, centerY: centerY / 100 })}/></div>}</>}</>}

    {tab === 'layers' && <><div className="panel-heading"><h2>{t("editor.postcards.layers.title")}</h2><p>{t("editor.postcards.layers.description", { count: postcard.elements.length })}</p></div><div className="postcard-layers">{[...postcard.elements].reverse().map(item => { const index = postcard.elements.indexOf(item); return <div key={item.id} className={selection === item.id ? 'is-selected' : ''}><button className="postcard-layer-choice" aria-pressed={selection === item.id} onClick={() => onSelect(item.id)}>{postcardElementLabel(item)}</button><IconButton label={item.locked ? t("editor.postcards.layers.unlock") : t("editor.postcards.layers.lock")} onClick={() => send({ type: 'set-element-lock', postcardId: postcard.id, elementId: item.id, locked: !item.locked })}>{item.locked ? <Lock size={16}/> : <Unlock size={16}/>}</IconButton><IconButton label={t("editor.postcards.layers.raise")} disabled={index === postcard.elements.length - 1} onClick={() => send({ type: 'reorder-element', postcardId: postcard.id, elementId: item.id, index: index + 1 })}><ArrowUp size={16}/></IconButton><IconButton label={t("editor.postcards.layers.lower")} disabled={index === 0} onClick={() => send({ type: 'reorder-element', postcardId: postcard.id, elementId: item.id, index: index - 1 })}><ArrowDown size={16}/></IconButton><IconButton label={t("editor.postcards.layers.delete")} disabled={item.locked} onClick={() => send({ type: 'remove-element', postcardId: postcard.id, elementId: item.id })}><Trash2 size={16}/></IconButton></div>; })}</div>{!postcard.elements.length && <p className="library-empty">{t("editor.postcards.layers.empty")}</p>}</>}
    {format && <Modal title={t("editor.postcards.resize.title")} onClose={() => setFormat(null)} footer={<><Button variant="secondary" onClick={() => setFormat(null)}>{t("common.cancel")}</Button><Button onClick={() => { if (!send({ type: 'set-format', postcardId: postcard.id, format }).error)
        setFormat(null); }}>{t("editor.postcards.resize.apply")}</Button></>}><p>{postcardFormatLabels[format]}</p><p className="muted">{t("editor.postcards.resize.description")}</p></Modal>}
  </>;
}
