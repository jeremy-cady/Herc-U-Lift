# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetSegment
title: Set Equipment Segments and Tax Codes
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_setsegment.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - invoice
  - customrecord_sna_objects

---

## 1. Overview
User Event that assigns equipment segments, manufacturer segments, and responsibility centers on transaction lines, and sets tax codes based on fulfillment method.

---

## 2. Business Goal
Ensure transactions carry correct segment values and tax codes without manual entry.

---

## 3. User Story
As an accountant, when saving transactions, I want segments and tax codes populated, so that reporting stays accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | fulfillment method | non-delete | Determine final tax code and update segments/tax fields |

---

## 5. Functional Requirements
- On beforeSubmit (excluding delete), determine the final tax code from fulfillment method parameters.
- On invoices, call the tax module to update internal revenue stream lines.
- Apply shipping tax code and mark `custbody_sna_tax_processed` when applicable.
- Set line segments from the header object when available.
- If no header object, set line segments from each line object.
- Set line tax code when applicable and not internal.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- estimate
- invoice
- customrecord_sna_objects

### Fields Referenced
- transaction | custbody_sna_order_fulfillment_method | Fulfillment method
- transaction | custbody_sna_tax_processed | Tax processed flag
- transaction | custbody_sna_equipment_object | Header object
- transaction | shippingtaxcode | Shipping tax code
- transaction line | custcol_sna_hul_fleet_no | Fleet number
- transaction line | custcol_sna_object | Line object
- transaction line | cseg_sna_hul_eq_seg | Equipment segment
- transaction line | cseg_hul_mfg | Manufacturer segment
- transaction line | custcol_sna_resource_res_center | Responsibility center
- customrecord_sna_objects | cseg_sna_hul_eq_seg | Equipment segment
- customrecord_sna_objects | cseg_hul_mfg | Manufacturer segment
- customrecord_sna_objects | custrecord_sna_responsibility_center | Responsibility center

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No header object and missing line objects should leave segments blank.
- Missing parameter values should log errors without breaking save.
- Incorrect object linkage leads to wrong segments.

---

## 8. Implementation Notes (Optional)
- Module: sna_hul_mod_sales_tax.js.
- Tax code selection depends on script parameter values.

---

## 9. Acceptance Criteria
- Given header or line objects, when beforeSubmit runs, then line segments populate correctly.
- Given fulfillment method parameters, when beforeSubmit runs, then tax code and shipping tax code are applied and `custbody_sna_tax_processed` is set.

---

## 10. Testing Notes
- Create sales order with header object and verify line segments.
- Create invoice with ship fulfillment method and verify tax codes.
- No header object and missing line objects should leave segments blank.
- Deploy User Event on sales order, estimate, and invoice.

---

## 11. Deployment Notes
- Confirm fulfillment method and tax parameter values.
- Deploy User Event on sales order, estimate, and invoice and validate segment and tax updates.
- Monitor logs for missing object references; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should tax codes be applied for web services contexts?

---
