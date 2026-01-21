# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PMPricingMatrix
title: PM Pricing Matrix Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_pm_pricing_matrix.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_sna_hul_pmpricingrate
  - customrecord_sna_sales_zone
  - customrecord_cseg_sna_hul_eq_seg

---

## 1. Overview
User Event on Sales Orders that calculates planned maintenance rates using the PM pricing matrix and updates service line rates.

---

## 2. Business Goal
Ensure planned maintenance charges are calculated consistently based on equipment, service action, zip, and pricing group rules.

---

## 3. User Story
As a service billing user, when saving Sales Orders, I want PM rates calculated automatically, so that billing matches pricing rules.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | Service lines | non-closed status | Calculate PM rates and update line rates/amounts |
| afterSubmit | Service lines | non-closed status | Zero non-PM lines and roll totals into PM line |

---

## 5. Functional Requirements
- On beforeSubmit (non-closed statuses), calculate PM rates and update line rates/amounts.
- On afterSubmit (non-closed statuses), zero out non-PM service lines and roll totals into PM line.
- Use sales zone, equipment segment, service action, frequency, quantity, and pricing group rules to find PM rates.
- Set `custcol_sna_hul_lock_rate` when a PM rate is applied.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_sna_hul_pmpricingrate
- customrecord_sna_sales_zone
- customrecord_cseg_sna_hul_eq_seg

### Fields Referenced
- salesorder | cseg_sna_revenue_st | Revenue stream
- salesorder | custbody_sna_pm_added | PM added flag
- salesorder line | custcol_sna_hul_lock_rate | Lock rate flag
- salesorder line | custcol_sna_service_itemcode | Service action
- salesorder line | custcol_sna_hul_object_frequency | Frequency
- salesorder line | custcol_sna_hul_fleet_no | Object number
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpricepmrate | PM rate
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmcustpricegroup | Customer pricing group
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpricezip | Zip code
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpriceequiptype | Equipment type

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Order status G/H skips updates.
- Search errors are logged.
- Pricing matrix gaps can lead to zero rates.

---

## 8. Implementation Notes (Optional)
- Uses sales zone and equipment segment lookups.
- Performance/governance considerations: Multiple searches and line updates per Sales Order.

---

## 9. Acceptance Criteria
- Given PM service lines, when beforeSubmit runs, then rates are calculated and locked based on matrix rules.
- Given non-PM service lines, when afterSubmit runs, then they are zeroed and rolled into PM line.

---

## 10. Testing Notes
- Sales Order with PM lines applies correct PM rates.
- Order status G/H skips updates.
- Deploy User Event on Sales Order.

---

## 11. Deployment Notes
- Confirm PM pricing matrix and sales zone records.
- Deploy User Event on Sales Order and validate PM rate updates.
- Monitor logs for pricing errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should PM pricing be cached to reduce search load?

---
