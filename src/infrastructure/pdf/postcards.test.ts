import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { unzlibSync } from 'fflate';
import { createImageElement, createLetteringElement, createPostcardProject, createTextElement } from '../../domain/postcards/project';
import { generatePostcardPdf, postcardExportSvg, preparePostcardExport } from './postcards';

afterEach(() => vi.unstubAllGlobals());
function localFetch() {
  vi.stubGlobal('fetch', async (url: string) => {
    try { return new Response(await readFile(resolve('public', url.replace(/^\.\//, '').replace(/^\//, '')))); }
    catch { return new Response('', { status: 404 }); }
  });
}

describe('postcard PDF and immutable export scene', () => {
  it('prints Cyrillic/Latin as vector paths at exact physical dimensions without PDF fonts', async () => {
    localFetch();
    const project = createPostcardProject({ name: 'Зимние открытки', count: 1, format: 'a6-portrait' });
    project.postcards[0].elements.push(createTextElement({ content: 'С Новым годом!\nMerry Christmas', x: 15, y: 20, width: 75, height: 28, fontSize: 18, letterSpacing: 0.4, rotation: 15, stroke: { color: '#C99C56', width: 0.5 } }));
    project.postcards[0].elements.push(createImageElement('rustic-wooden-star', { x: 25, y: 55, width: 55, height: 60, opacity: 0.8 }));
    project.postcards[0].elements.push(createLetteringElement('golden-merry-christmas-calligraphy', { x: 20, y: 112, width: 65, height: 25 }));
    const print = await preparePostcardExport(project);
    expect(print.issues.filter(issue => issue.severity === 'error')).toEqual([]);
    const blob = await generatePostcardPdf(print);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pdf = new TextDecoder('latin1').decode(bytes);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    const mediaBox = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect(Number(mediaBox[1])).toBeCloseTo(105 * 72 / 25.4, 4);
    expect(Number(mediaBox[2])).toBeCloseTo(148 * 72 / 25.4, 4);
    expect(pdf).not.toContain('/FontFile');
    expect(pdf).not.toContain('/ToUnicode');
    const stream = /stream\r?\n([\s\S]*?)\r?\nendstream/.exec(Buffer.from(bytes).toString('latin1'))![1];
    const content = new TextDecoder().decode(unzlibSync(Buffer.from(stream, 'latin1')));
    expect(content).not.toMatch(/\bBT\b/);
    expect((content.match(/\sc\n/g) ?? []).length).toBeGreaterThan(100);
    expect(content).not.toContain('[0.8 0.6]');
    const svg = postcardExportSvg(print, project.postcards[0].id, true);
    expect(svg).toContain('data:image/png;base64,');
    expect(svg).not.toContain('<text');
    expect(svg).toContain('rotate(15');
    expect(Object.isFrozen(print.project.postcards[0].elements)).toBe(true);
    project.postcards[0].elements[0].x = 1;
    expect(print.postcards[0].elements[0].x).toBe(15);
    await mkdir('artifacts', { recursive: true }); await writeFile('artifacts/postcard-vector.pdf', bytes);
  }, 30_000);
  it('lays mixed projects on A4 and blocks critical errors only in the selected scope', async () => {
    localFetch();
    const project = createPostcardProject({ count: 3, format: 'a6-portrait' });
    project.postcards[1].format = 'square'; project.postcards[2].format = 'a6-landscape';
    project.postcards[2].elements.push(createTextElement({ x: -1 }));
    const current = await preparePostcardExport(project, 'current');
    await expect(generatePostcardPdf(current)).resolves.toBeInstanceOf(Blob);
    const all = await preparePostcardExport(project, 'all');
    expect(all.layout).toMatchObject({ width: 210, height: 297 });
    await expect(generatePostcardPdf(all)).rejects.toThrow('Исправьте ошибки');
    project.postcards[2].elements = [];
    const clean = await preparePostcardExport(project, 'all');
    const pdf = new TextDecoder('latin1').decode(await (await generatePostcardPdf(clean)).arrayBuffer());
    expect((pdf.match(/\/Type \/Page\b/g) ?? []).length).toBe(clean.layout.pages.length);
    expect(pdf).toContain('/MediaBox [0 0 595.');
  });
});
