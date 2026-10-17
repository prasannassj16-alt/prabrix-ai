/**
 * PRABRIX AI - Development & Future-Use Suggestions Service
 * Phase 8: Documents and development suggestions (sections 13 and 14 of PROJECT_SPEC.md)
 *
 * PURE BUSINESS LOGIC (No React dependencies):
 * Evaluates parcel parameters (property type, area, road width, water, soil, location)
 * to generate actionable future development suggestions with:
 * 1. Supporting physical and cadastral evidence.
 * 2. Critical unknowns and unverified factors.
 * 3. Required zoning and statutory Tamil Nadu permission checks (DTCP, CMDA, CLU Section 47-A, TNPCB, etc.).
 * 4. Statutory planning non-warranty disclaimer.
 */

export const STATUTORY_PLANNING_DISCLAIMER =
  'STATUTORY PLANNING & DEVELOPMENT DISCLAIMER: Development potential assessments are indicative automated spatial screenings based on reported parcel geometry, road access, and regional master plan classifications. PRABRIX AI does NOT provide guaranteed planning permissions, building sanctions, commercial yields, or investment warranties. All development projects require formal statutory sanction from the relevant Planning Authority (DTCP/CMDA/Local Body) and independent geotechnical and legal verification by a licensed civil engineer and registered architect.';

/**
 * Main Service Method: evaluateDevelopmentSuggestions
 *
 * @param {Object} listing - Land listing object
 * @returns {Object} Comprehensive development assessment with categorized suggestions
 */
