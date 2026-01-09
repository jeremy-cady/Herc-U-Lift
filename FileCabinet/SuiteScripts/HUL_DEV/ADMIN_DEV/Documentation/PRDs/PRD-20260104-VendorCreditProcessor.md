# PRD: Vendor Credit PDF Processor

**PRD ID:** PRD-20260104-VendorCreditProcessor
**Created:** January 4, 2026
**Last Updated:** January 6, 2026 (Bypass Mode, Freight Location)
**Author:** Thomas Showalter / Claude Code
**Status:** Development Complete - Pending NetSuite Deployment
**Related Scripts:** hul_lib_vendor_credit.js, hul_mr_vendor_credit_ocr.js, hul_mr_vendor_credit_normalize.js, hul_mr_vendor_credit_match.js, hul_mr_vendor_credit_case.js, hul_ss_vendor_credit_monitor.js, hul_sl_vendor_credit.js, hul_cs_vendor_credit.js

---

## Implementation Status

### Phase 1: Development - COMPLETE (Jan 4, 2026)

**Scripts Created:**
| Script | Type | Purpose |
|--------|------|---------|
| `hul_lib_vendor_credit.js` | Library | Shared functions for OCR, normalization, matching |
| `hul_mr_vendor_credit_ocr.js` | MapReduce | PDF OCR processing via Mistral AI |
| `hul_mr_vendor_credit_normalize.js` | MapReduce | Vendor-specific normalization & quality scoring |
| `hul_mr_vendor_credit_match.js` | MapReduce | 3-tier VRA matching |
| `hul_mr_vendor_credit_case.js` | MapReduce | Support Case creation |
| `hul_ss_vendor_credit_monitor.js` | Scheduled | Queue monitoring & MapReduce triggering |
| `hul_sl_vendor_credit.js` | Suitelet | Dashboard UI |
| `hul_cs_vendor_credit.js` | Client Script | UI interactions |

**Documentation Created:**
| Document | Purpose |
|----------|---------|
| `CustomRecords_VendorCredit.md` | NetSuite setup guide for custom records |
| `PRD-20260104-VendorCreditProcessor.md` | This PRD document |

### Phase 2: NetSuite Setup - COMPLETE ✓

**Custom Records:**
| Record Type ID | Status |
|----------------|--------|
| `customrecord_vendor_credit_config` | ✓ Created |
| `customrecord_vendor_credit_log` | ✓ Created |
| `customrecord_vendor_name_alias` | ✓ Created |
| `customrecord_vc_learned_alias` | ✓ Created (Jan 5, 2026) |

**Custom Lists:**
| List ID | Status |
|---------|--------|
| `custlist_vcc_sign_convention` | ✓ Created |
| `custlist_vcc_line_sign_rule` | ✓ Created |
| `custlist_vcc_total_sign_rule` | ✓ Created |
| `custlist_vcc_fee_location` | ✓ Created |
| `customlist_vcl_status` | ✓ Created |
| `customlist_vcl_error_type` | ✓ Created |

**Script Deployments:**
| Script | Deployment ID | Status |
|--------|---------------|--------|
| OCR MapReduce | `customdeploy_hul_mr_vc_ocr` | ✓ Deployed & Tested |
| Normalize MapReduce | `customdeploy_hul_mr_vc_norm` | ✓ Deployed & Tested (AI params configured Jan 5, 2026) |
| Match MapReduce | `customdeploy_hul_mr_vc_match` | ✓ Deployed & Tested |
| Case MapReduce | `customdeploy_hul_mr_vc_case` | ✓ Deployed & Tested (Field IDs fixed Jan 5, 2026) |
| Monitor Scheduled | `customdeploy_hul_ss_vc_monitor` | Not Deployed |
| Dashboard Suitelet | `customdeploy_hul_sl_vc_dashboard` | ✓ Deployed & Tested |

### Phase 3: Vendor Configuration - PENDING

**Vendors to Configure (15):**
- Mitsubishi Logisnext
- Big Lift LLC
- TVH
- Trackmobile LLC
- Hyundai
- Cascade
- Grainger
- Arnold Machinery
- Hoist Liftruck
- Niftylift
- Taylor Machine
- MCFA
- Crown Equipment
- Landoll
- Thompson Lift Truck

---

## Security Alert

**CRITICAL: API Key Rotation Required**

Before deployment, rotate the following API keys that were exposed in the n8n workflow exports:

| Service | Action Required |
|---------|----------------|
| Mistral AI | Deactivate current key → Generate new key |
| OpenAI | Deactivate current key → Generate new key (if used) |
| Supabase | Deactivate current key → Generate new key (if keeping for reference) |

**Store new keys securely in NetSuite script parameters - never in code files.**

---

## 1. Introduction / Overview

**What is this feature?**
An automated vendor credit PDF processing system that replaces the existing n8n workflow infrastructure. The system receives vendor credit PDFs, performs OCR via Mistral AI, validates and normalizes data using vendor-specific rules, matches to Purchase Orders/VRAs in NetSuite, and creates Support Cases for accounting review.

