# PRD: Lease Dataset Viewer Button Handlers (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LeaseDatasetViewerCS
title: Lease Dataset Viewer Button Handlers (Client Script)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None

---

## 1. Overview
A client script that handles button actions for a Lease Dataset Viewer, including CSV download and dataset rebuild.

---

## 2. Business Goal
Provide simple, reliable button actions on the Suitelet UI for downloading data and triggering rebuilds.

---

## 3. User Story
- As a user, I want to download the lease dataset so that I can analyze it offline.
- As an admin, I want a rebuild action so that I can refresh the dataset.
- As a support user, I want clear errors so that I know why a button failed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Button click | custpage_csv_url | URL present | Navigate to CSV download URL |
| Button click | custpage_rebuild_url | URL present | Navigate to rebuild URL |

---

## 5. Functional Requirements
- The system must expose pageInit, onDownloadCsv, and onRebuildClick.
- The system must read hidden fields custpage_csv_url and custpage_rebuild_url.
- onDownloadCsv must navigate to custpage_csv_url.
- onRebuildClick must navigate to custpage_rebuild_url.
- Missing URLs must surface a user alert.

---

## 6. Data Contract
### Record Types Involved
- None

### Fields Referenced
- custpage_csv_url
- custpage_rebuild_url

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Hidden URL missing: show alert with error text.

---

## 8. Implementation Notes (Optional)
- Uses DOM access to hidden fields.

---

## 9. Acceptance Criteria
- Given a Download click, when custpage_csv_url is present, then navigation occurs.
- Given a Rebuild click, when custpage_rebuild_url is present, then navigation occurs.
- Given missing URLs, when clicked, then an alert is shown.

---

## 10. Testing Notes
- Click Download and verify CSV download starts.
- Click Rebuild and verify rebuild request fires.
- Remove hidden URL and verify alert shown.

---

## 11. Deployment Notes
- Upload hul_lease_sales_orders_cs.js.
- Deploy as client script for the Lease Dataset Viewer Suitelet.
- Rollback: remove/disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should button clicks be logged server-side?
- Should rebuild action require confirmation?
- Missing hidden URL fields.
- Rebuild endpoint unavailable.

---
