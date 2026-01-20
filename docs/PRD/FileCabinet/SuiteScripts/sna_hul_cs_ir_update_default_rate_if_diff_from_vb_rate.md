# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-IRUpdateDefaultRate
title: Item Receipt Rate Sync Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_ir_update_default_rate_if_diff_from_vb_rate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Receipt
  - Purchase Order
  - Vendor Bill

---

## 1. Overview
A client script that updates Item Receipt line rates to match related Vendor Bill rates when a PO is received.

---

## 2. Business Goal
Ensure Item Receipt rates align with Vendor Bill rates when override flags are set.

---

## 3. User Story
As a receiving user, when I receive from a PO, I want Item Receipt rates to match Vendor Bills, so that costing is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | createdfrom | copy mode | Search related Vendor Bills and sync rates |

---

## 5. Functional Requirements
- On page init in copy mode, identify the source purchase order.
- Search Vendor Bills applied to the purchase order and group by item and override flag.
- For each Item Receipt line, if the related Vendor Bill has `custcol_sna_override_ir_price` enabled and the rates differ, update the Item Receipt line rate to match the Vendor Bill rate.
- Commit each updated line.

---

## 6. Data Contract
### Record Types Involved
- Item Receipt
- Purchase Order
- Vendor Bill

### Fields Referenced
- Line | custcol_sna_override_ir_price
- Line | item
- Line | rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No related Vendor Bill; no changes.
- Override flag not set; no changes.
- Missing VB rate; skip update.

---

## 8. Implementation Notes (Optional)
- Vendor Bill search filtered by applied transaction and item.
- Search filters are mutated per line; ensure reset or new search if extending.

---

## 9. Acceptance Criteria
- Given override flag enabled and rates differ, when the form loads in copy mode, then Item Receipt rates update to match Vendor Bill rates.
- Given no Vendor Bill rate, when the form loads, then no changes are made.

---

## 10. Testing Notes
- Receive from PO with VB override flag; verify IR rates update.
- No related Vendor Bill; verify no changes.
- Override flag not set; verify no changes.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_ir_update_default_rate_if_diff_from_vb_rate.js`.
- Deploy to Item Receipt forms.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the Vendor Bill search be rebuilt per line to avoid filter accumulation?
- Risk: Search filters accumulate per line.

---
