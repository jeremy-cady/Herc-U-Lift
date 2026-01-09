# Vendor Credit Processing - Custom Record Setup Guide

This document details the custom records that need to be created in NetSuite for the Vendor Credit PDF Processing system.

---

## 1. customrecord_vendor_credit_config (Vendor Rules)

**Purpose:** Stores vendor-specific parsing rules for OCR data normalization.

**Create in NetSuite:**
Customization > Lists, Records, & Fields > Record Types > New

| Setting | Value |
|---------|-------|
| Name | Vendor Credit Config |
| ID | customrecord_vendor_credit_config |
| Access Type | No Permission Required |

### Fields

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| **Core Identification** |
| custrecord_vcc_vendor | Vendor | List/Record (Vendor) | Link to NetSuite vendor |
| custrecord_vcc_name | Display Name | Free-Form Text | For UI display |
| custrecord_vcc_is_active | Active | Checkbox | Default: checked |
| **Sign Conventions** |
| custrecord_vcc_sign_convention | Sign Convention | List/Record | See list below |
| custrecord_vcc_line_sign_rule | Line Sign Rule | List/Record | See list below |
| custrecord_vcc_total_sign_rule | Total Sign Rule | List/Record | See list below |
| **Fee Detection** |
| custrecord_vcc_restock_location | Restock Fee Location | List/Record | See list below |
| custrecord_vcc_restock_patterns | Restock Fee Patterns | Long Text | JSON array of regex patterns |
| custrecord_vcc_restock_is_charge | Restock Is Charge | Checkbox | |
| custrecord_vcc_core_location | Core Charge Location | List/Record | See list below |
| custrecord_vcc_core_patterns | Core Charge Patterns | Long Text | JSON array |
| custrecord_vcc_misc_patterns | Misc Charge Patterns | Long Text | JSON array |
| custrecord_vcc_sales_tax_increases | Sales Tax Increases Credit | Checkbox | |
| custrecord_vcc_misc_reduces | Misc Reduces Credit | Checkbox | |
| custrecord_vcc_freight_location | Freight Location | List/Record | Uses custlist_vcc_fee_location |
| custrecord_vcc_freight_patterns | Freight Patterns | Long Text | JSON array e.g., ["FREIGHT", "SHIPPING"] |
| **Document Format** |
| custrecord_vcc_date_format | Date Format | Free-Form Text | e.g., "MM/DD/YYYY" |
| custrecord_vcc_po_patterns | PO Number Patterns | Long Text | JSON array |
| custrecord_vcc_vra_patterns | VRA Number Patterns | Long Text | JSON array |
| custrecord_vcc_item_suffixes | Item Suffixes to Strip | Long Text | JSON array e.g., ["-JLG", "-MIT"] |
| **Matching Settings** |
| custrecord_vcc_match_threshold | Match Threshold % | Integer Number | Default: 50 |
| custrecord_vcc_prefer_recent_vra | Prefer Recent VRA | Checkbox | |
| custrecord_vcc_approval_threshold | Auto-Approval Threshold | Integer Number | Default: 85 |
| custrecord_vcc_review_threshold | Review Threshold | Integer Number | Default: 70 |
| **Adaptive Scoring (Auto-updated)** |
| custrecord_vcc_confidence | Baseline Confidence | Integer Number | 0-100, Default: 70 |
| custrecord_vcc_total_processed | Total Processed | Integer Number | Default: 0 |
| custrecord_vcc_success_count | Success Count | Integer Number | Default: 0 |
| custrecord_vcc_failure_count | Failure Count | Integer Number | Default: 0 |
| custrecord_vcc_avg_quality | Average Quality Score | Decimal Number | |
| custrecord_vcc_last_processed | Last Processed | Date/Time | |
| **OCR Settings** |
| custrecord_vcc_ocr_schema | Custom OCR Schema | Long Text | JSON (optional) |
| custrecord_vcc_multipage | Multi-page Documents | Checkbox | |
| custrecord_vcc_max_pages | Max Pages | Integer Number | Default: 10 |

### Supporting Lists to Create

**Sign Convention (custlist_vcc_sign_convention):**
1. positive_credit - Positive amounts are credits
2. negative_credit - Negative amounts are credits
3. mixed - Mixed/conditional

