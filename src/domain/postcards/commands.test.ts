import { describe, expect, it } from 'vitest';
import { executePostcardCommand } from './commands';
import { clonePostcard, createDecorationElement, createImageElement, createLetteringElement, createPostcardProject, createTextElement } from './project';
import { FORMAT_SIZES, getPostcardSize } from './types';
import type { PostcardProject, PostcardTemplate } from './types';
import { validatePostcardProject } from './validation';

const fixture = (count = 2) => createPostcardProject({ count, format: 'a6-portrait' });
const template = (): PostcardTemplate => ({ id: 'test-editable-template', name: { ru: 'Тест', en: 'Test' }, format: 'a6-portrait', background: { kind: 'linear', colors: ['#FFFFFF', '#DDEEDD'], angle: 30, centerX: 0.5, centerY: 0.5 }, elements: [createTextElement({ content: 'Поздравляю!', locked: true, shadow: { color: '#123456', offsetX: 1, offsetY: 2, blur: 0.5 } })] });
const addText = (project: PostcardProject) => executePostcardCommand(project, { type: 'add-element', postcardId: project.postcards[0].id, element: createTextElement() }).project;

describe('postcard document invariants', () => {
  it('inherits rounding only for new cards, preserves it on copies and replacements, and accepts an explicit override', () => {
    let project = createPostcardProject({ count: 2, format: 'square', cornerRadius: 6.5 });
    expect(project.defaultCornerRadius).toBe(6.5);
    expect(project.postcards.map(card => card.cornerRadius)).toEqual([6.5, 6.5]);
    project = executePostcardCommand(project, { type: 'set-default-corner-radius', cornerRadius: 10 }).project;
    expect(project.postcards.map(card => card.cornerRadius)).toEqual([6.5, 6.5]);
    project = executePostcardCommand(project, { type: 'set-corner-radius', postcardId: project.activePostcardId, cornerRadius: 4 }).project;
    project = executePostcardCommand(project, { type: 'duplicate-postcard', postcardId: project.activePostcardId }).project;
    expect(project.postcards[1].cornerRadius).toBe(4);
    project = executePostcardCommand(project, { type: 'add-postcard' }).project;
    const added = project.postcards.find(card => card.id === project.activePostcardId)!;
    expect(added.cornerRadius).toBe(10);
    project = executePostcardCommand(project, { type: 'apply-template', postcardId: added.id, template: template() }).project;
    expect(project.postcards.find(card => card.id === added.id)?.cornerRadius).toBe(10);
    project = executePostcardCommand(project, { type: 'apply-template', postcardId: added.id, template: template(), cornerRadius: 2 }).project;
    expect(project.postcards.find(card => card.id === added.id)?.cornerRadius).toBe(2);
    project = executePostcardCommand(project, { type: 'add-postcard', cornerRadius: 0 }).project;
    expect(project.postcards.find(card => card.id === project.activePostcardId)?.cornerRadius).toBe(0);
  });

  it.each([-1, 20.01, NaN, Infinity])('rejects invalid rounding %s atomically', cornerRadius => {
    const project = fixture(1);
    expect(() => createPostcardProject({ count: 1, format: 'square', cornerRadius })).toThrow();
    for (const command of [
      { type: 'set-corner-radius' as const, postcardId: project.activePostcardId, cornerRadius },
      { type: 'set-default-corner-radius' as const, cornerRadius },
      { type: 'add-postcard' as const, cornerRadius },
      { type: 'apply-template' as const, postcardId: project.activePostcardId, template: template(), cornerRadius },
    ]) {
      const outcome = executePostcardCommand(project, command);
      expect(outcome.result.error).toBeTruthy(); expect(outcome.project).toBe(project);
    }
  });

  it('supports the three physical formats and changes a canvas without moving its design', () => {
    expect(FORMAT_SIZES).toEqual({ 'a6-portrait': { width: 105, height: 148 }, 'a6-landscape': { width: 148, height: 105 }, square: { width: 105, height: 105 } });
    let project = addText(fixture());
    const before = project.postcards[0];
    const other = project.postcards[1];
    project = executePostcardCommand(project, { type: 'set-default-format', format: 'square' }).project;
    expect(project.postcards[0]).toBe(before);
    project = executePostcardCommand(project, { type: 'set-format', postcardId: before.id, format: 'a6-landscape' }).project;
    expect(getPostcardSize(project.postcards[0])).toEqual({ width: 148, height: 105 });
    expect(project.postcards[0].elements).toEqual(before.elements);
    expect(project.postcards[1]).toBe(other);
    project = executePostcardCommand(project, { type: 'add-postcard' }).project;
    expect(project.postcards.at(-1)?.format).toBe('square');
  });

  it('creates first-only and all-card template copies with independent IDs and nested values', () => {
    const source = template();
    const firstOnly = createPostcardProject({ count: 3, format: 'square', template: source });
    expect(firstOnly.postcards.map(card => card.elements.length)).toEqual([1, 0, 0]);
    const project = createPostcardProject({ count: 3, format: 'square', template: source, applyToAll: true });
    const allIds = project.postcards.flatMap(card => [card.id, ...card.elements.map(element => element.id)]);
    expect(new Set(allIds).size).toBe(6);
    expect(project.postcards.every(card => card.elements[0].locked === false)).toBe(true);
    const changed = executePostcardCommand(project, { type: 'update-element', postcardId: project.postcards[0].id, elementId: project.postcards[0].elements[0].id, patch: { content: 'Другая открытка', shadow: { color: '#FFFFFF', offsetX: 5, offsetY: 5, blur: 1 } } }).project;
    expect(changed.postcards[1]).toBe(project.postcards[1]);
    expect(changed.postcards[1].elements[0]).toMatchObject({ content: 'Поздравляю!', shadow: { offsetX: 1 } });
    expect(source.elements[0]).toMatchObject({ content: 'Поздравляю!', locked: true });
    expect(project.postcards[0].background).not.toBe(project.postcards[1].background);
  });

  it('rejects card 21 and element 101 atomically across all creation paths', () => {
    const full = fixture(20);
    for (const command of [{ type: 'add-postcard' as const }, { type: 'duplicate-postcard' as const, postcardId: full.postcards[0].id }]) {
      const outcome = executePostcardCommand(full, command);
      expect(outcome.project).toBe(full);
      expect(outcome.result.error).toContain('20');
    }
    const project = fixture(1);
    project.postcards[0].elements = Array.from({ length: 100 }, () => createTextElement());
    for (const command of [{ type: 'add-element' as const, postcardId: project.postcards[0].id, element: createTextElement() }, { type: 'duplicate-element' as const, postcardId: project.postcards[0].id, elementId: project.postcards[0].elements[0].id }]) {
      const outcome = executePostcardCommand(project, command);
      expect(outcome.project).toBe(project);
      expect(outcome.result.changed).toBe(false);
      expect(outcome.result.error).toContain('100');
    }
    const oversized = template();
    oversized.elements = Array.from({ length: 101 }, () => createTextElement());
    expect(executePostcardCommand(project, { type: 'apply-template', postcardId: project.postcards[0].id, template: oversized }).project).toBe(project);
    expect(() => createPostcardProject({ count: 2, format: 'square', template: oversized })).toThrow('100');
    expect(() => fixture(0)).toThrow();
    expect(() => fixture(21)).toThrow();
  });

  it('never removes the final card and keeps array order authoritative', () => {
    const one = fixture(1);
    expect(executePostcardCommand(one, { type: 'remove-postcard', postcardId: one.activePostcardId }).project).toBe(one);
    const project = fixture(3);
    const ids = project.postcards.map(card => card.id);
    const reordered = executePostcardCommand(project, { type: 'reorder-postcard', postcardId: ids[2], index: 0 }).project;
    expect(reordered.postcards.map(card => card.id)).toEqual([ids[2], ids[0], ids[1]]);
    const removed = executePostcardCommand(reordered, { type: 'remove-postcard', postcardId: ids[0] }).project;
    expect(removed.postcards.map(card => card.id)).toEqual([ids[2], ids[1]]);
    expect(removed.activePostcardId).toBe(ids[1]);
  });

  it('locks transformations, content edits and deletion in the command layer', () => {
    let project = addText(fixture(1));
    const postcardId = project.activePostcardId;
    const elementId = project.postcards[0].elements[0].id;
    project = executePostcardCommand(project, { type: 'set-element-lock', postcardId, elementId, locked: true }).project;
    for (const patch of [{ x: 20 }, { width: 20 }, { rotation: 45 }, { content: 'Нельзя' }]) {
      const rejected = executePostcardCommand(project, { type: 'update-element', postcardId, elementId, patch });
      expect(rejected.project).toBe(project);
      expect(rejected.result.error).toContain('разблокируйте');
    }
    expect(executePostcardCommand(project, { type: 'remove-element', postcardId, elementId }).project).toBe(project);
    const unlocked = executePostcardCommand(project, { type: 'set-element-lock', postcardId, elementId, locked: false }).project;
    expect(executePostcardCommand(unlocked, { type: 'remove-element', postcardId, elementId }).project.postcards[0].elements).toEqual([]);
  });

  it('preserves graphic proportions and snaps every element kind to 15 degrees', () => {
    let project = fixture(1);
    const elements = [createTextElement(), createImageElement('rustic-wooden-star'), createLetteringElement('believe-in-magic-calligraphy'), createDecorationElement()];
    project.postcards[0].elements = elements;
    for (const element of elements) {
      const outcome = executePostcardCommand(project, { type: 'update-element', postcardId: project.activePostcardId, elementId: element.id, patch: { rotation: 23, width: element.width * 2 } });
      expect(outcome.result.error).toBeUndefined();
      const updated = outcome.project.postcards[0].elements.find(item => item.id === element.id)!;
      expect(updated.rotation).toBe(30);
      if (element.type === 'text') expect(updated.height).toBe(element.height);
      else expect(updated.width / updated.height).toBeCloseTo(element.width / element.height);
      project = outcome.project;
    }
    const image = project.postcards[0].elements[1];
    expect(executePostcardCommand(project, { type: 'update-element', postcardId: project.activePostcardId, elementId: image.id, patch: { width: 1, height: 100 } }).project).toBe(project);
  });

  it('duplicates complete cards and elements independently, preserving layer and lock state', () => {
    const project = addText(fixture(1));
    project.postcards[0].elements.push(createDecorationElement({ locked: true }));
    const original = structuredClone(project);
    const copy = clonePostcard(project.postcards[0]);
    expect(copy.id).not.toBe(project.postcards[0].id);
    expect(copy.elements.map(item => item.id).some(id => project.postcards[0].elements.some(item => item.id === id))).toBe(false);
    expect(copy.elements.map(item => item.type)).toEqual(['text', 'decoration']);
    expect(copy.elements[1].locked).toBe(true);
    copy.background = { kind: 'solid', colors: ['#000000'], angle: 0, centerX: 0.5, centerY: 0.5 };
    (copy.elements[0] as ReturnType<typeof createTextElement>).content = 'Копия';
    expect(project).toEqual(original);
    const duplicate = executePostcardCommand(project, { type: 'duplicate-element', postcardId: project.activePostcardId, elementId: project.postcards[0].elements[0].id }).project;
    expect(duplicate.postcards[0].elements).toHaveLength(3);
    expect(duplicate.postcards[0].elements[1].id).not.toBe(project.postcards[0].elements[0].id);
    expect(duplicate.postcards[0].elements[1].x).toBe(project.postcards[0].elements[0].x + 2);
    const reordered = executePostcardCommand(duplicate, { type: 'reorder-element', postcardId: project.activePostcardId, elementId: duplicate.postcards[0].elements[1].id, index: 0 }).project;
    expect(reordered.postcards[0].elements[0].id).toBe(duplicate.postcards[0].elements[1].id);
  });

  it('applies a template in the chosen format without scaling elements or mutating its source', () => {
    const source = template();
    const project = fixture(2);
    const replaced = executePostcardCommand(project, { type: 'apply-template', postcardId: project.activePostcardId, template: source, format: 'a6-landscape' }).project;
    expect(replaced.postcards[0]).toMatchObject({ id: project.activePostcardId, format: 'a6-landscape' });
    expect(replaced.postcards[0].elements[0]).toMatchObject({ x: source.elements[0].x, y: source.elements[0].y, width: source.elements[0].width, height: source.elements[0].height, locked: false });
    expect(replaced.postcards[0].elements[0].id).not.toBe(source.elements[0].id);
    expect(replaced.postcards[1]).toBe(project.postcards[1]);
  });

  it('rejects malformed persisted leaves and missing resources before rendering', () => {
    const mutations = [
      (project: PostcardProject) => { project.postcards[0].elements[0].x = Infinity; },
      (project: PostcardProject) => { project.postcards[0].elements[0].rotation = 2; },
      (project: PostcardProject) => { project.activePostcardId = 'missing'; },
      (project: PostcardProject) => { project.postcards[1].id = project.postcards[0].id; },
      (project: PostcardProject) => { project.postcards[1].elements.push(structuredClone(project.postcards[0].elements[0])); },
      (project: PostcardProject) => { project.postcards[0].background = { kind: 'image', assetId: 'missing', color: '#FFFFFF' }; },
    ];
    for (const mutate of mutations) {
      const project = addText(fixture());
      mutate(project);
      expect(() => validatePostcardProject(project)).toThrow();
    }
  });
});
