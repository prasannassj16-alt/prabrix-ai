# PRABRIX AI - Database Architecture Specification
**Document Version:** 1.0.0 (Phase 2A: Database Only)  
**Database Engine:** PostgreSQL 15+ (Supabase) with PostGIS 3+  
**Target Region:** Tamil Nadu, India  

---

## 1. Architectural Principles & Security Model

### 1.1 Server-Controlled Role Authorization (Zero Client Trust)
Administrative and elevated privileges are strictly governed on the server side:
- **`public.is_admin()` Function:** A `SECURITY DEFINER` function with a pinned `search_path = public, auth, pg_temp` checks whether the authenticated user (`auth.uid()`) has `role = 'admin'` in `public.profiles` or if the request is executing under the Supabase `service_role`.
- **Privilege Tampering Protection:** An update trigger (`protect_profile_privileges`) intercepts any modifications to `public.profiles`. If a non-admin user attempts to alter their own `role` or `is_verified` flag, the transaction immediately terminates with an exception.
- **Client-Supplied Claims Ignored:** The application never trusts client-supplied role flags or JWT headers.

### 1.2 Geographic Location & PostGIS Spatial Engine
- **Spatial Data Type:** Listing coordinates are stored as `geography(Point, 4326)` (WGS 84 ellipsoid), enabling direct geodesic distance measurements in meters.
- **Spatial Indexing:** A PostGIS `GIST` index (`idx_listings_coordinates`) ensures sub-millisecond bounding box and radius queries (e.g., `ST_DWithin`, `ST_Distance`).
- **Synchronized Coordinates:** Generated stored columns `latitude` (`ST_Y`) and `longitude` (`ST_X`) provide zero-overhead compatibility with frontend map libraries (Leaflet / OpenStreetMap).

### 1.3 Tamil Nadu Land Measure Conventions
- **Cents Conversion:** In Tamil Nadu real estate, land is customarily measured in Cents, Grounds, and Acres.
  - $1\text{ Cent} = 435.6\text{ sq.ft.}$
  - $1\text{ Acre} = 100\text{ Cents} = 43,560\text{ sq.ft.}$
  - $1\text{ Ground} = 2,400\text{ sq.ft.}$
- Generated stored columns automatically compute `area_cents` and `price_per_sqft` to maintain mathematical precision without rounding inconsistencies across services.

---

## 2. Table Specifications (13 Core Tables)

### 2.1 `profiles`
Links directly to Supabase `auth.users` to maintain identity, contact details, and platform roles.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Auth user ID |
| `email` | `TEXT` | `NOT NULL UNIQUE` | Profile email address |
| `full_name` | `TEXT` | `NOT NULL CHECK (length >= 2)` | Real name or business entity |
| `phone` | `TEXT` | Regex validated `^\+?[0-9\s\-]{8,15}$` | Contact phone number |
| `role` | `TEXT` | `NOT NULL DEFAULT 'buyer' CHECK IN ('buyer', 'seller', 'agent', 'admin')` | Platform role |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT false` | KYC / Phone verification status |
| `avatar_url` | `TEXT` | URL validated `^https?://` | Profile picture URL |
| `bio` | `TEXT` | Optional | User summary / agent credentials |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | UTC registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-updated via trigger |

**RLS Policies:**
- `SELECT`: Public can read public profile details (`true`).
- `INSERT`: Users can insert only their own profile record (`auth.uid() = id`).
- `UPDATE`: Users can update their own details (`auth.uid() = id`), but role escalation is blocked by trigger. Admins can update any profile.
- `DELETE`: Admin only.

---

