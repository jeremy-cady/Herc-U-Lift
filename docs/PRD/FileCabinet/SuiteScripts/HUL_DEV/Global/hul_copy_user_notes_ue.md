# PRD: Copy User Notes from Sales Order to Invoice
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CopyUserNotes
title: Copy User Notes from Sales Order to Invoice
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_copy_user_notes_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Note
  - Sales Order
  - Invoice

---

## 1. Overview
A User Event that copies notes from a Sales Order to a newly created Invoice, with robust de-duplication and note-type/direction handling.

---

## 2. Business Goal
Notes added on Sales Orders need to carry forward to Invoices for downstream visibility without creating duplicates.

---

## 3. User Story
- As an AR user, I want to see SO notes on the invoice so that billing context is preserved.
- As a developer, I want to prevent duplicate notes so that invoices stay clean.
- As an admin, I want to keep note metadata intact so that note type and direction are preserved.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit (create) | createdfrom, title, note, notetype, direction, company, transaction | Invoice created from Sales Order | Copy unique notes from SO to Invoice |

---

## 5. Functional Requirements
- The system must run on Invoice afterSubmit CREATE only.
- The system must read the source Sales Order from createdfrom.
- The system must fetch SO notes using a saved-search style note query.
- The system must normalize note type and direction using lookupFields, then record.load fallback.
- The system must compute a signature from title, memo, note type, and direction.
- The system must skip duplicates already on the Invoice.
- The system must create new notes with title, note, notetype, direction, company, and transaction.
- Errors are logged without blocking invoice creation.

---

## 6. Data Contract
### Record Types Involved
- Note
- Sales Order
- Invoice

### Fields Referenced
- createdfrom
- title
- note
- notetype
- direction
- company
- transaction

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SO with duplicate notes: only one copy created.
- Invoice already has matching note: no duplicate created.
- Missing note type/direction: copied with defaults.
- Note creation errors are logged and processing continues.

---

## 8. Implementation Notes (Optional)
- Allowed note type IDs: 1–8.
- Allowed direction IDs: 1–2.

---

## 9. Acceptance Criteria
- Given an invoice created from a Sales Order, when afterSubmit runs, then SO notes are copied to the Invoice.
- Given existing Invoice notes, when afterSubmit runs, then duplicates are not created.
- Given duplicate SO notes, when processed, then only one is copied.
- Given an error, when it occurs, then it is logged without blocking invoice creation.

---

## 10. Testing Notes
- Create an invoice from a Sales Order with notes and confirm notes copied.
- Verify duplicate SO notes create a single note.
- Verify existing Invoice notes are not duplicated.
- Verify missing note type/direction still copies.

---

## 11. Deployment Notes
- Deploy User Event on Invoice.
- Validate note copy on invoice creation.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should allowed note type/direction IDs be parameterized?
- Large note counts increase governance.

---
