import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { jsPDF } from 'jspdf';
import { Zip, ZipPassThrough } from 'fflate';
import type { Postcard, PostcardProject } from '../../domain/postcards/types';
import { getPostcardSize } from '../../domain/postcards/types';
import { ptToMm } from '../../domain/types';
import { containBox, ellipsePath, pathToSvg, starPoints, type PathOperation } from '../../domain/geometry';
import { getPostcardResource, type PostcardResource, type PostcardResourceKind } from '../../content/postcard-assets';
import { calculatePostcardPrintLayout, type PostcardExportScope, type PostcardPrintLayout } from '../../application/export/postcardLayout';
import { validatePostcardProject, type PostcardValidationIssue } from '../../application/export/postcardValidation';
import { createPostcardScene, type PostcardScene, type SceneTextNode } from '../../rendering/scene';
import { SceneSvg } from '../../rendering/SceneSvg';
import { fontKey, getPostcardTextInkBounds, postcardTextPaths, preparePostcardFonts, type PostcardFontResource } from '../../rendering/postcard-fonts';
import { loadLocalResourceBytes, releaseLocalResourceBytes } from '../resources';
import { postcardPixelSize, withJpegDensity, withPngDensity } from '../raster/postcardDensity';
import { rasterizeSvg } from '../raster/svgRaster';
import { drawPdfBackground } from './generatePdf';

interface GraphicResource { definition: PostcardResource; bytes: Uint8Array }
export interface PreparedPostcardExport {
  id: string;
  project: PostcardProject;
  postcards: Postcard[];
  scope: PostcardExportScope;
  layout: PostcardPrintLayout;
  issues: PostcardValidationIssue[];
  scenes: Map<string, PostcardScene>;
  fonts: Map<string, PostcardFontResource>;
  resources: Map<string, GraphicResource>;
  textPaths: Map<string, Record<string, string>>;
}
export interface PostcardExportOptions { signal?: AbortSignal; onProgress?: (completed: number, total: number) => void }
export interface PostcardDownload { blob: Blob; filename: string }
let generation = 0;
const resourceKey = (kind: PostcardResourceKind, id: string) => `${kind}:${id}`;

function freezeDocument<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) freezeDocument(nested);
    Object.freeze(value);
  }
  return value;
}

