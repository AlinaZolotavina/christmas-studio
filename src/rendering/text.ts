import type { FontDefinition, FontId, TextElement } from '../domain/types';
import { ptToMm } from '../domain/types';

export const FONT_FAMILIES: Record<FontId, string> = { sans: 'PT Sans', serif: 'PT Serif', script: 'Bad Script' };
export interface TextLayout { lines: string[]; baselines: number[]; lineHeight: number; height: number; overflow: boolean; widths: number[] }
export type MeasureText = (text: string) => number;

let canvasContext: CanvasRenderingContext2D | null | undefined;
export function createTextMeasurer(element: TextElement): MeasureText {
  if (typeof document !== 'undefined') {
    canvasContext ??= document.createElement('canvas').getContext('2d');
    if (canvasContext) {
      const context = canvasContext;
      const family = FONT_FAMILIES[element.fontId] || FONT_FAMILIES.sans;
      context.font = `${element.italic ? 'italic' : 'normal'} ${element.weight} ${element.fontSize * 96 / 72}px "${family}"`;
      return value => context.measureText(value).width * 25.4 / 96;
    }
  }
  // Deterministic approximation is only used before fonts/DOM are available.
  return value => Array.from(value).reduce((sum, c) => sum + (/\s/.test(c) ? 0.27 : /[ilI1.,!:;]/.test(c) ? 0.28 : /[MWЖШЩЮ]/.test(c) ? 0.85 : 0.54), 0) * ptToMm(element.fontSize);
}

export function layoutText(element: TextElement, measure: MeasureText = createTextMeasurer(element)): TextLayout {
  const lines: string[] = [];
  const maxWidth = Math.max(0.01, element.width);
  const content = element.content.replace(/\r\n?/g, '\n');
  for (const paragraph of content.split('\n')) {
    if (paragraph.length === 0) { lines.push(''); continue; }
    let current = '';
    const tokens = paragraph.match(/\S+\s*|\s+/g) || [];
    for (const token of tokens) {
      const candidate = current + token;
      if (measure(candidate.trimEnd()) <= maxWidth) { current = candidate; continue; }
      if (current.trimEnd()) { lines.push(current.trimEnd()); current = ''; }
      const word = token.trimStart();
      if (measure(word.trimEnd()) <= maxWidth) { current = word; continue; }
      for (const char of Array.from(word)) {
        if (current && measure(current + char) > maxWidth) { lines.push(current.trimEnd()); current = ''; }
        current += char;
      }
    }
    lines.push(current.trimEnd());
  }
  const lineHeight = ptToMm(element.fontSize) * 1.22;
  const height = lines.length * lineHeight;
  const widths = lines.map(measure);
  return { lines, widths, lineHeight, height, baselines: lines.map((_, i) => element.y + ptToMm(element.fontSize) * 0.9 + lineHeight * i), overflow: height > element.height + 0.03 || widths.some(width => width > element.width + 0.03) };
}

/** Tighten the current line layout while retaining its horizontal text anchor and top edge. */
export function fitTextBox(element: TextElement, measure: MeasureText = createTextMeasurer(element)): TextElement {
  const layout = layoutText(element, measure);
  const longestLine = Math.max(0, ...layout.widths);
  let width = longestLine > 0 ? Math.max(0.01, longestLine) : 1;
  const sameLines = (candidateWidth: number) => {
    const candidate = layoutText({ ...element, width: candidateWidth }, measure);
    return candidate.lines.length === layout.lines.length && candidate.lines.every((line, index) => line === layout.lines[index]);
  };
  // Preserve greedy wrapping even when measured spaces or rounding make the tight width differ.
  if (width < element.width && !sameLines(width)) {
    let lower = width;
    let upper = element.width;
    for (let index = 0; index < 32; index += 1) {
      const middle = (lower + upper) / 2;
      if (sameLines(middle)) upper = middle;
      else lower = middle;
    }
    width = upper;
  }
  const x = element.align === 'center' ? element.x + (element.width - width) / 2 : element.align === 'right' ? element.x + element.width - width : element.x;
  return { ...element, x, width, height: Math.max(layout.lineHeight, layout.height) };
}

export function fontStyle(element: Pick<TextElement, 'weight' | 'italic'>): 'normal' | 'bold' | 'italic' | 'bolditalic' {
  return element.weight === 'bold' ? element.italic ? 'bolditalic' : 'bold' : element.italic ? 'italic' : 'normal';
}

export function fontFile(font: FontDefinition, style: ReturnType<typeof fontStyle>): string | undefined {
  return style === 'bolditalic' ? font.boldItalic : style === 'italic' ? font.italic : style === 'bold' ? font.bold : font.regular;
}