export function evaluateDevelopmentSuggestions(listing) {
  if (!listing || !listing.id) {
    return {
      status: 'unavailable',
      parcelId: null,
      suggestions: [],
      totalCount: 0,
      disclaimer: STATUTORY_PLANNING_DISCLAIMER,
      message: 'Invalid or missing listing data for development assessment.',
    };
  }

  const propType = String(listing.property_type || 'agricultural').toLowerCase();
  const areaSqft = Number(listing.area_sqft) || 0;
  const areaCents = Number(listing.area_cents) || Math.round((areaSqft / 435.6) * 10) / 10;
  const roadWidth = Number(listing.road_width_ft) || 0;
  const roadType = String(listing.road_type || 'unpaved').toLowerCase();
  const waterSource = String(listing.water_source || 'none').toLowerCase();
  const hasElectricity = Boolean(listing.electricity_connected);
  const soilType = String(listing.soil_type || 'unclassified').toLowerCase();
  const district = listing.district || 'Tamil Nadu';
  const taluk = listing.taluk || 'Local Taluk';
  const village = listing.village_panchayat || 'Local Panchayat';

  const suggestions = [];

  // 1. High-Density Agro-Cultivation & Polyhouse Farming
  if (propType === 'agricultural' || propType === 'mixed_use') {
    const isWaterAvailable = waterSource !== 'none';
    const isHighFeasibility = isWaterAvailable && (soilType === 'red' || soilType === 'alluvial');

    suggestions.push({
      id: 'sug-agro-cultivation',
      title: 'Precision Agro-Cultivation & High-Value Horticultural Polyhouse',
      category: 'agriculture',
      categoryLabel: 'Agriculture & Horticulture',
      feasibility: isHighFeasibility ? 'high' : 'conditional',
      feasibilityLabel: isHighFeasibility ? 'High Feasibility' : 'Conditional Feasibility',
      summary: `Natural suitability for high-yield perennial cash crops, protected vegetable polyhouse, or organic plantation.`,
      supportingEvidence: [
        `Soil classification (${soilType}) provides high mineral aeration and root percolation`,
        `On-site water source (${waterSource.replace('_', ' ')}) supports continuous drip and micro-sprinkler irrigation`,
        `Vehicular road frontage of ${roadWidth} ft (${roadType}) accommodates tractors and post-harvest produce transit`,
        hasElectricity
          ? 'Active TNEB agricultural electrical connection in place on the parcel'
          : 'Proximity to rural electrical distribution network in ' + village,
      ],
      unknowns: [
        'Groundwater yield, recharge drawdown, and static water level in peak summer (May–June) unverified',
        'Official agricultural soil nutrient assay (pH, Electrical Conductivity, organic carbon) not conducted',
        'Eligibility for National Horticulture Mission (NHM) and TN State micro-irrigation capital subsidies unconfirmed',
      ],
      requiredPermissions: [
        {
          authority: 'TNAU / Krishi Vigyan Kendra (KVK)',
          requirement: 'Soil and irrigation water salinity / sodium hazard suitability testing',
          mandatory: true,
        },
        {
          authority: 'TANGEDCO (Tamil Nadu Electricity Board)',
          requirement: 'Agricultural tariff sanction name transfer or load energization verification',
          mandatory: true,
        },
        {
          authority: 'Tamil Nadu Ground Water Authority',
          requirement: 'Registration of commercial or agricultural borewell under TN Ground Water Act',
          mandatory: false,
        },
        {
          authority: 'Local Village Panchayat',
          requirement: 'Building permit for farm equipment storage shed or post-harvest drying yard',
          mandatory: false,
        },
      ],
    });
  }

  // 2. Agritourism, Farmstay & Eco-Wellness Retreat
  if (areaSqft >= 20000 && roadWidth >= 15) {
    const isHigh = roadWidth >= 25 && areaSqft >= 40000;
    suggestions.push({
      id: 'sug-eco-farmstay',
      title: 'Agritourism, Nature Farmstay & Eco-Wellness Retreat',
      category: 'hospitality',
      categoryLabel: 'Hospitality & Eco-Tourism',
      feasibility: isHigh ? 'high' : 'conditional',
      feasibilityLabel: isHigh ? 'High Feasibility' : 'Conditional Feasibility',
      summary: `Large-format parcel suited for low-density agro-hospitality cottages, organic dining experience, and nature retreats.`,
      supportingEvidence: [
        `Expansive site area of ${areaCents} cents (${areaSqft.toLocaleString('en-IN')} sq.ft.) enables low ground coverage and landscaped recreational buffers`,
        `Access road width of ${roadWidth} ft satisfies hospitality passenger vehicular access standards`,
        `Peaceful rural agrarian setting in ${taluk} taluk offering tranquil natural surroundings`,
      ],
      unknowns: [
        'Local Gram Panchayat building height and total plinth area regulations for hospitality structures unverified',
        'Commercial TNEB electricity tariff requirement and dedicated distribution transformer cost unknown',
        'Potable water filtration feasibility and seasonal aquifer sustainability unverified',
      ],
      requiredPermissions: [
        {
          authority: 'Directorate of Town and Country Planning (DTCP)',
          requirement: 'Planning permission under Tamil Nadu Combined Development and Building Rules (TNCDBR 2019)',
          mandatory: true,
        },
        {
          authority: 'District Collector / Revenue Divisional Officer (RDO)',
          requirement: 'Change of Land Use (CLU) Conversion under Section 47-A of TN TCP Act, 1971 for built resort structures',
          mandatory: true,
        },
        {
          authority: 'Tamil Nadu Tourism Department',
          requirement: 'Registration under Tamil Nadu Bed & Breakfast / Eco-Farmstay certification scheme',
          mandatory: false,
        },
        {
          authority: 'Tamil Nadu Fire and Rescue Services',
          requirement: 'Fire safety No Objection Certificate (NOC) for guest accommodation units',
          mandatory: true,
        },
        {
          authority: 'Department of Public Health & FSSAI',
          requirement: 'Sanitary certificate and commercial food preparation license',
          mandatory: true,
        },
      ],
    });
  }

  // 3. Logistics, Cold Storage & Agro-Warehousing Hub
  if (roadWidth >= 25 && areaSqft >= 20000) {
    const isHigh = roadWidth >= 30 && areaSqft >= 35000;
    suggestions.push({
      id: 'sug-logistics-warehouse',
      title: 'Highway Logistics, Multi-Modal Warehousing & Cold Chain Storage',
      category: 'industrial',
      categoryLabel: 'Logistics & Warehousing',
      feasibility: isHigh ? 'high' : 'conditional',
      feasibilityLabel: isHigh ? 'High Feasibility' : 'Conditional Feasibility',
      summary: `Commercial transport-grade road access enables freight movements, container storage, and agro-processing logistics.`,
      supportingEvidence: [
        `Direct vehicular access road width of ${roadWidth} ft (${roadType}) meets two-way freight ingress standards`,
        `Large parcel footprint (${areaSqft.toLocaleString('en-IN')} sq.ft.) accommodates heavy vehicle turning radiuses, dock levelers, and parking apron`,
        `Favorable transport positioning within the ${district} regional commercial logistics corridor`,
      ],
      unknowns: [
        'Geotechnical Safe Bearing Capacity (SBC) test report for heavy structural industrial flooring unavailable',
        'State Highways or District Road department axle-load restrictions on the approach corridor unconfirmed',
        'High Flood Level (HFL) and master-plan stormwater drainage outlet alignment unverified',
      ],
      requiredPermissions: [
        {
          authority: 'DTCP / Regional Planning Authority',
          requirement: 'Commercial / Industrial Warehouse Layout & Building Permission approval',
          mandatory: true,
        },
        {
          authority: 'District Collector / Revenue Department',
          requirement: 'Section 47-A CLU Conversion from agricultural to non-agricultural industrial/commercial use',
          mandatory: true,
        },
        {
          authority: 'Tamil Nadu Pollution Control Board (TNPCB)',
          requirement: 'Consent to Establish (CTE) & Operate (CTO) under Water and Air Acts (Green Category)',
          mandatory: true,
        },
        {
          authority: 'TANGEDCO',
          requirement: 'High-Tension (HT) or High-Capacity Low-Tension commercial industrial power load sanction',
          mandatory: true,
        },
        {
          authority: 'Tamil Nadu Fire & Rescue Services',
          requirement: 'Comprehensive industrial fire hydrant, water reservoir, and emergency egress NOC',
          mandatory: true,
        },
      ],
    });
  }

  // 4. DTCP Plotted Residential Layout / Gated Enclave
  if (propType === 'residential' || (roadWidth >= 20 && areaSqft >= 15000)) {
    const isHigh = propType === 'residential' || roadWidth >= 30;
    suggestions.push({
      id: 'sug-residential-plotted',
      title: 'DTCP / Local Body Approved Plotted Residential Enclave',
      category: 'residential',
      categoryLabel: 'Residential Development',
      feasibility: isHigh ? 'high' : 'conditional',
      feasibilityLabel: isHigh ? 'High Feasibility' : 'Conditional Feasibility',
      summary: `Sub-divisible parcel dimensions suitable for regulated villa plot layout with internal blacktop roads.`,
      supportingEvidence: [
        `Approach road width of ${roadWidth} ft meets or exceeds statutory 23–30 ft layout entrance criteria`,
        `Geometrical shape permits standard 30ft / 24ft internal scheme roads and 10% Open Space Reservation (OSR) dedication`,
        `Cadastral integration with ${village} / ${taluk} residential master plan growth cluster`,
      ],
      unknowns: [
        'Open Space Reservation (OSR) 10% land handover feasibility and gift deed compliance unverified',
        'Piped municipal potable water supply integration timeline and panchayat underground drainage availability unknown',
        'Local water body proximity (Odai / Lake catchment 15m–50m buffer) clearance pending surveyor inspection',
      ],
      requiredPermissions: [
        {
          authority: 'Directorate of Town and Country Planning (DTCP) / CMDA',
          requirement: 'Layout Planning Approval under Tamil Nadu Combined Development and Building Rules (TNCDBR 2019)',
          mandatory: true,
        },
        {
          authority: 'Tamil Nadu Real Estate Regulatory Authority (TNRERA)',
          requirement: 'Mandatory RERA project registration prior to plot marketing, advertising, or booking',
          mandatory: true,
        },
        {
          authority: 'Public Works Department (PWD) / Water Resources Organization',
          requirement: 'Inundation and waterbody proximity clearance certificate (buffer zone compliance)',
          mandatory: true,
        },
        {
          authority: 'Local Village Panchayat / Municipal Council',
          requirement: 'Final approval resolution and execution of public gift deed for internal roads and OSR parks',
          mandatory: true,
        },
      ],
    });
  }

  // 5. Clean Renewable Solar Photovoltaic Farm
  if (areaSqft >= 35000) {
    const isHigh = areaSqft >= 43560 && hasElectricity;
    suggestions.push({
      id: 'sug-solar-park',
      title: 'Clean Renewable Ground-Mounted Solar PV Park (100–300 kW)',
      category: 'energy',
      categoryLabel: 'Renewable Energy',
      feasibility: isHigh ? 'high' : 'conditional',
      feasibilityLabel: isHigh ? 'High Feasibility' : 'Conditional Feasibility',
      summary: `Contiguous land extent with unobstructed horizontal solar exposure suitable for commercial captive solar generation.`,
      supportingEvidence: [
        `Ample continuous parcel footprint (${areaCents} cents) accommodates ground-mounted solar tracker arrays`,
        `Favorable solar irradiance zone in ${district} with high mean sunshine hours annually`,
        hasElectricity
          ? 'On-site electrical grid line simplifies initial balance-of-plant interconnection'
          : 'Rural distribution line runs adjacent to the property corridor',
      ],
      unknowns: [
        'Local TANGEDCO 11kV/22kV distribution feeder capacity and reverse power flow clearance unconfirmed',
        'Seasonal dust deposition and module washing water requirements over the project lifecycle unverified',
        'Dedicated high-tension grid evacuation line distance and right-of-way (RoW) easements unmapped',
      ],
      requiredPermissions: [
        {
          authority: 'Tamil Nadu Energy Development Agency (TEDA)',
          requirement: 'Solar energy project registration and technical grid integration appraisal',
          mandatory: true,
        },
        {
          authority: 'TANGEDCO / TANTRANSCO',
          requirement: 'Grid interconnection feasibility study and Net Metering / Gross Metering sanction',
          mandatory: true,
        },
        {
          authority: 'Chief Electrical Inspector to Government (CEIG)',
          requirement: 'Statutory electrical installation inspection and plant energization safety certificate',
          mandatory: true,
        },
        {
          authority: 'Revenue Department',
          requirement: 'Non-agricultural commercial utility land-use clearance',
          mandatory: true,
        },
      ],
    });
  }

  return {
    status: 'evaluated',
    parcelId: listing.id,
    propertyTitle: listing.title,
    propertyType: propType,
    district,
    taluk,
    areaSqft,
    areaCents,
    roadWidth,
    totalCount: suggestions.length,
    suggestions,
    disclaimer: STATUTORY_PLANNING_DISCLAIMER,
  };
}
