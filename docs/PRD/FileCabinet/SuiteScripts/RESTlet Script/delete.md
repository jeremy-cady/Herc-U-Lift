# PRD: RESTlet Delete Records Helper

**PRD ID:** PRD-UNKNOWN-DeleteRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/delete.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet helper that processes delete requests for one or more records and returns a formatted response.

**What problem does it solve?**
Provides a consistent API entry point to delete NetSuite records by type and internal ID.

**Primary Goal:**
Delete requested records and return per-request results in a standard format.

---

## 2. Goals

1. Accept a list of delete requests from the RESTlet POST body.
2. Delete each requested record and capture success or error results.
3. Return a formatted reply with parameters, results, and any exceptions.

---

## 3. User Stories

1. **As an** integration, **I want to** delete records by internal ID **so that** external systems can remove obsolete data.
2. **As an** admin, **I want to** receive structured responses **so that** I can troubleshoot failed deletions.
3. **As a** developer, **I want** a reusable delete handler **so that** RESTlet endpoints stay consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept a request array where each entry includes `record_type` and `internalid`.
2. The system must iterate through each request entry and issue a delete via `NetsuiteToolkit.deleteRecord`.
3. The system must capture per-request results and exceptions using `DeleteRequest`.
4. The system must accumulate results in a response list for the full request payload.
5. The system must return a formatted reply via `NetsuiteToolkit.formatReply` that includes parameters, results, and exceptions.

### Acceptance Criteria

- [ ] A valid request array deletes all specified records.
- [ ] Individual failures are returned in the formatted reply without stopping other deletions.
- [ ] Missing or invalid parameters are surfaced as exceptions in the response.
- [ ] The response structure is consistent with other RESTlet helpers.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate business rules beyond delete permissions and record existence.
- Provide UI feedback; it is server-side only.
- Support non-delete operations.

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive per-record success or error results in a consistent response format.

### Design References
- Other RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record type supported by `NetsuiteToolkit.deleteRecord` (provided via request).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - POST handler for delete requests
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- RESTlet callers that submit delete requests.

### Data Requirements

**Data Volume:**
- One or more record deletions per request.

**Data Sources:**
- Request payload parameters.

**Data Retention:**
- No data retained; records are deleted.

### Technical Constraints
- Relies on `NetsuiteToolkit.deleteRecord` and `NetsuiteToolkit.formatReply`.
- Errors during deletion are captured and returned rather than thrown.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `deletePostHandler`.

### Governance Considerations
- One delete call per record; governance usage scales with request size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Delete requests return accurate per-record results.
- Failed deletions include error details in the reply.

**How we'll measure:**
- Inspect RESTlet responses for mixed success/failure scenarios.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| delete.js | RESTlet | Delete records from request payload | Implemented |

### Development Approach

**Phase 1:** Request parsing
- [x] Read request array and extract `record_type` and `internalid`.

**Phase 2:** Delete processing
- [x] Execute deletes and format reply output.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Delete a single record with valid type and internal ID.
2. Delete multiple records in one request.

**Edge Cases:**
1. Request is empty or missing required keys.
2. Record type is invalid.
3. Internal ID does not exist.

**Error Handling:**
1. Delete fails due to permissions; error appears in response.
2. Toolkit throws an exception; response still returns formatted error.

### Test Data Requirements
- A test record type with known internal IDs to delete.

### Sandbox Setup
- RESTlet deployment with access to delete the target record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with delete access to target record types.

**Permissions required:**
- Delete permission for each record type handled.

### Data Security
- Deletes records only; no sensitive data is stored in the script.

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

1. Upload `delete.js`.
2. Ensure the RESTlet deployment calls `deletePostHandler`.
3. Verify delete operations in sandbox.

### Post-Deployment

- [ ] Verify delete responses for single and batch requests.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the delete handler.

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

- [ ] Should the handler validate request schema before deletion?
- [ ] Should deletions be limited to a configured allowlist of record types?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Accidental deletions from bad inputs | Med | High | Add input validation and optional allowlist |
| Large batch deletes consume governance | Med | Med | Enforce batch limits per request |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript RESTlet
- record.delete or equivalent delete API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
