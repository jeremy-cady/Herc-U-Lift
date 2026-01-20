# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-IFCustomGLPlugin
title: Item Fulfillment WIP Reclass Custom GL Plugin
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: custom_gl_plugin
  file: FileCabinet/SuiteScripts/sn_hul_if_custom_gl_plugin.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment
  - Sales Order
  - Journal Entry
  - Account

---

## 1. Overview
A custom GL plugin that reclassifies COGS to a WIP account for item fulfillments created from specific Sales Order forms, and optionally updates linked Journal Entries.

---

## 2. Business Goal
Ensure COGS is reclassified to the correct WIP account for eligible fulfillment transactions.

---

## 3. User Story
As an accounting user, when eligible item fulfillments are created, I want COGS reclassified to WIP, so that fulfillment accounting aligns with policy.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Custom GL on item fulfillment | custscript_sna_hul_gl_wip_account, custbody_sna_hul_je_wip, custom form | fulfillment created from SO and SO custom form in 112, 113, 106, 153 | Add custom GL lines to reclass COGS to WIP and update linked JEs |

---

## 5. Functional Requirements
- Run on item fulfillment transactions only.
- Read WIP account from `custscript_sna_hul_gl_wip_account` preference.
- Only proceed when the fulfillment is created from a Sales Order and the SO custom form is one of: 112, 113, 106, 153.
- Build COGS groupings from fulfillment lines and add custom GL lines to credit COGS and debit WIP.
- If `custbody_sna_hul_je_wip` contains JE IDs, update those JE lines based on the fulfillment lines.

---

## 6. Data Contract
### Record Types Involved
- Item Fulfillment
- Sales Order
- Journal Entry
- Account

### Fields Referenced
- Item Fulfillment | custbody_sna_project_mainline
- Item Fulfillment | custbody_sna_hul_je_wip
- Item Fulfillment | custbody_sn_removed_lines
- Script preference | custscript_sna_hul_gl_wip_account

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing WIP account preference; no reclass occurs.
- Non-eligible SO form; no reclass occurs.
- JE references present; lines updated.

---

## 8. Implementation Notes (Optional)
- SO custom form IDs are hardcoded.
- Performance/governance considerations: search usage for COGS and account types; JE loads and saves when present.

---

## 9. Acceptance Criteria
- Given an eligible item fulfillment, when the plugin runs, then it reclasses COGS to WIP via custom GL lines.
- Given `custbody_sna_hul_je_wip` contains JE IDs, when the plugin runs, then linked WIP JEs are updated.

---

## 10. Testing Notes
- Item fulfillment from eligible SO form; confirm custom GL lines.
- Missing WIP account preference; confirm no reclass.
- Non-eligible SO form; confirm no reclass.
- JE references present; confirm JE lines updated.

---

## 11. Deployment Notes
- Upload `sn_hul_if_custom_gl_plugin.js`.
- Deploy as custom GL plugin for item fulfillments.
- Configure WIP account preference.
- Rollback: disable the custom GL plugin deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the list of eligible SO forms be moved to parameters?
- Risk: Hardcoded form IDs change.
- Risk: JE updates fail due to missing lines.

---
