# PRD: RESTlet Endpoint Dispatcher and Field Introspection

**PRD ID:** PRD-UNKNOWN-EndpointRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/endpoint.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet endpoint dispatcher that invokes named methods and can return metadata for a record type's fields.

**What problem does it solve?**
Provides a single entry point for invoking RESTlet helper methods or NetSuite API methods and for discovering record field metadata.

**Primary Goal:**
Route RESTlet requests to supported methods and return formatted replies.

---

## 2. Goals

1. Dispatch requests to a named method with supplied parameters.
2. Provide a `getModuleFields` helper to return field metadata for a record type.
3. Return a consistent formatted reply with results and exceptions.

---

## 3. User Stories

1. **As an** integration, **I want to** call RESTlet helper methods by name **so that** I can reuse a single endpoint.
2. **As a** developer, **I want** field metadata for a record type **so that** I can build dynamic UIs.
3. **As an** admin, **I want** standardized error handling **so that** failures are easy to diagnose.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `method` and optional `params` from the request payload.
2. The system must require `params` to be an array; otherwise it records an exception.
3. The system must invoke an Endpoint instance method when the requested `method` exists.
4. The system must invoke a NetSuite API method (on `this`) when the requested `method` exists there.
5. The system must return a formatted reply with result data and any exceptions.
6. The `getModuleFields` method must:
   - Require a `module` parameter.
   - Search for at least one record of the module type.
   - Load the first record returned.
   - Return metadata for all fields on that record.
7. Field metadata must include name, label, type, readOnly, mandatory, disabled, hidden, and popup.
8. For select-like fields (`select`, `multiselect`, `radio`), the system must include option values.

### Acceptance Criteria

- [ ] A request with a valid method returns the method result in the reply.
- [ ] A request with a non-array `params` returns a parameter error.
- [ ] Unknown methods return a "Method not supported" error.
- [ ] `getModuleFields` returns an array of formatted field metadata when `module` is provided.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate or sanitize method names beyond existence checks.
- Provide UI rendering of fields.
- Support record creation or updates directly (unless exposed via method dispatch).

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive consistent responses and can inspect field metadata for record types.

### Design References
- Other RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record type supplied as `module` to `getModuleFields`.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Method dispatcher and field metadata helper
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None (uses `NetsuiteToolkit.searchRecord`).

### Integration Points
- RESTlet callers that submit `method` and `params`.

### Data Requirements

**Data Volume:**
- One dispatch per RESTlet call; `getModuleFields` loads a single record.

**Data Sources:**
- Request payload parameters.
- Record metadata loaded from NetSuite.

**Data Retention:**
- No data retained; metadata returned in response.

### Technical Constraints
- `getModuleFields` relies on at least one existing record of the module type.
- Reply generation uses `NetsuiteToolkit.formatReply` with `this.params`, which may be unset.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js.
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `endpointPostHandler`.

### Governance Considerations
- One search and one load per `getModuleFields` call; select option retrieval may add overhead.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Requests are routed to the correct method and return results.
- `getModuleFields` returns usable field metadata for supported record types.

**How we'll measure:**
- Validate responses for known method calls and field metadata requests.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| endpoint.js | RESTlet | Dispatch methods and return field metadata | Implemented |

### Development Approach

**Phase 1:** Request routing
- [x] Validate params and resolve method targets.

**Phase 2:** Metadata helper
- [x] Load a record and format field details.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Call a valid Endpoint method with params.
2. Call a valid NetSuite API method exposed by the RESTlet context.
3. Call `getModuleFields` with a valid module type.

**Edge Cases:**
1. `params` is not an array.
2. `method` does not exist on Endpoint or NetSuite API.
3. `getModuleFields` is called with an empty module or a module with no records.

**Error Handling:**
1. Select field options throw an error; response still returns field data.
2. Module parameter missing; required parameter error returned.

### Test Data Requirements
- At least one record in the module type used for metadata tests.

### Sandbox Setup
- RESTlet deployment with permission to search/load the target record type.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with permission to search and load target record types.

**Permissions required:**
- View permission for record types referenced by `getModuleFields`.

### Data Security
- Returns field metadata only; no record data beyond options and labels.

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

1. Upload `endpoint.js`.
2. Ensure the RESTlet deployment calls `endpointPostHandler`.
3. Verify method dispatch and metadata responses in sandbox.

### Post-Deployment

- [ ] Verify dispatch and metadata responses.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the endpoint handler.

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

- [ ] Should method dispatch be limited to an allowlist?
- [ ] Should replies include the original request parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Method dispatch exposes unintended APIs | Med | High | Add an allowlist of permitted methods |
| Module has no records, metadata returns empty | Med | Low | Document requirement or fall back to schema API |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript RESTlet
- record module and field metadata APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
