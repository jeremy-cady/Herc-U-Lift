# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalInvoicing
title: Rental Invoicing
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_rentalinvoicing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - invoice
  - account
  - scriptdeployment

---

## 1. Overview
Suitelet that searches rental sales orders and creates invoices via transform or Map/Reduce.

---

## 2. Business Goal
Provides a UI to select rental orders and automate invoice generation at scale.

---

## 3. User Story
- As a billing user, when I filter rental orders, I want to invoice the right set, so that billing is accurate.
- As an admin, when I batch invoice large sets, I want processing to remain stable, so that throughput is reliable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | filters, selection list | User submits selection | Create invoices directly or schedule MR invoicing |

---

## 5. Functional Requirements
- Display a filter form and a paged sublist of rental sales orders.
- Exclude orders with unconfigured lines or dummy objects.
- Exclude orders with credit memos when configured.
- Allow selecting orders and submitting for invoicing.
- If more than 30 orders are selected, invoke Map/Reduce.
- Otherwise, transform each sales order into an invoice and set the A/R account.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- invoice
- account
- scriptdeployment

### Fields Referenced
- Sales Order Line | custcol_sna_hul_bill_date | Bill date
- Sales Order Line | custcol_sna_hul_object_configurator | Config JSON
- Sales Order Line | custcol_sna_hul_object_configurator_2 | Config JSON
- Sales Order Line | custcol_sna_hul_fleet_no.custrecord_sna_hul_rent_dummy | Dummy flag
- Item | custitem_sna_hul_gen_prodpost_grp | Product posting group

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Orders with unconfigured lines are excluded.
- Orders with credit memos are excluded.
- Transform errors send an email to the current user.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Transform operations per SO; MR for larger sets.

---

## 9. Acceptance Criteria
- Given filters are set, when the Suitelet runs, then eligible sales orders appear in the list and can be selected.
- Given a selection size, when the Suitelet runs, then invoices are created or MR is scheduled based on selection size.
- Given processing completes, when the Suitelet finishes, then a status page or link is presented.

---

## 10. Testing Notes
Manual tests:
- Select a few orders and create invoices directly.
- Select many orders and schedule MR invoicing.
- Orders with unconfigured lines are excluded.
- Orders with credit memos are excluded.

---

## 11. Deployment Notes
- MR script deployed and accessible.
- Saved searches verified.
- Deploy Suitelet.
- Provide menu access for billing users.

---

## 12. Open Questions / TBDs
- Should page size be configurable?

---
