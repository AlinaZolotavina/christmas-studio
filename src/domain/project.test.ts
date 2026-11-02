import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/assets', () => ({ assets: Array.from({ length: 36 }, (_, index) => ({ id: `image-${index}`, name: `Image ${index}`, category: 'winter', width: 100, height: 120, preview: '', print: '' })) }));
vi.mock('../content/templates', () => ({ templates: [{ id: 'winter', name: 'Winter', description: '', eyebrow: '', color: '#315C4C', background: '#FFF9ED', shape: 'tag', fontId: 'serif', assetIds: ['image-0'] }] }));

import { createProject } from './project';
import { templates } from '../content/templates';

describe('project factory', () => {
  it.each([24, 31] as const)('creates %i stable, uniquely illustrated cards', count => {
    const project = createProject('winter', count, () => 0.25);
    expect(project.cards).toHaveLength(count);
    expect(project.cards.map(card => card.number)).toEqual(Array.from({ length: count }, (_, index) => index + 1));
    expect(new Set(project.cards.map(card => card.illustration.assetId)).size).toBe(count);
    expect(new Set(project.cards.map(card => card.id)).size).toBe(count);
    expect(project.cards[0].width).toBe(50);
    expect(project.cards[0].height).toBe(80);
    expect(project.cards.every(card => card.text.content === String(card.number) && card.decorations.length === 0)).toBe(true);
    expect(JSON.parse(JSON.stringify(project))).toEqual(project);
  });

  it('uses an injectable RNG and rejects unknown templates', () => {
    const first = createProject('winter', 31, () => 0.5);
    const second = createProject('winter', 31, () => 0.5);
    expect(first.cards.map(card => card.illustration.assetId)).toEqual(second.cards.map(card => card.illustration.assetId));
    expect(() => createProject('missing', 24)).toThrow('Шаблон не найден');
    expect(() => createProject('winter', 24, () => 1)).toThrow('Генератор');
  });

  it('keeps a complete themed selection instead of mixing in unrelated catalog artwork', () => {
    const previous = templates[0].assetIds;
    templates[0].assetIds = Array.from({ length: 31 }, (_, index) => `image-${index}`);
    try {
      const project = createProject('winter', 31, () => 0.42);
      expect(new Set(project.cards.map(card => card.illustration.assetId))).toEqual(new Set(templates[0].assetIds));
    } finally { templates[0].assetIds = previous; }
  });
});
