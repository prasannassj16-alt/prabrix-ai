# PRABRIX AI - Deterministic Land Matching Engine Specification

**Document Version:** 1.0.0 (Phase 5: Matching)  
**Classification:** Technical Specification & Mathematical Formula  
**Target Region:** Tamil Nadu, India  

---

## 1. Core Architectural Principles

### 1.1 Strictly Deterministic (Pure Function)
The PRABRIX AI Matching Engine is a pure mathematical function:
$$\text{MatchScore}(\text{Requirement}, \text{Listing}) \in [0, 100]$$
Given identical input parameters, the output score, classification tier, and granular criteria breakdown are 100% reproducible and invariant. There are no stochastic simulations, black-box weights, random samplers, or undisclosed adjustments.

### 1.2 Absolute Prohibition of "Probability" Terminology
> [!IMPORTANT]
> **No Probability Claims:** The match score **is not a probability** and must never be represented or communicated as such. It does not measure the probability of closing a deal, the likelihood of sale, or buyer interest likelihood. It is strictly a **Deterministic Compatibility Index** (or **Match Score** out of 100) quantifying how closely a land parcel satisfies the buyer's specified acquisition requirements.

---

## 2. Mathematical Formulation & Weight Distribution

The maximum possible score is **100 points**, allocated across 5 orthogonal categories:

| Weight Category | Maximum Points | Primary Attributes Evaluated |
|---|:---:|---|
| **1. Geographic Location** | **25 pts** | District match (20 pts) + Taluk match (5 pts) |
| **2. Budget Alignment** | **25 pts** | Price within $[P_{\min}, P_{\max}]$ with bounded tolerance |
| **3. Property Classification** | **20 pts** | Exact category match (Agricultural, Residential, etc.) |
| **4. Parcel Area / Size** | **15 pts** | Area within $[A_{\min}, A_{\max}]$ in square feet / Cents |
| **5. Utilities & Infrastructure** | **15 pts** | Road access (5 pts) + Water (5 pts) + Electricity (5 pts) |
| **Total Compatibility Score** | **100 pts** | $\sum \text{Category Scores}$ |

$$\text{Total Score} = S_{\text{loc}} + S_{\text{type}} + S_{\text{price}} + S_{\text{area}} + S_{\text{util}}$$

---

## 3. Granular Scoring Rules

### 3.1 Geographic Location ($S_{\text{loc}} \in [0, 25]$)
- **District Match:**
  - If the listing's district is contained in the buyer's `target_districts` list (or no district filter is set):
    - If specific `target_taluks` are defined:
      - If listing's taluk $\in \text{target\_taluks}$: $S_{\text{loc}} = 25\text{ pts}$ (Exact sub-district match).
      - If listing's taluk $\notin \text{target\_taluks}$: $S_{\text{loc}} = 18\text{ pts}$ (District match, secondary taluk).
    - If no specific taluk requested: $S_{\text{loc}} = 25\text{ pts}$.
  - If the district does not match: $S_{\text{loc}} = 0\text{ pts}$.

### 3.2 Property Classification ($S_{\text{type}} \in [0, 20]$)
- If `preferred_property_type` is `'any'` or matches `listing.property_type` (e.g. `'agricultural'`):
  $$S_{\text{type}} = 20\text{ pts}$$
- If property types conflict (e.g. buyer seeks agricultural, parcel is industrial):
  $$S_{\text{type}} = 0\text{ pts}$$

### 3.3 Budget Alignment ($S_{\text{price}} \in [0, 25]$)
Let $P$ be the listing price, $P_{\min}$ be buyer's minimum budget, and $P_{\max}$ be buyer's maximum budget.
- **Within Range ($P_{\min} \le P \le P_{\max}$):**
  $$S_{\text{price}} = 25\text{ pts}$$
- **Below Budget Threshold ($P < P_{\min}$):**
  - If $P \ge 0.80 \times P_{\min}$ (within 20% below minimum): $S_{\text{price}} = 22\text{ pts}$.
  - If $P < 0.80 \times P_{\min}$: $S_{\text{price}} = 18\text{ pts}$ (Frugal, but may signal smaller land).
