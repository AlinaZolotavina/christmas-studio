import { describe, expect, it } from 'vitest';
import { artisticPostcardTemplates, blankPostcardTemplates } from '../../data/postcard-templates';
import { boxPoints } from '../geometry';
import { createImageElement, createTextElement } from './project';
import { fitPostcardTemplate } from './templates';
import { FORMAT_SIZES, type PostcardFormat, type PostcardTemplate } from './types';

function expectCenteredAndContained(template: PostcardTemplate) {
  const points = template.elements.flatMap(element => boxPoints(element, element.rotation));
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  const size = FORMAT_SIZES[template.format];
  expect(left).toBeGreaterThanOrEqual(3 - 1e-8); expect(top).toBeGreaterThanOrEqual(3 - 1e-8);
  expect(right).toBeLessThanOrEqual(size.width - 3 + 1e-8); expect(bottom).toBeLessThanOrEqual(size.height - 3 + 1e-8);
  expect((left + right) / 2).toBeCloseTo(size.width / 2, 8);
  expect((top + bottom) / 2).toBeCloseTo(size.height / 2, 8);
}

describe('fitting postcard templates to a selected format', () => {
  for (const source of artisticPostcardTemplates) for (const format of Object.keys(FORMAT_SIZES) as PostcardFormat[]) {
    if (format === source.format) continue;
    it(`fits and centers ${source.id} in ${format} without altering its proportions or source`, () => {
      const original = structuredClone(source);
      const fitted = fitPostcardTemplate(source, format);
      expect(fitted.format).toBe(format);
      expectCenteredAndContained(fitted);
      const scale = fitted.elements[0].width / source.elements[0].width;
      fitted.elements.forEach((element, index) => {
        expect(element.width / element.height).toBeCloseTo(source.elements[index].width / source.elements[index].height, 10);
        expect(element.width / source.elements[index].width).toBeCloseTo(scale, 10);
        expect(element.rotation).toBe(source.elements[index].rotation);
      });
      expect(source).toEqual(original);
    });
  }

  it('keeps authored native layouts exact and handles empty starters', () => {
    for (const template of artisticPostcardTemplates) expect(fitPostcardTemplate(template, template.format)).toBe(template);
    const blank = fitPostcardTemplate(blankPostcardTemplates[0], 'square');
    expect(blank.format).toBe('square'); expect(blank.elements).toEqual([]);
  });

  it('accounts for rotations and scales text and effects along with the composition', () => {
    const source: PostcardTemplate = {
      ...blankPostcardTemplates[0],
      elements: [
        createImageElement('santa-gift-sack', { x: 15, y: 20, width: 45, height: 70, rotation: 45 }),
        createTextElement({ x: 10, y: 100, width: 85, height: 20, fontSize: 30, letterSpacing: 2, stroke: { color: '#FFFFFF', width: 1 }, shadow: { color: '#000000', offsetX: 1, offsetY: 2, blur: 0.5 } }),
      ],
    };
    const original = structuredClone(source);
    const fitted = fitPostcardTemplate(source, 'a6-landscape');
    expectCenteredAndContained(fitted);
    const text = fitted.elements[1], scale = text.width / 85;
    expect(text).toMatchObject({ fontSize: 30 * scale, letterSpacing: 2 * scale, stroke: { width: scale }, shadow: { offsetX: scale, offsetY: 2 * scale, blur: 0.5 * scale } });
    expect(source).toEqual(original);
  });
});
