# PRABRIX AI - Phase 8: Documents and Development Suggestions Documentation

This document describes the architectural implementation, access control rules, OCR analysis flow, and future-use development screening engine built according to **Sections 13 and 14 of `PROJECT_SPEC.md`**.

---

## 1. Architectural Overview

Phase 8 introduces two core intelligence modules to PRABRIX AI:

1. **Confidential Document Vault & OCR Analysis Engine (Section 13)**:
   - Protected cloud-vault storage for sensitive legal instruments (Patta/Chitta, Parent Deeds, Encumbrance Certificates, FMB sketches).
   - Strict role-based access control (RLS): Raw documents are accessible **only to the property owner, uploader, or platform admin**.
   - Buyers and public visitors can view legal verification status badges, but cannot download raw unredacted files without an explicit owner grant.
   - **Zero-Fabrication OCR Policy**: If no external OCR/Document AI API is configured (`VITE_OCR_API_KEY`), the system strictly displays an **unavailable state**. It **never invents or guesses extracted text**.
   - **Strict Data Separation**: Machine-extracted text is explicitly segregated from verified cadastral facts with side-by-side discrepancy alignment.

2. **Future-Use & Development Potential Analysis Panel (Section 14)**:
   - Automated spatial and regulatory screening engine evaluating parcel area, road frontage, water availability, power, soil classification, and regional master plans.
   - Proposes viable land utilization pathways (High-Density Agro-Cultivation, Agritourism, Logistics Warehousing, Plotted Residential Enclave, Solar Photovoltaic Farm).
   - For every suggestion, systematically articulates:
     1. **Supporting Evidence** (concrete physical facts).
     2. **Key Unknowns & Limitations** (unverified parameters requiring field diligence).
     3. **Required Statutory Permissions & Zoning Checks** (mandatory Tamil Nadu authorities: DTCP, CMDA, Section 47-A CLU, TNPCB, TANGEDCO).
   - Enforces a statutory planning non-warranty disclaimer.

---

## 2. Private Document Access Control Model

### 2.1 Role-Based Permissions Matrix

| User Role / Context | View Document Status | Download Raw File | Upload Documents | Run OCR Audit | Grant Buyer Access |
|---|:---:|:---:|:---:|:---:|:---:|
| **Anonymous Visitor** | Restricted Summary | No | No | No | No |
| **Prospective Buyer** | Restricted Summary | No (Unless Granted) | No | No | Can Request Access |
| **Buyer with Granted Access** | Full View | Yes | No | No | No |
| **Listing Owner (Seller)** | Full View | Yes | Yes | Yes | Yes |
| **Platform Administrator** | Full View | Yes | Yes | Yes | Yes |

### 2.2 Buyer Access Request Workflow
1. A prospective buyer views the property detail page. Private documents are displayed in a **Restricted Vault** section showing only verification status pills (*"Verified On File"*, *"Nil Encumbrance"*).
2. The buyer submits a formal **"Request Authorized Access for Legal Diligence"** form specifying the purpose (e.g., bank loan appraisal or legal vetting).
3. The request is recorded in `prabrix_demo_doc_access_grants`.
4. The landowner or admin reviews the request and grants access.
5. Once granted, the buyer's account gains full read/download access to the unredacted documents.

---

## 3. Document AI & OCR Analysis Pipeline (Section 13)

### 3.1 Zero-Fabrication Rule (Rule 3 Compliance)
When `VITE_OCR_API_KEY` is not present in `.env`:
- `isOcrConfigured()` returns `false`.
- `analyzeDocument()` strictly returns `status: 'unavailable'`.
- `extractedText` and `verifiedFacts` are `null`.
- The UI renders an amber alert:
  > **"Document AI / OCR extraction service is not configured. Automated text extraction and legal instrument parsing are currently unavailable."**
- The system displays a manual verification protocol (examining SRO physical seals, checking TN e-Services directly, obtaining fresh 30-year EC).

### 3.2 Strict Data Separation & Alignment Architecture
When OCR analysis is enabled (or verified in test fixtures):

