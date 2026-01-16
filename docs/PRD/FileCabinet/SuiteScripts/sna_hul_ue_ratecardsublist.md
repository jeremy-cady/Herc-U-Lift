# PRD: Rate Card Sublist Effective End Date

**PRD ID:** PRD-UNKNOWN-RateCardSublist
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_ratecardsublist.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that updates the effective end date on prior rate card sublist records when a new rate card entry is added.

**What problem does it solve?**
Ensures rate card sublist entries have contiguous date ranges with proper end dates.

**Primary Goal:**
Set the previous rate card sublist end date to one day before the new start date.

---

## 2. Goals

1. Find the most recent prior rate card sublist record for the same rate card and time unit.
2. Set its effective end date based on the new start date.

---

## 3. User Stories

1. **As a** pricing admin, **I want to** auto-close prior rate card entries **so that** rate ranges do not overlap.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on rate card sublist records (non-delete).
2. The script must search for the latest prior record with the same linked rate card and time unit.
3. The script must set that record's effective end date to the day before the new record's start date.

### Acceptance Criteria

- [ ] Prior rate card sublist record has effective end date set correctly.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate date overlaps across different time units.
- Update the current record's dates.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Rate card date ranges update automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_rate_card_sublist

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Effective end date update
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_linked_rate_card | Linked rate card
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_rent_time_unit | Time unit
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_start_date | Start date
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_end_date | End date

**Saved Searches:**
- Search for prior rate card sublist records by linked rate card and time unit.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search and submitFields per new sublist entry.

**Data Sources:**
- Rate card sublist records.

**Data Retention:**
- Updates prior sublist end date.

### Technical Constraints
- Requires start date on current record to compute end date.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rate card maintenance

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** One search per save.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Prior rate card entries receive correct end dates.

**How we'll measure:**
- Review rate card sublist records after creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_ratecardsublist.js | User Event | Update effective end date | Implemented |

### Development Approach

**Phase 1:** Search prior record
- [ ] Validate prior record selection

**Phase 2:** Date update
- [ ] Validate end date calculation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create new rate card entry and verify prior end date is set.

**Edge Cases:**
1. First entry for a rate card has no prior record.

**Error Handling:**
1. Search or submitFields errors are logged.

### Test Data Requirements
- Multiple rate card sublist records with the same time unit

### Sandbox Setup
- Deploy User Event on rate card sublist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Pricing admins

**Permissions required:**
- Edit rate card sublist records

### Data Security
- Pricing data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm rate card sublist fields exist

### Deployment Steps

1. Deploy User Event on rate card sublist.
2. Validate end date updates.

### Post-Deployment

- [ ] Monitor logs for update errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update end dates manually if needed.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the script handle updates to start date on existing records?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing start date prevents end date update | Low | Low | Validate required fields in UI |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
