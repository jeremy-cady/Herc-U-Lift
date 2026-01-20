# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PandaDocModule
title: PandaDoc Integration Module
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/PandaDocs/modules/sna_hul_mod_pd.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction records (Estimate, Sales Order)
  - Customer
  - File

---

## 1. Overview
A shared module that integrates NetSuite transactions with PandaDoc, supporting document creation, sending for e-signature, status updates, and signed document retrieval.

## 2. Business Goal
Centralizes PandaDoc API calls and NetSuite updates so multiple PandaDoc scripts can reuse the same integration logic.

## 3. User Story
As a sales rep, when I need to send transactions for e-signature, I want transactions sent for e-signature, so that customers can sign digitally.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | PandaDoc helper invoked | Create/send documents, sync status, and download signed PDFs |

## 5. Functional Requirements
- The system must read PandaDoc credentials and configuration from script parameters: `custsecret_sna_hul_pd_api_key_1`, `custscript_sna_hul_pd_api_url`, `custscript_sna_hul_pd_pending_doc_search`, `custscript_sna_pd_doc_ds_signed_doc_fold`.
- The system must map PandaDoc document statuses to NetSuite status values.
- The system must call PandaDoc APIs to get document details, send documents, and download signed documents.
- The system must update transaction `custbody_sna_pd_doc_status` based on PandaDoc status.
- The system must create a PandaDoc document by uploading a rendered PDF and metadata.
- The system must send the created document for e-signature.
- The system must store PandaDoc document ID, status, and API response on the transaction.
- The system must download a signed PDF, save it to a file cabinet folder, attach it to the transaction, and update `custbody_sna_pd_document`.

## 6. Data Contract
### Record Types Involved
- Transaction records (Estimate, Sales Order)
- Customer
- File

### Fields Referenced
- Transaction | `custbody_sna_pd_doc_id`
- Transaction | `custbody_sna_pd_doc_status`
- Transaction | `custbody_sna_pd_api_resp`
- Transaction | `custbody_sna_pd_document`
- Script parameters | `custsecret_sna_hul_pd_api_key_1`, `custscript_sna_hul_pd_api_url`, `custscript_sna_hul_pd_pending_doc_search`, `custscript_sna_pd_doc_ds_signed_doc_fold`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing customer email or name.
- PandaDoc API returns an error response.
- API calls fail; errors should surface to calling scripts.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 2.x modules (`N/https`, `N/file`, `N/record`, `N/search`).
- Uses a busy-wait delay loop before sending documents.

## 9. Acceptance Criteria
- Given a PandaDoc status lookup, when the module runs, then transaction status fields are updated.
- Given document creation, when the module runs, then a document ID is returned and stored.
- Given a signed document, when the module runs, then the signed PDF is downloaded, saved, and attached.

## 10. Testing Notes
- Create a PandaDoc document for a transaction and send for signature.
- Update transaction status after PandaDoc status changes.
- Download and attach a signed PDF.
- Missing customer email or name.
- PandaDoc API returns an error response.

## 11. Deployment Notes
- Upload `sna_hul_mod_pd.js`.
- Set script parameters for API key, base URL, and folders.
- Validate document creation and status updates.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should API failures be retried with backoff?
- Should the busy-wait delay be replaced with a scheduled retry?
- Risk: PandaDoc API downtime (Mitigation: Add retries and error alerts)
- Risk: Busy-wait delay consumes governance (Mitigation: Replace with scheduled processing)

---
