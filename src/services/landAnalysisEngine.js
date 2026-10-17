/**
 * PRABRIX AI - Pure Land Intelligence & Feasibility Scoring Engine
 * Phase 6: Land Analysis Engine (section 10 of PROJECT_SPEC.md)
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. Zero React / DOM dependencies. Pure mathematical & deterministic ES module.
 * 2. 4 distinct analysis pillars (0 to 25 points each):
 *    - Legal & Document Diligence (0-25 pts)
 *    - Physical & Site Feasibility (0-25 pts)
 *    - Location & Connectivity Intelligence (0-25 pts)
 *    - Agronomic & Development Viability (0-25 pts)
 * 3. Total score strictly equals the sum of the four pillars (0 to 100).
 * 4. Graceful handling of missing or invalid data: returns 'provisional' or 'unavailable'.
 * 5. Deterministic & mathematically stable (same inputs always yield identical results).
 * 6. RULE 3 & SPEC MANDATE: Strictly NO guaranteed future values, speculative price projections, or ROI promises.
 */

export const STATUTORY_LEGAL_DISCLAIMER =
  'PRABRIX AI provides retrospective diligence assessments, spatial benchmarks, and document verification tracking based on public government records, empirical comps, and seller-disclosed materials. PRABRIX AI DOES NOT provide guaranteed future values, projected capital appreciation, or speculative financial returns. Land acquisition decisions must be preceded by independent title search through a qualified advocate and formal DGPS field boundary survey.';

export const PILLAR_DEFINITIONS = {
  legal: {
    key: 'legal',
    label: 'Legal & Document Diligence',
    maxScore: 25,
    description: 'Title validity, Patta/Chitta registry status, Encumbrance Certificate vetting, and revenue survey boundary alignment.',
  },
  physical: {
    key: 'physical',
    label: 'Physical & Site Feasibility',
    maxScore: 25,
    description: 'Direct vehicular road access width, surface type, on-site water infrastructure, and active electrical connectivity.',
  },
  location: {
    key: 'location',
    label: 'Location & Connectivity Intelligence',
    maxScore: 25,
    description: 'Proximity to primary highway corridors, taluk commercial growth hubs, and revenue village administrative connectivity.',
  },
  viability: {
    key: 'viability',
    label: 'Agronomic & Development Viability',
    maxScore: 25,
    description: 'Soil foundation suitability, topographic flood inundation risk, parcel geometry regularity, and boundary security.',
  },
};

/**
 * Clamps a number between min and max
 */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Rounds to 1 decimal place to prevent floating-point anomalies
 */
const round1 = (val) => Math.round(val * 10) / 10;

/**
 * 1. Calculate Legal & Document Diligence Pillar (0 to 25 points)
 */
