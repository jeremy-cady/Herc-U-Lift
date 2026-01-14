# PRD: File Cabinet API RESTlet

**PRD ID:** PRD-20200826-FileCabinetAPI
**Created:** August 26, 2020
**Last Updated:** August 26, 2020
**Author:** Tim Dietrich
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/file-cabinet-api.restlet.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: _file_cabinet_api
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that exposes File Cabinet operations (create files, read files, create/delete folders) and SuiteQL execution via an RPC-style POST interface.

**What problem does it solve?**
Provides programmatic access to File Cabinet operations and SuiteQL queries without direct UI interaction.

**Primary Goal:**
Offer a simple REST API for file and folder management in NetSuite.

---

## 2. Goals

1. Create and read File Cabinet files via REST.
2. Create and delete File Cabinet folders via REST.
3. Execute SuiteQL queries via REST.

---

## 3. User Stories

1. **As an** integration developer, **I want to** create files via REST **so that** I can automate document generation.
2. **As an** admin, **I want to** retrieve file contents **so that** I can support integrations.
3. **As a** developer, **I want to** run SuiteQL via REST **so that** I can query data remotely.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept POST requests with a `function` parameter.
2. Supported functions:
   - `fileCreate`
   - `fileEnumerationsGet`
   - `fileGet`
   - `folderCreate`
   - `folderDelete`
   - `requestEcho`
   - `suiteQLRun`
3. `fileCreate` must require name, fileType, contents, description, encoding, folderID, and isOnline.
4. `fileGet` must require fileID and return file info and contents.
5. `folderCreate` must require a name and optionally a parent folder.
6. `folderDelete` must require folderID and return deleted folder info.
7. `suiteQLRun` must accept `sql` and return mapped results.

### Acceptance Criteria

- [ ] POST with unsupported function returns an error.
- [ ] File create returns file info and contents.
- [ ] File get returns file info and contents.
- [ ] Folder create/delete return expected records.
- [ ] SuiteQL returns mapped results or error.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide GET endpoints.
- Enforce advanced authorization beyond RESTlet deployment role.
- Validate input schemas beyond basic required fields.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- JSON responses with data or errors.

### Design References
- Tim Dietrich’s File Cabinet API pattern.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File
- Folder

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - File Cabinet API
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- External systems can call the RESTlet for file/folder operations.

### Data Requirements

**Data Volume:**
- Depends on caller usage.

**Data Sources:**
- File Cabinet and SuiteQL queries.

**Data Retention:**
- Managed by File Cabinet.

### Technical Constraints
- RPC-style `function` switch, only POST supported.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** RESTlet deployment must allow Public access.

### Governance Considerations
- File operations and SuiteQL usage consume governance per call.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- RESTlet reliably creates/reads files and folders.
- SuiteQL queries return expected results.

**How we'll measure:**
- Integration usage logs and error rates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| file-cabinet-api.restlet.js | RESTlet | File Cabinet & SuiteQL API | Implemented |

### Development Approach

**Phase 1:** Core RPC functions
- [x] File create/read
- [x] Folder create/delete
- [x] SuiteQL runner

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST `fileCreate` with required fields → file saved and returned.
2. POST `fileGet` → file contents returned.
3. POST `suiteQLRun` → records returned.

**Edge Cases:**
1. Missing required fields → error response.
2. Invalid file/folder IDs → error response.

**Error Handling:**
1. Exceptions return `{ error }` objects.

### Test Data Requirements
- A test folder and sample file content.

### Sandbox Setup
- Deploy RESTlet with appropriate role permissions.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration role with File Cabinet access.

**Permissions required:**
- Create/read files.
- Create/delete folders.
- SuiteQL access.

### Data Security
- RESTlet is `@NModuleScope Public`; restrict deployment permissions carefully.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy RESTlet and configure role/permissions.
2. Validate file and folder operations.

### Post-Deployment

- [ ] Monitor usage and error logs.

### Rollback Plan

**If deployment fails:**
1. Disable RESTlet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2020-08-26 | 2020-08-26 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should this RESTlet be restricted to internal roles only?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Public RESTlet exposes file access | High | High | Restrict deployment role and endpoints |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x RESTlet docs.
- File Cabinet API docs.

### External Resources
- Tim Dietrich’s File Cabinet API: https://timdietrich.me

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2020-08-26 | Tim Dietrich | 1.0 | Initial version |
