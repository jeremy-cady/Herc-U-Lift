# PRD: Hide PO Fields on Service Sales Orders (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-HidePOFieldsServiceSO
title: Hide PO Fields on Service Sales Orders (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_po_fields_on_service_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A User Event script that hides purchase-order-related columns on service-related sales order forms for specific roles.

---

## 2. Business Goal
Prevent certain roles from seeing PO pricing and margin fields on service sales order forms, simplifying the UI and reducing exposure.

---

## 3. User Story
- As a service user, I want PO fields hidden so that I focus on service data.
- As an admin, I want PO pricing hidden from certain roles so that sensitive data is protected.
- As a support user, I want the behavior consistent across service forms so that training is simpler.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (view/edit) | customform | customform in 106, 105 and role in 1150, 1154, 1149, 1148, 1147, 1172, 1173 | Hide PO-related item sublist columns |

---

## 5. Functional Requirements
- The system must run on beforeLoad for VIEW and EDIT.
- The system must query customform on the transaction record.
- The system must apply only when customform is 106 (NXC Form) or 105 (Service Estimate Form).
- The system must check the current user role against 1150, 1154, 1149, 1148, 1147, 1172, 1173.
- When form and role match, the system must hide item sublist columns: for form 106: porate, custcol_sna_linked_po, createpo, custcol_sna_hul_cust_createpo, custcol_sna_hul_cumulative_markup, estgrossprofitpercent, estgrossprofit; for form 105: custcol_sna_hul_estimated_po_rate, custcol_sna_hul_cust_createpo, custcol_sna_linked_po, estgrossprofit, estgrossprofitpercent, custcol_sna_hul_cumulative_markup.
- Missing fields must be logged but not block execution.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- customform
- Role IDs: 1150, 1154, 1149, 1148, 1147, 1172, 1173
- porate
- custcol_sna_linked_po
- createpo
- custcol_sna_hul_cust_createpo
- custcol_sna_hul_cumulative_markup
- estgrossprofitpercent
- estgrossprofit
- custcol_sna_hul_estimated_po_rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SuiteQL failure logs debug and leaves UI unchanged.
- Missing column on a form does not throw errors.

---

## 8. Implementation Notes (Optional)
- Uses SuiteQL to fetch customform.

---

## 9. Acceptance Criteria
- Given form 106 and a listed role, when viewing/editing, then PO columns are hidden.
- Given form 105 and a listed role, when viewing/editing, then PO columns are hidden.
- Given other forms or roles, when viewing/editing, then columns remain visible.
- Given missing fields, when encountered, then no errors are thrown.

---

## 10. Testing Notes
- Open form 106 as a listed role and verify PO columns hidden.
- Open form 105 as a listed role and verify PO columns hidden.
- Open other forms and verify columns visible.
- Verify missing column does not throw errors.

---

## 11. Deployment Notes
- Upload hul_hide_po_fields_on_service_so.js.
- Deploy as a User Event on sales order record type.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should form IDs be configurable?
- Should the role list be centralized?
- Form IDs change.
- Role IDs change.

---
