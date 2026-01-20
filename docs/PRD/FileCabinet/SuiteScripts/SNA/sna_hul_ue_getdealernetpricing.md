# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GetDealerNetPricing
title: DealerNet Pricing Sync and Approval (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_getdealernetpricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Price (`customrecord_sna_hul_vendorprice`)
  - Item

---

## 1. Overview
A User Event that syncs vendor pricing from DealerNet after record save and adds approval buttons and quantity break sublist on vendor price records.

## 2. Business Goal
Keeps vendor price records in sync with DealerNet and allows approvals when changes exceed threshold limits.

## 3. User Story
As a pricing admin, when vendor price records are saved, I want DealerNet pricing synced automatically, so that vendor prices are current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | `custrecordsna_hul_vendoritemnumber` | Vendor price save in UI, Suitelet, or CSV | Fetch DealerNet pricing and update fields |
| beforeLoad | TBD | Vendor price view | Add approval buttons and quantity break sublist |

## 5. Functional Requirements
- The system must run after submit for vendor price records in UI, Suitelet, or CSV contexts.
- The system must request an access token from DealerNet using `custscript_param_dealernetaccesstokenurl` and `custscript_param_dealerkey`.
- The system must request part details using the vendor item number and `custscript_param_dealernetcode`.
- The system must update target fields (`custrecord_sna_hul_t_*`) and sync flags based on response.
- The system must compare current prices to DealerNet prices using `custscript_param_dealernetpricethreshold`.
- The system must set `custrecord_sna_hul_forapproval` when values are outside thresholds.
- The system must add approval buttons and a quantity break price sublist on beforeLoad.
- The system must attach client script `sna_hul_cs_getdealernetpricing.js` to handle button actions.

## 6. Data Contract
### Record Types Involved
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item

### Fields Referenced
- Vendor Price | `custrecord_sna_hul_item`
- Vendor Price | `custrecordsna_hul_vendoritemnumber`
- Vendor Price | `custrecord_sna_hul_t_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_t_listprice`
- Vendor Price | `custrecord_sna_hul_t_contractprice`
- Vendor Price | `custrecord_sna_hul_t_qtybreakprices`
- Vendor Price | `custrecord_sna_hul_forapproval`
- Vendor Price | `custrecord_sna_hul_issynced`
- Script parameters | `custscript_param_dealernetdomain`, `custscript_param_dealerkey`, `custscript_param_dealernetaccesstokenurl`, `custscript_param_dealernetpricethreshold`, `custscript_param_dealernetcode`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- DealerNet API returns error; sync flag set to false.
- Lot item detected; script exits early.
- Approval flags are not set during CSV import.

## 8. Implementation Notes (Optional)
- Pricing comparison uses percent threshold.

## 9. Acceptance Criteria
- Given a vendor price save, when the script runs, then DealerNet pricing fields populate.
- Given pricing outside threshold, when the script runs, then approval buttons appear and approval flag is set.
- Given quantity break pricing exists, when the record is viewed, then the quantity break sublist displays values.

## 10. Testing Notes
- Save vendor price and verify DealerNet fields update.
- DealerNet API returns error; sync flag set to false.
- Lot item detected; script exits early.
- Approval flags are not set during CSV import.

## 11. Deployment Notes
- Upload `sna_hul_ue_getdealernetpricing.js` and `sna_hul_cs_getdealernetpricing.js`.
- Configure DealerNet parameters on the deployment.
- Verify sync and approval UI.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the DealerNet sync run asynchronously to avoid save delays?
- Should approval logic apply during CSV imports?
- Risk: DealerNet API downtime blocks sync (Mitigation: Add retry or scheduled sync fallback)
- Risk: Threshold misconfiguration triggers approvals unnecessarily (Mitigation: Validate threshold parameters)

---
