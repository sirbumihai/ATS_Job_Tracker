import { readFileSync } from 'node:fs';
import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/linkedin-optimizer';
const TEMPLATES = [['Gradient', 'gradient'], ['Grilă', 'grid'], ['Minimal', 'minimal']];

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByTestId('banner-preview')).toBeVisible();
  await expect(page.getByTestId('score-ring')).toBeVisible();
}

/** Dimensiunile din antetul IHDR al unui PNG (octetii 16-23). */
function pngSize(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex');
  expect(signature).toBe('89504e470d0a1a0a');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function downloadBanner(page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descarcă PNG' }).click(),
  ]);
  return { download, buffer: readFileSync(await download.path()) };
}

test('pagina se randeaza fara emoji', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page);
});

test.describe('carduri simple', () => {
  test('nicio sectiune nu e un card in alt card', async ({ page }) => {
    await openPage(page);
    await expect(page.locator('[data-card]').first()).toBeVisible();
    const nested = await page.locator('[data-card] [data-card]').count();
    expect(nested).toBe(0);
  });
});

test.describe('coloana de scor', () => {
  test('inelul si cele 6 bare arata valorile din rezultatul optimizarii', async ({ page }) => {
    await openPage(page);
    const result = fixture('linkedin-optimization');

    await expect(page.getByTestId('score-ring')).toHaveAccessibleName(new RegExp(`${result.overallScore} din 100`));

    const entries = Object.entries(result.scoreBreakdown);
    expect(entries).toHaveLength(6);
    for (const [label, value] of entries) {
      const bar = page.getByRole('progressbar', { name: label, exact: true });
      await expect(bar).toHaveAttribute('aria-valuenow', String(value));
    }
    await expect(page.getByRole('progressbar')).toHaveCount(6);
  });
});

