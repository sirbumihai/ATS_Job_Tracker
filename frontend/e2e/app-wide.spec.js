import { readFileSync } from 'node:fs';
import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';

// Verificari comune pentru landing si TOATE tab-urile din TAB_METADATA (App.jsx).
// Lista se citeste din sursa, ca un tab nou sa fie acoperit automat; ruta fiecaruia
// vine din handleTabChange, la fel ca in smoke.spec.js.
const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const tabKeys = [...source.match(/const TAB_METADATA = \{([\s\S]*?)\n\};/)[1].matchAll(/^ {2}(\w+): \{/gm)].map((m) => m[1]);
const PATHS = Object.fromEntries(
  [...source.matchAll(/(?:if|else if) \(tab === '(\w+)'\) targetPath = '([^']+)'/g)].map((m) => [m[1], m[2]])
);

test('fiecare tab din TAB_METADATA are o ruta cunoscuta', () => {
  expect(tabKeys.length).toBeGreaterThan(0);
  for (const key of tabKeys) expect(PATHS[key], `Tab fara ruta in handleTabChange: ${key}`).toBeTruthy();
});

async function openTab(page, path) {
  await loginAsDemoUser(page);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('main, [data-testid="landing"]').first()).toBeVisible();
  await page.waitForTimeout(400);
}

// Landing-ul are animatii la scroll: se deruleaza pana jos ca toate sectiunile sa fie randate/vizibile.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}

for (const key of tabKeys) {
  test.describe(key, () => {
    test('nu are emoji in textul vizibil', async ({ page }) => {
      await openTab(page, PATHS[key]);
      await scrollThrough(page);
      await expectNoEmoji(page);
    });

    test.describe('la 375px', () => {
      test.use({ viewport: { width: 375, height: 812 } });
      test('nu are scroll orizontal', async ({ page }) => {
        await openTab(page, PATHS[key]);
        await scrollThrough(page);
        await expectNoHorizontalScroll(page);
      });
    });

    test.describe('cu reduced-motion', () => {
      test.use({ reducedMotion: 'reduce' });
      test('continutul e vizibil', async ({ page }) => {
        await openTab(page, PATHS[key]);
        await expectContentVisible(page.locator('main, [data-testid="landing"]').first());
      });
    });
  });
}
