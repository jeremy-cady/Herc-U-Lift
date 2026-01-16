# PRD: SuiteQL Query Tool Suitelet

**PRD ID:** PRD-UNKNOWN-SuiteqlQueryTool
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_suiteql_query_tool.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet-based tool for running SuiteQL queries, viewing results, and managing SQL files and workbooks.

**What problem does it solve?**
Provides a UI for executing SuiteQL queries without external tools, including pagination, totals, and saved query management.

**Primary Goal:**
Allow users to execute SuiteQL queries and manage query files from within NetSuite.

---

## 2. Goals

1. Render a browser-based SuiteQL editor and results viewer.
2. Execute SuiteQL queries with optional pagination and total counts.
3. Save, load, and manage SQL files and workbook-based queries.

---

## 3. User Stories

1. **As a** developer, **I want to** run SuiteQL queries **so that** I can inspect data quickly.
2. **As an** analyst, **I want to** paginate results **so that** large queries are manageable.
3. **As an** admin, **I want to** save reusable SQL files **so that** queries can be shared.

---

## 4. Functional Requirements

### Core Functionality

1. On GET, the system must render a SuiteQL query tool UI.
2. On POST, the system must route requests by function name (queryExecute, sqlFileLoad, sqlFileSave, workbooksGet, workbookLoad, documentSubmit).
3. queryExecute must run SuiteQL queries with optional pagination, and optionally return total row counts.
4. When viewsEnabled is true, queryExecute must resolve view references using SQL files in the configured folder.
5. sqlFileSave and sqlFileLoad must store and retrieve SQL files in the configured query folder.
6. workbooksGet and workbookLoad must list and load workbook-based queries when enabled.
7. documentSubmit and documentGenerate must support rendering query results into PDF or HTML templates.

### Acceptance Criteria

- [ ] UI loads and accepts query input.
- [ ] Queries return results with optional pagination and totals.
- [ ] SQL files can be saved and loaded.
- [ ] Document generation works for PDF or HTML templates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide role-based access controls beyond script deployment permissions.
- Validate or sanitize queries beyond SuiteQL execution errors.
- Guarantee query performance for large datasets.

---

## 6. Design Considerations

### User Interface
- Inline HTML UI with query editor, results table, and controls.

### User Experience
- Supports pagination for large result sets.
- Supports selectable text execution in the editor.

### Design References
- Tim Dietrich SuiteQL Query Tool (v2021.2).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File
- Workbook

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Query tool UI and API
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None

**Saved Searches:**
- None

### Integration Points
- SuiteQL via N/query
- File cabinet for SQL file storage
- Workbook queries via N/query.load

### Data Requirements

**Data Volume:**
- Query results can be paginated in 5,000-row chunks.

**Data Sources:**
- Any records accessible via SuiteQL.

**Data Retention:**
- Saved SQL files stored in folder id 4575360.

### Technical Constraints
- queryFolderID is hard-coded to 4575360.
- Remote library requests reference suiteql.s3.us-east-1.amazonaws.com.
- Workbooks feature is disabled by default (workbooksEnabled = false).

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Remote query library via S3 (optional)
- **Other features:** Workbooks and file cabinet access

### Governance Considerations

- **Script governance:** Query execution can be heavy depending on SQL.
- **Search governance:** N/A (SuiteQL execution).
- **API limits:** SuiteQL limits apply.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can run SuiteQL queries and retrieve results reliably.
- SQL files can be saved and loaded from the tool.

**How we'll measure:**
- User validation and script logs for query execution.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_suiteql_query_tool.js | Suitelet | SuiteQL query UI and execution | Implemented |

### Development Approach

**Phase 1:** UI
- [x] Render query tool interface.

**Phase 2:** Execution and storage
- [x] Execute queries, paginate, and manage SQL files.

**Phase 3:** Optional features
- [x] Document generation and workbook loading.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run a simple SuiteQL query and verify results.
2. Save and reload an SQL file from the tool.

**Edge Cases:**
1. Query with view reference, verify view resolution works.
2. Large result set, verify pagination works.

**Error Handling:**
1. Invalid SQL, verify error response is returned.

### Test Data Requirements
- Access to records for SuiteQL queries.

### Sandbox Setup
- Ensure folder id 4575360 exists and is accessible.

---

## 11. Security & Permissions

### Roles & Permissions
- Users must have permission to execute SuiteQL and access file cabinet.

### Data Security
- Query results are returned to the UI; access is controlled by role permissions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Verify query folder id 4575360 exists and is accessible.

### Deployment Steps
1. Deploy Suitelet and assign to appropriate roles.

### Post-Deployment
- Validate query execution and file save/load.

### Rollback Plan
- Disable the Suitelet deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should query folder id be parameterized instead of hard-coded?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large queries | Timeout or governance usage | Use pagination and limit rows |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- SuiteQL and N/query

### External Resources
- https://suiteql.s3.us-east-1.amazonaws.com/queries/index.json

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
