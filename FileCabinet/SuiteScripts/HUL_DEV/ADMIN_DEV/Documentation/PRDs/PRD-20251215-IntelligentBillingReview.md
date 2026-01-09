# PRD: Intelligent Billing Review System

**Version:** 3.0
**Date:** 2025-12-16
**Author:** Claude (AI-assisted)
**Status:** In Development - Strategic Pivot to AI Similarity Search

---

## Strategic Pivot: Why We Changed Direction (2025-12-16)

### The Original Assumption (Wrong)
We assumed Work Code + Repair Code + Group Code combinations could predict labor hours and parts. The plan was to clean up the codes and build "repair profiles" that would suggest quantities.

### What We Discovered (Reality)
After mining historical estimate data, we found:

| Codes | Task Description | Labor | Parts |
|-------|------------------|-------|-------|
| A R&R + M Hydraulic | "Replace two hoses for rear coupler lift cylinders" | 2.5 hrs | 3 hoses |
| A R&R + M Hydraulic | "Rebuild complete hydraulic pump" | 8.0 hrs | pump kit, seals |
| A R&R + M Hydraulic | "Replace lift cylinder seals" | 4.0 hrs | seal kit |

**Same codes, wildly different jobs.** The codes are too generic for prediction.

The **Task Description** contains the actual detail that matters, but it's free-text with natural variation:
- "Replace two hoses for rear coupler lift cylinders"
- "R&R coupler cylinder hoses - both sides"
- "Make and replace two hoses for the rear coupler..."

These are semantically the SAME job but textually different.

### The New Strategy: AI-Assisted Similarity Search

**Don't try to predict from codes. Instead, show similar past estimates as reference.**

When an estimator types a description, the system:
1. Searches for semantically similar historical estimates
2. Shows the top 5-10 matches with their actual labor/parts/amounts
3. Estimator uses these as reference or clicks "Use as Template"

**Benefits:**
- Works WITH messy data (no cleanup required for AI to function)
- Gets smarter over time as more estimates are added
- Provides a RANGE (1.5-3.0 hrs) instead of false precision (2.0 hrs exactly)
- Estimators maintain judgment while getting AI-assisted guidance

### What Stays the Same

**Code Cleanup is still valuable** for:
- **Filtering**: Show only relevant codes for equipment type
- **Categorization**: Group repairs for reporting and analysis
- **Data Quality**: Clean data going forward

**The two tracks work together:**
```
Track 1: Code Cleanup → Better filtering & categorization
Track 2: AI Similarity → Better prediction & guidance
```

---

## Implementation Task Tracker

### Phase 0A: Historical Data Mining (FOUNDATION)

#### Data Export Scripts
- [x] Create `hul_mr_analyze_code_usage.js` (MapReduce) - Summary + Items CSV ✓ 2025-12-16
- [x] Create `hul_mr_export_ai_training_data.js` (MapReduce) - AI-ready JSON format ✓ 2025-12-16
- [x] Deploy and run comprehensive mining on ALL historical Estimates (2023+)
- [x] Extract ALL Work Code + Repair Code + Group Code combinations
- [x] Pair each combination with Equipment Posting Categories
- [x] Calculate labor hours by type (travel, service, diagnostic)
- [x] Track ALL items (parts, labor, charges, freight) with quantities
- [x] Flag corrupted codes (IDs 600+) with usage counts
- [x] Output Task Description for AI training
- [ ] Export AI-ready JSON grouped by estimate

#### Data Analysis
- [ ] Analyze Summary CSV - identify top corrupted codes
- [ ] Analyze Items CSV - identify common item patterns
- [ ] Document top 50-100 Task Descriptions for potential "Canned Jobs"

### Phase 0B: Code Taxonomy Cleanup (Filtering & Categorization)

#### Work Code Cleanup
- [ ] Document mapping for all ~10 corrupted Work Code entries
- [ ] Update Work Code records with deprecation flags where needed
- [ ] Create reference document for user training

#### Equipment-Specific Repair Codes
- [ ] Create Repair Code: AA - Boom System
- [ ] Create Repair Code: AB - Coupler System
- [ ] Create Repair Code: AC - Platform/Basket
- [ ] Create Repair Code: AD - Outrigger System
- [ ] Create Repair Code: AE - Pothole Protection
- [ ] Create Repair Code: AF - Rail Wheel System
- [ ] Create Repair Code: AG - Scissor Stack
- [ ] Reclassify existing "Telehandler Boom" (ID 132) under AA

