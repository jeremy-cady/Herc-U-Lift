# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SFATerriAddSalesReps
title: SFA Territory Add Sales Reps Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_sfa_terri_add_sales_reps.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer
  - Item
  - Custom Record (customrecord_sna_sr_shell)

---

## 1. Overview
A client script that populates sales rep list fields based on selected items and customers.

---

## 2. Business Goal
Ensure sales rep lists are prefilled using territory and customer mapping data.

---

## 3. User Story
As a user, when I select items and customers, I want sales reps prefilled, so that I do not manually search territory assignments.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| postSourcing | item | item selected | Set custcol_sna_sales_rep_list from territory mapping |
| postSourcing | customer | customer sourced | Set salesrep from customer assignment |

---

## 5. Functional Requirements
- When an item is selected on the item sublist, set `custcol_sna_sales_rep_list` to the list of sales reps for that item territory.
- When the customer is sourced, set `salesrep` to the customer's assigned sales rep.

---

## 6. Data Contract
### Record Types Involved
- Customer
- Item
- Custom Record (customrecord_sna_sr_shell)

### Fields Referenced
- Line | custcol_sna_sales_rep_list
- Item | custitem_sna_sales_territory
- Custom Record | custrecord_sna_sfa_ter_sales_territory
- Custom Record | custrecord_sna_sr_shell_sales_rep
- Header | salesrep

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Item has no territory mapping; list remains empty.
- Customer has no sales rep; header remains unchanged.
- Missing mapping records should not break line entry.

---

## 8. Implementation Notes (Optional)
- Script header indicates it is not in use; confirm deployment.

---

## 9. Acceptance Criteria
- Given an item with territory mapping, when selected, then sales rep list populates.
- Given a customer with assigned sales rep, when sourced, then header sales rep defaults.

---

## 10. Testing Notes
- Select an item with territory mapping; verify sales rep list.
- Select a customer; verify header sales rep.
- Item has no mapping; list remains empty.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_sfa_terri_add_sales_reps.js`.
- Deploy to the applicable transaction form if needed.
- Rollback: remove client script deployment if not used.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Is this script currently deployed anywhere?
- Risk: Script is not deployed and behavior is untested.

---