test.describe('planul de actiune', () => {
  test('detaliile unui pas sunt ascunse pana la click', async ({ page }) => {
    await openPage(page);
    const step = fixture('linkedin-optimization').actionPlan[0];

    await expect(page.getByText(step.instructions)).toBeHidden();
    await expect(page.getByText(step.exampleSnippet, { exact: true })).toBeHidden();

    await page.getByRole('button', { name: new RegExp(step.title) }).click();
    await expect(page.getByText(step.instructions)).toBeVisible();
    await expect(page.getByText(step.exampleSnippet, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: new RegExp(step.title) }).click();
    await expect(page.getByText(step.instructions)).toBeHidden();
  });

  test('bifarea unui pas creste progresul si ramane salvata', async ({ page }) => {
    await openPage(page);
    const plan = fixture('linkedin-optimization').actionPlan;
    const progress = page.getByTestId('plan-progress');

    await expect(progress).toHaveText(`0 / ${plan.length}`);
    await page.getByRole('checkbox', { name: new RegExp(plan[0].title) }).click();
    await expect(progress).toHaveText(`1 / ${plan.length}`);
    await page.getByRole('checkbox', { name: new RegExp(plan[1].title) }).click();
    await expect(progress).toHaveText(`2 / ${plan.length}`);
    await page.getByRole('checkbox', { name: new RegExp(plan[1].title) }).click();
    await expect(progress).toHaveText(`1 / ${plan.length}`);

    await page.reload();
    await expect(page.getByTestId('plan-progress')).toHaveText(`1 / ${plan.length}`);
  });

  test('butonul de copiere pune textul pasului in clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openPage(page);
    const step = fixture('linkedin-optimization').actionPlan[0];

    await page.getByRole('button', { name: new RegExp(step.title) }).click();
    await page.getByRole('button', { name: 'Copiază' }).click();
    await expect(page.getByRole('button', { name: 'Copiat' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(step.exampleSnippet);
  });

  test('un titlu lung e scurtat la 6 cuvinte in lista', async ({ page, api }) => {
    const result = fixture('linkedin-optimization');
    const longTitle = 'Rescrie complet headline-ul profilului cu rolul tinta si stack-ul tehnic principal';
    api.on('POST', /^\/api\/v1\/linkedin\/optimize$/, () => ({
      ...result,
      actionPlan: [{ ...result.actionPlan[0], title: longTitle }],
    }));
    await openPage(page);
    const row = page.getByRole('button', { name: /Rescrie complet/ });
    expect((await row.innerText()).replace('…', '').trim().split(/\s+/).length).toBeLessThanOrEqual(6);
    await row.click();
    await expect(page.getByText(longTitle)).toBeVisible();
  });
});

test.describe('generator de banner', () => {
  test('selectorul schimba bannerul din previzualizare intre cele 3 sabloane', async ({ page }) => {
    await openPage(page);
    const preview = page.getByTestId('banner-preview');
    const seen = new Set();
    for (const [name, id] of TEMPLATES) {
      await page.getByRole('radio', { name }).click();
      await expect(page.getByRole('radio', { name })).toBeChecked();
      await expect(preview).toHaveAttribute('data-template', id);
      seen.add(await preview.evaluate((canvas) => canvas.toDataURL()));
    }
    expect(seen.size).toBe(3);
  });

  test('textul vine din headline-ul si stack-ul profilului', async ({ page }) => {
    await openPage(page);
    const profile = fixture('linkedin-profile');
    const preview = page.getByTestId('banner-preview');

    await expect(preview).toHaveAccessibleName(new RegExp(profile.headline.replace(/[|]/g, '\\|')));
    await expect(preview).toHaveAccessibleName(new RegExp(profile.skills[0]));

    const before = await preview.evaluate((canvas) => canvas.toDataURL());
    await page.getByRole('button', { name: 'Editează headline-ul' }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Headline').fill('Inginer software | Go | Kubernetes');
    await dialog.getByRole('button', { name: 'Salvează' }).click();

    await expect(preview).toHaveAccessibleName(/Inginer software \| Go \| Kubernetes/);
    expect(await preview.evaluate((canvas) => canvas.toDataURL())).not.toBe(before);
  });

  for (const [name] of TEMPLATES) {
    test(`descarcarea sablonului ${name} produce un PNG de 1584x396`, async ({ page }) => {
      await openPage(page);
      await page.getByRole('radio', { name }).click();
      const { download, buffer } = await downloadBanner(page);
      expect(download.suggestedFilename()).toMatch(/\.png$/);
      expect(pngSize(buffer)).toEqual({ width: 1584, height: 396 });
    });
  }

  test('un headline foarte lung nu iese din banner', async ({ page, api }) => {
    const profile = fixture('linkedin-profile');
    const longHeadline = `Junior Software Engineer ${'Java Spring Boot PostgreSQL Docker Kubernetes '.repeat(12)}`.trim();
    api.on('GET', /^\/api\/v1\/linkedin\/(all-star|demo)-profile$/, () => ({ ...profile, headline: longHeadline }));
    await openPage(page);

    const { buffer } = await downloadBanner(page);
    expect(pngSize(buffer)).toEqual({ width: 1584, height: 396 });

    const overflow = await page.evaluate(async (text) => {
      const { layoutHeadline, BANNER_SIZE, BANNER_PADDING } = await import('/src/components/linkedin/bannerCanvas.js');
      const ctx = document.createElement('canvas').getContext('2d');
      const maxWidth = BANNER_SIZE.width - BANNER_PADDING * 2;
      const { lines, font } = layoutHeadline(ctx, text, maxWidth);
      ctx.font = font;
      return { widths: lines.map((l) => ctx.measureText(l).width), maxWidth, count: lines.length };
    }, longHeadline);
    expect(overflow.count).toBeLessThanOrEqual(3);
    for (const width of overflow.widths) expect(width).toBeLessThanOrEqual(overflow.maxWidth);
  });
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('fara scroll orizontal si fara emoji', async ({ page }) => {
    await openPage(page);
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalScroll(page);
    await expectNoEmoji(page);
  });
});

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tot continutul e vizibil', async ({ page }) => {
    await openPage(page);
    await expectContentVisible(page.locator('main'));
  });
});