#### Equipment-Repair Code Mapping
- [ ] Create custom record: `customrecord_hul_equip_repair_map`
- [ ] Define fields: equip_posting, repair_code, display_order
- [ ] Load FORKLIFT mappings (all A-Z codes)
- [ ] Load AERIAL mappings (subset + new codes)
- [ ] Load CONSTRUCTION mappings (subset + AA)
- [ ] Load RAIL MOVERS mappings (limited + new)

#### Group Code Enhancement
- [ ] Add field: `custrecord_hul_gc_is_deprecated` (checkbox)
- [ ] Add field: `custrecord_hul_gc_mapped_to` (list)
- [ ] Identify top 100 most-used corrupted entries from 0A analysis
- [ ] Create mapping spreadsheet with decisions
- [ ] Bulk update corrupted codes with deprecation flag

#### Cascading Dropdowns on Estimates
- [ ] Create `hul_cs_estimate_codes.js` (Client Script - deploys on Estimate)
- [ ] Implement Equipment → Repair Code filtering
- [ ] Implement Repair Code → Group Code filtering
- [ ] Test with all equipment types

### Phase 1: AI Similarity Search (THE PREDICTION LAYER)

#### 1A: Build Embedding Database
- [ ] Export historical estimates to AI-ready JSON format
- [ ] Set up vector database (Pinecone, Supabase pgvector, or similar)
- [ ] Generate embeddings for all historical Task Descriptions
- [ ] Store embeddings with linked estimate data (labor, parts, amounts)
- [ ] Create index for fast similarity search

#### 1B: Similarity Search API
- [ ] Create `hul_rl_similar_estimates.js` (RESTlet)
- [ ] Implement embedding generation for user input
- [ ] Implement vector similarity search
- [ ] Return top 5-10 similar estimates with:
  - Task Description
  - Equipment info
  - Labor hours and amount
  - Parts list with quantities
  - Total amount
  - Match score (%)

#### 1C: Estimate UI Integration
- [ ] Create `hul_cs_estimate_similarity.js` (Client Script)
- [ ] Add "Find Similar Estimates" panel to Estimate form
- [ ] Display similar estimates when user types description
- [ ] Show suggested labor/parts range based on matches
- [ ] Add "Use as Template" button to auto-populate lines
- [ ] Add feedback mechanism (was this suggestion helpful?)

### Phase 2: Canned Jobs (Optional - Top 50-100 Common Repairs)

- [ ] Analyze data to identify top 50-100 most common Task Descriptions
- [ ] Create `customrecord_hul_canned_job` for job templates
- [ ] Define standard labor and parts for each template
- [ ] Add "Quick Job" dropdown to Estimate for common repairs
- [ ] Link canned jobs to Equipment Posting types

### Phase 3: Billing Review Dashboard

- [ ] Create `hul_sl_billing_review.js` (Suitelet)
- [ ] Create `hul_cs_billing_review.js` (Client Script)
- [ ] Implement validation flags (PO, pricing, photos, codes)
- [ ] Add approve for billing action
- [ ] Test with billing team

### Phase 4: Continuous Improvement

- [ ] Auto-add new estimates to embedding database on approval
- [ ] Track which suggestions are used vs. ignored
- [ ] Implement feedback loop to improve ranking
- [ ] Create `hul_ss_refresh_embeddings.js` (Scheduled Script) for periodic refresh

---

## Executive Summary

A comprehensive system to improve the **Estimate → Technician Writeup → Billing** process through TWO complementary approaches:

### Track 1: Code Taxonomy Cleanup (Filtering & Categorization)
- Clean up ~1,300 corrupted Group Code entries
- Add equipment-specific Repair Codes for AERIAL, RAIL MOVERS, CONSTRUCTION
- Create cascading dropdowns: Equipment → Repair Code → Group Code
- **Purpose**: Better filtering, cleaner data going forward, improved reporting

### Track 2: AI-Assisted Similarity Search (Prediction & Guidance)
- Build embedding database from historical estimate Task Descriptions
- When estimator types a description, show similar past estimates
- Display labor hours, parts, and amounts from similar jobs
- **Purpose**: AI-assisted guidance without requiring perfect data cleanup