```
+---------------------------------------------------------------------------------------------------+
|  1. MACHINE-EXTRACTED TEXT (UNVERIFIED OCR)   |  2. AUTHORITATIVE GROUND TRUTH (VERIFIED FACTS)   |
|  Source: Tesseract / Document AI Engine       |  Source: Tamil Nilam e-Services & SRO Registry    |
|  Status: Unverified OCR Output                |  Status: Official Verified Record                 |
|  Confidence: 94%                              |  Status: Authoritative Ground Truth               |
+-----------------------------------------------+---------------------------------------------------+
|  • Survey No: SF 204/1B                       |  • Survey No: SF 204/1B                           |
|  • Patta No: PT-8942                          |  • Patta No: PT-8942                              |
|  • Extracted Holder: RAMESH SUNDARAM          |  • Registered Owner: Ramesh Sundaram              |
|  • Extent: 1.00 Acre (100 Cents)              |  • Extent: 43,560 sq.ft. (100 Cents)              |
|  • Encumbrance: NIL / CLEAR TITLE             |  • Encumbrance: Clear Title (15-Yr SRO EC Nil)    |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  3. SIDE-BY-SIDE ALIGNMENT & DISCREPANCY AUDIT                                                    |
|  - Survey Number: Match (SF 204/1B == SF 204/1B)                                                  |
|  - Patta Number: Match (PT-8942 == PT-8942)                                                       |
|  - Title Holder: Match (Ramesh Sundaram == Ramesh Sundaram)                                       |
|  - Jurisdiction: Match (Kannampalayam, Sulur, Coimbatore)                                         |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Future-Use & Development Suggestions Engine (Section 14)

### 4.1 Evaluation Logic & Typologies
The pure business logic module [`src/services/developmentSuggestionService.js`](file:///c:/MAIN_PROJECT/src/services/developmentSuggestionService.js) evaluates parcel attributes:

1. **Precision Agro-Cultivation & High-Value Polyhouse**:
   - Evaluated for agricultural land with water source and road frontage $\ge 12$ ft.
   - Highlights soil aeration and drip irrigation suitability.
2. **Agritourism, Nature Farmstay & Eco-Wellness Retreat**:
   - Evaluated for parcels $\ge 20,000$ sq.ft. with road width $\ge 15$ ft in agrarian settings.
   - Highlights low-density ground coverage and guest ingress.
3. **Highway Logistics, Multi-Modal Warehousing & Cold Chain**:
   - Evaluated for parcels $\ge 20,000$ sq.ft. with road width $\ge 25$ ft (High Feasibility if $\ge 30$ ft).
   - Highlights multi-axle freight truck ingress, turning radiuses, and regional industrial corridors.
4. **DTCP Plotted Residential Layout / Gated Enclave**:
   - Evaluated for residential parcels or parcels with road frontage $\ge 20$ ft near settlement nodes.
   - Highlights statutory 24–30 ft layout entrance criteria and internal plotted geometry.
5. **Clean Renewable Ground-Mounted Solar PV Park**:
   - Evaluated for contiguous parcels $\ge 35,000$ sq.ft. (approx $\ge 0.8$ acre) with uninterrupted sun exposure.
   - Highlights flat topography and grid distribution line proximity.

### 4.2 Systematic Three-Pillar Breakdown per Suggestion
Each suggestion card presents:
1. **Supporting Evidence**: Physical, geometrical, and infrastructure facts favoring the use.
2. **Key Unknowns & Diligence**: Specific unverified factors (groundwater summer yield, soil bearing capacity, OSR surrender compliance, feeder capacity).
3. **Required Statutory Permissions**: Specific Tamil Nadu regulatory authorities and acts:
   - **DTCP / CMDA**: Planning permission under TNCDBR 2019.
   - **District Collector / RDO**: Change of Land Use (CLU) Conversion under Section 47-A of TN Town and Country Planning Act, 1971.
   - **TNPCB**: Consent to Establish (CTE) & Operate (CTO) under Water and Air Acts.
   - **TANGEDCO**: High-Tension (HT) or agricultural tariff power load sanctions.
   - **Tamil Nadu Fire & Rescue Services**: Fire safety and egress clearance.
   - **TNRERA**: Real Estate Regulatory Authority project registration before plot marketing.
   - **PWD / WRD**: Waterbody proximity and inundation buffer clearance.

---

## 5. Automated Test Coverage

Phase 8 introduces 3 dedicated Vitest suites comprising 26 automated unit and UI integration tests:

1. [`src/test/documentService.test.js`](file:///c:/MAIN_PROJECT/src/test/documentService.test.js) (13 tests):
   - Access control enforcement (owner vs admin vs unauthorized buyer vs visitor).
   - Document access grant lifecycle (request -> grant -> unlock).
   - Supported category validation and file format/size checks (rejects non-PDF, rejects $>10$ MB).
   - OCR unavailable state when `VITE_OCR_API_KEY` is missing (verifies zero text invention).
   - Strict separation of `extractedText` from `verifiedFacts` with side-by-side alignment.

2. [`src/test/developmentSuggestionService.test.js`](file:///c:/MAIN_PROJECT/src/test/developmentSuggestionService.test.js) (6 tests):
   - Pure evaluations across agricultural and residential parcels.
   - Verification that every suggestion includes supporting evidence, unknowns, and statutory checks.
   - Identification of statutory Tamil Nadu planning authorities (DTCP, Section 47-A CLU, TANGEDCO).
   - Statutory planning non-warranty disclaimer validation.
   - Graceful handling of null/corrupt listing inputs.

3. [`src/test/phase8UI.test.jsx`](file:///c:/MAIN_PROJECT/src/test/phase8UI.test.jsx) (7 tests):
   - `PrivateDocumentVault` rendering: restricted view with request form for buyers vs full vault for owners.
   - Document upload form and file selector.
   - OCR modal: explicit unavailable state banner and manual verification protocol when unconfigured.
   - `DevelopmentSuggestionsPanel` rendering: category filter pills, feasibility badges, 3-pillar breakdown, and planning disclaimer.

**Total Project Test Suite Status**: 17 test files, **183 tests passed (100% passing)**.
