# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RateCardSublist
title: Rate Card Sublist Effective End Date
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_ratecardsublist.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_rate_card_sublist

---

## 1. Overview
User Event that updates the effective end date on prior rate card sublist records when a new rate card entry is added.

---

## 2. Business Goal
Ensure rate card sublist entries have contiguous date ranges with proper end dates.

---

## 3. User Story
As a pricing admin, when adding a new rate card entry, I want the prior entry closed, so that rate ranges do not overlap.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | effective start date | non-delete | Set prior record end date to day before new start date |

---

## 5. Functional Requirements
- Run afterSubmit on rate card sublist records (non-delete).
- Search for the latest prior record with the same linked rate card and time unit.
- Set that record's effective end date to the day before the new record's start date.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_rate_card_sublist

### Fields Referenced
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_linked_rate_card | Linked rate card
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_rent_time_unit | Time unit
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_start_date | Start date
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_end_date | End date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- First entry for a rate card has no prior record.
- Missing start date prevents end date update.
- Search or submitFields errors are logged.

---

## 8. Implementation Notes (Optional)
- Requires start date on current record to compute end date.

---

## 9. Acceptance Criteria
- Given a new rate card entry, when afterSubmit runs, then the prior entry end date is set correctly.

---

## 10. Testing Notes
- Create new rate card entry and verify prior end date is set.
- First entry for a rate card has no prior record.
- Deploy User Event on rate card sublist.

---

## 11. Deployment Notes
- Confirm rate card sublist fields exist.
- Deploy User Event on rate card sublist and validate end date updates.
- Monitor logs for update errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the script handle updates to start date on existing records?

---
