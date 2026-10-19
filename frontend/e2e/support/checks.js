import { expect } from '@playwright/test';

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

/** Textul vizibil al paginii (sau al unui locator) nu contine niciun emoji. */
export async function expectNoEmoji(target) {
  const root = typeof target.goto === 'function' ? target.locator('body') : target;
  const text = await root.innerText();
  const found = [];
  for (const m of text.matchAll(EMOJI_RE)) {
    const context = text.slice(Math.max(0, m.index - 20), m.index + 20).replace(/\s+/g, ' ');
    found.push(`${m[0]} (U+${m[0].codePointAt(0).toString(16).toUpperCase()}) in "${context}"`);
  }
  expect(found, `Emoji in textul vizibil:\n${found.join('\n')}`).toEqual([]);
}

/** Pagina nu are scroll orizontal la latimea curenta a viewport-ului. */
export async function expectNoHorizontalScroll(page) {
  const { scrollWidth, clientWidth, culprits } = await page.evaluate(() => {
    const doc = document.documentElement;
    const width = doc.clientWidth;
    const culprits = [...document.body.querySelectorAll('*')]
      .filter((el) => el.getBoundingClientRect().right > width + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} (right=${Math.round(el.getBoundingClientRect().right)})`);
    return { scrollWidth: doc.scrollWidth, clientWidth: width, culprits };
  });
  expect(scrollWidth, `Scroll orizontal: ${scrollWidth}px > ${clientWidth}px. Elemente: ${culprits.join(', ')}`)
    .toBeLessThanOrEqual(clientWidth);
}

/**
 * Tot textul din `locator` e complet vizibil: opacitatea efectiva (produsul
 * opacitatilor pana la radacina) e 1 si nu e ascuns cu visibility. Se foloseste
 * cu `prefers-reduced-motion` emulat, cand nicio animatie nu trebuie sa ascunda continut.
 */
export async function expectContentVisible(locator) {
  const hidden = await locator.evaluateAll((roots) => {
    const results = [];
    for (const root of roots) {
      const elements = [root, ...root.querySelectorAll('*')];
      for (const el of elements) {
        const hasText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (!hasText || el.getClientRects().length === 0) continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        let opacity = 1;
        for (let node = el; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentElement) {
          opacity *= parseFloat(getComputedStyle(node).opacity);
        }
        const visibility = getComputedStyle(el).visibility;
        if (opacity < 0.99 || visibility === 'hidden') {
          results.push(`"${el.textContent.trim().slice(0, 40)}" opacity=${opacity.toFixed(2)} visibility=${visibility}`);
        }
      }
    }
    return results;
  });
  expect(hidden, `Continut ascuns:\n${hidden.join('\n')}`).toEqual([]);
}