**Ultimate Goal:** Estimator types "Replace two hoses for rear coupler lift cylinders" and immediately sees 5-10 similar past estimates with actual labor/parts data as reference.

---

## The Two-Track Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ESTIMATE CREATION                                 │
│                                                                          │
│  Equipment: [Auto from NXC Asset]  Rail Movers : Trackmobile : 4200TM   │
│                                                                          │
│  ┌─ TRACK 1: Code Selection (Filtering) ─────────────────────────────┐  │
│  │  Repair Code: [M Hydraulic System    ▼]  ← Filtered by equipment  │  │
│  │  Group Code:  [M04A Hose Hydraulic   ▼]  ← Filtered by repair     │  │
│  │  Work Code:   [A R&R                 ▼]                            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Description: [Replace two hoses for rear coupler lift cylinders___]    │
│                          ↓                                               │
│                    User types description                                │
│                          ↓                                               │
│  ┌─ TRACK 2: AI Similarity Search (Prediction) ──────────────────────┐  │
│  │                                                                    │  │
│  │  📋 SIMILAR PAST ESTIMATES                              [Refresh] │  │
│  │                                                                    │  │
│  │  1. EST-45231 (94% match) - Trackmobile 4200TM                    │  │
│  │     "Make and replace two hoses for the rear coupler..."          │  │
│  │     Labor: 2.5 hrs ($248) | Parts: $342 | Total: $590             │  │
│  │     Parts: 471TC-8 (x2), 1094220-TM, 1081256-TM                   │  │
│  │     [Use as Template]                                              │  │
│  │                                                                    │  │
│  │  2. EST-44892 (87% match) - Trackmobile 4200TM                    │  │
│  │     "Replace hydraulic hoses on rear lift assembly"               │  │
│  │     Labor: 2.0 hrs ($198) | Parts: $285 | Total: $483             │  │
│  │     [Use as Template]                                              │  │
│  │                                                                    │  │
│  │  3. EST-43107 (82% match) - Trackmobile 4200SM                    │  │
│  │     "R&R coupler cylinder hoses - both sides"                     │  │
│  │     Labor: 3.0 hrs ($297) | Parts: $410 | Total: $707             │  │
│  │     [Use as Template]                                              │  │
│  │                                                                    │  │
│  │  ───────────────────────────────────────────────────────────────  │  │
│  │  SUGGESTED RANGE: 2.0-3.0 hrs labor | $285-$410 parts            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0A: Data Export Scripts

### Script 1: Code Usage Analysis (COMPLETED)

**Script:** `hul_mr_analyze_code_usage.js`
**Purpose:** Export historical estimates with codes, equipment, and ALL items for analysis

**Output Files:**
1. `code_usage_summary_*.csv` - One row per code+equipment combination with aggregated stats
2. `code_usage_items_*.csv` - One row per code+equipment+item with quantity statistics

**Key Columns in Items CSV:**
| Column | Purpose |
|--------|---------|
| Work Code, Repair Code, Group Code | Code combination |
| Task Description | The actual repair description (KEY for AI) |
| Equipment Posting, Manufacturer, Model | Equipment context |
| Item ID, Item Name, Item Type | What was used |
| Is Labor, Is Part | Item classification |
| Times Used, % of Estimates | Frequency |
| Total Qty, Avg Qty, Min Qty, Max Qty | Quantity statistics |
| Total Amount, Avg Amount | Cost statistics |

### Script 2: AI Training Data Export (NEW)

**Script:** `hul_mr_export_ai_training_data.js`
**Purpose:** Export historical estimates in AI-ready JSON format for embedding generation

**Important Design Decision (2025-12-17):** The export focuses on **QUANTITIES ONLY**, not pricing.
- Rates and amounts vary by geography and customer (price groups, discounts)
- Quantities (labor hours, part counts) are consistent regardless of customer/location
- Pricing should be calculated at quote time using NetSuite's pricing matrix for the current customer
- This keeps embeddings focused on "what work was done" rather than "what was charged"