### 2.2 `listings`
Land and property records with spatial coordinates, pricing, and zoning details.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Listing identifier |
| `owner_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Property owner or agent |
| `title` | `TEXT` | `NOT NULL CHECK (length between 5 and 200)` | Listing headline |
| `description` | `TEXT` | `NOT NULL CHECK (length >= 20)` | Property narrative |
| `property_type` | `TEXT` | `CHECK IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')` | Property classification |
| `status` | `TEXT` | `CHECK IN ('draft', 'pending_approval', 'published', 'under_contract', 'sold', 'delisted', 'rejected')` | Lifecycle status |
| `price` | `NUMERIC(15,2)` | `NOT NULL CHECK (price >= 0)` | Total asking price in INR |
| `area_sqft` | `NUMERIC(12,2)` | `NOT NULL CHECK (area_sqft > 0)` | Land area in square feet |
| `area_cents` | `NUMERIC(10,2)` | `GENERATED ALWAYS AS (ROUND(area_sqft / 435.6, 2)) STORED` | Converted Tamil Nadu cents |
| `price_per_sqft` | `NUMERIC(12,2)` | `GENERATED ALWAYS AS (ROUND(price / area_sqft, 2)) STORED` | Rate per square foot |
| `address` | `TEXT` | `NOT NULL` | Street address / land landmark |
| `village_panchayat`| `TEXT` | Optional | Revenue village / Gram Panchayat |
| `taluk` | `TEXT` | `NOT NULL` | Revenue taluk (e.g. Sulur, Tambaram) |
| `district` | `TEXT` | `NOT NULL` | Tamil Nadu district name |
| `state` | `TEXT` | `NOT NULL DEFAULT 'Tamil Nadu'` | State |
| `pincode` | `VARCHAR(10)` | `NOT NULL CHECK (pincode ~ '^[0-9]{6}$')` | 6-digit Indian PIN code |
| `survey_number` | `TEXT` | Optional | Revenue Survey / Subdivision number |
| `patta_number` | `TEXT` | Optional | Revenue Patta passbook number |
| `road_width_ft` | `NUMERIC(6,2)` | `CHECK (road_width_ft >= 0)` | Access road width in feet |
| `water_source` | `TEXT` | `CHECK IN ('borewell', 'open_well', 'river_canal', 'pipeline', 'none')` | Primary water source |
| `electricity_connected`| `BOOLEAN` | `DEFAULT false` | Power supply availability |
| `soil_type` | `TEXT` | `CHECK IN ('red', 'black', 'alluvial', 'clay', 'sandy', 'laterite', 'mixed')` | Agronomic / foundation soil |
| `coordinates` | `geography(Point, 4326)` | `NOT NULL CHECK (valid lat/long bounds)` | PostGIS point |
| `latitude` | `DOUBLE PRECISION`| `GENERATED ALWAYS AS (ST_Y(coordinates::geometry)) STORED` | WGS 84 latitude |
| `longitude` | `DOUBLE PRECISION`| `GENERATED ALWAYS AS (ST_X(coordinates::geometry)) STORED` | WGS 84 longitude |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT false` | Admin/Field verification badge |
| `views_count` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (views_count >= 0)` | Analytical view counter |
| `published_at` | `TIMESTAMPTZ` | Optional | Initial publication timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Created timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-updated via trigger |

**Indexes:**
- `GIST` on `coordinates` (`idx_listings_coordinates`)
- B-tree on `status` (`idx_listings_status`)
- B-tree on `price` (`idx_listings_price`)
- B-tree on `area_sqft` (`idx_listings_area_sqft`)
- B-tree on `owner_id` (`idx_listings_owner_id`)
- Compound on `district, taluk` (`idx_listings_district_taluk`)
- Partial on `(status, created_at DESC) WHERE status = 'published'` (`idx_listings_published_feed`)

**RLS Policies:**
- `SELECT`: Public can read where `status = 'published'`. Owners can read all own listings. Admins can read all.
- `INSERT`: Authenticated users can insert where `auth.uid() = owner_id`.
- `UPDATE`: Owner or Admin can update. Status changes automatically log to `listing_status_history`.
- `DELETE`: Owner or Admin can delete.

---

### 2.3 `listing_photos`
Media galleries for properties.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Photo identifier |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE CASCADE` | Associated listing |
| `photo_url` | `TEXT` | `NOT NULL CHECK (photo_url ~ '^https?://')` | Secure HTTPS image URL |
| `caption` | `TEXT` | Optional | Photo description |
| `display_order` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (display_order >= 0)` | Sequence in gallery carousel |
| `is_cover` | `BOOLEAN` | `NOT NULL DEFAULT false` | Hero cover image flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Created timestamp |

**RLS Policies:**
- `SELECT`: Visible if parent listing is published, or user owns the listing, or is admin.
- `INSERT / UPDATE / DELETE`: Only listing owner or admin.

---

