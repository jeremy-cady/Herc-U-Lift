# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PurchaseOrder
title: Purchase Equipment Button
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_purchaseorder.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder

---

## 1. Overview
User Event that adds a "Purchase Equipment" button to a specific Purchase Order form.

---

## 2. Business Goal
Provide a UI action to trigger purchase equipment logic via a client script on equipment PO forms.

---

## 3. User Story
As a purchasing user, when viewing equipment POs, I want a Purchase Equipment button, so that I can trigger equipment purchasing actions.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | customform | Purchase Order | Attach client script and add Purchase Equipment button when form ID is 130 |

---

## 5. Functional Requirements
- Run beforeLoad on Purchase Orders.
- When the custom form ID is 130, attach `SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js`.
- Add a button labeled "Purchase Equipment" that runs `purchaseEquipmentFxn`.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder

### Fields Referenced
- purchaseorder | customform | Custom form ID

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Other forms do not show the button.
- Button add errors are logged.

---

## 8. Implementation Notes (Optional)
- Form-specific behavior based on custom form ID 130.

---

## 9. Acceptance Criteria
- Given form 130, when beforeLoad runs, then the Purchase Equipment button appears and client script is attached.
- Given other forms, when beforeLoad runs, then the button is not shown.

---

## 10. Testing Notes
- Open PO with form 130 and verify Purchase Equipment button.
- Other forms do not show the button.
- Deploy User Event on Purchase Order.

---

## 11. Deployment Notes
- Confirm form ID 130 and client script path.
- Deploy User Event on Purchase Order and validate button on form 130.
- Monitor logs for beforeLoad errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the form ID be parameterized?

---
