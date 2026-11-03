import { jsPDF } from 'jspdf';
import type { AssetDefinition, Background, Card, FontDefinition, FontId, ProjectDocument, TextElement, ValidationIssue } from '../../domain/types';
import { ptToMm } from '../../domain/types';
import { containBox, ellipsePath, holeDiameter, outlinePath, starPoints, type PathOperation } from '../../domain/geometry';
import { assetUrl, assets, getAsset } from '../../content/assets';
import { fonts, getFont } from '../../content/fonts';
import { calculatePrintLayout, type PrintLayout } from '../../application/export/layout';
import { validateProject } from '../../application/export/validation';
import { fontFile, fontStyle, layoutText } from '../../rendering/text';

interface FontResource { id: FontId; family: string; style: ReturnType<typeof fontStyle>; file: string; bytes: Uint8Array }
export interface PreparedPrint { project: ProjectDocument; layout: PrintLayout; issues: ValidationIssue[]; fonts: FontResource[] }
const byteCache = new Map<string, Promise<Uint8Array>>();
const fontFaces = new Map<string, Promise<void>>();
const printImageCache = new Map<string, Promise<Uint8Array>>();
export const PRINT_IMAGE_DPI = 300;

async function loadBytes(path: string): Promise<Uint8Array> {
  if (!byteCache.has(path)) {
    const request = fetch(assetUrl(path)).then(async response => {
      if (!response.ok) throw new Error(`Не удалось загрузить ресурс для PDF: ${path}`);
      return new Uint8Array(await response.arrayBuffer());
    }).catch(error => { byteCache.delete(path); throw error; });
    byteCache.set(path, request);
  }
  return byteCache.get(path)!;
}

function binaryString(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}

function fontFamilyId(id: FontId) { return `studio-${id}`; }

export function printImageSize(asset: AssetDefinition, cards: Card[]): { width: number; height: number } {
  let scale = 0;
  for (const card of cards) {
    const actual = containBox(card.illustration, asset.width, asset.height);
    scale = Math.max(scale, actual.width / 25.4 * PRINT_IMAGE_DPI / asset.width, actual.height / 25.4 * PRINT_IMAGE_DPI / asset.height);
  }
  scale = Math.min(1, Math.max(0.001, scale));
  return { width: Math.ceil(asset.width * scale), height: Math.ceil(asset.height * scale) };
}

async function printImage(asset: AssetDefinition, cards: Card[]): Promise<Uint8Array> {
  const size = printImageSize(asset, cards);
  const key = `${asset.id}:${size.width}:${size.height}`;
  if (printImageCache.has(key)) return printImageCache.get(key)!;
  const request = (async () => {
    const bytes = await loadBytes(asset.print);
    if (typeof document === 'undefined' || size.width >= asset.width && size.height >= asset.height) return bytes;
    const imageBlob = new Blob([bytes.slice().buffer], { type: 'image/png' });
    let objectUrl: string | undefined;
    const bitmap: ImageBitmap | HTMLImageElement = typeof createImageBitmap === 'function' ? await createImageBitmap(imageBlob) : await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); objectUrl = URL.createObjectURL(imageBlob);
      image.onload = () => resolve(image); image.onerror = () => { if (objectUrl) URL.revokeObjectURL(objectUrl); reject(new Error('Не удалось декодировать иллюстрацию для PDF.')); }; image.src = objectUrl;
    });
    try {
      const canvas = document.createElement('canvas'); canvas.width = size.width; canvas.height = size.height;
      const context = canvas.getContext('2d');
      if (!context) return bytes;
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, size.width, size.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Не удалось подготовить иллюстрацию для PDF.')), 'image/png'));
      return new Uint8Array(await blob.arrayBuffer());
    } finally { if ('close' in bitmap) bitmap.close(); if (objectUrl) URL.revokeObjectURL(objectUrl); byteCache.delete(asset.print); }
  })().catch(error => { printImageCache.delete(key); throw error; });
  printImageCache.set(key, request);
  // Keep at most one practical set of optimized print resources between exports.
  if (printImageCache.size > 64) printImageCache.delete(printImageCache.keys().next().value!);
  return request;
}

async function loadPrintFont(text: TextElement): Promise<{ resource: FontResource; text: TextElement; replaced: boolean }> {
  const requestedFont = fonts.find(font => font.id === text.fontId) as FontDefinition | undefined;
  let font = requestedFont || getFont('sans');
  if (!font) throw new Error('Базовый шрифт недоступен. Повторите загрузку страницы.');
  let style = fontStyle(text);
  let file = fontFile(font, style);
  let replaced = !requestedFont;
  if (!file) { style = 'normal'; file = font.regular; replaced = true; }
  let bytes: Uint8Array;
  try { bytes = await loadBytes(file); }
  catch {
    font = getFont('sans');
    if (!font) throw new Error('Не удалось загрузить шрифт для PDF. Проверьте соединение и повторите попытку.');
    style = 'normal'; file = font.regular; bytes = await loadBytes(file); replaced = true;
  }
  const resolvedText: TextElement = { ...text, fontId: font.id, weight: style === 'bold' || style === 'bolditalic' ? 'bold' : 'normal', italic: style === 'italic' || style === 'bolditalic' };
  if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
    const key = `${font.id}:${style}:${file}`;
    if (!fontFaces.has(key)) {
      const face = new FontFace(font.family, bytes.slice().buffer, { weight: resolvedText.weight === 'bold' ? '700' : '400', style: resolvedText.italic ? 'italic' : 'normal' });
      const loaded = face.load().then(value => { document.fonts.add(value); }).catch(error => { fontFaces.delete(key); throw error; });
      fontFaces.set(key, loaded);
    }
    await fontFaces.get(key);
    await document.fonts.ready;
  }
  return { resource: { id: font.id, family: font.family, style, file, bytes }, text: resolvedText, replaced };
}

