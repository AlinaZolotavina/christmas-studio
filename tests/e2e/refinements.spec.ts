import { expect, test, type Page } from '@playwright/test';

const key = 'advent-tag-studio:project';
const documentData = (page: Page) => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey) ?? 'null'), key);
async function project(page: Page) {
  await page.goto('/#tags');
  await page.locator('.template-card').first().click();
  await page.getByRole('button', { name: 'Выбрать шаблон' }).click();
  await page.locator('.count-picker__options button').first().click();
  await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
  await expect(page.locator('.studio')).toBeVisible();
  const skip = page.getByRole('button', { name: 'Пропустить', exact: true });
  if (await skip.count()) await skip.click();
  const notice = page.getByRole('button', { name: 'Скрыть уведомление' });
  if (await notice.count()) await notice.click();
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await expect.poll(async () => (await documentData(page))?.cardCount).toBe(24);
}

test('home keeps the tag collections and gives future products real coming-soon pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Выберите, что создать' })).toBeVisible();
  for (const product of ['postcards', 'stickers']) {
    await page.locator(`[data-product=${product}]`).click();
    await expect(page.getByRole('heading', { name: 'Готовим для вас что-то особенное' })).toBeVisible();
    await expect(page.locator('.studio')).toHaveCount(0);
    await page.getByRole('link', { name: 'На главную', exact: true }).click();
  }
  await page.locator('.public-header nav').getByRole('link', { name: 'Идеи', exact: true }).click();
  await expect(page.locator('.coming-soon__section')).toHaveText('Идеи · В разработке');
  await page.locator('.public-header nav').getByRole('link', { name: 'О проекте', exact: true }).click();
  await expect(page.locator('.about-project')).toContainText('Новогодняя мастерская для больших праздничных идей.');
  await expect(page.locator('.about-project')).toContainText('Мы создали это пространство, чтобы подготовка к праздникам стала проще и приятнее.');
  await page.getByRole('link', { name: 'Выбрать набор бирок', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Хвойная сказка', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Зимние истории', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Винтажный праздник', exact: true })).toBeVisible();
});

test('desktop keeps cards and export in their separate panels and moves status to the header right', async ({ page }) => {
  await project(page);
  await expect(page.locator('.thumbnail-strip')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Карточки', exact: true })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Экспорт', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Предпросмотр и PDF', exact: true })).toBeVisible();
  await page.locator('.studio-wordmark').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const bounds = await page.locator('.save-status').boundingBox();
  expect(bounds!.x).toBeGreaterThan(1100);
  await expect(page.locator('.studio-header__project .project-state')).toBeVisible();
  await expect(page.locator('.workspace-card-info')).toContainText('Карточка 1 из 24');
  await expect(page.locator('.workspace__caption,.workspace__hint,.nav-sprig')).toHaveCount(0);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.thumbnail-strip')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Карточки', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Экспорт', exact: true })).toBeVisible();
  await expect(page.locator('.inspector-footer')).toHaveCount(0);
});

test('blank-card dragging stays fixed and text issues appear before leaving the field', async ({ page }) => {
  await project(page);
  const before = await page.locator('.canvas-artboard').boundingBox();
  const scale = before!.width / 50;
  const x = before!.x + 25 * scale, y = before!.y + 78 * scale;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 55, y - 30, { steps: 6 }); await page.mouse.up();
  const after = await page.locator('.canvas-artboard').boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 1); expect(after!.y).toBeCloseTo(before!.y, 1);
  await page.getByRole('tab', { name: 'Текст', exact: true }).click();
  await page.getByLabel('Текст на карточке', { exact: true }).fill('Большое праздничное пожелание '.repeat(20));
  await expect(page.locator('[data-element-issue=text][data-severity=error]')).toBeVisible({ timeout: 1000 });
  await page.getByLabel('Текст на карточке', { exact: true }).fill('Хо');
  const old = await documentData(page);
  await page.getByRole('button', { name: 'Всему набору', exact: true }).click();
  await page.getByRole('button', { name: 'Уменьшить поле до текста', exact: true }).click();
  await expect.poll(async () => (await documentData(page))?.cards[0].text.width).toBeLessThan(old.cards[0].text.width);
  const fitted = await documentData(page);
  expect(fitted.cards[0].text.fontSize).toBe(old.cards[0].text.fontSize);
  expect(fitted.cards[0].text.content).toBe('Хо');
  expect(fitted.cards[1].text).toEqual(old.cards[1].text);
  await page.getByLabel('Ширина', { exact: true }).focus();
  await page.getByLabel('Высота', { exact: true }).focus();
  await expect.poll(async () => (await documentData(page))?.cards[0].text.width).toBe(fitted.cards[0].text.width);
});

test('the image library scrolls independently and background owns the extra decorations', async ({ page }) => {
  await project(page);
  await page.getByRole('tab', { name: 'Изображение', exact: true }).click();
  await expect(page.getByLabel('Фон иллюстрации', { exact: true })).toHaveCount(0);
  await expect(page.locator('.decoration-options')).toHaveCount(0);
  const library = await page.locator('.image-library').evaluate(element => ({ height: element.clientHeight, scroll: element.scrollHeight, overflow: getComputedStyle(element).overflowY }));
  expect(library.height).toBeLessThanOrEqual(321); expect(library.scroll).toBeGreaterThan(library.height); expect(library.overflow).toBe('auto');
  await page.getByRole('tab', { name: 'Фон', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Дополнительный декор фона/ })).toBeVisible();
  await page.locator('.decoration-options').getByRole('button', { name: 'Звезда', exact: true }).click();
  await expect.poll(async () => (await documentData(page))?.cards[0].decorations.length).toBe(1);
});

