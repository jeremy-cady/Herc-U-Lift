# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DealerNetPricingMR
title: DealerNet Vendor Price Sync (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mr_getdealernetpricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Price (`customrecord_sna_hul_vendorprice`)
  - Item
  - Vendor

---

## 1. Overview
A Map/Reduce script that syncs vendor price records with DealerNet pricing and flags records that exceed configured thresholds.

## 2. Business Goal
Keeps vendor pricing in NetSuite aligned with DealerNet and highlights records that require approval.

## 3. User Story
As a pricing admin, when DealerNet pricing changes, I want DealerNet prices synced, so that vendor pricing is current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Script run | Update vendor price records from DealerNet and email report |

## 5. Functional Requirements
- The system must search vendor price records based on script parameters and filters.
- The system must request a DealerNet access token using `custscript_param_dealerkey` and access URL.
- The system must call DealerNet part detail API using vendor item number and dealer code.
- The system must update staged price fields: `custrecord_sna_hul_t_itempurchaseprice`, `custrecord_sna_hul_t_listprice`, `custrecord_sna_hul_t_contractprice`, `custrecord_sna_hul_t_qtybreakprices`.
- The system must compare DealerNet prices to current prices using `custscript_param_dealernetpricethreshold`.
- If within threshold, the system must update live price fields.
- If outside threshold, the system must set `custrecord_sna_hul_forapproval` and add remarks.
- The system must flag superseded items and unmatched items with remarks.
- The system must email a CSV report of unmatched or unsynced records to configured recipients.

## 6. Data Contract
### Record Types Involved
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item
- Vendor

### Fields Referenced
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_listprice`
- `custrecord_sna_hul_contractprice`
- `custrecord_sna_hul_t_itempurchaseprice`
- `custrecord_sna_hul_t_listprice`
- `custrecord_sna_hul_t_contractprice`
- `custrecord_sna_hul_t_qtybreakprices`
- `custrecord_sna_hul_forapproval`
- `custrecord_sna_hul_issynced`
- `custrecord_sna_hul_remarks`
- `custrecordsna_hul_vendoritemnumber`
- Script parameters for DealerNet integration and recipients

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- DealerNet returns superseded flag.
- DealerNet returns no match.
- API error; record marked as not synced with remarks.

## 8. Implementation Notes (Optional)
- Uses external HTTPS calls from Map/Reduce reduce stage.
- Relies on multiple script parameters for DealerNet integration.

## 9. Acceptance Criteria
- Given DealerNet pricing, when the script runs, then staged fields update.
- Given over-threshold pricing, when the script runs, then records are flagged for approval.
- Given superseded/unmatched items, when the script runs, then they are marked and reported.
- Given the run completes, when the script runs, then a CSV report email is sent.

## 10. Testing Notes
- DealerNet returns pricing; vendor price record updates.
- DealerNet returns superseded flag.
- DealerNet returns no match.
- API error; record marked as not synced with remarks.

## 11. Deployment Notes
- Upload `sna_hul_mr_getdealernetpricing.js`.
- Configure DealerNet parameters and recipients.
- Run in sandbox before production.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should API calls be throttled to avoid rate limits?
- Should approvals auto-trigger workflows?
- Risk: DealerNet API outage (Mitigation: Add retries and error alerts)
- Risk: Large vendor price set increases runtime (Mitigation: Batch or limit search scope)

---
