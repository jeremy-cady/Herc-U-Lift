# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RecalculateRateRevStream
title: Recalculate Rate and Revenue Stream Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_recalculate_rate_rev_stream.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A client script that recalculates line rates and synchronizes revenue stream and tax settings across Sales Order lines.

---

## 2. Business Goal
Normalize line rates and tax configuration when revenue streams are updated.

---

## 3. User Story
As a sales user, when I recalculate rates and revenue streams, I want pricing and tax to be consistent across lines.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| client action | custcol_sna_hul_lock_rate | recalculateRate invoked | Clear lock rate on all lines |
| client action | cseg_sna_revenue_st | updateRevStreamRecalcRate invoked | Apply header revenue stream to all lines |
| client action | taxcode, custcol_ava_taxamount | tax update | Set tax codes based on internal tax and fulfillment method |
| client action | refresh | refreshSuitelet invoked | Redirect to Suitelet with refresh action |

---

## 5. Functional Requirements
- When `recalculateRate` is invoked, set `custcol_sna_hul_lock_rate` to false on all item lines.
- When `updateRevStreamRecalcRate` is invoked, apply header `cseg_sna_revenue_st` to all item lines.
- Call `mod_tax.updateLines` and use its result to determine internal tax behavior.
- If internal tax is enabled, set line `taxcode` to `-7` and `custcol_ava_taxamount` to `0`.
- If internal tax is not enabled, set `taxcode` to AvaTax POS or AvaTax based on fulfillment method.
- Set `custbody_ava_disable_tax_calculation` to false, and to true when internal tax is applied.
- `refreshSuitelet` must redirect to the Suitelet with a refresh action parameter.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- Header | cseg_sna_revenue_st
- Header | custbody_sna_order_fulfillment_method
- Header | custbody_ava_disable_tax_calculation
- Line | custcol_sna_hul_lock_rate
- Line | cseg_sna_revenue_st
- Line | taxcode
- Line | custcol_ava_taxamount

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No header revenue stream; lines unchanged.
- Internal tax enabled; tax codes set to not taxable.
- Tax module errors should not block line updates.

---

## 8. Implementation Notes (Optional)
- Uses `./sna_hul_mod_sales_tax.js` for tax logic.
- Uses `currentRecord.get.promise()` for async line updates.

---

## 9. Acceptance Criteria
- Given recalculation invoked, when run, then line rate locks are cleared.
- Given revenue stream update invoked, when run, then revenue stream and tax codes update across lines.

---

## 10. Testing Notes
- Run update and verify revenue stream and tax codes on all lines.
- Internal tax enabled; verify tax codes set to not taxable.
- No header revenue stream; verify no changes.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_recalculate_rate_rev_stream.js`.
- Deploy to the recalculation Suitelet.
- Rollback: remove client script deployment from Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the line tax code update occur only for taxable lines?
- Risk: Large line counts slow client updates.

---
