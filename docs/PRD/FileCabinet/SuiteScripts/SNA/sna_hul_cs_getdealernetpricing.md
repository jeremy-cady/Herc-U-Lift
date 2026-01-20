# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DealerNetPricingCS
title: Dealer Net Pricing Approval (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_getdealernetpricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom vendor pricing record (record type supplied at runtime)

---

## 1. Overview
A client script that approves temporary dealer net pricing updates by copying staged values into active fields on a custom record.

## 2. Business Goal
Provides UI actions to approve list price, purchase price, or all pricing fields on the vendor pricing record.

## 3. User Story
As a pricing admin, when approving staged pricing changes, I want to approve list price changes, so that pricing updates are controlled.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | Staged pricing fields | Approval action invoked | Copy staged values to live fields and update approval metadata |

## 5. Functional Requirements
- The system must load the current record values from the pricing custom record.
- The system must copy temporary fields to live fields on approval: `custrecord_sna_hul_t_itempurchaseprice` to `custrecord_sna_hul_itempurchaseprice`, `custrecord_sna_hul_t_listprice` to `custrecord_sna_hul_listprice`, `custrecord_sna_hul_t_contractprice` to `custrecord_sna_hul_contractprice`.
- The system must clear approval flags and update approval metadata fields: `custrecord_sna_hul_forapproval` (set false on list price approval), `custrecord_sna_hul_lp_lastapprovedby`, `custrecord_sna_hul_lp_lastapprovaldate`, `custrecord_sna_hul_pp_lastapprovedby`, `custrecord_sna_hul_pp_lastapprovaldate`.
- The system must update `custrecord_sna_hul_remarks` by clearing specific indices.
- The system must reload the current record in the browser after approval.

## 6. Data Contract
### Record Types Involved
- Custom vendor pricing record (record type supplied at runtime)

### Fields Referenced
- `custrecord_sna_hul_t_itempurchaseprice`
- `custrecord_sna_hul_t_listprice`
- `custrecord_sna_hul_t_contractprice`
- `custrecord_sna_hul_t_qtybreakprices`
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_listprice`
- `custrecord_sna_hul_contractprice`
- `custrecord_sna_hul_forapproval`
- `custrecord_sna_hul_lp_lastapprovedby`
- `custrecord_sna_hul_lp_lastapprovaldate`
- `custrecord_sna_hul_pp_lastapprovedby`
- `custrecord_sna_hul_pp_lastapprovaldate`
- `custrecord_sna_hul_remarks`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing remarks values cause index operations to fail.
- Staged values are empty; ensure updates set 0.
- Submit fails; error logged in console.

## 8. Implementation Notes (Optional)
- Uses `record.submitFields` and reloads the record via `url.resolveRecord`.
- Approval metadata uses the current user and current date.

## 9. Acceptance Criteria
- Given list price approval, when the action runs, then list price is copied and the approval flag is cleared.
- Given purchase price approval, when the action runs, then purchase and contract price values are copied.
- Given all price approval, when the action runs, then all staged pricing values are copied.
- Given approval completion, when the action runs, then the record reloads.

## 10. Testing Notes
- Approve list price and verify fields update.
- Approve purchase price and verify fields update.
- Approve all price updates and verify fields update.
- Missing remarks values cause index operations to fail.
- Staged values are empty; ensure updates set 0.
- Submit fails; error logged in console.

## 11. Deployment Notes
- Upload `sna_hul_cs_getdealernetpricing.js`.
- Deploy to vendor pricing custom record form.
- Validate approval actions.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should approvals be logged to a custom audit record?
- Should approval actions require role checks?
- Risk: Remarks array indexing may be brittle (Mitigation: Validate remarks string format)
- Risk: Staged values missing (Mitigation: Default to 0 as implemented)

---
