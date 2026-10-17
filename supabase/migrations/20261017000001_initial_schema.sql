-- ==============================================================================
-- PRABRIX AI - Database Migration 20261017000001_initial_schema.sql
-- Phase 2A: Database Schema & Row-Level Security
-- Supported DB: PostgreSQL 15+ with PostGIS Extension (Supabase)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS: Updated Timestamp & Secure Admin Verification
-- ------------------------------------------------------------------------------

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Server-controlled admin check: verifies admin role in profiles or service_role in JWT
-- Prevents any client-side privilege escalation.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
STABLE
AS $$
DECLARE
    current_user_id UUID;
    user_role TEXT;
BEGIN
    -- Check if running under Supabase service_role key
    IF (COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role') THEN
        RETURN TRUE;
    END IF;

    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = current_user_id;

    RETURN (user_role = 'admin');
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. CORE TABLES (13 TABLES)
-- ------------------------------------------------------------------------------

-- 1) PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
    phone TEXT CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-]{8,15}$'),
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'agent', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to prevent regular users from elevating their own role or verification status
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles.';
        END IF;
        IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can modify verification status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileges();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 2) LISTINGS TABLE (Land & Location Intelligence)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 5 AND char_length(title) <= 200),
    description TEXT NOT NULL CHECK (char_length(trim(description)) >= 20),
    property_type TEXT NOT NULL CHECK (property_type IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'under_contract', 'sold', 'delisted', 'rejected')),
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    area_sqft NUMERIC(12, 2) NOT NULL CHECK (area_sqft > 0),
    -- 1 Tamil Nadu Cent = 435.6 sqft
    area_cents NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND((area_sqft / 435.6)::numeric, 2)) STORED,
    price_per_sqft NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND((price / NULLIF(area_sqft, 0))::numeric, 2)) STORED,
    address TEXT NOT NULL,
    village_panchayat TEXT,
    taluk TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10) NOT NULL CHECK (pincode ~ '^[0-9]{6}$'),
    survey_number TEXT,
    patta_number TEXT,
    road_width_ft NUMERIC(6, 2) CHECK (road_width_ft IS NULL OR road_width_ft >= 0),
    water_source TEXT CHECK (water_source IS NULL OR water_source IN ('borewell', 'open_well', 'river_canal', 'pipeline', 'none')),
    electricity_connected BOOLEAN DEFAULT false,
    soil_type TEXT CHECK (soil_type IS NULL OR soil_type IN ('red', 'black', 'alluvial', 'clay', 'sandy', 'laterite', 'mixed')),
    -- PostGIS geography column (WGS 84 Point)
    coordinates geography(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(coordinates::geometry)) STORED,
    longitude DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(coordinates::geometry)) STORED,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_coordinates_valid CHECK (
        ST_Y(coordinates::geometry) BETWEEN -90 AND 90 AND
        ST_X(coordinates::geometry) BETWEEN -180 AND 180
    )
);

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 3) LISTING_PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL CHECK (photo_url ~ '^https?://'),
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 4) PRIVATE_DOCUMENTS TABLE (Patta, Chitta, Deed, EC, FMB Sketch)
CREATE TABLE IF NOT EXISTS public.private_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    document_type TEXT NOT NULL CHECK (document_type IN ('patta_chitta', 'sale_deed', 'encumbrance_certificate', 'fmb_sketch', 'tslr_extract', 'layout_plan', 'noc', 'tax_receipt', 'other')),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
    file_url TEXT NOT NULL CHECK (file_url ~ '^https?://'),
    file_size_bytes BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    mime_type TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 5) SAVED_PROPERTIES TABLE (User Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_saved_listing UNIQUE (user_id, listing_id)
);


