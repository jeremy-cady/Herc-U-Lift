# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_credit_memo_do_not_sync_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Finance/hul_credit_memo_do_not_sync_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Credit Memo

---

## 1. Overview
NetSuite User Event script that sets the "Do Not Sync" flag on Credit Memos when the Revenue Stream matches a predefined allowlist.

---

## 2. Business Goal
Prevent Credit Memos with specific Revenue Streams from syncing by automatically flagging them.

---

## 3. User Story
As a user, when a Credit Memo is created with a Revenue Stream in the allowlist, I want the "Do Not Sync" flag set, so that it is excluded from sync.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (beforeSubmit) | cseg_sna_revenue_st | Revenue Stream internal ID is in revStreamInternalValues | Set custbody_versapay_do_not_sync = true |

---

## 5. Functional Requirements
- On CREATE only, read cseg_sna_revenue_st and custbody_versapay_do_not_sync.
- Convert the Revenue Stream value to a number.
- If Revenue Stream internal ID is in revStreamInternalValues, set custbody_versapay_do_not_sync to true.
- Otherwise leave custbody_versapay_do_not_sync unchanged.
- Log current values for custbody_versapay_do_not_sync and cseg_sna_revenue_st.
- Wrap logic in try/catch and log errors via log.error.

---

## 6. Data Contract
### Record Types Involved
- Credit Memo

### Fields Referenced
- custbody_versapay_do_not_sync
- cseg_sna_revenue_st

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Only applies to CREATE; edits and updates are not handled.
- If cseg_sna_revenue_st is empty or non-numeric, do not change custbody_versapay_do_not_sync.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
