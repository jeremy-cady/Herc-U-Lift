# PRD: Case Sales Order RESTlet (Non-Filtered)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CaseSalesOrderRestletNF
title: Case Sales Order RESTlet (Non-Filtered)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/netsuite-case-salesorder-restlet-non-filtered version.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Sales Order

---

## 1. Overview
A RESTlet that returns support case details and associated sales order line items, without additional filtering on lines.

---

## 2. Business Goal
Provides API access to case-linked sales order data for downstream integrations or reporting.

---

## 3. User Story
- As an integration system, I want to pull case + sales order details so that downstream processes can be updated.
- As a support analyst, I want case asset/location fields so that I can reconcile service information.
- As an integration system, I want sales order lines by order ID so that I can sync line-level data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet GET/POST | casenumber, case, salesOrderId | Case lookup or sales order lookup | Return case metadata and sales order header + line details |

---

## 5. Functional Requirements
- The system must accept casenumber or case to look up a support case.
- The system must return case fields: internalid, casenumber, custevent_nxc_case_assets, custevent_sna_hul_caselocation, custevent_nx_case_transaction.
- The system must load the related sales order when custevent_nx_case_transaction is present.
- The system must return sales order header fields: tranid, entity (value/text), trandate, status (value/text).
- The system must return all line items from the sales order item sublist.
- Line data must include item, description, quantity, quantity fulfilled, location, isclosed, custcol_sna_linked_po (value/text), and custcol3.
- The system must support sales order lookup via salesOrderId.
- GET and POST must return the same response structure.
- Errors must return an { error: true, message } response.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Sales Order

### Fields Referenced
- casenumber
- case
- salesOrderId
- internalid
- custevent_nxc_case_assets
- custevent_sna_hul_caselocation
- custevent_nx_case_transaction
- tranid
- entity
- trandate
- status
- item
- description
- quantity
- quantityfulfilled
- location
- isclosed
- custcol_sna_linked_po
- custcol3

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Case number not found returns error.
- Case without a sales order returns case data and empty lines.
- Missing parameters return guidance message.
- Sales order load failure returns error object.

---

## 8. Implementation Notes (Optional)
- Loads full sales order and all lines (no filtering).

---

## 9. Acceptance Criteria
- Given a case number, when requested, then case and sales order data are returned when present.
- Given a salesOrderId, when requested, then header and line details are returned.
- Given line data, when returned, then custom PO link fields are included.
- Given missing parameters or not-found cases, when requested, then an error is returned.

---

## 10. Testing Notes
- GET with casenumber and confirm case + sales order lines.
- GET with salesOrderId and confirm lines returned.
- Verify not-found case returns error.
- Verify case without sales order returns case data and empty lines.

---

## 11. Deployment Notes
- Upload netsuite-case-salesorder-restlet-non-filtered version.js.
- Create RESTlet script record and deploy.
- Assign role permissions for integrations.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should line filtering (open/closed) be added for performance?
- Should the RESTlet return additional case fields?
- Large sales orders increase response time.
- Missing sales order link on case.

---
