# PRD: Document Distribution Contacts & Customers Fix Suitelet

**PRD ID:** PRD-UNKNOWN-DocDistributionFix
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_doc_distribution_fix_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_doc_distribution_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that audits Document Distribution records and related contacts/customers, presenting a compacted, filtered list with actions to hide, dismiss, and apply corrected email values to customers.

**What problem does it solve?**
Document Distribution records can reference contacts/customers with mismatched or duplicated emails. This tool helps identify problematic rows, suppress resolved items, and optionally update the customer email to the preferred value.

**Primary Goal:**
Provide a controlled UI to review Document Distribution rows, filter out valid matches, and fix customer email data when needed.

---

## 2. Goals

1. List DD/contact/customer email combinations in a compacted, paged view.
2. Filter out rows that already align by email/domain rules.
3. Support per-row actions: hide (session), dismiss (persist), apply email to customer.

---

## 3. User Stories

1. **As a** finance user, **I want to** see only mismatched DD/contact/customer rows **so that** I can focus on fixes.
2. **As an** admin, **I want to** dismiss resolved rows permanently **so that** they do not reappear.
3. **As a** user, **I want to** apply a selected DD email to the customer **so that** customer records stay accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query `customrecord_sna_hul_doc_distribution` with related contacts and customers via SuiteQL.
2. The system must filter rows using email/domain rules and a persisted dismissed flag.
3. The system must support actions per row:
   - **Hide (session):** hide a row in the current session only.
   - **Dismiss (persist):** set `custrecord_doc_distribution_dismissed` on the DD record.
   - **Apply to Customer:** set the customer email to a chosen DD email.
4. The system must page results with a filtered page selector and 1000‑row page size.
5. The system must display raw and filtered counts for visibility.

### Acceptance Criteria

- [ ] Rows that already match by email/domain rules are excluded.
- [ ] Dismissed rows do not reappear unless the flag is cleared.
- [ ] Hide works per session and can be cleared.
- [ ] Apply updates the customer email and logs a summary.
- [ ] Paging uses the filtered row count, not raw SQL count.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify DD records beyond the dismissed flag.
- Perform bulk operations across all pages automatically.
- Validate email deliverability beyond format parsing.

---

## 6. Design Considerations

### User Interface
- Suitelet list sublist with action checkboxes and summary fields.

### User Experience
- Compacted list with only actionable rows.
- Summary text after POST showing updated/skipped/failed counts.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record: `customrecord_sna_hul_doc_distribution`
- Contact
- Customer

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Main UI and processing
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Shift‑click range selection

**Custom Fields:**
- Doc Distribution | `custrecord_doc_distribution_dismissed` | Persisted dismissal flag
- Doc Distribution | `custrecord_doc_distribution_emailaddress` | DD email(s)
- Doc Distribution | `custrecord_doc_distribution_email_check` | Use override email flag
- Doc Distribution | `custrecord_doc_distribution_customer` | Explicit customer link

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- Updates Customer `email` field via `record.submitFields`.

### Data Requirements

**Data Volume:**
- SuiteQL paged at 1000 rows; filtered and compacted before display.

**Data Sources:**
- SuiteQL joins between DD records, contacts, and customers.

**Data Retention:**
- Dismiss flag persists on DD records.

### Technical Constraints
- Only current page actions are processed per submit.
- Hide state is stored in a hidden CSV field (session‑level).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Client script for Shift‑click (hul_doc_distribution_cs.js).

### Governance Considerations
- SuiteQL pagination; per‑row updates only for selected lines.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Mismatched rows are easy to isolate and resolve.
- Dismissed rows stay hidden across sessions.
- Customer email updates apply without errors.

**How we'll measure:**
- Review update summaries and reduced manual cleanup time.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_doc_distribution_fix_sl.js | Suitelet | Compacted DD audit and fix UI | Implemented |
| hul_doc_distribution_cs.js | Client Script | Shift‑click selection | Implemented |

### Development Approach

**Phase 1:** Suitelet UI and filtering
- [x] SuiteQL join for DD/contact/customer
- [x] Filter rules and compacted paging
- [x] Action checkboxes (hide/dismiss/apply)

**Phase 2:** Updates and summary
- [x] Persist dismiss flag
- [x] Apply customer email updates
- [x] Update summary display

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Load Suitelet and confirm only mismatched rows display.
2. Dismiss a row and verify it does not reappear.
3. Apply email to customer and confirm customer email changes.

**Edge Cases:**
1. Rows with blank emails on all sides are excluded.
2. DD email equals customer email → excluded.
3. DD email shares customer domain → excluded.

**Error Handling:**
1. Failed submitFields operations are surfaced in the summary.

### Test Data Requirements
- DD records with various email combinations.

### Sandbox Setup
- Deploy Suitelet and client script in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance/admin users managing document distribution.

**Permissions required:**
- View/Edit Customer.
- View/Edit Doc Distribution custom record.

### Data Security
- Email values are displayed; no sensitive data beyond emails.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Suitelet script.
2. Attach the client script module path.
3. Validate update actions in production with test records.

### Post-Deployment

- [ ] Monitor for failed update summaries.

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should email matching rules be configurable (domain whitelist/blacklist)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect email selection applied to customer | Low | High | Review target_email before Apply |
| Dismiss hides a row permanently in error | Low | Medium | Clear flag on DD record |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet docs.
- SuiteQL reference.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
