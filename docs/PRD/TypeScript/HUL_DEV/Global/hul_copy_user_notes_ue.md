# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_copy_user_notes_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Global/hul_copy_user_notes_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Sales Order
  - Note

---

## 1. Overview
User Event script that copies user notes from the source Sales Order to a newly created Invoice, with de-duplication safeguards.

---

## 2. Business Goal
Ensure user notes from Sales Orders are copied to created Invoices without duplication.

---

## 3. User Story
As a user, when an Invoice is created from a Sales Order, I want the Sales Order notes copied to the Invoice without duplicates, so that the Invoice has the full note history.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (afterSubmit) | createdfrom | Invoice created | Copy notes from source Sales Order to Invoice with de-duplication |

---

## 5. Functional Requirements
- On Invoice CREATE, read createdfrom to identify the source Sales Order.
- Fetch notes from the Sales Order via a Note saved search.
- Normalize and hydrate notetype and direction when missing.
- Deduplicate notes:
  - Collapse duplicate source notes by signature.
  - Skip notes that already exist on the Invoice.
- Create new Note records attached to the Invoice.
- Use signature based on normalized title and memo, and notetype and direction (missing treated as 0).
- Use search.lookupFields and record.load to hydrate missing select values.
- Use logging wrappers for debug, audit, and error with JSON-safe payloads.
- Wrap key stages in try/catch (afterSubmit, search/hydration paths, per-note creation).

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Sales Order
- Note

### Fields Referenced
- createdfrom
- note.title
- note.note
- note.notetype
- note.direction
- note.company
- note.transaction

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing notetype/direction are coerced and treated as 0 in signatures.
- Notes already present on the Invoice are skipped.

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
- Acceptance criteria details
- Testing notes
- Deployment notes

---
