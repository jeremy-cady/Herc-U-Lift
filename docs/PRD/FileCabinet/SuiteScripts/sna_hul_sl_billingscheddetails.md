# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BillingSchedDetails
title: Billing Schedule Details
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_billingscheddetails.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - invoice

---

## 1. Overview
Suitelet that displays billing schedule details and related invoices for a sales order line.

---

## 2. Business Goal
Gives users visibility into billing dates and invoices tied to a specific line item.

---

## 3. User Story
- As a billing user, when I view line-level billing schedule details, I want to verify invoice timing, so that billing is accurate.
- As a support user, when I reference invoice amounts by schedule period, I want to answer customer questions, so that support responses are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | lineid | `lineid` provided | Display billing schedule rows and invoice details for the line |

---

## 5. Functional Requirements
- Accept `lineid` as a request parameter.
- Load sales order line data using a search filtered by `lineuniquekey`.
- Display header fields (sales order, item, line number, start date, end date, total amount).
- Render a sublist of billing schedule rows with bill dates and invoice references.
- Parse and display billing schedule JSON when it exists on the line.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- invoice

### Fields Referenced
- salesorderline.lineuniquekey
- salesorderline.custcol_sna_hul_bill_date
- salesorderline.custcol_sn_hul_billingsched
- salesorderline.custcol_sna_hul_rent_start_date
- salesorderline.custcol_sna_hul_rent_end_date
- invoiceline.custcol_sna_hul_rent_start_date
- invoiceline.custcol_sna_hul_rent_end_date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Line without billing schedule shows invoice-only data.
- Missing `lineid` results in no output.
- Invalid billing schedule JSON is handled without page crash.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Single search and page render.

---

## 9. Acceptance Criteria
- Given `lineid` is provided, when the Suitelet runs, then line data loads for that line.
- Given schedule data is available, when the Suitelet runs, then rows display bill dates and invoice links/amounts.
- Given the Suitelet renders, when the form loads, then it is read-only and hides navigation.

---

## 10. Testing Notes
Manual tests:
- Line with billing schedule shows multiple rows and invoice data.
- Line without billing schedule shows invoice-only data.
- Missing `lineid` results in no output.
- Invalid billing schedule JSON is handled without page crash.

---

## 11. Deployment Notes
- Validate custom fields and searches.
- Deploy Suitelet.
- Launch from line-level UI button or link.

---

## 12. Open Questions / TBDs
- Should the Suitelet display invoice status or links?

---
