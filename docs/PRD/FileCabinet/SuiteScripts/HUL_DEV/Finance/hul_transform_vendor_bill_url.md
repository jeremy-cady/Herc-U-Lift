# PRD: Transform Vendor Bill TrinDocs URL
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20241010-TransformVendorBillUrl
title: Transform Vendor Bill TrinDocs URL
status: Implemented
owner: Jeremy Cady
created: October 10, 2024
last_updated: October 10, 2024

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_transform_vendor_bill_url.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Bill (transaction)

---

## 1. Overview
A Map/Reduce script that scans Vendor Bills and upgrades TrinDocs URLs from http to https.

---

## 2. Business Goal
Normalize all stored TrinDocs URLs on Vendor Bills to https.

---

## 3. User Story
- As an AP user, I want to open Vendor Bill TrinDocs links securely so that I can access documents without browser warnings.
- As an admin, I want to standardize stored URLs so that document links are consistent.
- As a developer, I want to batch-update Vendor Bills so that I avoid manual edits.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custbody_sna_hul_trindocs_url | custbody_sna_hul_trindocs_url is not 'null' | Replace http with https and update URL |

---

## 5. Functional Requirements
- The system must query Vendor Bills where custbody_sna_hul_trindocs_url is not 'null'.
- The system must emit each Vendor Bill ID with its URL.
- The system must replace the first http prefix with https.
- The system must update custbody_sna_hul_trindocs_url with the new URL.

---

## 6. Data Contract
### Record Types Involved
- Vendor Bill (transaction)

### Fields Referenced
- custbody_sna_hul_trindocs_url

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- URL already https: unchanged.
- URL field blank or 'null': not included.
- Update failures are logged.

---

## 8. Implementation Notes (Optional)
- Uses string replacement on the first http occurrence.
- Query filters on custbody_sna_hul_trindocs_url != 'null'.

---

## 9. Acceptance Criteria
- Given a Vendor Bill with an http URL, when the script runs, then it is updated to https.
- Given a Vendor Bill with an https URL, when the script runs, then it remains unchanged.
- Given a run, when processing completes, then the script finishes without unhandled errors.

---

## 10. Testing Notes
- Create a Vendor Bill with an http URL and confirm it updates to https.
- Verify an https URL remains unchanged.
- Verify blank or 'null' URL records are not included.
- Confirm update failures are logged.

---

## 11. Deployment Notes
- Deploy the Map/Reduce script.
- Run on production data set.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the query exclude inactive Vendor Bills?
- URL value contains unexpected protocol format.

---
