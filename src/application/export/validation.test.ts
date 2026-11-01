import { describe, expect, it } from 'vitest';
import { createProject } from '../../domain/project';
import { validateProject } from './validation';

describe('export validation severity', () => {
  it('warns about silhouette clipping and blocks content beyond A4 printable bounds', () => {
    const project = createProject('woodland', 24, () => 0.2);
    const card = project.cards[0];
    card.illustration.x = -1;
    expect(validateProject(project).some(issue => issue.cardId === card.id && issue.code === 'illustration-outside-card' && issue.severity === 'warning')).toBe(true);
    card.illustration.x = -200;
    expect(validateProject(project).some(issue => issue.cardId === card.id && issue.code === 'content-outside-print-area' && issue.severity === 'error')).toBe(true);
  });
  it('reports missing catalog IDs as errors without throwing', () => {
    const project = createProject('woodland', 24, () => 0.2);
    project.cards[0].illustration.assetId = 'not-present';
    expect(validateProject(project).some(issue => issue.code === 'missing-asset')).toBe(true);
  });
  it('blocks text overflow while retaining the entire content', () => {
    const project = createProject('woodland', 24, () => 0.2);
    project.cards[0].text.content = 'Не уменьшать автоматически';
    project.cards[0].text.height = 1;
    expect(validateProject(project).some(issue => issue.code === 'text-overflow')).toBe(true);
    expect(project.cards[0].text.content).toBe('Не уменьшать автоматически');
  });
});
