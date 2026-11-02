import { expect, test } from '@playwright/test';

test('all six gallery collections create a complete 31-card project', async ({ browser, baseURL }) => {
  for (const id of ['woodland', 'winter', 'vintage', 'forest-friends', 'warm-gifts', 'classic-christmas']) {
    const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto('/#tags');
      await page.locator(`[data-template-id="${id}"]`).click();
      await page.getByRole('button', { name: 'Выбрать шаблон' }).click();
      await page.locator('.count-picker__options').getByRole('button', { name: '31 карточки', exact: true }).click();
      await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
      const skip = page.getByRole('button', { name: 'Пропустить', exact: true });
      if (await skip.count()) await skip.click();
      await expect(page.locator('.studio')).toBeVisible();
      await expect.poll(async () => {
        return page.evaluate(() => {
          const project = JSON.parse(localStorage.getItem('advent-tag-studio:project') ?? 'null');
          return project ? { template: project.templateId, count: project.cards.length, unique: new Set(project.cards.map((card: { illustration: { assetId: string } }) => card.illustration.assetId)).size } : null;
        });
      }).toEqual({ template: id, count: 31, unique: 31 });
    } finally { await context.close(); }
  }
});

test('about products keep their destinations and feedback offers the real author email', async ({ page }) => {
  await page.goto('/#about');
  await expect(page.getByRole('heading', { name: 'Что можно создать', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Написать автору', exact: true })).toHaveAttribute('href', 'mailto:albekmerus@gmail.com');
  await page.getByRole('button', { name: 'Оставить отзыв', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Ссылка для отзывов появится чуть позже.');
  await expect(page.getByRole('dialog').getByRole('link', { name: 'albekmerus@gmail.com' })).toHaveAttribute('href', 'mailto:albekmerus@gmail.com');
  await page.getByRole('button', { name: 'Понятно', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Оставить отзыв', exact: true })).toBeFocused();
  for (const product of ['postcards', 'stickers']) {
    await page.locator(`.about-products [data-product=${product}]`).click();
    await expect(page.locator('.coming-soon')).toBeVisible();
    await page.goto('/#about');
  }
  await page.locator('.about-products [data-product=tags]').click();
  await expect(page.getByRole('heading', { name: 'Готовые шаблоны', exact: true })).toBeVisible();
});

test('the two redesigned bodies load supplied covers and retain geometry for missing artwork at every width', async ({ page }) => {
  for (const route of ['tags', 'about']) {
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 1000 ? 1024 : 900 });
      await page.goto(`/#${route}`);
      await expect(page.locator('main [data-art-slot]').first()).toBeVisible();
      if (route === 'tags') {
        await expect(page.locator('.template-hero img')).toHaveCount(3);
        await expect.poll(() => page.locator('.template-hero img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
        await expect(page.locator('.template-catalog img')).toHaveCount(6);
        for (const cover of await page.locator('.template-catalog img').all()) {
          await cover.scrollIntoViewIfNeeded();
          await expect.poll(() => cover.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
        }
        for (const [id, file] of [['woodland', 'coniferous-fairytale'], ['winter', 'winter-stories'], ['vintage', 'vintage-celebration'], ['forest-friends', 'forest-friends'], ['warm-gifts', 'warm-gifts'], ['classic-christmas', 'classic-christmas']]) {
          await expect(page.locator(`[data-template-id="${id}"] img`)).toHaveAttribute('src', new RegExp(`/site/${file}\\.webp$`));
        }
      } else await expect(page.locator('main img,main image')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      if (route === 'tags') await expect(page.locator('.template-card')).toHaveCount(6);
    }
  }
});
