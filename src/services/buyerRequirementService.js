/**
 * PRABRIX AI - Buyer Requirements Service
 *
 * Manages buyer land acquisition criteria with strict user ownership enforcement.
 * Enforces: Users may only read or change their own records.
 */

const STORAGE_REQUIREMENTS_KEY = 'prabrix_demo_buyer_requirements_db';

const initialDemoRequirements = [
  {
    id: 'req-demo-01',
    buyer_id: 'test-buyer',
    title: '1-2 Acres Farmland around Coimbatore / Sulur',
    preferred_property_type: 'agricultural',
    target_districts: ['Coimbatore', 'Tiruppur'],
    target_taluks: ['Sulur', 'Pollachi'],
    min_price: 3000000, // ₹30 Lakhs
    max_price: 6000000, // ₹60 Lakhs
    min_area_sqft: 40000, // ~92 Cents
    max_area_sqft: 90000, // ~2.06 Acres
    preferred_road_width_ft: 20,
    water_required: true,
    electricity_required: true,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'req-demo-02',
    buyer_id: 'test-buyer',
    title: 'Commercial / Mixed-Use Plot near OMR Chennai',
    preferred_property_type: 'commercial',
    target_districts: ['Chennai', 'Chengalpattu'],
    target_taluks: ['Tambaram', 'Sholinganallur'],
    min_price: 10000000, // ₹1.00 Cr
    max_price: 30000000, // ₹3.00 Cr
    min_area_sqft: 10000,
    max_area_sqft: 25000,
    preferred_road_width_ft: 30,
    water_required: false,
    electricity_required: true,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'req-demo-other',
    buyer_id: 'other-buyer-999',
    title: 'Industrial Plot in Sriperumbudur',
    preferred_property_type: 'industrial',
    target_districts: ['Kanchipuram'],
    target_taluks: ['Sriperumbudur'],
    min_price: 20000000,
    max_price: 50000000,
    min_area_sqft: 43560,
    max_area_sqft: 87120,
    preferred_road_width_ft: 40,
    water_required: false,
    electricity_required: true,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const getStoredRequirements = () => {
  try {
    const raw = localStorage.getItem(STORAGE_REQUIREMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...initialDemoRequirements];
};

const setStoredRequirements = (reqs) => {
  try {
    localStorage.setItem(STORAGE_REQUIREMENTS_KEY, JSON.stringify(reqs));
  } catch (e) {}
};

export const buyerRequirementService = {
  /**
   * Get all requirements owned by the specified buyer.
   * STRICT ACCESS CONTROL: Users may only read their own records.
   */
  getRequirementsByBuyer(buyerId) {
    if (!buyerId) return [];
    const all = getStoredRequirements();
    return all.filter((r) => r.buyer_id === buyerId);
  },

  /**
   * Get a specific requirement with ownership check.
   */
  getRequirementById(id, requesterId) {
    const all = getStoredRequirements();
    const req = all.find((r) => r.id === id);
    if (!req) return null;

    // Strict Authorization
    if (requesterId && req.buyer_id !== requesterId) {
      throw new Error('Unauthorized: You cannot view requirements created by another user.');
    }
    return req;
  },

  /**
   * Create a new acquisition requirement.
   */
  createRequirement(buyerId, data) {
    if (!buyerId) throw new Error('Buyer identity is required to create a requirement.');
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters.');
    }

    const minPrice = Number(data.min_price) || 0;
    const maxPrice = Number(data.max_price) || 0;
    if (maxPrice > 0 && maxPrice < minPrice) {
      throw new Error('Maximum price cannot be less than minimum price.');
    }

    const minArea = Number(data.min_area_sqft) || 0;
    const maxArea = Number(data.max_area_sqft) || 0;
    if (maxArea > 0 && maxArea < minArea) {
      throw new Error('Maximum area cannot be less than minimum area.');
    }

    const newReq = {
      id: 'req-' + Date.now(),
      buyer_id: buyerId,
      title: data.title.trim(),
      preferred_property_type: data.preferred_property_type || 'agricultural',
      target_districts: Array.isArray(data.target_districts)
        ? data.target_districts
        : data.target_district
        ? [data.target_district]
        : ['Coimbatore'],
      target_taluks: Array.isArray(data.target_taluks)
        ? data.target_taluks
        : data.target_taluk
        ? [data.target_taluk]
        : [],
      min_price: minPrice,
      max_price: maxPrice,
      min_area_sqft: minArea,
      max_area_sqft: maxArea,
      preferred_road_width_ft: Number(data.preferred_road_width_ft) || 0,
      water_required: Boolean(data.water_required),
      electricity_required: Boolean(data.electricity_required),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const all = getStoredRequirements();
    all.unshift(newReq);
    setStoredRequirements(all);
    return newReq;
  },

  /**
   * Update a requirement with ownership check.
   */
  updateRequirement(id, buyerId, updates) {
    const all = getStoredRequirements();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Requirement not found.');

    // Strict Authorization check
    if (all[index].buyer_id !== buyerId) {
      throw new Error('Unauthorized: You cannot edit requirements created by another user.');
    }

    all[index] = {
      ...all[index],
      ...updates,
      buyer_id: buyerId, // Enforce unchanged owner
      id, // Enforce unchanged ID
      updated_at: new Date().toISOString(),
    };

    setStoredRequirements(all);
    return all[index];
  },

  /**
   * Delete a requirement with ownership check.
   */
  deleteRequirement(id, buyerId) {
    const all = getStoredRequirements();
    const req = all.find((r) => r.id === id);
    if (!req) return false;

    // Strict Authorization check
    if (req.buyer_id !== buyerId) {
      throw new Error('Unauthorized: You cannot delete requirements created by another user.');
    }

    const filtered = all.filter((r) => r.id !== id);
    setStoredRequirements(filtered);
    return true;
  },

  resetDemo() {
    setStoredRequirements([...initialDemoRequirements]);
  },
};
