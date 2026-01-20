# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateCOGSJE
title: Create COGS JE from Invoice Time Entries (Suitelet)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_bksl_createcogsje.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Time Bill
  - Journal Entry

---

## 1. Overview
A Suitelet that creates a Journal Entry for COGS from time entries tied to an invoice and marks those time entries as posted.

---

## 2. Business Goal
Ensure service labor time is posted to the correct COGS and WIP accounts when invoices are created or edited.

---

## 3. User Story
As an accounting user, when I process invoices with time entries, I want time entry costs posted to COGS, so that labor costs are captured accurately.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST request | invId, action | action = create | Create JE from unposted time entries and mark them posted |

---

## 5. Functional Requirements
- Accept `invId` and `action` parameters via POST.
- Load the invoice and collect linked time entries.
- Filter time entries to those not posted.
- Create a JE with debit account `646` and credit account `464` per time entry.
- Set memo to include the invoice document number.
- Mark time entries as posted and set `custcol_sna_hul_linked_je`.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Time Bill
- Journal Entry

### Fields Referenced
- Invoice line | custcol_sna_linked_time
- Time Bill | posted
- Time Bill | custcol_sna_hul_linked_je
- Request parameters | invId, action

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No linked time entries; no JE created.
- Time entries already posted; no JE created.
- Only processes POST requests.

---

## 8. Implementation Notes (Optional)
- Uses hardcoded account IDs 646 and 464.

---

## 9. Acceptance Criteria
- Given unposted time entries for an invoice, when the Suitelet runs, then a JE is created with balanced lines.
- Given time entries processed, when the Suitelet runs, then time entries are marked posted and linked to the JE.

---

## 10. Testing Notes
- POST with `invId` and `action=create`; verify JE creation and time entry updates.
- No linked time entries; verify no JE created.
- Time entries already posted; verify no JE created.

---

## 11. Deployment Notes
- Upload `sna_hul_bksl_createcogsje.js`.
- Deploy Suitelet and test with a sample invoice.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should account IDs be script parameters?
- Risk: Account IDs differ by environment.

---