-- 6) BUYER_REQUIREMENTS TABLE (Buyer Criteria & Matching)
CREATE TABLE IF NOT EXISTS public.buyer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
    preferred_property_type TEXT NOT NULL CHECK (preferred_property_type IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')),
    target_districts TEXT[] NOT NULL CHECK (cardinality(target_districts) > 0),
    min_price NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (min_price >= 0),
    max_price NUMERIC(15, 2) NOT NULL CHECK (max_price >= min_price),
    min_area_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_area_sqft >= 0),
    max_area_sqft NUMERIC(12, 2) CHECK (max_area_sqft IS NULL OR max_area_sqft >= min_area_sqft),
    preferred_road_width_ft NUMERIC(6, 2) CHECK (preferred_road_width_ft IS NULL OR preferred_road_width_ft >= 0),
    water_required BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'fulfilled', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER trg_buyer_requirements_updated_at
    BEFORE UPDATE ON public.buyer_requirements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 7) INQUIRIES TABLE (Direct Inquiries)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    message TEXT NOT NULL CHECK (char_length(trim(message)) >= 10),
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived', 'spam')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_inquiry_parties CHECK (sender_id <> recipient_id)
);

CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 8) OFFERS TABLE (Formal / Informal Purchase Proposals)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    offer_amount NUMERIC(15, 2) NOT NULL CHECK (offer_amount > 0),
    token_amount NUMERIC(15, 2) CHECK (token_amount IS NULL OR (token_amount >= 0 AND token_amount <= offer_amount)),
    terms TEXT,
    valid_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'countered', 'rejected', 'withdrawn', 'expired')),
    counter_amount NUMERIC(15, 2) CHECK (counter_amount IS NULL OR counter_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_offer_parties CHECK (buyer_id <> seller_id)
);

CREATE TRIGGER trg_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 9) ANALYSIS_REPORTS TABLE (Location Intelligence & AI Suitability)
CREATE TABLE IF NOT EXISTS public.analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    generated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('suitability', 'valuation', 'legal_check', 'development_feasibility', 'agricultural_viability')),
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 5),
    suitability_score NUMERIC(5, 2) CHECK (suitability_score IS NULL OR (suitability_score >= 0 AND suitability_score <= 100)),
    risk_level TEXT CHECK (risk_level IS NULL OR risk_level IN ('low', 'moderate', 'high', 'critical')),
    guideline_value_estimate NUMERIC(15, 2) CHECK (guideline_value_estimate IS NULL OR guideline_value_estimate >= 0),
    market_value_estimate NUMERIC(15, 2) CHECK (market_value_estimate IS NULL OR market_value_estimate >= 0),
    valuation_confidence TEXT CHECK (valuation_confidence IS NULL OR valuation_confidence IN ('low', 'medium', 'high', 'demo')),
    metrics_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    positive_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_model_output JSONB,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 10) COMPARABLE_EVIDENCE TABLE (Market Evidence & Benchmark Comps)
CREATE TABLE IF NOT EXISTS public.comparable_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_report_id UUID REFERENCES public.analysis_reports(id) ON DELETE CASCADE,
    district TEXT NOT NULL,
    taluk TEXT NOT NULL,
    village TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN ('agricultural', 'residential', 'commercial', 'industrial', 'mixed_use')),
    sale_price NUMERIC(15, 2) NOT NULL CHECK (sale_price > 0),
    area_sqft NUMERIC(12, 2) NOT NULL CHECK (area_sqft > 0),
    price_per_sqft NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND((sale_price / NULLIF(area_sqft, 0))::numeric, 2)) STORED,
    transaction_date DATE NOT NULL,
    distance_km NUMERIC(8, 2) CHECK (distance_km IS NULL OR distance_km >= 0),
    source TEXT NOT NULL CHECK (source IN ('sub_registrar_office', 'verified_registry', 'published_market_data', 'survey_estimate', 'demo_dataset')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 11) NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('inquiry_received', 'offer_received', 'offer_updated', 'listing_approved', 'listing_rejected', 'report_ready', 'system_alert')),
    entity_type TEXT CHECK (entity_type IN ('listing', 'inquiry', 'offer', 'analysis_report', 'profile')),
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 12) LISTING_STATUS_HISTORY TABLE (Lifecycle State Audit)
CREATE TABLE IF NOT EXISTS public.listing_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    previous_status TEXT CHECK (previous_status IS NULL OR previous_status IN ('draft', 'pending_approval', 'published', 'under_contract', 'sold', 'delisted', 'rejected')),
    new_status TEXT NOT NULL CHECK (new_status IN ('draft', 'pending_approval', 'published', 'under_contract', 'sold', 'delisted', 'rejected')),
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Automatic trigger function to log listing status transitions
CREATE OR REPLACE FUNCTION public.log_listing_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.listing_status_history (
            listing_id,
            previous_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE(auth.uid(), NEW.owner_id),
            'Status transitioned automatically via listing update.'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_listing_status_change
    AFTER UPDATE OF status ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_listing_status_change();


-- 13) AUDIT_EVENTS TABLE (Security & Action Log)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_table TEXT NOT NULL,
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ------------------------------------------------------------------------------
-- 4. INDEXES & SPATIAL INDEXING
-- ------------------------------------------------------------------------------