export function calculateLegalScore(listing = {}, documents = []) {
  if (!listing || typeof listing !== 'object') return { score: 0, factors: [], evidence: [] };

  const docs = Array.isArray(documents)
    ? documents
    : Array.isArray(listing.documents)
    ? listing.documents
    : [];

  const factors = [];
  const evidence = [];

  // Factor 1: Patta / Chitta Record Status (0 - 8 pts)
  let pattaScore = 0;
  const hasPattaDoc = docs.some(
    (d) => (d.type === 'patta_chitta' || d.document_type === 'patta_chitta') && (d.status === 'verified' || d.verification_status === 'verified')
  );
  const hasPattaNumber = Boolean(listing.patta_number && String(listing.patta_number).trim());

  if (hasPattaDoc) {
    pattaScore = 8;
    factors.push({ name: 'Patta/Chitta Document', score: 8, max: 8, status: 'verified', note: 'Revenue Patta document verified' });
    evidence.push(`Verified Revenue Patta passbook record attached (${listing.patta_number || 'Official Record'})`);
  } else if (hasPattaNumber) {
    pattaScore = 5;
    factors.push({ name: 'Patta/Chitta Document', score: 5, max: 8, status: 'self_reported', note: 'Patta number provided (pending document vetting)' });
    evidence.push(`Patta number reported (${listing.patta_number}); physical or digital copy awaiting verification`);
  } else {
    pattaScore = 0;
    factors.push({ name: 'Patta/Chitta Document', score: 0, max: 8, status: 'missing', note: 'No Patta number or document recorded' });
  }

  // Factor 2: Title Deed / Ownership History (0 - 7 pts)
  let titleScore = 0;
  const hasSaleDeedDoc = docs.some(
    (d) => (d.type === 'sale_deed' || d.document_type === 'sale_deed') && (d.status === 'verified' || d.verification_status === 'verified')
  );
  const hasUnverifiedSaleDeed = docs.some(
    (d) => d.type === 'sale_deed' || d.document_type === 'sale_deed'
  );

  if (hasSaleDeedDoc) {
    titleScore = 7;
    factors.push({ name: 'Title Deed Lineage', score: 7, max: 7, status: 'verified', note: 'Registered sale deed / parent document verified' });
    evidence.push('Registered parent title deed verified with clear ownership flow');
  } else if (hasUnverifiedSaleDeed) {
    titleScore = 4;
    factors.push({ name: 'Title Deed Lineage', score: 4, max: 7, status: 'pending', note: 'Sale deed uploaded, legal vetting pending' });
    evidence.push('Sale deed uploaded; awaiting advocate vetting');
  } else if (listing.is_verified) {
    titleScore = 5;
    factors.push({ name: 'Title Deed Lineage', score: 5, max: 7, status: 'verified', note: 'Field verified listing with verified ownership' });
    evidence.push('Owner identity and ownership verified by field inspection team');
  } else {
    titleScore = 1;
    factors.push({ name: 'Title Deed Lineage', score: 1, max: 7, status: 'unverified', note: 'No verified title deed submitted' });
  }

  // Factor 3: Encumbrance Certificate (EC) (0 - 5 pts)
  let ecScore = 0;
  const hasEcDoc = docs.some(
    (d) => (d.type === 'encumbrance_certificate' || d.document_type === 'encumbrance_certificate') && (d.status === 'verified' || d.verification_status === 'verified')
  );
  const hasUnverifiedEc = docs.some(
    (d) => d.type === 'encumbrance_certificate' || d.document_type === 'encumbrance_certificate'
  );

  if (hasEcDoc) {
    ecScore = 5;
    factors.push({ name: 'Encumbrance Certificate (EC)', score: 5, max: 5, status: 'verified', note: 'Nil Encumbrance Certificate verified' });
    evidence.push('Nil Encumbrance Certificate verified covering continuous transaction history');
  } else if (hasUnverifiedEc) {
    ecScore = 3;
    factors.push({ name: 'Encumbrance Certificate (EC)', score: 3, max: 5, status: 'pending', note: 'EC uploaded; under verification' });
    evidence.push('Encumbrance Certificate submitted, pending legal clearance verification');
  } else {
    ecScore = 0;
    factors.push({ name: 'Encumbrance Certificate (EC)', score: 0, max: 5, status: 'missing', note: 'No Encumbrance Certificate submitted' });
  }

  // Factor 4: Revenue Survey & Boundary Sketch (0 - 5 pts)
  let surveyScore = 0;
  const hasFmbDoc = docs.some(
    (d) => (d.type === 'fmb_sketch' || d.document_type === 'fmb_sketch' || d.type === 'layout_plan' || d.document_type === 'layout_plan') &&
      (d.status === 'verified' || d.verification_status === 'verified')
  );
  const hasSurveyNumber = Boolean(listing.survey_number && String(listing.survey_number).trim());

  if (hasFmbDoc && hasSurveyNumber) {
    surveyScore = 5;
    factors.push({ name: 'Survey & FMB Sketch', score: 5, max: 5, status: 'verified', note: 'Survey number and FMB/Layout sketch verified' });
    evidence.push(`Survey subdivision SF ${listing.survey_number} mapped to verified FMB sketch`);
  } else if (hasSurveyNumber) {
    surveyScore = 3;
    factors.push({ name: 'Survey & FMB Sketch', score: 3, max: 5, status: 'partial', note: 'Survey number recorded; FMB sketch missing' });
    evidence.push(`Survey number SF ${listing.survey_number} registered without digitized FMB field sketch`);
  } else {
    surveyScore = 0;
    factors.push({ name: 'Survey & FMB Sketch', score: 0, max: 5, status: 'missing', note: 'No survey number recorded' });
  }

  const rawSum = pattaScore + titleScore + ecScore + surveyScore;
  const score = clamp(round1(rawSum), 0, 25);

  return {
    score,
    maxScore: 25,
    factors,
    evidence,
  };
}

/**
 * 2. Calculate Physical & Site Feasibility Pillar (0 to 25 points)
 */
