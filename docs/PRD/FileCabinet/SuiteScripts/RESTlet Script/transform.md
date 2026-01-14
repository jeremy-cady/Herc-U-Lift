# PRD: RESTlet Record Transformation Helper

**PRD ID:** PRD-UNKNOWN-TransformRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/transform.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet helper that transforms NetSuite records (e.g., source to result type), applies field and sublist updates, and submits the transformed record.

**What problem does it solve?**
Enables external systems to perform record transformations with controlled field and sublist updates via a single RESTlet call.

**Primary Goal:**
Transform requested records and return per-request results in a standard response format.

---

## 2. Goals

1. Accept a list of transform requests in the RESTlet payload.
2. Transform each record and apply literal and sublist changes.
3. Submit the transformed records and return their IDs.

---

## 3. User Stories

1. **As an** integration, **I want to** transform records and apply updates **so that** I can automate record conversions.
2. **As a** developer, **I want** a reusable transform handler **so that** transformation logic stays consistent.
3. **As an** admin, **I want** standardized responses **so that** errors are easy to diagnose.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `record_data` in the request, containing one or more transform requests.
2. Each transform request must include `internalid`, `source_type`, `result_type`, and optional update data.
3. The system must throw an error when `internalid` is missing.
4. The system must call `NetsuiteToolkit.transformRecord` to transform the source record.
5. The system must apply literal field updates via `NetsuiteToolkit.RecordProcessor.updateLiterals`.
6. The system must apply sublist updates via `NetsuiteToolkit.SublistProcessor`.
7. The system must submit the transformed record using `NetsuiteToolkit.submitRecord` and capture the new ID.
8. The system must return a formatted reply for each request and a batch-level reply for the full payload.

### Acceptance Criteria

- [ ] Valid transform requests return new record IDs.
- [ ] Missing `internalid` returns the standardized error.
- [ ] Literal fields and sublist updates are applied to the transformed record.
- [ ] Errors are returned without crashing the RESTlet.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate business rules beyond required parameters.
- Provide UI feedback; it is server-side only.
- Handle non-transform record updates.

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive per-record results for transformations and a batch response.

### Design References
- Other RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any source/result record types supported by `nlapiTransformRecord`.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Transformation helper
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Optional, passed via `literal_fields` or sublist data.

**Saved Searches:**
- None.

### Integration Points
- RESTlet callers that submit transform requests.

### Data Requirements

**Data Volume:**
- One or more transform operations per request.

**Data Sources:**
- Source records identified by `internalid` and `source_type`.

**Data Retention:**
- No data retained; transformed record IDs returned.

### Technical Constraints
- Requires `internalid` for each transform request.
- Uses SuiteScript 1.0 APIs.
- Implementation contains typos that may break execution: `replyList` vs `reply_list` and `transformRecord` vs `transformRecords` in handler.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js.
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `transformPostHandler`.

### Governance Considerations
- Transform and submit calls are governance-intensive; usage scales with request size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Transform requests return valid new record IDs.
- Errors are returned in a consistent format.

**How we'll measure:**
- Validate RESTlet responses for successful and failing transforms.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| transform.js | RESTlet | Transform records and apply updates | Implemented |

### Development Approach

**Phase 1:** Transform and update
- [x] Transform records and apply literal/sublist updates.

**Phase 2:** Response formatting
- [x] Return formatted replies for each transform.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Transform a record with valid `internalid`, `source_type`, and `result_type`.
2. Apply literal fields and sublist updates in the transform request.

**Edge Cases:**
1. Missing `internalid` in a request.
2. Invalid source or result record type.

**Error Handling:**
1. Transform fails; response includes formatted error.

### Test Data Requirements
- A source record type that supports transformation to the target record type.

### Sandbox Setup
- RESTlet deployment with permission to transform and submit target record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with permission to transform and create target records.

**Permissions required:**
- Create permission for target record types.
- View permission for source record types.

### Data Security
- Transforms may include sensitive data; restrict RESTlet role access.

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

1. Upload `transform.js`.
2. Ensure the RESTlet deployment calls `transformPostHandler`.
3. Validate transform operations in sandbox.

### Post-Deployment

- [ ] Verify transform responses for sample requests.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the transform handler.

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

- [ ] Should transform requests be limited to an allowlist of record types?
- [ ] Should the handler support partial failures in batch requests?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Typos in handler prevent execution | Med | High | Fix handler method names and reply list reference |
| Large transform batches consume governance | Med | Med | Enforce batch limits per request |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 transform APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
