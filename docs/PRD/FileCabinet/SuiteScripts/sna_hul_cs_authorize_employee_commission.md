# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AuthorizeEmployeeCommission
title: Authorize Employee Commission Suitelet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_authorize_employee_commission.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Transaction (customtransaction_sna_commission_payable)

---

## 1. Overview
A client script attached to the "SNA | SL | Authorize Employee Commission" Suitelet that refreshes search results and displays confirmation links to created Commission Payable transactions.

---

## 2. Business Goal
Streamline commission authorization by reloading the Suitelet with filter parameters and highlighting newly created Commission Payables.

---

## 3. User Story
As a finance user, when I authorize commissions, I want filters and selection helpers, so that I can process the correct commissions efficiently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | commission_payable_id | parameter present | Display confirmation message with links |
| fieldChanged | custpage_trans_date, custpage_subsidiary, custpage_sales_rep, custpage_comms_type | value changed | Reload Suitelet with filter parameters |
| client action | sublist_auth_checkbox | mark/unmark all | Toggle all lines in results sublist |

---

## 5. Functional Requirements
- On page init, if `commission_payable_id` is present in the URL, display a confirmation message with links to the created Commission Payable records.
- On changes to `custpage_trans_date`, `custpage_subsidiary`, `custpage_sales_rep`, or `custpage_comms_type`, reload the Suitelet with query parameters for the current filter values.
- Support multi-select sales rep values and serialize them for URL parameters.
- Show or hide Suitelet fields based on the commission type selection.
- Allow marking or unmarking all lines in `sublist_search_results` by setting `sublist_auth_checkbox`.

---

## 6. Data Contract
### Record Types Involved
- Custom Transaction (customtransaction_sna_commission_payable)

### Fields Referenced
- Suitelet | custpage_trans_date
- Suitelet | custpage_subsidiary
- Suitelet | custpage_sales_rep
- Suitelet | custpage_comms_type
- Suitelet | custpage_posting_date
- Suitelet | custpage_posting_period
- Suitelet | custpage_liability_acct
- Suitelet | custpage_expense_acct
- Sublist | sublist_auth_checkbox

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Empty sales rep selection in multi-select.
- No `commission_payable_id` parameter; no confirmation message.
- Invalid record ID in `commission_payable_id` does not break page load.

---

## 8. Implementation Notes (Optional)
- Uses client-side `window.location` and URL parameters.

---

## 9. Acceptance Criteria
- Given a `commission_payable_id` parameter, when the Suitelet loads, then a confirmation message shows one link per created record.
- Given filter field changes, when the user updates a filter, then the Suitelet reloads with updated filters.
- Given mark all/unmark all action, when executed, then all sublist lines toggle correctly.

---

## 10. Testing Notes
- Change filters and confirm results reload with correct parameters.
- Create commissions and verify confirmation message links.
- Empty sales rep selection; confirm reload does not error.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_authorize_employee_commission.js`.
- Attach to the authorization Suitelet deployment.
- Rollback: detach the client script from the Suitelet deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the suitelet block refresh if required filters are missing?
- Risk: Invalid URL parameters break refresh.
- Risk: Large result sets slow client updates.

---
