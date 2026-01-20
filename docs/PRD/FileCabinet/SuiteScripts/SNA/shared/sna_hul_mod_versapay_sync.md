# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VersaPaySyncModule
title: VersaPay Sync Prevention Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_versapay_sync.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)
  - Transaction (caller record)

---

## 1. Overview
A shared module that marks transactions as "do not sync" with VersaPay based on the revenue stream configuration.

## 2. Business Goal
Automatically prevents internal revenue stream transactions from syncing to VersaPay.

## 3. User Story
As an AR admin, when transactions use internal revenue streams, I want internal transactions excluded from VersaPay, so that only external invoices sync.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `cseg_sna_revenue_st` | Revenue stream present | Set `custbody_versapay_do_not_sync` to internal flag value |

## 5. Functional Requirements
- The system must read `cseg_sna_revenue_st` from the current record.
- If no revenue stream is present, the system must exit without changes.
- The system must lookup `custrecord_sna_hul_revstreaminternal` on the revenue stream record.
- The system must set `custbody_versapay_do_not_sync` on the current record to the lookup value.
- Errors in lookup must be logged without throwing.

## 6. Data Contract
### Record Types Involved
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)
- Transaction (caller record)

### Fields Referenced
- Transaction | `cseg_sna_revenue_st`
- Transaction | `custbody_versapay_do_not_sync`
- Revenue Stream | `custrecord_sna_hul_revstreaminternal`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Transaction with no revenue stream does nothing.
- Revenue stream lookup fails; error logged.

## 8. Implementation Notes (Optional)
- Uses `search.lookupFields.promise` and sets field asynchronously.

## 9. Acceptance Criteria
- Given an internal revenue stream, when the helper runs, then `custbody_versapay_do_not_sync` is set to true.
- Given no revenue stream, when the helper runs, then no changes are made.
- Given a lookup failure, when the helper runs, then the error is logged.

## 10. Testing Notes
- Transaction with internal revenue stream sets do-not-sync flag.
- Transaction with no revenue stream does nothing.
- Revenue stream lookup fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_mod_versapay_sync.js`.
- Ensure consuming scripts import and call the helper.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the helper also clear the flag when revenue stream is not internal?
- Should lookup failures block record save?
- Risk: Async lookup completes after record save (Mitigation: Ensure caller waits or runs in beforeSubmit)
- Risk: Incorrect revenue stream configuration (Mitigation: Validate configuration periodically)

---