export async function preparePrint(project: ProjectDocument): Promise<PreparedPrint> {
  const snapshot = structuredClone(project);
  const issues: ValidationIssue[] = [];
  const fontMap = new Map<string, FontResource>();
  const resolved = await Promise.all(snapshot.cards.map(card => loadPrintFont(card.text)));
  snapshot.cards.forEach((card, index) => {
    const { resource, text, replaced } = resolved[index];
    card.text = text;
    fontMap.set(`${resource.id}:${resource.style}`, resource);
    if (replaced) issues.push({ code: 'font-replaced', severity: 'warning', cardId: card.id, element: 'text', message: `Шрифт карточки ${card.number} заменён доступным шрифтом «${resource.family}». Переносы проверены повторно.` });
  });
  const layout = calculatePrintLayout(snapshot);
  issues.push(...validateProject(snapshot));
  return { project: snapshot, layout, issues, fonts: [...fontMap.values()] };
}

function offsetPath(path: PathOperation[], x: number, y: number): PathOperation[] {
  return path.map(operation => ({ ...operation, c: operation.c.map((coordinate, i) => coordinate + (i % 2 ? y : x)) })) as PathOperation[];
}

function rgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized;
  return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}

function interpolateColor(colors: string[], value: number): [number, number, number] {
  if (colors.length < 2) return rgb(colors[0] || '#ffffff');
  const segment = Math.min(colors.length - 2, Math.floor(Math.min(0.999999, Math.max(0, value)) * (colors.length - 1)));
  const fraction = Math.min(1, Math.max(0, value)) * (colors.length - 1) - segment;
  const start = rgb(colors[segment]); const end = rgb(colors[segment + 1]);
  return start.map((value, i) => Math.round(value + (end[i] - value) * fraction)) as [number, number, number];
}

function drawBackground(doc: jsPDF, background: Background, x: number, y: number, width: number, height: number) {
  if (background.kind === 'solid' || background.colors.length < 2) {
    doc.setFillColor(...rgb(background.colors[0] || '#fff9ee')); doc.rect(x, y, width, height, 'F'); return;
  }
  // Vector bands preserve smooth print gradients without rasterizing card text/artwork.
  const steps = 180;
  if (background.kind === 'radial') {
    doc.setFillColor(...rgb(background.colors.at(-1)!)); doc.rect(x, y, width, height, 'F');
    for (let step = steps; step > 0; step--) {
      doc.setFillColor(...interpolateColor(background.colors, step / steps));
      doc.ellipse(x + width * background.centerX, y + height * background.centerY, width * 0.7 * step / steps, height * 0.7 * step / steps, 'F');
    }
  } else {
    const a = background.angle * Math.PI / 180;
    // SVG objectBoundingBox gradients use normalized axes; the native normal
    // therefore needs reciprocal dimensions on non-square cards.
    const nx = Math.cos(a) / width; const ny = Math.sin(a) / height;
    const normalLength = Math.hypot(nx, ny);
    const length = 1 / normalLength;
    const ux = nx / normalLength; const uy = ny / normalLength;
    const sx = x + width / 2 - ux * length / 2; const sy = y + height / 2 - uy * length / 2;
    const extent = Math.hypot(width, height) * 2;
    doc.setFillColor(...rgb(background.colors[0])); doc.rect(x, y, width, height, 'F');
    for (let step = 0; step < steps; step++) {
      const start = step === 0 ? -extent : length * step / steps;
      const end = step === steps - 1 ? length + extent : length * (step + 1.5) / steps;
      const points: [number, number][] = [
        [sx + ux * start - uy * extent, sy + uy * start + ux * extent],
        [sx + ux * end - uy * extent, sy + uy * end + ux * extent],
        [sx + ux * end + uy * extent, sy + uy * end - ux * extent],
        [sx + ux * start + uy * extent, sy + uy * start - ux * extent],
      ];
      doc.setFillColor(...interpolateColor(background.colors, step / (steps - 1)));
      doc.path(points.map(([px, py], index) => ({ op: index ? 'l' : 'm', c: [px, py] })).concat([{ op: 'h', c: [] }])); doc.fill();
    }
  }
}