### 2.4 `private_documents`
Confidential legal instruments (Patta, Chitta, Parent Sale Deed, Encumbrance Certificate, FMB sketch).

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Document identifier |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE CASCADE` | Associated listing |
| `uploader_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Uploader profile |
| `document_type` | `TEXT` | `CHECK IN ('patta_chitta', 'sale_deed', 'encumbrance_certificate', 'fmb_sketch', 'tslr_extract', 'layout_plan', 'noc', 'tax_receipt', 'other')` | Document category |
| `title` | `TEXT` | `NOT NULL CHECK (length >= 2)` | Document title |
| `file_url` | `TEXT` | `NOT NULL CHECK (file_url ~ '^https?://')` | Cloud storage document path |
| `file_size_bytes`| `BIGINT` | `CHECK (file_size_bytes > 0)` | File size |
| `mime_type` | `TEXT` | Optional | MIME type (`application/pdf`, etc.) |
| `verification_status`| `TEXT` | `CHECK IN ('unverified', 'pending', 'verified', 'rejected')` | Legal vetting status |
| `verified_by` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Verifying officer/admin |
| `verified_at` | `TIMESTAMPTZ` | Optional | Verification timestamp |
| `notes` | `TEXT` | Optional | Internal legal notes |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Created timestamp |

**RLS Policies:**
- `SELECT`: Visible strictly to the uploader, the listing owner, or an admin.
- `INSERT / UPDATE / DELETE`: Only listing owner, uploader, or admin.

---

### 2.5 `saved_properties`
User bookmarks / favorites.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Bookmark ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Bookmark owner |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE CASCADE` | Saved listing |
| `notes` | `TEXT` | Optional | User's private notes |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Timestamp |

- **Unique Constraint:** `(user_id, listing_id)` prevents duplicate bookmarks.
- **RLS Policies:** Users can only view, insert, or delete their own saved records (`auth.uid() = user_id`).

---

### 2.6 `buyer_requirements`
Structured acquisition criteria used for location intelligence matching and lead dispatch.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Requirement ID |
| `buyer_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Buyer profile |
| `title` | `TEXT` | `NOT NULL CHECK (length >= 3)` | Brief requirement title |
| `preferred_property_type`| `TEXT` | `CHECK IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')` | Property category |
| `target_districts`| `TEXT[]` | `NOT NULL CHECK (cardinality > 0)` | Array of preferred TN districts |
| `min_price` | `NUMERIC(15,2)` | `NOT NULL DEFAULT 0 CHECK (min_price >= 0)` | Minimum budget |
| `max_price` | `NUMERIC(15,2)` | `NOT NULL CHECK (max_price >= min_price)` | Maximum budget |
| `min_area_sqft` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 0 CHECK (min_area_sqft >= 0)` | Minimum area |
| `max_area_sqft` | `NUMERIC(12,2)` | `CHECK (max_area_sqft >= min_area_sqft)` | Maximum area |
| `preferred_road_width_ft`| `NUMERIC(6,2)`| `CHECK (preferred_road_width_ft >= 0)` | Access road preference |
| `water_required`| `BOOLEAN` | `DEFAULT false` | Water source requirement |
| `status` | `TEXT` | `CHECK IN ('active', 'paused', 'fulfilled', 'closed')` | Search status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Created timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-updated via trigger |

**RLS Policies:**
- `SELECT / UPDATE / DELETE`: Only buyer (`auth.uid() = buyer_id`) or admin.
- `INSERT`: Authenticated user (`auth.uid() = buyer_id`).

---

### 2.7 `inquiries`
Direct communications between buyers and property owners.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Inquiry ID |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE CASCADE` | Targeted property |
| `sender_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Sender user |
| `recipient_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Listing owner |
| `message` | `TEXT` | `NOT NULL CHECK (length >= 10)` | Inquiry message text |
| `contact_phone` | `TEXT` | Optional | Direct callback number |
| `contact_email` | `TEXT` | Optional | Direct contact email |
| `status` | `TEXT` | `CHECK IN ('unread', 'read', 'responded', 'archived', 'spam')` | Workflow status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Message timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-updated via trigger |

- **Constraint:** `sender_id <> recipient_id` (users cannot send inquiries to their own listings).
- **RLS Policies:** Only the sender, recipient, or admin can read and update.

---

