# PRD: Create COGS JE from Invoice Time Entries (Suitelet)

**PRD ID:** PRD-UNKNOWN-CreateCOGSJE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_bksl_createcogsje.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that creates a Journal Entry for COGS from time entries tied to an invoice and marks those time entries as posted.

**What problem does it solve?**
Ensures service labor time is posted to the correct COGS and WIP accounts when invoices are created or edited.

**Primary Goal:**
Create a JE from unposted time entries related to the invoice and update the time entries.

---

## 2. Goals

1. Identify unposted time entries related to the invoice or originating sales order.
2. Create a JE with debit and credit lines per time entry.
3. Mark time entries as posted and link them to the JE.

---

## 3. User Stories

1. **As an** accounting user, **I want** time entry costs posted to COGS **so that** labor costs are captured accurately.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `invId` and `action` parameters via POST.
2. The system must load the invoice and collect linked time entries.
3. The system must filter time entries to those not posted.
4. The system must create a JE with debit account `646` and credit account `464` per time entry.
5. The system must set memo to include the invoice document number.
6. The system must mark time entries as posted and set `custcol_sna_hul_linked_je`.

### Acceptance Criteria

- [ ] JE is created with balanced lines for time entry costs.
- [ ] Time entries are marked posted and linked to the JE.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle GET requests.
- Post time entries that are already posted.
- Validate account mapping beyond hardcoded IDs.

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet responds with status text.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Time Bill
- Journal Entry

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - JE creation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Invoice line | `custcol_sna_linked_time`
- Time Bill | `posted`
- Time Bill | `custcol_sna_hul_linked_je`

**Saved Searches:**
- Time bill searches created dynamically.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Time entries linked to invoice or SO lines.

**Data Sources:**
- Invoice lines and time entries.

**Data Retention:**
- Updates time entry records and creates JEs.

### Technical Constraints
- Uses hardcoded account IDs 646 and 464.
- Only processes POST requests.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Multiple search and record operations per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- JEs are created and time entries are posted correctly.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_bksl_createcogsje.js | Suitelet | Create COGS JE from time entries | Implemented |

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST with `invId` and `action=create`; JE created and time entries posted.

**Edge Cases:**
1. No linked time entries; no JE created.
2. Time entries already posted; no JE created.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users invoking the Suitelet.

**Permissions required:**
- View invoices
- Edit time bills
- Create JEs

---

## 12. Deployment Plan

### Deployment Steps

1. Upload `sna_hul_bksl_createcogsje.js`.
2. Deploy Suitelet and test with a sample invoice.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should account IDs be script parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Account IDs differ by environment | Med | Med | Move to script parameters |

---

## 15. References & Resources

### NetSuite Documentation
- SuiteScript 2.x Suitelet

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