**What problem does it solve?**
- **Manual Processing Burden**: Currently, vendor credits require manual data entry and VRA matching
- **External Dependencies**: The n8n/Supabase infrastructure creates security and maintenance concerns
- **Inconsistent Quality**: OCR extraction varies by vendor format without standardized rules
- **Lack of Visibility**: No centralized queue or dashboard for processing status
- **Error Handling**: Failed documents require manual intervention with no retry logic

**Primary Goal:**
Move all vendor credit processing into native NetSuite scripts, eliminating external dependencies while improving accuracy, visibility, and error handling.

---

## 2. Goals

1. **Automated OCR Processing** - Extract structured data from vendor credit PDFs via Mistral AI
2. **Vendor-Specific Normalization** - Apply configurable rules per vendor for sign conventions, fee detection, and format parsing
3. **Quality Scoring** - Calculate confidence scores to route documents appropriately (auto-approve, review, retry)
4. **VRA Matching** - 3-tier cascading strategy to find matching Vendor Return Authorizations
5. **Case Creation** - Automatically create Support Cases with attached PDFs for accounting review
6. **Dashboard Visibility** - Provide real-time queue status, statistics, and manual review interface

---

## 3. User Stories

1. **As an** Accounts Payable Clerk, **I want** vendor credits automatically extracted and matched to VRAs **so that** I can focus on reviewing exceptions rather than manual data entry.

2. **As a** Controller, **I want** to see the processing queue status and success rates **so that** I can identify problem vendors or systemic issues.

3. **As an** AP Manager, **I want** low-confidence extractions routed for review **so that** I can verify accuracy before case creation.

4. **As a** System Admin, **I want** vendor-specific rules configurable without code changes **so that** I can tune the system as vendor formats change.

5. **As an** Accountant, **I want** Support Cases created with matched VRA information **so that** I have all context needed to process the credit.

---

## 4. Functional Requirements

### 4.1 PDF Intake

1. The system must monitor designated File Cabinet folders for new PDF uploads:
   - `Vendor Credits/Incoming/Parts/`
   - `Vendor Credits/Incoming/Warranty/`
   - `Vendor Credits/Incoming/Sales/`

2. The system must move files to `Processing/` during OCR and to `Processed/` or `Failed/` upon completion

3. The system must detect duplicate files by name and size hash

### 4.2 OCR Processing

4. The system must call Mistral AI API with PDF content and extraction schema

5. The system must extract:
   - Vendor name and ID
   - Document number and date
   - Credit amount (total)
   - Line items (part number, quantity, unit price, amount)
   - PO/VRA reference numbers
   - Tax, shipping, restocking fees, core charges

6. The system must store raw OCR response for debugging

### 4.3 Normalization

7. The system must apply vendor-specific rules:
   - Sign convention (positive_credit, negative_credit, mixed)
   - Line item sign rule (always_negative, always_positive, trust_ocr, conditional)
   - Fee detection patterns (regex for restocking, core charges, misc fees)
   - Date format parsing
   - Item suffix stripping (e.g., "-JLG", "-MIT")

8. The system must calculate quality score (0-100) based on:
   - Totals match (25 points)
   - Line items sum correctly (20 points)
   - Vendor recognized (15 points)
   - Document number found (10 points)
   - PO/VRA references found (10 points)
   - All required fields present (10 points)
   - No warnings (10 points)

### 4.4 Routing

9. The system must route based on quality score:
   - 85-100: Auto-approved → VRA Matching
   - 70-84: Needs Review → Review Queue
   - 0-69: Low Quality → Retry (max 5 attempts with exponential backoff)

10. **Bypass Mode:** When enabled via script parameters, the system skips quality score and VRA match routing:
    - All documents proceed directly to VRA Matching (regardless of quality score)
    - VRA match failures proceed directly to Case Creation (instead of Review Queue)
    - Only Vendor/PO mismatch issues still route to Review Queue

### 4.5 VRA Matching

11. The system must attempt matching with 3 cascading strategies:
    - **Strategy 1: VRA Direct** - Match by extracted VRA number (100% confidence)
    - **Strategy 2: PO Lookup** - Find VRA by linked PO number (95% confidence)
    - **Strategy 3: Vendor + Items** - Fuzzy match by vendor and line items (60-90% confidence)

12. The system must record match method and confidence for audit

### 4.6 Case Creation

13. The system must create Support Cases with:
    - Title: `[VENDOR] Vendor Credit - $X,XXX.XX (XX% confidence)`
    - Body: Match details, line item comparison, warnings, suggested actions
    - Priority: Based on confidence (lower = higher priority)
    - Attached PDF from File Cabinet

14. The system must link Case to matched VRA if found

### 4.7 Dashboard

15. The system must provide a Suitelet dashboard with:
    - Queue status cards (counts by status)
    - Today's processing statistics
    - Recent activity feed
    - Vendor performance metrics (7-day)

16. The system must provide queue view with:
    - Filterable list of all processing records
    - Status, quality score, match method columns
    - Click-through to detail view

17. The system must provide review interface with:
    - Extracted data display
    - Line items table
    - Match result details
    - Approve/Reject/Reprocess buttons

18. The system must provide vendor config management view

---

## 5. Non-Goals (Out of Scope)