### 2.8 `offers`
Formal and informal acquisition offers and counter-proposals.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Offer ID |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE RESTRICT` | Targeted listing |
| `buyer_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Prospective buyer |
| `seller_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Property owner |
| `offer_amount` | `NUMERIC(15,2)` | `NOT NULL CHECK (offer_amount > 0)` | Proposed purchase price |
| `token_amount` | `NUMERIC(15,2)` | `CHECK (token_amount between 0 and offer_amount)` | Token / Advance amount |
| `terms` | `TEXT` | Optional | Conditions and contingencies |
| `valid_until` | `TIMESTAMPTZ` | Optional | Expiration deadline |
| `status` | `TEXT` | `CHECK IN ('submitted', 'under_review', 'accepted', 'countered', 'rejected', 'withdrawn', 'expired')` | State machine status |
| `counter_amount`| `NUMERIC(15,2)` | `CHECK (counter_amount > 0)` | Seller counter-offer price |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-updated via trigger |

- **Constraint:** `buyer_id <> seller_id`.
- **RLS Policies:** Visible and manageable exclusively by the buyer, seller, or admin.

---

### 2.9 `analysis_reports`
AI-assisted land intelligence, agro-viability, and location suitability assessments.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Report ID |
| `listing_id` | `UUID` | `REFERENCES listings(id) ON DELETE SET NULL` | Associated listing (if any) |
| `generated_by` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Creator profile |
| `report_type` | `TEXT` | `CHECK IN ('suitability', 'valuation', 'legal_check', 'development_feasibility', 'agricultural_viability')` | Report type |
| `title` | `TEXT` | `NOT NULL CHECK (length >= 5)` | Report title |
| `suitability_score`| `NUMERIC(5,2)`| `CHECK (suitability_score between 0 and 100)` | Computed score (0.00 to 100.00) |
| `risk_level` | `TEXT` | `CHECK IN ('low', 'moderate', 'high', 'critical')` | Overall risk assessment |
| `guideline_value_estimate`| `NUMERIC(15,2)`| `CHECK (guideline_value_estimate >= 0)` | Estimated TN govt guideline value |
| `market_value_estimate` | `NUMERIC(15,2)`| `CHECK (market_value_estimate >= 0)` | Fair market valuation estimate |
| `valuation_confidence` | `TEXT` | `CHECK IN ('low', 'medium', 'high', 'demo')` | Confidence level |
| `metrics_breakdown` | `JSONB` | `NOT NULL DEFAULT '{}'` | Structured category scores |
| `positive_indicators`| `JSONB` | `NOT NULL DEFAULT '[]'` | Positive factors array |
| `risk_factors` | `JSONB` | `NOT NULL DEFAULT '[]'` | Identified hazard/risk array |
| `recommendations` | `JSONB` | `NOT NULL DEFAULT '[]'` | Actionable diligence items |
| `raw_model_output` | `JSONB` | Optional | Debugging / inference metadata |
| `is_demo` | `BOOLEAN` | `NOT NULL DEFAULT false` | Demo/synthetic indicator flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |

**RLS Policies:**
- `SELECT`: Visible to creator, admin, or public if attached to a published listing.
- `INSERT`: Creator or admin.
- `UPDATE / DELETE`: Creator or admin.

---

### 2.10 `comparable_evidence`
Benchmark sales transactions and empirical comp data backing valuation reports.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Comparable ID |
| `analysis_report_id`| `UUID` | `REFERENCES analysis_reports(id) ON DELETE CASCADE` | Associated report |
| `district` | `TEXT` | `NOT NULL` | District |
| `taluk` | `TEXT` | `NOT NULL` | Revenue taluk |
| `village` | `TEXT` | Optional | Village |
| `property_type` | `TEXT` | `CHECK IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')` | Property type |
| `sale_price` | `NUMERIC(15,2)` | `NOT NULL CHECK (sale_price > 0)` | Recorded sale price |
| `area_sqft` | `NUMERIC(12,2)` | `NOT NULL CHECK (area_sqft > 0)` | Area in sq.ft. |
| `price_per_sqft`| `NUMERIC(12,2)` | `GENERATED ALWAYS AS (ROUND(sale_price / area_sqft, 2)) STORED` | Rate per sq.ft. |
| `transaction_date`| `DATE` | `NOT NULL` | Sale/registration date |
| `distance_km` | `NUMERIC(8,2)` | `CHECK (distance_km >= 0)` | Distance from subject land |
| `source` | `TEXT` | `CHECK IN ('sub_registrar_office', 'verified_registry', 'published_market_data', 'survey_estimate', 'demo_dataset')` | Data provenance |
| `is_demo` | `BOOLEAN` | `NOT NULL DEFAULT false` | Synthetic data flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record timestamp |

