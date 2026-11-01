import { describe, expect, it } from 'vitest';
import { fitTextBox, layoutText } from './text';
import type { TextElement } from '../domain/types';

const element: TextElement = { x: 0, y: 0, width: 12, height: 50, content: '', fontId: 'sans', fontSize: 12, weight: 'normal', italic: false, color: '#000000', align: 'left' };
describe('shared text layout', () => {
  it('preserves explicit empty lines and wraps paragraphs', () => {
    const text = layoutText({ ...element, content: 'one two\n\nтри четыре' }, value => value.length * 2);
    expect(text.lines).toEqual(['one', 'two', '', 'три', 'четыре']);
  });
  it('breaks long words without dropping Unicode characters', () => {
    const text = layoutText({ ...element, width: 4, content: 'АБВГД' }, value => Array.from(value).length * 2);
    expect(text.lines).toEqual(['АБ', 'ВГ', 'Д']);
  });
  it('reports overflow without changing the font size or clipping text', () => {
    const source = { ...element, height: 1, content: 'Очень длинная строка' };
    const text = layoutText(source, value => value.length);
    expect(text.overflow).toBe(true);
    expect(text.lines.join(' ')).toBe(source.content);
    expect(source.fontSize).toBe(12);
  });

  it.each(['left', 'center', 'right'] as const)('tightens a %s-aligned block while keeping its text anchor and top edge', align => {
    const source = { ...element, x: 8, y: 15, width: 30, height: 40, align, content: 'one\n\ntwo', fontSize: 18, weight: 'bold' as const, italic: true };
    const measure = (value: string) => value.length * 2;
    const fitted = fitTextBox(source, measure);
    expect(fitted.width).toBe(6);
    expect(fitted.height).toBeCloseTo(layoutText(source, measure).height);
    expect(fitted.y).toBe(source.y);
    if (align === 'left') expect(fitted.x).toBe(source.x);
    if (align === 'center') expect(fitted.x + fitted.width / 2).toBe(source.x + source.width / 2);
    if (align === 'right') expect(fitted.x + fitted.width).toBe(source.x + source.width);
    expect(fitted.content).toBe(source.content);
    expect(fitted.fontSize).toBe(18);
    expect(fitted.weight).toBe('bold');
    expect(fitted.italic).toBe(true);
    expect(layoutText(fitted, measure).lines).toEqual(['one', '', 'two']);
    expect(source.width).toBe(30);
  });

  it('keeps current soft wraps and Unicode characters without rewriting the content', () => {
    const source = { ...element, content: 'one two\n\nАБВГД' };
    const measure = (value: string) => Array.from(value).length * 2;
    const before = layoutText(source, measure);
    const fitted = fitTextBox(source, measure);
    expect(fitted.width).toBe(Math.max(...before.widths));
    expect(layoutText(fitted, measure).lines).toEqual(before.lines);
    expect(fitted.content).toBe(source.content);
  });

  it('keeps at least one empty line and a 1 mm wide block for empty text', () => {
    const fitted = fitTextBox({ ...element, x: 2, y: 3, align: 'center', content: '' }, () => 0);
    expect(fitted.width).toBe(1);
    expect(fitted.height).toBeCloseTo(layoutText(element, () => 0).lineHeight);
    expect(fitted.x + fitted.width / 2).toBe(8);
    expect(fitted.y).toBe(3);
    expect(fitted.content).toBe('');
  });
});