**This system will NOT:**
- Create Vendor Bills or apply credits (view/case creation only)
- Modify VRA or PO records
- Handle non-PDF document formats
- Process credits without vendor match (routes to review)
- Auto-approve credits over $10,000 without review

---

## 6. Technical Design

### 6.1 Processing Pipeline

```
PDF Upload → File Cabinet
     ↓
Scheduled Monitor (every 15 min)
     ↓
OCR MapReduce → Mistral AI → Processing Log (raw OCR)
     ↓
Normalize MapReduce → Apply Vendor Rules → Quality Score
     ↓
┌─────────────────────────────────────────────────────┐
│ Score >= 85: Auto-approve → Match MapReduce         │
│ Score 70-84: Needs Review → Review Queue            │
│ Score < 70:  Low Quality → Retry Queue (max 5x)     │
└─────────────────────────────────────────────────────┘
     ↓
Match MapReduce → VRA Direct | PO Lookup | Vendor+Items
     ↓
┌─────────────────────────────────────────────────────┐
│ Match Found:    → Case MapReduce → Support Case     │
│ No Match:       → Review Queue                      │
│ Multiple Match: → Review Queue with options         │
└─────────────────────────────────────────────────────┘
     ↓
Complete: File → Processed/, Log → COMPLETED
```

### 6.2 State Machine

```
RECEIVED → OCR_PENDING → OCR_COMPLETE → NORMALIZING → PENDING_MATCH
                ↑                              ↓
                └────── (retry) ───────────────┘
                                               ↓
                              ┌────────────────┼────────────────┐
                              ↓                ↓                ↓
                         MATCHING        REVIEW_REQUIRED    FAILED
                              ↓
                           MATCHED
                              ↓
                        CASE_CREATED
                              ↓
                          COMPLETED
```

### 6.3 Retry Logic

| Attempt | Delay | Total Elapsed |
|---------|-------|---------------|
| 1 | 15 minutes | 15 minutes |
| 2 | 30 minutes | 45 minutes |
| 3 | 60 minutes | 1.75 hours |
| 4 | 4 hours | 5.75 hours |
| 5 | 8 hours | 13.75 hours |

After 5 failures → Status = FAILED, route to manual review

### 6.4 Quality Score Calculation

```javascript
function calculateQualityScore(normalizedData, vendorConfig) {
    let score = 0;

    // Totals validation (25 points)
    if (Math.abs(normalizedData.totals.discrepancy) < 0.01) {
        score += 25;
    } else if (Math.abs(normalizedData.totals.discrepancy) < 1.00) {
        score += 15;
    }

    // Line items sum (20 points)
    if (normalizedData.lineItems.length > 0 &&
        normalizedData.totals.lineItemsTotal > 0) {
        score += 20;
    }

    // Vendor recognized (15 points)
    if (vendorConfig) score += 15;

    // Document number found (10 points)
    if (normalizedData.vendor.documentNumber) score += 10;

    // PO/VRA references (10 points)
    if (normalizedData.document.poNumbers.length > 0 ||
        normalizedData.document.vraNumbers.length > 0) {
        score += 10;
    }

    // Required fields (10 points)
    if (normalizedData.vendor.name &&
        normalizedData.document.totalAmount) {
        score += 10;
    }

    // No warnings (10 points)
    if (normalizedData.warnings.length === 0) score += 10;

    return score;
}
```

### 6.5 VRA Matching Strategy

```javascript
function matchVra(normalizedData, vendorConfig) {
    // Strategy 1: Direct VRA Number
    if (normalizedData.document.vraNumbers.length > 0) {
        for (const vraNum of normalizedData.document.vraNumbers) {
            const vra = searchVraByNumber(vraNum);
            if (vra) return {
                matchFound: true,
                method: 'vra_direct',
                confidence: 100,
                vraInternalId: vra.id
            };
        }
    }

    // Strategy 2: PO Lookup
    if (normalizedData.document.poNumbers.length > 0) {
        for (const poNum of normalizedData.document.poNumbers) {
            const vra = searchVraByPo(poNum);
            if (vra) return {
                matchFound: true,
                method: 'po_lookup',
                confidence: 95,
                vraInternalId: vra.id,
                poInternalId: vra.poId
            };
        }
    }

    // Strategy 3: Vendor + Items
    if (normalizedData.vendor.vendorId &&
        normalizedData.lineItems.length > 0) {
        const matches = searchVraByVendorItems(
            normalizedData.vendor.vendorId,
            normalizedData.lineItems,
            vendorConfig ? vendorConfig.matchThreshold : 50
        );
        if (matches.length === 1) {
            return {
                matchFound: true,
                method: 'vendor_items',
                confidence: matches[0].score,
                vraInternalId: matches[0].id
            };
        }
    }

    return { matchFound: false };
}
```

### 6.6 AI Vector Embedding Vendor Matching

When local vendor matching fails, the system uses AI vector embeddings to find the best vendor match:

```
OCR Vendor Name → Local Match Attempt → [If No Match] → Check Learned Aliases
                                                              ↓
                                              [If No Alias] → AI Vector Lookup
                                                              ↓
                                      Generate Embedding (OpenAI text-embedding-3-small)
                                                              ↓
                                      Query Supabase (pgvector similarity search)
                                                              ↓
                                      Return NetSuite Internal ID
                                                              ↓
                              High Confidence (≥90%) → Auto-save as Learned Alias
```

