import { test, expect, Page, ConsoleMessage, Request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive SpiceGarden Frontend Audit
 * ----------------------------------------
 * Audits 4 frontend apps that are ALREADY running in dev mode:
 *   - customer-web         http://localhost:3002  (Next.js pages router, SSR)
 *   - restaurant-dashboard http://localhost:3003  (Next.js pages router, SSR)
 *   - super-admin          http://localhost:3004  (Next.js pages router, SSR)
 *   - delivery-partner     http://localhost:3005  (Expo / react-native-web SPA)
 *
 * Backend API: http://localhost:3001
 *
 * For each route we verify: HTTP 200, non-blank body, no hydration/React/JS
 * errors, no console errors/warnings (dev noise filtered), no failed network
 * requests (assets/fonts/images/API/CORS), layout present, and responsive
 * rendering at 375 / 768 / 1440 px.
 */

const API_ORIGIN = 'http://localhost:3001';

const SCREENSHOT_DIR = path.join(__dirname, 'audit-screenshots');
const REPORT_PATH = path.join(__dirname, 'audit-report.json');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// App + route definitions (discovered from src/pages of each app)
// ---------------------------------------------------------------------------
interface AppDef {
  name: string;
  baseURL: string;
  spa?: boolean; // client-side-only routing (Expo)
  routes: string[];
}

const APPS: AppDef[] = [
  {
    name: 'customer-web',
    baseURL: 'http://localhost:3002',
    routes: [
      '/',
      '/menu',
      '/search',
      '/offers',
      '/cart',
      '/checkout',
      '/restaurant',
      '/auth',
      '/auth/callback',
      '/reset-password',
      '/mfa-setup',
      '/MfaDisable',
      '/profile',
      '/addresses',
      '/payment-methods',
      '/wallet',
      '/subscriptions',
      '/history',
      '/order-details',
      '/tracking',
      '/notifications',
      '/legal/privacy',
      '/legal/terms',
    ],
  },
  {
    name: 'restaurant-dashboard',
    baseURL: 'http://localhost:3003',
    routes: [
      '/',
      '/login',
      '/onboarding',
      '/onboarding/business',
      '/onboarding/documents',
      '/onboarding/gst',
      '/onboarding/menu',
      '/onboarding/payout',
      '/onboarding/pricing',
      '/gst-reports',
      '/payouts',
      '/subscription',
    ],
  },
  {
    name: 'super-admin',
    baseURL: 'http://localhost:3004',
    routes: [
      '/',
      '/login',
      '/tenants',
      '/campaigns',
      '/loyalty',
      '/loyalty/coupons',
      '/loyalty/referrals',
      '/analytics',
      '/analytics/customers',
      '/analytics/top-dishes',
      '/driver-fleet/overview',
      '/driver-fleet/earnings',
      '/driver-fleet/incentives',
      '/driver-fleet/penalties',
      '/driver-fleet/shifts',
    ],
  },
  {
    name: 'delivery-partner',
    baseURL: 'http://localhost:3005',
    spa: true,
    routes: [
      '/', // Expo SPA – navigation is client-side; only root is a real URL
    ],
  },
];

const VIEWPORTS = [
  { label: 'mobile-375', width: 375, height: 812 },
  { label: 'tablet-768', width: 768, height: 1024 },
  { label: 'desktop-1440', width: 1440, height: 900 },
];

// ---------------------------------------------------------------------------
// Dev-noise filters — warnings/errors that are EXPECTED in Next.js/Expo dev
// ---------------------------------------------------------------------------
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/i,
  /React DevTools/i,
  /\[Fast Refresh\]/i,
  /Fast Refresh/i,
  /webpack-hmr/i,
  /\[HMR\]/i,
  /hot-update/i,
  /Warning: Extra attributes from the server/i, // common benign dev SSR attr diff
  /Download the Apollo/i,
  /\[webpack\.cache/i,
  /source map/i,
  /Sourcemap/i,
  /DevTools failed to load source map/i,
  /Lighthouse/i,
  /\[vite\]/i,
  /running application in development mode/i, // expo dev notice
  /\[expo\]/i,
  /Unable to preventDefault inside passive event listener/i,
  /Manifest:/i,
  /favicon/i,
  /React Router Future Flag Warning/i,
];

// Console errors that indicate real problems we ALWAYS care about
const CRITICAL_CONSOLE_PATTERNS: RegExp[] = [
  /hydrat/i,
  /Minified React error/i,
  /Uncaught/i,
  /is not defined/i,
  /is not a function/i,
  /Cannot read propert/i,
  /Cannot read properties/i,
  /Maximum update depth/i,
  /Objects are not valid as a React child/i,
  /Each child in a list should have a unique/i,
  /Text content does not match/i,
  /did not match/i, // hydration mismatch
];

function isIgnoredConsole(text: string): boolean {
  return IGNORED_CONSOLE_PATTERNS.some((r) => r.test(text));
}

// ---------------------------------------------------------------------------
// Result collection
// ---------------------------------------------------------------------------
interface RouteResult {
  app: string;
  route: string;
  url: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT VERIFIED';
  httpStatus: number | null;
  finalUrl: string;
  redirected: boolean;
  requiresAuth: boolean;
  bodyHasContent: boolean;
  layoutPresent: boolean;
  hydrationError: boolean;
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
  networkFailures: string[];
  apiCalls: { url: string; status: number | string; ok: boolean }[];
  corsFailures: string[];
  responsive: { label: string; ok: boolean; note?: string }[];
  screenshots: string[];
  issues: string[];
  notes: string[];
}

const ALL_RESULTS: RouteResult[] = [];

function sanitize(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'root';
}

// ---------------------------------------------------------------------------
// Core audit routine for a single route
// ---------------------------------------------------------------------------
async function auditRoute(page: Page, app: AppDef, route: string): Promise<RouteResult> {
  const url = app.baseURL + route;
  const result: RouteResult = {
    app: app.name,
    route,
    url,
    status: 'NOT VERIFIED',
    httpStatus: null,
    finalUrl: url,
    redirected: false,
    requiresAuth: false,
    bodyHasContent: false,
    layoutPresent: false,
    hydrationError: false,
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    networkFailures: [],
    apiCalls: [],
    corsFailures: [],
    responsive: [],
    screenshots: [],
    issues: [],
    notes: [],
  };

  // ---- wire up listeners -------------------------------------------------
  const onConsole = (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    if (isIgnoredConsole(text)) return;
    if (type === 'error') {
      result.consoleErrors.push(text);
      if (CRITICAL_CONSOLE_PATTERNS.some((r) => r.test(text))) result.hydrationError = /hydrat|did not match|Text content does not match/i.test(text) ? true : result.hydrationError;
    } else if (type === 'warning') {
      result.consoleWarnings.push(text);
    }
  };

  const onPageError = (err: Error) => {
    result.pageErrors.push(err.message);
    if (/hydrat|did not match/i.test(err.message)) result.hydrationError = true;
  };

  const onRequestFailed = (req: Request) => {
    const failure = req.failure();
    const rurl = req.url();
    // Ignore expected aborts from dev HMR / cancelled prefetch
    if (/hot-update|_next\/webpack-hmr|__nextjs|hermes/i.test(rurl)) return;
    result.networkFailures.push(`${req.method()} ${rurl} :: ${failure?.errorText ?? 'failed'}`);
    if (failure && /CORS|cross-origin/i.test(failure.errorText)) {
      result.corsFailures.push(`${rurl} :: ${failure.errorText}`);
    }
  };

  const onResponse = async (resp: any) => {
    try {
      const rurl = resp.url();
      const st = resp.status();
      const rtype = resp.request().resourceType();
      // API calls to backend
      if (rurl.startsWith(API_ORIGIN)) {
        result.apiCalls.push({ url: rurl, status: st, ok: st < 400 });
      }
      // Failed assets / fonts / images / scripts / stylesheets
      if (st >= 400) {
        if (/hot-update|webpack-hmr|__nextjs_original-stack|favicon\.ico/i.test(rurl)) return;
        if (['image', 'font', 'stylesheet', 'script', 'fetch', 'xhr', 'media'].includes(rtype)) {
          result.networkFailures.push(`[${st}] ${rtype} ${rurl}`);
        }
      }
    } catch {
      /* ignore */
    }
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  try {
    // ---- navigate --------------------------------------------------------
    let nav;
    try {
      nav = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      // networkidle can time out on dev servers with long-poll HMR; fall back
      nav = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      result.notes.push('networkidle timed out; used domcontentloaded');
    }

    result.httpStatus = nav ? nav.status() : null;
    result.finalUrl = page.url();
    result.redirected = result.finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, '');

    // Give client hydration / SPA a moment
    await page.waitForTimeout(app.spa ? 4000 : 1500);
    result.finalUrl = page.url();
    result.redirected = result.finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, '');

    // ---- auth redirect detection ----------------------------------------
    const finalLower = result.finalUrl.toLowerCase();
    if (
      result.redirected &&
      /(\/login|\/auth|\/signin|\/sign-in|returnurl|redirect=)/.test(finalLower) &&
      !route.match(/login|auth/i)
    ) {
      result.requiresAuth = true;
      result.notes.push(`requires auth (redirected to ${result.finalUrl})`);
    }

    // ---- body content check ---------------------------------------------
    const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
    const bodyHtml = (await page.locator('body').innerHTML().catch(() => '')) || '';
    result.bodyHasContent = bodyText.trim().length > 0 || bodyHtml.trim().length > 40;
    if (!result.bodyHasContent) result.issues.push('White screen: body has no visible content');

    // ---- layout element check -------------------------------------------
    const layoutCount = await page
      .locator('header, nav, main, footer, [role="main"], [role="navigation"], #root > *, #__next > *')
      .count()
      .catch(() => 0);
    result.layoutPresent = layoutCount > 0;
    if (!result.layoutPresent && result.bodyHasContent) {
      result.notes.push('No standard layout landmarks (header/nav/main/footer) found');
    }

    // ---- responsive checks ----------------------------------------------
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(400);
      // check for horizontal overflow (common responsive bug)
      const overflow = await page
        .evaluate(() => {
          const de = document.documentElement;
          return {
            scrollW: de.scrollWidth,
            clientW: de.clientWidth,
          };
        })
        .catch(() => ({ scrollW: 0, clientW: 1 }));
      const hasContent = await page
        .locator('body')
        .evaluate((el) => (el.innerText || '').trim().length > 0 || el.innerHTML.trim().length > 40)
        .catch(() => false);
      const overflowPx = overflow.scrollW - overflow.clientW;
      const ok = hasContent;
      const note =
        overflowPx > 20 ? `horizontal overflow ~${overflowPx}px` : hasContent ? undefined : 'no content';
      result.responsive.push({ label: vp.label, ok, note });

      // screenshot each viewport
      const shot = path.join(
        SCREENSHOT_DIR,
        `${app.name}__${sanitize(route)}__${vp.label}.png`,
      );
      await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
      result.screenshots.push(path.relative(__dirname, shot));
    }

    // ---- classification --------------------------------------------------
    classify(result);
  } catch (err: any) {
    result.status = 'FAIL';
    result.issues.push(`Navigation/exception: ${err?.message ?? String(err)}`);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }

  return result;
}

