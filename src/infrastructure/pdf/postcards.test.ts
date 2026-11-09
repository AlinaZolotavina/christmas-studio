import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { unzlibSync } from 'fflate';
import sharp from 'sharp';
import { createImageElement, createLetteringElement, createPostcardProject, createTextElement } from '../../domain/postcards/project';
import { generatePostcardPdf, postcardExportSvg, preparePostcardExport } from './postcards';

afterEach(() => vi.unstubAllGlobals());
function localFetch() {
  vi.stubGlobal('fetch', async (url: string) => {
    try {
      const path = resolve('assets', url.replace(/^\.\//, '').replace(/^\//, ''));
      const bytes = await readFile(path);
      // Node has no browser canvas: normalize WebP with Sharp at the fixture boundary.
      return new Response(path.endsWith('.webp') ? await sharp(bytes).png().toBuffer() : bytes);
    }
    catch { return new Response('', { status: 404 }); }
  });
}

describe('postcard PDF and immutable export scene', () => {
  it.each(['a6-portrait', 'a6-landscape', 'square'] as const)('uses the rounded outline in vector PDF and raster SVG for %s', async format => {
    localFetch();
    const project = createPostcardProject({ count: 1, format, cornerRadius: 10 });
    project.postcards[0].background = { kind: 'solid', colors: ['#315C4C'], angle: 90, centerX: 0.5, centerY: 0.5 };
    const prepared = await preparePostcardExport(project);
    expect(prepared.issues).toEqual([]);
    expect(prepared.scenes.get(project.activePostcardId)?.shape).toMatch(/^M 10 0/);
    const svg = postcardExportSvg(prepared, project.activePostcardId);
    const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#FFFFFF' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) => [...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 4)];
    expect(pixel(0, 0)).toEqual([255, 255, 255, 255]);
    expect(pixel(info.width - 1, info.height - 1)).toEqual([255, 255, 255, 255]);
    expect(pixel(Math.floor(info.width / 2), 2)).toEqual([49, 92, 76, 255]);
    expect(pixel(Math.floor(info.width / 2), Math.floor(info.height / 2))).toEqual([49, 92, 76, 255]);
    const bytes = new Uint8Array(await (await generatePostcardPdf(prepared)).arrayBuffer());
    const stream = /stream\r?\n([\s\S]*?)\r?\nendstream/.exec(Buffer.from(bytes).toString('latin1'))![1];
    const content = new TextDecoder().decode(unzlibSync(Buffer.from(stream, 'latin1')));
    const clipping = content.slice(0, content.indexOf('\nW\n'));
    expect(clipping.match(/ c\n/g)).toHaveLength(4);
  });

  it.each(['a6-portrait', 'a6-landscape', 'square'] as const)('prints Cyrillic/Latin as vector paths at exact %s physical dimensions without PDF fonts', async format => {
    localFetch();
    const project = createPostcardProject({ name: 'Зимние открытки', count: 1, format });
    project.postcards[0].elements.push(createTextElement({ content: 'С Новым годом!\nMerry Christmas', x: 15, y: 15, width: 75, height: 28, fontSize: 18, letterSpacing: 0.4, rotation: 15, stroke: { color: '#C99C56', width: 0.5 } }));
    project.postcards[0].elements.push(createImageElement('rustic-wooden-star', { x: 25, y: 45, width: 35, height: 35, opacity: 0.8 }));
    project.postcards[0].elements.push(createLetteringElement('golden-merry-christmas-calligraphy', { x: 20, y: 82, width: 65, height: 20 }));
    const print = await preparePostcardExport(project);
    expect(print.issues.filter(issue => issue.severity === 'error')).toEqual([]);
    const blob = await generatePostcardPdf(print);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pdf = new TextDecoder('latin1').decode(bytes);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    const mediaBox = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect(Number(mediaBox[1])).toBeCloseTo((format === 'a6-landscape' ? 148 : 105) * 72 / 25.4, 4);
    expect(Number(mediaBox[2])).toBeCloseTo((format === 'a6-portrait' ? 148 : 105) * 72 / 25.4, 4);
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
    await mkdir('artifacts', { recursive: true }); await writeFile(`artifacts/postcard-vector-${format}.pdf`, bytes);
  }, 30_000);
  it('exports all twenty mixed postcards in project order over ten actual A4 PDF pages', async () => {
    localFetch();
    const project = createPostcardProject({ name: 'Двадцать зимних историй', count: 20, format: 'a6-portrait' });
    project.postcards.forEach((card, index) => {
      card.format = (['square', 'a6-landscape', 'a6-portrait'] as const)[index % 3];
      card.elements.push(createTextElement({ content: `Открытка ${index + 1}`, x: 15, y: 20, width: 75, height: 25, fontSize: 18 }));
    });
    // Export must use the thumbnail order after a user reorder, not creation order or the active card first.
    project.postcards.reverse(); project.activePostcardId = project.postcards[10].id;
    const prepared = await preparePostcardExport(project, 'all');
    expect(prepared.issues.filter(issue => issue.severity === 'error')).toEqual([]);
    expect(prepared.layout.pages.flatMap(page => page.placements.map(item => item.postcardId))).toEqual(project.postcards.map(card => card.id));
    const pdf = Buffer.from(await (await generatePostcardPdf(prepared)).arrayBuffer()).toString('latin1');
    expect((pdf.match(/\/Type \/Page\b/g) ?? [])).toHaveLength(10);
    expect((pdf.match(/\/MediaBox \[0 0 595\.[\d]+ 841\.[\d]+\]/g) ?? [])).toHaveLength(10);
  });
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