**Line Sign Rule (custlist_vcc_line_sign_rule):**
1. always_negative - Always negative
2. always_positive - Always positive
3. trust_ocr - Trust OCR values
4. conditional - Apply conditions

**Total Sign Rule (custlist_vcc_total_sign_rule):**
1. follow_convention - Follow sign convention
2. always_negative - Always negative
3. trust_ocr - Trust OCR value

**Fee Location (custlist_vcc_fee_location):**
1. subtotal - In subtotals section
2. line_item - As line items
3. none - Not present

---

## 2. customrecord_vendor_credit_log (Processing History)

**Purpose:** Tracks each vendor credit document through the processing pipeline.

| Setting | Value |
|---------|-------|
| Name | Vendor Credit Log |
| ID | customrecord_vendor_credit_log |
| Access Type | No Permission Required |

### Fields

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| **Core** |
| custrecord_vcl_process_id | Process ID | Free-Form Text | Unique identifier |
| custrecord_vcl_vendor | Vendor | List/Record (Vendor) | |
| custrecord_vcl_vendor_config | Vendor Config | List/Record (customrecord_vendor_credit_config) | |
| custrecord_vcl_document_name | Document Name | Free-Form Text | Original filename |
| custrecord_vcl_file | PDF File | Document | File Cabinet reference |
| custrecord_vcl_file_hash | File Hash | Free-Form Text | For duplicate detection |
| **OCR Data** |
| custrecord_vcl_raw_ocr | Raw OCR Data | Long Text | JSON from Mistral |
| custrecord_vcl_normalized | Normalized Data | Long Text | JSON after processing |
| custrecord_vcl_quality_score | Quality Score | Integer Number | 0-100 |
| **Status** |
| custrecord_vcl_status | Status | List/Record | See list below |
| custrecord_vcl_error_type | Error Type | List/Record | See list below |
| custrecord_vcl_retry_count | Retry Count | Integer Number | Default: 0 |
| custrecord_vcl_next_retry | Next Retry | Date/Time | |
| **Matching** |
| custrecord_vcl_matched_vra | Matched VRA | List/Record (Transaction) | |
| custrecord_vcl_matched_po | Matched PO | List/Record (Transaction) | |
| custrecord_vcl_match_method | Match Method | Free-Form Text | vra_direct, po_lookup, vendor_items |
| custrecord_vcl_match_confidence | Match Confidence | Integer Number | 0-100 |
| **Case** |
| custrecord_vcl_case_id | Support Case | List/Record (Support Case) | |
| **Financials** |
| custrecord_vcl_credit_amount | Credit Amount | Currency | |
| custrecord_vcl_discrepancy | Discrepancy | Currency | |
| **Audit** |
| custrecord_vcl_warnings | Warnings | Long Text | JSON array |
| custrecord_vcl_state_history | State History | Long Text | JSON array with timestamps |

### Processing Status List (customlist_vcl_status)
1. received - PDF received, pending OCR
2. ocr_pending - Queued for OCR
3. ocr_complete - OCR finished
4. normalizing - Applying vendor rules
5. pending_match - Ready for VRA matching
6. matching - Match in progress
7. matched - VRA match found
8. review_required - Needs manual review
9. case_created - Support case created
10. completed - Fully processed
11. failed - Processing failed

### Error Type List (customlist_vcl_error_type)
1. OCR_EXTRACTION_FAILED - OCR could not extract data
2. VENDOR_NOT_RECOGNIZED - Vendor not in config
3. VRA_NO_MATCH - No VRA match found
4. VRA_MULTIPLE_MATCHES - Ambiguous match
5. TOTAL_VALIDATION_FAILED - Totals don't reconcile
6. API_RATE_LIMITED - External API limit hit
7. FILE_CORRUPT - PDF file corrupted
8. DUPLICATE_FILE - Already processed
9. VENDOR_PO_MISMATCH - AI vendor doesn't match PO vendor

---

## 3. customrecord_vendor_name_alias (Fuzzy Matching)

**Purpose:** Maps OCR-extracted vendor names to vendor config records.

