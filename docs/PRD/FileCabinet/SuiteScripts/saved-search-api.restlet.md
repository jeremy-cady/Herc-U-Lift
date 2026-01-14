# PRD: Saved Search API RESTlet

**PRD ID:** PRD-UNKNOWN-SavedSearchAPI
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/saved-search-api.restlet.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: _saved_search_api
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that returns results from a specified NetSuite saved search.

**What problem does it solve?**
Provides an API endpoint to retrieve saved search results for integrations or reporting.

**Primary Goal:**
Load a saved search by ID and return its results in the response.

---

## 2. Goals

1. Accept a saved search ID in the request.
2. Load and run the saved search.
3. Return all search results in the response.

---

## 3. User Stories

1. **As an** integration developer, **I want** saved search results via API **so that** I can consume NetSuite data externally.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept a `searchID` parameter in the POST request.
2. If `searchID` is missing, the system must return an error.
3. The system must load the saved search by ID.
4. The system must return all results in batches of 1000.

### Acceptance Criteria

- [ ] A valid `searchID` returns results.
- [ ] Missing `searchID` returns an error object.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Support GET requests or other HTTP methods.
- Modify saved searches or records.
- Enforce result size limits beyond batching.

---

## 6. Design Considerations

### User Interface
- No UI; RESTlet API only.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Saved Searches (any types supported by search)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Saved search API
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Any saved search referenced by `searchID`.

### Integration Points
- External consumers using RESTlet.

### Data Requirements

**Data Volume:**
- All search results returned in 1000-row batches.

**Data Sources:**
- Saved search results.

**Data Retention:**
- No data changes.

### Technical Constraints
- RESTlet is `NModuleScope Public`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved searches must exist.

### Governance Considerations
- Search runs and getRange calls may consume usage for large datasets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Consumers receive complete saved search results via the RESTlet.

**How we'll measure:**
- Validate response size and content for test searches.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| saved-search-api.restlet.js | RESTlet | Return saved search results | Implemented |

### Development Approach

**Phase 1:** Input validation
- [x] Validate `searchID`.

**Phase 2:** Search execution
- [x] Load and return search results.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST with valid `searchID`; returns results.

**Edge Cases:**
1. Missing `searchID`; returns error.
2. Saved search returns more than 1000 rows; results concatenated.

**Error Handling:**
1. Search load fails; error object returned.

### Test Data Requirements
- Saved search with known results.

### Sandbox Setup
- Deploy RESTlet with permissions for integration role.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration role(s).

**Permissions required:**
- Execute RESTlets
- View records referenced by the saved search

### Data Security
- Public module scope; ensure deployments are secured by role/token.

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

1. Upload `saved-search-api.restlet.js`.
2. Deploy RESTlet and set appropriate role permissions.
3. Test with a known saved search ID.

### Post-Deployment

- [ ] Verify API response for sample searches.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment.

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

- [ ] Should the RESTlet support paging parameters or filters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large searches return very large responses | Med | Med | Add paging parameters |
| Public scope increases exposure risk | Med | Med | Restrict deployment access and tokens |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x RESTlet

### External Resources
- Tim Dietrich Saved Search API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
