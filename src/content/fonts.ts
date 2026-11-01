import type { FontDefinition, FontId } from '../domain/types';

export const fonts: FontDefinition[] = [
  { id: 'sans', family: 'PT Sans', name: 'PT Sans', regular: 'fonts/PTSans-Regular.ttf', bold: 'fonts/PTSans-Bold.ttf', italic: 'fonts/PTSans-Italic.ttf', boldItalic: 'fonts/PTSans-BoldItalic.ttf' },
  { id: 'serif', family: 'PT Serif', name: 'PT Serif', regular: 'fonts/PTSerif-Regular.ttf', bold: 'fonts/PTSerif-Bold.ttf', italic: 'fonts/PTSerif-Italic.ttf', boldItalic: 'fonts/PTSerif-BoldItalic.ttf' },
  { id: 'script', family: 'Bad Script', name: 'Bad Script', regular: 'fonts/BadScript-Regular.ttf' },
];
export const getFont = (id: FontId): FontDefinition => fonts.find(font => font.id === id) ?? fonts[0];
