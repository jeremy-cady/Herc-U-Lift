# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemPricingDetails
title: Item Pricing Details
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_itempricingdetails.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder

---

## 1. Overview
Suitelet that displays pricing-related line fields for a sales order line.

---

## 2. Business Goal
Provides visibility into pricing details stored on the line without opening the full record.

---

## 3. User Story
- As a sales user, when I view line pricing details, I want to confirm pricing setup, so that pricing is correct.
- As a support user, when I see discount group and basis, I want to answer questions quickly, so that support is efficient.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | lineid | `lineid` provided | Render read-only pricing fields for the line |

---

## 5. Functional Requirements
- Accept `lineid` as a request parameter.
- Search the sales order line by `lineuniquekey`.
- Populate read-only fields with line-level pricing values.

---

## 6. Data Contract
### Record Types Involved
- salesorder

### Fields Referenced
- salesorderline.lineuniquekey
- salesorderline.custcol_sna_hul_itemcategory
- salesorderline.custcol_sna_hul_item_pricelevel
- salesorderline.custcol_sna_hul_markup
- salesorderline.custcol_item_discount_grp
- salesorderline.custcol_sna_hul_markupchange
- salesorderline.custcol_sna_hul_loc_markup
- salesorderline.custcol_sna_hul_loc_markupchange
- salesorderline.custcol_sna_hul_replacementcost
- salesorderline.custcol_sna_hul_list_price
- salesorderline.custcol_sna_hul_basis

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing `lineid` returns empty form.
- Invalid line key results in no values.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: One search per request.

---

## 9. Acceptance Criteria
- Given a line unique key, when the Suitelet runs, then pricing fields display values for the specified line.
- Given the form renders, when the Suitelet loads, then it is read-only and hides navigation.

---

## 10. Testing Notes
Manual tests:
- Line with pricing values displays all fields.
- Missing `lineid` returns empty form.
- Invalid line key results in no values.

---

## 11. Deployment Notes
- Validate line fields exist.
- Deploy Suitelet.
- Provide access from line-level UI.

---

## 12. Open Questions / TBDs
- Should the Suitelet show calculated rate or margin fields?

---
