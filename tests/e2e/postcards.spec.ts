import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import type { PostcardFormat, PostcardProject } from '../../src/domain/postcards/types';
import { images } from '../../src/data/images';
import { decorations } from '../../src/data/decorations';
import { lettering } from '../../src/data/lettering';
import { acceptTermsIfOffered } from './support/terms';

const postcardKey = 'christmas-studio:postcards:project';
const tagKey = 'advent-tag-studio:project';
const acceptanceKey = 'advent-tag-studio:terms-acceptance';
async function saved(page: Page): Promise<PostcardProject> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), postcardKey);
}
async function activeCard(page: Page) { const project = await saved(page); return project.postcards.find(card => card.id === project.activePostcardId)!; }
async function previewGeometry(page: Page) {
  return page.locator('.postcard-create-preview svg').evaluate(svg => ({
    width: (svg as SVGSVGElement).viewBox.baseVal.width, height: (svg as SVGSVGElement).viewBox.baseVal.height,
    elements: Array.from(svg.querySelectorAll('[data-element-id] > rect'), rect => ({ x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')), width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')) })),
  }));
}
async function dismissNotices(page: Page) {
  const notice = page.getByRole('button', { name: 'Понятно', exact: true });
  if (await notice.count()) await notice.click();
  const skip = page.getByRole('button', { name: 'Пропустить', exact: true });
  if (await skip.count()) await skip.click();
}
async function create(page: Page, count = 2, format: PostcardFormat = 'a6-portrait', name = 'Зимние открытки') {
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="blank-a6-portrait"]').click();
  await page.getByLabel('Название проекта открыток', { exact: true }).fill(name);
  await page.getByLabel('Количество открыток', { exact: true }).fill(String(count));
  await page.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption(format);
  await page.getByRole('button', { name: 'Создать проект', exact: true }).click();
  const offered = await page.getByRole('dialog', { name: 'Перед началом работы', exact: true }).count() > 0;
  await acceptTermsIfOffered(page);
  await expect(page.locator('.postcard-studio')).toBeVisible();
  await dismissNotices(page);
  await expect.poll(async () => (await saved(page))?.postcards.length).toBe(count);
  await page.evaluate(() => document.fonts.ready.then(() => true));
  return offered;
}
async function tab(page: Page, label: string) {
  const desktop = page.getByRole('tab', { name: label, exact: true });
  if (await desktop.count() && await desktop.isVisible()) await desktop.click();
  else await page.getByRole('navigation', { name: 'Инструменты открытки', exact: true }).getByRole('button', { name: label, exact: true }).click();
}
async function number(page: Page, label: string, value: number) { const input = page.getByLabel(label, { exact: true }); await input.fill(String(value)); await input.press('Enter'); }
async function text(page: Page, content: string) {
  await tab(page, 'Текст');
  await page.getByRole('button', { name: 'Свой текст', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить текст', exact: true }).click();
  await page.getByRole('textbox', { name: 'Текст на открытке', exact: true }).fill(content);
  await expect.poll(async () => (await activeCard(page)).elements.filter(element => element.type === 'text').map(element => element.content)).toContain(content);
}
async function selectCard(page: Page, id: string) { await page.locator(`.thumbnail-strip [data-postcard-id="${id}"]`).click(); await expect.poll(async () => (await saved(page)).activePostcardId).toBe(id); }

test.beforeEach(async ({ page }) => {
  // Isolate each real UI scenario from HMR while parallel implementation continues.
  await page.routeWebSocket('**/*', () => {});
});

for (const [id, name, format, imageId, letteringId, coverName, pixels] of [
  ['santa-christmas-a6-portrait', 'Санта с подарками', 'a6-portrait', 'santa-gift-sack', 'vintage-watercolour-ho-ho-ho', 'santa-christmas-postcard', [1240, 1748]],
  ['elf-workshop-a6-landscape', 'Мастерская эльфа', 'a6-landscape', 'elf-painting-ornaments', 'golden-glitter-merry-christmas', 'elf-workshop-postcard', [1748, 1240]],
  ['squirrel-christmas-square', 'Рождество у белочек', 'square', 'squirrel-pair-nut-basket', 'red-brush-calligraphy-merry-christmas', 'squirrel-christmas-postcard', [1240, 1240]],
] as const) test(`ready composition ${format} creates independent editable cards and exports its real artwork`, async ({ page }) => {
  await page.goto('/#postcards');
  const catalog = page.locator('.postcard-artistic-catalog');
  await expect(catalog.locator('.postcard-start-card')).toHaveCount(3);
  const cover = catalog.locator(`[data-postcard-template="${id}"]`);
  await expect(cover.locator('img')).toHaveAttribute('src', new RegExp(`/site/${coverName}\\.webp$`));
  await cover.scrollIntoViewIfNeeded();
  await expect.poll(() => cover.locator('img').evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await cover.click();
  const setup = page.getByRole('dialog', { name, exact: true });
  await expect(setup.locator('.postcard-create-preview image[href$="-preview.webp"]')).toHaveCount(0);
  await expect(setup.getByRole('combobox', { name: 'Формат открытки', exact: true })).toHaveValue(format);
  await expect(setup.locator(`option[value="${format}"]`)).toContainText('(Рекомендуется)');
  const nativePreview = await previewGeometry(page);
  for (const target of ['a6-portrait', 'a6-landscape', 'square'] as const) {
    if (target === format) continue;
    await setup.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption(target);
    const fitted = await previewGeometry(page);
    const left = Math.min(...fitted.elements.map(element => element.x)), right = Math.max(...fitted.elements.map(element => element.x + element.width));
    const top = Math.min(...fitted.elements.map(element => element.y)), bottom = Math.max(...fitted.elements.map(element => element.y + element.height));
    expect((left + right) / 2).toBeCloseTo(fitted.width / 2, 6); expect((top + bottom) / 2).toBeCloseTo(fitted.height / 2, 6);
    expect(left).toBeGreaterThanOrEqual(3 - 1e-6); expect(top).toBeGreaterThanOrEqual(3 - 1e-6);
    expect(right).toBeLessThanOrEqual(fitted.width - 3 + 1e-6); expect(bottom).toBeLessThanOrEqual(fitted.height - 3 + 1e-6);
  }
  await setup.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption(format);
  expect(await previewGeometry(page)).toEqual(nativePreview);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const gap = await setup.locator('.postcard-create-preview > span').evaluate(paper => paper.getBoundingClientRect().bottom - paper.querySelector('svg')!.getBoundingClientRect().bottom);
    expect(Math.abs(gap)).toBeLessThan(0.1);
  }
  await setup.getByLabel('Количество открыток', { exact: true }).fill('2');
  await setup.getByLabel('Применение шаблона открыток', { exact: true }).selectOption('all');
  await setup.getByRole('button', { name: 'Создать проект', exact: true }).click();
  await acceptTermsIfOffered(page); await expect(page.locator('.postcard-studio')).toBeVisible(); await dismissNotices(page);
  await expect.poll(async () => (await saved(page))?.postcards.length).toBe(2);
  const project = await saved(page), [first, second] = project.postcards;
  for (const card of project.postcards) {
    expect(card.format).toBe(format); expect(card.background.kind).toBe('image');
    expect(card.elements).toHaveLength(2);
    expect(card.elements[0]).toMatchObject({ type: 'image', assetId: imageId, locked: false });
    expect(card.elements[1]).toMatchObject({ type: 'lettering', assetId: letteringId, locked: false, opacity: 1 });
    if (format === 'square') {
      const [illustration, greeting] = card.elements;
      expect(greeting.y + greeting.height + 3).toBeLessThanOrEqual(illustration.y);
      expect(illustration.y + illustration.height).toBeLessThan(105);
    }
  }
  expect(new Set(project.postcards.flatMap(card => [card.id, ...card.elements.map(element => element.id)])).size).toBe(6);
  await tab(page, 'Слои'); await page.locator('.postcard-layer-choice').first().click();
  await expect(page.getByRole('button', { name: 'Готовые надписи', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await number(page, 'Непрозрачность', 80);
  await expect.poll(async () => (await activeCard(page)).elements[1]).toMatchObject({ opacity: 0.8 });
  expect((await saved(page)).postcards[1]).toEqual(second);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page))).toEqual(first);
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  await preview.getByLabel('Формат экспорта открыток', { exact: true }).selectOption('png');
  await expect(preview.locator('.print-status')).toBeVisible();
  await expect(preview.locator('.print-issue--error')).toHaveCount(0);
  const consent = preview.getByRole('checkbox'); if (await consent.count()) await consent.check();
  const downloadButton = preview.getByRole('button', { name: 'Скачать PNG', exact: true }); await expect(downloadButton).toBeEnabled();
  const promised = page.waitForEvent('download'); await downloadButton.click();
  const download = await promised; const bytes = await readFile((await download.path())!);
  expect(await sharp(bytes).metadata()).toMatchObject({ width: pixels[0], height: pixels[1], density: 300 });
  const stats = await sharp(bytes).stats(); expect(stats.isOpaque).toBe(true); expect(stats.channels.some(channel => channel.stdev > 20)).toBe(true);
  await download.saveAs(`artifacts/${id}-300dpi.png`);
});

test('ready compositions use their native format when added or applied to a differently shaped postcard', async ({ page }) => {
  await create(page, 1, 'square');
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="elf-workshop-a6-landscape"]').click();
  const setup = page.locator('.postcard-create-modal');
  await expect(setup.getByRole('combobox', { name: 'Формат открытки', exact: true })).toHaveValue('a6-landscape');
  await setup.getByRole('radio', { name: 'Добавить в проект', exact: true }).check();
  await expect(setup.getByRole('combobox', { name: 'Формат открытки', exact: true })).toHaveValue('a6-landscape');
  await setup.getByRole('button', { name: 'Добавить открытку', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards.length).toBe(2);
  const elf = await activeCard(page); expect(elf.format).toBe('a6-landscape');
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="santa-christmas-a6-portrait"]').click();
  await expect(setup.getByRole('combobox', { name: 'Формат открытки', exact: true })).toHaveValue('a6-portrait');
  await setup.getByRole('button', { name: 'Заменить дизайн', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).format).toBe('a6-portrait');
  expect((await activeCard(page)).id).toBe(elf.id);
  expect((await activeCard(page)).elements[0]).toMatchObject({ assetId: 'santa-gift-sack' });
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => activeCard(page)).toEqual(elf);
});

