import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/assets', () => ({ assets: Array.from({ length: 36 }, (_, index) => ({ id: `image-${index}`, name: '', category: '', width: 100, height: 100, preview: '', print: '' })) }));
vi.mock('../content/templates', () => ({ templates: [{ id: 'winter', name: 'Winter', description: '', eyebrow: '', color: '#315C4C', background: '#FFF9ED', shape: 'tag', fontId: 'serif', assetIds: [] }] }));

import { createProject } from './project';
import { executeCommand } from './commands';

const fixture = () => createProject('winter', 24, () => 0.5);

describe('atomic document commands', () => {
  it('preserves individual content and positions during a global text update', () => {
    const project = fixture();
    project.cards[1].text.x = 9;
    const before = structuredClone(project);
    const outcome = executeCommand(project, { type: 'update-text', cardId: project.cards[0].id, scope: 'all', patch: { content: 'overwrite', x: 20, y: 30, fontSize: 18, color: '#112233' } });
    expect(outcome.result.changedCardIds).toHaveLength(24);
    expect(outcome.project.cards[1].text).toMatchObject({ content: '2', x: 9, y: before.cards[1].text.y, fontSize: 18, color: '#112233' });
    expect(project).toEqual(before);
  });

  it('rejects invalid commands atomically', () => {
    const project = fixture();
    const before = structuredClone(project);
    const outcome = executeCommand(project, { type: 'update-text', cardId: project.cards[0].id, scope: 'all', patch: { fontSize: 100 } });
    expect(outcome.project).toBe(project);
    expect(outcome.result.changed).toBe(false);
    expect(outcome.result.error).toContain('6 до 72');
    expect(project).toEqual(before);
  });

  it('reports full cards and adds a decoration at relative positions to all others', () => {
    let project = fixture();
    const firstId = project.cards[0].id;
    for (let index = 0; index < 10; index += 1) project = executeCommand(project, { type: 'add-decoration', cardId: firstId, patch: { type: 'star' } }).project;
    project.cards[1].width = 100;
    const outcome = executeCommand(project, { type: 'add-decoration', cardId: firstId, scope: 'all', patch: { type: 'circle', x: 10, y: 20 } });
    expect(outcome.result.skippedCardIds).toEqual([firstId]);
    expect(outcome.result.warnings[0]).toContain('1');
    expect(outcome.project.cards[0].decorations).toHaveLength(10);
    expect(outcome.project.cards[1].decorations[0]).toMatchObject({ x: 20, y: 20, width: 10 });
    expect(outcome.result.changedCardIds).toHaveLength(23);
  });

  it('shares decoration style without erasing individual geometry', () => {
    let project = fixture();
    const firstId = project.cards[0].id;
    project = executeCommand(project, { type: 'add-decoration', cardId: firstId, scope: 'all', patch: { type: 'star', width: 8 } }).project;
    project.cards[1].decorations[0].width = 12;
    project.cards[1].decorations[0].x = 13;
    const outcome = executeCommand(project, { type: 'apply-decoration-type', cardId: firstId, scope: 'all', decorationType: 'star', patch: { fill: '#123456', points: 7 } });
    expect(outcome.project.cards[1].decorations[0]).toMatchObject({ width: 12, x: 13, fill: '#123456', points: 7 });
  });

  it('resizes geometry without changing numbering, template, image ratio or text font size', () => {
    const project = fixture();
    const before = project.cards[0];
    const outcome = executeCommand(project, { type: 'resize-card', cardId: before.id, patch: { width: 75, height: 120 } });
    const card = outcome.project.cards[0];
    expect(card.text.x).toBe(before.text.x * 1.5);
    expect(card.text.fontSize).toBe(before.text.fontSize);
    expect(card.illustration.width / card.illustration.height).toBeCloseTo(before.illustration.width / before.illustration.height);
    expect(card.number).toBe(1);
    expect(outcome.project.templateId).toBe(project.templateId);
    expect(outcome.project.cardCount).toBe(24);
  });

  it('rejects a hole outside the card and removes project holes together', () => {
    let project = fixture();
    project = executeCommand(project, { type: 'set-project-hole', enabled: true }).project;
    expect(project.cards.every(card => card.hole !== null)).toBe(true);
    const invalid = executeCommand(project, { type: 'move-hole', cardId: project.cards[0].id, patch: { x: -1, y: 5 } });
    expect(invalid.result.error).toContain('внутри');
    expect(invalid.project).toBe(project);
    const removed = executeCommand(project, { type: 'set-project-hole', enabled: false });
    expect(removed.project.cards.every(card => card.hole === null)).toBe(true);
  });

  it('rejects unknown illustration IDs in the domain itself', () => {
    const project = fixture();
    const outcome = executeCommand(project, { type: 'update-illustration', cardId: project.cards[0].id, patch: { assetId: 'unknown' } });
    expect(outcome.project).toBe(project);
    expect(outcome.result.error).toContain('не найдена');
  });

  it('rolls back every card when a mass resize fails on a later decoration', () => {
    let project = fixture();
    project = executeCommand(project, { type: 'add-decoration', cardId: project.cards[0].id, scope: 'all', patch: { type: 'circle' } }).project;
    project.cards[1].decorations[0].width = 15;
    const before = structuredClone(project);
    const outcome = executeCommand(project, { type: 'resize-card', cardId: project.cards[0].id, scope: 'all', patch: { width: 100, height: 160 } });
    expect(outcome.result.error).toContain('2 см');
    expect(outcome.result.changedCardIds).toEqual([]);
    expect(outcome.project).toBe(project);
    expect(project).toEqual(before);
  });

  it('rolls back a global hole operation when one card cannot fit a hole', () => {
    const project = fixture();
    project.cards[0].hole = null;
    project.cards[1].hole = null;
    project.cards[1].height = 1;
    const before = structuredClone(project);
    const outcome = executeCommand(project, { type: 'set-project-hole', enabled: true });
    expect(outcome.result.error).toContain('мала');
    expect(outcome.project).toBe(project);
    expect(project).toEqual(before);
  });

  it('rolls back invalid global decoration creation even after skipped full cards', () => {
    let project = fixture();
    for (let index = 0; index < 10; index += 1) project = executeCommand(project, { type: 'add-decoration', cardId: project.cards[0].id, patch: { type: 'circle' } }).project;
    const before = structuredClone(project);
    const outcome = executeCommand(project, { type: 'add-decoration', cardId: project.cards[0].id, scope: 'all', patch: { type: 'circle', width: 21 } });
    expect(outcome.result.error).toContain('2 см');
    expect(outcome.result.skippedCardIds).toEqual([]);
    expect(outcome.project).toBe(project);
    expect(project).toEqual(before);
  });
});
