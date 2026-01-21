# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateObjectRecord
title: Create Object Record
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_create_obj_rec.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - purchaseorder
  - item

---

## 1. Overview
Suitelet that creates custom object records and builds or updates a Purchase Order with object lines and charges.

---

## 2. Business Goal
Automates object record creation and PO line population from a guided UI.

---

## 3. User Story
- As a purchasing user, when I create objects and a PO together, I want setup to be faster, so that procurement is efficient.
- As an inventory user, when I populate fleet code and serial data on PO lines, I want tracking to be consistent, so that objects are traceable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | po_id | Form submitted | Create object records and add PO lines, then save and redirect |

---

## 5. Functional Requirements
- Render a form for object info, pricing info, and PO details.
- Create object records based on quantity.
- Create or load a Purchase Order using `po_id`.
- Add one PO line per created object and populate object and segment fields.
- Add optional other charge lines when provided.
- For serialized items (IDs 101361, 101362), set inventory detail with the object ID.
- Save the PO and redirect to it.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- purchaseorder
- item

### Fields Referenced
- customrecord_sna_objects.custrecord_sna_fleet_code
- customrecord_sna_objects.custrecord_sna_serial_no
- customrecord_sna_objects.cseg_sna_hul_eq_seg
- customrecord_sna_objects.cseg_hul_mfg
- customrecord_sna_objects.custrecord_sna_equipment_model
- customrecord_sna_objects.custrecord_sna_year
- customrecord_sna_objects.custrecord_sna_owner_status
- customrecord_sna_objects.custrecord_sna_posting_status
- customrecord_sna_objects.custrecord_sna_status
- customrecord_sna_objects.custrecord_hul_customerorder
- customrecord_sna_objects.custrecord_sna_responsibility_center
- customrecord_sna_objects.custrecord_sna_expected_receipt_date
- purchaseorder.custbody_po_type
- purchaseorder.custbody_sna_hul_object_subsidiary
- purchaseorderline.custcol_sna_hul_fleet_no
- purchaseorderline.custcol_sna_po_fleet_code
- purchaseorderline.custcol_sna_hul_eq_serial
- purchaseorderline.cseg_sna_hul_eq_seg
- purchaseorderline.cseg_hul_mfg

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Update an existing PO using `po_id`.
- Serialized item triggers inventory assignment.
- Missing required fields prevents submit.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple record creates and PO save; item IDs for serialized items are hard-coded.

---

## 9. Acceptance Criteria
- Given object inputs and quantity, when the Suitelet runs, then object records are created with fleet code, serial number, and segment fields.
- Given object records are created, when the Suitelet runs, then PO lines reflect object records and metadata.
- Given other charge lines are provided, when the Suitelet runs, then those lines are added.

---

## 10. Testing Notes
Manual tests:
- Create multiple objects and a new PO.
- Update an existing PO using `po_id`.
- Serialized item triggers inventory assignment.
- Missing required fields prevents submit.

---

## 11. Deployment Notes
- Confirm item filters and PO form ID.
- Deploy Suitelet.
- Provide link/button from PO workflow.

---

## 12. Open Questions / TBDs
- Should object creation validate unique fleet codes?

---
