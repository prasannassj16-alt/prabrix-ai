# PRABRIX AI - Land Analysis & Feasibility Engine Documentation
**Module:** `src/services/landAnalysisEngine.js` & `src/components/analysis/AnalysisReportPage.jsx`  
**Phase:** Phase 6 (section 10 of PROJECT_SPEC.md)  
**Target Geography:** Tamil Nadu, India  

---

## 1. Architectural Principles & Zero React Dependency
The PRABRIX AI Analysis Engine is architected as a **pure ES module** (`landAnalysisEngine.js`) that runs with zero React or DOM dependencies. It executes deterministically in Node.js, Vitest, backend microservices, or client-side SPAs.

### Core Mathematical Constraints:
1. **4 Analytical Pillars (0 to 25 points each)**:
   - $P_1$: Legal & Document Diligence ($0 \le P_1 \le 25$)
   - $P_2$: Physical & Site Feasibility ($0 \le P_2 \le 25$)
   - $P_3$: Location & Connectivity Intelligence ($0 \le P_3 \le 25$)
   - $P_4$: Agronomic & Development Viability ($0 \le P_4 \le 25$)
2. **Strict Sum Equality**:
   $$\text{Total Score} = P_1 + P_2 + P_3 + P_4 \quad (0 \le \text{Total} \le 100)$$
   Exact floating-point stability is maintained by precision rounding to 1 decimal place:
   $$\text{totalScore} = \text{round}_1(P_1 + P_2 + P_3 + P_4)$$
3. **Provisional / Unavailable States**:
   - If critical identifier or dimensional numbers are missing or invalid (null object, negative price, zero area), the engine safely returns `status: 'unavailable'` with `totalScore: null`.
   - If coordinates, road width, or survey/patta records are missing or unverified, the engine outputs `status: 'provisional'` (`isProvisional: true`), an explicit warning banner, and enumerates every missing item in `missingInformation`.
4. **Strict Compliance: No Guaranteed Future Values**:
   - In adherence to Rule 3 and Section 10 specification, the engine never projects future speculative appreciation, ROI promises, or price escalation guarantees.
   - All valuation metrics are retrospective empirical guideline benchmarks comparing asking rate with Tamil Nadu government guideline values.

---

## 2. Granular Four-Pillar Mathematical Formulations

### Pillar 1: Legal & Document Diligence ($0 - 25$ pts)
Evaluates statutory ownership, revenue department mutation, and legal title continuity:
- **Patta & Chitta Status (0 - 8 pts)**:
  - Verified Patta/Chitta document attached: $+8$ pts
  - Patta number provided (pending document vetting): $+5$ pts
  - No Patta number or document recorded: $+0$ pts
- **Title Deed & Ownership Flow (0 - 7 pts)**:
  - Registered parent title deed verified with clear lineage: $+7$ pts
  - Field-verified listing ownership: $+5$ pts
  - Sale deed uploaded, awaiting advocate vetting: $+4$ pts
  - Unverified title: $+1$ pt
- **Encumbrance Certificate (EC) (0 - 5 pts)**:
  - Nil Encumbrance Certificate verified (30-year search): $+5$ pts
  - EC submitted, pending legal clearance: $+3$ pts
  - No EC uploaded: $+0$ pts
- **Revenue Survey & FMB Sketch (0 - 5 pts)**:
  - Survey subdivision number and FMB/layout sketch verified: $+5$ pts
  - Valid survey subdivision number without sketch: $+3$ pts
  - No survey number: $+0$ pts

### Pillar 2: Physical & Site Feasibility ($0 - 25$ pts)
Evaluates physical site access, road surface quality, water availability, and electrical infrastructure:
- **Direct Vehicular Access Road Width (0 - 10 pts)**:
  - Width $\ge 40$ ft (heavy commercial/freight access): $+10$ pts
  - Width $30 - 39$ ft (standard multi-axle trucks and farm machinery): $+8$ pts
  - Width $20 - 29$ ft (two-way domestic and utility transport): $+6$ pts
  - Width $12 - 19$ ft (passenger vehicle and light tractor): $+4$ pts
  - Width $8 - 11$ ft (narrow pathway): $+2$ pts
  - Width $< 8$ ft or unknown: $+0$ pts
- **Road Surface Quality (0 - 5 pts)**:
  - Concrete or tar (blacktop) surfaced road: $+5$ pts
  - Gravel / metal road: $+3$ pts
  - Mud / dirt unpaved road: $+1$ pt
  - Unspecified / no road: $+0$ pts