function drawCard(doc: jsPDF, card: Card, x: number, y: number, images: Map<string, Uint8Array>) {
  const outline = offsetPath(outlinePath(card), x, y);
  const cutout = card.hole ? offsetPath(ellipsePath(card.hole.x, card.hole.y, holeDiameter(card) / 2, holeDiameter(card) / 2), x, y) : [];
  doc.saveGraphicsState(); doc.path([...outline, ...cutout]); doc.clipEvenOdd(); doc.discardPath();
  drawBackground(doc, card.background, x, y, card.width, card.height);
  for (const decoration of card.decorations) {
    const path: PathOperation[] = decoration.type === 'circle' ? ellipsePath(decoration.x + decoration.width / 2, decoration.y + decoration.height / 2, decoration.width / 2, decoration.height / 2) : [...starPoints(decoration, decoration.points).map(([px, py], index): PathOperation => ({ op: index ? 'l' : 'm', c: [px, py] })), { op: 'h', c: [] }];
    doc.path(offsetPath(path, x, y));
    if (decoration.fill) doc.setFillColor(...rgb(decoration.fill));
    if (decoration.stroke) { doc.setDrawColor(...rgb(decoration.stroke)); doc.setLineWidth(ptToMm(decoration.strokeWidth)); }
    if (decoration.fill && decoration.stroke) doc.fillStroke(); else if (decoration.fill) doc.fill(); else if (decoration.stroke) doc.stroke(); else doc.discardPath();
  }
  const image = assets.find(asset => asset.id === card.illustration.assetId);
  const bytes = images.get(card.illustration.assetId);
  if (image && bytes) {
    const box = containBox(card.illustration, image.width, image.height);
    const cx = x + card.illustration.x + card.illustration.width / 2;
    const cy = y + card.illustration.y + card.illustration.height / 2;
    const a = card.illustration.rotation * Math.PI / 180;
    doc.advancedAPI(() => {
      doc.saveGraphicsState();
      doc.setCurrentTransformationMatrix(doc.Matrix(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), cx - Math.cos(a) * cx + Math.sin(a) * cy, cy - Math.sin(a) * cx - Math.cos(a) * cy));
      doc.addImage(bytes, 'PNG', x + box.x, y + box.y, box.width, box.height, image.id, 'FAST');
      doc.restoreGraphicsState();
    });
  }
  doc.setFont(fontFamilyId(card.text.fontId), fontStyle(card.text)); doc.setFontSize(card.text.fontSize); doc.setTextColor(...rgb(card.text.color));
  const text = layoutText(card.text);
  const tx = card.text.align === 'center' ? card.text.x + card.text.width / 2 : card.text.align === 'right' ? card.text.x + card.text.width : card.text.x;
  text.lines.forEach((line, index) => { if (line) doc.text(line, x + tx, y + text.baselines[index], { align: card.text.align, baseline: 'alphabetic' }); });
  doc.restoreGraphicsState();
  doc.setDrawColor(184, 184, 184); doc.setLineWidth(0.15); doc.setLineDashPattern([0.8, 0.6], 0); doc.path(outline); doc.stroke();
  if (card.hole) { doc.circle(x + card.hole.x, y + card.hole.y, holeDiameter(card) / 2, 'S'); }
  doc.setLineDashPattern([], 0);
}

export class PdfValidationError extends Error {
  issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) { super('Исправьте ошибки макета перед экспортом PDF.'); this.name = 'PdfValidationError'; this.issues = issues; }
}

export async function generatePdf(project: ProjectDocument, prepared?: PreparedPrint): Promise<Blob> {
  const print = prepared || await preparePrint(project);
  if (print.issues.some(issue => issue.severity === 'error')) throw new PdfValidationError(print.issues);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true, putOnlyUsedFonts: true });
  doc.setProperties({ title: 'Advent Tags', subject: 'Печатные адвент-теги для адвент-календаря', creator: 'Advent Tag Studio' });
  for (const font of print.fonts) { const file = `${font.id}-${font.style}.ttf`; doc.addFileToVFS(file, binaryString(font.bytes)); doc.addFont(file, fontFamilyId(font.id), font.style); }
  const images = new Map<string, Uint8Array>();
  const ids = [...new Set(print.project.cards.map(card => card.illustration.assetId))];
  let nextImage = 0;
  await Promise.all(Array.from({ length: Math.min(3, ids.length) }, async () => {
    while (nextImage < ids.length) {
      const id = ids[nextImage++]; const asset = getAsset(id);
      if (!asset) throw new Error('Иллюстрация для PDF недоступна.');
      images.set(id, await printImage(asset, print.project.cards.filter(card => card.illustration.assetId === id)));
    }
  }));
  print.layout.pages.forEach((page, pageIndex) => {
    if (pageIndex) doc.addPage('a4', 'portrait');
    for (const placement of page.placements) { const card = print.project.cards.find(card => card.id === placement.cardId); if (card) drawCard(doc, card, placement.x, placement.y, images); }
  });
  return doc.output('blob');
}

export async function downloadPdf(project: ProjectDocument, prepared?: PreparedPrint): Promise<void> {
  const blob = await generatePdf(project, prepared);
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'Advent-Tags.pdf'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
