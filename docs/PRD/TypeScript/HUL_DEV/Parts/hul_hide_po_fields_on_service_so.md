# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_hide_po_fields_on_service_so
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Parts/hul_hide_po_fields_on_service_so.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction

---

## 1. Overview
User Event script that hides PO-related columns on Service Sales Order forms for specific roles.

---

## 2. Business Goal
Hide PO-related columns on specific service forms for targeted roles.

---

## 3. User Story
As a user in an allowed role, when I view or edit a Service Sales Order on certain forms, I want PO-related columns hidden, so that the form is simplified.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| VIEW (beforeLoad) | PO-related item fields | Custom form ID is 106 or 105 and role is allowed | Hide specified PO-related columns |
| EDIT (beforeLoad) | PO-related item fields | Custom form ID is 106 or 105 and role is allowed | Hide specified PO-related columns |

---

## 5. Functional Requirements
- On VIEW and EDIT, read the transaction custom form ID via SuiteQL.
- If form ID is 106 (NXC) or 105 (Service Estimate) and role is in allowed list (3, 1150, 1154, 1149, 1148, 1147, 1172, 1173), hide the specified columns.
- Hide the following columns for form 106:
  - porate
  - custcol_sna_linked_po
  - createpo
  - custcol_sna_hul_cust_createpo
  - custcol_sna_hul_cumulative_markup
  - estgrossprofitpercent
  - estgrossprofit
- Hide the following columns for form 105:
  - custcol_sna_hul_estimated_po_rate
  - custcol_sna_hul_cust_createpo
  - custcol_sna_linked_po
  - estgrossprofit
  - estgrossprofitpercent
  - custcol_sna_hul_cumulative_markup

---

## 6. Data Contract
### Record Types Involved
- Transaction

### Fields Referenced
- customform
- Form 106 fields: porate, custcol_sna_linked_po, createpo, custcol_sna_hul_cust_createpo, custcol_sna_hul_cumulative_markup, estgrossprofitpercent, estgrossprofit
- Form 105 fields: custcol_sna_hul_estimated_po_rate, custcol_sna_hul_cust_createpo, custcol_sna_linked_po, estgrossprofit, estgrossprofitpercent, custcol_sna_hul_cumulative_markup

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Applies only to forms 105 and 106.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Specific transaction type(s)
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
