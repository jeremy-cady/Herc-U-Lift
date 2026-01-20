# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-IFReclassWIP
title: Item Fulfillment WIP Reclass (Workflow Action)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: workflow_action
  file: FileCabinet/SuiteScripts/SNA/sna_hul_wfa_if_reclass_wip.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment

---

## 1. Overview
A workflow action script that reclassifies WIP account entries for item fulfillments.

## 2. Business Goal
Ensures WIP accounts are properly reclassified when item fulfillment workflows run.

## 3. User Story
As an accounting user, when item fulfillment workflows run, I want WIP accounts reclassified, so that fulfillment accounting is accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Workflow Action | TBD | Item fulfillment workflow | Invoke WIP reclassification module |

## 5. Functional Requirements
- The system must run as a workflow action script.
- The system must call `mod_reclasswip.reclassWIPAccount` with the current record and record type `itemfulfillment`.

## 6. Data Contract
### Record Types Involved
- Item Fulfillment

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Module load failure; error logged.
- Exceptions are caught and logged.

## 8. Implementation Notes (Optional)
- Depends on module availability at `/SuiteScripts/sn_hul_mod_reclasswipaccount.js`.

## 9. Acceptance Criteria
- Given a workflow action execution, when the script runs, then WIP reclassification runs for item fulfillment records.
- Given a failure, when the script runs, then errors are logged.

## 10. Testing Notes
- Trigger workflow on item fulfillment and verify reclass action runs.
- Module load failure; error logged.

## 11. Deployment Notes
- Upload `sna_hul_wfa_if_reclass_wip.js` and the module.
- Deploy Workflow Action and associate with workflow.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should this action validate record type before calling the module?
- Risk: Module path changes break action (Mitigation: Validate module path during deployment)

---
