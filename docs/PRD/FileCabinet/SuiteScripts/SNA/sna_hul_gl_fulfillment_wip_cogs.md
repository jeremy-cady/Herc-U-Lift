# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FulfillmentWipCogsGL
title: Item Fulfillment WIP COGS Reclass (Custom GL)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: custom_gl
  file: FileCabinet/SuiteScripts/SNA/sna_hul_gl_fulfillment_wip_cogs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment
  - Sales Order
  - Journal Entry
  - Account

---

## 1. Overview
A Custom GL plugin that reclassifies COGS on item fulfillment transactions to a WIP account and updates linked journal entries.

## 2. Business Goal
Ensures fulfillment COGS are moved to a configured WIP account for specific sales order forms, keeping accounting aligned with internal WIP processes.

## 3. User Story
As an accountant, when item fulfillments post COGS, I want fulfillment COGS reclassified to WIP, so that WIP reporting is accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Item fulfillment from sales orders on supported forms | Create custom GL lines and update linked JE lines |

## 5. Functional Requirements
- The system must run only on `itemfulfillment` transactions created from sales orders.
- The system must skip transactions that are not from supported sales order forms (IDs 112, 113, 106, 153).
- The system must read the WIP account from script preference `custscript_sna_hul_gl_wip_account`.
- For each COGS posting line, the system must create two custom GL lines: credit the original COGS account and debit the WIP account.
- The system must collect COGS line details and update related JE lines referenced in `custbody_sna_hul_je_wip`.
- Errors must be logged without halting execution.

## 6. Data Contract
### Record Types Involved
- Item Fulfillment
- Sales Order
- Journal Entry
- Account

### Fields Referenced
- Item Fulfillment | `custbody_sna_hul_je_wip`
- Script preference | `custscript_sna_hul_gl_wip_account`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Item fulfillment from non-qualifying form; no reclass.
- No linked JE; only custom GL lines added.
- JE update fails; error logged.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 API (`nlapi*`).
- Sales order form filtering is hard-coded by ID.

## 9. Acceptance Criteria
- Given a qualifying item fulfillment, when the plugin runs, then COGS lines are reclassified to the WIP account.
- Given a non-qualifying form, when the plugin runs, then no reclass occurs.
- Given a linked JE, when the plugin runs, then related JE lines are updated.

## 10. Testing Notes
- Item fulfillment from a qualifying sales order creates WIP reclass lines.
- Item fulfillment from non-qualifying form; no reclass.
- No linked JE; only custom GL lines added.
- JE update fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_gl_fulfillment_wip_cogs.js`.
- Set script preference `custscript_sna_hul_gl_wip_account`.
- Deploy as a Custom GL Plugin.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should sales order form IDs be configurable instead of hard-coded?
- Should reclassification include class or other segments?
- Risk: Form ID changes break logic (Mitigation: Move form IDs to script parameters)
- Risk: JE updates overwrite existing lines (Mitigation: Review JE update logic for safety)

---