| Setting | Value |
|---------|-------|
| Name | Vendor Name Alias |
| ID | customrecord_vendor_name_alias |
| Access Type | No Permission Required |

### Fields

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| custrecord_vna_config | Vendor Config | List/Record (customrecord_vendor_credit_config) | Parent config |
| custrecord_vna_alias | Alias | Free-Form Text | OCR-extracted name variant |
| custrecord_vna_score | Match Score | Integer Number | Confidence 0-100 |
| custrecord_vna_times_seen | Times Seen | Integer Number | Usage frequency |
| custrecord_vna_approved | Approved | Checkbox | Verified by user |

---

## File Cabinet Folder Structure

Create the following folders in File Cabinet:

```
Vendor Credits/
├── Incoming/
│   ├── Parts/
│   ├── Warranty/
│   └── Sales/
├── Processing/
├── Processed/
└── Failed/
```

**Folder IDs (record after creation):**
- Incoming/Parts: ______
- Incoming/Warranty: ______
- Incoming/Sales: ______
- Processing: ______
- Processed: ______
- Failed: ______

---

## Initial Vendor Configurations

After creating the custom record type, create these 15 vendor configurations based on Supabase data:

| Vendor | Sign Convention | Line Rule | Confidence | Special Notes |
|--------|----------------|-----------|------------|---------------|
| Mitsubishi Logisnext | negative_credit | always_negative | 90 | High confidence |
| Big Lift LLC | mixed | trust_ocr | 85 | Special restock pattern: "25.0000% Restock Fee" |
| TVH | mixed | trust_ocr | 85 | Core patterns: ["**CORE**", "Core Charge", "*CORE*"] |
| Trackmobile LLC | positive_credit | always_negative | 85 | |
| Hyundai | - | - | 70 | |
| Cascade | - | - | 70 | |
| Grainger | - | - | 70 | |
| Arnold Machinery | - | - | 70 | |
| Hoist Liftruck | - | - | 70 | |
| Niftylift | - | - | 70 | |

---

## Script Deployments Required

After creating custom records and uploading scripts:

### 1. MapReduce Scripts
| Script | Schedule | Parameters |
|--------|----------|------------|
| hul_mr_vendor_credit_ocr | Triggered by monitor | custscript_vco_mistral_key |
| hul_mr_vendor_credit_normalize | Triggered by monitor | custscript_vcn_bypass_mode (Checkbox) |
| hul_mr_vendor_credit_match | Triggered by monitor | custscript_vcm_bypass_mode (Checkbox) |
| hul_mr_vendor_credit_case | Triggered by monitor | |

### 2. Scheduled Script
| Script | Schedule | Parameters |
|--------|----------|------------|
| hul_ss_vendor_credit_monitor | Every 15 minutes | |

---

## Bypass Mode

**Purpose:** Skip quality score checks and VRA matching failures, sending documents directly to case creation for manual processing. Only vendor/PO mismatch issues will still route to review.

### How to Enable

Enable both checkboxes on the script deployments:
1. `custscript_vcn_bypass_mode` on Normalize MapReduce deployment
2. `custscript_vcm_bypass_mode` on Match MapReduce deployment

### Behavior When Enabled

| Normal Trigger | Bypass Behavior |
|----------------|-----------------|
| Quality Score 70-84 | Proceeds to matching |
| Quality Score < 70 | Proceeds to matching |
| Has references, no VRA match | Proceeds to case creation |
| No references, no VRA match | Proceeds to case creation |
| Vendor/PO mismatch | **Still routes to review** |

### Use Cases

- Initial bulk processing of backlogged vendor credits
- Vendors without VRAs in the system
- When manual case review is preferred over automated matching

### 3. Suitelet
| Script | Audience | Parameters |
|--------|----------|------------|
| hul_sl_vendor_credit | Admin role | |

---

## Post-Setup Checklist

- [ ] Custom record types created
- [ ] Supporting lists created
- [ ] File Cabinet folders created
- [ ] Folder IDs recorded above
- [ ] 15 vendor configs entered
- [ ] Scripts uploaded to File Cabinet
- [ ] Script records created
- [ ] Script deployments configured
- [ ] Mistral API key added to script parameter
- [ ] Test with single vendor credit PDF
