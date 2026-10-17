import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Responsive Visual Verification Suite
 * Tests viewports: 360px, 768px, 1024px, 1440px
 * Verifies no horizontal overflow and captures screenshots.
 */
const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/buy', name: 'marketplace' },
  { path: '/property/11111111-1111-1111-1111-111111111101', name: 'property-detail' },
  { path: '/analysis', name: 'ai-analysis' },
  { path: '/sell', name: 'sell-wizard', role: 'seller' },
  { path: '/admin', name: 'admin-portal', role: 'admin' },
];

test.describe('Responsive Visual & Overflow Audit', () => {
  const screenshotsDir = path.resolve('public/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const pageInfo of PAGES) {
        test(`renders ${pageInfo.name} without horizontal scroll`, async ({ page }) => {
          if (pageInfo.role === 'seller') {
            await page.addInitScript(() => {
              localStorage.setItem('prabrix_demo_auth_session', JSON.stringify({
                user: { id: '00000000-0000-0000-0000-000000000002', email: 'demo.seller@prabrix.local', full_name: 'Ramesh Sundaram', role: 'seller', is_phone_verified: true },
                token: 'demo-seller-jwt',
              }));
            });
          } else if (pageInfo.role === 'admin') {
            await page.addInitScript(() => {
              localStorage.setItem('prabrix_demo_auth_session', JSON.stringify({
                user: { id: '00000000-0000-0000-0000-000000000001', email: 'admin@prabrix.local', full_name: 'Platform Administrator', role: 'admin', is_phone_verified: true },
                token: 'demo-admin-jwt',
              }));
            });
          }

          await page.goto(pageInfo.path, { waitUntil: 'networkidle' });

          // Wait for any animations to settle
          await page.waitForTimeout(500);

          // Verify no horizontal overflow
          const overflowData = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth || window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const overflowing = [];
            if (scrollWidth > docWidth) {
              const elements = Array.from(document.querySelectorAll('*'));
              for (const el of elements) {
                const rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 1 || el.scrollWidth > docWidth + 1) {
                  overflowing.push({
                    tag: el.tagName,
                    id: el.id,
                    className: (el.className || '').toString().slice(0, 100),
                    rectRight: Math.round(rect.right),
                    scrollWidth: el.scrollWidth,
                  });
                }
              }
            }
            return { hasOverflow: scrollWidth > docWidth, docWidth, scrollWidth, culprits: overflowing.slice(0, 5) };
          });

          if (overflowData.hasOverflow && vp.width === 360) {
            console.log(`[OVERFLOW 360px] ${pageInfo.path}: scrollWidth=${overflowData.scrollWidth}, docWidth=${overflowData.docWidth}`, overflowData.culprits);
          }

          const screenshotPath = path.join(screenshotsDir, `${pageInfo.name}-${vp.name}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: false });

          expect(overflowData.hasOverflow, `Horizontal scroll detected on ${pageInfo.path} at ${vp.width}px`).toBe(false);
        });
      }
    });
  }
});
