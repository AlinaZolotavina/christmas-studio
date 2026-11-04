import { describe, expect, it } from 'vitest';
import { createDecorationElement, createPostcardProject, createTextElement } from '../../domain/postcards/project';
import { validatePostcardProject } from './postcardValidation';

describe('postcard scoped live and preflight checks', () => {
  it.each([
    ['completely outside', -20, 'element-outside-postcard'],
    ['partially outside', -1, 'element-outside-postcard'],
    ['inside the unsafe margin', 2.999, 'safe-margin'],
    ['exactly at the three-millimetre safe margin', 3, null],
  ] as const)('checks artwork %s', (_name, x, code) => {
    const project = createPostcardProject({ count: 1, format: 'square' });
    const artwork = createDecorationElement({ shape: 'circle', x, y: 20, width: 10, height: 10, stroke: null });
    project.postcards[0].elements.push(artwork);
    const issues = validatePostcardProject(project, { preflight: true });
    if (code) expect(issues).toContainEqual(expect.objectContaining({ code, severity: code === 'safe-margin' ? 'warning' : 'error', elementId: artwork.id }));
    else expect(issues).toEqual([]);
  });
  it('keeps current-card exports independent of another postcard error', () => {
    const project = createPostcardProject({ count: 2, format: 'a6-portrait' });
    const text = createTextElement({ x: -2, y: 10, width: 70, height: 30 });
    project.postcards[1].elements.push(text);
    expect(validatePostcardProject(project, { scope: 'current' })).toEqual([]);
    expect(validatePostcardProject(project)).toContainEqual(expect.objectContaining({ code: 'element-outside-postcard', severity: 'error', postcardId: project.postcards[1].id, elementId: text.id }));
  });
  it('uses rotated stroke and shadow bounds instead of checking only unrotated coordinates', () => {
    const project = createPostcardProject({ count: 1, format: 'square' });
    const text = createTextElement({ x: 2, y: 10, width: 80, height: 30, rotation: 45, stroke: { color: '#FFFFFF', width: 4 }, shadow: { color: '#000000', offsetX: 2, offsetY: 2, blur: 1 } });
    project.postcards[0].elements.push(text);
    expect(validatePostcardProject(project)).toContainEqual(expect.objectContaining({ code: 'element-outside-postcard', elementId: text.id }));
  });
  it('shows the three-millimetre and cover-cropped DPI warnings only at preflight', () => {
    const project = createPostcardProject({ count: 1, format: 'a6-landscape' });
    const text = createTextElement({ x: 2, y: 5, width: 80, height: 30 });
    project.postcards[0].elements.push(text);
    project.postcards[0].background = { kind: 'image', assetId: 'watercolor-winter-sky-snowflakes', color: '#FFFFFF' };
    expect(validatePostcardProject(project)).toEqual([]);
    const preflight = validatePostcardProject(project, { preflight: true });
    expect(preflight).toContainEqual(expect.objectContaining({ code: 'safe-margin', severity: 'warning', elementId: text.id }));
    expect(preflight).toContainEqual(expect.objectContaining({ code: 'background-resolution', severity: 'warning', postcardId: project.postcards[0].id }));
  });
});
