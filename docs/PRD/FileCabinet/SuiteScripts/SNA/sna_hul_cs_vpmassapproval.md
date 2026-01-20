# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VPMassApprovalCS
title: Vendor Price Mass Approval UI (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_vpmassapproval.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Price custom records (displayed in Suitelet)

---

## 1. Overview
A client script that drives the vendor price mass approval Suitelet UI, including selection, paging, and filter controls.

## 2. Business Goal
Enables users to select vendor price records for approval/rejection and navigate pages of results.

## 3. User Story
As an approver, when I review vendor price approvals, I want to select multiple records, so that I can approve them in batch.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | `custpage_slf_select` | Sublist checkbox toggled | Add/remove vendor price ID from hidden field |
| TBD | `custpage_ps_fld_page`, `custpage_ps_fld_itemcatfilter` | Paging or filter action | Refresh Suitelet URL with page/filter parameters |

## 5. Functional Requirements
- The system must track selected vendor prices in `custpage_fld_vptoapprove`.
- When a line checkbox is toggled, the system must add/remove the vendor price ID.
- The system must support changing pages via `next`, `prev`, and `jump`.
- The system must refresh the Suitelet URL with page and filter parameters.
- The system must support mark-all and unmark-all on the sublist.
- The system must update URL parameters when the item category filter changes.

## 6. Data Contract
### Record Types Involved
- Vendor Price custom records (displayed in Suitelet)

### Fields Referenced
- Page fields: `custpage_fld_vptoapprove`, `custpage_fld_vptoreject`, `custpage_ps_fld_page`, `custpage_ps_fld_itemcatfilter`
- Sublist fields: `custpage_slf_select`, `custpage_slf_vp`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No records selected; actions should be blocked (handled by Suitelet).
- Page number invalid; no action taken.
- URL resolve fails; user remains on current page.

## 8. Implementation Notes (Optional)
- Uses URL query parameters to manage pagination and filters.
- Some functions (export/reject) are defined but not returned.

## 9. Acceptance Criteria
- Given selected vendor price IDs, when the checkbox toggles, then the hidden field updates.
- Given paging buttons, when used, then the Suitelet loads the correct page.
- Given mark-all actions, when used, then all row selections are toggled.

## 10. Testing Notes
- Select multiple records; hidden field updates.
- Navigate pages; results update.
- No records selected; actions should be blocked (handled by Suitelet).
- Page number invalid; no action taken.
- URL resolve fails; user remains on current page.

## 11. Deployment Notes
- Upload `sna_hul_cs_vpmassapproval.js`.
- Deploy with the vendor price approval Suitelet.
- Validate selection and paging behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should selection persist across page refreshes?
- Should export/reject functions be exposed in the UI?
- Risk: Selection list desyncs on paging (Mitigation: Persist selection in hidden field as designed)
- Risk: Large result sets slow UI (Mitigation: Optimize Suitelet paging)

---
