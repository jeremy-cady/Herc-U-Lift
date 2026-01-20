# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateChildTransactionsMR
title: Update Child Transactions (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mr_update_child_transactions.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Time Bill
  - Item Fulfillment
  - Invoice
  - Purchase Order
  - Return Authorization
  - Related child transactions (vendor bills, item receipts, credits, etc.)

---

## 1. Overview
A Map/Reduce script that updates segment values on child transactions derived from sales orders with internal revenue streams.

## 2. Business Goal
Ensures revenue stream, manufacturer, and equipment segment values are consistent across sales orders and their related transactions.

## 3. User Story
As an accountant, when sales orders have internal revenue streams, I want child transactions updated, so that internal reporting is accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Script run on `customsearch_sna_so_with_internal_rs` | Update child transaction segment values and flag sales orders |

## 5. Functional Requirements
- The system must load sales orders from saved search `customsearch_sna_so_with_internal_rs`.
- The system must support optional filtering by `custscript_sn_so_ids_to_process`.
- The system must gather related transactions using shared utilities: Time Bills, Item Fulfillments, Invoices, Purchase Orders and related records, Return Authorizations and related records.
- The system must update sales order line revenue stream values to match the mainline value.
- The system must update related transactions using `sna_hul_update_child_transactions` helpers.
- The system must set `custbody_sna_child_updated` on the sales order when complete.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Time Bill
- Item Fulfillment
- Invoice
- Purchase Order
- Return Authorization
- Related child transactions (vendor bills, item receipts, credits, etc.)

### Fields Referenced
- Sales Order | `custbody_sna_child_updated`
- Segment fields | `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`
- Script parameter | `custscript_sn_so_ids_to_process`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Sales order with no related transactions.
- Missing segment values on lines.
- Record update fails; error logged in reduce.

## 8. Implementation Notes (Optional)
- Uses helper module for child updates.
- Map stage writes related record data for reduce processing.

## 9. Acceptance Criteria
- Given internal revenue stream sales orders, when the script runs, then child transactions reflect updated segment values.
- Given processing completes, when the script runs, then sales orders are flagged as updated.
- Given errors occur, when the script runs, then they are logged during map and reduce stages.

## 10. Testing Notes
- Process a sales order with internal revenue stream and verify child updates.
- Sales order with no related transactions.
- Missing segment values on lines.
- Record update fails; error logged in reduce.

## 11. Deployment Notes
- Upload `sna_hul_mr_update_child_transactions.js`.
- Set script parameter `custscript_sn_so_ids_to_process` if needed.
- Run in sandbox and validate updates.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the script handle mixed revenue streams per line differently?
- Should updates be batched to reduce governance usage?
- Risk: Large transaction sets consume governance (Mitigation: Use targeted runs with parameter filter)
- Risk: Related records missing line matches (Mitigation: Add fallback matching logic)

---