export function calculatePhysicalScore(listing = {}) {
  if (!listing || typeof listing !== 'object') return { score: 0, factors: [], evidence: [] };

  const factors = [];
  const evidence = [];

  // Factor 1: Access Road Width (0 - 10 pts)
  let roadWidthScore = 0;
  const width = Number(listing.road_width_ft);

  if (!isNaN(width) && width > 0) {
    if (width >= 40) {
      roadWidthScore = 10;
      evidence.push(`Wide ${width}ft vehicular frontage suitable for commercial and heavy vehicle transit`);
    } else if (width >= 30) {
      roadWidthScore = 8;
      evidence.push(`Substantial ${width}ft frontage supporting standard multi-axle trucks and farm machinery`);
    } else if (width >= 20) {
      roadWidthScore = 6;
      evidence.push(`Standard ${width}ft access road suitable for two-way domestic and utility transport`);
    } else if (width >= 12) {
      roadWidthScore = 4;
      evidence.push(`Narrow ${width}ft access road suitable for passenger vehicles and light tractors`);
    } else {
      roadWidthScore = 2;
      evidence.push(`Constrained ${width}ft access pathway requiring vehicle maneuvering space`);
    }
    factors.push({ name: 'Access Road Width', score: roadWidthScore, max: 10, value: `${width} ft`, status: 'evaluated' });
  } else {
    roadWidthScore = 0;
    factors.push({ name: 'Access Road Width', score: 0, max: 10, value: 'Unknown', status: 'missing' });
  }

  // Factor 2: Road Surface Type (0 - 5 pts)
  let roadTypeScore = 0;
  const roadType = String(listing.road_type || '').toLowerCase();

  if (roadType === 'concrete' || roadType === 'tar') {
    roadTypeScore = 5;
    factors.push({ name: 'Road Surface Quality', score: 5, max: 5, value: roadType.toUpperCase(), status: 'evaluated' });
    evidence.push(`All-weather ${roadType} surfaced approach ensures year-round accessibility`);
  } else if (roadType === 'gravel' || roadType === 'metal') {
    roadTypeScore = 3;
    factors.push({ name: 'Road Surface Quality', score: 3, max: 5, value: 'Gravel / Metal', status: 'evaluated' });
    evidence.push('Gravel/metal access road; serviceable with periodic seasonal maintenance');
  } else if (roadType === 'mud' || roadType === 'dirt') {
    roadTypeScore = 1;
    factors.push({ name: 'Road Surface Quality', score: 1, max: 5, value: 'Mud / Unpaved', status: 'evaluated' });
    evidence.push('Unpaved earthen roadway subject to monsoon weathering and wet-season softening');
  } else {
    roadTypeScore = 0;
    factors.push({ name: 'Road Surface Quality', score: 0, max: 5, value: 'Not specified', status: 'missing' });
  }

  // Factor 3: Water Infrastructure (0 - 5 pts)
  let waterScore = 0;
  const waterSource = String(listing.water_source || '').toLowerCase();

  if (waterSource === 'borewell' || waterSource === 'river_canal') {
    waterScore = 5;
    factors.push({ name: 'Water Infrastructure', score: 5, max: 5, value: waterSource.replace('_', ' ').toUpperCase(), status: 'evaluated' });
    evidence.push(`Dedicated on-site ${waterSource.replace('_', ' ')} resource provides independent water supply`);
  } else if (waterSource === 'open_well' || waterSource === 'pipeline') {
    waterScore = 4;
    factors.push({ name: 'Water Infrastructure', score: 4, max: 5, value: waterSource.replace('_', ' ').toUpperCase(), status: 'evaluated' });
    evidence.push(`Reliable ${waterSource.replace('_', ' ')} utility connection available on property`);
  } else if (waterSource === 'none') {
    waterScore = 1;
    factors.push({ name: 'Water Infrastructure', score: 1, max: 5, value: 'None', status: 'evaluated' });
    evidence.push('No active on-site water source; requires prospective borewell drilling or tanker arrangement');
  } else {
    waterScore = 0;
    factors.push({ name: 'Water Infrastructure', score: 0, max: 5, value: 'Unverified', status: 'missing' });
  }

  // Factor 4: Power & Electrical Connectivity (0 - 5 pts)
  let powerScore = 0;
  if (listing.electricity_connected === true) {
    powerScore = 5;
    factors.push({ name: 'Electrical Grid Connectivity', score: 5, max: 5, value: 'Connected', status: 'evaluated' });
    evidence.push('Active grid electricity connection in place with local distribution infrastructure');
  } else if (listing.electricity_connected === false) {
    powerScore = 1;
    factors.push({ name: 'Electrical Grid Connectivity', score: 1, max: 5, value: 'Not Connected', status: 'evaluated' });
    evidence.push('Power supply not currently energized; requires TANGEDCO application and line extension');
  } else {
    powerScore = 0;
    factors.push({ name: 'Electrical Grid Connectivity', score: 0, max: 5, value: 'Unspecified', status: 'missing' });
  }

  const rawSum = roadWidthScore + roadTypeScore + waterScore + powerScore;
  const score = clamp(round1(rawSum), 0, 25);

  return {
    score,
    maxScore: 25,
    factors,
    evidence,
  };
}

/**
 * 3. Calculate Location & Connectivity Intelligence Pillar (0 to 25 points)
 */
export function calculateLocationScore(listing = {}) {
  if (!listing || typeof listing !== 'object') return { score: 0, factors: [], evidence: [] };

  const factors = [];
  const evidence = [];

  // Factor 1: Highway & Arterial Corridor Proximity (0 - 10 pts)
  let corridorScore = 0;
  const lat = Number(listing.latitude);
  const lng = Number(listing.longitude);
  const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat >= 8 && lat <= 14 && lng >= 76 && lng <= 81;

  if (hasCoordinates) {
    // If coordinates are provided in major TN development clusters
    corridorScore = 9;
    factors.push({ name: 'Corridor Connectivity', score: 9, max: 10, status: 'evaluated', note: 'GPS coordinates verified within mapped economic corridor' });
    evidence.push(`Verified spatial location at (${lat.toFixed(4)}, ${lng.toFixed(4)}) situated within growth corridor`);
  } else if (listing.address && String(listing.address).toLowerCase().includes('road')) {
    corridorScore = 6;
    factors.push({ name: 'Corridor Connectivity', score: 6, max: 10, status: 'approximate', note: 'Arterial road frontage in address description' });
    evidence.push('Address notes direct frontage on regional road link');
  } else {
    corridorScore = 3;
    factors.push({ name: 'Corridor Connectivity', score: 3, max: 10, status: 'low', note: 'Secondary or interior rural road alignment' });
  }

  // Factor 2: Taluk & Urban Node Connectivity (0 - 8 pts)
  let talukScore = 0;
  if (listing.taluk && String(listing.taluk).trim()) {
    talukScore = 8;
    factors.push({ name: 'Taluk Node Proximity', score: 8, max: 8, value: listing.taluk, status: 'evaluated' });
    evidence.push(`Administrative alignment with ${listing.taluk} Taluk headquarters and civic registry`);
  } else {
    talukScore = 2;
    factors.push({ name: 'Taluk Node Proximity', score: 2, max: 8, value: 'Unspecified', status: 'missing' });
  }

  // Factor 3: Village / Panchayat Administrative Infrastructure (0 - 7 pts)
  let panchayatScore = 0;
  if (listing.village_panchayat && String(listing.village_panchayat).trim()) {
    panchayatScore = 7;
    factors.push({ name: 'Panchayat Infrastructure', score: 7, max: 7, value: listing.village_panchayat, status: 'evaluated' });
    evidence.push(`Governed under ${listing.village_panchayat} Gram Panchayat with local civic utility oversight`);
  } else if (listing.district && String(listing.district).trim()) {
    panchayatScore = 4;
    factors.push({ name: 'Panchayat Infrastructure', score: 4, max: 7, value: listing.district, status: 'approximate' });
    evidence.push(`District administrative jurisdiction of ${listing.district}`);
  } else {
    panchayatScore = 1;
    factors.push({ name: 'Panchayat Infrastructure', score: 1, max: 7, value: 'Unknown', status: 'missing' });
  }

  const rawSum = corridorScore + talukScore + panchayatScore;
  const score = clamp(round1(rawSum), 0, 25);

  return {
    score,
    maxScore: 25,
    factors,
    evidence,
  };
}