function classify(r: RouteResult) {
  const httpOk = r.httpStatus !== null && r.httpStatus >= 200 && r.httpStatus < 400;
  const failedApi = r.apiCalls.filter((a) => !a.ok);

  // Hard failures
  if (r.pageErrors.length > 0) r.issues.push(`${r.pageErrors.length} uncaught JS exception(s): ${r.pageErrors.slice(0, 3).join(' | ')}`);
  if (r.hydrationError) r.issues.push('Hydration/React runtime error detected');
  if (r.consoleErrors.length > 0) r.issues.push(`${r.consoleErrors.length} console error(s)`);
  if (r.networkFailures.length > 0) r.issues.push(`${r.networkFailures.length} network failure(s)`);
  if (r.corsFailures.length > 0) r.issues.push(`${r.corsFailures.length} CORS failure(s)`);
  if (failedApi.length > 0) r.issues.push(`${failedApi.length} failed API call(s)`);
  if (!r.bodyHasContent) r.issues.push('White screen');
  if (r.consoleWarnings.length > 0) r.notes.push(`${r.consoleWarnings.length} non-dev console warning(s)`);

  if (r.requiresAuth) {
    // Auth redirect is expected behaviour
    const criticalDuringAuth = r.pageErrors.length > 0 || r.hydrationError || r.consoleErrors.length > 0;
    r.status = criticalDuringAuth ? 'FAIL' : 'PARTIAL';
    r.notes.unshift('requires auth');
    return;
  }

  if (!httpOk && r.httpStatus !== null) {
    r.status = 'FAIL';
    r.issues.unshift(`HTTP ${r.httpStatus}`);
    return;
  }

  const hardFail =
    r.pageErrors.length > 0 ||
    r.hydrationError ||
    !r.bodyHasContent ||
    r.consoleErrors.length > 0 ||
    r.corsFailures.length > 0 ||
    failedApi.length > 0 ||
    r.networkFailures.length > 0;

  if (hardFail) {
    r.status = 'FAIL';
    return;
  }

  const softIssues = r.consoleWarnings.length > 0 || r.responsive.some((v) => !v.ok || v.note);
  r.status = softIssues ? 'PARTIAL' : 'PASS';
}

