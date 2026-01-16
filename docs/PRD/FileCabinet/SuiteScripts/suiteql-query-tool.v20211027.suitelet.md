# PRD: SuiteQL Query Tool Suitelet (v20211027)

**PRD ID:** PRD-UNKNOWN-SuiteqlQueryTool20211027
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/suiteql-query-tool.v20211027.suitelet.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that provides a browser-based SuiteQL query tool with query execution, pagination, SQL file management, and document rendering.

**What problem does it solve?**
Enables running and managing SuiteQL queries directly in NetSuite without external tools.

**Primary Goal:**
Provide a self-contained Suitelet UI and API endpoints to execute SuiteQL and manage query assets.

---

## 2. Goals

1. Render an interactive SuiteQL editor and results viewer.
2. Execute SuiteQL queries with pagination and optional totals.
3. Manage SQL files, virtual views, and document generation.

---

## 3. User Stories

1. **As a** developer, **I want to** run SuiteQL queries **so that** I can inspect data quickly.
2. **As an** analyst, **I want to** paginate results **so that** large queries are manageable.
3. **As an** admin, **I want to** save and load queries **so that** common queries are reusable.

---

## 4. Functional Requirements

### Core Functionality

1. On GET, the system must render the SuiteQL Query Tool UI.
2. On POST, the system must route functions such as queryExecute, sqlFileLoad, sqlFileSave, workbooksGet, workbookLoad, documentSubmit.
3. queryExecute must run SuiteQL queries, optionally paginate in 5,000-row chunks, and optionally return total row count.
4. queryExecute must resolve "virtual views" (#viewname) by loading SQL files from queryFolderID.
5. sqlFileSave and sqlFileLoad must store and retrieve SQL files in the query folder.
6. documentSubmit must store document parameters in session and documentGenerate must render PDF or HTML output.

### Acceptance Criteria

- [ ] UI loads and allows query execution.
- [ ] Query results return with pagination and totals when requested.
- [ ] SQL files can be saved and loaded.
- [ ] Document generation produces PDF or HTML output.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce query access beyond role permissions.
- Validate SQL beyond SuiteQL execution errors.
- Guarantee performance for all query sizes.

---

## 6. Design Considerations

### User Interface
- Inline HTML UI rendered via Suitelet.

### User Experience
- Supports selected-text query execution and data table formatting.

### Design References
- Tim Dietrich SuiteQL Query Tool v2021.2.

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
- N/query for SuiteQL execution
- File cabinet for SQL file storage
- Workbook queries via N/query.load

### Data Requirements

**Data Volume:**
- Results can be paginated in 5,000-row chunks.

**Data Sources:**
- Any records accessible via SuiteQL.

**Data Retention:**
- SQL files stored in folder id 4575360.

### Technical Constraints
- queryFolderID is hard-coded to 4575360.
- Remote library fetches from suiteql.s3.us-east-1.amazonaws.com when enabled.
- workbooksEnabled is false by default.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Remote library via S3 (optional)
- **Other features:** Workbooks and file cabinet access

### Governance Considerations

- **Script governance:** SuiteQL execution cost depends on query complexity.
- **Search governance:** N/A (SuiteQL).
- **API limits:** SuiteQL limits apply.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can execute SuiteQL queries and retrieve results reliably.
- SQL files and virtual views resolve correctly.

**How we'll measure:**
- UI usage and log output for query execution.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| suiteql-query-tool.v20211027.suitelet.js | Suitelet | SuiteQL query UI and execution | Implemented |

### Development Approach

**Phase 1:** UI
- [x] Render tool UI on GET.

**Phase 2:** Execution and storage
- [x] Execute queries and manage SQL files.

**Phase 3:** Document output
- [x] Generate PDF/HTML from query results.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run a simple SuiteQL query and verify results.
2. Save and load an SQL file.

**Edge Cases:**
1. Query with virtual view reference, verify view resolution.
2. Large result set, verify pagination.

**Error Handling:**
1. Invalid SQL returns error payload.

### Test Data Requirements
- Accessible records for SuiteQL queries.

### Sandbox Setup
- Ensure folder id 4575360 exists and is accessible.

---

## 11. Security & Permissions

### Roles & Permissions
- Users must have permission to execute SuiteQL and access file cabinet.

### Data Security
- Results are returned to the Suitelet UI under the user's permissions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Verify query folder id 4575360 exists and is accessible.

### Deployment Steps
1. Deploy the Suitelet and assign appropriate roles.

### Post-Deployment
- Validate query execution and SQL file save/load.

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
- Should queryFolderID be parameterized instead of hard-coded?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large queries | Timeout or usage limits | Use pagination and limit rows |

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