test('fitted template previews persist unchanged on create, add and replace, with Undo', async ({ page }) => {
  const geometry = (card: Awaited<ReturnType<typeof activeCard>>) => card.elements.map(({ x, y, width, height }) => ({ x, y, width, height }));
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="santa-christmas-a6-portrait"]').click();
  const setup = page.locator('.postcard-create-modal');
  await expect(setup.locator('.postcard-create-note')).toHaveCSS('font-size', '12px');
  await setup.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('square');
  const createdPreview = await previewGeometry(page);
  await setup.getByRole('button', { name: 'Создать проект', exact: true }).click();
  await acceptTermsIfOffered(page); await expect(page.locator('.postcard-studio')).toBeVisible(); await dismissNotices(page);
  await expect.poll(async () => geometry(await activeCard(page))).toEqual(createdPreview.elements);
  expect((await activeCard(page)).format).toBe('square');

  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="elf-workshop-a6-landscape"]').click();
  await setup.getByRole('radio', { name: 'Добавить в проект', exact: true }).check();
  await setup.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('a6-portrait');
  const addedPreview = await previewGeometry(page);
  await setup.getByRole('button', { name: 'Добавить открытку', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards.length).toBe(2);
  const added = await activeCard(page);
  expect(added.format).toBe('a6-portrait'); expect(geometry(added)).toEqual(addedPreview.elements);

  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="squirrel-christmas-square"]').click();
  await expect(setup.locator('.postcard-replace-warning')).toHaveCSS('font-size', '12px');
  await setup.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('a6-landscape');
  const replacedPreview = await previewGeometry(page);
  await setup.getByRole('button', { name: 'Заменить дизайн', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).format).toBe('a6-landscape');
  expect((await activeCard(page)).id).toBe(added.id); expect(geometry(await activeCard(page))).toEqual(replacedPreview.elements);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => activeCard(page)).toEqual(added);
});

test('postcards offer three real starts, validate creation limits and preserve a project on cancelled replacement', async ({ page }) => {
  await page.goto('/#postcards');
  await expect(page.locator('.template-catalog .postcard-start-card')).toHaveCount(3);
  await expect(page.locator('.postcard-artistic-catalog .postcard-start-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Начните с чистой открытки', exact: true })).toBeVisible();
  await page.locator('[data-postcard-template="blank-square"]').click();
  const count = page.getByLabel('Количество открыток', { exact: true });
  const createButton = page.getByRole('button', { name: 'Создать проект', exact: true });
  await count.fill('21'); await expect(createButton).toBeDisabled();
  await count.fill('0'); await expect(createButton).toBeDisabled();
  await count.fill('20'); await expect(createButton).toBeEnabled();
  await createButton.click();
  const terms = page.getByRole('dialog', { name: 'Перед началом работы', exact: true });
  await expect(terms.getByRole('checkbox')).not.toBeChecked();
  await terms.getByRole('button', { name: 'Отмена', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), postcardKey)).toBeNull();
  expect(await page.evaluate(key => localStorage.getItem(key), acceptanceKey)).toBeNull();
  await create(page, 20, 'square', 'Двадцать историй');
  const original = await saved(page);
  expect(new Set(original.postcards.map(card => card.id)).size).toBe(20);
  expect(original.postcards.every(card => card.format === 'square' && card.elements.length === 0)).toBe(true);
  await expect(page.getByRole('button', { name: 'Добавить открытку', exact: true })).toBeDisabled();
  await selectCard(page, original.postcards[19].id);
  await expect(page.locator('.workspace-card-info')).toContainText('20');
  await page.goto('/#postcards');
  await page.getByRole('button', { name: 'Начать новый', exact: true }).click();
  await page.getByLabel('Название проекта открыток', { exact: true }).fill('Не заменять');
  await page.getByRole('button', { name: 'Создать проект', exact: true }).click();
  await page.getByRole('dialog', { name: 'Создать новый проект открыток?', exact: true }).getByRole('button', { name: 'Оставить текущий', exact: true }).click();
  expect((await saved(page)).id).toBe(original.id);
  await page.goto('/#editor/postcards');
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.locator('.postcard-studio')).toBeVisible();
  expect((await saved(page)).activePostcardId).toBe(original.postcards[19].id);
});