- **Above Maximum Budget ($P > P_{\max}$):**
  - If $P \le 1.05 \times P_{\max}$ (exceeds budget by $\le 5\%$, negotiable): $S_{\text{price}} = 14\text{ pts}$.
  - If $1.05 \times P_{\max} < P \le 1.15 \times P_{\max}$ (exceeds budget by $5\% - 15\%$): $S_{\text{price}} = 7\text{ pts}$.
  - If $P > 1.15 \times P_{\max}$ (exceeds budget by $> 15\%$): $S_{\text{price}} = 0\text{ pts}$.

### 3.4 Parcel Area / Size ($S_{\text{area}} \in [0, 15]$)
Let $A$ be the parcel area in square feet (converted to Cents via $1\text{ Cent} = 435.6\text{ sq.ft.}$):
- **Within Desired Range ($A_{\min} \le A \le A_{\max}$):**
  $$S_{\text{area}} = 15\text{ pts}$$
- **Below Minimum Area ($A < A_{\min}$):**
  - If $A \ge 0.90 \times A_{\min}$ (within 10% under minimum): $S_{\text{area}} = 9\text{ pts}$.
  - If $A < 0.90 \times A_{\min}$: $S_{\text{area}} = 0\text{ pts}$.
- **Above Maximum Area ($A > A_{\max}$):**
  - If $A \le 1.20 \times A_{\max}$ (within 20% above max, bonus land): $S_{\text{area}} = 10\text{ pts}$.
  - If $A > 1.20 \times A_{\max}$: $S_{\text{area}} = 5\text{ pts}$.

### 3.5 Utilities & Road Access ($S_{\text{util}} \in [0, 15]$)
Composite of three 5-point independent criteria:
1. **Access Road Width ($S_{\text{road}} \in [0, 5]$):**
   - If $W_{\text{road}} \ge W_{\text{preferred}}$ (or no preference): $S_{\text{road}} = 5\text{ pts}$.
   - If $W_{\text{preferred}} - W_{\text{road}} \le 6\text{ ft}$ (slight deficit): $S_{\text{road}} = 2\text{ pts}$.
   - If road is $> 6\text{ ft}$ narrower than preferred: $S_{\text{road}} = 0\text{ pts}$.
2. **Water Source ($S_{\text{water}} \in [0, 5]$):**
   - If water is not mandatory, or listing has an active source (`borewell`, `open_well`, etc.): $S_{\text{water}} = 5\text{ pts}$.
   - If water is mandatory and listing has no water source: $S_{\text{water}} = 0\text{ pts}$.
3. **Electricity Connection ($S_{\text{elec}} \in [0, 5]$):**
   - If electricity is not mandatory, or listing has an active connection: $S_{\text{elec}} = 5\text{ pts}$.
   - If electricity is mandatory and listing is unpowered: $S_{\text{elec}} = 0\text{ pts}$.

$$S_{\text{util}} = S_{\text{road}} + S_{\text{water}} + S_{\text{elec}}$$

### 3.6 Primary Attribute Conflict Damping
If a parcel conflicts on **both** primary dimensions ($S_{\text{loc}} = 0$ for district mismatch and $S_{\text{type}} = 0$ for category mismatch), the total score is deterministically capped at $\le 20\text{ pts}$ (Low Match tier). This prevents fundamentally incompatible properties (e.g., industrial land in a distant district) from scoring on secondary utility defaults.

---

## 4. Score Tiers & Visual Labels

The calculated composite score maps directly to deterministic qualitative tiers:

| Score Interval | Match Classification Tier | Visual Badge Style |
|:---:|:---:|:---:|
| **$85 - 100$** | **Excellent Match** | Emerald / Green |
| **$70 - 84$** | **Good Match** | Blue / Teal |
| **$50 - 69$** | **Moderate Match** | Amber / Yellow |
| **$< 50$** | **Low Match** | Slate / Gray |

---

## 5. Bidirectional Explainability

Every match calculation returns two structured string arrays:
1. `whyItMatches`: Explicit statements of verified criteria satisfied (e.g. *"Asking price ₹45.00 L is comfortably within your budget range"*).
2. `whatItDoesntSatisfy`: Explicit statements of deficits or constraints breached (e.g. *"Access road is 15 ft wide (preferred 20 ft)"*).

This transparency ensures complete auditability for buyers and sellers without misleading algorithmic black-boxes.