export async function preparePostcardExport(project: PostcardProject, scope: PostcardExportScope = 'current'): Promise<PreparedPostcardExport> {
  const snapshot = structuredClone(project);
  const selected = scope === 'current' ? snapshot.postcards.filter(card => card.id === snapshot.activePostcardId) : snapshot.postcards;
  const preparedFonts = await preparePostcardFonts(selected);
  const resolvedCards = new Map(preparedFonts.postcards.map(card => [card.id, card]));
  snapshot.postcards = snapshot.postcards.map(card => resolvedCards.get(card.id) ?? card);
  const postcards = snapshot.postcards.filter(card => resolvedCards.has(card.id));
  const issues: PostcardValidationIssue[] = [...preparedFonts.issues, ...validatePostcardProject(snapshot, { scope, preflight: true, quality: 'print', measureText: preparedFonts.measureText })];
  const references = new Map<string, { kind: PostcardResourceKind; id: string; owners: Array<{ postcardId: string; elementId?: string }> }>();
  const add = (kind: PostcardResourceKind, id: string, postcardId: string, elementId?: string) => {
    const key = resourceKey(kind, id);
    const reference = references.get(key) ?? { kind, id, owners: [] };
    reference.owners.push({ postcardId, elementId }); references.set(key, reference);
  };
  for (const card of postcards) {
    if (card.background.kind === 'image') add('background', card.background.assetId, card.id);
    for (const element of card.elements) {
      if (element.type === 'image' || element.type === 'lettering') add(element.type, element.assetId, card.id, element.id);
      else if (element.type === 'decoration' && element.assetId) add('decoration', element.assetId, card.id, element.id);
    }
  }
  const resources = new Map<string, GraphicResource>();
  const pending = [...references.entries()];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(3, pending.length) }, async () => {
    while (cursor < pending.length) {
      const [key, reference] = pending[cursor++];
      const definition = getPostcardResource(reference.kind, reference.id);
      try {
        if (!definition) throw new Error('Ресурс отсутствует в библиотеке.');
        const bytes = await loadLocalResourceBytes(definition.print);
        if (definition.format === 'png' && ![137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) throw new Error('Файл PNG повреждён.');
        if (definition.format === 'svg' && !/<svg[\s>]/i.test(new TextDecoder().decode(bytes))) throw new Error('Файл SVG повреждён.');
        resources.set(key, { definition, bytes });
      } catch (reason) {
        for (const owner of reference.owners) issues.push({ ...owner, code: 'resource-load', severity: 'error', message: `Не удалось загрузить графику для печати. ${reason instanceof Error ? reason.message : ''}` });
      } finally { if (definition) releaseLocalResourceBytes(definition.print); }
    }
  }));
  const scenes = new Map<string, PostcardScene>();
  const textPaths = new Map<string, Record<string, string>>();
  for (const card of postcards) {
    const scene = createPostcardScene(card, { quality: 'print', measureText: preparedFonts.measureText });
    const paths: Record<string, string> = {};
    for (const node of scene.nodes) if (node.type === 'text') {
      const resource = preparedFonts.fonts.get(fontKey(node.element));
      if (resource) paths[node.id] = pathToSvg(postcardTextPaths(node.element, node.layout, resource).flat());
    }
    scenes.set(card.id, freezeDocument(scene)); textPaths.set(card.id, Object.freeze(paths));
  }
  const uniqueIssues = issues.filter((issue, i) => issues.findIndex(other => other.code === issue.code && other.postcardId === issue.postcardId && other.elementId === issue.elementId) === i);
  return { id: `postcard-export-${++generation}`, project: freezeDocument(snapshot), postcards: Object.freeze(postcards) as unknown as Postcard[], scope, layout: calculatePostcardPrintLayout(postcards, scope), issues: uniqueIssues, scenes, fonts: preparedFonts.fonts, resources, textPaths };
}

export class PostcardExportError extends Error {
  constructor(public issues: PostcardValidationIssue[]) { super('Исправьте ошибки макета перед экспортом открыток.'); this.name = 'PostcardExportError'; }
}
function assertExportable(prepared: PreparedPostcardExport) { if (prepared.issues.some(issue => issue.severity === 'error')) throw new PostcardExportError(prepared.issues); }

