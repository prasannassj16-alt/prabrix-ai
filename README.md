# PRABRIX AI - Tamil Nadu Land Intelligence & Geospatial Marketplace

[![Playwright Tests](https://img.shields.io/badge/playwright-6%20passed-brightgreen.svg)](#end-to-end-testing-playwright)
[![Unit Tests](https://img.shields.io/badge/vitest-183%20passed-brightgreen.svg)](#unit--integration-testing-vitest)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2015%20%2B%20PostGIS-blue.svg)](#database-setup--postgis-migrations)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](#prerequisites)

**PRABRIX AI** is an enterprise-grade geospatial land intelligence platform and real-estate marketplace tailored specifically for the land ecosystem of **Tamil Nadu, India**. The platform eliminates information asymmetry, speculative price inflation, and fraudulent boundary disputes by integrating:
- Authoritative Tamil Nadu land units (`Cent`, `Ground`, `Acre`, `Hectare`, `Sq Ft`, `Sq M`)
- 4-pillar deterministic land suitability and risk analysis scoring (0–100)
- 4 strictly separated valuation metrics (Asking Price, TN Guideline Value, Observed Registry Value, AI Indicative Estimate)
- OpenStreetMap Overpass live geospatial infrastructure and straight-line amenities lookups
- Protected confidential document vaults secured by PostgreSQL Row Level Security (RLS)
- Comprehensive administrative governance and audit history

---

## Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/), [Vite 6](https://vitejs.dev/), [React Router v6](https://reactrouter.com/) |
| **Styling & UI** | [Tailwind CSS 3](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Mapping & Geospatial** | [Leaflet 1.9](https://leafletjs.com/), OpenStreetMap, Nominatim Geocoding, Overpass API |
| **Backend & Middleware** | [Node.js](https://nodejs.org/), [Express 4](https://expressjs.com/), CORS, JWT Verification |
| **Database & Security** | [PostgreSQL 15+](https://www.postgresql.org/) with **PostGIS**, [Supabase](https://supabase.com/) Row Level Security (RLS) |
| **Unit & Component Tests** | [Vitest 3](https://vitest.dev/), React Testing Library, JSDOM |
| **End-to-End Tests** | [Playwright 1.64](https://playwright.dev/) with native Chromium/Google Chrome automation |

---

## Key Modules & Capabilities

```
c:/MAIN_PROJECT/
├── src/
│   ├── components/
│   │   ├── admin/           # Listing review queue, reports, governance & config tabs
│   │   ├── analysis/        # 4-pillar suitability reports, risk checklists & legal notices
│   │   ├── auth/            # Phone OTP verification, registration, login & route guards
│   │   ├── buyer/           # Discovery marketplace, filters, sorting & detail pages
│   │   ├── map/             # Reusable Leaflet map, location picker & Nominatim lookup
│   │   ├── seller/          # 6-step listing wizard, document vault & dashboard
│   │   └── valuation/       # 4-metric valuation breakdown & Overpass amenities panel
│   ├── services/            # Pure domain services (analysis, valuation, matching, etc.)
│   └── data/                # Tamil Nadu administrative boundaries (districts, taluks)
├── server/                  # Express REST API, audit logger & admin middleware
├── supabase/migrations/     # PostgreSQL PostGIS schema with complete RLS policies
├── e2e/                     # Playwright end-to-end integration test suite
└── docs/                    # Architecture and algorithmic reference specifications
```

1. **6-Step Land Listing Wizard (`/sell`)**:
   - Step 1: Basic Property Classification & Narrative.
   - Step 2: Tamil Nadu District/Taluk Jurisdiction Cascade & Draggable Map Coordinates.
   - Step 3: Area Geometry with real-time conversion across 6 Tamil Nadu land units & asking price.
   - Step 4: Photo Gallery with cover photo designation.
   - Step 5: Confidential Legal Document Vault with MIME type and size checks.
   - Step 6: Review, Statutory Declaration, and Submission.

2. **Geospatial & Marketplace Discovery (`/buy`)**:
   - Multi-parameter filtering by District, Taluk, Classification, Price, Area, and Amenities.
   - Fast toggle between Card Grid, Split View, and Full Interactive Map View.
   - Clear field provenance badges: `Verified`, `Seller-Provided`, `Calculated`, or `Missing`.

3. **Deterministic Land Analysis Engine (`/analysis`)**:
   - 4 Pillars (Location & Connectivity, Water & Agriculture, Regulatory & Land Title, Future Development).
   - Each pillar scores 0–25 points; composite score strictly equals their sum (0–100).
   - Flags provisional assessments when critical data points are absent; prohibits speculative future price claims.

4. **Four-Metric Valuation Engine (`/property/:id`)**:
   - **Metric 1: Asking Price** (Seller set).
   - **Metric 2: Guideline Value** (Tamil Nadu Government guideline rate).
   - **Metric 3: Observed Value** (Recent registered sale deed comparables).
   - **Metric 4: AI Indicative Range** (Requires $\ge 3$ verified comparables within 15 km; displays explicit insufficient data state if unmet).

5. **OpenStreetMap Overpass Infrastructure Engine**:
   - Straight-line distance queries for primary roads, bus stops, water bodies, power lines, and hospitals.
   - Centralized timeout handling, debouncing, and local caching.

6. **Admin Governance & Compliance Console (`/admin`)**:
   - Queue for reviewing and approving/rejecting seller listings.
   - Moderation of reported listings with statutory resolution flags.
   - User governance (account active, warning, suspended).
   - Immutable audit history log.
   - Dynamic platform configuration for land classifications and measurement units.

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Browser**: Google Chrome, Chromium, or Microsoft Edge (for Playwright E2E tests)
- **Database** *(Optional for local mock mode; required for live backend)*: PostgreSQL 15+ with PostGIS or a Supabase cloud project.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/prabrix-ai.git
cd prabrix-ai
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Review and adjust variables in `.env`:

```ini
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-placeholder
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-placeholder

# Phone OTP & SMS Mode
# In development, leave VITE_OTP_DEMO_MODE=true (uses test code 123456)
VITE_OTP_DEMO_MODE=true
VITE_DEFAULT_COUNTRY_CODE=+91
VITE_OTP_COOLDOWN_SECONDS=30
VITE_MAX_OTP_ATTEMPTS=5
VITE_REQUIRE_PHONE_VERIFIED=true

# Backend API
PORT=4000
NODE_ENV=development

# Optional OCR / Document AI API
VITE_OCR_API_KEY=
VITE_OCR_API_ENDPOINT=https://api.documentai.example.com/v1/extract
```

---

## Database Setup & PostGIS Migrations

The database is built on PostgreSQL with the **PostGIS** extension for spatial geometries.

### Applying Migrations via Supabase CLI

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Apply the unified schema migration
npx supabase db push
```

Alternatively, execute `supabase/migrations/20261017000001_initial_schema.sql` directly inside the Supabase SQL Editor.

### Database Tables Created
1. `profiles` - User accounts, roles (`buyer`, `seller`, `agent`, `admin`), phone verification.
2. `listings` - Land parcels, coordinates (`POINT`), status, price, area, attributes.
3. `listing_status_history` - Audit log for listing status transitions.
4. `listing_photos` - Ground images and metadata.
5. `listing_documents` - Confidential private revenue records guarded by RLS.
6. `buyer_requirements` - Spatial purchase criteria for the matching engine.
7. `inquiries` - Buyer-to-seller requests for contact or site visits.
8. `offers` - Official price offers and settlement statuses.
9. `notifications` - In-app system alerts.
10. `saved_properties` - User bookmarks.
11. `reports` - Community violation and fraud reports.
12. `admin_audit_logs` - Immutable record of admin moderation actions.
13. `guideline_values` - Tamil Nadu revenue department base valuation data.

### Validating Database Schema

Run the automated Python schema integrity checker:

```bash
npm run validate:db
```

### Provisioning an Administrator

To grant administrative rights to an account:

```bash
node scripts/provision_admin.js admin@prabrix.local
```

For detailed security guidelines, refer to [docs/ADMIN_PROVISIONING.md](file:///c:/MAIN_PROJECT/docs/ADMIN_PROVISIONING.md).

---

## Running the Application

### Development Mode

Start the Vite development frontend server:

```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173/`

### Backend API Server (Optional / Production)

Start the Express API server:

```bash
npm run server
```
The API server will listen on port `4000` (or `PORT` specified in `.env`).

---

## Testing

PRABRIX AI maintains strict test coverage across unit, component, middleware, and end-to-end test suites.

### Unit & Integration Testing (Vitest)

Execute all 183 unit and integration tests:

```bash
npm test
```

To run Vitest in watch mode:

```bash
npm run test:watch
```

#### Test Suite Breakdown
- `adminGovernance.test.js` - Server-side authorization & admin service logic.
- `landAnalysisEngine.test.js` - 4-pillar scoring bounds, missing data handling & stability.
- `valuationModule.test.js` - 4-metric strict separation and comparable thresholds.
- `areaConversion.test.js` - Pure conversion across Tamil Nadu measurement units.
- `mapCoordinates.test.js` - WGS84 coordinate bounds and parcel validation.
- `matchingAndAuthorization.test.jsx` - Buyer matching scoring & cross-user access restrictions.
- `phase9AdminUI.test.jsx` - Admin UI tabs, listing review queue, and config modals.

### End-to-End Testing (Playwright)

PRABRIX AI uses Playwright configured to run on native Google Chrome/Chromium without external TLS-bypassing binary downloads:

```bash
npm run test:e2e
```

#### Tested Flows (`e2e/prabrix-e2e.spec.js`)
1. **User Registration & OTP**: New account creation, validation, and simulated OTP verification.
2. **6-Step Seller Wizard**: End-to-end listing creation, coordinates, area conversion, and review submission.
3. **Marketplace Discovery**: Search keyword lookup, Tamil Nadu district filters, and interactive Leaflet map toggle.
4. **Property Intelligence**: 4 valuation metrics check, Overpass API straight-line amenities, and future-use analysis.
5. **Buyer Inquiries**: Site visit scheduling and in-app inquiry submission.
6. **Admin Console**: Listing review queue, report resolution, user moderation, and platform configuration.

---

## Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)

1. Build the production assets:
   ```bash
   npm run build
   ```
2. Verify output locally:
   ```bash
   npm run preview
   ```
3. Set environment variables on your hosting provider:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OTP_DEMO_MODE=false` (when live carrier SMS gateway is attached)
   - `VITE_REQUIRE_PHONE_VERIFIED=true`

### Backend API (Render / Fly.io / Railway / Container)

1. Deploy the `server/` directory as a Node.js web service.
2. Ensure environment variables are populated:
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, never expose to frontend)
   - `VITE_SUPABASE_URL`
   - `PORT=4000`
3. Configure CORS origins to permit your production frontend domain.

### Storage & Private Document Buckets
Ensure two buckets are configured in Supabase Storage:
- `property-photos` (Public read, authenticated upload)
- `property-documents` (Private read guarded by RLS; restricted to owner and platform administrators)

---

## Security & Compliance Architecture

PRABRIX AI enforces strict security invariants across all layers:
- **No Client Secrets**: Only `VITE_SUPABASE_ANON_KEY` is bundled into frontend assets; `SUPABASE_SERVICE_ROLE_KEY` is restricted to server-side environments.
- **Row Level Security (RLS)**: Enforced across all 13 PostgreSQL tables.
- **File Upload Safeguards**: Whitelist of allowed MIME types (`image/jpeg`, `image/png`, `application/pdf`) and an enforced 10 MB file size limit.
- **Privacy Enforcement**: Seller phone numbers and emails are never exposed publicly unless explicitly consented.
- **Statutory Disclaimers**: All AI valuation estimates, suitability scores, and zoning suggestions display mandatory statutory disclaimers stating they do not substitute for formal physical surveys, legal title opinions, or DTCP/CMDA approvals.

For the complete security audit report, see [docs/SECURITY_REVIEW.md](file:///c:/MAIN_PROJECT/docs/SECURITY_REVIEW.md).

---

## Technical Documentation Reference

| Document | Topic |
| :--- | :--- |
| [docs/ADMIN_PROVISIONING.md](file:///c:/MAIN_PROJECT/docs/ADMIN_PROVISIONING.md) | Admin role assignment, CLI tools, and privilege escalation guards |
| [docs/ANALYSIS_ENGINE.md](file:///c:/MAIN_PROJECT/docs/ANALYSIS_ENGINE.md) | 4-Pillar suitability scoring algorithm and risk assessment rules |
| [docs/DATABASE.md](file:///c:/MAIN_PROJECT/docs/DATABASE.md) | PostgreSQL schema, PostGIS spatial queries, and RLS policy catalog |
| [docs/DOCUMENTS_AND_DEVELOPMENT.md](file:///c:/MAIN_PROJECT/docs/DOCUMENTS_AND_DEVELOPMENT.md) | Document vault architecture, OCR fallback, and development potential suggestions |
| [docs/MATCHING.md](file:///c:/MAIN_PROJECT/docs/MATCHING.md) | Deterministic buyer-listing matching score formula |
| [docs/OTP_SETUP.md](file:///c:/MAIN_PROJECT/docs/OTP_SETUP.md) | SMS OTP authentication, demo simulation, and Twilio integration |
| [docs/SECURITY_REVIEW.md](file:///c:/MAIN_PROJECT/docs/SECURITY_REVIEW.md) | Comprehensive security review and vulnerability assessment |
| [docs/VALUATION_AND_GEOSPATIAL.md](file:///c:/MAIN_PROJECT/docs/VALUATION_AND_GEOSPATIAL.md) | 4-metric valuation boundaries and Overpass API query policies |

---

## License

Proprietary &copy; 2026 PRABRIX AI Technologies. All rights reserved.
