# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SuiteqlQueryTool
title: SuiteQL Query Tool Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_suiteql_query_tool.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - file
  - workbook

---

## 1. Overview
Suitelet UI for running SuiteQL queries, viewing results, and managing SQL files and workbook-based queries.

---

## 2. Business Goal
Give users an in-NetSuite interface to execute SuiteQL queries and manage reusable SQL files.

---

## 3. User Story
As a developer or analyst, when I need data quickly, I want to run SuiteQL and manage saved queries inside NetSuite so that I can work without external tools.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | N/A | load | Render SuiteQL query UI. |
| POST | function name | request | Route to query execution, file load/save, workbook load, or document generation. |

---

## 5. Functional Requirements
- Render the SuiteQL query tool UI on GET.
- Route POST requests by function name: `queryExecute`, `sqlFileLoad`, `sqlFileSave`, `workbooksGet`, `workbookLoad`, `documentSubmit`, `documentGenerate`.
- Execute SuiteQL with optional pagination and total row counts.
- When views are enabled, resolve view references using SQL files in the configured folder.
- Save and load SQL files from the configured query folder.
- When enabled, list and load workbook-based queries.
- Support document generation for PDF or HTML templates from query results.

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
- Large result sets should be paginated in 5,000-row chunks.
- Workbooks feature is disabled by default unless explicitly enabled.

---

## 8. Implementation Notes (Optional)
- `queryFolderID` is hard-coded to 4575360.
- View resolution uses SQL files in the configured folder.

---

## 9. Acceptance Criteria
- Given a valid SuiteQL query, when executed, then results return with optional pagination and totals.
- Given an SQL file save, when requested, then the file is stored and can be reloaded.
- Given document generation, when requested, then PDF or HTML output is produced.

---

## 10. Testing Notes
- Execute a simple SuiteQL query and verify results.
- Save and load an SQL file from the tool.
- Run a query with pagination and verify page behavior.

---

## 11. Deployment Notes
- Ensure folder id 4575360 exists and is accessible.
- Deploy the Suitelet and assign roles with SuiteQL and file cabinet access.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should query folder id be parameterized instead of hard-coded?

---