**Matching Priority Order:**
1. **Local vendor config** - Exact match on vendor config name
2. **Learned aliases** - User corrections and auto-saved AI matches
3. **Existing aliases** - From `customrecord_vendor_name_alias`
4. **Fuzzy match** - First 10/5 character matching
5. **AI vector matching** - OpenAI embeddings → Supabase similarity search

**Quality Score Impact by Match Source:**

| Match Source | Quality Score Modifier |
|--------------|----------------------|
| Local config match (≥90%) | +10 points |
| Learned alias | +10 points (user verified) |
| AI match ≥90% confidence | +9 points |
| AI match 80-89% confidence | +7 points |
| AI match 70-79% confidence | +5 points |
| AI match <70% confidence | +0 points (warning added) |
| No vendor match | -10 points |

**Cost Optimization:**
- High-confidence AI matches (≥90%) are auto-saved as learned aliases
- User corrections are saved as learned aliases
- Subsequent documents with the same vendor text skip AI calls
- Over time, API costs approach zero for known vendors

### 6.7 Fee Calculation Logic

Fee handling determines whether charges reduce or increase the credit amount. The system applies vendor-specific rules with sensible defaults.

**Default Behaviors (when no vendor config exists):**

| Fee Type | Default Behavior | Reason |
|----------|-----------------|--------|
| Freight/Shipping | **Reduces** credit | Shipping is deducted from refund |
| Restocking Fees | **Reduces** credit | Restocking is deducted from refund |
| Misc Charges | **Reduces** credit | Typically handling fees deducted |
| Sales Tax | **Increases** credit | Tax is refunded to customer |
| Core Charges | **Increases** credit | Core value adds to credit |

**Calculation Formula:**
```javascript
// Fee behaviors (default to reducing credit for most fees)
const freightReducesCredit = vendorConfig ? vendorConfig.freightReduces !== false : true;
const restockReducesCredit = vendorConfig ? vendorConfig.restockIsCharge !== false : true;
const miscReducesCredit = vendorConfig ? vendorConfig.miscReduces !== false : true;
const salesTaxIncreasesCredit = vendorConfig ? vendorConfig.salesTaxIncreases !== false : true;

// Calculate adjustment (positive = adds, negative = reduces)
let feeAdjustment = 0;
feeAdjustment += freightReducesCredit ? -fees.freight : fees.freight;
feeAdjustment += restockReducesCredit ? -fees.restockFee : fees.restockFee;
feeAdjustment += miscReducesCredit ? -fees.miscCharges : fees.miscCharges;
feeAdjustment += salesTaxIncreasesCredit ? fees.salesTax : -fees.salesTax;
feeAdjustment += fees.coreCharges; // Cores always add

// Final total
calculatedTotal = lineItemsTotal + feeAdjustment;
discrepancy = Math.abs(calculatedTotal - statedTotal);
```

**Example (TVH Parts Co):**
- Line items total: $47.35
- Handling charge: $7.10 (reduces credit)
- Expected total: $47.35 - $7.10 = **$40.25** ✓

### 6.8 Bypass Mode

Bypass mode allows documents to skip quality score checks and VRA matching failures, proceeding directly to case creation for manual processing. This is useful for bulk processing backlogs or when manual review is preferred.

**Enable via Script Deployment Parameters:**
| Script | Parameter ID | Type |
|--------|--------------|------|
| Normalize MapReduce | `custscript_vcn_bypass_mode` | Checkbox |
| Match MapReduce | `custscript_vcm_bypass_mode` | Checkbox |

**Both must be enabled for full bypass mode.**

**Routing Changes in Bypass Mode:**

| Normal Trigger | Normal Behavior | Bypass Behavior |
|----------------|-----------------|-----------------|
| Quality Score 85-100 | PENDING_MATCH | PENDING_MATCH |
| Quality Score 70-84 | REVIEW_REQUIRED | **PENDING_MATCH** |
| Quality Score < 70 | REVIEW_REQUIRED | **PENDING_MATCH** |
| VRA match found | MATCHED → CASE | MATCHED → CASE |
| No VRA match (has refs) | REVIEW_REQUIRED | **MATCHED → CASE** |
| No VRA match (no refs) | REVIEW_REQUIRED | **MATCHED → CASE** |
| Vendor/PO mismatch | REVIEW_REQUIRED | REVIEW_REQUIRED |

**Flow in Bypass Mode:**
```
[OCR] → [NORMALIZE] → [MATCH] → [CASE]
              ↓              ↓
         Skip quality    Skip VRA
         score routing   match checks
              ↓              ↓
         Always go to    Always go to
         PENDING_MATCH   CASE_CREATED
         (unless vendor  (even without
          mismatch)       VRA match)
```

**Use Cases:**
- Initial bulk processing of backlogged vendor credits
- Vendors without VRAs in the system
- When manual case review is preferred over automated matching

### 6.9 Case Creation

Support Cases are created for matched vendor credits with all relevant details for AP review.

