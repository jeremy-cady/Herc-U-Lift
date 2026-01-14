# PRD: File Attach RESTlet

**PRD ID:** PRD-UNKNOWN-FileAttachRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/file_attach_restlet.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that attaches a File Cabinet file to a target NetSuite record, defaulting to Support Case for legacy callers.

**What problem does it solve?**
Allows external systems or workflows to attach uploaded files to NetSuite records via a simple REST call.

**Primary Goal:**
Provide a lightweight file‑attachment endpoint with backward compatibility for existing case‑based callers.

---

## 2. Goals

1. Attach a file to a record using `record.attach`.
2. Support both `caseId` (legacy) and `recordId` inputs.
3. Default `recordType` to `supportcase` when not provided.

---

## 3. User Stories

1. **As an** integration developer, **I want to** attach files to NetSuite records via REST **so that** uploads can be automated.
2. **As a** legacy caller, **I want to** keep using `caseId` **so that** existing integrations do not break.
3. **As an** admin, **I want to** attach files to different record types **so that** the endpoint is reusable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept POST requests with `fileId`.
2. The system must accept either:
   - `recordId` (preferred) or
   - `caseId` (legacy).
3. The system must accept `recordType` (defaults to `supportcase`).
4. The system must attach the file to the target record using `record.attach`.
5. The system must return success or error payloads.

### Acceptance Criteria

- [ ] File attaches successfully when `fileId` and `recordId` are provided.
- [ ] Calls with only `caseId` still succeed using record type `supportcase`.
- [ ] Missing parameters return a clear error.
- [ ] Errors return `success: false` with a message.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Upload files (only attaches existing file IDs).
- Validate file ownership or permissions beyond NetSuite access rules.
- Support GET requests.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- Simple JSON request/response contract.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File
- Target record (default `supportcase`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - File attachment endpoint
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- External systems submit fileId/recordId to attach.

### Data Requirements

**Data Volume:**
- One attachment per request.

**Data Sources:**
- File Cabinet file ID and target record ID.

**Data Retention:**
- Managed by File Cabinet.

### Technical Constraints
- Requires valid recordType/recordId inputs.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** File upload handled elsewhere.

### Governance Considerations
- Single `record.attach` per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Files attach correctly to the requested records.
- Legacy caseId calls continue to work.

**How we'll measure:**
- Integration logs and spot checks on attached files.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| file_attach_restlet.js | RESTlet | Attach file to record | Implemented |

### Development Approach

**Phase 1:** RESTlet endpoint
- [x] Support recordId/caseId inputs
- [x] Attach file via `record.attach`

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST with `recordId`, `recordType`, `fileId` attaches the file.

**Edge Cases:**
1. POST with `caseId` only attaches to support case.
2. Missing fileId → error response.

**Error Handling:**
1. Invalid record ID returns `success: false`.

### Test Data Requirements
- Existing file IDs and test support case records.

### Sandbox Setup
- Deploy RESTlet and test with RESTlet tester.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles calling the RESTlet.

**Permissions required:**
- Attach files to target record type.
- Access to File Cabinet files.

### Data Security
- Restrict RESTlet deployment to trusted roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy RESTlet.
2. Configure access role and test requests.

### Post-Deployment

- [ ] Monitor attachment success in logs.

### Rollback Plan

**If deployment fails:**
1. Disable RESTlet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should we validate recordType against an allowlist?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Misuse attaches files to unintended records | Medium | Medium | Restrict role access |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x RESTlet docs.
- record.attach reference.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
