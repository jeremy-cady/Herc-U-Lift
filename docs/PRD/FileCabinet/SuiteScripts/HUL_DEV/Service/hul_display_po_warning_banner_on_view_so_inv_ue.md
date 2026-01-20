# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-POWarningBannerUE
title: Display PO Warning on View (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_display_po_warning_banner_on_view_so_inv_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer
  - Sales Order / Invoice

---

## 1. Overview
A User Event that displays a warning banner on Sales Order or Invoice view pages when the customer requires a PO number and the PO# field is blank.

---

## 2. Business Goal
Prompt users to enter a required purchase order number for customers flagged as PO-required.

---

## 3. User Story
- As a sales user, I want a warning when PO# is required so that I can add it.
- As an admin, I want reminders on view so that missing POs are corrected.
- As a support user, I want a clear banner so that the issue is visible immediately.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (view) | entity, otherrefnum | custentity_sna_hul_po_required = true and otherrefnum blank | Add page init warning message |

---

## 5. Functional Requirements
- The system must run on beforeLoad for VIEW.
- The system must read customer ID (entity) and PO number (otherrefnum).
- The system must look up customer field custentity_sna_hul_po_required.
- If PO required is true and PO number is blank, the system must add a page init message with title "PO is Required for this Customer" and message "Please Enter Purchase Order Number On PO# field".
- Errors must be logged without blocking the page.

---

## 6. Data Contract
### Record Types Involved
- Customer
- Sales Order / Invoice

### Fields Referenced
- entity
- otherrefnum
- custentity_sna_hul_po_required

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer lookup fails: no banner and error logged.
- PO present or not required: no banner.

---

## 8. Implementation Notes (Optional)
- Runs only on VIEW.

---

## 9. Acceptance Criteria
- Given a PO-required customer with blank PO#, when viewing, then a warning banner appears.
- Given a PO-required customer with PO# filled, when viewing, then no banner appears.
- Given a non-required customer, when viewing, then no banner appears.

---

## 10. Testing Notes
- View a transaction with PO-required customer and blank PO#; confirm banner appears.
- View a transaction with PO# populated; confirm no banner.
- Simulate lookup error; confirm page still loads.

---

## 11. Deployment Notes
- Upload hul_display_po_warning_banner_on_view_so_inv_ue.js.
- Deploy on Sales Order/Invoice record types.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should the banner also appear on edit?
- Should the message be a warning instead of error?
- Customer lookup fails.
- Users ignore banner.

---
