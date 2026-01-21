# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoTransprocInvdetail
title: SO Transfer Process Inventory Detail
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_so_transproc_invdetail.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - inventoryitem
  - bin

---

## 1. Overview
Suitelet that displays and captures inventory detail (bin assignments) for SO transfer processing.

---

## 2. Business Goal
Provides a UI to select From/To bins and quantities for transfer transactions.

---

## 3. User Story
- As a warehouse user, when I select bins for transfers, I want inventory movement tracked accurately, so that bin counts are correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | item, quantity, location | Parameters provided | Display bin lists and capture inventory detail selections |

---

## 5. Functional Requirements
- Accept item, quantity, and location parameters.
- List available bins from the source location with available quantities.
- List destination bins for the target location.
- Allow entry of quantities for bin assignments.

---

## 6. Data Contract
### Record Types Involved
- inventoryitem
- bin

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No bins available results in empty options.
- Invalid item or location logs error.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Bin and item searches.

---

## 9. Acceptance Criteria
- Given source and destination locations, when the Suitelet runs, then From and To bin lists populate based on locations.
- Given entries are made, when the Suitelet runs, then inventory detail entries are captured in the sublist.

---

## 10. Testing Notes
Manual tests:
- Bin lists populate for a bin-enabled item.
- No bins available results in empty options.
- Invalid item or location logs error.

---

## 11. Deployment Notes
- Client script deployed.
- Deploy Suitelet.
- Link from transfer process UI.

---

## 12. Open Questions / TBDs
- Should bin selection enforce quantity available validation?

---
