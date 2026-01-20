# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SpeeDeeManifestCS
title: SpeeDee Manifest Report Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_speedeemanifestreport.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
A client script used on the SpeeDee manifest report page to filter data by date range and print parcel labels or manifests.

## 2. Business Goal
Enables users to filter the manifest report and generate parcel labels and scan forms via EasyPost.

## 3. User Story
As a shipping user, when I need to filter manifests by date, I want to filter manifests by date, so that I only see relevant shipments.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custpage_datefrom`, `custpage_dateto` | Filter action invoked | Reload Suitelet with date parameters |
| TBD | `custpage_sl_postagelabel`, `custpage_sl_shipmentid` | Print action invoked | Open parcel labels or scan form PDF |

## 5. Functional Requirements
- The system must validate that both date-from and date-to are set before filtering.
- The system must block filtering when date-to is earlier than date-from.
- The system must refresh the Suitelet URL with date parameters to filter results.
- The system must print parcel labels from `custpage_sublist_parcel` by opening label URLs.
- The system must collect shipment IDs from the parcel sublist and request a scan form via EasyPost.
- The system must open the scan form PDF URL returned by EasyPost.

## 6. Data Contract
### Record Types Involved
- TBD

### Fields Referenced
- Page fields: `custpage_datefrom`, `custpage_dateto`
- Sublist fields: `custpage_sl_postagelabel`, `custpage_sl_shipmentid`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Date-to before date-from.
- No parcel lines present.
- EasyPost returns error; alert shown with status code.

## 8. Implementation Notes (Optional)
- Requires script parameters `custscript_param_speedeetoken` and `custscript_param_speedeecarrieraccount`.
- Uses client-side HTTPS calls.

## 9. Acceptance Criteria
- Given a valid date range, when filtering runs, then the Suitelet reloads with date parameters.
- Given parcel lines, when print runs, then parcel labels open for each line.
- Given a scan form request, when EasyPost returns a URL, then the scan form PDF opens.

## 10. Testing Notes
- Enter valid date range and filter.
- Print parcel labels from list.
- Print manifest for multiple shipments.
- Date-to before date-from.
- No parcel lines present.
- EasyPost returns error; alert shown with status code.

## 11. Deployment Notes
- Upload `sna_hul_cs_speedeemanifestreport.js`.
- Deploy to the manifest Suitelet page.
- Validate filtering and printing.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should filtering persist across browser refreshes?
- Should scan forms be generated server-side instead of client-side?
- Risk: EasyPost token exposure in client (Mitigation: Move scan form call to Suitelet)
- Risk: Large shipment lists slow printing (Mitigation: Batch label opens or add confirmation)

---
