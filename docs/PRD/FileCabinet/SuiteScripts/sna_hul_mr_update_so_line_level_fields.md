# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSoLineLevelFields
title: Update SO Line Level Fields
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_update_so_line_level_fields.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - invoice

---

## 1. Overview
Updates Sales Order or Invoice item sublist fields from header values in bulk.

---

## 2. Business Goal
Ensures line-level fields match header fields for reporting and downstream processing.

---

## 3. User Story
- As an administrator, when I update line fields in bulk, I want reporting to stay consistent, so that downstream data aligns.
- As a finance user, when invoice line fields match header data, I want posting to be accurate, so that results are correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | TBD | Saved search parameter `custscript_sna_saved_search` | Copy configured header fields to item sublist fields |

---

## 5. Functional Requirements
- Load a saved search from script parameter `custscript_sna_saved_search`.
- Determine record type (Sales Order or Invoice) from search results.
- Copy configured header fields to item sublist fields on each line.
- When `custscript_sna_empty_columns` is true, only empty line fields are populated.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- invoice

### Fields Referenced
- transaction.cseg_sna_revenue_st
- transaction.custbody_nx_asset
- transaction.custbody_sna_hul_nxc_eq_asset
- transaction.custbody_nx_task
- transaction.custbody_nx_case
- transaction.custbody_sna_equipment_object
- transactionline.custcol_nx_asset
- transactionline.custcol_nxc_equip_asset
- transactionline.custcol_nx_task
- transactionline.custcol_nxc_case
- transactionline.custcol_sna_hul_fleet_no

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invoice records are included and updated correctly.
- Empty-only mode skips populated line fields.
- Missing saved search ID results in no processing.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Map/Reduce governance limits for large record sets.

---

## 9. Acceptance Criteria
- Given a saved search provides records, when the job runs, then line fields are updated for each record.
- Given field flags are enabled by script parameters, when the job runs, then only those fields are copied.
- Given empty-only mode is enabled, when the job runs, then populated line values are not overwritten.

---

## 10. Testing Notes
Manual tests:
- Sales Order lines updated with header values for selected fields.
- Invoice records are included and updated correctly.
- Empty-only mode skips populated line fields.
- Missing saved search ID results in no processing.

---

## 11. Deployment Notes
- Saved search configured.
- Field flags reviewed.
- Deploy Map/Reduce with parameters.
- Execute against target records.

---

## 12. Open Questions / TBDs
- Should the script support additional line fields?

---
