import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createProject } from '../../domain/project';
import { generatePdf, preparePrint } from './generatePdf';

afterEach(() => vi.unstubAllGlobals());

describe('real client PDF adapter', () => {
  it('embeds fonts, alpha PNG, physical A4 pages and exact cut paths', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      const path = resolve('public', url.replace(/^\.\//, '').replace(/^\//, ''));
      try { return new Response(await readFile(path)); } catch { return new Response('', { status: 404 }); }
    });
    const project = createProject('woodland', 24, () => 0.3);
    // Reuse art in this technology check; the factory uniqueness is tested separately.
    project.cards.forEach(card => { card.illustration.assetId = project.cards[0].illustration.assetId; });
    project.cards[0].text.content = 'С Новым\nгодом!';
    project.cards[0].text.fontSize = 12;
    project.cards[0].text.height = 18;
    project.cards[0].hole = { x: 25, y: 4 };
    project.cards[0].background = { kind: 'radial', colors: ['#ffffff', '#f5e7cd', '#b7ccba'], angle: 90, centerX: 0.5, centerY: 0.4 };
    project.cards[0].illustration.rotation = 8;
    const print = await preparePrint(project);
    expect(print.issues.filter(issue => issue.severity === 'error')).toEqual([]);
    const blob = await generatePdf(project, print);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pdf = new TextDecoder('latin1').decode(bytes);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    expect(pdf).toContain('/Title (Advent Tags)');
    expect(pdf).toContain('/ToUnicode');
    expect(pdf).toContain('/SMask');
    expect(pdf).toContain('/MediaBox [0 0 595.');
    expect(blob.size).toBeGreaterThan(50_000);
  }, 30_000);
});
