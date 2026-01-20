# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PandaDocESignStatusMR
title: PandaDoc E-Sign Status Sync (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/PandaDocs/sna_hul_mr_pd_esign_status.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction records (Estimate, Sales Order)
  - File

---

## 1. Overview
A Map/Reduce script that checks PandaDoc document statuses for pending transactions and updates NetSuite fields, downloading signed PDFs when documents are completed.

## 2. Business Goal
Keeps PandaDoc document status synchronized with NetSuite transactions and automatically attaches signed documents.

## 3. User Story
As a sales rep, when documents are pending, I want transaction status updated, so that I can track e-signature progress.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH` | Script run | Update PandaDoc status and attach signed PDFs |

## 5. Functional Requirements
- The system must load a saved search ID from `SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH`.
- The system must parse each search row and extract PandaDoc values.
- The system must call `handlePdDocStatus` to retrieve PandaDoc status details.
- The system must update transaction field `custbody_sna_pd_doc_status` via `updateDocStatusOnTransaction`.
- When PandaDoc status is `document.completed`, the system must pass the record to reduce.
- The system must download and attach the signed PDF in reduce via `getPDFSignedCopy`.

## 6. Data Contract
### Record Types Involved
- Transaction records (Estimate, Sales Order)
- File

### Fields Referenced
- Transaction | `custbody_sna_pd_doc_status`
- Transaction | `custbody_sna_pd_doc_id`
- Transaction | `custbody_sna_pd_document`
- Script parameter | `SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- PandaDoc API returns no status.
- Saved search returns invalid record data.
- API request fails; error is logged and processing continues.

## 8. Implementation Notes (Optional)
- Relies on `sna_hul_mod_pd` to fetch status and attach PDFs.
- `summarize` stage is empty.

## 9. Acceptance Criteria
- Given pending documents, when the script runs, then statuses are updated on transactions.
- Given completed documents, when the script runs, then signed PDFs are downloaded and attached.
- Given errors occur, when the script runs, then they are logged without stopping the entire run.

## 10. Testing Notes
- Pending documents update status successfully.
- Completed documents result in attached signed PDFs.
- PandaDoc API returns no status.
- Saved search returns invalid record data.
- API request fails; error is logged and processing continues.

## 11. Deployment Notes
- Upload `sna_hul_mr_pd_esign_status.js`.
- Set the pending document search script parameter.
- Deploy and run in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should completed documents be re-checked to avoid re-downloading?
- Should the script handle voided/declined documents differently?
- Risk: PandaDoc API downtime (Mitigation: Add retries and alerts)
- Risk: Large pending search consumes governance (Mitigation: Limit search size or schedule frequency)

---
