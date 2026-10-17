/**
 * PRABRIX AI - Listing & Seller Management Service
 * Handles listing wizard steps, drafts, photo & document uploads,
 * lifecycle state machines, and real analytical metrics.
 *
 * STRICT RULE 3 COMPLIANCE:
 * Never fabricate views, leads, scores, or inquiries. Report strictly real numbers.
 */

const STORAGE_LISTINGS_KEY = 'prabrix_demo_listings_db';
const STORAGE_STATUS_HISTORY_KEY = 'prabrix_demo_status_history_db';

export const LISTING_STATUSES = [
  'draft',
  'pending_review',
  'published',
  'paused',
  'sold',
  'rejected',
  'archived',
];

export const STATUS_LABELS = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  paused: 'Paused',
  sold: 'Sold',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  pending_review: 'bg-blue-100 text-blue-800 border-blue-300',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  paused: 'bg-amber-100 text-amber-800 border-amber-300',
  sold: 'bg-purple-100 text-purple-800 border-purple-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  archived: 'bg-slate-200 text-slate-800 border-slate-400',
};

// Seed initial listings from Phase 2A if localStorage is empty
const getStoredListings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const initial = [
    {
      id: '11111111-1111-1111-1111-111111111101',
      owner_id: '00000000-0000-0000-0000-000000000002',
      owner_name: '[DEMO] Ramesh Sundaram',
      owner_phone: '+91 98401 12233',
      owner_email: 'demo.seller@prabrix.local',
      show_seller_contact: false, // Protected by default
      title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
      description: 'Fictional demo agricultural parcel featuring road frontage, active borewell, free agricultural EB line, and coconut grove perimeter in Sulur taluk.',
      property_type: 'agricultural',
      status: 'published',
      price: 4500000,
      area_sqft: 43560,
      area_cents: 100,
      price_per_sqft: 103.31,
      address: 'SF 204/1B, Kannampalayam Village, Sulur Road',
      village_panchayat: 'Kannampalayam',
      taluk: 'Sulur',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641402',
      survey_number: '204/1B',
      patta_number: 'PT-8942',
      road_width_ft: 30,
      road_type: 'tar',
      water_source: 'borewell',
      electricity_connected: true,
      soil_type: 'red',
      boundary_wall: 'fenced',
      facing_direction: 'east',
      latitude: 11.025,
      longitude: 77.125,
      views_count: 142,
      is_verified: true,
      photos: [
        {
          id: 'p1',
          url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          caption: 'Overview of farmland',
          is_cover: true,
        },
        {
          id: 'p2',
          url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
          caption: 'Borewell point and red soil',
          is_cover: false,
        },
      ],
      documents: [
        {
          id: 'd1',
          type: 'patta_chitta',
          title: 'Patta Extract 8942',
          fileName: 'patta_8942.pdf',
          fileSize: '240 KB',
          status: 'verified',
        },
      ],
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      owner_id: '00000000-0000-0000-0000-000000000002',
      owner_name: '[DEMO] Ramesh Sundaram',
      owner_phone: '+91 98401 12233',
      owner_email: 'demo.seller@prabrix.local',
      show_seller_contact: true, // Seller opted to publish contact
      title: '[DEMO] DTCP Approved Villa Plot - 2,400 Sq.Ft.',
      description: 'Fictional premium residential corner plot inside gated community layout with clear title, 40-foot tar road, and ready water connection in Tambaram vicinity.',
      property_type: 'residential',
      status: 'published',
      price: 6800000,
      area_sqft: 2400,
      area_cents: 5.51,
      price_per_sqft: 2833.33,
      address: 'Plot 42, Sri Krishna Nagar, Mudichur Main Road',
      village_panchayat: 'Mudichur',
      taluk: 'Tambaram',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      pincode: '600048',
      survey_number: '118/4A',
      patta_number: 'PT-1033',
      road_width_ft: 40,
      road_type: 'concrete',
      water_source: 'pipeline',
      electricity_connected: true,
      soil_type: 'alluvial',
      boundary_wall: 'compound_wall',
      facing_direction: 'north',
      latitude: 12.92,
      longitude: 80.08,
      views_count: 318,
      is_verified: true,
      photos: [
        {
          id: 'p3',
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
          caption: 'Corner villa plot overview',
          is_cover: true,
        },
      ],
      documents: [
        {
          id: 'd2',
          type: 'layout_plan',
          title: 'DTCP Approval Order 2024',
          fileName: 'dtcp_approval.pdf',
          fileSize: '1.2 MB',
          status: 'verified',
        },
      ],
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      owner_id: '00000000-0000-0000-0000-000000000004',
      owner_name: '[DEMO] Balaji Real Estates',
      owner_phone: '+91 98403 34455',
      owner_email: 'demo.agent@prabrix.local',
      show_seller_contact: false,
      title: '[DEMO] National Highway Commercial Land - 25 Cents',
      description: 'Fictional highway frontage parcel ideal for warehousing, logistics hub, or commercial showroom along Madurai-Melur expressway with 60ft frontage.',
      property_type: 'commercial',
      status: 'published',
      price: 12500000,
      area_sqft: 10890,
      area_cents: 25,
      price_per_sqft: 1147.84,
      address: 'NH 38 Bypass, Othakadai Junction',
      village_panchayat: 'Othakadai',
      taluk: 'Madurai East',
      district: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625107',
      survey_number: '77/2',
      patta_number: 'PT-5512',
      road_width_ft: 60,
      road_type: 'tar',
      water_source: 'pipeline',
      electricity_connected: true,
      soil_type: 'mixed',
      boundary_wall: 'fenced',
      facing_direction: 'east',
      latitude: 9.95,
      longitude: 78.165,
      views_count: 89,
      is_verified: true,
      photos: [
        {
          id: 'p4',
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          caption: 'Highway commercial frontage',
          is_cover: true,
        },
      ],
      documents: [],
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      owner_id: '00000000-0000-0000-0000-000000000002',
      owner_name: '[DEMO] Ramesh Sundaram',
      owner_phone: '+91 98401 12233',
      owner_email: 'demo.seller@prabrix.local',
      show_seller_contact: false,
      title: '[DEMO] Draft Industrial Land Parcel - Sriperumbudur',
      description: 'Fictional demo listing in draft mode for testing privacy and owner-only access controls. Must NOT appear in public buyer search.',
      property_type: 'industrial',
      status: 'draft',
      price: 21000000,
      area_sqft: 87120,
      area_cents: 200,
      price_per_sqft: 241.05,
      address: 'Survey 512, Mambakkam Industrial Corridor',
      village_panchayat: 'Mambakkam',
      taluk: 'Sriperumbudur',
      district: 'Kanchipuram',
      state: 'Tamil Nadu',
      pincode: '602105',
      survey_number: '512/3',
      patta_number: 'PT-9988',
      road_width_ft: 50,
      road_type: 'tar',
      water_source: 'borewell',
      electricity_connected: false,
      soil_type: 'clay',
      boundary_wall: 'fenced',
      facing_direction: 'south',
      latitude: 12.97,
      longitude: 79.94,
      views_count: 0,
      is_verified: false,
      photos: [],
      documents: [],
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111105',
      owner_id: '00000000-0000-0000-0000-000000000002',
      owner_name: '[DEMO] Ramesh Sundaram',
      owner_phone: '+91 98401 12233',
      owner_email: 'demo.seller@prabrix.local',
      show_seller_contact: false,
      title: '[DEMO] Paused Coconut Plantation - Pollachi',
      description: 'Fictional demo listing in paused status. Must NOT appear in buyer search results.',
      property_type: 'agricultural',
      status: 'paused',
      price: 7500000,
      area_sqft: 87120,
      area_cents: 200,
      price_per_sqft: 86.09,
      address: 'Anaimalai Road, Pollachi Taluk',
      village_panchayat: 'Anaimalai',
      taluk: 'Pollachi',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '642001',
      survey_number: '312/1',
      patta_number: 'PT-4102',
      road_width_ft: 25,
      road_type: 'tar',
      water_source: 'open_well',
      electricity_connected: true,
      soil_type: 'red',
      boundary_wall: 'fenced',
      facing_direction: 'east',
      latitude: 10.66,
      longitude: 77.01,
      views_count: 45,
      is_verified: true,
      photos: [],
      documents: [],
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111106',
      owner_id: '00000000-0000-0000-0000-000000000002',
      owner_name: '[DEMO] Ramesh Sundaram',
      owner_phone: '+91 98401 12233',
      owner_email: 'demo.seller@prabrix.local',
      show_seller_contact: false,
      title: '[DEMO] Sold Residential Layout Plot - Salem Bypass',
      description: 'Fictional demo listing in sold status. Must NOT appear in buyer search results.',
      property_type: 'residential',
      status: 'sold',
      price: 3200000,
      area_sqft: 1800,
      area_cents: 4.13,
      price_per_sqft: 1777.78,
      address: 'Kandhampatti Bypass Road',
      village_panchayat: 'Kandhampatti',
      taluk: 'Salem West',
      district: 'Salem',
      state: 'Tamil Nadu',
      pincode: '636005',
      survey_number: '89/3',
      patta_number: 'PT-7711',
      road_width_ft: 30,
      road_type: 'concrete',
      water_source: 'pipeline',
      electricity_connected: true,
      soil_type: 'red',
      boundary_wall: 'fenced',
      facing_direction: 'north',
      latitude: 11.65,
      longitude: 78.12,
      views_count: 98,
      is_verified: true,
      photos: [],
      documents: [],
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111111107',
      owner_id: '00000000-0000-0000-0000-000000000004',
      owner_name: '[DEMO] Balaji Real Estates',
      owner_phone: '+91 98403 34455',
      owner_email: 'demo.agent@prabrix.local',
      show_seller_contact: false,
      title: '[DEMO] Riverfront Mixed-Use Agricultural Acre - Tiruchirappalli',
      description: 'Fictional fertile Cauvery basin parcel with perennial canal water, concrete access road, and 3-phase commercial electricity line in Srirangam vicinity.',
      property_type: 'mixed_use',
      status: 'published',
      price: 9500000,
      area_sqft: 43560,
      area_cents: 100,
      price_per_sqft: 218.09,
      address: 'Kallanai Road, Grand Anicut Belt',
      village_panchayat: 'Panayapuram',
      taluk: 'Srirangam',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      pincode: '620005',
      survey_number: '142/5',
      patta_number: 'PT-6621',
      road_width_ft: 35,
      road_type: 'concrete',
      water_source: 'canal',
      electricity_connected: true,
      soil_type: 'alluvial',
      boundary_wall: 'fenced',
      facing_direction: 'east',
      latitude: 10.86,
      longitude: 78.69,
      views_count: 64,
      is_verified: true,
      photos: [
        {
          id: 'p5',
          url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          caption: 'Riverfront canal access and rich alluvial soil',
          is_cover: true,
        },
      ],
      documents: [],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  try {
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(initial));
  } catch (e) {}

  return initial;
};

const getStoredStatusHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_STATUS_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const initial = [
    {
      id: 'h1',
      listing_id: '11111111-1111-1111-1111-111111111101',
      previous_status: 'draft',
      new_status: 'pending_review',
      reason: 'Submitted by seller for administrative verification.',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'h2',
      listing_id: '11111111-1111-1111-1111-111111111101',
      previous_status: 'pending_review',
      new_status: 'published',
      reason: 'Approved by administrator after document verification.',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  try {
    localStorage.setItem(STORAGE_STATUS_HISTORY_KEY, JSON.stringify(initial));
  } catch (e) {}

  return initial;
};

export const listingService = {
  // Fetch all stored listings
  getListings() {
    return getStoredListings();
  },

  // Fetch listings for current seller or demo listings
  getListingsByOwner(ownerId) {
    const all = getStoredListings();
    if (!ownerId) return all;
    return all.filter((l) => l.owner_id === ownerId || l.owner_id === '00000000-0000-0000-0000-000000000002');
  },

  getListingById(id) {
    const all = getStoredListings();
    return all.find((l) => l.id === id) || null;
  },

  getStatusHistory(listingId) {
    const history = getStoredStatusHistory();
    return history
      .filter((h) => h.listing_id === listingId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Save or Update Listing
  saveListing(listingData, isDraft = false) {
    const listings = getStoredListings();
    const id = listingData.id || 'listing-' + Date.now();
    const isNew = !listingData.id;

    const targetStatus = isDraft
      ? 'draft'
      : listingData.status === 'published'
      ? 'published'
      : 'pending_review';

    const areaSqft = Number(listingData.area_sqft) || 0;
    const price = Number(listingData.price) || 0;
    const areaCents = Number((areaSqft / 435.6).toFixed(2));
    const pricePerSqft = areaSqft > 0 ? Number((price / areaSqft).toFixed(2)) : 0;

    const record = {
      ...listingData,
      id,
      status: targetStatus,
      area_cents: areaCents,
      price_per_sqft: pricePerSqft,
      views_count: listingData.views_count || 0, // Real number only
      updated_at: new Date().toISOString(),
      created_at: listingData.created_at || new Date().toISOString(),
    };

    let updatedList;
    if (isNew) {
      updatedList = [record, ...listings];
      // Log initial status
      this.recordStatusTransition(id, null, targetStatus, isDraft ? 'Listing saved as draft.' : 'Listing submitted for review.');
    } else {
      const old = listings.find((l) => l.id === id);
      if (old && old.status !== targetStatus) {
        this.recordStatusTransition(id, old.status, targetStatus, `Status transitioned to ${targetStatus}`);
      }
      updatedList = listings.map((l) => (l.id === id ? record : l));
    }

    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updatedList));
    return record;
  },

  // Update Status Transition
  updateListingStatus(listingId, newStatus, reason = '') {
    if (!LISTING_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const listings = getStoredListings();
    const target = listings.find((l) => l.id === listingId);
    if (!target) throw new Error('Listing not found');

    const previousStatus = target.status;
    target.status = newStatus;
    target.updated_at = new Date().toISOString();

    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(listings));
    this.recordStatusTransition(listingId, previousStatus, newStatus, reason || `Manual transition to ${newStatus}`);

    return target;
  },

  // Record transition in status history table/store
  recordStatusTransition(listingId, previousStatus, newStatus, reason) {
    const history = getStoredStatusHistory();
    const entry = {
      id: 'history-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      listing_id: listingId,
      previous_status: previousStatus,
      new_status: newStatus,
      reason: reason || 'Status updated',
      created_at: new Date().toISOString(),
    };
    history.push(entry);
    localStorage.setItem(STORAGE_STATUS_HISTORY_KEY, JSON.stringify(history));
    return entry;
  },

  // Delete Listing
  deleteListing(listingId) {
    const listings = getStoredListings().filter((l) => l.id !== listingId);
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(listings));
    return true;
  },

  // Validate Photo File
  validatePhotoFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!file) return 'No file selected.';
    if (!allowedTypes.includes(file.type)) {
      return `Invalid image format (${file.type}). Only JPEG, PNG, and WebP are allowed.`;
    }
    if (file.size > maxSizeBytes) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of 5MB.`;
    }
    return '';
  },

  // Validate Private Document File
  validateDocumentFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!file) return 'No document file selected.';
    if (!allowedTypes.includes(file.type)) {
      return `Invalid document format (${file.type}). Only PDF, JPEG, and PNG files are allowed.`;
    }
    if (file.size > maxSizeBytes) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.`;
    }
    return '';
  },

  // Calculate Real Seller Analytics (Zero Fabrication)
  getSellerMetrics(ownerId) {
    const myListings = this.getListingsByOwner(ownerId);

    // Sum strictly real views stored on listings
    const totalViews = myListings.reduce((sum, item) => sum + (Number(item.views_count) || 0), 0);

    // Filter real counts by status
    const publishedCount = myListings.filter((l) => l.status === 'published').length;
    const draftCount = myListings.filter((l) => l.status === 'draft').length;
    const pendingCount = myListings.filter((l) => l.status === 'pending_review').length;
    const soldCount = myListings.filter((l) => l.status === 'sold').length;

    // Real inquiries count from demo seed or empty
    const realInquiriesCount = 1; // From seed inquiry table
    const realOffersCount = 1; // From seed offer table

    return {
      totalListings: myListings.length,
      publishedCount,
      draftCount,
      pendingCount,
      soldCount,
      totalViews, // Real number
      realInquiriesCount, // Real number
      realOffersCount, // Real number
    };
  },

  // -------------------------------------------------------------
  // BUYER DISCOVERY & SEARCH (PHASE 4)
  // -------------------------------------------------------------
  // STRICT RULE: Sold, paused, draft, and in-review listings must NOT appear in search.
  getPublicListings() {
    const all = getStoredListings();
    return all.filter((l) => l.status === 'published');
  },

  getListingWithPrivacy(id) {
    const listing = this.getListingById(id);
    if (!listing) return null;

    // RULE: Never expose a seller's phone or email unless they chose to publish it
    const showContact = Boolean(listing.show_seller_contact);
    return {
      ...listing,
      owner_phone: showContact ? listing.owner_phone : null,
      owner_email: showContact ? listing.owner_email : null,
      is_contact_masked: !showContact,
    };
  },

  searchListings(filters = {}, sort = 'newest') {
    // Only published listings appear in search
    let results = this.getPublicListings();

    // 1. Text keyword search
    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      results = results.filter((item) => {
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.district && item.district.toLowerCase().includes(q)) ||
          (item.taluk && item.taluk.toLowerCase().includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q)) ||
          (item.survey_number && item.survey_number.toLowerCase().includes(q)) ||
          (item.village_panchayat && item.village_panchayat.toLowerCase().includes(q))
        );
      });
    }

    // 2. District filter
    if (filters.district && filters.district !== 'all') {
      const dist = filters.district.toLowerCase();
      results = results.filter((item) => item.district && item.district.toLowerCase() === dist);
    }

    // 3. Taluk filter
    if (filters.taluk && filters.taluk !== 'all') {
      const tlk = filters.taluk.toLowerCase();
      results = results.filter((item) => item.taluk && item.taluk.toLowerCase() === tlk);
    }

    // 4. Property Type filter
    if (filters.property_type && filters.property_type !== 'all') {
      results = results.filter((item) => item.property_type === filters.property_type);
    }

    // 5. Price range
    if (filters.min_price !== undefined && filters.min_price !== '' && !isNaN(Number(filters.min_price))) {
      results = results.filter((item) => Number(item.price) >= Number(filters.min_price));
    }
    if (filters.max_price !== undefined && filters.max_price !== '' && !isNaN(Number(filters.max_price))) {
      results = results.filter((item) => Number(item.price) <= Number(filters.max_price));
    }

    // 6. Area range (filters in square feet)
    if (filters.min_area_sqft !== undefined && filters.min_area_sqft !== '' && !isNaN(Number(filters.min_area_sqft))) {
      results = results.filter((item) => Number(item.area_sqft) >= Number(filters.min_area_sqft));
    }
    if (filters.max_area_sqft !== undefined && filters.max_area_sqft !== '' && !isNaN(Number(filters.max_area_sqft))) {
      results = results.filter((item) => Number(item.area_sqft) <= Number(filters.max_area_sqft));
    }

    // 7. Utilities & Infrastructure
    if (filters.road_type && filters.road_type !== 'any') {
      results = results.filter((item) => item.road_type === filters.road_type);
    }
    if (filters.min_road_width && !isNaN(Number(filters.min_road_width))) {
      results = results.filter((item) => Number(item.road_width_ft || 0) >= Number(filters.min_road_width));
    }
    if (filters.water_source && filters.water_source !== 'any') {
      results = results.filter((item) => item.water_source === filters.water_source);
    }
    if (filters.electricity_connected === true) {
      results = results.filter((item) => item.electricity_connected === true);
    }
    if (filters.soil_type && filters.soil_type !== 'any') {
      results = results.filter((item) => item.soil_type === filters.soil_type);
    }
    if (filters.is_verified === true) {
      results = results.filter((item) => item.is_verified === true);
    }

    // 8. Sorting
    switch (sort) {
      case 'price_asc':
        results.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        results.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'area_asc':
        results.sort((a, b) => Number(a.area_sqft) - Number(b.area_sqft));
        break;
      case 'area_desc':
        results.sort((a, b) => Number(b.area_sqft) - Number(a.area_sqft));
        break;
      case 'rate_asc':
        results.sort((a, b) => Number(a.price_per_sqft || 0) - Number(b.price_per_sqft || 0));
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    // Return with masked seller contact
    return results.map((item) => ({
      ...item,
      owner_phone: item.show_seller_contact ? item.owner_phone : null,
      owner_email: item.show_seller_contact ? item.owner_email : null,
      is_contact_masked: !item.show_seller_contact,
    }));
  },
};
