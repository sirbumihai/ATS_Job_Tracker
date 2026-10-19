import { test, expect } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { ALL_TECH_ANKI_CARDS } from '../src/data/decks/index.js';

// Platformele cu scraper in backend (crawler/*Scraper.java).
const JOB_PLATFORMS = 9;

test('landing-ul are exact 7 sectiuni de nivel superior, in ordine', async ({ page }) => {
  await page.goto('/');
  const sections = page.getByTestId('landing').locator(':scope > section, :scope > footer');
  await expect(sections).toHaveCount(7);
  const labels = await page.getByTestId('landing').locator(':scope > section').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  expect(labels).toEqual(['Prezentare', 'Cifre', 'Funcționalități', 'Metodologie', 'Întrebări frecvente', 'Începe']);
  expect(await sections.last().evaluate((el) => el.tagName)).toBe('FOOTER');
});

test('hero-ul are titlul nou si un singur rand de explicatie', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Prezentare' });
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Găsește jobul. Trece de ATS. Ia oferta.');
  await expect(hero.locator('p')).toHaveCount(1);
});

test('banda de cifre arata datele reale dupa count-up', async ({ page }) => {
  await page.goto('/');
  const stats = page.getByRole('region', { name: 'Cifre' });
  await stats.scrollIntoViewIfNeeded();
  await expect(stats.locator('dd')).toHaveText([String(JOB_PLATFORMS), String(ALL_TECH_ANKI_CARDS.length), 'Scor ATS']);
  await expect(stats.locator('dt').nth(2)).toHaveText('pe fiecare job, pentru CV-ul tău');
  for (const invented of ['94.2%', '3.4x', '500+', '100%']) {
    await expect(page.getByTestId('landing')).not.toContainText(invented);
  }
});

const CTAS = [
  ['Prezentare', 'Începe gratuit', '/tracker'],
  ['Prezentare', 'Pregătire interviuri', '/roadmap'],
  ['Funcționalități', 'Deschide Tracker', '/tracker'],
  ['Funcționalități', 'Deschide CV-urile', '/cv-library'],
  ['Funcționalități', 'Exersează întrebări', '/roadmap'],
  ['Funcționalități', 'Deschide LinkedIn Optimizer', '/linkedin-optimizer'],
  ['Începe', 'Deschide JobFlow AI', '/tracker'],
];

for (const [section, name, path] of CTAS) {
  test(`CTA "${name}" duce la ${path}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('region', { name: section }).getByRole('button', { name }).click();
    await expect(page).toHaveURL(path);
  });
}

test('bara de sus deschide autentificarea, aplicatia si feedback-ul', async ({ page }) => {
  await page.goto('/');
  const bar = page.getByTestId('landing').locator('header');
  await bar.getByRole('button', { name: 'Conectare' }).click();
  await expect(page.getByRole('dialog', { name: 'Autentificare' })).toBeVisible();
  await page.keyboard.press('Escape');

  await bar.getByRole('button', { name: 'Deschide aplicația' }).click();
  await expect(page).toHaveURL('/tracker');

  await page.goto('/');
  await page.getByTestId('landing').locator('header').getByRole('button', { name: 'Feedback' }).click();
  await expect(page).toHaveURL('/feedback');
});

test('landing-ul nu are emoji in textul vizibil', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Cum funcționează scorul ATS/ }).click();
  await expectNoEmoji(page);
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('landing-ul nu are scroll orizontal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalScroll(page);
  });
});

test.describe('cu prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tot continutul landing-ului e vizibil, iar cifrele sunt finale', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expectContentVisible(page.getByTestId('landing'));
    await expect(page.getByRole('region', { name: 'Cifre' }).locator('dd').nth(1)).toHaveText(String(ALL_TECH_ANKI_CARDS.length));
  });
});