**Output Format:**
```json
{
  "metadata": {
    "export_date": "2025-12-16",
    "date_range": "01/01/2023 to 12/16/2025",
    "total_estimates": 5200,
    "total_tasks": 8500,
    "estimates_with_equipment": 4800
  },
  "estimates": [
    {
      "estimate_id": "12345",
      "estimate_number": "EST-45231",
      "date": "2024-08-15",
      "equipment": {
        "posting_id": 382,
        "posting_name": "RAIL MOVERS : RAIL MOVERS : Rail Movers",
        "manufacturer_id": 15,
        "manufacturer_name": "Trackmobile",
        "model_id": 126,
        "model_name": "4200TM",
        "object_id": 54321
      },
      "tasks": [
        {
          "task_description": "Make and replace two hoses for the rear coupler lift cylinders",
          "task_code": "01",
          "codes": {
            "work_code_id": 1,
            "work_code_name": "A Remove & Install, Remove & Replace",
            "repair_code_id": 12,
            "repair_code_name": "M Hydraulic System",
            "group_code_id": null,
            "group_code_name": ""
          },
          "lines": [
            {
              "item_id": "99160",
              "item_name": "*Service Labor - Resource",
              "item_display": "Service Labor",
              "item_type": "Service",
              "is_labor": true,
              "is_part": false,
              "quantity": 2.5
            },
            {
              "item_id": "39807",
              "item_name": "471TC-8",
              "item_display": "Hydraulic Hose Assembly",
              "item_type": "InvtPart",
              "is_labor": false,
              "is_part": true,
              "quantity": 2
            }
          ],
          "totals": {
            "labor_hours": 2.5,
            "parts_count": 3,
            "other_count": 0
          }
        }
      ]
    }
  ]
}
```

**Key Structure Notes:**
- **tasks[]**: One estimate can have MULTIPLE tasks (01, 02, 03...), each with its own description, codes, lines, and totals
- **equipment**: Comes from the Object record linked to the estimate header
- **codes**: Each task has its own code combination (may differ between tasks on same estimate)
- **lines[]**: All items for that specific task with quantities and amounts

---

## Implementation Priority Note

**Phase 0B (Code Cleanup) and Phase 1 (AI Similarity) can run IN PARALLEL:**

| Track | Dependencies | Can Start |
|-------|--------------|-----------|
| Phase 0A: Data Export | None | ✅ Now |
| Phase 0B: Code Cleanup | Phase 0A analysis | After 0A |
| Phase 1: AI Similarity | Phase 0A JSON export | After 0A |

**Why parallel?** AI Similarity Search uses Task Descriptions, not codes. It doesn't need clean codes to function. Both tracks improve the estimate experience but independently.

**Recommended approach:**
1. Complete Phase 0A (both scripts) ✅
2. Start Phase 1 (AI Similarity) - this delivers the most user value fastest
3. Do Phase 0B (Code Cleanup) when time permits - improves filtering/reporting

---

## Phase 1: AI Similarity Search Architecture

### How It Works

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      AI SIMILARITY SEARCH FLOW                            │
│                                                                           │
│  ┌─────────────────┐                                                      │
│  │ Historical Data │                                                      │
│  │ (6,500 estimates)│                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ EMBEDDING GENERATION (One-Time + Incremental)                        │ │
│  │                                                                       │ │
│  │ For each estimate:                                                    │ │
│  │   Input: "Replace two hoses for rear coupler lift cylinders          │ │
│  │           | Rail Movers | Trackmobile | 4200TM | M Hydraulic"        │ │
│  │                                                                       │ │
│  │   Output: [0.023, -0.041, 0.089, ... ] (1536 dimensions)             │ │
│  │                                                                       │ │
│  │ Store in Vector Database with estimate_id reference                   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ VECTOR DATABASE                                                       │ │
│  │                                                                       │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │ │ estimate_id │ embedding_vector              │ equipment_posting │  │ │
│  │ ├─────────────┼───────────────────────────────┼───────────────────┤  │ │
│  │ │ 45231       │ [0.023, -0.041, 0.089, ...]  │ Rail Movers       │  │ │
│  │ │ 44892       │ [0.019, -0.038, 0.092, ...]  │ Rail Movers       │  │ │
│  │ │ 43107       │ [0.025, -0.044, 0.086, ...]  │ Rail Movers       │  │ │
│  │ └─────────────┴───────────────────────────────┴───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ AT ESTIMATE CREATION TIME                                             │ │
│  │                                                                       │ │
│  │ 1. User types: "Replace two hoses for rear coupler lift cylinders"   │ │
│  │                                                                       │ │
│  │ 2. Generate embedding for user input                                  │ │
│  │                                                                       │ │
│  │ 3. Query vector DB for nearest neighbors:                             │ │
│  │    - Filter by equipment_posting (optional)                           │ │
│  │    - Return top 10 by cosine similarity                               │ │
│  │                                                                       │ │
│  │ 4. Fetch full estimate data for matches from NetSuite/cache           │ │
│  │                                                                       │ │
│  │ 5. Display to user with "Use as Template" option                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Technology Options

