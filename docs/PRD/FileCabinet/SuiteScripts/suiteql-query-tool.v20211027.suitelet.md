# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SuiteqlQueryTool20211027
title: SuiteQL Query Tool Suitelet (v20211027)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/suiteql-query-tool.v20211027.suitelet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - file
  - workbook

---

## 1. Overview
Suitelet that provides a browser-based SuiteQL query tool with query execution, pagination, SQL file management, and document rendering.

---

## 2. Business Goal
Allow users to execute SuiteQL queries and manage reusable query assets directly in NetSuite.

---

## 3. User Story
As a developer or analyst, when I need to inspect data, I want a Suitelet-based SuiteQL tool so that I can run queries and manage saved SQL without external tools.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | N/A | load | Render SuiteQL Query Tool UI. |
| POST | function name | request | Route to query execution, file load/save, workbook load, or document generation. |

---

## 5. Functional Requirements
- Render the SuiteQL Query Tool UI on GET.
- Route POST functions: `queryExecute`, `sqlFileLoad`, `sqlFileSave`, `workbooksGet`, `workbookLoad`, `documentSubmit`, `documentGenerate`.
- Execute SuiteQL queries with optional pagination in 5,000-row chunks and optional total counts.
- Resolve virtual views (`#viewname`) by loading SQL files from `queryFolderID`.
- Save and load SQL files in the query folder.
- Store document parameters and render PDF or HTML output from query results.

---

## 6. Data Contract
### Record Types Involved
- File
- Workbook

### Fields Referenced
- Query folder id | 4575360 | SQL file storage

Schemas (if known):
- Remote library | suiteql.s3.us-east-1.amazonaws.com | Optional query library index

---

## 7. Validation & Edge Cases
- Invalid SQL returns an error response; execution should not crash the Suitelet.
- Large results should be paginated to avoid timeouts.
- Workbooks are disabled by default unless enabled in configuration.

---

## 8. Implementation Notes (Optional)
- `queryFolderID` is hard-coded to 4575360.
- Virtual view resolution loads SQL from the query folder.

---

## 9. Acceptance Criteria
- Given a valid query, when executed, then results return with pagination and optional totals.
- Given a virtual view reference, when executed, then the view resolves to a stored SQL file.
- Given document generation, when requested, then PDF or HTML output is produced.

---

## 10. Testing Notes
- Execute a simple query and verify results.
- Save and load an SQL file and verify content.
- Run a large query and verify pagination works.

---

## 11. Deployment Notes
- Ensure folder id 4575360 exists and is accessible.
- Deploy the Suitelet and assign roles with SuiteQL and file cabinet access.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should queryFolderID be parameterized instead of hard-coded?

---
