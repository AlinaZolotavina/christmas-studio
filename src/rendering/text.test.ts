import { describe, expect, it } from 'vitest';
import { layoutText } from './text';
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
});