**Case Field Mapping:**
```javascript
const CASE_CONFIG = {
    company: '131487',           // HUL - NXC Internal (customer)
    custevent_nx_customer: '131487',  // Also set NX customer field
    category: '7',               // A/P Request category
    origin: '-5',                // Website origin
    cseg_sna_revenue_st: '2'     // Internal revenue stream
};

caseRecord.setValue({ fieldId: 'title', value: `${vendorEntityId} ${vendorName} - Vendor Credit` });
caseRecord.setValue({ fieldId: 'custevent_nx_case_details', value: buildCaseDetails(normalized) });
```

**Case Title Format:** `{vendorEntityId} {vendorName} - Vendor Credit`
Example: `TVH TVH Parts Co. - Vendor Credit`

**Duplicate Detection:**
The system prevents duplicate cases by:
1. Checking if `custrecord_vcl_case_id` already has a value
2. Verifying the case still exists (handles deleted cases)
3. If case was deleted, clearing the reference and allowing new case creation

```javascript
// Check for existing case
const existingCaseId = logRecord.getValue(vcLib.VCL_FIELDS.caseId);
if (existingCaseId) {
    try {
        // Verify case exists
        search.lookupFields({
            type: record.Type.SUPPORT_CASE,
            id: existingCaseId,
            columns: ['casenumber']
        });
        // Case exists - skip
        return null;
    } catch (e) {
        // Case deleted - clear and allow new creation
        record.submitFields({
            type: vcLib.CONFIG.RECORDS.PROCESSING_LOG,
            id: logId,
            values: { [vcLib.VCL_FIELDS.caseId]: '' }
        });
    }
}
```

---

## 7. File Structure

```
FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/
├── Libraries/
│   └── hul_lib_vendor_credit.js          # Shared library (700+ lines)
├── MapReduce/
│   ├── hul_mr_vendor_credit_ocr.js       # OCR processing
│   ├── hul_mr_vendor_credit_normalize.js # Normalization
│   ├── hul_mr_vendor_credit_match.js     # VRA matching
│   └── hul_mr_vendor_credit_case.js      # Case creation
├── Scheduled/
│   └── hul_ss_vendor_credit_monitor.js   # Queue monitor
├── Suitelets/
│   └── hul_sl_vendor_credit.js           # Dashboard UI
├── ClientScripts/
│   └── hul_cs_vendor_credit.js           # UI interactions
└── Documentation/
    ├── CustomRecords_VendorCredit.md     # Setup guide
    └── PRDs/
        └── PRD-20260104-VendorCreditProcessor.md
```

### 7.1 File Cabinet Structure

```
File Cabinet/
└── Vendor Credits/
    ├── Incoming/           ← Upload PDFs here
    │   ├── Parts/
    │   ├── Warranty/
    │   └── Sales/
    ├── Processing/         ← Files during OCR
    ├── Processed/          ← Successfully completed
    └── Failed/             ← Needs manual review
```

---

## 8. Custom Records

### 8.1 Vendor Credit Config (`customrecord_vendor_credit_config`)

| Field ID | Type | Purpose |
|----------|------|---------|
| `custrecord_vcc_vendor` | List:vendor | NetSuite vendor link |
| `custrecord_vcc_name` | Text | Display name |
| `custrecord_vcc_is_active` | Checkbox | Active flag |
| `custrecord_vcc_sign_convention` | List | positive_credit, negative_credit, mixed |
| `custrecord_vcc_line_sign_rule` | List | always_negative, always_positive, trust_ocr |
| `custrecord_vcc_restock_patterns` | Long Text | JSON array of regex patterns |
| `custrecord_vcc_core_patterns` | Long Text | JSON array |
| `custrecord_vcc_date_format` | Text | e.g., "MM/DD/YYYY" |
| `custrecord_vcc_po_patterns` | Long Text | JSON array for PO extraction |
| `custrecord_vcc_vra_patterns` | Long Text | JSON array for VRA extraction |
| `custrecord_vcc_item_suffixes` | Long Text | JSON array e.g., ["-JLG", "-MIT"] |
| `custrecord_vcc_match_threshold` | Integer | Item match % required (default 50) |
| `custrecord_vcc_confidence` | Integer | Baseline confidence 0-100 |
| `custrecord_vcc_total_processed` | Integer | Count |
| `custrecord_vcc_success_count` | Integer | Auto-approved count |
| `custrecord_vcc_avg_quality` | Decimal | Rolling average |
| `custrecord_vcc_freight_reduces` | Checkbox | Freight/shipping reduces credit (default: true) |
| `custrecord_vcc_freight_location` | List | Where freight appears: 1=Subtotal, 2=Line Item, 3=None |
| `custrecord_vcc_freight_patterns` | Long Text | JSON array of patterns to identify freight line items |
| `custrecord_vcc_restock_is_charge` | Checkbox | Restocking fees reduce credit (default: true) |
| `custrecord_vcc_misc_reduces` | Checkbox | Misc fees reduce credit (default: true) |
| `custrecord_vcc_sales_tax_increases` | Checkbox | Sales tax refund increases credit (default: true) |

### 8.2 Processing Log (`customrecord_vendor_credit_log`)