- **Water Resource Infrastructure (0 - 5 pts)**:
  - Dedicated on-site borewell or river canal access: $+5$ pts
  - Open well or piped municipal utility: $+4$ pts
  - No on-site water source: $+1$ pt
  - Unverified: $+0$ pts
- **Electrical Grid Connectivity (0 - 5 pts)**:
  - Active energized power connection (3-phase agricultural/commercial): $+5$ pts
  - Power line not energized: $+1$ pt
  - Unspecified: $+0$ pts

### Pillar 3: Location & Connectivity Intelligence ($0 - 25$ pts)
Evaluates geospatial positioning, highway corridors, taluk administration, and local governance:
- **Highway & Arterial Economic Corridor Proximity (0 - 10 pts)**:
  - Verified WGS 84 GPS coordinates situated within designated growth corridor: $+9$ pts (max $+10$)
  - Arterial road frontage in property narrative: $+6$ pts
  - Interior rural alignment: $+3$ pts
- **Taluk Administrative Node Accessibility (0 - 8 pts)**:
  - Identified revenue taluk headquarters alignment: $+8$ pts
  - Unspecified: $+2$ pts
- **Gram Panchayat / Civic Infrastructure (0 - 7 pts)**:
  - Governed under identified Gram Panchayat: $+7$ pts
  - District administrative jurisdiction: $+4$ pts
  - Unassigned: $+1$ pt

### Pillar 4: Agronomic & Development Viability ($0 - 25$ pts)
Evaluates soil foundation bearing capacity, flood inundation risk, and boundary security:
- **Soil Classification & Bearing Capacity (0 - 10 pts)**:
  - Red soil / alluvial soil (superior drainage and structural versatility): $+10$ pts
  - Black cotton soil (fertile agriculture, pile foundation needed for construction): $+7$ pts
  - Laterite / mixed loam: $+6$ pts
  - Clay / sandy: $+4$ pts
  - Unspecified: $+2$ pts
- **Flood Inundation & Topographic Contour (0 - 8 pts)**:
  - Elevated table land topography with zero flood vulnerability: $+8$ pts
  - Standard regional contour gradient: $+6$ pts
  - Low-lying contour / canal bank proximity: $+2$ pts
- **Boundary Demarcation & Perimeter Security (0 - 7 pts)**:
  - Compound wall or chain-link fencing: $+7$ pts
  - Corner survey pegs / open parcel: $+4$ pts
  - Unfenced / undemarcated: $+1$ pt

---

## 3. Dossier Output Structure
The engine returns an immutable JSON-serializable assessment object:
- `status`: `'ready'` | `'provisional'` | `'unavailable'`
- `isProvisional`: `true` when critical parameters or documents are missing
- `totalScore`: Integer/float between 0 and 100
- `riskLevel`: `'low'` | `'moderate'` | `'high'` | `'critical'`
- `confidence`: `'high'` | `'medium'` | `'low'` | `'provisional'`
- `pillarScores`: Granular 4-pillar breakdown with factor scores and verified evidence strings
- `locationOverview`: Structured geospatial and administrative metadata
- `advantages`: Array of verified positive highlights
- `limitations`: Array of site bottlenecks and technical constraints
- `missingInformation`: Actionable checklist of missing survey records and private documents
- `riskChecklist`: 6-point statutory hazard audit (Title, Patta, Road Access, Water, Flood, Boundary)
- `useCases`: 4 development scenarios (Agriculture, Residential Plotted Layout, Warehousing Logistics, Industrial Setup) with suitability rating (`High`, `Moderate`, `Low`) and engineering rationale
- `nextSteps`: Sequence of due-diligence recommendations (SRO EC search, e-Services Patta check, DGPS survey, advocate title inspection)
- `sources`: Authoritative provenance registry (TN Revenue Department, TNREGINET, Taluk Surveyor, Seller Self-Reported, OSM Cartography)
- `valuationContext`: Comparison with indicative Tamil Nadu guideline value per sq.ft.
- `legalDisclaimer`: Mandatory statutory disclaimer

---

## 4. Statutory Non-Warranty Disclaimer
> *"PRABRIX AI provides retrospective diligence assessments, spatial benchmarks, and document verification tracking based on public government records, empirical comps, and seller-disclosed materials. PRABRIX AI DOES NOT provide guaranteed future values, projected capital appreciation, or speculative financial returns. Land acquisition decisions must be preceded by independent title search through a qualified advocate and formal DGPS field boundary survey."*
