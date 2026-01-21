# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GlobalResync
title: Global Resync
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_global_resync.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - scriptdeployment

---

## 1. Overview
Suitelet that triggers a global resync of sales rep matrix data for customers matching zip codes.

---

## 2. Business Goal
Allows admins to run a scoped resync using zip code filters without manual Map/Reduce scheduling.

---

## 3. User Story
- As an admin, when I run a zip-based resync, I want only relevant customers updated, so that scope is controlled.
- As an admin, when I trigger resync, I want to avoid manual deployment management, so that the process runs reliably.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | zip codes | Zip codes provided | Find customers and submit Map/Reduce update |

---

## 5. Functional Requirements
- Display a form requesting zip code input.
- Parse and de-duplicate comma-separated zip codes.
- Search active customers with matching address zip codes and non-inactive addresses.
- Submit Map/Reduce `customscript_sna_hul_mr_update_all_cust` with customer IDs.
- Manage deployments by reusing available deployments or creating a new one if needed.
- Show a confirmation message after submission.

---

## 6. Data Contract
### Record Types Involved
- customer
- scriptdeployment

### Fields Referenced
- address.custrecord_sn_inactive_address

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching customers results in empty parameter set.
- Duplicate zip inputs are filtered out.
- No available deployment triggers new deployment creation.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Large resyncs may require multiple deployments.

---

## 9. Acceptance Criteria
- Given zip codes are provided, when the Suitelet runs, then Map/Reduce is scheduled with matching customer IDs.
- Given submission completes, when the Suitelet responds, then UI confirms resync is in progress.
- Given comma-separated zip codes, when the Suitelet parses them, then they are trimmed and de-duplicated.

---

## 10. Testing Notes
Manual tests:
- Zip codes match customers and MR is scheduled.
- No matching customers results in empty parameter set.
- Duplicate zip inputs are filtered out.
- No available deployment triggers new deployment creation.

---

## 11. Deployment Notes
- Map/Reduce script deployed.
- Suitelet deployed and accessible.
- Deploy Suitelet.
- Add link or menu access for admin users.

---

## 12. Open Questions / TBDs
- Should the Suitelet allow running a full resync without zip filters?

---
