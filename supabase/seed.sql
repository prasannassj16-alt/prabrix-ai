-- ==============================================================================
-- PRABRIX AI - Seed Data (supabase/seed.sql)
-- Phase 2A: Fictional Demo Dataset
--
-- DISCLAIMER:
-- ------------------------------------------------------------------------------
-- ALL DATA CONTAINED IN THIS FILE IS ENTIRELY FICTIONAL AND SYNTHETIC.
-- IT IS INTENDED SOLELY FOR LOCAL TESTING, EVALUATION, AND UI PROTOTYPING.
-- NONE OF THESE RECORDS REPRESENT REAL PROPERTIES, PERSONS, OR LEGAL DOCUMENTS.
-- NO LIVE INTEGRATIONS, SCORES, OR CERTIFICATES ARE REPRESENTED AS REAL.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEMO AUTH USERS (Mocked for Supabase Auth)
-- ------------------------------------------------------------------------------
-- Note: When running in Supabase local environment, inserts into auth.users 
-- provide valid foreign key targets for public.profiles.
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo.admin@prabrix.local',
    '$2a$10$fictionalhashedpasswordforlocaltestonly',
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"[DEMO] Admin User"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo.seller@prabrix.local',
    '$2a$10$fictionalhashedpasswordforlocaltestonly',
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"[DEMO] Ramesh Sundaram"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo.buyer@prabrix.local',
    '$2a$10$fictionalhashedpasswordforlocaltestonly',
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"[DEMO] Ananya Krishnan"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo.agent@prabrix.local',
    '$2a$10$fictionalhashedpasswordforlocaltestonly',
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"[DEMO] Balaji Real Estates"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. DEMO PROFILES
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified, bio)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'demo.admin@prabrix.local',
    '[DEMO] Prabrix System Administrator',
    '+91-9876543210',
    'admin',
    true,
    'Fictional system administrator profile for testing server-controlled privilege checks.'
),
(
    '00000000-0000-0000-0000-000000000002',
    'demo.seller@prabrix.local',
    '[DEMO] Ramesh Sundaram',
    '+91-9840112233',
    'seller',
    true,
    'Fictional agricultural land owner based in Coimbatore region.'
),
(
    '00000000-0000-0000-0000-000000000003',
    'demo.buyer@prabrix.local',
    '[DEMO] Ananya Krishnan',
    '+91-9840223344',
    'buyer',
    false,
    'Fictional retail investor looking for residential and plantation parcels.'
),
(
    '00000000-0000-0000-0000-000000000004',
    'demo.agent@prabrix.local',
    '[DEMO] Balaji Real Estates (Partner Agent)',
    '+91-9840334455',
    'agent',
    true,
    'Fictional licensed property advisory firm for Tiruchirappalli and Thanjavur.'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified;

-- ------------------------------------------------------------------------------
-- 3. DEMO LISTINGS (Tamil Nadu Geographic Coordinates)
-- ------------------------------------------------------------------------------
INSERT INTO public.listings (
    id,
    owner_id,
    title,
    description,
    property_type,
    status,
    price,
    area_sqft,
    address,
    village_panchayat,
    taluk,
    district,
    state,
    pincode,
    survey_number,
    patta_number,
    road_width_ft,
    water_source,
    electricity_connected,
    soil_type,
    coordinates,
    is_verified,
    views_count,
    published_at
) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    'Fictional demo agricultural parcel featuring road frontage, active borewell, free agricultural EB line, and coconut grove perimeter in Sulur taluk.',
    'agricultural',
    'published',
    4500000.00,
    43560.00,
    'SF 204/1B, Kannampalayam Village, Sulur Road',
    'Kannampalayam',
    'Sulur',
    'Coimbatore',
    'Tamil Nadu',
    '641402',
    '204/1B',
    'PT-8942',
    30.00,
    'borewell',
    true,
    'red',
    ST_SetSRID(ST_MakePoint(77.1250, 11.0250), 4326)::geography,
    true,
    142,
    timezone('utc'::text, now()) - INTERVAL '10 days'
),
(
    '11111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] DTCP Approved Villa Plot - 2,400 Sq.Ft.',
    'Fictional premium residential corner plot inside gated community layout with clear title, 40-foot tar road, and ready water connection in Tambaram vicinity.',
    'residential',
    'published',
    6800000.00,
    2400.00,
    'Plot 42, Sri Krishna Nagar, Mudichur Main Road',
    'Mudichur',
    'Tambaram',
    'Chengalpattu',
    'Tamil Nadu',
    '600048',
    '118/4A',
    'PT-1033',
    40.00,
    'pipeline',
    true,
    'alluvial',
    ST_SetSRID(ST_MakePoint(80.0800, 12.9200), 4326)::geography,
    true,
    318,
    timezone('utc'::text, now()) - INTERVAL '5 days'
),
(
    '11111111-1111-1111-1111-111111111103',
    '00000000-0000-0000-0000-000000000004',
    '[DEMO] National Highway Commercial Land - 25 Cents',
    'Fictional highway frontage parcel ideal for warehousing, logistics hub, or commercial showroom along Madurai-Melur expressway with 60ft frontage.',
    'commercial',
    'published',
    12500000.00,
    10890.00,
    'NH 38 Bypass, Othakadai Junction',
    'Othakadai',
    'Madurai East',
    'Madurai',
    'Tamil Nadu',
    '625107',
    '77/2',
    'PT-5512',
    60.00,
    'pipeline',
    true,
    'mixed',
    ST_SetSRID(ST_MakePoint(78.1650, 9.9500), 4326)::geography,
    true,
    89,
    timezone('utc'::text, now()) - INTERVAL '2 days'
),
(
    '11111111-1111-1111-1111-111111111104',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] Draft Industrial Land Parcel - Sriperumbudur',
    'Fictional demo listing in draft mode for testing privacy and owner-only access controls. Not visible to the public.',
    'industrial',
    'draft',
    21000000.00,
    87120.00,
    'Survey 512, Mambakkam Industrial Corridor',
    'Mambakkam',
    'Sriperumbudur',
    'Kanchipuram',
    'Tamil Nadu',
    '602105',
    '512/3',
    'PT-9988',
    50.00,
    'borewell',
    false,
    'clay',
    ST_SetSRID(ST_MakePoint(79.9400, 12.9700), 4326)::geography,
    false,
    0,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. DEMO LISTING PHOTOS
