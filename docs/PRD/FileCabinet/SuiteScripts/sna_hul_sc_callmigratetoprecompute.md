# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CallMigrateToPrecompute
title: Call Migrate To Precompute
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/sna_hul_sc_callmigratetoprecompute.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_ncfar_asset

---

## 1. Overview
Scheduled script that triggers the FAM Migrate to Precompute scheduled script when needed.

---

## 2. Business Goal
Ensures FAM Asset Values are created for script-created FAM assets when asset values are missing.

---

## 3. User Story
- As an admin, when assets are missing values, I want precompute to run only when needed, so that system usage is optimized.
- As a finance user, when FAM asset values are generated, I want asset reporting to be accurate, so that reports are reliable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | custrecord_assetvals, custrecord_sna_fa_created | Assets missing values and flagged as script-created | Submit `customscript_fam_migratetoprecompute_ss` with deployment `customdeploy_fam_migratetoprecompute_ss` |

---

## 5. Functional Requirements
- Search `customrecord_ncfar_asset` for records with empty `custrecord_assetvals` and `custrecord_sna_fa_created` = true.
- When at least one record matches, submit the scheduled script `customscript_fam_migratetoprecompute_ss` with deployment `customdeploy_fam_migratetoprecompute_ss`.
- Avoid scheduling when no assets need processing.

---

## 6. Data Contract
### Record Types Involved
- customrecord_ncfar_asset

### Fields Referenced
- customrecord_ncfar_asset.custrecord_assetvals
- customrecord_ncfar_asset.custrecord_sna_fa_created

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No eligible assets and task is not submitted.
- Missing FAM script deployment logs an error.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Minimal; single search and optional task submit.

---

## 9. Acceptance Criteria
- Given eligible assets exist, when the script runs, then the precompute script is submitted.
- Given no assets match, when the script runs, then no task is submitted.

---

## 10. Testing Notes
Manual tests:
- Eligible assets exist and precompute task is submitted.
- No eligible assets and task is not submitted.
- Missing FAM script deployment logs an error.

---

## 11. Deployment Notes
- FAM scheduled script exists.
- Ensure script deployment IDs match.
- Deploy scheduled script.
- Schedule execution as needed.

---

## 12. Open Questions / TBDs
- Should the script be scheduled or triggered ad hoc?

---
