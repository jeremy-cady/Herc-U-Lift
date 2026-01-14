# PRD: LiftNet Buttons and Parcel Handling (User Event)

**PRD ID:** PRD-UNKNOWN-SendToLiftNetButtons
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_sendtoliftnetbuttons.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that adds LiftNet-related buttons on transaction view and manages parcel data updates with Spee-Dee/EasyPost integration.

**What problem does it solve?**
Provides quick access to LiftNet actions and keeps parcel records in sync with shipping label data.

**Primary Goal:**
Expose LiftNet buttons and update parcel JSON/records for item fulfillments.

---

## 2. Goals

1. Add LiftNet buttons on record view.
2. Save parcel details from the custom parcel sublist into JSON.
3. Buy and retrieve shipping labels when fulfillments are shipped.

---

## 3. User Stories

1. **As a** sales user, **I want** LiftNet buttons **so that** I can open LiftNet or email quotes quickly.
2. **As a** shipping user, **I want** parcel data updated **so that** labels and tracking are correct.

---

## 4. Functional Requirements

### Core Functionality

1. The system must add a "LiftNet" button on view with quote and estimate IDs.
2. The system must add an "Email LiftNet Quote" button when `custbody_liftnetquoteid` is present.
3. The system must save parcel sublist lines into `custbody_sna_parceljson` before submit.
4. The system must, after submit, buy Spee-Dee orders and retrieve shipping labels if fulfillment is shipped.
5. The system must update parcel records and tracking details in `customrecord_sna_parcel` and JSON.
6. The system must update shipping cost from API response when available.

### Acceptance Criteria

- [ ] LiftNet buttons appear on view when applicable.
- [ ] Parcel JSON reflects sublist entries.
- [ ] Shipping labels and tracking numbers update after submit.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate LiftNet credentials or handle LiftNet API calls.
- Provide a full parcel management UI beyond existing sublist.
- Handle carriers outside Spee-Dee/EasyPost.

---

## 6. Design Considerations

### User Interface
- Buttons on record view.

### User Experience
- Quick access to LiftNet actions and updated shipping data.

### Design References
- Script parameter `custscript_params_sendtoliftnetcsscript` for client script file.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Fulfillment
- Parcel (`customrecord_sna_parcel`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - LiftNet buttons and parcel updates
- [ ] Client Script - Used for LiftNet button actions

**Custom Fields:**
- Transaction | `custbody_liftnetquoteid`
- Transaction | `custbody_estimate`
- Item Fulfillment | `custbody_sna_parceljson`
- Item Fulfillment | `custbody_sna_speedeeorderid`

**Saved Searches:**
- None.

### Integration Points
- EasyPost API (`https://www.easypost.com/api/v2/`) for label buying/retrieval.

### Data Requirements

**Data Volume:**
- Multiple parcels per fulfillment.

**Data Sources:**
- Parcel sublist JSON and EasyPost API responses.

**Data Retention:**
- Updates parcel JSON and parcel custom records.

### Technical Constraints
- Requires valid EasyPost token in script parameter `custscript_param_speedeetoken`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** EasyPost/Spee-Dee APIs.
- **Other features:** Client script referenced by file ID.

### Governance Considerations
- External API calls can increase usage and latency.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- LiftNet buttons are available and parcel data updates correctly.

**How we'll measure:**
- Verify buttons and parcel updates on test fulfillment.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_sendtoliftnetbuttons.js | User Event | LiftNet buttons and parcel updates | Implemented |

### Development Approach

**Phase 1:** Button setup
- [x] Add LiftNet buttons on view.

**Phase 2:** Parcel update and API integration
- [x] Save parcel JSON and update labels.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. View record with LiftNet quote ID; buttons appear.
2. Save item fulfillment and verify parcel JSON updates.

**Edge Cases:**
1. No quote ID; email button not shown.
2. EasyPost API error; label updates fail and are logged.

**Error Handling:**
1. API errors are logged without blocking save.

### Test Data Requirements
- Item fulfillment with parcel data and Spee-Dee order ID.

### Sandbox Setup
- Configure EasyPost token parameter.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and shipping users.

**Permissions required:**
- View transactions
- Edit item fulfillments
- Create parcel records

### Data Security
- API tokens stored in script parameters.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_ue_sendtoliftnetbuttons.js`.
2. Set client script file parameter.
3. Configure EasyPost token parameter.

### Post-Deployment

- [ ] Verify buttons and parcel updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should LiftNet buttons appear on edit mode?
- [ ] Should parcel updates be handled by a separate script to avoid duplication?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| API downtime blocks label updates | Med | Med | Add retry or manual re-run process |
| Large parcel JSON increases processing time | Low | Med | Limit parcel size or optimize parsing |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/https module

### External Resources
- EasyPost API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
