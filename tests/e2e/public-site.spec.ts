import { expect, test } from '@playwright/test';

test('first creation requires an explicit acceptance and does not save a project on cancellation', async ({ page, context }) => {
  await page.goto('/#tags');
  const choose = async () => {
    await page.locator('.template-card').first().click();
    await page.getByRole('button', { name: 'Выбрать шаблон', exact: true }).click();
    await page.locator('.count-picker__options button').first().click();
    await page.getByRole('button', { name: 'Создать проект', exact: false }).click();
  };
  await choose();
  const dialog = page.getByRole('dialog', { name: 'Перед началом работы' });
  const accept = dialog.getByRole('button', { name: 'Принять и создать проект' });
  await expect(accept).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('advent-tag-studio:project'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('advent-tag-studio:terms-acceptance'))).toBeNull();
  const legalTab = context.waitForEvent('page');
  await dialog.getByRole('link', { name: 'условиями использования' }).click();
  const termsPage = await legalTab;
  await expect(termsPage.getByRole('heading', { level: 1 })).toHaveText('Условия использования');
  await termsPage.close();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('advent-tag-studio:project'))).toBeNull();
  await choose();
  await dialog.getByRole('checkbox').check();
  await accept.click();
  await expect(page.locator('.studio')).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('advent-tag-studio:project')))).toBe(true);
  const acceptance = await page.evaluate(() => JSON.parse(localStorage.getItem('advent-tag-studio:terms-acceptance')!));
  expect(acceptance.version).toBe('2026-11-03');
  expect(Number.isFinite(Date.parse(acceptance.acceptedAt))).toBe(true);
  await page.reload();
  await expect(page.locator('.studio')).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Перед началом работы' })).toHaveCount(0);
});

test('public routes share navigation, a responsive footer and PT Sans typography', async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    let expectedHeader: string | undefined, expectedFooter: string | undefined, expectedType: unknown;
    for (const route of ['home', 'tags', 'about', 'postcards', 'stickers', 'ideas', 'terms', 'privacy']) {
      await page.goto(`/#${route}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.public-header')).toHaveCount(1);
      await expect(page.locator('.public-footer')).toHaveCount(1);
      await expect(page.locator('.public-header__create')).toHaveAttribute('href', route === 'tags' || route === 'postcards' ? `#${route}` : '#create');
      const header = await page.locator('.public-header').evaluate(element => {
        const clone = element.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('[aria-current]').forEach(item => item.removeAttribute('aria-current'));
        clone.querySelector('.public-header__create')?.setAttribute('href', '#create');
        return clone.outerHTML;
      });
      const footer = await page.locator('.public-footer').evaluate(element => element.outerHTML);
      expectedHeader ??= header; expectedFooter ??= footer;
      expect(header).toBe(expectedHeader); expect(footer).toBe(expectedFooter);
      const typography = await page.locator('main h1').evaluate(element => {
        const style = getComputedStyle(element);
        return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight };
      });
      expectedType ??= typography;
      expect(typography).toEqual(expectedType);
      expect(typography.family).toContain('PT Sans');
      for (const level of [2, 3, 4]) {
        const headingStyles = await page.locator(`main h${level}`).evaluateAll((elements, headingLevel) => {
          const expectedSize = getComputedStyle(document.querySelector('.public-site')!).getPropertyValue(`--public-h${headingLevel}-size`).trim();
          return elements.map(element => {
            const style = getComputedStyle(element);
            return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, expectedSize };
          });
        }, level);
        for (const style of headingStyles) { expect(style.family).toContain('PT Sans'); expect(style.size).toBe(style.expectedSize); expect(style.weight).toBe('700'); }
      }
      const bodySizes = await page.locator('main p').evaluateAll(elements => [...new Set(elements.map(element => `${getComputedStyle(element).fontFamily}|${getComputedStyle(element).fontSize}|${getComputedStyle(element).fontWeight}`))]);
      expect(bodySizes.length).toBe(1);
      expect(bodySizes[0]).toContain('PT Sans');
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      const stackedFooter = width <= 760 || (width <= 1150 && width <= page.viewportSize()!.height);
      expect(await page.locator('.public-footer__inner').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(stackedFooter ? 1 : 3);
      await expect(page.locator('.public-footer nav a')).toHaveText(['Адвент-теги', 'Открытки', 'Стикеры', 'Идеи', 'О проекте', 'Условия использования', 'Политика конфиденциальности']);
    }
  }
  await page.goto('/#about');
  const emphasis = await page.locator('.about-story__copy strong').evaluate(element => ({ size: getComputedStyle(element).fontSize, parentSize: getComputedStyle(element.parentElement!).fontSize, weight: getComputedStyle(element).fontWeight }));
  expect(emphasis.size).toBe(emphasis.parentSize); expect(emphasis.weight).toBe('700');
  await page.locator('.public-footer').getByRole('link', { name: 'Политика конфиденциальности', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Политика конфиденциальности');
  await expect(page.locator('.legal-page')).toContainText('Золотавина Алина');
  await expect(page.locator('.legal-page a[href="mailto:albekmerus@gmail.com"]')).toHaveCount(2);
  await expect(page.locator('.legal-page')).not.toContainText('Проект политики');
  await expect(page.locator('.legal-page')).not.toContainText('Германия');
});
