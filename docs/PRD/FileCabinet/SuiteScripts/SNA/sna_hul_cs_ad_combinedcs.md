# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CombinedCS
title: Combined Pricing, Rental, and Service Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_ad_combinedcs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order, Estimate, Return Authorization, and related sales transactions
  - Customer, Item, Project/Job
  - Custom pricing records (PM pricing, resource pricing, rental rate cards)

---

## 1. Overview
A combined client script that handles item pricing, rental pricing, temporary items, service pricing, and related UI behaviors across sales transactions.

## 2. Business Goal
Centralizes multiple client-side pricing and rental workflows into a single script so sales users can price items, rentals, and services consistently.

## 3. User Story
As a sales rep, when I enter lines on transactions, I want pricing calculated automatically, so that I do not adjust rates manually.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | Transaction load | Initialize pricing/rental logic |
| lineInit | TBD | Line selected | Initialize line-level behaviors |
| fieldChanged | TBD | Pricing/rental fields change | Recalculate pricing and rental values |
| validateField | TBD | Field validation | Enforce pricing rules |
| postSourcing | TBD | Item sourced | Apply pricing defaults |
| validateLine | TBD | Line validation | Enforce line-level constraints |
| saveRecord | TBD | Record save | Validate pricing/rental requirements |

## 5. Functional Requirements
- The system must handle client events: `pageInit`, `lineInit`, `fieldChanged`, `validateField`, `postSourcing`, `validateLine`, and `saveRecord`.
- The system must evaluate customer pricing groups, sales zones, and item data to derive pricing rules.
- The system must calculate rental pricing based on rate cards, rental start/end dates, time unit, quantity, and best price tables.
- The system must support service pricing rules including equipment category, revenue stream, and customer pricing group.
- The system must enforce line behaviors such as locked rates, temporary items, and service pricing validations.
- The system must provide helper functions for common lookups and search pagination.
- The system must handle date formatting and utility functions for UI display and calculations.

## 6. Data Contract
### Record Types Involved
- Sales Order, Estimate, Return Authorization, and related sales transactions
- Customer, Item, Project/Job
- Custom pricing records (PM pricing, resource pricing, rental rate cards)

### Fields Referenced
- Rental fields: `custcol_sna_hul_rent_start_date`, `custcol_sna_hul_rent_end_date`, `custcol_sna_hul_time_unit`, `custcol_sna_hul_rental_hrs`
- Pricing fields: `custcol_sna_day_rate`, `custcol_sna_weekly_rate`, `custcol_sna_4week_rate`, `custcol_sna_day_bestprice`, `custcol_sna_week_bestprice`
- Segment fields: `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`
- Various custom pricing and configuration fields referenced in the script

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing pricing tables or rate cards.
- Locked rates that should not be overridden.
- Search failures should be logged and not break the UI.

## 8. Implementation Notes (Optional)
- Large client script with multiple responsibilities.
- Uses extensive search lookups which can affect UI performance.
- Uses `SuiteScripts/moment.js`.

## 9. Acceptance Criteria
- Given relevant fields change, when the script runs, then line pricing updates.
- Given rental lines, when the script runs, then time quantities and rates calculate correctly.
- Given service pricing, when the script runs, then correct pricing tables and revenue streams are used.
- Given validations, when the script runs, then invalid line configurations are prevented.

## 10. Testing Notes
- Add a rental line and verify quantity/rate calculations.
- Add service line and verify pricing rules apply.
- Change key fields and verify client recalculations.
- Missing pricing tables or rate cards.
- Locked rates that should not be overridden.
- Search failures should be logged and not break the UI.

## 11. Deployment Notes
- Upload `sna_hul_cs_ad_combinedcs.js`.
- Deploy to target transaction forms.
- Validate pricing behavior in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the combined script be split into smaller modules?
- Are there performance issues on large transactions?
- Risk: Large client script impacts UI performance (Mitigation: Refactor into modules and lazy-load logic)
- Risk: Pricing configuration changes break rules (Mitigation: Add admin documentation and validation checks)

---