function rgb(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) || 0) as [number, number, number];
}
function transformed(doc: jsPDF, rotation: number, x: number, y: number, draw: () => void) {
  doc.saveGraphicsState();
  if (rotation) {
    const angle = rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    doc.setCurrentTransformationMatrix(doc.Matrix(c, s, -s, c, x - c * x + s * y, y - s * x - c * y));
  }
  draw(); doc.restoreGraphicsState();
}
function translatedPath(operations: PathOperation[], x: number, y: number): PathOperation[] {
  return operations.map(operation => ({ ...operation, c: operation.c.map((value, i) => value + (i % 2 ? y : x)) })) as PathOperation[];
}
function base64(bytes: Uint8Array): string {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
function dataUri(resource: GraphicResource) { return `data:image/${resource.definition.format === 'svg' ? 'svg+xml' : 'png'};base64,${base64(resource.bytes)}`; }

/** The same SVG renderer and outline layout serve previews and raster output. */
export function postcardExportSvg(prepared: PreparedPostcardExport, postcardId: string, embedImages = false, pixelSize?: { width: number; height: number }): string {
  const source = prepared.scenes.get(postcardId);
  if (!source) throw new Error('Открытка отсутствует в экспортном снимке.');
  const scene: PostcardScene = { ...source, nodes: source.nodes.map(node => {
    if (!embedImages || node.type === 'text') return node;
    const element = node.element;
    const graphic = element.type === 'decoration' ? element.assetId && prepared.resources.get(resourceKey('decoration', element.assetId)) : prepared.resources.get(resourceKey(element.type, element.assetId));
    return graphic ? { ...node, href: dataUri(graphic) } : node;
  }) };
  if (embedImages && scene.background.kind === 'image') {
    const graphic = prepared.resources.get(resourceKey('background', scene.background.assetId));
    if (graphic && scene.backgroundImage) scene.backgroundImage = { ...scene.backgroundImage, href: dataUri(graphic) };
  }
  const markup = renderToStaticMarkup(createElement(SceneSvg, { scene, print: true, textPaths: prepared.textPaths.get(postcardId), idPrefix: prepared.id }));
  const size = pixelSize ?? postcardPixelSize(scene.width, scene.height);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${scene.width} ${scene.height}"><rect width="${scene.width}" height="${scene.height}" fill="#ffffff"/>${markup}</svg>`;
}

async function rasterShadow(node: SceneTextNode, operations: PathOperation[][], signal?: AbortSignal) {
  const shadow = node.element.shadow!;
  const stroke = ptToMm(node.element.stroke?.width ?? 0);
  const padding = shadow.blur * 3 + stroke + 1;
  const ink = getPostcardTextInkBounds(node.element, node.layout);
  const left = Math.min(node.element.x, ink?.x ?? Infinity), top = Math.min(node.element.y, ink?.y ?? Infinity);
  const right = Math.max(node.element.x + node.element.width, ink ? ink.x + ink.width : -Infinity);
  const bottom = Math.max(node.element.y + Math.max(node.element.height, node.layout.height), ink ? ink.y + ink.height : -Infinity);
  const x = Math.min(left, left + shadow.offsetX) - padding;
  const y = Math.min(top, top + shadow.offsetY) - padding;
  const width = right - left + Math.abs(shadow.offsetX) + padding * 2;
  const height = bottom - top + Math.abs(shadow.offsetY) + padding * 2;
  const pixels = postcardPixelSize(width, height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels.width}" height="${pixels.height}" viewBox="${x} ${y} ${width} ${height}"><defs><filter id="blur" filterUnits="userSpaceOnUse" x="${x}" y="${y}" width="${width}" height="${height}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${shadow.blur}"/></filter></defs><g fill="${shadow.color}" stroke="${shadow.color}" stroke-width="${stroke}" transform="translate(${shadow.offsetX} ${shadow.offsetY})" filter="url(#blur)"><path d="${pathToSvg(operations.flat())}"/></g></svg>`;
  return { bytes: await rasterizeSvg(svg, pixels.width, pixels.height, 'png', false, signal), x, y, width, height };
}

async function printableGraphic(graphic: GraphicResource, width: number, height: number, signal?: AbortSignal): Promise<Uint8Array> {
  if (graphic.definition.format === 'png') return graphic.bytes;
  const size = postcardPixelSize(width, height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${graphic.definition.width} ${graphic.definition.height}"><image href="${dataUri(graphic)}" width="${graphic.definition.width}" height="${graphic.definition.height}"/></svg>`;
  return rasterizeSvg(svg, size.width, size.height, 'png', false, signal);
}

async function drawPostcard(doc: jsPDF, prepared: PreparedPostcardExport, card: Postcard, signal?: AbortSignal) {
  const scene = prepared.scenes.get(card.id)!;
  const graphics = new Map<string, Uint8Array>();
  const shadows = new Map<string, Awaited<ReturnType<typeof rasterShadow>>>();
  for (const node of scene.nodes) {
    if (node.type === 'text') {
      if (node.element.shadow && node.element.shadow.blur > 0) {
        const font = prepared.fonts.get(fontKey(node.element))!;
        shadows.set(node.id, await rasterShadow(node, postcardTextPaths(node.element, node.layout, font), signal));
      }
    } else {
      const element = node.element;
      const resource = element.type === 'decoration' ? element.assetId && prepared.resources.get(resourceKey('decoration', element.assetId)) : prepared.resources.get(resourceKey(element.type, element.assetId));
      if (resource) graphics.set(node.id, await printableGraphic(resource, element.width, element.height, signal));
    }
  }
  const backgroundGraphic = card.background.kind === 'image' ? prepared.resources.get(resourceKey('background', card.background.assetId)) : undefined;
  const backgroundBytes = backgroundGraphic ? await printableGraphic(backgroundGraphic, scene.width, scene.height, signal) : undefined;
  signal?.throwIfAborted();
  doc.saveGraphicsState(); doc.rect(0, 0, scene.width, scene.height); doc.clip(); doc.discardPath();
  if (card.background.kind === 'image') {
    doc.setFillColor(...rgb(card.background.color)); doc.rect(0, 0, scene.width, scene.height, 'F');
    if (backgroundGraphic && backgroundBytes) {
      const ratio = Math.max(scene.width / backgroundGraphic.definition.width, scene.height / backgroundGraphic.definition.height);
      const width = backgroundGraphic.definition.width * ratio, height = backgroundGraphic.definition.height * ratio;
      doc.addImage(backgroundBytes, 'PNG', (scene.width - width) / 2, (scene.height - height) / 2, width, height);
    }
  } else drawPdfBackground(doc, card.background, 0, 0, scene.width, scene.height);
  for (const node of scene.nodes) {
    const element = node.element;
    transformed(doc, element.rotation, element.x + element.width / 2, element.y + element.height / 2, () => {
      if (node.type === 'text') {
        const text = node.element;
        const resource = prepared.fonts.get(fontKey(text))!;
        const paths = postcardTextPaths(text, node.layout, resource).flat();
        if (text.shadow) {
          const shadow = shadows.get(node.id);
          if (shadow) doc.addImage(shadow.bytes, 'PNG', shadow.x, shadow.y, shadow.width, shadow.height);
          else { doc.setFillColor(...rgb(text.shadow.color)); doc.path(translatedPath(paths, text.shadow.offsetX, text.shadow.offsetY)); doc.fill(); }
        }
        if (text.stroke && text.stroke.width > 0) { doc.setDrawColor(...rgb(text.stroke.color)); doc.setLineWidth(ptToMm(text.stroke.width)); doc.setLineJoin('round'); doc.path(paths); doc.stroke(); }
        doc.setFillColor(...rgb(text.color)); doc.path(paths); doc.fill();
      } else if (graphics.has(node.id) && element.type !== 'text') {
        const resource = element.type === 'decoration' ? prepared.resources.get(resourceKey('decoration', element.assetId!))! : prepared.resources.get(resourceKey(element.type, element.assetId))!;
        const box = containBox(element, resource.definition.width, resource.definition.height);
        doc.setGState(doc.GState({ opacity: node.element.opacity, 'stroke-opacity': node.element.opacity }));
        doc.addImage(graphics.get(node.id)!, 'PNG', box.x, box.y, box.width, box.height);
      } else if (node.type === 'decoration') {
        const decoration = node.element;
        doc.setGState(doc.GState({ opacity: decoration.opacity, 'stroke-opacity': decoration.opacity }));
        if (decoration.fill) doc.setFillColor(...rgb(decoration.fill));
        if (decoration.stroke) { doc.setDrawColor(...rgb(decoration.stroke)); doc.setLineWidth(ptToMm(decoration.strokeWidth)); }
        const path: PathOperation[] = decoration.shape === 'circle' ? ellipsePath(decoration.x + decoration.width / 2, decoration.y + decoration.height / 2, decoration.width / 2, decoration.height / 2) : decoration.shape === 'line' ? [{ op: 'm', c: [decoration.x, decoration.y + decoration.height / 2] }, { op: 'l', c: [decoration.x + decoration.width, decoration.y + decoration.height / 2] }] : [...starPoints(decoration, decoration.points).map(([x, y], i): PathOperation => ({ op: i ? 'l' : 'm', c: [x, y] })), { op: 'h', c: [] }];
        doc.path(path);
        if (decoration.shape === 'line') { if (decoration.stroke) doc.stroke(); else doc.discardPath(); }
        else if (decoration.fill && decoration.stroke) doc.fillStroke(); else if (decoration.fill) doc.fill(); else if (decoration.stroke) doc.stroke(); else doc.discardPath();
      }
    });
  }
  doc.restoreGraphicsState();
}

export async function generatePostcardPdf(prepared: PreparedPostcardExport, options: PostcardExportOptions = {}): Promise<Blob> {
  assertExportable(prepared); options.signal?.throwIfAborted();
  const { width, height } = prepared.layout;
  const doc = new jsPDF({ unit: 'mm', format: [width, height], orientation: width > height ? 'landscape' : 'portrait', compress: true, putOnlyUsedFonts: true });
  doc.setProperties({ title: prepared.project.name, subject: 'Печатные открытки', creator: 'Новогодняя мастерская' });
  let completed = 0;
  for (let pageIndex = 0; pageIndex < prepared.layout.pages.length; pageIndex++) {
    if (pageIndex) doc.addPage([width, height], width > height ? 'landscape' : 'portrait');
    for (const placement of prepared.layout.pages[pageIndex].placements) {
      const card = prepared.postcards.find(value => value.id === placement.postcardId)!;
      const original = getPostcardSize(card);
      // Keep the page/card transforms open across asynchronous resource preparation.
      doc.advancedAPI(); doc.saveGraphicsState();
      doc.setCurrentTransformationMatrix(placement.rotation === 90 ? doc.Matrix(0, 1, -1, 0, placement.x + original.height, placement.y) : doc.Matrix(1, 0, 0, 1, placement.x, placement.y));
      try { await drawPostcard(doc, prepared, card, options.signal); }
      finally { doc.restoreGraphicsState(); doc.compatAPI(); }
      options.onProgress?.(++completed, prepared.postcards.length);
    }
  }
  return doc.output('blob');
}

export async function generatePostcardImages(prepared: PreparedPostcardExport, format: 'png' | 'jpg', options: PostcardExportOptions = {}): Promise<PostcardDownload> {
  assertExportable(prepared);
  const encode = async (card: Postcard) => {
    options.signal?.throwIfAborted();
    const { width, height } = getPostcardSize(card);
    const size = postcardPixelSize(width, height);
    const bytes = await rasterizeSvg(postcardExportSvg(prepared, card.id, true, size), size.width, size.height, format, true, options.signal);
    return format === 'png' ? withPngDensity(bytes) : withJpegDensity(bytes);
  };
  const filename = (card: Postcard) => `postcard-${String(prepared.project.postcards.findIndex(value => value.id === card.id) + 1).padStart(2, '0')}.${format}`;
  if (prepared.postcards.length === 1) {
    const bytes = await encode(prepared.postcards[0]);
    options.onProgress?.(1, 1);
    return { blob: new Blob([bytes.slice().buffer], { type: format === 'png' ? 'image/png' : 'image/jpeg' }), filename: filename(prepared.postcards[0]) };
  }
  const chunks: ArrayBuffer[] = [];
  let resolveZip!: (blob: Blob) => void, rejectZip!: (reason: unknown) => void;
  const done = new Promise<Blob>((resolve, reject) => { resolveZip = resolve; rejectZip = reject; });
  const zip = new Zip((error, data, final) => {
    if (error) { rejectZip(error); return; }
    chunks.push(data.slice().buffer);
    if (final) resolveZip(new Blob(chunks, { type: 'application/zip' }));
  });
  try {
    for (let i = 0; i < prepared.postcards.length; i++) {
      const card = prepared.postcards[i];
      const bytes = await encode(card);
      const entry = new ZipPassThrough(filename(card)); entry.mtime = new Date(2000, 0, 1);
      zip.add(entry); entry.push(bytes, true);
      options.onProgress?.(i + 1, prepared.postcards.length);
    }
    options.signal?.throwIfAborted(); zip.end();
    return { blob: await done, filename: `Postcards-${format.toUpperCase()}.zip` };
  } catch (reason) { zip.terminate(); throw reason; }
}

export function downloadPostcardFile(file: PostcardDownload): void {
  const url = URL.createObjectURL(file.blob), link = document.createElement('a');
  link.href = url; link.download = file.filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