#### Option A: Supabase pgvector (Recommended for POC)
- **Pros**: SQL interface, easy setup, affordable (~$25/mo)
- **Cons**: Performance degrades at 100k+ vectors
- **Best for**: Your volume (6,500 estimates)

#### Option B: Pinecone
- **Pros**: Purpose-built for vectors, scales well, fast
- **Cons**: Another service to manage, cost (~$70/mo starter)
- **Best for**: High volume, production systems

#### Option C: NetSuite + External API
- **Pros**: All data in NetSuite
- **Cons**: Slower, requires external embedding API calls
- **Best for**: If avoiding new infrastructure

**Recommendation**: Start with Supabase pgvector for POC. Migrate to Pinecone if performance issues arise.

### Embedding Model Options

| Model | Dimensions | Cost | Quality |
|-------|------------|------|---------|
| OpenAI text-embedding-3-small | 1536 | $0.02/1M tokens | Good |
| OpenAI text-embedding-3-large | 3072 | $0.13/1M tokens | Better |
| Voyage AI voyage-3 | 1024 | $0.06/1M tokens | Great for retrieval |
| Cohere embed-v3 | 1024 | $0.10/1M tokens | Good |

**Recommendation**: Start with OpenAI text-embedding-3-small. Good quality, lowest cost for testing.

---

## Phase 0B: Code Taxonomy Cleanup (Still Valuable!)

### Why Codes Still Matter

Even with AI similarity search, clean codes provide:

1. **Filtering**: "Show me only Hydraulic system repairs"
2. **Categorization**: Group repairs by type for reporting
3. **Validation**: Ensure estimates have proper codes for accounting
4. **Hybrid Search**: Combine semantic similarity with code filtering

### What We're NOT Using Codes For

~~Predicting labor hours from codes~~ → Use AI similarity instead
~~Building "repair profiles" by code~~ → Use actual similar estimates instead

### Code Cleanup Tasks

See Implementation Task Tracker Phase 0B above.

---

## Scripts to Create

### Phase 0A: Data Export

| Script | Type | Purpose | Status |
|--------|------|---------|--------|
| `hul_mr_analyze_code_usage.js` | MapReduce | Export summary + items CSV | ✅ Complete |
| `hul_mr_export_ai_training_data.js` | MapReduce | Export AI-ready JSON | ✅ Complete |

### Phase 0B: Code Cleanup

| Script | Type | Purpose | Status |
|--------|------|---------|--------|
| `hul_cs_estimate_codes.js` | Client Script | Cascading code dropdowns | 🔲 To Create |
| `hul_lib_code_taxonomy.js` | Library | Shared code filtering functions | 🔲 To Create |

### Phase 1: AI Similarity Search

| Script | Type | Purpose | Status |
|--------|------|---------|--------|
| `hul_rl_similar_estimates.js` | RESTlet | API for similarity search | 🔲 To Create |
| `hul_cs_estimate_similarity.js` | Client Script | UI for similar estimates panel | 🔲 To Create |
| `hul_lib_embeddings.js` | Library | Embedding generation utilities | 🔲 To Create |

### Phase 3: Billing Review

| Script | Type | Purpose | Status |
|--------|------|---------|--------|
| `hul_sl_billing_review.js` | Suitelet | Billing review dashboard | 🔲 To Create |
| `hul_cs_billing_review.js` | Client Script | Dashboard interactions | 🔲 To Create |

---

## Custom Records to Create

### For Code Cleanup (Phase 0B)

| Record | Purpose |
|--------|---------|
| `customrecord_hul_equip_repair_map` | Equipment Posting → applicable Repair Codes |

### For AI Similarity (Phase 1)

| Record | Purpose |
|--------|---------|
| `customrecord_hul_estimate_cache` | Cache estimate summaries for fast lookup |

