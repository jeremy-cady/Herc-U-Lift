# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PORequiredCS
title: PO Required Banner and Blanket PO (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_so_porequired.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Invoice
  - Customer

---

## 1. Overview
A client script that enforces purchase order requirements for customers, sets blanket PO numbers, and provides a warranty print action.

## 2. Business Goal
Ensures external revenue stream transactions for PO-required customers include a PO number and provides quick access to warranty printing.

## 3. User Story
As a sales rep, when PO is required, I want PO requirements highlighted, so that I don't miss required fields.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | `otherrefnum` | Record load | Show PO-required banner and set blanket PO if needed |
| fieldChanged | `otherrefnum` | PO number changes | Show/hide PO-required banner |
| saveRecord | `otherrefnum` | Invoice save | Block save if PO required and missing |
| TBD | TBD | Warranty print action | Open warranty Suitelet |

## 5. Functional Requirements
- The system must check customer fields `custentity_sna_hul_po_required` and `custentity_sna_blanket_po`.
- When a blanket PO exists and `otherrefnum` is empty, the system must set `otherrefnum` to the blanket PO.
- The system must show a banner if PO is required and `otherrefnum` is empty for external revenue streams.
- The system must hide the banner when PO number is provided or requirement no longer applies.
- The system must block invoice save if PO is required and missing.
- The system must provide `printWarrantyFxn` to open a warranty Suitelet for the current record.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Invoice
- Customer

### Fields Referenced
- Customer | `custentity_sna_hul_po_required`
- Customer | `custentity_sna_blanket_po`
- Transaction | `cseg_sna_revenue_st`
- Transaction | `otherrefnum`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- PO required but revenue stream is internal; no banner.
- Invoice save with missing PO shows banner and blocks.
- Customer lookup fails; script should not crash.

## 8. Implementation Notes (Optional)
- External revenue stream detection uses text includes "External".

## 9. Acceptance Criteria
- Given PO is required and missing, when the record loads, then the banner shows.
- Given a blanket PO, when the record loads and PO is empty, then the PO number is auto-populated.
- Given an invoice with missing PO, when saving, then save is blocked.
- Given warranty print action, when invoked, then the warranty Suitelet opens.

## 10. Testing Notes
- Customer with blanket PO and external revenue stream sets PO number automatically.
- PO required with number present saves successfully.
- PO required but revenue stream is internal; no banner.
- Invoice save with missing PO shows banner and blocks.
- Customer lookup fails; script should not crash.

## 11. Deployment Notes
- Upload `sna_hul_cs_so_porequired.js`.
- Deploy to sales order and invoice forms.
- Validate banner and save behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the external revenue stream check use IDs instead of text match?
- Should PO requirement be enforced for sales orders as a hard block?
- Risk: Revenue stream text changes break detection (Mitigation: Use internal IDs or flags)
- Risk: Frequent customer lookups slow UI (Mitigation: Cache lookup results per customer)

---
