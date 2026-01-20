# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SpeeDeeManifestReport
title: Spee-Dee Manifest Report Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_speedeemanifestreport.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment (transaction)

---

## 1. Overview
A Suitelet that renders a shipment manifest form and parcel list for Spee-Dee shipments based on item fulfillments.

## 2. Business Goal
Provides a UI to review parcel details and print parcel labels or manifests using stored parcel JSON data.

## 3. User Story
As a shipping user, when I need to view parcels by date, I want to view parcels by date, so that I can print manifests.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `dateFrom`, `dateTo`, `ifId` | Suitelet request | Render form, search fulfillments, and display parcel sublist |

## 5. Functional Requirements
- The system must accept optional `dateFrom`, `dateTo`, and `ifId` parameters.
- The system must render a form with date filters when `ifId` is not provided.
- The system must search item fulfillments with `custbody_sna_parceljson` populated.
- The system must parse parcel JSON and display parcel details in a sublist.
- The system must attach client script `sna_hul_cs_speedeemanifestreport.js`.
- The system must provide buttons for "Print Parcel(s)" and "Print Manifest".

## 6. Data Contract
### Record Types Involved
- Item Fulfillment (transaction)

### Fields Referenced
- Item Fulfillment | `custbody_sna_parceljson`
- Request parameters | `dateFrom`, `dateTo`, `ifId`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Item fulfillment ID provided directly; verify specific record loads.
- No parcel JSON found; sublist remains empty.
- JSON parse failure logs error and skips entry.

## 8. Implementation Notes (Optional)
- Parcel JSON must be valid and parseable.
- Search uses created date or specific internal ID.

## 9. Acceptance Criteria
- Given a request with date filters, when the Suitelet runs, then the form renders with date filters and parcel list.
- Given parcel JSON, when the Suitelet runs, then parcel data is displayed correctly.
- Given print buttons, when the Suitelet runs, then client script functions are available.

## 10. Testing Notes
- Open Suitelet with date range and verify parcel sublist.
- Item fulfillment ID provided directly; verify specific record loads.
- No parcel JSON found; sublist remains empty.
- JSON parse failure logs error and skips entry.

## 11. Deployment Notes
- Upload `sna_hul_sl_speedeemanifestreport.js` and `sna_hul_cs_speedeemanifestreport.js`.
- Deploy Suitelet and confirm access.
- Validate parcel list and print actions.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should manifest output be stored for audit purposes?
- Should date filter default to last 7 days instead of today?
- Risk: Invalid parcel JSON breaks parsing (Mitigation: Add validation or try-catch per record)
- Risk: Large date ranges may slow search (Mitigation: Add date range limits or paging)

---