**RLS Policies:**
- `SELECT`: Public if `is_demo = true`, or if viewer has access to the associated report.
- `INSERT / UPDATE / DELETE`: Admin only (ensuring master comparable data is never altered by end users).

---

### 2.11 `notifications`
In-app alerts dispatched for platform events (inquiries, offers, status transitions).

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Notification ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Recipient user |
| `title` | `TEXT` | `NOT NULL` | Notification headline |
| `body` | `TEXT` | `NOT NULL` | Notification body |
| `notification_type`| `TEXT` | `CHECK IN ('inquiry_received', 'offer_received', 'offer_updated', 'listing_approved', 'listing_rejected', 'report_ready', 'system_alert')` | Event type |
| `entity_type` | `TEXT` | `CHECK IN ('listing', 'inquiry', 'offer', 'analysis_report', 'profile')` | Target entity |
| `entity_id` | `UUID` | Optional | Referenced record ID |
| `is_read` | `BOOLEAN` | `NOT NULL DEFAULT false` | Read status |
| `read_at` | `TIMESTAMPTZ` | Optional | Read timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Event timestamp |

**RLS Policies:**
- `SELECT / UPDATE / DELETE`: Recipient user (`auth.uid() = user_id`) or admin.
- `INSERT`: System triggers, service role, or admin.

---

### 2.12 `listing_status_history`
Append-only audit trail logging every status transition in a listing's lifecycle.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | History ID |
| `listing_id` | `UUID` | `NOT NULL REFERENCES listings(id) ON DELETE CASCADE` | Associated listing |
| `previous_status`| `TEXT` | Valid status or null | Pre-transition state |
| `new_status` | `TEXT` | `NOT NULL` Valid status | Post-transition state |
| `changed_by` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Actor responsible |
| `reason` | `TEXT` | Optional | Transition rationale |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Event timestamp |

**Trigger:**
- `trg_log_listing_status_change` fires `AFTER UPDATE OF status ON listings` and automatically inserts a snapshot into this table.
**RLS Policies:**
- `SELECT`: Listing owner or admin.
- `INSERT`: Automated trigger or admin.
- `UPDATE / DELETE`: Forbidden (immutable record).

---

### 2.13 `audit_events`
Security and administrative event log tracking access, publications, and critical platform actions.

| Column | Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Audit ID |
| `user_id` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Performing user (if authenticated) |
| `action` | `TEXT` | `NOT NULL` | Action code (e.g., `PUBLISH_LISTING`) |
| `entity_table` | `TEXT` | `NOT NULL` | Affected database table |
| `entity_id` | `UUID` | Optional | Target primary key |
| `ip_address` | `INET` | Optional | Client IP address |
| `user_agent` | `TEXT` | Optional | Browser / client identifier |
| `details` | `JSONB` | `NOT NULL DEFAULT '{}'` | Structured event payload |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Event timestamp |

**RLS Policies:**
- `SELECT`: Admin only (`public.is_admin()`).
- `INSERT`: Authenticated users and system routines.
- `UPDATE / DELETE`: Strictly prohibited (tamper-evident immutable record).

---

## 3. PostGIS Query Examples

### 3.1 Spatial Radius Search (Properties within 10 km of a point)
```sql
SELECT 
    id, 
    title, 
    price, 
    latitude, 
    longitude,
    ST_Distance(coordinates, ST_SetSRID(ST_MakePoint(76.9558, 11.0168), 4326)::geography) / 1000.0 AS distance_km
FROM public.listings
WHERE 
    status = 'published'
    AND ST_DWithin(
        coordinates, 
        ST_SetSRID(ST_MakePoint(76.9558, 11.0168), 4326)::geography, 
        10000 -- 10,000 meters
    )
ORDER BY distance_km ASC;
```

### 3.2 Bounding Box / Map Viewport Query
```sql
SELECT 
    id, 
    title, 
    price, 
    property_type, 
    latitude, 
    longitude
FROM public.listings
WHERE 
    status = 'published'
    AND coordinates && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography;
```
