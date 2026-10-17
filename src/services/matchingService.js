/**
 * PRABRIX AI - Deterministic Land Matching Engine
 *
 * CRITICAL SPECIFICATION COMPLIANCE:
 * 1. The score is 100% DETERMINISTIC based on mathematically formulated rules.
 * 2. DO NOT CALL THIS SCORE A PROBABILITY.
 *    It is a "Deterministic Compatibility Index" or "Match Score" out of 100.
 * 3. Returns explicit "why it matches" and "what it doesn't satisfy" arrays.
 */

/**
 * Matching Weight Configuration (Total: 100 Points)
 * - Location (District & Taluk): 25 points
 * - Property Type / Classification: 20 points
 * - Budget / Pricing Alignment: 25 points
 * - Land Area / Dimensions: 15 points
 * - Utilities & Site Characteristics: 15 points
 */
export const MATCHING_WEIGHTS = {
  LOCATION: 25,
  PROPERTY_TYPE: 20,
  PRICE: 25,
  AREA: 15,
  UTILITIES: 15,
};

/**
 * Calculate deterministic match score between a buyer requirement and a land listing.
 *
 * @param {Object} requirement - Buyer acquisition criteria
 * @param {Object} listing - Land listing record
 * @returns {Object} Deterministic match evaluation result
 */
