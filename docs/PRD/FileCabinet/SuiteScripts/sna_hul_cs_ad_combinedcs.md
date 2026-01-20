# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CombinedCS
title: Combined Sales/Estimate Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_ad_combinedcs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Estimate
  - Customer
  - Item
  - Project (Job)

---

## 1. Overview
A consolidated client script that handles item pricing, rental calculations, temporary items, asset fleet logic, and service/PM pricing for Sales Orders and Estimates.

---

## 2. Business Goal
Centralize pricing and rental logic to keep transactions consistent and reduce duplicated client scripts.

---

## 3. User Story
As a sales or service user, when I enter sales orders or estimates, I want rental and service pricing calculated automatically, so that pricing and codes are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Client events | multiple fields | pageInit, lineInit, fieldChanged, validateField, postSourcing, validateLine, saveRecord | Calculate rental pricing, service pricing, and handle temporary items |

---

## 5. Functional Requirements
- Implement client script entry points: `pageInit`, `lineInit`, `fieldChanged`, `validateField`, `postSourcing`, `validateLine`, and `saveRecord`.
- Compute rental days and hours using transaction dates and line-level rental dates.
- Calculate best price per rental rate card and update rental-related line fields.
- Support temporary item entry via the temporary item Suitelet and update line values.
- Determine service pricing by customer pricing group, revenue stream, equipment category, and other filters.
- Open the "Select Object" Suitelet when prompted.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Estimate
- Customer
- Item
- Project (Job)

### Fields Referenced
- Rental: custcol_sna_hul_rent_start_date, custcol_sna_hul_rent_end_date, custcol_sna_hul_rental_hrs, custcol_sna_day_rate, custcol_sna_weekly_rate, custcol_sna_4week_rate
- Service pricing: custbody_sna_hul_cus_pricing_grp, cseg_sna_revenue_st, custcol_sna_hul_gen_prodpost_grp
- Temporary items: custcol_sna_hul_item_vendor, custcol_sna_hul_vendor_item_code, custcol_sna_hul_estimated_po_rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing customer/location shows alert and blocks Suitelet.
- Rate card missing; rental calculations skip.

---

## 8. Implementation Notes (Optional)
- Uses `SuiteScripts/moment.js` for date handling.
- External dependency: MathJS API for formula evaluation.
- Performance/governance considerations: client-side searches can slow entry on large transactions.

---

## 9. Acceptance Criteria
- Given rental dates, when entered, then rental line fields update based on dates and rate cards.
- Given service items with revenue stream, when entered, then pricing returns a consistent PM rate.
- Given temporary items are added via the Suitelet, when saved, then line items are added correctly.

---

## 10. Testing Notes
- Enter rental dates; confirm rate/amount fields update.
- Enter service items with revenue stream; confirm unit pricing.
- Add temporary items via Suitelet; confirm line values.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_ad_combinedcs.js`.
- Deploy on Sales Order and Estimate forms.
- Ensure dependent Suitelets and libraries are deployed.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should external MathJS calls be replaced with internal calculations?
- Risk: Client script performance on large orders.
- Risk: External API dependency fails.

---
