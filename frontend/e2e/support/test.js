import { test as base, expect } from '@playwright/test';
import { installMockApi, fixture } from './mockApi.js';

/**
 * `test` cu backend simulat si verificarea consolei, pornite automat in fiecare test:
 * - orice cerere `/api` fara fixture face testul sa esueze;
 * - orice eroare in consola sau exceptie necapturata face testul sa esueze.
 */
export const test = base.extend({
  consoleErrors: [
    async ({ page }, use) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await use(errors);
      expect(errors, `Erori in consola:\n${errors.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],

  api: [
    async ({ page, consoleErrors }, use) => {
      const api = await installMockApi(page);
      await use(api);
      const unhandled = api.unhandled();
      expect(unhandled, `Cereri /api fara fixture (adauga-le in e2e/support/mockApi.js):\n${unhandled.join('\n')}`)
        .toEqual([]);
    },
    { auto: true },
  ],
});

/** Porneste pagina ca utilizator autentificat (utilizatorul demo din fixture). */
export async function loginAsDemoUser(page) {
  const user = fixture('user');
  await page.addInitScript((u) => {
    localStorage.setItem('ats_jwt_token', u.token);
    localStorage.setItem('ats_user', JSON.stringify({ id: u.userId, userId: u.userId, email: u.email, fullName: u.fullName }));
  }, user);
}

export { expect };
