import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

interface CapturedEvent { event: string; uuid: string; timestamp?: string; properties: Record<string, unknown> }

/** Observe the installed SDK after before_send, without exposing it in production code. */
async function observeSdk(page: Page, failCapture = false) {
    await page.evaluate(async fail => {
        const source = await (await fetch('/src/analytics.ts')).text();
        const sdkUrl = source.match(/from\s*["']([^"']*posthog-js[^"']*)["']/)?.[1];
        if (!sdkUrl) throw new Error('Vite PostHog module not found');
        const sdk = (await import(/* @vite-ignore */ sdkUrl)).default;
        // PostHog filters Playwright's webdriver even with a normal UA. Test-only override.
        sdk.set_config({ opt_out_useragent_filter: true });
        const state = window as Window & { analyticsEvents?: unknown[] };
        state.analyticsEvents = [];
        sdk.on('eventCaptured', (event: unknown) => state.analyticsEvents!.push(event));
        if (fail) sdk.capture = () => { throw new Error('PostHog unavailable'); };
    }, failCapture);
}
async function events(page: Page): Promise<CapturedEvent[]> {
    return page.evaluate(() => (window as Window & { analyticsEvents?: CapturedEvent[] }).analyticsEvents ?? []);
}

test.beforeEach(async ({ page }) => {
    // Do not pollute production analytics; network failure is intentional in these tests.
    await page.route(/^https:\/\/[^/]*\.posthog\.com\//, route => route.abort());
    await page.routeWebSocket('**/*', () => {});
});

test('real SDK preserves cookieless protocol fields and StrictMode does not duplicate section visits', async ({ page }) => {
    await page.goto('/');
    await observeSdk(page);
    await page.evaluate(() => { location.hash = 'ideas/gifts'; });
    await expect(page.locator('.gift-ideas-page')).toBeVisible();
    await expect.poll(() => events(page)).toHaveLength(1);
    const [event] = await events(page);
    expect(event.event).toBe('gift_catalog_open');
    expect(event.uuid).toMatch(/^[0-9a-f-]{36}$/);
    expect(event.timestamp).toBeTruthy();
    expect(event.properties).toEqual({
        token: expect.stringMatching(/^phc_/), distinct_id: '$posthog_cookieless',
        $cookieless_mode: true, $process_person_profile: false, $host: '127.0.0.1:5173',
    });
    await page.locator('input[type="radio"]').nth(1).check();
    await page.locator('input[type="radio"]').first().check();
    expect(await events(page)).toHaveLength(1);
    await page.evaluate(() => { location.hash = 'ideas'; });
    await expect(page.locator('.gift-ideas-page')).toHaveCount(0);
    await page.evaluate(() => { location.hash = 'ideas/gifts'; });
    await expect.poll(() => events(page)).toHaveLength(2);
    expect(await page.context().cookies()).toEqual([]);
    expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('ph_')))).toEqual([]);
});

for (const failCapture of [false, true]) test(`card and gift PDFs download with ${failCapture ? 'throwing SDK' : 'failed analytics network'}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(async () => {
        const modelPath = '/src/domain/postcards/project.ts';
        const { createPostcardProject } = await import(/* @vite-ignore */ modelPath);
        localStorage.setItem('christmas-studio:postcards:project', JSON.stringify(createPostcardProject({ count: 1, format: 'a6-portrait' })));
    });
    // Use the same repository key as the application, not a test-only editor setup.
    await page.goto('/#editor/postcards');
    await page.reload();
    await page.getByRole('dialog', { name: 'Продолжить работу над открытками?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
    await observeSdk(page, failCapture);
    await page.getByRole('button', { name: 'Предпросмотр и экспорт', exact: true }).click();
    const preview = page.getByRole('dialog', { name: 'Предпросмотр открыток', exact: true });
    const downloadButton = preview.getByRole('button', { name: 'Скачать PDF', exact: true });
    await expect(downloadButton).toBeEnabled();
    for (let index = 0; index < 2; index++) {
        const promised = page.waitForEvent('download');
        await downloadButton.click();
        const file = await promised;
        expect(file.suggestedFilename()).toBe('Postcard.pdf');
        expect((await readFile((await file.path())!)).subarray(0, 5).toString()).toBe('%PDF-');
    }
    await preview.getByRole('button', { name: 'К редактору', exact: true }).click();
    await page.evaluate(() => { location.hash = 'ideas/gifts'; });
    await page.locator('.gift-ideas-custom input').fill('PRIVATE gift');
    await page.locator('.gift-ideas-custom button').click();
    const promised = page.waitForEvent('download');
    await page.locator('.gift-ideas-list-panel').getByRole('button', { name: 'Скачать PDF', exact: true }).click();
    const giftFile = await promised;
    expect((await readFile((await giftFile.path())!)).subarray(0, 5).toString()).toBe('%PDF-');
    if (failCapture) expect(await events(page)).toEqual([]);
    else {
        const captured = await events(page);
        expect(captured.map(event => event.event)).toEqual(['card_pdf_export', 'card_pdf_export', 'gift_catalog_open', 'gift_list_export']);
        expect(JSON.stringify(captured)).not.toContain('PRIVATE');
    }
    expect(errors).toEqual([]);
});

test('tag PDF export and editing survive a throwing PostHog SDK', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(async () => {
        const modelPath = '/src/domain/project.ts';
        const { createProject } = await import(/* @vite-ignore */ modelPath);
        localStorage.setItem('advent-tag-studio:project', JSON.stringify(createProject('woodland', 24)));
    });
    await page.goto('/#editor/tags');
    await page.reload();
    await page.getByRole('dialog', { name: 'Продолжить работу над адвент-тегами?', exact: true }).getByRole('button', { name: 'Продолжить', exact: true }).click();
    await observeSdk(page, true);
    await page.getByLabel('Текст на карточке', { exact: true }).fill('PRIVATE greeting');
    await page.getByLabel('Размер шрифта', { exact: true }).fill('12');
    await page.getByRole('button', { name: 'Предпросмотр и PDF', exact: true }).click();
    const button = page.getByRole('button', { name: 'Скачать PDF', exact: true });
    await expect(button).toBeEnabled({ timeout: 45_000 });
    const promised = page.waitForEvent('download');
    await button.click();
    const file = await promised;
    expect(file.suggestedFilename()).toBe('Advent-Tags.pdf');
    expect((await readFile((await file.path())!)).subarray(0, 5).toString()).toBe('%PDF-');
    expect(await events(page)).toEqual([]);
    expect(errors).toEqual([]);
});