| Field ID | Type | Purpose |
|----------|------|---------|
| `custrecord_vcl_process_id` | Text | Unique identifier |
| `custrecord_vcl_vendor` | List:vendor | Vendor reference |
| `custrecord_vcl_vendor_config` | List:vendor_credit_config | Config reference |
| `custrecord_vcl_document_name` | Text | PDF filename |
| `custrecord_vcl_file` | Document | File Cabinet reference |
| `custrecord_vcl_file_hash` | Text | Duplicate detection |
| `custrecord_vcl_raw_ocr` | Long Text | JSON - raw OCR response |
| `custrecord_vcl_normalized` | Long Text | JSON - normalized data |
| `custrecord_vcl_quality_score` | Integer | 0-100 |
| `custrecord_vcl_status` | List | State machine value |
| `custrecord_vcl_error_type` | List | Error classification |
| `custrecord_vcl_retry_count` | Integer | Current retry count |
| `custrecord_vcl_next_retry` | DateTime | When to retry |
| `custrecord_vcl_matched_vra` | List:transaction | VRA link |
| `custrecord_vcl_matched_po` | List:transaction | PO link |
| `custrecord_vcl_match_method` | Text | vra_direct, po_lookup, vendor_items |
| `custrecord_vcl_match_confidence` | Integer | 0-100 |
| `custrecord_vcl_case_id` | List:supportcase | Created case |
| `custrecord_vcl_credit_amount` | Currency | Credit total |
| `custrecord_vcl_discrepancy` | Currency | Calculated vs stated |
| `custrecord_vcl_warnings` | Long Text | JSON array |
| `custrecord_vcl_state_history` | Long Text | JSON - state transitions |

### 8.3 Vendor Name Alias (`customrecord_vendor_name_alias`)

| Field ID | Type | Purpose |
|----------|------|---------|
| `custrecord_vna_config` | List:vendor_credit_config | Parent config |
| `custrecord_vna_alias` | Text | Alternate vendor name |
| `custrecord_vna_score` | Integer | Fuzzy match score |
| `custrecord_vna_times_seen` | Integer | Usage count |

### 8.4 Learned Alias (`customrecord_vc_learned_alias`)

Stores vendor name mappings learned from user corrections and high-confidence AI matches. Reduces API costs by caching successful mappings.

| Field ID | Type | Purpose |
|----------|------|---------|
| `custrecord_vcla_ocr_text` | Free-Form Text | The OCR vendor name (lowercased for lookup) |
| `custrecord_vcla_vendor` | List:vendor | The correct NetSuite vendor |
| `custrecord_vcla_created_by` | List:employee | Who made the correction |
| `custrecord_vcla_source` | Free-Form Text | How alias was created: `user_correction` or `ai_match_auto` |
| `custrecord_vcla_times_used` | Integer | Counter for how often this alias matched |

**Record Settings:**
- Name: "VC Learned Alias"
- ID: `customrecord_vc_learned_alias`
- Include Name Field: No (optional)

### 8.5 Script Parameters

**Normalize MapReduce (`customdeploy_hul_mr_vc_norm`):**

| Parameter ID | Label | Type | Description |
|--------------|-------|------|-------------|
| `custscript_vcn_openai_key` | OpenAI API Key | Password | OpenAI API key for embeddings |
| `custscript_vcn_supabase_url` | Supabase URL | Free-Form Text | Supabase project URL |
| `custscript_vcn_supabase_key` | Supabase Key | Password | Supabase anon key |
| `custscript_vcn_bypass_mode` | Bypass Mode | Checkbox | Skip quality score routing |

**Match MapReduce (`customdeploy_hul_mr_vc_match`):**

| Parameter ID | Label | Type | Description |
|--------------|-------|------|-------------|
| `custscript_vcm_bypass_mode` | Bypass Mode | Checkbox | Skip VRA match failure routing |

---

## 9. User Interface

### 9.1 Dashboard View

**Status Cards (6):**
- Pending OCR (yellow)
- OCR Complete (blue)
- Pending Match (blue)
- Matched (green)
- Needs Review (orange)
- Failed (red)

**Summary Stats (4):**
- Today's Processed count
- Total Credit Amount today
- Success Rate %
- Average Quality Score

**Two-Column Layout:**
- Recent Activity (10 most recent)
- Vendor Performance (7-day stats)

### 9.2 Queue View

**Filter Controls:**
| Control | Type | Purpose |
|---------|------|---------|
| Status Dropdown | Select | Filter by specific status |
| Active Only | Checkbox | Hide completed/failed records (checked by default) |
| Search | Text input | Filter by document name, vendor, or process ID |

**Active Statuses (shown when "Active Only" checked):**
- Received (1)
- OCR Pending (2)
- OCR Complete (3)
- Pending Match (5)
- Needs Review (8)

**Inactive Statuses (hidden by default):**
- Matched (7)
- Case Created (9)
- Complete (10)
- Failed (11)

**Table Columns:**
| Column | Purpose |
|--------|---------|
| Process ID | Unique identifier |
| Document | Filename (clickable) |
| Vendor | Vendor name with confidence % |
| Amount | Credit amount |
| OCR | Quality score badge (color-coded) |
| Status | Status badge |
| Matched VRA | VRA reference with confidence % |
| Created | Timestamp |
| Actions | View/Retry buttons |

