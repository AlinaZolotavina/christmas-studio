import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createProject } from '../../domain/project';
import { generatePdf, preparePrint } from './generatePdf';

function installLocalFetch(missing = '') {
  vi.stubGlobal('fetch', async (url: string) => {
    if (missing && url.includes(missing)) return new Response('', { status: 404 });
    const path = resolve('public', url.replace(/^\.\//, '').replace(/^\//, ''));
    try { return new Response(await readFile(path)); } catch { return new Response('', { status: 404 }); }
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('real client PDF adapter', () => {
  it('embeds fonts, alpha PNG, physical A4 pages and exact cut paths', async () => {
    installLocalFetch();
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
  it('resolves an unavailable font and rechecks overflow before enabling export', async () => {
    installLocalFetch('PTSerif-Italic.ttf');
    const project = createProject('woodland', 24, () => 0.3);
    project.cards[0].text.italic = true;
    project.cards[0].text.content = 'Этот текст не поместится в крошечном блоке';
    project.cards[0].text.height = 1;
    const print = await preparePrint(project);
    expect(print.project.cards[0].text.fontId).toBe('sans');
    expect(print.project.cards[0].text.italic).toBe(false);
    expect(print.issues.some(issue => issue.code === 'font-replaced')).toBe(true);
    expect(print.issues.some(issue => issue.code === 'text-overflow')).toBe(true);
    await expect(generatePdf(project, print)).rejects.toThrow('Исправьте ошибки');
  });
  it('exports a complete 31-card set with unique art and 25 decorations each', async () => {
    installLocalFetch();
    const project = createProject('woodland', 31, () => 0.42);
    project.cards.forEach(card => {
      card.decorations = Array.from({ length: 25 }, (_, i) => ({ id: `decoration-${i}`, type: i % 2 ? 'star' : 'circle', x: 5 + i % 5 * 8, y: 20 + Math.floor(i / 5) * 8, width: 4, height: 4, fill: '#b58d52', stroke: '#315c4c', strokeWidth: 0.5, points: 5 }));
    });
    const started = performance.now();
    const print = await preparePrint(project);
    expect(print.issues.filter(issue => issue.severity === 'error')).toEqual([]);
    const blob = await generatePdf(project, print);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pdf = new TextDecoder('latin1').decode(bytes);
    expect((pdf.match(/\/Type \/Page\b/g) || []).length).toBe(print.layout.pages.length);
    expect(new Set(project.cards.map(card => card.illustration.assetId)).size).toBe(31);
    await mkdir(resolve('artifacts'), { recursive: true });
    await writeFile(resolve('artifacts/pdf-stress.pdf'), bytes);
    console.info(`PDF stress: ${print.layout.pages.length} pages, ${(blob.size / 1048576).toFixed(2)} MiB, ${Math.round(performance.now() - started)} ms`);
  }, 60_000);
});