test('blank titles are rejected and confirmed replacement preserves a Cyrillic title as literal text', async ({ page }) => {
  await create(page, 1);
  const previous = await saved(page);
  await page.goto('/#postcards');
  await page.getByRole('button', { name: 'Начать новый', exact: true }).click();
  const title = page.getByLabel('Название проекта открыток', { exact: true });
  const submit = page.getByRole('button', { name: 'Создать проект', exact: true });
  await title.fill(''); await expect(submit).toBeDisabled();
  await title.fill('   '); await expect(submit).toBeDisabled();
  const name = 'Ёлка — 2027 / «Семья & друзья» <b>♥</b>';
  await title.fill(name); await submit.click();
  const confirmation = page.getByRole('dialog', { name: 'Создать новый проект открыток?', exact: true });
  await expect(confirmation).toContainText(name);
  expect((await saved(page)).id).toBe(previous.id);
  await confirmation.getByRole('button', { name: 'Создать новый проект', exact: true }).click();
  await expect.poll(async () => (await saved(page)).name).toBe(name);
  expect((await saved(page)).id).not.toBe(previous.id);
  await expect(page.locator('.studio-wordmark')).toHaveText(name);
  await expect(page.locator('.studio-wordmark b')).toHaveCount(0);
});

test('catalog replacement can be cancelled or undone and adding a start respects the chosen format', async ({ page }) => {
  await create(page, 2);
  await text(page, 'Сохранить эту историю');
  const original = await activeCard(page);
  await page.goto('/#postcards');
  await expect(page.locator('.postcard-artistic-catalog .postcard-start-card')).toHaveCount(3);
  await page.locator('[data-postcard-template="blank-square"]').click();
  const design = page.locator('.postcard-create-modal');
  await expect(design).toContainText('Дизайн текущей открытки будет заменён');
  await design.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('square');
  await design.getByRole('button', { name: 'Отмена', exact: true }).click();
  expect(await activeCard(page)).toEqual(original);
  await page.locator('[data-postcard-template="blank-square"]').click();
  await design.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('square');
  await design.getByRole('button', { name: 'Заменить дизайн', exact: true }).click();
  await expect(page.locator('.postcard-studio')).toBeVisible();
  await expect.poll(async () => (await activeCard(page)).format).toBe('square');
  expect((await activeCard(page)).elements).toEqual([]);
  expect((await activeCard(page)).id).toBe(original.id);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => activeCard(page)).toEqual(original);
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="blank-a6-landscape"]').click();
  await design.getByRole('radio', { name: 'Добавить в проект', exact: true }).check();
  await design.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('a6-landscape');
  await design.getByRole('button', { name: 'Добавить открытку', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards.length).toBe(3);
  const added = await activeCard(page);
  expect(added.format).toBe('a6-landscape'); expect(added.elements).toEqual([]);
  expect(added.id).not.toBe(original.id);
  const from = page.locator(`.thumbnail-strip [data-postcard-id="${added.id}"]`);
  const to = page.locator(`.thumbnail-strip [data-postcard-id="${original.id}"]`);
  await from.dragTo(to);
  await expect.poll(async () => (await saved(page)).postcards[0].id).toBe(added.id);
  expect((await saved(page)).activePostcardId).toBe(added.id);
  expect((await saved(page)).postcards.find(card => card.id === original.id)).toEqual(original);
});