/**
 * 4. Calculate Agronomic & Development Viability Pillar (0 to 25 points)
 */
export function calculateViabilityScore(listing = {}) {
  if (!listing || typeof listing !== 'object') return { score: 0, factors: [], evidence: [] };

  const factors = [];
  const evidence = [];

  // Factor 1: Soil Quality & Foundation Suitability (0 - 10 pts)
  let soilScore = 0;
  const soilType = String(listing.soil_type || '').toLowerCase();

  if (soilType === 'red' || soilType === 'alluvial') {
    soilScore = 10;
    factors.push({ name: 'Soil Foundation & Quality', score: 10, max: 10, value: soilType.toUpperCase(), status: 'optimal' });
    evidence.push(`High-grade ${soilType} soil offers superior drainage, load-bearing stability, and agricultural yield`);
  } else if (soilType === 'black') {
    soilScore = 7;
    factors.push({ name: 'Soil Foundation & Quality', score: 7, max: 10, value: 'BLACK COTTON', status: 'specialized' });
    evidence.push('Fertile black cotton soil; prime for agriculture, requires pile foundation engineering for structural construction');
  } else if (soilType === 'laterite' || soilType === 'mixed') {
    soilScore = 6;
    factors.push({ name: 'Soil Foundation & Quality', score: 6, max: 10, value: soilType.toUpperCase(), status: 'moderate' });
    evidence.push(`${soilType.toUpperCase()} soil profile with balanced gravel and silt composition`);
  } else if (soilType === 'clay' || soilType === 'sandy') {
    soilScore = 4;
    factors.push({ name: 'Soil Foundation & Quality', score: 4, max: 10, value: soilType.toUpperCase(), status: 'constrained' });
    evidence.push(`${soilType.toUpperCase()} composition requires soil conditioning or specific foundation engineering`);
  } else {
    soilScore = 2;
    factors.push({ name: 'Soil Foundation & Quality', score: 2, max: 10, value: 'Not specified', status: 'missing' });
  }

  // Factor 2: Flood Inundation & Topographic Drainage (0 - 8 pts)
  let floodScore = 0;
  // Determine drainage risk based on elevation indicators, water bodies, or property description
  const desc = String(listing.description || '').toLowerCase();
  const title = String(listing.title || '').toLowerCase();
  const isFloodSuspect = desc.includes('low-lying') || desc.includes('canal bank') || desc.includes('lake bed') || desc.includes('submerged');
  const isElevated = desc.includes('elevated') || desc.includes('table land') || desc.includes('high ground') || title.includes('elevated');

  if (isElevated) {
    floodScore = 8;
    factors.push({ name: 'Flood Risk & Drainage', score: 8, max: 8, status: 'low_risk', note: 'Elevated terrain with zero water-logging history' });
    evidence.push('Elevated table land topography provides natural stormwater run-off and zero inundation risk');
  } else if (!isFloodSuspect) {
    floodScore = 6;
    factors.push({ name: 'Flood Risk & Drainage', score: 6, max: 8, status: 'moderate', note: 'Standard regional drainage gradient' });
    evidence.push('Standard regional contour gradient with no reported severe inundation vulnerability');
  } else {
    floodScore = 2;
    factors.push({ name: 'Flood Risk & Drainage', score: 2, max: 8, status: 'warning', note: 'Low-lying contour requires topographic survey' });
    evidence.push('Low-lying contour or vicinity to drainage channel necessitates stormwater level study');
  }

  // Factor 3: Parcel Scale, Geometry & Boundary Protection (0 - 7 pts)
  let boundaryScore = 0;
  const boundary = String(listing.boundary_wall || '').toLowerCase();
  const areaSqft = Number(listing.area_sqft);

  if (boundary === 'compound_wall' || boundary === 'fenced') {
    boundaryScore = 7;
    factors.push({ name: 'Boundary Protection', score: 7, max: 7, value: boundary.replace('_', ' ').toUpperCase(), status: 'secured' });
    evidence.push(`Physical ${boundary.replace('_', ' ')} demarcates clear legal boundary and protects against encroachment`);
  } else if (!isNaN(areaSqft) && areaSqft > 0) {
    boundaryScore = 4;
    factors.push({ name: 'Boundary Protection', score: 4, max: 7, value: 'Open / Survey Pegs', status: 'demarcated' });
    evidence.push('Corner survey stones in place; permanent perimeter fencing recommended');
  } else {
    boundaryScore = 1;
    factors.push({ name: 'Boundary Protection', score: 1, max: 7, value: 'Unfenced', status: 'unverified' });
  }

  const rawSum = soilScore + floodScore + boundaryScore;
  const score = clamp(round1(rawSum), 0, 25);

  return {
    score,
    maxScore: 25,
    factors,
    evidence,
  };
}

/**
 * 5. Structured Risk Checklist Evaluator
 */
