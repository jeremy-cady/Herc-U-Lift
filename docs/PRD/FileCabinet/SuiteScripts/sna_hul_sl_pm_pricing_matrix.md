# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PmPricingMatrix
title: PM Pricing Matrix
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_pm_pricing_matrix.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_cseg_sna_hul_eq_seg
  - customrecord_cseg_sna_revenue_st
  - customrecord_sna_objects
  - customrecord_nx_project_type

---

## 1. Overview
Suitelet that renders a UI to select PM pricing matrix rates for an Estimate line.

---

## 2. Business Goal
Provides a filtered view of PM pricing matrix rates and lets users apply a rate back to the calling context.

---

## 3. User Story
- As a service user, when I find PM pricing rates, I want to set correct line pricing, so that estimates are accurate.
- As a dispatcher, when I filter by equipment and service action, I want results to be relevant, so that selection is efficient.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | customer, item, line, geography, equipment type, service action, object, frequency | Parameters provided | Display filtered PM rates and allow selection |

---

## 5. Functional Requirements
- Read parameters for customer, item, line, geography, equipment type, service action, object, and frequency.
- Call `getPMRates` from `sna_hul_ue_pm_pricing_matrix` to retrieve rates.
- Filter rates by equipment type (including children), service action, frequency, and object when provided.
- Display a sublist of rates with a Select button that reloads the page with the selected rate.
- When Service Action is flat rate, disable Quantity and set it to 1.

---

## 6. Data Contract
### Record Types Involved
- customrecord_cseg_sna_hul_eq_seg
- customrecord_cseg_sna_revenue_st
- customrecord_sna_objects
- customrecord_nx_project_type

### Fields Referenced
- customrecord_cseg_sna_revenue_st | custrecord_sna_hul_flatrate | Flat rate flag

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No item specified hides the sublist.
- Equipment type filter includes child types.
- Missing library data returns empty results.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Library call and optional lookup of flat rate flag.

---

## 9. Acceptance Criteria
- Given filters are set, when the Suitelet runs, then the sublist shows PM rate rows based on filters.
- Given a flat rate service action, when the Suitelet runs, then Quantity is forced to 1.
- Given a row is selected, when the Suitelet runs, then the rate parameter updates in the URL.

---

## 10. Testing Notes
Manual tests:
- Filters return PM rate rows and selection updates rate.
- No item specified hides the sublist.
- Equipment type filter includes child types.
- Missing library data returns empty results.

---

## 11. Deployment Notes
- Library script deployed.
- Client script file available.
- Deploy Suitelet.
- Add launch link from Estimate line.

---

## 12. Open Questions / TBDs
- Should rate selection write back to the line automatically?

---
