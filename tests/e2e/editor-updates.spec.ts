import { expect, test, type Page } from '@playwright/test';
import { acceptTermsIfOffered } from './support/terms';

type Product = 'tags' | 'postcards';
const storageKey = (product: Product) => product === 'tags' ? 'advent-tag-studio:project' : 'christmas-studio:postcards:project';
const saved = (page: Page, product: Product) => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), storageKey(product));
const resume = (page: Page, product: Product) => page.getByRole('dialog', { name: product === 'tags' ? 'Продолжить работу над адвент-тегами?' : 'Продолжить работу над открытками?', exact: true });
async function dismissNotices(page: Page) {
  for (const name of ['Понятно', 'Пропустить', 'Скрыть уведомление']) {
    const button = page.getByRole('button', { name, exact: true });
    if (await button.count()) await button.click();
  }
}
async function create(page: Page, product: Product) {
  await page.goto(`/#${product}`);
  await page.locator(product === 'tags' ? '[data-template-id="woodland"]' : '[data-postcard-template="blank-a6-portrait"]').click();
  if (product === 'tags') {
    await page.getByRole('button', { name: 'Выбрать шаблон', exact: true }).click();
    await page.locator('.count-picker__options button').first().click();
  } else await page.getByLabel('Количество открыток', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
  await acceptTermsIfOffered(page);
  await expect(page.locator('.studio')).toBeVisible();
  await dismissNotices(page);
  await expect.poll(async () => Boolean(await saved(page, product))).toBe(true);
  await expect(resume(page, product)).toHaveCount(0);
}
async function editorAction(page: Page, label: 'Шаблоны' | 'Справка', product: Product) {
  const desktop = page.locator('.studio-nav').getByRole('button', { name: label, exact: true });
  if (await desktop.isVisible()) await desktop.click();
  else {
    await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
    await page.locator('.mobile-navigation').getByRole('button', { name: label === 'Шаблоны' && product === 'postcards' ? 'Шаблоны открыток' : label === 'Справка' && product === 'tags' ? 'Справка и помощь' : label, exact: true }).click();
  }
}
test.beforeEach(async ({ page }) => { await page.routeWebSocket('**/*', () => {}); });

for (const width of [1440, 390]) test(`hero creation at ${width} follows independent tag and postcard projects`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const created = new Set<Product>();
  const homeAction = async () => {
    await page.goto('/#home');
    await expect(page.locator('.home-hero').getByRole('link', { name: 'Создать проект', exact: true })).toBeVisible();
    await expect(page.locator('.public-header').getByRole('link', { name: 'Создать проект', exact: true })).toHaveCount(0);
  };
  const galleryAction = async (product: Product) => {
    await page.goto(`/#${product}`);
    await expect(page.locator('.template-hero')).toBeVisible();
    const action = page.locator('.template-hero').getByRole('link', { name: 'Создать проект', exact: true });
    await expect(action).toHaveCount(created.has(product) ? 0 : 1);
    await expect(page.locator('.template-hero__copy .saved-project--compact')).toHaveCount(created.has(product) ? 1 : 0);
    await expect(page.locator('main > .saved-project')).toHaveCount(0);
    await expect(page.locator('.public-header').getByRole('link', { name: 'Создать проект', exact: true })).toHaveCount(0);
    if (!created.has(product)) {
      await action.click();
      await expect(page.locator('.template-intro')).toBeInViewport();
      await expect(page.locator('.template-intro')).toBeFocused();
      expect(await saved(page, product)).toBeNull();
    }
  };
  await homeAction();
  await galleryAction('tags'); await galleryAction('postcards');
  await create(page, 'tags'); created.add('tags');
  const originalTags = await saved(page, 'tags');
  await homeAction();
  await galleryAction('tags'); await galleryAction('postcards');
  expect(await saved(page, 'tags')).toEqual(originalTags);
  await create(page, 'postcards'); created.add('postcards');
  await homeAction();
  await galleryAction('tags'); await galleryAction('postcards');
  expect(await saved(page, 'tags')).toEqual(originalTags);
});

