import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FIXTURES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures');

export function fixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, `${name}.json`), 'utf8'));
}

// Raspunsurile implicite pentru fiecare endpoint `/api` folosit de frontend.
// `body` e un nume de fixture din e2e/fixtures sau o functie (request) => body.
const DEFAULT_ROUTES = [
  ['POST', /^\/api\/v1\/auth\/(login|register)$/, 'user'],

  ['GET', /^\/api\/v1\/applications$/, 'applications'],
  ['POST', /^\/api\/v1\/applications$/, () => ({
    ...fixture('applications')[2],
    id: 'a9999999-9999-4999-8999-999999999999',
    companyName: 'Firma Test',
    jobTitle: 'QA Engineer',
  })],
  ['PATCH', /^\/api\/v1\/applications\/[^/]+\/status$/, () => fixture('applications')[0]],
  ['DELETE', /^\/api\/v1\/applications\/[^/]+$/, () => ({})],

  ['POST', /^\/api\/v1\/jobs$/, () => ({ id: 'b9999999-9999-4999-8999-999999999999' })],
  ['POST', /^\/api\/v1\/jobs\/save-to-kanban$/, () => ({})],
  ['GET', /^\/api\/v1\/jobs\/search$/, 'jobs-search'],
  ['GET', /^\/api\/v1\/jobs\/stats$/, 'jobs-stats'],
  ['GET', /^\/api\/v1\/jobs\/[^/]+\/changes$/, () => []],
  ['GET', /^\/api\/v1\/jobs\/[^/]+\/details$/, 'job-details'],
  ['POST', /^\/api\/v1\/ai\/match-job$/, 'ai-match'],

  ['GET', /^\/api\/v1\/cv\/list$/, 'cv-profiles'],
  ['POST', /^\/api\/v1\/cv$/, (request) => ({
    ...fixture('cv-profiles')[0],
    id: 'c9999999-9999-4999-8999-999999999999',
    title: request.postDataJSON().title,
    isPrimary: false,
  })],
  ['POST', /^\/api\/v1\/cv\/[^/]+\/duplicate$/, () => ({ ...fixture('cv-profiles')[0], id: 'c8888888-8888-4888-8888-888888888888', title: 'CV Backend Java (copie)', isPrimary: false })],
  ['PATCH', /^\/api\/v1\/cv\/[^/]+\/primary$/, () => ({})],
  ['DELETE', /^\/api\/v1\/cv\/[^/]+$/, () => ({})],
  ['GET', /^\/api\/v1\/cv$/, () => fixture('cv-profiles')[0]],
  ['GET', /^\/api\/v1\/cv\/[^/]+$/, () => fixture('cv-profiles')[0]],
  ['PUT', /^\/api\/v1\/cv\/[^/]+$/, () => fixture('cv-profiles')[0]],

  ['GET', /^\/api\/v1\/resumes\/user$/, 'resumes'],
  ['POST', /^\/api\/v1\/resumes$/, () => fixture('resumes')[0]],

  ['GET', /^\/api\/v1\/market-insights$/, 'market-insights'],
  ['GET', /^\/api\/v1\/ai\/polish-diagnosis$/, 'polish-diagnosis'],

  ['GET', /^\/api\/v1\/linkedin\/(all-star|demo)-profile$/, 'linkedin-profile'],
  ['POST', /^\/api\/v1\/linkedin\/optimize$/, 'linkedin-optimization'],

  ['POST', /^\/api\/v1\/ai\/cover-letter$/, 'cover-letter'],
  ['POST', /^\/api\/v1\/github-readme$/, 'github-readme'],

  ['GET', /^\/api\/v1\/feedback\/ideas$/, 'feedback-ideas'],
  ['POST', /^\/api\/v1\/feedback$/, () => ({ id: 'f1111111-1111-4111-8111-111111111111' })],
  ['POST', /^\/api\/v1\/feedback\/ideas$/, (request) => ({
    ...fixture('feedback-ideas')[0],
    id: 'e9999999-9999-4999-8999-999999999999',
    title: request.postDataJSON().title,
    votesCount: 0,
  })],
  ['POST', /^\/api\/v1\/feedback\/ideas\/[^/]+\/vote$/, () => ({ hasVoted: true, votesCount: 5 })],
];

/**
 * Intercepteaza toate cererile `/api` ale paginii si raspunde din fixture-uri.
 * O cerere fara raspuns definit primeste 501 si e raportata de `unhandled()`,
 * ca testul sa esueze cu un mesaj clar, nu sa treaca in tacere.
 * Cererile catre alte host-uri (Google Fonts etc.) primesc un raspuns gol,
 * ca testele sa nu depinda de retea.
 */
export async function installMockApi(page) {
  const routes = DEFAULT_ROUTES.map(([method, pattern, body]) => ({ method, pattern, body }));
  const unhandled = [];

  await page.route(
    (url) => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
    (route) => route.fulfill({ status: 200, body: '' })
  );

  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const match = routes.find((r) => r.method === request.method() && r.pattern.test(pathname));
      if (!match) {
        unhandled.push(`${request.method()} ${pathname}`);
        await route.fulfill({ status: 501, json: { message: `Fara fixture pentru ${request.method()} ${pathname}` } });
        return;
      }
      const body = typeof match.body === 'function' ? match.body(request) : fixture(match.body);
      await route.fulfill({ status: 200, json: body });
    }
  );

  return {
    /** Inlocuieste sau adauga raspunsul unui endpoint pentru testul curent. */
    on(method, pattern, body) {
      routes.unshift({ method, pattern, body });
    },
    unhandled() {
      return [...unhandled];
    },
  };
}