test('project geometry changes the entire set after an inline warning and reset is reversible', async ({ page }) => {
  await project(page);
  const original = await documentData(page);
  expect(original.cards[0].hole.y).toBeCloseTo(5.75);
  await page.locator('.studio-nav').getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByLabel('Форма карточек', { exact: true }).selectOption('square');
  await expect(page.getByRole('note')).toContainText('у всех 24 карточек');
  await page.getByRole('button', { name: 'Применить ко всему набору', exact: true }).click();
  await expect.poll(async () => (await documentData(page))?.cards.every((card: { shape: string }) => card.shape === 'square')).toBe(true);
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('button', { name: 'Готово', exact: true }).click();
  await page.getByRole('button', { name: 'Сбросить проект', exact: true }).click();
  await page.getByRole('button', { name: 'Сбросить оформление', exact: true }).click();
  await expect.poll(async () => (await documentData(page))?.cards.every((card: { shape: string }) => card.shape === 'tag')).toBe(true);
  const reset = await documentData(page);
  expect(reset.id).toBe(original.id);
  expect(reset.cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId)).toEqual(original.cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId));
  await page.getByRole('button', { name: 'Отменить (Ctrl+Z)', exact: true }).click();
  await expect.poll(async () => (await documentData(page))?.cards[0].shape).toBe('square');
});

test('preview uses physical A4 at 100 percent and keeps both left edges reachable', async ({ page }) => {
  await project(page);
  await page.getByRole('button', { name: 'Предпросмотр и PDF', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Скачать PDF', exact: true })).toBeEnabled();
  await expect(page.getByText('ПОСЛЕДНИЙ ШТРИХ', { exact: true })).toHaveCount(0);
  const thumbs = page.locator('.print-page-thumb');
  const first = await thumbs.nth(0).boundingBox(), second = await thumbs.nth(1).boundingBox();
  expect(first!.y).toBeCloseTo(second!.y, 1); expect(second!.x).toBeGreaterThan(first!.x);
  await page.getByRole('button', { name: 'Масштаб 100%', exact: true }).click();
  const paper = await page.locator('.print-page-paper').boundingBox();
  expect(paper!.width).toBeCloseTo(210 * 96 / 25.4, 1);
  expect(paper!.height).toBeCloseTo(297 * 96 / 25.4, 1);
  const edges = await page.locator('.print-document-stage').evaluate(element => {
    element.scrollLeft = 0;
    const rect = element.getBoundingClientRect();
    const paperRect = element.querySelector('.print-page-paper')!.getBoundingClientRect();
    return { left: paperRect.left - rect.left, scrollable: element.scrollWidth > element.clientWidth };
  });
  expect(edges.left).toBeGreaterThanOrEqual(20); expect(edges.scrollable).toBe(true);
  await page.getByRole('button', { name: 'Вписать страницу', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Масштаб 100%', exact: true })).not.toHaveText('100%');
});

test('tour keeps its size on every step and leaves the explained interface sharp', async ({ page }) => {
  await project(page);
  await page.locator('.studio-nav').getByRole('button', { name: 'Справка', exact: true }).click();
  await page.getByRole('button', { name: 'Пройти тур', exact: true }).click();
  const first = await page.locator('.onboarding-tour').boundingBox();
  for (let step = 1; step <= 5; step++) {
    const frame = await page.locator('.onboarding-tour').boundingBox();
    expect(frame!.width).toBeCloseTo(first!.width, 1); expect(frame!.height).toBeCloseTo(first!.height, 1);
    await expect(page.getByText(`Шаг ${step} из 5`, { exact: true })).toBeVisible();
    expect(await page.locator('.tour-overlay').evaluate(element => getComputedStyle(element).backdropFilter)).toBe('none');
    await expect(page.locator('.onboarding-tour .eyebrow')).toHaveCount(0);
    if (step < 5) await page.getByRole('button', { name: 'Дальше', exact: true }).click();
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.onboarding-highlight')).toBeVisible();
  await expect.poll(async () => {
    const exportTab = await page.getByRole('tab', { name: 'Экспорт', exact: true }).boundingBox();
    const highlight = await page.locator('.onboarding-highlight').boundingBox();
    return Math.abs(highlight!.x - exportTab!.x - 3) + Math.abs(highlight!.width - exportTab!.width + 6);
  }).toBeLessThan(0.1);
  await page.getByRole('button', { name: 'Будем творить', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const restored = page.locator('.toast--restored');
  await expect(restored).toContainText('Проект восстановлен');
  expect(await restored.locator('svg').count()).toBe(1);
  const bounds = await restored.boundingBox();
  expect(bounds!.y).toBeLessThan(150); expect(bounds!.width).toBeLessThan(450); expect(bounds!.x).toBeGreaterThan(900);
});
