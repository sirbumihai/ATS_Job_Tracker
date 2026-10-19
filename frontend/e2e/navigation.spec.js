import { test, expect } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll } from './support/checks.js';

// Ordinea si destinatiile tab-urilor din meniu, neschimbate de redesign.
const NAV_ITEMS = [
  ['Tracker aplicații', '/tracker'],
  ['Căutare joburi', '/job-search'],
  ['Market Insights', '/market-insights'],
  ['CV-urile mele', '/cv-library'],
  ['Studio CV', '/cv-studio'],
  ['Cover Letter', '/cover-letter'],
  ['GitHub README', '/github-readme'],
  ['LinkedIn Optimizer', '/linkedin-optimizer'],
  ['Skill Roadmap', '/roadmap'],
  ['Feedback', '/feedback'],
];

test('meniul lateral are tab-urile in aceeasi ordine, cu aceleasi destinatii, fara emoji', async ({ page }) => {
  await page.goto('/tracker');
  const nav = page.getByRole('navigation', { name: 'Meniu principal' });
  await expect(nav.getByRole('button')).toHaveText(NAV_ITEMS.map(([label]) => label));
  await expectNoEmoji(page.locator('aside'));

  for (const [label, path] of NAV_ITEMS) {
    await page.goto('/tracker');
    await nav.getByRole('button', { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
  }
});

test('meniul lateral restrans pastreaza aceleasi destinatii', async ({ page }) => {
  await page.goto('/tracker');
  await page.getByRole('button', { name: 'Restrânge meniul' }).click();
  const nav = page.getByRole('navigation', { name: 'Meniu principal' });
  await expect(nav.getByRole('button')).toHaveCount(NAV_ITEMS.length);
  await nav.getByRole('button', { name: 'Market Insights' }).click();
  await expect(page).toHaveURL('/market-insights');
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('meniul mobil nu are emoji, nici scroll orizontal, si navigheaza', async ({ page }) => {
    await page.goto('/tracker');
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalScroll(page);

    await page.getByRole('button', { name: 'Deschide meniul' }).click();
    const nav = page.getByRole('navigation', { name: 'Meniu mobil' });
    await expect(nav.getByRole('button')).toHaveText(NAV_ITEMS.map(([label]) => label));
    await expectNoEmoji(page);
    await expectNoHorizontalScroll(page);

    await nav.getByRole('button', { name: 'Căutare joburi' }).click();
    await expect(page).toHaveURL('/job-search');
    await expect(nav).toBeHidden();
  });
});
