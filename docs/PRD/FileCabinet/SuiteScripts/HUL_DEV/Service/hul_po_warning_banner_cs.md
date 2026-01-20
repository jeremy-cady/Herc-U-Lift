# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-POWarningBannerCS
title: PO Required Warning Banner (Client Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_po_warning_banner_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer
  - Sales Order / Invoice

---

## 1. Overview
A client script that displays a SweetAlert warning banner when a customer requires a PO number.

---

## 2. Business Goal
Provide a user-visible alert on Sales Orders or Invoices when the customer is flagged as PO-required.

---

## 3. User Story
- As a sales user, I want a warning when PO is required so that I remember to enter it.
- As an admin, I want a visible alert so that missing POs are reduced.
- As a support user, I want the warning on load so that I do not miss it.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | entity | custentity_sna_hul_po_required = true | Show SweetAlert warning |

---

## 5. Functional Requirements
- The system must run on pageInit.
- The system must read the customer ID from entity.
- The system must lookup custentity_sna_hul_po_required on the customer.
- If PO required is true, the system must display a SweetAlert warning with title WARNING, text "This customer requires a PO", and icon warning.
- The script includes a fieldChanged entry point but currently has no functional logic.
- Errors must be logged to console without blocking.

---

## 6. Data Contract
### Record Types Involved
- Customer
- Sales Order / Invoice

### Fields Referenced
- entity
- custentity_sna_hul_po_required

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer ID missing: no warning and no crash.
- lookupFields failure logs to console.

---

## 8. Implementation Notes (Optional)
- SweetAlert loaded as a module dependency.

---

## 9. Acceptance Criteria
- Given a PO-required customer, when pageInit runs, then the warning appears.
- Given a non-required customer, when pageInit runs, then no warning appears.
- Given errors, when they occur, then they are logged without blocking.

---

## 10. Testing Notes
- Load record with PO-required customer and confirm warning appears.
- Load record with non-required customer and confirm no warning.
- Simulate lookup error and confirm page still loads.

---

## 11. Deployment Notes
- Upload hul_po_warning_banner_cs.js.
- Deploy as client script on Sales Order/Invoice forms.
- Verify SweetAlert module path.
- Rollback: disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should this logic be moved to a User Event for enforcement?
- Should fieldChanged logic be completed?
- SweetAlert path invalid.
- Users ignore modal.

---