**Pagination:** 30 records per page with Previous/Next controls

### 9.3 Review Queue (List View)

**Filter Controls:**
| Control | Type | Purpose |
|---------|------|---------|
| Search | Text input | Filter by document name or vendor |

**Table Columns:**
| Column | Purpose |
|--------|---------|
| Document | Filename |
| Vendor | Vendor name |
| Amount | Credit amount |
| OCR | Quality score badge |
| Issue | Error type or "Review required" |
| Action | Review button (links to detail view) |

**Pagination:** 30 records per page with Previous/Next controls

### 9.4 Review Detail View

**Left Panel:**
- Extracted Data table (vendor, document #, date, amounts)
- Vendor correction fields (typeahead search by entity ID)
- Warnings list
- Line Items table
- Fees & Charges section (breakdown of all fees with calculation summary)

**Right Panel:**
- Match Result (found/not found, method, confidence)
- Original Document link (PDF)
- Processing History (state transitions)

**Fees & Charges Display:**
| Field | Description |
|-------|-------------|
| Line Items Total | Sum of all line items |
| Freight/Shipping | Fee amount with +/- indicator |
| Restocking Fee | Fee amount with +/- indicator |
| Sales Tax | Tax amount with +/- indicator |
| Misc Charges | Other charges with +/- indicator |
| Core Charges | Core credit with +/- indicator |
| **Calculated Total** | Final calculated amount |
| **Stated Total** | OCR-extracted total |
| **Discrepancy** | Difference (highlighted if > $0.01) |

**Context-Aware Actions:**

The action buttons change based on document status:

| Status | Available Actions | Purpose |
|--------|-------------------|---------|
| VRA Match Failed | "Create Case (No VRA)" + "Retry VRA Matching" | Handle documents that couldn't match |
| Has Vendor | "Approve for VRA Matching" + "Skip Matching, Create Case" | Standard review path |
| No Vendor | Buttons disabled with warning | Requires vendor correction first |
| Failed Case Creation | "Retry Case Creation" | Retry after fixing issues |

**Vendor Correction:**
- Search vendors by entity ID (first 2+ characters)
- Shows vendor name + entity ID in dropdown
- Updates normalized data with `matchSource: 'user_correction'`
- Displays "manual" badge when user has corrected vendor

### 9.5 Config View (Vendor Configuration)

**Filter Controls:**
| Control | Type | Purpose |
|---------|------|---------|
| Search | Text input | Filter vendors by name |

**Table Columns:**
| Column | Purpose |
|--------|---------|
| Vendor | Vendor name |
| Sign Convention | positive_credit, negative_credit, mixed |
| Match Threshold | Item match % required |
| Confidence | Baseline confidence score |
| Processed | Total documents processed |
| Success Rate | Auto-approved percentage |
| Active | Active flag |
| Edit | Link to NetSuite record for editing |

**Pagination:** 30 records per page with Previous/Next controls

**Edit Links:** Each row has an "Edit" link that opens the vendor config custom record in NetSuite for direct field editing.

---

## 10. Improvements Over N8N Implementation

| Area | N8N Approach | NetSuite Improvement |
|------|--------------|---------------------|
| **Retry Logic** | Fixed 15-min retry | Exponential backoff (15m→30m→1h→4h→8h) |
| **Error Classification** | Generic errors | 8 categorized error types with specific handling |
| **Quality Scoring** | Fixed weights | Per-vendor adaptive scoring based on history |
| **Learning Loop** | Exists but unused | Auto-updates vendor aliases, confidence scores |
| **VRA Matching** | 50% threshold | Per-vendor thresholds with weighted item matching |
| **Case Creation** | Basic | Rich body with alternatives, confidence, suggestions |
| **Dashboard** | Google Sheets | Native Suitelet with real-time metrics |
| **Duplicate Prevention** | None | File hash + name checking |
| **OCR Extraction** | Single pass | Two-pass for complex documents |
| **Audit Trail** | Minimal | Full state machine with timestamps |

---

## 11. Risk Considerations

| Risk | Mitigation |
|------|------------|
| **Governance Units** | MapReduce handles API calls efficiently |
| **OCR Latency** | 5-30 sec per doc - async processing required |
| **Vendor Rule Complexity** | Big Lift has special patterns - thorough testing needed |
| **Match Accuracy** | 50% threshold may need per-vendor tuning |
| **Vendor Fuzzy Matching** | NetSuite saved search may not match OpenAI vector accuracy - plan for embeddings fallback if needed |
| **API Rate Limits** | Mistral has rate limits - monitor and implement backoff |

---

## 12. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2026-01-04 | Thomas Showalter / Claude Code | 1.0 | Initial development - all scripts created |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.1 | AI vendor matching via Supabase vector embeddings, learned aliases |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.2 | Fee calculation fixes - freight/restock/misc reduce credit by default |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.3 | Added Fees & Charges display section on review page |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.4 | Context-aware action buttons based on workflow state |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.5 | Fixed vendor correction to update normalized JSON data |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.6 | Case creation with correct NetSuite field IDs (company, custevent_nx_customer, cseg_sna_revenue_st) |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.7 | Duplicate case detection with case existence verification |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.8 | Added retry functionality for failed case creation |
| 2026-01-05 | Thomas Showalter / Claude Code | 1.9 | Added defensive inactive config checks, debug logging |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.0 | Dashboard UI enhancements: Config page search/pagination/edit links |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.1 | Queue/Review pagination with Active Only toggle and text search |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.2 | Layout fix: nav tabs display above content at full width |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.3 | PO lookup and vendor cross-validation during normalization |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.4 | Freight location/patterns fields for vendor-specific fee detection |
| 2026-01-06 | Thomas Showalter / Claude Code | 2.5 | Bypass Mode: skip quality/VRA checks for bulk processing |

---

## 13. Known Issues & Morning Tasks

### Learning System Issues (Priority)

The learning/auto-creation features may not be triggering correctly:

**1. Auto-Create Vendor Configs**
- **Expected:** When AI match finds a vendor (≥70% confidence), auto-create vendor config if none exists
- **Code Location:** `createDefaultVendorConfig()` in `hul_lib_vendor_credit.js` (line ~701)
- **Called From:** `findVendorConfig()` after learned alias match (line ~467) and AI match (line ~578)
- **To Verify:** Process a document from a vendor with NO existing config, check if new config is created
- **Debug:** Look for `createDefaultVendorConfig: Created new vendor config` in logs

**2. Save Learned Aliases**
- **Expected:** High-confidence AI matches (≥90%) auto-save to `customrecord_vc_learned_alias`
- **Code Location:** `saveLearnedAlias()` in `hul_lib_vendor_credit.js`
- **Called From:** `findVendorConfig()` after AI match with confidence ≥ AUTO_SAVE_THRESHOLD
- **To Verify:** Process document, get AI match ≥90%, check learned alias table for new record
- **Debug:** Look for `saveLearnedAlias` logs

**3. Update Vendor Statistics** - DEFERRED TO FUTURE PHASE
- **Status:** Fields exist on vendor config but statistics tracking not implemented
- **Deferred:** Will be part of "Adaptive Learning" phase

### Morning Checklist

1. [ ] **Test auto-create vendor config:**
   - Find vendor with no config (or delete test config)
   - Upload PDF for that vendor
   - Check if new `customrecord_vendor_credit_config` record created
   - Check logs for `createDefaultVendorConfig`

2. [ ] **Test learned alias saving:**
   - Process document that triggers AI vector matching
   - Check if `customrecord_vc_learned_alias` record created
   - Second document from same vendor should skip AI call

3. [ ] **Remove debug logging** (after issues resolved):
   - Remove verbose audit logs from `findVendorConfig`
   - Remove verbose audit logs from `mapVccResult`
   - Keep error logging

---

## 14. Future Roadmap

### Completed (Short-term)
- [x] Create custom records in NetSuite ✓
- [x] Deploy scripts to NetSuite ✓
- [x] Test full workflow (OCR → Normalize → Match → Case) ✓
- [x] Fee calculation logic with vendor config overrides ✓
- [x] Fees & Charges display on review page ✓
- [x] Context-aware action buttons ✓
- [x] Vendor correction with normalized data update ✓
- [x] Case creation with correct field mappings ✓
- [x] Duplicate case detection ✓
- [x] Config page: search, pagination, edit links ✓ (Jan 6, 2026)
- [x] Queue page: pagination, Active Only toggle, text search ✓ (Jan 6, 2026)
- [x] Review page: pagination, text search ✓ (Jan 6, 2026)
- [x] Dashboard layout: nav tabs above content, full width ✓ (Jan 6, 2026)
- [x] PO lookup and vendor cross-validation ✓ (Jan 6, 2026)
- [x] Freight location/patterns for vendor-specific fee detection ✓ (Jan 6, 2026)
- [x] Bypass Mode for bulk processing ✓ (Jan 6, 2026)

### Pending (Short-term)
- [ ] Configure 15 vendor profiles
- [ ] Test with sample PDFs from each vendor
- [ ] Schedule monitor script (every 15 min)
- [ ] End-to-end testing with various vendors

### Future Enhancements
- ~~OpenAI embeddings API fallback for vendor name matching~~ ✓ **COMPLETE** (Jan 5, 2026) - See section 6.6
- ~~Fee calculation logic with configurable behaviors~~ ✓ **COMPLETE** (Jan 5, 2026) - See section 6.7
- ~~Case creation with proper field mapping~~ ✓ **COMPLETE** (Jan 5, 2026) - See section 6.8
- ~~Auto-create vendor configs for new vendors~~ ✓ **COMPLETE** (Jan 5, 2026) - Creates with safe defaults

### Phase 2: Adaptive Learning (Future)
- Update vendor config statistics after processing (totalProcessed, avgQuality, successCount)
- Auto-adjust confidence scores based on success rates
- Pattern detection for fee sign corrections
- Auto-improvement job (daily) to tune vendor profiles from accumulated data
- Suggest config changes based on user corrections
- Email alerts for high-value credits or error spikes
- Export queue to CSV
- Bulk actions (approve/reject multiple)
- API endpoint for external PDF submission
- Integration with VersaPay for credit application
- Mobile-friendly review interface