test('all custom text settings, frame fitting and effects survive undo, redo and reload', async ({ page }) => {
  await create(page, 1);
  await text(page, 'Зимняя история\nMerry Christmas');
  await number(page, 'По горизонтали', 15); await number(page, 'По вертикали', 35);
  await number(page, 'Ширина', 75); await number(page, 'Высота', 35);
  await number(page, 'Поворот', 15); await number(page, 'Размер шрифта', 18);
  await page.getByRole('combobox', { name: 'Шрифт', exact: true }).selectOption('serif');
  await page.getByRole('checkbox', { name: 'Жирный', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Курсив', exact: true }).check();
  await page.getByRole('combobox', { name: 'Выравнивание текста', exact: true }).selectOption('left');
  await number(page, 'Межстрочный интервал', 1.5); await number(page, 'Межбуквенный интервал', 0.6);
  const color = async (heading: string, hex: string) => page.locator('.postcard-color-setting').filter({ has: page.getByRole('heading', { name: heading, exact: true }) }).getByRole('button', { name: `Цвет ${hex}`, exact: true }).click();
  await color('Цвет текста', '#923C42');
  await page.getByRole('checkbox', { name: 'Обводка текста', exact: true }).check();
  await color('Цвет обводки', '#C99C56'); await number(page, 'Толщина обводки', 0.8);
  await page.getByRole('checkbox', { name: 'Тень текста', exact: true }).check();
  await color('Цвет тени', '#315C4C');
  await number(page, 'Смещение тени по X', 1); await number(page, 'Смещение тени по Y', 1.5); await number(page, 'Размытие тени', 0.5);
  const expected = { content: 'Зимняя история\nMerry Christmas', x: 15, y: 35, width: 75, height: 35, rotation: 15, fontId: 'serif', fontSize: 18, weight: 'bold', italic: true, color: '#923C42', align: 'left', lineHeight: 1.5, letterSpacing: 0.6, stroke: { color: '#C99C56', width: 0.8 }, shadow: { color: '#315C4C', offsetX: 1, offsetY: 1.5, blur: 0.5 } };
  await expect.poll(async () => (await activeCard(page)).elements[0]).toMatchObject(expected);
  const before = (await activeCard(page)).elements[0];
  await page.getByRole('button', { name: 'Подогнать рамку к тексту', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[0].height).not.toBe(35);
  const fitted = (await activeCard(page)).elements[0];
  expect(fitted).toMatchObject({ y: 35, rotation: 15, fontSize: 18 });
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(before);
  await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(fitted);
  await page.reload();
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  expect((await activeCard(page)).elements[0]).toEqual(fitted);
  await page.getByRole('button', { name: 'Скрыть уведомление', exact: true }).click();
  await tab(page, 'Слои'); await page.locator('.postcard-layer-choice').click();
  await expect(page.getByRole('button', { name: 'Свой текст', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('checkbox', { name: 'Тень текста', exact: true })).toBeChecked();
  await expect(page.getByRole('textbox', { name: 'Текст на открытке', exact: true })).toHaveValue(expected.content);
});

test('rounded corners survive creation, per-card edits, defaults, Undo, reload and real image export', async ({ page }) => {
  await page.goto('/#postcards');
  for (const id of ['a6-portrait', 'a6-landscape', 'square']) {
    const tile = page.locator(`[data-postcard-template="blank-${id}"]`);
    await expect(tile.locator('img')).toHaveAttribute('src', new RegExp(`/site/blank-${id}-postcard\\.webp$`));
    await tile.scrollIntoViewIfNeeded(); await tile.locator('img').evaluate(image => (image as HTMLImageElement).decode());
  }
  await page.locator('[data-postcard-template="blank-square"]').click();
  const setup = page.locator('.postcard-create-modal');
  await setup.getByLabel('Количество открыток', { exact: true }).fill('2');
  await number(page, 'Скругление углов', 6);
  await expect(setup.locator('[data-element="card"]')).toHaveAttribute('d', /^M 6 0/);
  const { data: previewPixels } = await sharp(await setup.locator('.postcard-create-preview > span').screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  expect([...previewPixels.subarray(0, 3)].every(value => value < 250)).toBe(true);
  await setup.getByRole('button', { name: 'Создать проект', exact: true }).click();
  await acceptTermsIfOffered(page); await expect(page.locator('.postcard-studio')).toBeVisible(); await dismissNotices(page);
  await expect.poll(async () => (await saved(page))?.postcards.map(card => card.cornerRadius)).toEqual([6, 6]);
  expect((await saved(page)).defaultCornerRadius).toBe(6);
  await tab(page, 'Формат и фон'); await number(page, 'Скругление углов', 12);
  await expect.poll(async () => (await saved(page)).postcards.map(card => card.cornerRadius)).toEqual([12, 6]);
  await expect(page.locator('.canvas-artboard [data-element="card"]')).toHaveAttribute('d', /^M 12 0/);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect(page.getByLabel('Скругление углов', { exact: true })).toHaveValue('6');
  await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).cornerRadius).toBe(12);

  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'Настройки проекта открыток', exact: true });
  const settingsRadius = settings.getByLabel('Скругление углов', { exact: true });
  await settingsRadius.fill('9'); await settingsRadius.press('Enter');
  expect((await saved(page)).defaultCornerRadius).toBe(6);
  await settings.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect.poll(async () => (await saved(page)).defaultCornerRadius).toBe(9);
  expect((await saved(page)).postcards.map(card => card.cornerRadius)).toEqual([12, 6]);
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await settingsRadius.fill('15'); await settingsRadius.press('Enter');
  await settings.getByRole('button', { name: 'Отмена', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить открытку', exact: true }).click();
  await page.getByRole('button', { name: 'Чистая открытка', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards.map(card => card.cornerRadius)).toEqual([12, 9, 6]);
  await page.reload();
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.locator('.postcard-studio')).toBeVisible();
  await tab(page, 'Формат и фон');
  await expect(page.getByLabel('Скругление углов', { exact: true })).toHaveValue('9');
  await page.locator('.postcard-color-setting').filter({ has: page.getByRole('heading', { name: 'Цвет бумаги', exact: true }) }).getByRole('button', { name: 'Цвет #315C4C', exact: true }).click();
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const print = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  await expect(print.locator('.print-status')).toBeVisible();
  for (const format of ['png', 'jpg']) {
    await print.getByLabel('Формат экспорта открыток', { exact: true }).selectOption(format);
    const downloadEvent = page.waitForEvent('download');
    await print.getByRole('button', { name: `Скачать ${format.toUpperCase()}`, exact: true }).click();
    const bytes = await readFile((await (await downloadEvent).path())!);
    expect(await sharp(bytes).metadata()).toMatchObject({ width: 1240, height: 1240, density: 300 });
    expect((await sharp(bytes).stats()).isOpaque).toBe(true);
    const { data, info } = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    expect([...data.subarray(0, 3)].every(value => value > 250)).toBe(true);
    const center = (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 3;
    [...data.subarray(center, center + 3)].forEach((value, index) => expect(Math.abs(value - [49, 92, 76][index])).toBeLessThan(4));
  }
});

test('background and shape contains every background mode and keeps card backgrounds independent', async ({ page }) => {
  await create(page);
  const original = await saved(page), first = original.postcards[0].id, second = original.postcards[1].id;
  await tab(page, 'Формат и фон');
  await expect(page.getByRole('combobox', { name: 'Формат открытки', exact: true })).toBeVisible();
  const kind = page.getByRole('combobox', { name: 'Тип фона', exact: true });
  const color = async (heading: string, hex: string) => page.locator('.postcard-color-setting').filter({ has: page.getByRole('heading', { name: heading, exact: true }) }).getByRole('button', { name: `Цвет ${hex}`, exact: true }).click();
  await color('Цвет бумаги', '#E8D8BE');
  await expect.poll(async () => (await activeCard(page)).background).toMatchObject({ kind: 'solid', colors: ['#E8D8BE'] });
  await kind.selectOption('linear'); await color('Цвет 1', '#923C42'); await color('Цвет 2', '#C99C56');
  await number(page, 'Направление градиента', 135);
  await page.getByRole('button', { name: 'Добавить третий цвет', exact: true }).click(); await color('Цвет 3', '#FFFFFF');
  await expect.poll(async () => (await activeCard(page)).background).toMatchObject({ kind: 'linear', colors: ['#923C42', '#C99C56', '#FFFFFF'], angle: 135 });
  const linear = (await activeCard(page)).background;
  await kind.selectOption('radial');
  await number(page, 'Центр по горизонтали', 25); await number(page, 'Центр по вертикали', 75);
  await color('Цвет 2', '#315C4C');
  await expect.poll(async () => (await activeCard(page)).background).toMatchObject({ kind: 'radial', centerX: 0.25, centerY: 0.75, colors: ['#923C42', '#315C4C', '#FFFFFF'] });
  const radial = (await activeCard(page)).background;
  await selectCard(page, second);
  expect((await activeCard(page)).background).toEqual(original.postcards[1].background);
  await selectCard(page, first); expect((await activeCard(page)).background).toEqual(radial);
  await kind.selectOption('image');
  await page.getByLabel('Поиск фонов', { exact: true }).fill('watercolor-winter-sky-snowflakes');
  await page.locator('.image-library button').click();
  await expect.poll(async () => (await activeCard(page)).background).toMatchObject({ kind: 'image', assetId: 'watercolor-winter-sky-snowflakes' });
  const image = (await activeCard(page)).background;
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  // Selecting the first image and selecting another one are separate, reversible design changes.
  await expect.poll(async () => (await activeCard(page)).background).not.toEqual(image);
  await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).background).toEqual(image);
  expect(linear).not.toEqual(radial);
  await page.reload();
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  expect((await activeCard(page)).background).toEqual(image);
  expect((await saved(page)).postcards[1].background).toEqual(original.postcards[1].background);
});

test('touchscreen gestures commit one edit each, preserve graphic proportions and allow mobile export', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await page.routeWebSocket('**/*', () => {});
    await create(page);
    const project = await saved(page);
    await tab(page, 'Иллюстрации');
    await page.getByLabel('Поиск иллюстраций', { exact: true }).fill('rustic-wooden-star');
    await page.getByRole('button', { name: 'Добавить: Деревянная звезда с хвоей', exact: true }).tap();
    await page.getByRole('button', { name: 'Закрыть панель', exact: true }).tap();
    await expect.poll(async () => (await activeCard(page)).elements.length).toBe(1);
    const original = (await activeCard(page)).elements[0];
    await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).tap();
    await expect.poll(async () => (await activeCard(page)).elements.length).toBe(0);
    await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).tap();
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(original);
    const cdp = await context.newCDPSession(page);
    const gesture = async (start: { x: number; y: number }, end: { x: number; y: number }) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
      for (let step = 1; step <= 8; step++) {
        await page.evaluate(() => new Promise(requestAnimationFrame));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * step / 8, y: start.y + (end.y - start.y) * step / 8, id: 1 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const board = (await page.locator('.canvas-artboard').boundingBox())!;
    const scale = board.width / 105;
    const center = { x: board.x + (original.x + original.width / 2) * scale, y: board.y + (original.y + original.height / 2) * scale };
    await gesture(center, { x: center.x + 12 * scale, y: center.y + 8 * scale });
    await expect.poll(async () => (await activeCard(page)).elements[0].x).toBeCloseTo(original.x + 12, 1);
    const moved = (await activeCard(page)).elements[0];
    expect(moved.y).toBeCloseTo(original.y + 8, 1);
    // Verify that the gesture contributes exactly one document-history transaction.
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(original);
    await page.keyboard.press('Control+Shift+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(moved);
    const resize = (await page.locator('.resize-handle--se').boundingBox())!;
    await gesture({ x: resize.x + resize.width / 2, y: resize.y + resize.height / 2 }, { x: resize.x + resize.width / 2 + 12, y: resize.y + resize.height / 2 + 14 });
    await expect.poll(async () => (await activeCard(page)).elements[0].width).toBeGreaterThan(moved.width);
    const resized = (await activeCard(page)).elements[0];
    expect(resized.width / resized.height).toBeCloseTo(original.width / original.height, 6);
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(moved);
    await page.keyboard.press('Control+Shift+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(resized);
    const rotation = (await page.locator('.rotation-handle').boundingBox())!;
    const cx = board.x + (resized.x + resized.width / 2) * scale, cy = board.y + (resized.y + resized.height / 2) * scale;
    const radius = resized.height * scale / 2 + 22, radians = 23 * Math.PI / 180;
    await gesture({ x: rotation.x + rotation.width / 2, y: rotation.y + rotation.height / 2 }, { x: cx + radius * Math.sin(radians), y: cy - radius * Math.cos(radians) });
    await expect.poll(async () => (await activeCard(page)).elements[0].rotation).toBe(30);
    const rotated = (await activeCard(page)).elements[0];
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(resized);
    await page.keyboard.press('Control+Shift+z');
    await expect.poll(async () => (await activeCard(page)).elements[0]).toEqual(rotated);
    const beforePinch = (await activeCard(page)).elements, zoom = await page.getByLabel('Текущий масштаб', { exact: true }).textContent();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 400, id: 1 }, { x: 240, y: 400, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 120, y: 400, id: 1 }, { x: 270, y: 400, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByLabel('Текущий масштаб', { exact: true })).not.toHaveText(zoom!);
    expect((await activeCard(page)).elements).toEqual(beforePinch);
    const dock = page.getByRole('navigation', { name: 'Инструменты открытки', exact: true });
    await dock.getByRole('button', { name: 'Открытки', exact: true }).tap();
    await page.locator(`.bottom-sheet [data-postcard-id="${project.postcards[1].id}"]`).tap();
    await expect.poll(async () => (await saved(page)).activePostcardId).toBe(project.postcards[1].id);
    await page.locator(`.bottom-sheet [data-postcard-id="${project.postcards[0].id}"]`).tap();
    await expect.poll(async () => (await activeCard(page)).elements).toEqual(beforePinch);
    await page.getByRole('button', { name: 'Закрыть панель', exact: true }).tap();
    await dock.getByRole('button', { name: 'Экспорт', exact: true }).tap();
    const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
    await preview.getByLabel('Формат экспорта открыток', { exact: true }).selectOption('png');
    await expect(preview.locator('.print-status')).toBeVisible();
    const consent = preview.getByRole('checkbox');
    if (await consent.count()) await consent.check();
    await expect(preview.getByRole('button', { name: 'Скачать PNG', exact: true })).toBeEnabled();
    const downloadPromise = page.waitForEvent('download');
    await preview.getByRole('button', { name: 'Скачать PNG', exact: true }).tap();
    const download = await downloadPromise;
    expect(await sharp(await readFile((await download.path())!)).metadata()).toMatchObject({ width: 1240, height: 1748, density: 300 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test('new bilingual SVG greetings and illustrations are searchable, editable and exported in PNG and PDF', async ({ page }) => {
  await create(page, 1);
  await tab(page, 'Иллюстрации');
  const illustration = page.getByRole('button', { name: 'Добавить: Рождественский штоллен с красной лентой и дольками апельсина', exact: true });
  for (const query of ['штоллен', 'stollen']) {
    await page.getByLabel('Поиск иллюстраций', { exact: true }).fill(query);
    await expect(illustration).toBeVisible();
  }
  await illustration.click(); await number(page, 'Ширина', 55); await number(page, 'По горизонтали', 25); await number(page, 'По вертикали', 96);
  await tab(page, 'Текст');
  await page.getByRole('button', { name: 'Готовые надписи', exact: true }).click();
  const ids = ['merry-christmas-red-playful', 'new-year-miracles-russian-black-calligraphy'];
  for (const [index, id] of ids.entries()) {
    const resource = lettering.find(entry => entry.id === id)!;
    await page.getByLabel('Поиск надписей', { exact: true }).fill(index ? 'Miracles in the New Year' : 'Merry Christmas');
    const choice = page.getByRole('button', { name: `Добавить: ${resource.name.ru}`, exact: true });
    await expect(choice).toBeVisible(); await choice.click();
    await number(page, 'Ширина', index ? 70 : 75); await number(page, 'По горизонтали', index ? 17.5 : 15); await number(page, 'По вертикали', index ? 48 : 5);
    const original = await page.request.get(`/${resource.src}`);
    expect(original.ok()).toBe(true); expect(await original.text()).toContain('<svg');
  }
  await expect.poll(async () => (await activeCard(page)).elements.map(element => element.type)).toEqual(['image', 'lettering', 'lettering']);
  expect((await activeCard(page)).elements.slice(1).map(element => 'assetId' in element ? element.assetId : '')).toEqual(ids);
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  await expect(preview.locator('.print-status')).toBeVisible();
  await expect(preview.locator('.print-issue--error')).toHaveCount(0);
  const consent = preview.getByRole('checkbox'); if (await consent.count()) await consent.check();
  for (const format of ['png', 'pdf']) {
    await preview.getByLabel('Формат экспорта открыток', { exact: true }).selectOption(format);
    const event = page.waitForEvent('download');
    await preview.getByRole('button', { name: `Скачать ${format.toUpperCase()}`, exact: true }).click();
    const bytes = await readFile((await (await event).path())!);
    if (format === 'pdf') expect(bytes.toString('latin1').startsWith('%PDF-')).toBe(true);
    else {
      expect(await sharp(bytes).metadata()).toMatchObject({ width: 1240, height: 1748, density: 300 });
      expect((await sharp(bytes).stats()).channels.some(channel => channel.stdev > 20)).toBe(true);
    }
  }
});

test('multiple texts, illustration and lettering keep their layer identity, aspect ratio, locks and history', async ({ page }) => {
  await create(page);
  await text(page, 'Первая история'); await text(page, 'Вторая история');
  await page.getByRole('combobox', { name: 'Шрифт', exact: true }).selectOption('serif');
  await expect.poll(async () => { const element = (await activeCard(page)).elements[1]; return element.type === 'text' ? element.fontId : null; }).toBe('serif');
  await tab(page, 'Иллюстрации');
  await page.getByLabel('Поиск иллюстраций', { exact: true }).fill('rustic-wooden-star');
  await page.locator('.image-library button').first().click();
  await expect.poll(async () => (await activeCard(page)).elements.length).toBe(3);
  const illustration = (await activeCard(page)).elements[2];
  const ratio = illustration.width / illustration.height;
  await number(page, 'Ширина', 35);
  await expect.poll(async () => (await activeCard(page)).elements[2].width).toBe(35);
  expect((await activeCard(page)).elements[2].width / (await activeCard(page)).elements[2].height).toBeCloseTo(ratio, 6);
  await number(page, 'Поворот', 22);
  await expect.poll(async () => (await activeCard(page)).elements[2].rotation).toBe(15);
  await tab(page, 'Текст');
  await page.getByRole('button', { name: 'Готовые надписи', exact: true }).click();
  await page.getByLabel('Поиск надписей', { exact: true }).fill('golden-merry-christmas-calligraphy');
  await page.locator('.image-library button').first().click();
  await expect.poll(async () => (await activeCard(page)).elements.length).toBe(4);
  const lettering = (await activeCard(page)).elements[3];
  expect(lettering.type).toBe('lettering');
  await expect(page.getByRole('tab', { name: 'Надписи', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Готовые надписи', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Свой текст', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Добавить текст', exact: true })).toBeVisible();
  expect((await activeCard(page)).elements).toHaveLength(4);
  await tab(page, 'Слои');
  await page.locator('.postcard-layers > div').first().locator('.postcard-layer-choice').click();
  await expect(page.getByRole('button', { name: 'Готовые надписи', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('textbox', { name: 'Текст на открытке', exact: true })).toHaveCount(0);
  await tab(page, 'Слои');
  const row = page.locator('.postcard-layers > div').first();
  await row.getByRole('button', { name: 'Заблокировать слой', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[3].locked).toBe(true);
  await expect(row.getByRole('button', { name: 'Удалить слой', exact: true })).toBeDisabled();
  await page.locator('.editor-canvas').focus(); await page.keyboard.press('Delete');
  expect((await activeCard(page)).elements).toHaveLength(4);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[3].locked).toBe(false);
  await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements[3].locked).toBe(true);
  await row.getByRole('button', { name: 'Разблокировать слой', exact: true }).click();
  await row.getByRole('button', { name: 'Удалить слой', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements.length).toBe(3);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements.map(element => element.id)).toContain(lettering.id);
  await page.screenshot({ path: 'artifacts/postcards-layers-1440.png' });
});

test('canvas and large previews use full-resolution background and decor files without rotating portrait backgrounds', async ({ page }) => {
  await page.goto('/#postcards');
  await page.locator('[data-postcard-template="elf-workshop-a6-landscape"]').click();
  const setup = page.locator('.postcard-create-modal');
  const background = setup.locator('.postcard-create-preview image[href*="backgrounds/"]');
  await expect(background).toHaveAttribute('href', /backgrounds\/delicate-golden-star-sparkle\.(?:png|webp)$/);
  expect(await background.getAttribute('transform')).toBeNull();
  const dimensions = await background.evaluate(async node => { const image = new Image(); image.src = node.getAttribute('href')!; await image.decode(); return { width: image.naturalWidth, height: image.naturalHeight }; });
  expect(dimensions).toEqual({ width: 1024, height: 1536 });
  await setup.getByRole('button', { name: 'Создать проект', exact: true }).click();
  await acceptTermsIfOffered(page); await expect(page.locator('.postcard-studio')).toBeVisible(); await dismissNotices(page);
  const canvasBackground = page.locator('.canvas-artboard image[href*="backgrounds/"]');
  await expect(canvasBackground).toHaveAttribute('href', /backgrounds\/delicate-golden-star-sparkle\.(?:png|webp)$/);
  expect(await canvasBackground.getAttribute('transform')).toBeNull();
  await tab(page, 'Декор');
  await page.getByRole('button', { name: 'Добавить: Бордовый бархатный бант с золотым кантом', exact: true }).click();
  const decor = page.locator('.canvas-artboard image[href*="decorations/burgundy-velvet-bow-with-gold-trim"]');
  await expect(decor).toHaveAttribute('href', /decorations\/burgundy-velvet-bow-with-gold-trim\.(?:png|webp)$/);
  expect(await decor.evaluate(async node => { const image = new Image(); image.src = node.getAttribute('href')!; await image.decode(); return image.naturalWidth; })).toBe(1312);
  await page.getByRole('button', { name: 'Приблизить', exact: true }).click();
  await expect(page.locator('.canvas-artboard image[href$="-preview.webp"]')).toHaveCount(0);
});

test('decorative artwork keeps its original proportions and appears in opaque 300 DPI PNG and PDF', async ({ page }) => {
  await create(page, 1);
  await tab(page, 'Декор');
  await expect(page.locator('.image-library button')).toHaveCount(decorations.length);
  await page.getByRole('button', { name: 'Добавить: Бордовый бархатный бант с золотым кантом', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).elements.length).toBe(1);
  const artwork = (await activeCard(page)).elements[0];
  expect(artwork).toMatchObject({ type: 'decoration', assetId: 'burgundy-velvet-bow-with-gold-trim' });
  expect(artwork.width / artwork.height).toBeCloseTo(1312 / 1199, 6);
  await expect(page.locator('.canvas-artboard image[href*="decorations/burgundy-velvet-bow-with-gold-trim"]')).toHaveCount(1);
  await expect(page.locator('.canvas-artboard image[href*="decorations/burgundy-velvet-bow-with-gold-trim"]')).toHaveAttribute('href', /burgundy-velvet-bow-with-gold-trim\.(?:png|webp)$/);
  await number(page, 'По горизонтали', 20); await number(page, 'По вертикали', 35);
  await number(page, 'Ширина', 60); await number(page, 'Поворот', 30); await number(page, 'Непрозрачность', 70);
  await expect.poll(async () => { const element = (await activeCard(page)).elements[0]; return { width: element.width, rotation: element.rotation, opacity: element.type !== 'text' ? element.opacity : null }; }).toEqual({ width: 60, rotation: 30, opacity: 0.7 });
  const changed = (await activeCard(page)).elements[0];
  expect(changed.width / changed.height).toBeCloseTo(1312 / 1199, 6);
  expect(changed).toMatchObject({ rotation: 30, opacity: 0.7 });
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  await preview.getByRole('combobox', { name: 'Формат экспорта открыток', exact: true }).selectOption('png');
  const pngButton = preview.getByRole('button', { name: 'Скачать PNG', exact: true });
  await expect(pngButton).toBeEnabled();
  const pngPromise = page.waitForEvent('download'); await pngButton.click();
  const png = await pngPromise; const bytes = await readFile((await png.path())!);
  const metadata = await sharp(bytes).metadata();
  expect(metadata.width).toBe(1240); expect(metadata.height).toBe(1748); expect(metadata.density).toBe(300);
  const stats = await sharp(bytes).stats(); expect(stats.isOpaque).toBe(true); expect(stats.channels.some(channel => channel.stdev > 5)).toBe(true);
  await png.saveAs('artifacts/postcard-decor-artwork.png');
  await preview.getByRole('combobox', { name: 'Формат экспорта открыток', exact: true }).selectOption('pdf');
  const pdfButton = preview.getByRole('button', { name: 'Скачать PDF', exact: true }); await expect(pdfButton).toBeEnabled();
  const pdfPromise = page.waitForEvent('download'); await pdfButton.click();
  const pdf = await pdfPromise; const pdfBytes = await readFile((await pdf.path())!);
  expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-'); expect(pdfBytes.toString('latin1')).toContain('/SMask');
});

test('format changes keep absolute geometry and independent postcard copies support reorder, delete and undo', async ({ page }) => {
  await create(page, 2, 'square');
  await text(page, 'Оригинальная история');
  const original = await activeCard(page), geometry = original.elements;
  await tab(page, 'Формат и фон');
  await page.getByRole('combobox', { name: 'Формат открытки', exact: true }).selectOption('a6-landscape');
  const format = page.getByRole('dialog', { name: 'Изменить формат открытки?', exact: true });
  await expect(format).toContainText('Координаты, размеры и повороты элементов сохранятся');
  await format.getByRole('button', { name: 'Изменить формат', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).format).toBe('a6-landscape');
  expect((await activeCard(page)).elements).toEqual(geometry);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await activeCard(page)).format).toBe('square');
  expect((await activeCard(page)).elements).toEqual(geometry);
  await page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)', exact: true }).click();
  await page.locator('.thumbnail-strip').getByRole('button', { name: 'Копировать открытку', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards.length).toBe(3);
  const copy = await activeCard(page);
  expect(copy.id).not.toBe(original.id); expect(copy.elements[0].id).not.toBe(geometry[0].id);
  expect(copy.format).toBe('a6-landscape');
  await tab(page, 'Слои');
  await page.getByRole('button', { name: 'Оригинальная история', exact: true }).click();
  await page.getByRole('textbox', { name: 'Текст на открытке', exact: true }).fill('Независимая копия');
  await expect.poll(async () => { const element = (await activeCard(page)).elements[0]; return element.type === 'text' ? element.content : null; }).toBe('Независимая копия');
  expect((await saved(page)).postcards.find(card => card.id === original.id)!.elements).toEqual(geometry);
  await page.locator('.thumbnail-strip').getByRole('button', { name: 'Переместить открытку раньше', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards[0].id).toBe(copy.id);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await saved(page)).postcards[1].id).toBe(copy.id);
  await page.locator('.thumbnail-strip').getByRole('button', { name: 'Удалить открытку', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Удалить открытку?', exact: true })).toHaveCount(0);
  await expect.poll(async () => (await saved(page)).postcards.length).toBe(2);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await saved(page)).activePostcardId).toBe(copy.id);
  expect((await saved(page)).postcards).toHaveLength(3);
});

test('tag and postcard projects survive navigation and reload with one shared terms acceptance', async ({ page }) => {
  await page.goto('/#tags');
  await page.locator('.template-card').first().click();
  await page.getByRole('button', { name: 'Выбрать шаблон', exact: true }).click();
  await page.locator('.count-picker__options button').first().click();
  await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
  await acceptTermsIfOffered(page); await expect(page.locator('.studio')).toBeVisible(); await dismissNotices(page);
  await page.getByLabel('Текст на карточке', { exact: true }).fill('Сохранённый адвент');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null')?.cards[0].text.content, tagKey)).toBe('Сохранённый адвент');
  const tagDocument = await page.evaluate(key => localStorage.getItem(key), tagKey);
  const acceptance = await page.evaluate(key => localStorage.getItem(key), acceptanceKey);
  const offered = await create(page, 1, 'a6-landscape', 'Отдельные открытки');
  expect(offered).toBe(false);
  await text(page, 'Сохранённая открытка');
  expect(await page.evaluate(key => localStorage.getItem(key), tagKey)).toBe(tagDocument);
  expect(await page.evaluate(key => localStorage.getItem(key), acceptanceKey)).toBe(acceptance);
  const postcardId = (await saved(page)).id;
  await page.goto('/#editor');
  await page.getByRole('dialog', { name: 'Продолжить работу над адвент-тегами?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByLabel('Текст на карточке', { exact: true })).toHaveValue('Сохранённый адвент');
  await page.goto('/#editor/postcards');
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.locator('.postcard-studio')).toBeVisible();
  await page.reload();
  await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
  expect((await saved(page)).id).toBe(postcardId);
  expect((await activeCard(page)).elements.filter(element => element.type === 'text').map(element => element.content)).toContain('Сохранённая открытка');
  await expect(page.getByRole('dialog', { name: 'Перед началом работы', exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), tagKey)).toBe(tagDocument);
});

test('preflight scopes errors to exported cards, confirms warnings once and targets the affected element', async ({ page }) => {
  await create(page);
  await text(page, 'Близко к краю'); await number(page, 'По горизонтали', 2);
  const first = (await saved(page)).postcards[0].id, second = (await saved(page)).postcards[1].id;
  await selectCard(page, second); await text(page, 'Вышло за край'); await number(page, 'По горизонтали', -1);
  await selectCard(page, first);
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  const download = preview.getByRole('button', { name: 'Скачать PDF', exact: true });
  await expect(preview.locator('.print-status')).toContainText('Предупреждений:');
  await expect(preview.locator('.print-issue--error')).toHaveCount(0);
  await expect(download).toBeDisabled();
  await preview.getByRole('checkbox').check(); await expect(download).toBeEnabled();
  await preview.getByLabel('Область экспорта открыток', { exact: true }).selectOption('all');
  await expect(preview.locator('.print-status')).toContainText('Ошибок:');
  await expect(download).toBeDisabled();
  await preview.locator('.print-issue--error').first().getByRole('button', { name: 'Исправить', exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect.poll(async () => (await saved(page)).activePostcardId).toBe(second);
  await expect(page.getByRole('textbox', { name: 'Текст на открытке', exact: true })).toHaveValue('Вышло за край');
  await number(page, 'По горизонтали', 3);
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  await expect(preview.locator('.print-status')).toContainText('Ошибок нет');
  await preview.getByLabel('Область экспорта открыток', { exact: true }).selectOption('all');
  await expect(preview.locator('.print-status')).toContainText('Предупреждений:');
  await expect(preview.getByRole('checkbox')).not.toBeChecked();
  await preview.getByLabel('Формат экспорта открыток', { exact: true }).selectOption('png');
  await expect(preview.getByRole('button', { name: 'Скачать ZIP (PNG)', exact: true })).toBeDisabled();
  await expect(preview.locator('.print-page-paper svg').first()).toHaveAttribute('viewBox', '0 0 105 148');
  await page.screenshot({ path: 'artifacts/postcards-scoped-preview-1440.png' });
});

test('all five mobile tools remain reachable and edits survive phone, tablet and landscape changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await create(page, 1, 'square');
  await text(page, 'Зима и тепло');
  await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
  await page.screenshot({ path: 'artifacts/postcards-editor-390.png' });
  await page.setViewportSize({ width: 320, height: 800 });
  for (const label of ['Текст', 'Иллюстрации', 'Декор', 'Формат и фон', 'Слои']) {
    const control = page.getByRole('navigation', { name: 'Инструменты открытки', exact: true }).getByRole('button', { name: label, exact: true });
    await control.scrollIntoViewIfNeeded();
    const box = await control.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    await control.click();
    await expect(page.getByRole('dialog', { name: label, exact: true })).toBeVisible();
    if (label === 'Формат и фон') {
      await expect(page.getByRole('combobox', { name: 'Тип фона', exact: true })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Формат открытки', exact: true })).toBeVisible();
      await number(page, 'Скругление углов', 4);
      await expect.poll(async () => (await activeCard(page)).cornerRadius).toBe(4);
    }
    await expect(page.locator('.workspace')).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'artifacts/postcards-editor-320.png' });
  await page.setViewportSize({ width: 768, height: 1024 });
  await tab(page, 'Текст');
  await page.getByRole('button', { name: 'Готовые надписи', exact: true }).click();
  await page.getByLabel('Поиск надписей', { exact: true }).fill('golden-merry-christmas-calligraphy');
  await page.locator('.image-library button').first().click();
  await expect.poll(async () => (await activeCard(page)).elements.length).toBe(2);
  await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
  const design = (await activeCard(page)).elements;
  await page.screenshot({ path: 'artifacts/postcards-editor-768-portrait.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.bottom-sheet')).toHaveCount(0);
  await expect(page.locator('.inspector')).toBeVisible();
  await tab(page, 'Слои');
  await expect(page.locator('.postcard-layers > div')).toHaveCount(2);
  expect((await activeCard(page)).elements).toEqual(design);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/postcards-editor-1024-landscape.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.thumbnail-strip')).toBeVisible();
  expect((await activeCard(page)).cornerRadius).toBe(4);
  expect((await activeCard(page)).elements).toEqual(design);
  await page.screenshot({ path: 'artifacts/postcards-editor-1440.png' });
});

test('direction menus support keyboard focus and generic creation opens the selected catalog without saving a project', async ({ page }) => {
  await page.goto('/#home');
  const editor = page.getByRole('button', { name: 'Редактор', exact: true });
  await editor.focus(); await editor.press('ArrowDown');
  const editorMenu = page.getByRole('menu', { name: 'Редактор: направление', exact: true });
  await expect(editorMenu.getByRole('menuitem', { name: 'Адвент-теги', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(editorMenu.getByRole('menuitem', { name: 'Открытки', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(editorMenu).toHaveCount(0); await expect(editor).toBeFocused();
  await editor.click(); await page.locator('.home-hero h1').click();
  await expect(editorMenu).toHaveCount(0);
  await page.getByRole('button', { name: 'Шаблоны', exact: true }).click();
  await page.getByRole('menu', { name: 'Шаблоны: направление', exact: true }).getByRole('menuitem', { name: 'Открытки', exact: true }).click();
  await expect(page).toHaveURL(/#postcards$/);
  await expect(page.locator('.template-catalog .postcard-start-card')).toHaveCount(3);
  await expect(page.locator('.postcard-artistic-catalog .postcard-start-card')).toHaveCount(3);
  await page.goto('/#home');
  await page.locator('.home-hero').getByRole('link', { name: 'Создать проект', exact: true }).click();
  await page.getByRole('dialog', { name: 'Что будем создавать?', exact: true }).getByRole('button', { name: 'Открытки', exact: true }).click();
  await expect(page).toHaveURL(/#postcards$/);
  expect(await page.evaluate(keys => keys.map(key => localStorage.getItem(key)), [postcardKey, tagKey])).toEqual([null, null]);
});

test('a failed requested font shows its local fallback and keeps export consent tied to the resolved layout', async ({ page }) => {
  await page.route('**/fonts/PTSerif-Regular.ttf', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.fulfill({ status: 404, body: '' }); });
  await create(page, 1);
  await tab(page, 'Иллюстрации');
  await expect(page.getByRole('combobox', { name: 'Коллекция иллюстраций', exact: true })).toHaveCount(0);
  await expect(page.locator('.image-library button')).toHaveCount(images.length);
  await page.getByLabel('Поиск иллюстраций', { exact: true }).fill('rustic-wooden-star');
  await expect(page.getByRole('button', { name: 'Добавить: Деревянная звезда с хвоей', exact: true })).toBeVisible();
  await text(page, 'С Новым годом!');
  await page.getByRole('combobox', { name: 'Шрифт', exact: true }).selectOption('serif');
  await expect(page.getByRole('status').filter({ hasText: 'Загружаем шрифт…' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверка всего проекта', exact: true })).toContainText('Предупреждений: 1');
  await page.getByRole('button', { name: 'Проверка всего проекта', exact: true }).click();
  const problems = page.getByRole('dialog', { name: 'Проверка всего проекта', exact: true });
  await expect(problems).toContainText('PT Sans');
  await problems.getByRole('button', { name: 'Закрыть окно', exact: true }).click();
  const original = (await activeCard(page)).elements[0];
  expect(original.type === 'text' && original.fontId).toBe('serif');
  await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
  await expect(preview.locator('.print-issue--warning')).toHaveCount(1);
  await expect(preview).toContainText('PT Sans');
  await expect(preview.getByRole('button', { name: 'Скачать PDF', exact: true })).toBeDisabled();
  await preview.getByRole('checkbox').check();
  await expect(preview.getByRole('button', { name: 'Скачать PDF', exact: true })).toBeEnabled();
});
