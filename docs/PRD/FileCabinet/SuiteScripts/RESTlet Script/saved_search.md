# PRD: RESTlet Saved Search Batch Fetch

**PRD ID:** PRD-UNKNOWN-SavedSearchRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/saved_search.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet helper that executes a saved search in batches using internal ID paging and returns aggregated results.

**What problem does it solve?**
Allows external systems to retrieve large saved search result sets in manageable batches while avoiding NetSuite's 1000-row limit.

**Primary Goal:**
Run a saved search with paging and return a formatted reply with accumulated results.

---

## 2. Goals

1. Accept a search ID, record type, lower bound, and batch size.
2. Execute the saved search in 1000-row blocks using an internal ID lower bound filter.
3. Return a formatted reply with accumulated results or an error.

---

## 3. User Stories

1. **As an** integration, **I want to** page through saved search results **so that** I can retrieve large datasets.
2. **As a** developer, **I want** consistent batching logic **so that** RESTlet searches are reliable.
3. **As an** admin, **I want** error responses in a standard format **so that** failures are easy to diagnose.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `record_type`, `search_id`, `lower_bound`, and `batch_size` from the request.
2. The system must round `batch_size` up to the nearest multiple of 1000.
3. The system must create a search filter for `internalidnumber` greater than the current lower bound.
4. The system must sort search results by `internalid` ascending.
5. The system must iterate search requests in blocks of up to 1000 records.
6. The system must update the lower bound to the last record ID after each block.
7. The system must stop when fewer than 1000 records are returned or when batch size is met.
8. The system must accumulate all result rows in a single response list.
9. The system must return a formatted reply using `NetsuiteToolkit.formatReply`.

### Acceptance Criteria

- [ ] Results are returned in batches until completion conditions are met.
- [ ] `batch_size` is normalized to a multiple of 1000.
- [ ] Errors during search are returned in a formatted reply.
- [ ] Returned results include all records up to the batch size or end of data.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify or save records.
- Provide UI or client-side pagination.
- Support non-saved-search queries outside the provided search ID.

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive a single response with accumulated results for the requested batch.

### Design References
- Other RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- The record type referenced by `record_type` in the request.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Saved search batching helper
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Saved search referenced by `search_id`.

### Integration Points
- RESTlet callers that submit saved search parameters.

### Data Requirements

**Data Volume:**
- Up to `batch_size` records per call, in 1000-row search blocks.

**Data Sources:**
- Saved search results from NetSuite.

**Data Retention:**
- No data retained; results returned in response.

### Technical Constraints
- Uses SuiteScript 1.0 search API; each search call returns up to 1000 rows.
- Lower bound paging depends on `internalid` ordering.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js.
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `savedSearchPostHandler`.

### Governance Considerations
- One search call per 1000 results; governance usage scales with batch size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Large saved search result sets are returned without exceeding NetSuite limits.
- Responses include all records up to the requested batch size.

**How we'll measure:**
- Validate returned counts and last internal ID across multiple calls.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| saved_search.js | RESTlet | Batch saved search execution | Implemented |

### Development Approach

**Phase 1:** Search setup
- [x] Build filters and columns for internal ID paging.

**Phase 2:** Paging execution
- [x] Loop until batch size met or results exhausted.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Execute a saved search with fewer than 1000 results.
2. Execute a saved search with more than 1000 results and verify paging.

**Edge Cases:**
1. Batch size not divisible by 1000; verify rounding behavior.
2. Lower bound excludes all results; return empty list.
3. Saved search ID is invalid.

**Error Handling:**
1. Search execution throws an exception; reply contains formatted error.

### Test Data Requirements
- A saved search with at least 1500 results for paging verification.

### Sandbox Setup
- RESTlet deployment with permission to run the saved search.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with permission to run the saved search.

**Permissions required:**
- View permission for the target record type.
- Permission to execute the saved search.

### Data Security
- Results include record data; ensure RESTlet role restricts access appropriately.

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

1. Upload `saved_search.js`.
2. Ensure the RESTlet deployment calls `savedSearchPostHandler`.
3. Validate saved search pagination in sandbox.

### Post-Deployment

- [ ] Verify multi-batch search results.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the saved search handler.

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

- [ ] Should the handler enforce a maximum batch size?
- [ ] Should it support additional filters beyond internal ID paging?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large batches consume governance | Med | Med | Limit batch size and monitor usage |
| Lower bound paging skips records with non-linear IDs | Low | Low | Document internal ID ordering assumption |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 search APIs
- Saved search limitations (1000-row limit)

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
