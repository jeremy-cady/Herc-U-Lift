# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_display_po_warning_banner_on_view_so_inv_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_display_po_warning_banner_on_view_so_inv_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction
  - Customer

---

## 1. Overview
User Event that shows a warning banner on view when a customer requires a PO and the transaction has no PO number.

---

## 2. Business Goal
Warn users when a required PO number is missing on view.

---

## 3. User Story
As a user, when I view a transaction for a customer that requires a PO and no PO number is present, I want a warning banner, so that I can address the missing PO.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| VIEW (beforeLoad) | entity, otherrefnum | Customer PO required flag is true and PO number is blank | Show page-init error message banner |

---

## 5. Functional Requirements
- On VIEW, read transaction customer (entity).
- Use search.lookupFields to fetch customer PO-required flag (custentity_sna_hul_po_required).
- If PO is required and transaction PO # (otherrefnum) is blank, show a page-init error message banner.

---

## 6. Data Contract
### Record Types Involved
- Transaction
- Customer

### Fields Referenced
- entity
- otherrefnum
- custentity_sna_hul_po_required

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
TBD

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
- Schema references
- Validation & edge cases
- Acceptance criteria details
- Testing notes
- Deployment notes

---
