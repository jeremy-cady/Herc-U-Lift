# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TimebillSo
title: Timebill SO Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_timebill_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - timebill

---

## 1. Overview
Suitelet that updates sales order line actual service hours based on a timebill.

---

## 2. Business Goal
Keeps sales order line service hours aligned with timebill updates and triggers UE logic.

---

## 3. User Story
- As a service manager, when I sync timebill hours to SO lines, I want billing to be accurate, so that invoicing is correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | recid, linkedso, hours, timeposted | Parameters provided | Update SO line service hours and redirect to timebill |

---

## 5. Functional Requirements
- Accept `recid`, `linkedso`, `hours`, and `timeposted` parameters.
- Locate the SO line with `custcol_sna_linked_time` equal to the timebill ID.
- Update `custcol_sna_hul_act_service_hours` when conditions are met.
- Redirect back to the timebill.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- timebill

### Fields Referenced
- SO Line | custcol_sna_linked_time | Linked timebill
- SO Line | custcol_sna_hul_act_service_hours | Actual service hours
- SO Line | custcol_nx_task | Task reference
- SO Line | custcol_sna_service_itemcode | Service item code

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Order status G/H prevents update.
- Timebill already posted prevents update.
- Missing SO line logs and exits.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: SO load/save per request.

---

## 9. Acceptance Criteria
- Given timebill conditions match, when the Suitelet runs, then SO line hours update.
- Given closed orders or posted timebills, when the Suitelet runs, then no update occurs.

---

## 10. Testing Notes
Manual tests:
- Timebill updates SO line hours for resource service item.
- Order status G/H prevents update.
- Timebill already posted prevents update.
- Missing SO line logs and exits.

---

## 11. Deployment Notes
- Script parameter for resource item set.
- Deploy Suitelet.
- Trigger from timebill workflow.

---

## 12. Open Questions / TBDs
- Should updates occur when timeposted is true?

---