-- Spatial index on coordinates (PostGIS GIST)
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON public.listings USING GIST (coordinates);

-- Core listing performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_area_sqft ON public.listings (area_sqft);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_district_taluk ON public.listings (district, taluk);
CREATE INDEX IF NOT EXISTS idx_listings_published_feed ON public.listings (status, created_at DESC) WHERE status = 'published';

-- Supporting indexes for relational queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_order ON public.listing_photos (listing_id, display_order);
CREATE INDEX IF NOT EXISTS idx_private_docs_listing_id ON public.private_documents (listing_id);
CREATE INDEX IF NOT EXISTS idx_private_docs_uploader_id ON public.private_documents (uploader_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_listing_id ON public.saved_properties (listing_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_buyer_id ON public.buyer_requirements (buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_status ON public.buyer_requirements (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON public.inquiries (listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_sender_id ON public.inquiries (sender_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_recipient_id ON public.inquiries (recipient_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers (listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers (buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON public.offers (seller_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_listing_id ON public.analysis_reports (listing_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_generated_by ON public.analysis_reports (generated_by);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_score ON public.analysis_reports (suitability_score);
CREATE INDEX IF NOT EXISTS idx_comparable_evidence_report_id ON public.comparable_evidence (analysis_report_id);
CREATE INDEX IF NOT EXISTS idx_comparable_evidence_location ON public.comparable_evidence (district, taluk, property_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_listing_status_history_listing ON public.listing_status_history (listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_action ON public.audit_events (user_id, action, created_at DESC);


-- ------------------------------------------------------------------------------
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all 13 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparable_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Public can read basic profile info of any user (for displaying agent/seller name)
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only insert their own profile on registration
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile; admins can update any profile
CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin"
    ON public.profiles FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- LISTINGS POLICIES
-- ------------------------------------------------------------------------------
-- Public (anonymous + authenticated) can read published listings
-- Owners can read all their own listings (draft, rejected, etc.)
-- Admins can read all listings
CREATE POLICY "listings_select_published_or_owner_or_admin"
    ON public.listings FOR SELECT
    USING (
        status = 'published'
        OR auth.uid() = owner_id
        OR public.is_admin()
    );

-- Authenticated users can insert their own listings
CREATE POLICY "listings_insert_owner"
    ON public.listings FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id
    );

-- Owners can update their own listings; Admins can update any listing
CREATE POLICY "listings_update_owner_or_admin"
    ON public.listings FOR UPDATE
    USING (
        auth.uid() = owner_id OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = owner_id OR public.is_admin()
    );

-- Owners and Admins can delete listings
CREATE POLICY "listings_delete_owner_or_admin"
    ON public.listings FOR DELETE
    USING (
        auth.uid() = owner_id OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- LISTING_PHOTOS POLICIES
-- ------------------------------------------------------------------------------
-- Photos visible if parent listing is published, or user owns the listing, or is admin
CREATE POLICY "listing_photos_select"
    ON public.listing_photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_photos.listing_id
            AND (l.status = 'published' OR l.owner_id = auth.uid() OR public.is_admin())
        )
    );

-- Only listing owners or admins can add photos
CREATE POLICY "listing_photos_insert"
    ON public.listing_photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_photos.listing_id
            AND (l.owner_id = auth.uid() OR public.is_admin())
        )
    );

-- Only listing owners or admins can modify/delete photos
CREATE POLICY "listing_photos_update"
    ON public.listing_photos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_photos.listing_id
            AND (l.owner_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "listing_photos_delete"
    ON public.listing_photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_photos.listing_id
            AND (l.owner_id = auth.uid() OR public.is_admin())
        )
    );

-- ------------------------------------------------------------------------------
-- PRIVATE_DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Private docs visible ONLY to listing owner, document uploader, or admin
CREATE POLICY "private_documents_select"
    ON public.private_documents FOR SELECT
    USING (
        auth.uid() = uploader_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = private_documents.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- Only listing owner, uploader, or admin can upload private documents
CREATE POLICY "private_documents_insert"
    ON public.private_documents FOR INSERT
    WITH CHECK (
        auth.uid() = uploader_id
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.listings l
                WHERE l.id = private_documents.listing_id
                AND l.owner_id = auth.uid()
            )
        )
    );

-- Only owner, uploader, or admin can update private documents
CREATE POLICY "private_documents_update"
    ON public.private_documents FOR UPDATE
    USING (
        auth.uid() = uploader_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = private_documents.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- Only owner, uploader, or admin can delete private documents
CREATE POLICY "private_documents_delete"
    ON public.private_documents FOR DELETE
    USING (
        auth.uid() = uploader_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = private_documents.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- SAVED_PROPERTIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "saved_properties_select_own"
    ON public.saved_properties FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "saved_properties_insert_own"
    ON public.saved_properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_properties_delete_own"
    ON public.saved_properties FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- BUYER_REQUIREMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "buyer_requirements_select_own_or_admin"
    ON public.buyer_requirements FOR SELECT
    USING (auth.uid() = buyer_id OR public.is_admin());

CREATE POLICY "buyer_requirements_insert_own"
    ON public.buyer_requirements FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "buyer_requirements_update_own_or_admin"
    ON public.buyer_requirements FOR UPDATE
    USING (auth.uid() = buyer_id OR public.is_admin())
    WITH CHECK (auth.uid() = buyer_id OR public.is_admin());

CREATE POLICY "buyer_requirements_delete_own_or_admin"
    ON public.buyer_requirements FOR DELETE
    USING (auth.uid() = buyer_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- INQUIRIES POLICIES
-- ------------------------------------------------------------------------------
-- Visible only to sender, recipient, or admin
CREATE POLICY "inquiries_select_parties_or_admin"
    ON public.inquiries FOR SELECT
    USING (
        auth.uid() = sender_id
        OR auth.uid() = recipient_id
        OR public.is_admin()
    );

-- Only authenticated users can send inquiries
CREATE POLICY "inquiries_insert_sender"
    ON public.inquiries FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Recipient or sender can update inquiry status (e.g. read/responded)
CREATE POLICY "inquiries_update_parties_or_admin"
    ON public.inquiries FOR UPDATE
    USING (
        auth.uid() = sender_id
        OR auth.uid() = recipient_id
        OR public.is_admin()
    );

-- Sender or admin can delete inquiry
CREATE POLICY "inquiries_delete_parties_or_admin"
    ON public.inquiries FOR DELETE
    USING (
        auth.uid() = sender_id
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- OFFERS POLICIES
-- ------------------------------------------------------------------------------
-- Visible only to buyer, seller, or admin
CREATE POLICY "offers_select_parties_or_admin"
    ON public.offers FOR SELECT
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR public.is_admin()
    );

-- Authenticated buyer can submit an offer
CREATE POLICY "offers_insert_buyer"
    ON public.offers FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Buyer, Seller, or Admin can update offer status (e.g. counter, accept, reject)
CREATE POLICY "offers_update_parties_or_admin"
    ON public.offers FOR UPDATE
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR public.is_admin()
    );

-- Buyer or admin can withdraw/delete offer
CREATE POLICY "offers_delete_buyer_or_admin"
    ON public.offers FOR DELETE
    USING (
        auth.uid() = buyer_id
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- ANALYSIS_REPORTS POLICIES
-- ------------------------------------------------------------------------------
-- Reports visible to creator, admin, or public if attached to a published listing
CREATE POLICY "analysis_reports_select"
    ON public.analysis_reports FOR SELECT
    USING (
        auth.uid() = generated_by
        OR public.is_admin()
        OR (
            listing_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.listings l
                WHERE l.id = analysis_reports.listing_id
                AND l.status = 'published'
            )
        )
    );

-- Authenticated users or admins can generate reports
CREATE POLICY "analysis_reports_insert"
    ON public.analysis_reports FOR INSERT
    WITH CHECK (
        auth.uid() = generated_by OR public.is_admin()
    );

-- Only creator or admin can update reports
CREATE POLICY "analysis_reports_update"
    ON public.analysis_reports FOR UPDATE
    USING (auth.uid() = generated_by OR public.is_admin());

-- Only creator or admin can delete reports
CREATE POLICY "analysis_reports_delete"
    ON public.analysis_reports FOR DELETE
    USING (auth.uid() = generated_by OR public.is_admin());

-- ------------------------------------------------------------------------------
-- COMPARABLE_EVIDENCE POLICIES
-- ------------------------------------------------------------------------------
-- Comps visible to anyone who has access to the linked analysis report, or public if marked demo
CREATE POLICY "comparable_evidence_select"
    ON public.comparable_evidence FOR SELECT
    USING (
        is_demo = true
        OR public.is_admin()
        OR (
            analysis_report_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.analysis_reports r
                WHERE r.id = comparable_evidence.analysis_report_id
                AND (
                    r.generated_by = auth.uid()
                    OR public.is_admin()
                    OR (
                        r.listing_id IS NOT NULL AND EXISTS (
                            SELECT 1 FROM public.listings l
                            WHERE l.id = r.listing_id
                            AND l.status = 'published'
                        )
                    )
                )
            )
        )
    );

-- Only admins can manage comparable evidence master data
CREATE POLICY "comparable_evidence_insert_admin"
    ON public.comparable_evidence FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "comparable_evidence_update_admin"
    ON public.comparable_evidence FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "comparable_evidence_delete_admin"
    ON public.comparable_evidence FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Notifications inserted by system functions/triggers or admin
CREATE POLICY "notifications_insert_system_or_admin"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users can mark their notifications as read
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users can delete their notifications
CREATE POLICY "notifications_delete_own"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- LISTING_STATUS_HISTORY POLICIES
-- ------------------------------------------------------------------------------
-- Visible to listing owner or admin
CREATE POLICY "status_history_select"
    ON public.listing_status_history FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_status_history.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- Status history is append-only: inserted via trigger or admin
CREATE POLICY "status_history_insert"
    ON public.listing_status_history FOR INSERT
    WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_status_history.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- Prohibit UPDATE and DELETE on status history (immutable audit trail)
-- No UPDATE or DELETE policies are granted.

-- ------------------------------------------------------------------------------
-- AUDIT_EVENTS POLICIES
-- ------------------------------------------------------------------------------
-- Only admins can view audit events
CREATE POLICY "audit_events_select_admin"
    ON public.audit_events FOR SELECT
    USING (public.is_admin());

-- Authenticated users and system functions can insert audit events
CREATE POLICY "audit_events_insert_all"
    ON public.audit_events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

-- Prohibit UPDATE and DELETE on audit events (immutable security log)
-- No UPDATE or DELETE policies are granted.
