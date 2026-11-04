import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import sharp from 'sharp';

test('postcard browser exports preserve opaque 300 DPI images, ZIP order and outlined PDF text', async ({ page }) => {
  test.setTimeout(120_000);
  // Keep byte-level export checks stable while a development checkout receives edits.
  await page.routeWebSocket('**/*', () => {});
  await page.goto('/');
  const setup = async (format: 'png' | 'jpg' | 'pdf', scope: 'current' | 'all' = format === 'jpg' ? 'current' : 'all') => page.evaluate(async ({ selectedFormat, scope }) => {
    const modelPath = '/src/domain/postcards/project.ts';
    const enginePath = '/src/infrastructure/pdf/postcards.ts';
    const model = await import(/* @vite-ignore */ modelPath);
    const engine = await import(/* @vite-ignore */ enginePath);
    const project = model.createPostcardProject({ name: 'Проверка печати', count: 2, format: 'square' });
    project.postcards[1].format = 'a6-landscape';
    project.activePostcardId = project.postcards[1].id;
    project.postcards[0].background = { kind: 'image', assetId: 'watercolor-winter-sky-snowflakes', color: '#FFFFFF' };
    for (const card of project.postcards) card.elements.push(model.createTextElement({ content: 'С Новым годом!\nMerry Christmas', x: 15, y: 20, width: 75, height: 30, fontSize: 18, letterSpacing: 0.4, stroke: { color: '#C99C56', width: 0.6 }, shadow: { color: '#36523C', offsetX: 1, offsetY: 1, blur: 0.8 } }));
    project.postcards[0].elements.push(model.createImageElement('rustic-wooden-star', { x: 35, y: 55, width: 30, height: 40 }));
    const prepared = await engine.preparePostcardExport(project, scope);
    const errors = prepared.issues.filter((issue: { severity: string }) => issue.severity === 'error');
    if (errors.length) throw new Error(JSON.stringify(errors));
    const result = selectedFormat === 'pdf'
      ? { blob: await engine.generatePostcardPdf(prepared), filename: 'postcards-vector-browser.pdf' }
      : await engine.generatePostcardImages(prepared, selectedFormat);
    engine.downloadPostcardFile(result);
  }, { selectedFormat: format, scope });

  const archiveDownload = page.waitForEvent('download');
  await setup('png');
  const archive = await archiveDownload;
  expect(archive.suggestedFilename()).toBe('Postcards-PNG.zip');
  const files = unzipSync(await readFile((await archive.path())!));
  expect(Object.keys(files)).toEqual(['postcard-01.png', 'postcard-02.png']);
  for (const [name, bytes] of Object.entries(files)) {
    const metadata = await sharp(bytes).metadata();
    expect(metadata).toMatchObject({ format: 'png', width: name.includes('01') ? 1240 : 1748, height: 1240, density: 300 });
    expect((await sharp(bytes).stats()).isOpaque).toBe(true);
  }
  const jpegDownload = page.waitForEvent('download');
  await setup('jpg');
  const jpeg = await jpegDownload;
  expect(jpeg.suggestedFilename()).toBe('postcard-02.jpg');
  expect(await sharp(await readFile((await jpeg.path())!)).metadata()).toMatchObject({ format: 'jpeg', width: 1748, height: 1240, density: 300, hasAlpha: false });

  const jpegArchiveDownload = page.waitForEvent('download');
  await setup('jpg', 'all');
  const jpegArchive = await jpegArchiveDownload;
  expect(jpegArchive.suggestedFilename()).toBe('Postcards-JPG.zip');
  const jpegFiles = unzipSync(await readFile((await jpegArchive.path())!));
  expect(Object.keys(jpegFiles)).toEqual(['postcard-01.jpg', 'postcard-02.jpg']);
  for (const [name, bytes] of Object.entries(jpegFiles)) {
    expect(await sharp(bytes).metadata()).toMatchObject({ format: 'jpeg', width: name.includes('01') ? 1240 : 1748, height: 1240, density: 300, hasAlpha: false });
    expect((await sharp(bytes).stats()).channels.some(channel => channel.stdev > 5)).toBe(true);
  }

  const pdfDownload = page.waitForEvent('download');
  await setup('pdf');
  const pdf = Buffer.from(await readFile((await (await pdfDownload).path())!)).toString('latin1');
  expect(pdf.startsWith('%PDF-')).toBe(true);
  expect(pdf).not.toContain('/FontFile');
  expect(pdf).not.toContain('/ToUnicode');
  expect(pdf).toContain('/SMask');
  expect(pdf).toContain('/MediaBox [0 0 595.');
});