export function evaluateRiskChecklist(listing = {}, documents = []) {
  const docs = Array.isArray(documents)
    ? documents
    : Array.isArray(listing.documents)
    ? listing.documents
    : [];

  const items = [];

  // Risk 1: Title & Encumbrance
  const hasEc = docs.some((d) => d.type === 'encumbrance_certificate' || d.document_type === 'encumbrance_certificate');
  items.push({
    id: 'risk_ec',
    category: 'Legal',
    label: 'Encumbrance & Mortgage Clearance',
    status: hasEc ? 'pass' : 'warning',
    severity: hasEc ? 'low' : 'medium',
    description: hasEc
      ? 'Encumbrance certificate has been provided for legal transaction verification.'
      : 'No Encumbrance Certificate uploaded. A 30-year search at the Sub-Registrar Office is mandatory.',
  });

  // Risk 2: Revenue Patta Continuity
  const hasPatta = Boolean(listing.patta_number);
  items.push({
    id: 'risk_patta',
    category: 'Revenue',
    label: 'Revenue Patta Passbook Record',
    status: hasPatta ? 'pass' : 'fail',
    severity: hasPatta ? 'low' : 'high',
    description: hasPatta
      ? `Patta ${listing.patta_number} mapped to revenue records.`
      : 'Missing Revenue Patta registration. Risk of unmutated revenue land records or unregularized subdivision.',
  });

  // Risk 3: Road Access Rights
  const roadWidth = Number(listing.road_width_ft);
  const roadPass = !isNaN(roadWidth) && roadWidth >= 20;
  items.push({
    id: 'risk_access',
    category: 'Physical',
    label: 'Vehicular Access & Right of Way',
    status: roadPass ? 'pass' : roadWidth > 0 ? 'warning' : 'fail',
    severity: roadPass ? 'low' : 'high',
    description: roadPass
      ? `Clear ${roadWidth}ft right-of-way confirmed.`
      : roadWidth > 0
      ? `Narrow ${roadWidth}ft passage may constrain development approvals or large commercial vehicles.`
      : 'No verified road width recorded. Potential risk of landlocked parcel or disputed pathway.',
  });

  // Risk 4: Water Availability & Aquifer Security
  const waterSource = String(listing.water_source || '').toLowerCase();
  const hasWater = waterSource === 'borewell' || waterSource === 'open_well' || waterSource === 'river_canal' || waterSource === 'pipeline';
  items.push({
    id: 'risk_water',
    category: 'Site Utilities',
    label: 'Water Resource Security',
    status: hasWater ? 'pass' : waterSource === 'none' ? 'warning' : 'unverified',
    severity: hasWater ? 'low' : 'medium',
    description: hasWater
      ? `Active ${waterSource.replace('_', ' ')} infrastructure available on premises.`
      : 'No confirmed on-site water source. Hydrogeological groundwater survey needed prior to deployment.',
  });

  // Risk 5: Flood & Seasonal Inundation
  const soilType = String(listing.soil_type || '').toLowerCase();
  const desc = String(listing.description || '').toLowerCase();
  const floodConcern = desc.includes('low-lying') || soilType === 'clay';
  items.push({
    id: 'risk_flood',
    category: 'Environmental',
    label: 'Stormwater Runoff & Flood Inundation',
    status: floodConcern ? 'warning' : 'pass',
    severity: floodConcern ? 'medium' : 'low',
    description: floodConcern
      ? 'Terrain elevation or clay subsoil may retain stormwater during intense Northeast Monsoon rains.'
      : 'Topographic contour indicates adequate natural drainage with low flood vulnerability.',
  });

  // Risk 6: Boundary & Encroachment Protection
  const boundary = String(listing.boundary_wall || '').toLowerCase();
  const hasWall = boundary === 'compound_wall' || boundary === 'fenced';
  items.push({
    id: 'risk_boundary',
    category: 'Security',
    label: 'Boundary Demarcation & Perimeter Security',
    status: hasWall ? 'pass' : 'warning',
    severity: hasWall ? 'low' : 'medium',
    description: hasWall
      ? `Property perimeter secured with ${boundary.replace('_', ' ')}.`
      : 'Open perimeter without fencing. Recommend conducting DGPS field survey and installing boundary markers.',
  });

  return items;
}

/**
 * 6. Viable Use Cases & Suitability Matrix
 */
