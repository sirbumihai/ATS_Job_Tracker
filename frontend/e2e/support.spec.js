import { test as base, expect } from '@playwright/test';
import { installMockApi } from './support/mockApi.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';

// Verifica helper-ele de test pe pagini sintetice, ca o regresie in ele sa nu treaca neobservata.
const test = base;

test('o cerere /api fara fixture e raportata, nu trece in tacere', async ({ page }) => {
  const api = await installMockApi(page);
  await page.goto('/');
  const status = await page.evaluate(() => fetch('/api/v1/endpoint-inexistent').then((r) => r.status));
  expect(status).toBe(501);
  expect(api.unhandled()).toEqual(['GET /api/v1/endpoint-inexistent']);
});

test('expectNoEmoji gaseste emoji in textul vizibil', async ({ page }) => {
  await page.setContent('<p>Gata \u{1F680} de start</p>');
  await expect(expectNoEmoji(page)).rejects.toThrow(/U\+1F680/);
  await page.setContent('<p>Găsește jobul. Trece de ATS.</p>');
  await expectNoEmoji(page);
});

test('expectNoHorizontalScroll gaseste continut mai lat decat ecranul', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.setContent('<div style="width:600px">lat</div>');
  await expect(expectNoHorizontalScroll(page)).rejects.toThrow(/Scroll orizontal/);
  await page.setContent('<div style="max-width:100%">ok</div>');
  await expectNoHorizontalScroll(page);
});

test('expectContentVisible gaseste continut ascuns cu reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent('<section><div style="opacity:0"><h2>Ascuns</h2></div><p>Vizibil</p></section>');
  await expect(expectContentVisible(page.locator('section'))).rejects.toThrow(/Ascuns/);
  await page.setContent('<section><h2>Vizibil</h2></section>');
  await expectContentVisible(page.locator('section'));
});
