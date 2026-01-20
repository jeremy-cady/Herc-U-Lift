# PRD: Case Sales Order RESTlet (Filtered)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CaseSalesOrderRestlet
title: Case Sales Order RESTlet (Filtered)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/netsuite-case-salesorder-restlet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Sales Order
  - Item

---

## 1. Overview
A RESTlet that returns support case details and related sales order line items, filtering lines to specific inventory posting groups.

---

## 2. Business Goal
Provide API access to case-linked sales orders while excluding items that do not meet inventory posting group criteria.

---

## 3. User Story
- As an integration system, I want to pull case + relevant sales order lines so that downstream processes only process eligible items.
- As a support analyst, I want case asset/location fields so that I can reconcile service information.
- As an integration system, I want sales order lines by order ID so that I can sync line-level data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet GET/POST | casenumber, case, salesOrderId | Case lookup or sales order lookup | Return case metadata and filtered sales order line details |

---

## 5. Functional Requirements
- The system must accept casenumber or case to look up a support case.
- The system must return case fields: internalid, casenumber, custevent_nxc_case_assets, custevent_sna_hul_caselocation, custevent_nx_case_transaction.
- The system must load the related sales order when custevent_nx_case_transaction is present.
- The system must return sales order header fields: tranid, entity (value/text), trandate, status (value/text).
- The system must filter line items based on item field custitem_sna_inv_posting_grp: include when value is 1 or 2 (single or multi-select).
- The system must return line data that includes item, description, quantity, quantity fulfilled, location, isclosed, custcol_sna_linked_po (value/text), and custcol3.
- The system must skip lines when the item cannot be evaluated.
- The system must support sales order lookup via salesOrderId.
- GET and POST must return the same response structure.
- Errors must return an { error: true, message } response.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Sales Order
- Item

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
- custitem_sna_inv_posting_grp
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
- Items with posting group not 1 or 2 are excluded.
- Missing parameters return guidance message.
- Item lookup failure logs an error and skips the line.

---

## 8. Implementation Notes (Optional)
- Per-line lookupFields call for item posting group.

---

## 9. Acceptance Criteria
- Given a case number, when requested, then case and filtered sales order lines are returned.
- Given a salesOrderId, when requested, then filtered lines are returned.
- Given posting group values, when evaluated, then only groups 1 or 2 are included.
- Given missing parameters or not-found cases, when requested, then an error is returned.

---

## 10. Testing Notes
- GET with casenumber and confirm filtered sales order lines.
- GET with salesOrderId and confirm filtered lines.
- Verify items with posting group not 1 or 2 are excluded.
- Verify item lookup failure logs error and skips line.

---

## 11. Deployment Notes
- Upload netsuite-case-salesorder-restlet.js.
- Create RESTlet script record and deploy.
- Assign role permissions for integrations.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should posting group values be configurable?
- Should item lookup be optimized (bulk or cached)?
- Large orders slow response due to per-line lookup.
- Missing posting group field.

---
