import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const storageKey = 'advent-tag-studio:project';
async function create(page: Page, count: 24 | 31 = 24) {
  await page.goto('/#tags');
  await page.locator('.template-card').first().click();
  await page.getByRole('button', { name: 'Выбрать шаблон' }).click();
  await page.locator('.count-picker__options button').filter({ hasText: String(count) }).click();
  await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
  await expect(page.locator('.studio')).toBeVisible();
  const acknowledge = page.getByRole('button', { name: 'Понятно', exact: true });
  if (await acknowledge.count()) await acknowledge.click();
  const skip = page.getByRole('button', { name: 'Пропустить', exact: true });
  if (await skip.count()) await skip.click();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}
async function saved(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), storageKey);
}

test('24 cards: edit, autosave, reload and undo preserve real document data', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await create(page);
  await page.getByLabel('Текст на карточке', { exact: true }).fill('Зимнее чудо');
  await expect.poll(async () => (await saved(page))?.cards[0].text.content).toBe('Зимнее чудо');
  const before = await saved(page);
  expect(before.cardCount).toBe(24);
  expect(new Set(before.cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId)).size).toBe(24);
  await page.reload();
  await expect(page.getByLabel('Текст на карточке', { exact: true })).toHaveValue('Зимнее чудо');
  expect((await saved(page)).cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId)).toEqual(before.cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId));
  await page.getByLabel('Текст на карточке', { exact: true }).fill('Мечта');
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect(page.getByLabel('Текст на карточке', { exact: true })).toHaveValue('Зимнее чудо');
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'artifacts/final-editor.png' });
});

test('one pointer drag is committed and one undo restores the illustration position', async ({ page }) => {
  await create(page);
  await expect.poll(async () => (await saved(page))?.cardCount).toBe(24);
  const initial = (await saved(page)).cards[0].illustration;
  const frame = await page.locator('.canvas-artboard').boundingBox();
  if (!frame) throw new Error('Canvas missing');
  const pxPerMm = frame.width / 50;
  const x = frame.x + (initial.x + initial.width / 2) * pxPerMm;
  const y = frame.y + (initial.y + initial.height / 2) * pxPerMm;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 32, y + 14, { steps: 8 }); await page.mouse.up();
  await expect.poll(async () => (await saved(page))?.cards[0].illustration.x).not.toBe(initial.x);
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.cards[0].illustration.x).toBe(initial.x);
});

test('31 cards: print preview downloads an actual PDF with embedded fonts', async ({ page }) => {
  await create(page, 31);
  await page.getByLabel('Текст на карточке', { exact: true }).fill('С новым годом');
  // Keep the default physical text block suitable for one line of small text.
  await page.getByLabel('Размер шрифта', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Предпросмотр и PDF', exact: true }).click();
  const downloadButton = page.getByRole('button', { name: 'Скачать PDF', exact: true });
  await expect(downloadButton).toBeEnabled({ timeout: 45_000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 90_000 });
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('Advent-Tags.pdf');
  const path = await download.path();
  const data = await fs.readFile(path!);
  expect(data.subarray(0, 5).toString()).toBe('%PDF-');
  expect(data.toString('latin1')).toContain('/ToUnicode');
  expect(data.toString('latin1')).toContain('/SMask');
  await fs.mkdir('artifacts', { recursive: true });
  await fs.copyFile(path!, 'artifacts/browser-31-cards.pdf');
  await page.screenshot({ path: 'artifacts/final-preview.png' });
});

test('phone: sheets keep canvas inactive and all cards remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await create(page, 31);
  await page.getByRole('navigation', { name: 'Инструменты карточки' }).getByRole('button', { name: 'Текст', exact: true }).click();
  await expect(page.locator('.bottom-sheet')).toBeVisible();
  await page.locator('.bottom-sheet').getByLabel('Текст на карточке', { exact: true }).fill('Тёплый декабрь');
  await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
  await page.getByRole('navigation', { name: 'Инструменты карточки' }).getByRole('button', { name: 'Карточки', exact: true }).click();
  await page.locator('.bottom-sheet').getByRole('button', { name: 'Карточка 31 из 31', exact: true }).click();
  await expect(page.locator('.bottom-sheet')).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
  await expect(page.locator('.workspace-card-info')).toContainText('31');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/final-phone.png' });
});

test('damaged local data stays downloadable and is not silently replaced', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(key => localStorage.setItem(key, '{broken-json'), storageKey);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Не удалось восстановить проект' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('{broken-json');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Скачать данные', exact: false }).click();
  expect((await download).suggestedFilename()).toBe('Advent-Tags-recovery.json');
});

test('image library searches both languages and combines taxonomy filters', async ({ page }) => {
  await create(page);
  await page.getByRole('tab', { name: 'Изображение', exact: true }).click();
  const query = page.getByRole('textbox', { name: 'Поиск иллюстраций' });
  await query.fill('kissing bough');
  const mistletoe = page.getByRole('button', { name: 'Заменить иллюстрацию: Омела с бордовым бантом', exact: true });
  await expect(mistletoe).toBeVisible();
  await query.fill('веточка омелы');
  await expect(mistletoe).toBeVisible();
  await page.getByLabel('Категория иллюстраций', { exact: true }).selectOption('botanical');
  await page.getByLabel('Подкатегория иллюстраций', { exact: true }).selectOption('botanical-branches');
  await expect(page.getByLabel('Фон иллюстрации', { exact: true })).toHaveCount(0);
  await expect(mistletoe).toBeVisible();
  await query.fill('definitelymissingterm');
  await expect(page.locator('.image-library button')).toHaveCount(0);
  await expect(page.getByText('Пока ничего не нашлось')).toBeVisible();
});

test('help keeps card contents out of its report and replays the voluntary tour from step one', async ({ page }) => {
  await create(page);
  await page.getByLabel('Текст на карточке', { exact: true }).fill('СЕКРЕТНЫЙ ТЕКСТ КАРТОЧКИ');
  await page.locator('.studio-nav').getByRole('button', { name: 'Справка', exact: true }).click();
  await page.getByRole('button', { name: 'Помощь', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Помощь', exact: true })).toBeVisible();
  await expect(page.locator('.technical-report')).not.toContainText('СЕКРЕТНЫЙ');
  await page.getByRole('button', { name: 'Назад к справке', exact: true }).click();
  await page.getByRole('button', { name: 'Пройти тур', exact: true }).click();
  await expect(page.getByText('Шаг 1 из 5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Дальше', exact: true }).click();
  await expect(page.getByText('Шаг 2 из 5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть окно', exact: true }).click();
  await page.locator('.studio-nav').getByRole('button', { name: 'Справка', exact: true }).click();
  await page.getByRole('button', { name: 'Пройти тур', exact: true }).click();
  await expect(page.getByText('Шаг 1 из 5', { exact: true })).toBeVisible();
});

test('editor fits all six planned viewport sizes without horizontal page overflow', async ({ page }) => {
  await create(page);
  for (const [width, height] of [[1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('.workspace')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/viewport-${width}x${height}.png` });
  }
});
