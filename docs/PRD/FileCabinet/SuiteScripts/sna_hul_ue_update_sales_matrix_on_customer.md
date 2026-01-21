# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSalesMatrixOnCustomer
title: Update Sales Rep Matrix on Customer
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_update_sales_matrix_on_customer.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - customrecord_sna_salesrep_matrix_mapping

---

## 1. Overview
Adds a resync action on the customer sales rep matrix sublist and triggers Map/Reduce updates to add/update or inactivate matrix records based on customer zip codes.

---

## 2. Business Goal
Keep sales rep matrix mappings aligned with current customer zip codes and prevent stale assignments.

---

## 3. User Story
As a sales admin, when I view or save a customer, I want sales rep matrix mappings updated so that assignments reflect current zip codes without manual cleanup.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | sublist button | view | Add Resync button to the sales rep matrix sublist. |
| beforeLoad | resync parameter | resync requested | Trigger Map/Reduce update and redirect to customer. |
| afterSubmit | N/A | create/edit | Trigger Map/Reduce to add/update matrix records. |
| afterSubmit | custrecord_salesrep_mapping_zipcode | create/edit | Inactivate matrix records whose zip prefixes no longer match customer zip codes. |

---

## 5. Functional Requirements
- Add a Resync button on view to the sales rep matrix sublist.
- When resync parameter is present, run the Map/Reduce update and redirect back to the customer.
- On afterSubmit, always trigger Map/Reduce to add/update matrix records.
- On afterSubmit, inactivate matrix records whose zip codes no longer match customer zip prefixes (5-digit comparison).

---

## 6. Data Contract
### Record Types Involved
- Customer
- Custom record: customrecord_sna_salesrep_matrix_mapping

### Fields Referenced
- Custom record | custrecord_salesrep_mapping_customer | Customer reference
- Custom record | custrecord_salesrep_mapping_zipcode | Zip code

Schemas (if known):
- Library | FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_config | Resync and MR dispatcher

---

## 7. Validation & Edge Cases
- Zip comparisons use 5-character prefixes; mismatches trigger inactivation.
- Resync action reloads the customer after MR is launched.
- MR failure should be logged without blocking customer save.

---

## 8. Implementation Notes (Optional)
- Uses library helpers to get customer zip codes and execute MR.
- User Event triggers MR rather than editing matrix records directly.

---

## 9. Acceptance Criteria
- Given a customer view, when Resync is clicked, then the MR runs and the page reloads.
- Given a customer save, when addresses change, then MR updates mappings and stale zips are inactivated.
- Given a stale zip mapping, when afterSubmit runs, then the mapping is set inactive.

---

## 10. Testing Notes
- Click Resync on a customer and verify MR execution and redirect.
- Update customer addresses and verify matrix records update.
- Remove a zip from customer addresses and verify mapping is inactivated.

---

## 11. Deployment Notes
- Deploy the MR script referenced by the library.
- Deploy the user event to Customer.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should Resync be restricted to admin roles only?

---
