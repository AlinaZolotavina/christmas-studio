import type { Page } from '@playwright/test';

/** Follow the actual first-use flow; do not preseed an acceptance in editor tests. */
export async function acceptTermsIfOffered(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Перед началом работы', exact: true });
  if (await dialog.count()) {
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Принять и создать проект', exact: true }).click();
  }
}