// ---------------------------------------------------------------------------
// Test generation — one test per app/route
// ---------------------------------------------------------------------------
for (const app of APPS) {
  test.describe(`AUDIT: ${app.name}`, () => {
    for (const route of app.routes) {
      test(`${app.name} ${route}`, async ({ page }) => {
        const res = await auditRoute(page, app, route);
        ALL_RESULTS.push(res);

        // Log a compact per-route summary to the console
        console.log(
          `\n[${res.status}] ${res.app} ${res.route} -> HTTP ${res.httpStatus}` +
            `${res.requiresAuth ? ' (requires auth)' : ''}` +
            `\n   body=${res.bodyHasContent} layout=${res.layoutPresent} hydration=${res.hydrationError}` +
            ` consoleErr=${res.consoleErrors.length} consoleWarn=${res.consoleWarnings.length}` +
            ` netFail=${res.networkFailures.length} apiFail=${res.apiCalls.filter((a) => !a.ok).length}` +
            ` cors=${res.corsFailures.length}` +
            (res.issues.length ? `\n   issues: ${res.issues.join('; ')}` : '') +
            (res.notes.length ? `\n   notes: ${res.notes.join('; ')}` : ''),
        );

        // We do NOT hard-fail the Playwright test on route issues; the audit
        // records everything and produces a structured report. This keeps the
        // run green so all routes get audited, while issues are captured.
        expect(res.httpStatus === null ? false : true).toBeTruthy();
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Write consolidated report after all tests
// ---------------------------------------------------------------------------
test.afterAll(async () => {
  const byApp: Record<string, RouteResult[]> = {};
  for (const r of ALL_RESULTS) (byApp[r.app] ||= []).push(r);

  const summary = {
    generatedAt: new Date().toISOString(),
    totalRoutes: ALL_RESULTS.length,
    counts: {
      PASS: ALL_RESULTS.filter((r) => r.status === 'PASS').length,
      PARTIAL: ALL_RESULTS.filter((r) => r.status === 'PARTIAL').length,
      FAIL: ALL_RESULTS.filter((r) => r.status === 'FAIL').length,
      'NOT VERIFIED': ALL_RESULTS.filter((r) => r.status === 'NOT VERIFIED').length,
    },
    apps: byApp,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\n\n===== AUDIT REPORT WRITTEN TO ${REPORT_PATH} =====`);
  console.log(JSON.stringify(summary.counts, null, 2));
});