export const calculateMatchScore = (requirement, listing) => {
  if (!requirement || !listing) {
    return {
      score: 0,
      tier: 'unmatched',
      label: 'Insufficient Data',
      whyItMatches: [],
      whatItDoesntSatisfy: ['Incomplete requirement or listing details provided.'],
      breakdown: {},
    };
  }

  const whyItMatches = [];
  const whatItDoesntSatisfy = [];
  const breakdown = {};

  // -------------------------------------------------------------
  // 1. LOCATION ALIGNMENT (25 Points)
  // -------------------------------------------------------------
  let locationScore = 0;
  const targetDistricts = Array.isArray(requirement.target_districts)
    ? requirement.target_districts.map((d) => d.toLowerCase().trim())
    : requirement.target_district
    ? [requirement.target_district.toLowerCase().trim()]
    : [];

  const listingDistrict = (listing.district || '').toLowerCase().trim();
  const listingTaluk = (listing.taluk || '').toLowerCase().trim();
  const targetTaluks = Array.isArray(requirement.target_taluks)
    ? requirement.target_taluks.map((t) => t.toLowerCase().trim())
    : requirement.target_taluk
    ? [requirement.target_taluk.toLowerCase().trim()]
    : [];

  if (targetDistricts.length === 0 || targetDistricts.includes(listingDistrict)) {
    if (targetTaluks.length > 0) {
      if (targetTaluks.includes(listingTaluk)) {
        locationScore = MATCHING_WEIGHTS.LOCATION; // Full 25 pts (District + Taluk match)
        whyItMatches.push(`Exact geographic match: ${listing.taluk}, ${listing.district}`);
      } else {
        locationScore = 18; // District matches, taluk differs
        whyItMatches.push(`Located in preferred district: ${listing.district}`);
        whatItDoesntSatisfy.push(`Taluk is ${listing.taluk} (preferred: ${targetTaluks.join(', ')})`);
      }
    } else {
      locationScore = MATCHING_WEIGHTS.LOCATION; // District matches, no specific taluk requested
      whyItMatches.push(`Located in preferred district: ${listing.district}`);
    }
  } else {
    locationScore = 0;
    whatItDoesntSatisfy.push(
      `Located in ${listing.district} (preferred: ${targetDistricts.join(', ') || 'unspecified'})`
    );
  }

  breakdown.location = {
    score: locationScore,
    maxScore: MATCHING_WEIGHTS.LOCATION,
    label: 'Geographic Location',
    status: locationScore === MATCHING_WEIGHTS.LOCATION ? 'pass' : locationScore > 0 ? 'partial' : 'fail',
  };

  // -------------------------------------------------------------
  // 2. PROPERTY TYPE ALIGNMENT (20 Points)
  // -------------------------------------------------------------
  let typeScore = 0;
  const preferredType = (requirement.preferred_property_type || '').toLowerCase().trim();
  const listingType = (listing.property_type || '').toLowerCase().trim();

  if (!preferredType || preferredType === 'any' || preferredType === listingType) {
    typeScore = MATCHING_WEIGHTS.PROPERTY_TYPE;
    whyItMatches.push(
      `Property type matches: ${listingType ? listingType.charAt(0).toUpperCase() + listingType.slice(1) : 'All types'}`
    );
  } else {
    typeScore = 0;
    whatItDoesntSatisfy.push(
      `Property classification is ${listingType} (preferred: ${preferredType})`
    );
  }

  breakdown.propertyType = {
    score: typeScore,
    maxScore: MATCHING_WEIGHTS.PROPERTY_TYPE,
    label: 'Property Classification',
    status: typeScore === MATCHING_WEIGHTS.PROPERTY_TYPE ? 'pass' : 'fail',
  };

  // -------------------------------------------------------------
  // 3. BUDGET / PRICING ALIGNMENT (25 Points)
  // -------------------------------------------------------------
  let priceScore = 0;
  const listingPrice = Number(listing.price) || 0;
  const minPrice = Number(requirement.min_price) || 0;
  const maxPrice = Number(requirement.max_price) || Infinity;

  const formatLakhs = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} L`;
  };

  if (listingPrice >= minPrice && listingPrice <= maxPrice) {
    priceScore = MATCHING_WEIGHTS.PRICE;
    whyItMatches.push(`Asking price ${formatLakhs(listingPrice)} is comfortably within your budget range`);
  } else if (listingPrice < minPrice) {
    // Price is below buyer's minimum threshold (often an advantage, but might indicate smaller parcel)
    const diffPct = ((minPrice - listingPrice) / minPrice) * 100;
    if (diffPct <= 20) {
      priceScore = 22;
      whyItMatches.push(`Price ${formatLakhs(listingPrice)} is slightly below your target budget threshold`);
    } else {
      priceScore = 18;
      whyItMatches.push(`Price ${formatLakhs(listingPrice)} is well under your target budget`);
    }
  } else {
    // Price is above max budget
    const overPct = ((listingPrice - maxPrice) / maxPrice) * 100;
    if (overPct <= 5) {
      priceScore = 14;
      whatItDoesntSatisfy.push(
        `Price ${formatLakhs(listingPrice)} exceeds max budget (${formatLakhs(maxPrice)}) by only ${overPct.toFixed(1)}% (negotiable)`
      );
    } else if (overPct <= 15) {
      priceScore = 7;
      whatItDoesntSatisfy.push(
        `Price ${formatLakhs(listingPrice)} exceeds max budget (${formatLakhs(maxPrice)}) by ${overPct.toFixed(1)}%`
      );
    } else {
      priceScore = 0;
      whatItDoesntSatisfy.push(
        `Price ${formatLakhs(listingPrice)} exceeds maximum budget limit of ${formatLakhs(maxPrice)}`
      );
    }
  }

  breakdown.price = {
    score: priceScore,
    maxScore: MATCHING_WEIGHTS.PRICE,
    label: 'Budget Alignment',
    status: priceScore === MATCHING_WEIGHTS.PRICE ? 'pass' : priceScore > 0 ? 'partial' : 'fail',
  };

  // -------------------------------------------------------------
  // 4. LAND AREA / DIMENSIONS ALIGNMENT (15 Points)
  // -------------------------------------------------------------
  let areaScore = 0;
  const listingArea = Number(listing.area_sqft) || 0;
  const minArea = Number(requirement.min_area_sqft) || 0;
  const maxArea = Number(requirement.max_area_sqft) || Infinity;

  const cents = (listingArea / 435.6).toFixed(1);

  if (listingArea >= minArea && (maxArea === Infinity || listingArea <= maxArea)) {
    areaScore = MATCHING_WEIGHTS.AREA;
    whyItMatches.push(`Land area of ${cents} Cents (${listingArea.toLocaleString()} sq.ft) matches desired size`);
  } else if (listingArea < minArea) {
    const underPct = ((minArea - listingArea) / minArea) * 100;
    if (underPct <= 10) {
      areaScore = 9;
      whatItDoesntSatisfy.push(`Land area ${cents} Cents is slightly smaller than requested (${underPct.toFixed(0)}% below min)`);
    } else {
      areaScore = 0;
      whatItDoesntSatisfy.push(`Land area ${cents} Cents is below minimum required size`);
    }
  } else if (listingArea > maxArea) {
    const overPct = ((listingArea - maxArea) / maxArea) * 100;
    if (overPct <= 20) {
      areaScore = 10;
      whyItMatches.push(`Land area ${cents} Cents provides more space than requested with modest variance`);
    } else {
      areaScore = 5;
      whatItDoesntSatisfy.push(`Land area ${cents} Cents exceeds preferred maximum area`);
    }
  }

  breakdown.area = {
    score: areaScore,
    maxScore: MATCHING_WEIGHTS.AREA,
    label: 'Land Parcel Size',
    status: areaScore === MATCHING_WEIGHTS.AREA ? 'pass' : areaScore > 0 ? 'partial' : 'fail',
  };

  // -------------------------------------------------------------
  // 5. UTILITIES & SITE INFRASTRUCTURE (15 Points: 5 + 5 + 5)
  // -------------------------------------------------------------
  let utilityScore = 0;

  // 5a. Road Width (5 pts)
  const preferredRoadWidth = Number(requirement.preferred_road_width_ft) || 0;
  const listingRoadWidth = Number(listing.road_width_ft) || 0;

  if (preferredRoadWidth === 0 || listingRoadWidth >= preferredRoadWidth) {
    utilityScore += 5;
    if (listingRoadWidth > 0) {
      whyItMatches.push(`Access road width is ${listingRoadWidth} ft (meets/exceeds requirement)`);
    }
  } else if (preferredRoadWidth - listingRoadWidth <= 6) {
    utilityScore += 2;
    whatItDoesntSatisfy.push(
      `Access road is ${listingRoadWidth} ft wide (preferred ${preferredRoadWidth} ft)`
    );
  } else {
    whatItDoesntSatisfy.push(
      `Access road is narrow: ${listingRoadWidth} ft (required ${preferredRoadWidth} ft)`
    );
  }

  // 5b. Water Source (5 pts)
  const waterReq = Boolean(requirement.water_required);
  const listingWater = listing.water_source && listing.water_source !== 'none';

  if (!waterReq || listingWater) {
    utilityScore += 5;
    if (listingWater) {
      whyItMatches.push(`Water source available on site: ${listing.water_source}`);
    }
  } else {
    whatItDoesntSatisfy.push(`No active water source recorded on site (water required)`);
  }

  // 5c. Electricity (5 pts)
  const elecReq = Boolean(requirement.electricity_required);
  const listingElec = Boolean(listing.electricity_connected);

  if (!elecReq || listingElec) {
    utilityScore += 5;
    if (listingElec) {
      whyItMatches.push(`Electricity connection confirmed on parcel`);
    }
  } else {
    whatItDoesntSatisfy.push(`No electricity connection installed on property`);
  }

  breakdown.utilities = {
    score: utilityScore,
    maxScore: MATCHING_WEIGHTS.UTILITIES,
    label: 'Utilities & Road Access',
    status: utilityScore === MATCHING_WEIGHTS.UTILITIES ? 'pass' : utilityScore > 0 ? 'partial' : 'fail',
  };

  // Total deterministic score computation
  let totalScore = Math.min(
    100,
    Math.round(locationScore + typeScore + priceScore + areaScore + utilityScore)
  );

  // Mismatch damping: If both location and property classification completely fail,
  // cap total score to avoid misleading scores on fundamentally conflicting parcels
  if (locationScore === 0 && typeScore === 0 && targetDistricts.length > 0 && preferredType && preferredType !== 'any') {
    totalScore = Math.min(totalScore, 20);
  }

  // Classification Tier (DO NOT CALL PROBABILITY!)
  let tier = 'unmatched';
  let label = 'Low Match';
  if (totalScore >= 85) {
    tier = 'high';
    label = 'Excellent Match';
  } else if (totalScore >= 70) {
    tier = 'good';
    label = 'Good Match';
  } else if (totalScore >= 50) {
    tier = 'moderate';
    label = 'Moderate Match';
  }

  return {
    score: totalScore,
    tier,
    label,
    whyItMatches,
    whatItDoesntSatisfy,
    breakdown,
    evaluatedAt: new Date().toISOString(),
  };
};

/**
 * Rank and filter listings against a buyer requirement.
 * STRICT STATUS RULE: Only published listings are evaluated.
 *
 * @param {Object} requirement - Buyer acquisition criteria
 * @param {Array} listings - List of properties
 * @param {number} minThresholdScore - Minimum score to include in results (default: 40)
 * @returns {Array} List of matched listings sorted by score descending
 */
export const findMatchingListings = (requirement, listings = [], minThresholdScore = 40) => {
  if (!requirement || !listings || listings.length === 0) return [];

  // Filter out any non-published listings (Strict Status Rule)
  const publishedListings = listings.filter((l) => l.status === 'published');

  const matches = publishedListings.map((listing) => {
    const matchResult = calculateMatchScore(requirement, listing);
    return {
      listing,
      match: matchResult,
      score: matchResult.score,
    };
  });

  // Filter by threshold and sort by deterministic score descending
  return matches
    .filter((m) => m.score >= minThresholdScore)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Deterministic tie-breaker: newest listing first
      return new Date(b.listing.created_at || 0) - new Date(a.listing.created_at || 0);
    });
};

/**
 * Reverse Matching: Find interested buyers/requirements for a seller's listing.
 *
 * @param {Object} listing - Land listing
 * @param {Array} requirements - List of buyer requirements
 * @param {number} minThresholdScore - Minimum score (default: 40)
 * @returns {Array} List of matched requirements sorted by score descending
 */
export const findMatchingRequirements = (listing, requirements = [], minThresholdScore = 40) => {
  if (!listing || !requirements || requirements.length === 0) return [];
  if (listing.status !== 'published') return [];

  const matches = requirements
    .filter((req) => !req.status || req.status === 'active')
    .map((req) => {
      const matchResult = calculateMatchScore(req, listing);
      return {
        requirement: req,
        match: matchResult,
        score: matchResult.score,
      };
    });

  return matches
    .filter((m) => m.score >= minThresholdScore)
    .sort((a, b) => b.score - a.score);
};