### For Canned Jobs (Phase 2 - Optional)

| Record | Purpose |
|--------|---------|
| `customrecord_hul_canned_job` | Pre-built job templates with standard labor/parts |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| 0A | Historical estimates exported | 100% with Task Description |
| 0B | Cascading dropdowns functional | Filter by equipment type |
| 1 | Similar estimates found | 80%+ queries return relevant results |
| 1 | "Use as Template" adoption | 30%+ of estimates use templates |
| 2 | Canned jobs created | Top 50 common repairs |
| 3 | Billing review time | Reduce by 30% |

---

## Key Field References

### Transaction Line Fields
- `custcol_sna_repair_code` - Repair code on SO/Invoice line
- `custcol_sna_work_code` - Work code on SO/Invoice line
- `custcol_sna_group_code` - Group code on SO/Invoice line
- `custcol_sna_task_code` - Task code for grouping parts/labor
- `custcol_sna_task_description` - Task description (KEY FOR AI)
- `cseg_sna_hul_eq_seg` - Equipment Posting Category segment

### Estimate Header Fields
- `custbody_sna_equipment_object` - Link to Equipment Object record

### Equipment Object Fields (customrecord_sna_objects)
- `cseg_sna_hul_eq_seg` - Equipment Posting Category
- `cseg_hul_mfg` - Manufacturer segment
- `custrecord_sna_equipment_model` - Model field

### Equipment Posting Hierarchy
- Level 1 - Posting: AERIAL, FORKLIFT, CONSTRUCTION, RAIL MOVERS, etc.
- Level 2 - Category: CLASS I, SCISSOR LIFT, etc.
- Level 3 - Group: 3-Wheel Electric Sit Down Forklift, etc.

---

## Session Notes

### 2025-12-16: Strategic Pivot Session

**Key Realization:** Codes are too generic for prediction. "A R&R + M Hydraulic" could be a simple hose replacement (2 hrs) or a complete pump rebuild (8 hrs). The Task Description contains the actual detail.

**Decision:** Pivot from "repair profiles by code" to "AI-assisted similarity search by description"

**What We Keep:**
- Code cleanup for filtering/categorization
- Equipment-specific Repair Codes (AA-AG)
- Cascading dropdowns on Estimates
- All data mining work from Phase 0A

**What We Add:**
- AI embedding database from historical Task Descriptions
- Similar estimates search when typing description
- "Use as Template" feature to auto-populate lines
- Feedback loop to improve suggestions over time

**Action Items:**
1. ✅ Update PRD with new direction
2. ✅ Create AI training data export script (JSON format)
3. 🔲 Deploy and test both export scripts in Sandbox
4. 🔲 Set up vector database (Supabase pgvector)
5. 🔲 Generate embeddings from exported JSON
6. 🔲 Build RESTlet for similarity search
7. 🔲 Create Estimate UI for similar estimates panel

### 2025-12-16: Phase 0A Script Updates

**Script:** `hul_mr_analyze_code_usage.js`

**Enhancements Made:**
- Fixed Equipment Posting using COALESCE from Object record
- Added Task Description column to both CSV outputs
- Changed from "parts only" to "ALL items" (labor, charges, freight)
- Added Item Type, Is Labor, Is Part columns
- Renamed output file from `parts` to `items`

**Output Files:**
1. `code_usage_summary_*.csv` - Code combinations with labor/parts stats
2. `code_usage_items_*.csv` - All items per code combination with quantities

### 2025-12-17: Quantities-Only Decision

**Key Decision:** AI training data should focus on quantities, not pricing.

**Reasoning:**
- Rates and amounts vary by geography (zip, city, state, county)
- Rates vary by customer (price groups, special discounts, labor pricing matrix)
- Quantities (labor hours, part counts) are consistent regardless of customer/location
- Pricing should be calculated at quote time using NetSuite's pricing matrix

**Changes Made:**
- Updated `hul_mr_export_ai_training_data.js` to remove rate/amount fields
- Simplified totals to: `labor_hours`, `parts_count`, `other_count`
- This keeps embeddings focused on "what work was done" rather than "what was charged"

### Previous Sessions

See version history in git for earlier session notes about:
- Initial code taxonomy analysis
- Work/Repair/Group Code structure discovery
- Equipment Posting Category hierarchy
- Task Codes sublist structure
