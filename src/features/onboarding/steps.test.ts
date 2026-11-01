import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tourSteps } from './steps';

describe('approved tour copy', () => {
  it('preserves all five reference headings and paragraphs with only the approved UI wording changes', () => {
    const reference = readFileSync('tests/fixtures/tour-reference.md', 'utf8').replace(/\r/g, '')
      .replace('цвет или изображение', 'цвет или градиент')
      .replace('Когда оформление будет готово, откройте вкладку «Экспорт»', 'Когда оформление будет готово, на компьютере нажмите кнопку экспорта, на планшете или телефоне — откройте вкладку «Экспорт»');
    const sections = reference.split(/^### \d+\. /m).filter(Boolean).map(section => {
      const [title, ...paragraphs] = section.trim().split(/\n\n+/);
      return { title: title.trim(), paragraphs: paragraphs.map(paragraph => paragraph.trim()) };
    });
    expect(tourSteps.map(({ title, paragraphs }) => ({ title, paragraphs }))).toEqual(sections);
    expect(tourSteps).toHaveLength(5);
  });
});
