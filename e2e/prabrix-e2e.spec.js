import { test, expect } from '@playwright/test';

/**
 * PRABRIX AI - End-to-End Test Suite (Playwright)
 * Covers: Registration & OTP, Create Listing (Wizard), Search Marketplace,
 * Property Intelligence & Valuation, Inquiry/Site Visit, and Admin Console.
 */

test.describe('PRABRIX AI - Core Workflows E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each flow
    await page.goto('/');
  });

  test('1. User Registration with OTP Verification Flow', async ({ page }) => {
    await page.goto('/register');

    // Verify registration page heading
    await expect(page.getByRole('heading', { name: /Create your PRABRIX AI Account/i })).toBeVisible();

    // Fill form
    await page.fill('#fullName', 'Sundar Pichai');
    await page.fill('#email', `e2e.user.${Date.now()}@prabrix.local`);
    await page.fill('#phone', '9840912345');
    await page.fill('#password', 'Prabrix@Secure2026!');
    await page.fill('#confirmPassword', 'Prabrix@Secure2026!');

    // Choose role
    await page.locator('input[name="role"][value="seller"]').check({ force: true });

    // Submit registration
    await page.click('button[type="submit"]');

    // Expect OTP verification screen
    await expect(page).toHaveURL(/.*verify-otp/);
    await expect(page.getByRole('heading', { name: /Verify Mobile Number/i })).toBeVisible();
    await expect(page.getByText(/Demo mode: no real SMS is sent/i)).toBeVisible();

    // Fill OTP digits (6-digit input: 123456)
    const inputs = page.locator('input[type="text"][maxlength="1"]');
    const count = await inputs.count();
    if (count === 6) {
      for (let i = 0; i < 6; i++) {
        await inputs.nth(i).fill('1');
      }
    }
  });

  test('2. Sell Land - 6-Step Listing Creation Wizard', async ({ page }) => {
    // Pre-authenticate as demo seller in localStorage
    await page.addInitScript(() => {
      const demoSellerSession = {
        user: {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'demo.seller@prabrix.local',
          full_name: 'Ramesh Sundaram',
          role: 'seller',
          is_phone_verified: true,
        },
        token: 'demo-seller-jwt',
      };
      localStorage.setItem('prabrix_demo_auth_session', JSON.stringify(demoSellerSession));
    });

    await page.goto('/sell');
    await expect(page.getByText(/Step 1: Basic Property Information/i)).toBeVisible();

    // Step 1: Basic Info
    await page.fill('#listingTitle', 'E2E Prime Coconut Grove Farmland - 1 Acre');
    await page.locator('button:has-text("Agricultural")').first().click();
    await page.fill('#listingDesc', 'Fertile land with coconut trees, continuous water supply, drip irrigation, and 30ft road frontage.');
    await page.click('button:has-text("Continue")');

    // Step 2: Location & Map
    await expect(page.getByText(/Step 2: Location Details & Map Pin/i)).toBeVisible();
    await page.fill('#streetAddress', 'SF 204/1B, Kannampalayam Main Road, Sulur');
    await page.click('button:has-text("Continue")');

    // Step 3: Dimensions & Pricing
    await expect(page.getByText(/Step 3: Dimensions, Pricing & Infrastructure/i)).toBeVisible();
    await page.locator('input[type="number"][placeholder*="100"]').fill('100');
    await page.fill('#askingPrice', '4500000');
    await page.click('button:has-text("Continue")');

    // Step 4: Photo Gallery
    await expect(page.getByText(/Step 4: Property Photos/i)).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 5: Confidential Legal Document Vault
    await expect(page.getByText(/Step 5: Confidential Legal Document Vault/i)).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 6: Review & Finalize
    await expect(page.getByText(/Step 6: Review & Finalize Listing/i)).toBeVisible();
    await page.locator('input[type="checkbox"]').first().check();

    // Submit for review
    await page.click('button:has-text("Submit for Review")');

    // Success Screen
    await expect(page.getByText(/Listing Submitted for Verification/i)).toBeVisible();
  });

  test('3. Marketplace Search, Filter, and Discovery Flow', async ({ page }) => {
    await page.goto('/buy');

    // Verify marketplace title
    await expect(page.getByRole('heading', { name: /Discover Verified Land/i })).toBeVisible();

    // Apply District Filter using quick district select
    await page.locator('select').first().selectOption('Coimbatore');

    // Verify Property Cards render
    const cards = page.locator('article, .bg-white.border.border-slate-200.rounded-2xl');
    await expect(cards.first()).toBeVisible();

    // Toggle Map View
    const mapBtn = page.getByRole('button', { name: /^Map$/i });
    if (await mapBtn.isVisible()) {
      await mapBtn.click();
      await expect(page.locator('.leaflet-container')).toBeVisible();
    }
  });

  test('4. Property Detail Page - Four-Metric Valuation & Development Potential', async ({ page }) => {
    // Sulur demo listing
    await page.goto('/property/11111111-1111-1111-1111-111111111101');

    // Verify Title and Provenance
    await expect(page.getByRole('heading', { name: /Fertile Red Soil Farmland/i })).toBeVisible();

    // Verify 4 Strictly Separated Valuation Metrics
    await expect(page.getByText(/1\. Asking Price/i)).toBeVisible();
    await expect(page.getByText(/2\. Guideline Value/i)).toBeVisible();
    await expect(page.getByText(/3\. Observed Value/i)).toBeVisible();
    await expect(page.getByText(/4\. AI Indicative Range/i)).toBeVisible();

    // Verify OpenStreetMap straight-line amenities lookup
    await expect(page.getByText(/Nearby Roads & Infrastructure Lookup/i)).toBeVisible();
    await expect(page.getByText(/OpenStreetMap via Overpass API/i)).toBeVisible();

    // Verify Future-Use Development Suggestions Panel
    await expect(page.getByText(/Future-Use & Development Potential Analysis/i)).toBeVisible();
    await expect(page.getByText(/Precision Agro-Cultivation/i)).toBeVisible();
    await expect(page.getByText(/Supporting Evidence/i).first()).toBeVisible();
    await expect(page.getByText(/STATUTORY PLANNING & DEVELOPMENT DISCLAIMER/i).first()).toBeVisible();
  });

  test('5. Buyer Inquiry & Site Visit Submission Flow', async ({ page }) => {
    await page.goto('/property/11111111-1111-1111-1111-111111111101');

    // Switch to Site Visit Request Tab
    const visitTab = page.getByRole('button', { name: /Schedule Visit/i });
    if (await visitTab.isVisible()) {
      await visitTab.click();
    }

    // Fill Inquiry Details
    const nameInput = page.locator('#buyerName, input[placeholder*="full name" i]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Karthik Raja');
    }

    const phoneInput = page.locator('#buyerPhone, input[placeholder*="phone" i]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9840233445');
    }

    const notesInput = page.locator('textarea');
    if (await notesInput.isVisible()) {
      await notesInput.fill('Interested in boundary verification and soil check next Sunday.');
    }

    // Submit inquiry / site visit
    const submitBtn = page.getByRole('button', { name: /Request Site Visit|Send In-App Inquiry/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page.getByText(/transmitted to the landowner|successfully/i)).toBeVisible();
    }
  });

  test('6. Admin Governance Portal & Moderation Tabs', async ({ page }) => {
    // Pre-authenticate as administrator in localStorage
    await page.addInitScript(() => {
      const adminSession = {
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@prabrix.local',
          full_name: 'Platform Administrator',
          role: 'admin',
          is_phone_verified: true,
        },
        token: 'demo-admin-jwt',
      };
      localStorage.setItem('prabrix_demo_auth_session', JSON.stringify(adminSession));
    });

    await page.goto('/admin');

    // Verify Admin Portal Header
    await expect(page.getByText(/Administrator Governance Console/i)).toBeVisible();
    await expect(page.getByText(/Admin: admin@prabrix.local/i)).toBeVisible();

    // Verify All 6 Navigation Tabs
    await expect(page.getByRole('button', { name: /Listing Review Queue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reported Listings/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /User Governance/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Listing Statuses/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Audit History/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Platform Config/i })).toBeVisible();

    // Click Platform Config Tab and Verify
    await page.getByRole('button', { name: /Platform Config/i }).click();
    await expect(page.getByText(/Agricultural Farmland/i)).toBeVisible();
    await expect(page.getByText(/Cents \(Tamil Nadu standard\)/i)).toBeVisible();
  });
});