for (const width of [1440, 390]) for (const product of ['tags', 'postcards'] as const) {
  test(`${product} at ${width}: saved-project choices preserve data and editor navigation scrolls to the catalog`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await create(page, product);
    const original = await saved(page, product);
    await page.reload();
    await expect(resume(page, product)).toContainText(original.name);
    await resume(page, product).getByRole('button', { name: 'Продолжить', exact: true }).click();
    await dismissNotices(page);
    expect(await saved(page, product)).toEqual(original);
    await editorAction(page, 'Шаблоны', product);
    await expect(page).toHaveURL(new RegExp(`#${product}$`));
    const intro = page.locator('.template-intro');
    await expect(intro).toBeInViewport();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await expect.poll(async () => (await intro.boundingBox())!.y).toBeLessThan(360);
    await expect(page.locator('.template-hero .artwork-placeholder, .template-hero .bow-divider')).toHaveCount(0);
    await expect(intro.locator('.bow-divider')).toHaveCount(1);
    const notice = page.getByRole('region', { name: product === 'tags' ? 'Сохранённый проект адвент-тегов' : 'Сохранённый проект открыток', exact: true });
    await expect(notice).toContainText(original.name);
    await expect(notice).toContainText(product === 'tags' ? 'Карточек в наборе: 24' : 'Открыток в проекте: 2');
    await notice.getByRole('button', { name: 'Продолжить', exact: true }).click();
    await expect(page.locator('.studio')).toBeVisible();
    await expect(resume(page, product)).toHaveCount(0);
    expect(await saved(page, product)).toEqual(original);
    await page.reload();
    await resume(page, product).getByRole('button', { name: 'Начать новый', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${product}$`));
    expect(await saved(page, product)).toEqual(original);
    if (product === 'tags') {
      await notice.getByRole('button', { name: 'Начать новый', exact: true }).click();
      await expect(intro).toBeInViewport();
      expect(await saved(page, product)).toEqual(original);
      await page.locator('[data-template-id="winter"]').click();
      await page.getByRole('button', { name: 'Выбрать шаблон', exact: true }).click();
      await page.locator('.count-picker__options button').first().click();
      await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
      await page.getByRole('dialog', { name: 'Начнём новую историю?', exact: true }).getByRole('button', { name: 'Оставить текущий', exact: true }).click();
      expect(await saved(page, product)).toEqual(original);
    }
    // A later ordinary catalog visit starts at the hero, without retaining the editor's scroll intent.
    await page.goto('/#home');
    await page.goto(`/#${product}`);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await page.screenshot({ path: `artifacts/${product}-saved-project-${width}.png`, fullPage: true });
  });
}

test('tag template dialog keeps its title and description fixed while selecting a card count', async ({ page }) => {
  for (const width of [1920, 1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#tags');
    await page.locator('[data-template-id="woodland"]').click();
    const dialog = page.getByRole('dialog', { name: 'Зимний сад', exact: true });
    await expect(dialog.getByRole('heading', { name: 'Зимний сад', exact: true })).toHaveCount(1);
    await expect(dialog.locator('.modal__header, .eyebrow')).toHaveCount(0);
    await expect(dialog).not.toContainText('Маленькая история');
    await expect(dialog).toContainText('Еловые ветви, тёплая бумага и маленькие чудеса.');
    await page.evaluate(() => document.fonts.ready);
    await dialog.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    const artwork = (await dialog.locator('.template-preview__art').boundingBox())!;
    const close = (await dialog.getByRole('button', { name: 'Закрыть окно', exact: true }).boundingBox())!;
    expect(Math.abs(close.y - artwork.y)).toBeLessThan(3);
    const sizes = await dialog.locator('.template-preview__info').evaluate(element => [...element.querySelectorAll('p')].map(item => Number.parseFloat(getComputedStyle(item).fontSize)));
    expect(sizes[1]).toBeLessThan(sizes[0]);
    const positions = () => dialog.locator('.template-preview__info > h2, .template-preview__info > p').evaluateAll(elements => elements.map(element => { const { x, y } = element.getBoundingClientRect(); return { x, y }; }));
    const before = await positions();
    await page.screenshot({ path: `artifacts/tag-template-dialog-${width}.png` });
    await dialog.getByRole('button', { name: 'Выбрать шаблон', exact: true }).click();
    await expect(dialog.getByRole('heading', { name: 'Сколько карточек хотите создать?', exact: true })).toBeVisible();
    const after = await positions();
    before.forEach((point, index) => { expect(after[index].x).toBeCloseTo(point.x, 1); expect(after[index].y).toBeCloseTo(point.y, 1); });
    const quantity = dialog.getByRole('button', { name: '31 карточка', exact: true });
    await quantity.click();
    await expect(quantity).toHaveAttribute('aria-pressed', 'true');
    const countFonts = await dialog.evaluate(element => [...element.querySelectorAll('.template-preview__info > h2, .count-picker__options button, .count-picker__options strong, .count-picker__options span')].map(item => getComputedStyle(item).fontFamily.split(',')[0].replaceAll('"', '').replaceAll("'", '').trim()));
    expect(new Set(countFonts)).toEqual(new Set(['PT Sans']));
    const countButton = (await quantity.boundingBox())!;
    expect(countButton.height).toBeGreaterThanOrEqual(44);
    expect(countButton.height).toBeLessThanOrEqual(48);
    expect(countButton.width).toBeLessThanOrEqual(140);
    await page.screenshot({ path: `artifacts/tag-template-count-${width}.png` });
    await dialog.getByRole('button', { name: 'Назад', exact: true }).click();
    expect(await positions()).toEqual(before);
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Закрыть окно', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('both FAQs clearly distinguish unsupported image uploads from card-count controls', async ({ page }) => {
  for (const product of ['tags', 'postcards'] as const) {
    await create(page, product);
    await editorAction(page, 'Справка', product);
    const help = page.getByRole('dialog', { name: 'Как пользоваться редактором', exact: true });
    await help.getByRole('tab', { name: 'Частые вопросы', exact: true }).click();
    const upload = help.locator('details').filter({ hasText: 'Можно загрузить свою картинку?' });
    await upload.locator('summary').click();
    await expect(upload.locator('p')).toBeVisible();
    await expect(upload.locator('p')).toContainText('В текущей версии — нет');
    await expect(upload.locator('p')).toContainText('Возможно, загрузка своих изображений появится позднее.');
    const quantity = help.locator('details').filter({ hasText: product === 'tags' ? 'Можно изменить число карточек?' : 'Как изменить число открыток?' });
    await quantity.locator('summary').click();
    await expect(quantity.locator('p')).toContainText(product === 'tags' ? '24 или 31' : '1–20');
    await expect(quantity.locator('p')).toContainText(product === 'tags' ? 'Изменить количество в готовом проекте нельзя' : 'удаление можно отменить');
    await help.getByRole('button', { name: 'Закрыть окно', exact: true }).click();
  }
});

for (const width of [1440, 390]) test(`postcard help at ${width} shares guide, FAQ, private report and replayable tour`, async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width, height: 900 });
  await create(page, 'postcards');
  const textTab = page.getByRole(width === 1440 ? 'tab' : 'button', { name: 'Текст', exact: true });
  await textTab.click();
  await page.getByRole('button', { name: 'Добавить текст', exact: true }).click();
  await page.getByRole('textbox', { name: 'Текст на открытке', exact: true }).fill('СЕКРЕТНАЯ НАДПИСЬ');
  if (width === 390) await page.getByRole('button', { name: 'Закрыть панель', exact: true }).click();
  await editorAction(page, 'Справка', 'postcards');
  const help = page.getByRole('dialog', { name: 'Как пользоваться редактором', exact: true });
  await expect(help.getByRole('tab')).toHaveText(['Начало работы', 'Частые вопросы', 'Помощь']);
  await expect(help.locator('.guide-steps > li')).toHaveCount(4);
  await expect(help).toContainText('от 1 до 20');
  await expect(help).toContainText('PDF, JPG или PNG');
  await page.screenshot({ path: `artifacts/postcard-help-${width}.png` });
  await help.getByRole('tab', { name: 'Частые вопросы', exact: true }).click();
  await help.locator('summary').filter({ hasText: 'Как добавить готовую надпись?' }).click();
  await expect(help).toContainText('«Текст» и выберите «Готовые надписи»');
  await help.locator('summary').filter({ hasText: 'Где изменить формат и фон?' }).click();
  await expect(help).toContainText('«Формат и фон»');
  await expect(help).not.toContainText('Количество 24 или 31');
  await help.getByRole('tab', { name: 'Помощь', exact: true }).click();
  await expect(help).toContainText('Без содержимого открыток');
  await expect(help.locator('.technical-report')).not.toContainText('СЕКРЕТНАЯ');
  await help.getByRole('textbox', { name: 'Описание проблемы', exact: true }).fill('Не получается изменить фон');
  await help.getByRole('button', { name: 'Закрыть окно', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Закрыть описание проблемы?', exact: true });
  await confirmation.getByRole('button', { name: 'Продолжить описание', exact: true }).click();
  await expect(help.getByRole('textbox', { name: 'Описание проблемы', exact: true })).toHaveValue('Не получается изменить фон');
  await help.getByRole('button', { name: 'Скопировать описание и отчёт', exact: true }).click();
  await expect(help.getByRole('button', { name: 'Скопировано', exact: true })).toBeVisible();
  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain('Не получается изменить фон'); expect(report).not.toContain('СЕКРЕТНАЯ');
  expect(Object.keys(JSON.parse(report.slice(report.indexOf('{'))))).toEqual(['appVersion', 'browser', 'storage', 'validation']);
  await help.getByRole('button', { name: 'Назад к справке', exact: true }).click();
  await help.getByRole('button', { name: 'Пройти тур', exact: true }).click();
  await expect(page.getByText('Шаг 1 из 5', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await editorAction(page, 'Справка', 'postcards');
  await help.getByRole('button', { name: 'Пройти тур', exact: true }).click();
  await expect(page.getByText('Шаг 1 из 5', { exact: true })).toBeVisible();
});