-- ------------------------------------------------------------------------------
INSERT INTO public.listing_photos (id, listing_id, photo_url, caption, display_order, is_cover)
VALUES
(
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    '[DEMO] Overview of farmland and access road',
    1,
    true
),
(
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
    '[DEMO] Operational borewell and soil quality',
    2,
    false
),
(
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111102',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    '[DEMO] Corner villa plot view and paved tar road',
    1,
    true
),
(
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111103',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    '[DEMO] Highway frontage commercial zone view',
    1,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. DEMO PRIVATE DOCUMENTS (Protected by RLS)
-- ------------------------------------------------------------------------------
INSERT INTO public.private_documents (
    id,
    listing_id,
    uploader_id,
    document_type,
    title,
    file_url,
    file_size_bytes,
    mime_type,
    verification_status,
    notes
) VALUES
(
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000002',
    'patta_chitta',
    '[DEMO] Patta Extract No 8942 - Kannampalayam',
    'https://demo-storage.prabrix.local/docs/demo_patta_8942.pdf',
    245760,
    'application/pdf',
    'verified',
    'Fictional sample document for testing verified status.'
),
(
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000002',
    'encumbrance_certificate',
    '[DEMO] Nil Encumbrance Certificate (15 Years)',
    'https://demo-storage.prabrix.local/docs/demo_ec_15yr.pdf',
    512000,
    'application/pdf',
    'verified',
    'Fictional EC document for demonstration.'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. DEMO SAVED PROPERTIES
-- ------------------------------------------------------------------------------
INSERT INTO public.saved_properties (id, user_id, listing_id, notes)
VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111101',
    '[DEMO] Shortlisted for organic farming evaluation.'
),
(
    '44444444-4444-4444-4444-444444444402',
    '00000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111102',
    '[DEMO] Good candidate for long-term residential value.'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. DEMO BUYER REQUIREMENTS
-- ------------------------------------------------------------------------------
INSERT INTO public.buyer_requirements (
    id,
    buyer_id,
    title,
    preferred_property_type,
    target_districts,
    min_price,
    max_price,
    min_area_sqft,
    max_area_sqft,
    preferred_road_width_ft,
    water_required,
    status
) VALUES
(
    '55555555-5555-5555-5555-555555555501',
    '00000000-0000-0000-0000-000000000003',
    '[DEMO] Looking for 1-2 Acres Farmland around Coimbatore or Tiruppur',
    'agricultural',
    ARRAY['Coimbatore', 'Tiruppur'],
    3000000.00,
    6000000.00,
    40000.00,
    90000.00,
    20.00,
    true,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. DEMO INQUIRIES
-- ------------------------------------------------------------------------------
INSERT INTO public.inquiries (
    id,
    listing_id,
    sender_id,
    recipient_id,
    message,
    contact_phone,
    contact_email,
    status
) VALUES
(
    '66666666-6666-6666-6666-666666666601',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] Hello, I am interested in visiting the Sulur farmland this weekend. Is the borewell yield tested throughout summer?',
    '+91-9840223344',
    'demo.buyer@prabrix.local',
    'unread'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. DEMO OFFERS
-- ------------------------------------------------------------------------------
INSERT INTO public.offers (
    id,
    listing_id,
    buyer_id,
    seller_id,
    offer_amount,
    token_amount,
    terms,
    valid_until,
    status
) VALUES
(
    '77777777-7777-7777-7777-777777777701',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    4200000.00,
    100000.00,
    '[DEMO] Offer valid subject to legal verification of title deed and survey boundary confirmation.',
    timezone('utc'::text, now()) + INTERVAL '14 days',
    'submitted'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. DEMO ANALYSIS REPORTS (Transparent Scoring Breakdown)
-- ------------------------------------------------------------------------------
INSERT INTO public.analysis_reports (
    id,
    listing_id,
    generated_by,
    report_type,
    title,
    suitability_score,
    risk_level,
    guideline_value_estimate,
    market_value_estimate,
    valuation_confidence,
    metrics_breakdown,
    positive_indicators,
    risk_factors,
    recommendations,
    is_demo
) VALUES
(
    '88888888-8888-8888-8888-888888888801',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000003',
    'suitability',
    '[DEMO] Agro-Viability & Location Suitability Report',
    84.50,
    'low',
    3800000.00,
    4400000.00,
    'demo',
    '{
        "road_connectivity": 88,
        "water_availability": 92,
        "soil_suitability": 90,
        "flood_hazard_score": 95,
        "title_clarity_score": 85
    }'::jsonb,
    '[
        {"factor": "Soil Quality", "desc": "Fertile red soil favorable for horticulture and cash crops."},
        {"factor": "Borewell & Water", "desc": "Consistent groundwater zone within Sulur micro-basin."},
        {"factor": "Access Road", "desc": "30-foot direct approach suitable for farm machinery."}
    ]'::jsonb,
    '[
        {"factor": "Zoning", "desc": "Designated as agricultural; non-farm conversion requires DTCP approval."}
    ]'::jsonb,
    '[
        {"priority": "High", "action": "Verify latest Patta transfer in Tamil Nilam portal."},
        {"priority": "Medium", "action": "Conduct water salinity (TDS) test before establishing orchards."}
    ]'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 11. DEMO COMPARABLE EVIDENCE (Benchmark Comps)
-- ------------------------------------------------------------------------------
INSERT INTO public.comparable_evidence (
    id,
    analysis_report_id,
    district,
    taluk,
    village,
    property_type,
    sale_price,
    area_sqft,
    transaction_date,
    distance_km,
    source,
    is_demo
) VALUES
(
    '99999999-9999-9999-9999-999999999901',
    '88888888-8888-8888-8888-888888888801',
    'Coimbatore',
    'Sulur',
    'Kannampalayam',
    'agricultural',
    4300000.00,
    43560.00,
    CURRENT_DATE - INTERVAL '60 days',
    0.80,
    'demo_dataset',
    true
),
(
    '99999999-9999-9999-9999-999999999902',
    '88888888-8888-8888-8888-888888888801',
    'Coimbatore',
    'Sulur',
    'Pallapalayam',
    'agricultural',
    4650000.00,
    43560.00,
    CURRENT_DATE - INTERVAL '110 days',
    2.40,
    'demo_dataset',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. DEMO NOTIFICATIONS
-- ------------------------------------------------------------------------------
INSERT INTO public.notifications (
    id,
    user_id,
    title,
    body,
    notification_type,
    entity_type,
    entity_id,
    is_read
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] New Inquiry Received',
    'Ananya Krishnan sent an inquiry regarding your Sulur farmland listing.',
    'inquiry_received',
    'inquiry',
    '66666666-6666-6666-6666-666666666601',
    false
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] Purchase Offer Submitted',
    'A formal purchase offer of ₹42,00,000 has been submitted for review.',
    'offer_received',
    'offer',
    '77777777-7777-7777-7777-777777777701',
    false
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 13. DEMO LISTING STATUS HISTORY
-- ------------------------------------------------------------------------------
INSERT INTO public.listing_status_history (
    id,
    listing_id,
    previous_status,
    new_status,
    changed_by,
    reason,
    created_at
) VALUES
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '11111111-1111-1111-1111-111111111101',
    'draft',
    'pending_approval',
    '00000000-0000-0000-0000-000000000002',
    '[DEMO] Submitted by owner for review.',
    timezone('utc'::text, now()) - INTERVAL '12 days'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '11111111-1111-1111-1111-111111111101',
    'pending_approval',
    'published',
    '00000000-0000-0000-0000-000000000001',
    '[DEMO] Approved and published by administrator.',
    timezone('utc'::text, now()) - INTERVAL '10 days'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 14. DEMO AUDIT EVENTS
-- ------------------------------------------------------------------------------
INSERT INTO public.audit_events (
    id,
    user_id,
    action,
    entity_table,
    entity_id,
    details
) VALUES
(
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '00000000-0000-0000-0000-000000000001',
    'PUBLISH_LISTING',
    'listings',
    '11111111-1111-1111-1111-111111111101',
    '{"reason":"Admin review passed successfully","is_demo":true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