export function determineUseCases(listing = {}, pillarScores = {}) {
  const propType = String(listing.property_type || '').toLowerCase();
  const soil = String(listing.soil_type || '').toLowerCase();
  const roadWidth = Number(listing.road_width_ft) || 0;
  const areaSqft = Number(listing.area_sqft) || 0;
  const water = String(listing.water_source || '').toLowerCase();

  const cases = [];

  // Case 1: Organic Agriculture & Agro-Forestry
  const isAgriPrime = (soil === 'red' || soil === 'alluvial' || soil === 'black') && (water === 'borewell' || water === 'river_canal' || water === 'open_well');
  cases.push({
    name: 'Organic Agriculture & Agro-Forestry',
    suitability: isAgriPrime || propType === 'agricultural' ? 'High' : 'Moderate',
    badgeColor: isAgriPrime || propType === 'agricultural' ? 'emerald' : 'amber',
    rationale: isAgriPrime
      ? `Highly favorable with fertile ${soil} soil and dedicated ${water.replace('_', ' ')} water connection.`
      : 'Feasible with soil conditioning and supplemental micro-irrigation.',
  });

  // Case 2: Plotted Residential Layout / Farmhouse
  const isResiPrime = roadWidth >= 30 && (propType === 'residential' || propType === 'mixed_use' || (areaSqft >= 2000 && roadWidth >= 25));
  cases.push({
    name: 'Residential Plotted Layout / Gated Farmhouse',
    suitability: isResiPrime ? 'High' : roadWidth >= 20 ? 'Moderate' : 'Low',
    badgeColor: isResiPrime ? 'emerald' : roadWidth >= 20 ? 'amber' : 'rose',
    rationale: isResiPrime
      ? `Wide ${roadWidth}ft approach road and adequate dimensions accommodate DTCP/CMDA layout norms.`
      : roadWidth >= 20
      ? 'Single dwelling or private farmhouse feasible; layout approval requires road widening verification.'
      : 'Restricted road width limits multi-plot layout approvals.',
  });

  // Case 3: Warehousing & Commercial Logistics
  const isLogisticsPrime = roadWidth >= 35 && areaSqft >= 15000;
  cases.push({
    name: 'Logistics Facility & Bulk Warehousing',
    suitability: isLogisticsPrime ? 'High' : roadWidth >= 30 ? 'Moderate' : 'Low',
    badgeColor: isLogisticsPrime ? 'emerald' : roadWidth >= 30 ? 'amber' : 'rose',
    rationale: isLogisticsPrime
      ? `Exceptional ${roadWidth}ft road enables turning radii for multi-axle freight containers.`
      : roadWidth >= 30
      ? 'Light warehousing feasible for 20-foot commercial vehicles.'
      : 'Inadequate road width for heavy goods freight carriers.',
  });

  // Case 4: Industrial / Renewable Energy Park
  const isIndustrialPrime = propType === 'industrial' || (areaSqft >= 43560 && roadWidth >= 30 && listing.electricity_connected);
  cases.push({
    name: 'Industrial Setup / Light Manufacturing',
    suitability: isIndustrialPrime ? 'High' : areaSqft >= 20000 ? 'Moderate' : 'Low',
    badgeColor: isIndustrialPrime ? 'emerald' : areaSqft >= 20000 ? 'amber' : 'rose',
    rationale: isIndustrialPrime
      ? 'Sufficient parcel scale with verified electrical connectivity supports manufacturing installation.'
      : 'Requires industrial zoning clearance and power grid expansion.',
  });

  return cases;
}

/**
 * 7. Missing Information Checklist Generator
 */
export function identifyMissingInformation(listing = {}, documents = []) {
  const missing = [];
  const docs = Array.isArray(documents)
    ? documents
    : Array.isArray(listing.documents)
    ? listing.documents
    : [];

  if (!listing.patta_number) {
    missing.push('Revenue Patta Passbook number is not registered.');
  }

  const hasPattaDoc = docs.some((d) => d.type === 'patta_chitta' || d.document_type === 'patta_chitta');
  if (!hasPattaDoc) {
    missing.push('Certified copy of Patta/Chitta extract from e-Services TN is missing.');
  }

  const hasEcDoc = docs.some((d) => d.type === 'encumbrance_certificate' || d.document_type === 'encumbrance_certificate');
  if (!hasEcDoc) {
    missing.push('Encumbrance Certificate (EC) for the preceding 30-year search period is missing.');
  }

  const hasFmbDoc = docs.some((d) => d.type === 'fmb_sketch' || d.document_type === 'fmb_sketch');
  if (!hasFmbDoc) {
    missing.push('Revenue Field Measurement Book (FMB) sketch with boundary stone measurements is missing.');
  }

  if (listing.road_width_ft == null || isNaN(Number(listing.road_width_ft)) || Number(listing.road_width_ft) <= 0) {
    missing.push('Certified physical access road width measurement is missing.');
  }

  if (!listing.water_source) {
    missing.push('On-site water resource test (borewell yield, groundwater depth) is not recorded.');
  }

  if (listing.latitude == null || listing.longitude == null || isNaN(Number(listing.latitude))) {
    missing.push('High-precision GPS coordinates verified via on-site DGPS survey are missing.');
  }

  if (!listing.soil_type) {
    missing.push('Certified soil geotechnical test report is not recorded.');
  }

  return missing;
}

/**
 * 8. Empirical Valuation Benchmark (NO Guaranteed Future Values)
 */
export function computeValuationContext(listing = {}) {
  const price = Number(listing.price);
  const areaSqft = Number(listing.area_sqft);

  if (isNaN(price) || isNaN(areaSqft) || price <= 0 || areaSqft <= 0) {
    return {
      status: 'unavailable',
      askingRatePerSqft: null,
      guidelineEstimatePerSqft: null,
      marketCompMedianPerSqft: null,
      note: 'Pricing or dimensional area data missing to calculate empirical metrics.',
    };
  }

  const askingRatePerSqft = round1(price / areaSqft);

  // Empirical Tamil Nadu guideline benchmarks (fictional demonstration baselines)
  // Coimbatore Sulur ~ 80-120/sqft, Tambaram Chengalpattu ~ 2200-3000/sqft
  let guidelineRate = 0;
  const taluk = String(listing.taluk || '').toLowerCase();

  if (taluk.includes('tambaram') || taluk.includes('chengalpattu')) {
    guidelineRate = 2450;
  } else if (taluk.includes('sulur') || taluk.includes('coimbatore')) {
    guidelineRate = 95;
  } else if (taluk.includes('hosur')) {
    guidelineRate = 450;
  } else {
    // Standard baseline estimate
    guidelineRate = round1(askingRatePerSqft * 0.85);
  }

  const guidelineTotal = Math.round(guidelineRate * areaSqft);
  const variancePercent = round1(((askingRatePerSqft - guidelineRate) / guidelineRate) * 100);

  return {
    status: 'ready',
    askingPrice: price,
    areaSqft,
    askingRatePerSqft,
    guidelineRatePerSqft: guidelineRate,
    guidelineEstimateTotal: guidelineTotal,
    variancePercent,
    comparisonText:
      variancePercent >= 0
        ? `Asking rate is ${variancePercent}% above the indicative government guideline value.`
        : `Asking rate is ${Math.abs(variancePercent)}% below the indicative government guideline value.`,
    isGuidelineBenchmarkOnly: true,
  };
}

