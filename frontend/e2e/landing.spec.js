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

const FEATURE_TITLES = ['Tracker', 'Optimizare CV', 'Pregătire interviu', 'Brand personal'];

test('functionalitatile sunt 4 celule, fiecare cu titlu, text si fragment', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Funcționalități' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(FEATURE_TITLES);
  await expect(section.getByTestId('feature-fragment')).toHaveCount(4);
  for (const fragment of await section.getByTestId('feature-fragment').all()) {
    await fragment.scrollIntoViewIfNeeded();
    await expect(fragment).toBeVisible();
  }
});

test('hero-ul nu are animatii in bucla: cardurile stau pe loc fara scroll', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId('hero-card').first();
  await page.waitForTimeout(2500); // dupa desfacerea in evantai
  const before = await card.boundingBox();
  await page.waitForTimeout(1500);
  const after = await card.boundingBox();
  expect(after).toEqual(before);
});

test('cardurile din hero se misca odata cu scroll-ul', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto('/');
  await page.waitForTimeout(2500);
  const gap = async () => {
    const card = await page.getByTestId('hero-card').first().boundingBox();
    const shot = await page.getByTestId('hero-screenshot').boundingBox();
    return card.y - shot.y;
  };
  const before = await gap();
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(1500);
  expect(Math.abs((await gap()) - before)).toBeGreaterThan(5);
});

test('Lenis e activ pe landing si dispare dupa navigarea in alt tab', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);
  await page.getByTestId('landing').locator('header').getByRole('button', { name: 'Deschide aplicația' }).click();
  await expect(page).toHaveURL('/tracker');
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
});

test('ancora din meniu deruleaza la sectiunea Metodologie', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('landing').locator('header').getByRole('link', { name: 'Metodologie' }).click();
  await expect.poll(() => page.evaluate(() => document.getElementById('metodologie').getBoundingClientRect().top), { timeout: 5000 })
    .toBeCloseTo(64, -1);
});

test('FAQ-ul se deschide si se inchide', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /Cum funcționează scorul ATS/ });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await expect(page.getByText('Extragem competențele și cuvintele-cheie')).toBeVisible();
  await button.click();
  await expect(page.getByText('Extragem competențele și cuvintele-cheie')).toHaveCount(0);
});

test.describe('la 375px (hero si celule)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hero-ul are cel mult 2 carduri vizibile', async ({ page }) => {
    await page.goto('/');
    const cards = page.getByTestId('hero-card');
    let visible = 0;
    for (const card of await cards.all()) if (await card.isVisible()) visible += 1;
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThanOrEqual(2);
  });

  test('celulele de functionalitati nu au emoji si nu produc scroll orizontal', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Funcționalități' });
    await section.scrollIntoViewIfNeeded();
    await expectNoEmoji(section);
    await expectNoHorizontalScroll(page);
  });
});

test.describe('cu prefers-reduced-motion (hero, Lenis)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('fara Lenis, cu cardurile din hero statice si vizibile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
    const cards = page.getByTestId('hero-card');
    await expectContentVisible(cards);
    const before = await cards.first().boundingBox();
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(600);
    expect((await cards.first().boundingBox()).y + 200).toBeCloseTo(before.y, -1);
  });
});
