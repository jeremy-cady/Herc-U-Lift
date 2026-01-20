# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoServicePricing
title: Sales Order Service Pricing
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_so_service_pricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)
  - Time Tracking (search results)
  - Custom Record | customrecord_sna_objects
  - Custom Record | customrecord_sna_sales_zone
  - Custom Record | customrecord_sna_hul_resrcpricetable

---

## 1. Overview
A Map/Reduce script that adds service resource lines to Sales Orders based on time tracking and pricing rules.

---

## 2. Business Goal
Ensures Sales Orders include service resource charges calculated from time tracking, asset data, and pricing tables.

---

## 3. User Story
As a service billing user, when time tracking is available, I want service labor lines added automatically, so that invoicing reflects actual time.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must load a Sales Order search from parameter `custscript_sna_so_list_srch`.
- The script must read task, asset, case, and zip data from each Sales Order result.
- The script must load a time tracking search from parameter `custscript_sna_time_srch` filtered by task.
- The script must derive pricing group from Sales Zone by zip code.
- The script must calculate unit price from the Resource Price Table by pricing group, manufacturer, and responsibility center.
- The script must add new item lines with service details and calculated amounts.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)
- Time Tracking (search results)
- Custom Record | `customrecord_sna_objects`
- Custom Record | `customrecord_sna_sales_zone`
- Custom Record | `customrecord_sna_hul_resrcpricetable`

### Fields Referenced
- Sales Order | `custbody_nx_task`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_asset`
- Sales Order | `shipzip`
- Sales Order Item | `custcol_sna_cpg_resource`
- Sales Order Item | `custcol_nxc_case`
- Sales Order Item | `custcol_nx_asset`
- Sales Order Item | `custcol_nx_task`
- Sales Order Item | `custcol_sna_so_service_code_type`
- Sales Order Item | `custcol_sna_object`
- Sales Order Item | `custcol_sna_resource_res_center`
- Sales Order Item | `custcol_sna_resource_manuf`
- Sales Order Item | `custcol_sna_hul_newunitcost`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No time tracking results results in no added lines.
- Missing asset object or pricing data logs errors without crashing the run.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Adds lines dynamically; each Sales Order save consumes usage.
- Constraints: Requires valid asset object and time tracking data.
- Dependencies: Pricing configuration in `customrecord_sna_hul_resrcpricetable`.
- Risk: Pricing table mismatch by zip or manufacturer.

---

## 9. Acceptance Criteria
- Given Sales Orders with time tracking results, when the script runs, then Sales Orders receive new service resource lines.
- Given time tracking hours, when lines are added, then quantities reflect time tracking hours converted to decimal.
- Given a pricing group and resource price table, when lines are added, then unit price and amount reflect the resource price table.

---

## 10. Testing Notes
- Happy path: Sales Order with valid task/time tracking creates service lines with correct amounts.
- Edge case: No time tracking results results in no added lines.
- Error handling: Missing asset object or pricing data logs errors without crashing the run.
- Test data: Sales Orders tied to tasks with time tracking data.
- Sandbox setup: Ensure Sales Zone and Resource Price Table records are configured.

---

## 11. Deployment Notes
- Configure search parameters for Sales Orders and time tracking.
- Upload `sna_hul_mr_so_service_pricing.js`.
- Deploy Map/Reduce with parameters.
- Post-deployment: Verify service lines on a sample Sales Order.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.
- Should non-resource service code types be excluded from pricing logic?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
