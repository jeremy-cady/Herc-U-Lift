# PRD: Add Sales Order Line Item RESTlet (v2)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddSOLineItemV2
title: Add Sales Order Line Item RESTlet (v2)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_add_so_line_item_v2.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A RESTlet that adds a line item to a Sales Order and links it to a Purchase Order via a custom line field.

---

## 2. Business Goal
Provide a simple API for external systems to append items to Sales Orders without manual UI edits.

---

## 3. User Story
- As an integration developer, I want to add SO lines via REST so that I can automate order updates.
- As a purchasing user, I want to link a PO to the SO line so that procurement is traceable.
- As an admin, I want to keep the API lightweight so that it’s easy to maintain.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet POST | salesOrderId, poId, itemId, quantity | quantity optional, default 1 | Add line to SO item sublist and set custcol_sna_linked_po |

---

## 5. Functional Requirements
- The system must accept POST requests with salesOrderId, poId, itemId, and quantity (optional, default 1).
- The system must load the Sales Order in dynamic mode.
- The system must add a new line in the item sublist and set item, quantity, and custcol_sna_linked_po.
- The system must save the Sales Order and return the saved ID.
- The system must return error messages on failure.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- salesOrderId
- poId
- itemId
- quantity
- item
- custcol_sna_linked_po

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing required fields returns success: false.
- Invalid salesOrderId returns error response.
- Errors return success: false with message.

---

## 8. Implementation Notes (Optional)
- Uses dynamic mode to add lines.

---

## 9. Acceptance Criteria
- Given missing required fields, when POSTed, then success: false is returned.
- Given valid inputs, when POSTed, then a new line is appended with item, quantity, and linked PO.
- Given a successful save, when the response returns, then success: true and saved ID are returned.
- Given an error, when it occurs, then success: false with message is returned.

---

## 10. Testing Notes
- POST with valid IDs and confirm line added and success returned.
- POST with missing itemId and confirm error response.
- POST with invalid salesOrderId and confirm error response.

---

## 11. Deployment Notes
- Deploy RESTlet and assign integration role.
- Validate line creation on sample orders.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should this support multiple lines per request?
- Invalid IDs cause repeated errors.

---
