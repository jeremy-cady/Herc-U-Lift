# PRD: RESTlet Advanced Search Helper

**PRD ID:** PRD-UNKNOWN-SearchRESTlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/search.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet helper that executes dynamic NetSuite searches with custom filters, columns, and advanced options, returning paged results.

**What problem does it solve?**
Provides a flexible API to run parameterized searches and retrieve large result sets with pagination beyond the 1000-row limit.

**Primary Goal:**
Execute dynamic searches with optional advanced behaviors and return formatted results.

---

## 2. Goals

1. Accept search filters, columns, and paging controls from the request.
2. Execute the search in 1000-row blocks until completion.
3. Support advanced options like filter expressions and grouped join output.

---

## 3. User Stories

1. **As an** integration, **I want to** run dynamic searches **so that** I can query data flexibly.
2. **As a** developer, **I want** advanced options for filters and joins **so that** results are structured for downstream use.
3. **As an** admin, **I want** consistent error handling **so that** failed searches are easy to diagnose.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `record_type`, `batch_size`, `lower_bound`, `search_filters`, `search_columns`, and optional `advanced_options`.
2. The system must round `batch_size` up to the nearest multiple of 1000.
3. The system must build search filters from request data unless `advanced_options.useFilterExpressions` is true.
4. The system must support SQL formula filters via `formula` parameters.
5. The system must append a lower bound filter on `internalidnumber` greater than the current lower bound.
6. The system must build search columns from request data and append a sort column on `internalid` ascending.
7. The system must execute searches in 1000-row blocks until the batch size is met or no more results remain.
8. The system must update the lower bound using the last record ID from each results block.
9. The system must optionally group joined columns into nested objects when `advanced_options.groupJoins` is true.
10. The system must return a formatted reply using `NetsuiteToolkit.formatReply`.

### Acceptance Criteria

- [ ] Searches return results in batches until completion conditions are met.
- [ ] Filters and columns are generated from request parameters (unless filter expressions are used).
- [ ] SQL formula filters are applied when provided.
- [ ] Grouped join output returns nested join objects when enabled.
- [ ] Errors during search are returned in a formatted reply.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save or modify records.
- Provide a UI for search construction.
- Validate field names beyond search execution errors.

---

## 6. Design Considerations

### User Interface
- None (server-side RESTlet helper).

### User Experience
- Callers receive flexible search results with optional nested join structures.

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
- [x] RESTlet - Advanced search helper
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None (dynamic searches via filters and columns).

### Integration Points
- RESTlet callers that submit search parameters.

### Data Requirements

**Data Volume:**
- Up to `batch_size` results per call, in 1000-row blocks.

**Data Sources:**
- NetSuite search results for the specified record type.

**Data Retention:**
- No data retained; results returned in response.

### Technical Constraints
- Uses SuiteScript 1.0 search APIs.
- Filter expressions bypass lower bound filter generation.
- Grouped join output reshapes search results into nested objects.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js.
- **External dependencies:** None.
- **Other features:** RESTlet deployment calling `searchPostHandler`.

### Governance Considerations
- One search call per 1000 results; governance usage scales with batch size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Dynamic searches return expected results within batch limits.
- Grouped join output matches the requested structure.

**How we'll measure:**
- Validate result counts and structure for representative searches.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| search.js | RESTlet | Dynamic search execution with paging | Implemented |

### Development Approach

**Phase 1:** Filter and column setup
- [x] Build filters, formulas, and sort column.

**Phase 2:** Paging and formatting
- [x] Execute search in blocks and format reply.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Execute a search with basic filters and columns.
2. Execute a search with more than 1000 results to validate paging.
3. Execute a search with `groupJoins` enabled.

**Edge Cases:**
1. `batch_size` not divisible by 1000; verify rounding.
2. `useFilterExpressions` true with custom filter expressions.
3. Missing or invalid filter/column fields.

**Error Handling:**
1. Search throws an exception; reply includes formatted error.

### Test Data Requirements
- A record type with enough data to exceed 1000 results.

### Sandbox Setup
- RESTlet deployment with permission to run searches on target record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role with permission to search target record types.

**Permissions required:**
- View permission for the target record type.

### Data Security
- Search results may include sensitive data; restrict RESTlet role access.

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

1. Upload `search.js`.
2. Ensure the RESTlet deployment calls `searchPostHandler`.
3. Validate search execution and response structure.

### Post-Deployment

- [ ] Verify search responses for typical and edge cases.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment or remove the search handler.

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

- [ ] Should filter expressions also support lower bound paging?
- [ ] Should groupJoins be enabled by default for joined searches?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Filter expressions bypass lower bound paging | Med | Med | Document usage and enforce limits |
| Large searches consume governance | Med | Med | Limit batch size per request |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 search APIs
- Search filter and column syntax

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
