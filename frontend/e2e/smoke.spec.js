import { readFileSync } from 'node:fs';
import { test, expect } from './support/test.js';

// Ruta fiecarui tab din TAB_METADATA (App.jsx).
const TAB_PATHS = {
  landing: '/',
  tracker: '/tracker',
  job_search: '/job-search',
  market_insights: '/market-insights',
  cv_library: '/cv-library',
  cv_studio: '/cv-studio',
  cover_letter: '/cover-letter',
  github_readme: '/github-readme',
  linkedin_optimizer: '/linkedin-optimizer',
  skill_roadmap: '/roadmap',
  feedback: '/feedback',
};

test('fiecare tab din TAB_METADATA are un test de fum', () => {
  const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const block = source.match(/const TAB_METADATA = \{([\s\S]*?)\n\};/)[1];
  const keys = [...block.matchAll(/^ {2}(\w+): \{/gm)].map((m) => m[1]);
  expect(keys.sort()).toEqual(Object.keys(TAB_PATHS).sort());
});

for (const [tab, path] of Object.entries(TAB_PATHS)) {
  test(`tab-ul ${tab} se randeaza fara erori`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).not.toBeEmpty();
  });
}
