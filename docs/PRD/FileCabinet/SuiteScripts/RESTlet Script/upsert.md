# PRD: RESTlet Upsert Records Helper

**PRD ID:** PRD-UNKNOWN-UpsertRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/upsert.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet helper that creates or updates records based on the presence of an internal ID, applying literal fields and sublist updates.

**What problem does it solve?**
Provides a single API entry point for both create and update operations with consistent request formatting.

**Primary Goal:**
Upsert requested records and return per-request results in a standard response.

---

## 2. Goals

1. Accept a list of upsert requests in the RESTlet payload.
2. Create new records when `internalid` is missing and load existing records when it is present.
3. Apply literal field and sublist updates, then submit records and return their IDs.

---

## 3. User Stories

1. **As an** integration, **I want to** upsert records **so that** I can create or update data in one call.
2. **As a** developer, **I want** a reusable upsert handler **so that** RESTlet endpoints stay consistent.
3. **As an** admin, **I want** standardized responses **so that** errors are easy to diagnose.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `record_data` in the request, containing one or more upsert requests.
2. Each upsert request must include `record_type` and optional `internalid`.
3. The system must load existing records when `internalid` is provided; otherwise it must create a new record.
4. The system must apply literal field updates via `NetsuiteToolkit.RecordProcessor.updateLiterals`.
5. The system must apply sublist updates via `NetsuiteToolkit.SublistProcessor`.
6. The system must submit the record using `NetsuiteToolkit.submitRecord` and capture the resulting ID.
7. The system must return a formatted reply for each request and a batch-level reply for the full payload.

### Acceptance Criteria

- [ ] Records with `internalid` are updated and return the same ID.
- [ ] Records without `internalid` are created and return a new ID.
- [ ] Literal fields and sublist updates are applied to the record.
- [ ] Errors are returned without crashing the RESTlet.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate business rules beyond required parameters.
- Provide UI feedback; it is server-side only.
- Perform deletes or transforms.

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive per-record results for upserts and a batch response.

### Design References
- Other RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record types provided by `record_type` in the request.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Upsert helper
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Optional, passed via `literal_fields` or sublist data.

**Saved Searches:**
- None.

### Integration Points
- RESTlet callers that submit upsert requests.

### Data Requirements

**Data Volume:**
- One or more upserts per request.

**Data Sources:**
- Source records loaded by internal ID or created new.

**Data Retention:**
- No data retained; record IDs returned in response.

### Technical Constraints
- Uses SuiteScript 1.0 APIs.
- Assumes sublist data is well-formed for `SublistProcessor`.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js.
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `upsertPostHandler`.

### Governance Considerations
- Load/create and submit per record; governance usage scales with request size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Upsert requests return valid record IDs.
- Errors are returned in a consistent format.

**How we'll measure:**
- Validate RESTlet responses for create and update flows.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| upsert.js | RESTlet | Create or update records with field/sublist data | Implemented |

### Development Approach

**Phase 1:** Load or initialize
- [x] Load record when `internalid` exists, otherwise create a new record.

**Phase 2:** Apply updates
- [x] Apply literal fields, sublist updates, and submit record.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Upsert an existing record by internal ID.
2. Create a new record without internal ID.

**Edge Cases:**
1. Invalid record type.
2. Invalid sublist data causing sublist processor errors.

**Error Handling:**
1. Submit fails due to permissions; reply includes formatted error.

### Test Data Requirements
- A record type that can be created and updated in sandbox.

### Sandbox Setup
- RESTlet deployment with permission to create and edit target record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with create/edit permissions on target record types.

**Permissions required:**
- Create and edit permissions for target record types.

### Data Security
- Upserts may include sensitive data; restrict RESTlet role access.

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

1. Upload `upsert.js`.
2. Ensure the RESTlet deployment calls `upsertPostHandler`.
3. Validate upsert operations in sandbox.

### Post-Deployment

- [ ] Verify upsert responses for create and update.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the upsert handler.

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

- [ ] Should upserts be limited to an allowlist of record types?
- [ ] Should the handler validate mandatory fields before submit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Upserting invalid data causes record errors | Med | Med | Validate input or surface field errors |
| Large upsert batches consume governance | Med | Med | Enforce batch limits per request |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 record APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
