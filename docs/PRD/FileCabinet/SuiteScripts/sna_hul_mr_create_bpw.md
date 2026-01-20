# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateBPW
title: Bin Put-Away Worksheet Import (CSV)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_create_bpw.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Bin Put-Away Worksheet (record.Type.BIN_WORKSHEET)
  - Bin

---

## 1. Overview
A Map/Reduce script that builds Bin Put-Away Worksheet records from a CSV file uploaded by a Suitelet.

---

## 2. Business Goal
Automate creation of bin put-away worksheets from bulk CSV input, reducing manual entry.

---

## 3. User Story
As a warehouse user, when I upload a CSV of bin put-away lines, I want worksheets created automatically, so that I avoid manual entry.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_hul_bin_putaway_worksheet | CSV file provided | Parse CSV and create worksheets by location |

---

## 5. Functional Requirements
- Read the CSV file referenced by script parameter `custscript_sna_hul_bin_putaway_worksheet`.
- Parse item, location, bin number, and quantity from each CSV line.
- Group lines by location and create one Bin Put-Away Worksheet per location.
- For each worksheet line, set inventory detail quantity and bin assignment.
- Resolve bin internal IDs per location before setting inventory detail.

---

## 6. Data Contract
### Record Types Involved
- Bin Put-Away Worksheet (record.Type.BIN_WORKSHEET)
- Bin

### Fields Referenced
- Script parameter | custscript_sna_hul_bin_putaway_worksheet

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Bin number not found for location; line is skipped.
- Missing CSV file parameter results in no output records.

---

## 8. Implementation Notes (Optional)
- CSV parsing relies on comma separation with quoted values.
- Bin lookup executed per unique bin per location.

---

## 9. Acceptance Criteria
- Given CSV with multiple locations, when processed, then worksheets are created per location.
- Given worksheet lines, when created, then item, bin, and quantity match the CSV.

---

## 10. Testing Notes
- Upload CSV with multiple locations; verify multiple worksheets created.
- Bin number not found for location; verify line skipped.
- Missing CSV parameter; verify no output records.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_create_bpw.js`.
- Deploy Map/Reduce with required parameter.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- What CSV column order is enforced by the Suitelet?
- Risk: Invalid bin numbers.

---
