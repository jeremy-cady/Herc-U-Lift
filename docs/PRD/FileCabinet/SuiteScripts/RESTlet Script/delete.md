# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteRESTlet
title: RESTlet Delete Records Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/delete.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record type supported by `NetsuiteToolkit.deleteRecord` (provided via request)

---

## 1. Overview
A RESTlet helper that processes delete requests for one or more records and returns a formatted response.

## 2. Business Goal
Provides a consistent API entry point to delete NetSuite records by type and internal ID.

## 3. User Story
As an integration, when I need to delete records by internal ID, I want to delete records by internal ID, so that external systems can remove obsolete data.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_type`, `internalid` | Request array provided | Delete requested records and return formatted reply |

## 5. Functional Requirements
- The system must accept a request array where each entry includes `record_type` and `internalid`.
- The system must iterate through each request entry and issue a delete via `NetsuiteToolkit.deleteRecord`.
- The system must capture per-request results and exceptions using `DeleteRequest`.
- The system must accumulate results in a response list for the full request payload.
- The system must return a formatted reply via `NetsuiteToolkit.formatReply` that includes parameters, results, and exceptions.

## 6. Data Contract
### Record Types Involved
- Any record type supported by `NetsuiteToolkit.deleteRecord` (provided via request)

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Request is empty or missing required keys.
- Record type is invalid.
- Internal ID does not exist.
- Delete fails due to permissions; error appears in response.
- Toolkit throws an exception; response still returns formatted error.

## 8. Implementation Notes (Optional)
- Relies on `NetsuiteToolkit.deleteRecord` and `NetsuiteToolkit.formatReply`.
- One delete call per record; governance usage scales with request size.

## 9. Acceptance Criteria
- Given a valid request array, when the RESTlet runs, then all specified records are deleted.
- Given individual failures, when the RESTlet runs, then failures are returned in the formatted reply without stopping other deletions.
- Given missing or invalid parameters, when the RESTlet runs, then exceptions are returned in the response.
- Given a request, when the RESTlet runs, then the response structure matches other RESTlet helpers.

## 10. Testing Notes
- Delete a single record with valid type and internal ID.
- Delete multiple records in one request.
- Request is empty or missing required keys.
- Record type is invalid.
- Internal ID does not exist.
- Delete fails due to permissions; error appears in response.
- Toolkit throws an exception; response still returns formatted error.

## 11. Deployment Notes
- Upload `delete.js`.
- Ensure the RESTlet deployment calls `deletePostHandler`.
- Verify delete operations in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the handler validate request schema before deletion?
- Should deletions be limited to a configured allowlist of record types?
- Risk: Accidental deletions from bad inputs (Mitigation: Add input validation and optional allowlist)
- Risk: Large batch deletes consume governance (Mitigation: Enforce batch limits per request)

---