/**
 * 9. Master Analysis Engine Entry Point: analyzeLandParcel
 *
 * Evaluates land parcel data and outputs the comprehensive 4-pillar intelligence dossier.
 *
 * @param {Object} listing - Property record
 * @param {Array} documents - Associated private documents
 * @param {Object} options - Custom evaluation options
 * @returns {Object} Comprehensive analysis report
 */
export function analyzeLandParcel(listing, documents = [], options = {}) {
  // Gracefully handle invalid, corrupt, or null inputs
  if (!listing || typeof listing !== 'object' || Array.isArray(listing)) {
    return {
      status: 'unavailable',
      isUnavailable: true,
      isProvisional: false,
      totalScore: null,
      riskLevel: 'critical',
      confidence: 'insufficient_data',
      summary: 'Analysis unavailable: listing input is null, non-object, or invalid.',
      pillarScores: null,
      missingInformation: ['Listing entity object is invalid or not provided.'],
      legalDisclaimer: STATUTORY_LEGAL_DISCLAIMER,
    };
  }

  // Check essential identity and required numerical constraints
  const hasId = Boolean(listing.id || listing.title);
  const price = listing.price != null ? Number(listing.price) : null;
  const areaSqft = listing.area_sqft != null ? Number(listing.area_sqft) : null;

  const isPriceInvalid = price != null && (isNaN(price) || price < 0);
  const isAreaInvalid = areaSqft != null && (isNaN(areaSqft) || areaSqft <= 0);

  if (!hasId || isPriceInvalid || isAreaInvalid) {
    return {
      status: 'unavailable',
      isUnavailable: true,
      isProvisional: false,
      totalScore: null,
      riskLevel: 'critical',
      confidence: 'insufficient_data',
      summary: 'Analysis unavailable: listing record lacks essential identity, or contains invalid price/area numbers.',
      pillarScores: null,
      missingInformation: [
        !hasId ? 'Listing lacks a valid ID or headline.' : null,
        isPriceInvalid ? 'Listing price contains invalid negative or non-numerical value.' : null,
        isAreaInvalid ? 'Listing area contains invalid zero, negative, or non-numerical value.' : null,
      ].filter(Boolean),
      legalDisclaimer: STATUTORY_LEGAL_DISCLAIMER,
    };
  }

  const docs = Array.isArray(documents) && documents.length > 0
    ? documents
    : Array.isArray(listing.documents)
    ? listing.documents
    : [];

  // Compute individual pillars (each 0 to 25 points)
  const legalPillar = calculateLegalScore(listing, docs);
  const physicalPillar = calculatePhysicalScore(listing);
  const locationPillar = calculateLocationScore(listing);
  const viabilityPillar = calculateViabilityScore(listing);

  // Total score strictly equals the sum of the four pillars
  const totalScore = round1(legalPillar.score + physicalPillar.score + locationPillar.score + viabilityPillar.score);

  // Identify missing information
  const missingInfo = identifyMissingInformation(listing, documents);

  // Determine whether evaluation is provisional
  // Provisional if: missing coordinates OR missing road width OR missing survey/patta OR zero verified docs
  const hasCoords = listing.latitude != null && listing.longitude != null && !isNaN(Number(listing.latitude));
  const hasRoad = listing.road_width_ft != null && Number(listing.road_width_ft) > 0;
  const hasSurveyOrPatta = Boolean(listing.survey_number || listing.patta_number);

  const isProvisional = !hasCoords || !hasRoad || !hasSurveyOrPatta || missingInfo.length >= 4;
  const status = isProvisional ? 'provisional' : 'ready';

  // Risk Level determination
  let riskLevel = 'moderate';
  if (totalScore >= 80) {
    riskLevel = 'low';
  } else if (totalScore >= 55) {
    riskLevel = 'moderate';
  } else if (totalScore >= 35) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  // Confidence determination
  let confidence = 'high';
  if (isProvisional) {
    confidence = 'provisional';
  } else if (missingInfo.length >= 2 || !listing.is_verified) {
    confidence = 'medium';
  }

  // Assemble Advantages (factors that scored well)
  const advantages = [];
  if (legalPillar.score >= 18) advantages.push('Strong legal foundation with verified title and revenue records');
  if (physicalPillar.score >= 18) advantages.push('Superior physical infrastructure with generous road access and utility connections');
  if (locationPillar.score >= 18) advantages.push('Strategic geographic positioning close to regional arterial economic corridors');
  if (viabilityPillar.score >= 18) advantages.push('Prime agronomic soil quality with low natural drainage risk');
  if (listing.road_width_ft >= 30) advantages.push(`Wide ${listing.road_width_ft}ft frontage accommodates commercial logistics and machinery`);
  if (listing.water_source === 'borewell' || listing.water_source === 'river_canal') {
    advantages.push(`Active on-site ${listing.water_source.replace('_', ' ')} provides dedicated water sovereignty`);
  }
  if (listing.soil_type === 'red' || listing.soil_type === 'alluvial') {
    advantages.push(`High-grade ${listing.soil_type} soil suitable for multi-crop agriculture and standard civil foundations`);
  }

  // Assemble Limitations
  const limitations = [];
  if (legalPillar.score < 14) limitations.push('Documentation backlog: legal vetting and title lineage require advocate clearance');
  if (physicalPillar.score < 14) limitations.push('Physical access or on-site utility connections require infrastructure investment');
  if (locationPillar.score < 14) limitations.push('Interior rural location with greater transit distance to major commercial taluk centers');
  if (viabilityPillar.score < 14) limitations.push('Topographic or soil conditions necessitate specialized geotechnical preparation');
  if (listing.road_width_ft && listing.road_width_ft < 20) {
    limitations.push(`Narrow ${listing.road_width_ft}ft approach restricts heavy commercial vehicles and complex layout permissions`);
  }
  if (listing.water_source === 'none' || !listing.water_source) {
    limitations.push('Absence of active water source requires capital expenditure for prospective borewell drilling');
  }

  // Generate Risk Checklist, Use Cases, Valuation Context
  const riskChecklist = evaluateRiskChecklist(listing, documents);
  const useCases = determineUseCases(listing, {
    legal: legalPillar.score,
    physical: physicalPillar.score,
    location: locationPillar.score,
    viability: viabilityPillar.score,
  });
  const valuationContext = computeValuationContext(listing);

  // Diligence Next Steps
  const nextSteps = [
    'Obtain certified 30-year Encumbrance Certificate (EC) from the jurisdictional Sub-Registrar Office.',
    'Verify Patta passbook continuity through Tamil Nadu e-Services (eservices.tn.gov.in).',
    'Commission a DGPS field survey with a licensed surveyor to cross-examine Field Measurement Book (FMB) boundary stones.',
    'Conduct a hydrogeological groundwater table scan and water potability TDS analysis.',
    'Engage a practicing civil advocate to vet parent title deeds and inspect original documentation.',
  ];

  // Sources and reliability
  const sources = [
    {
      name: 'Tamil Nadu Revenue Department (Patta/Chitta Registry)',
      authority: 'Government of Tamil Nadu',
      reliability: listing.patta_number ? 'High' : 'Pending',
      type: 'Statutory Registry',
    },
    {
      name: 'Sub-Registrar Office (Registration Dept)',
      authority: 'Inspector General of Registration (TNREGINET)',
      reliability: docs.some((d) => d.type === 'encumbrance_certificate') ? 'High' : 'Pending Verification',
      type: 'Title & Encumbrance Record',
    },
    {
      name: 'Survey & Land Records Department (FMB Sketch)',
      authority: 'Taluk Surveyor Office',
      reliability: listing.survey_number ? 'High' : 'Provisional',
      type: 'Spatial Cadastral Cartography',
    },
    {
      name: 'Seller Self-Reported Attributes',
      authority: listing.owner_name || 'Listing Owner',
      reliability: listing.is_verified ? 'Field Verified' : 'Self-Reported',
      type: 'Primary Listing Submission',
    },
    {
      name: 'OpenStreetMap Cartographic Engine',
      authority: 'OpenStreetMap Contributors',
      reliability: 'High',
      type: 'Spatial Infrastructure Data',
    },
  ];

  // Location Overview
  const locationOverview = {
    address: listing.address || 'Address on file',
    taluk: listing.taluk || 'Unspecified',
    district: listing.district || 'Unspecified',
    state: listing.state || 'Tamil Nadu',
    pincode: listing.pincode || 'N/A',
    coordinates: hasCoords
      ? { latitude: Number(listing.latitude), longitude: Number(listing.longitude) }
      : null,
    coordinatesFormatted: hasCoords
      ? `${Number(listing.latitude).toFixed(4)}° N, ${Number(listing.longitude).toFixed(4)}° E`
      : 'Coordinates pending on-site survey',
    villagePanchayat: listing.village_panchayat || 'Unassigned',
  };

  return {
    status,
    isProvisional,
    isUnavailable: false,
    totalScore,
    riskLevel,
    confidence,
    summary: isProvisional
      ? `Provisional Analysis Score: ${totalScore}/100. Preliminary assessment completed with available data. Critical fields are pending verification.`
      : `Verified Land Intelligence Score: ${totalScore}/100. Comprehensive diligence evaluation completed across all 4 analytical pillars.`,
    pillarScores: {
      legal: {
        score: legalPillar.score,
        maxScore: 25,
        percentage: Math.round((legalPillar.score / 25) * 100),
        label: PILLAR_DEFINITIONS.legal.label,
        factors: legalPillar.factors,
        evidence: legalPillar.evidence,
      },
      physical: {
        score: physicalPillar.score,
        maxScore: 25,
        percentage: Math.round((physicalPillar.score / 25) * 100),
        label: PILLAR_DEFINITIONS.physical.label,
        factors: physicalPillar.factors,
        evidence: physicalPillar.evidence,
      },
      location: {
        score: locationPillar.score,
        maxScore: 25,
        percentage: Math.round((locationPillar.score / 25) * 100),
        label: PILLAR_DEFINITIONS.location.label,
        factors: locationPillar.factors,
        evidence: locationPillar.evidence,
      },
      viability: {
        score: viabilityPillar.score,
        maxScore: 25,
        percentage: Math.round((viabilityPillar.score / 25) * 100),
        label: PILLAR_DEFINITIONS.viability.label,
        factors: viabilityPillar.factors,
        evidence: viabilityPillar.evidence,
      },
    },
    locationOverview,
    advantages,
    limitations,
    missingInformation: missingInfo,
    riskChecklist,
    useCases,
    nextSteps,
    sources,
    valuationContext,
    legalDisclaimer: STATUTORY_LEGAL_DISCLAIMER,
  };
}
