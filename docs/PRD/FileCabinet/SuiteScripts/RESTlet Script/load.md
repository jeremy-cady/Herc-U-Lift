# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LoadRESTlet
title: RESTlet Load Records Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/load.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record type supported by `NetsuiteToolkit.loadRecord` (provided via request)

---

## 1. Overview
A RESTlet helper that loads one or more NetSuite records by type and internal ID and returns formatted results.

## 2. Business Goal
Provides a consistent API entry point for retrieving full NetSuite records in batch.

## 3. User Story
As an integration, when I need to load records by internal ID, I want to load records by internal ID, so that I can retrieve NetSuite data.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_type`, `internalid` | Request array provided | Load requested records and return formatted reply |

## 5. Functional Requirements
- The system must accept a request array where each entry includes `record_type` and `internalid`.
- The system must iterate through each request entry and load records via `NetsuiteToolkit.loadRecord`.
- The system must capture per-request results and exceptions using `LoadRequest`.
- The system must accumulate results in a response list for the full request payload.
- The system must return a formatted reply via `NetsuiteToolkit.formatReply` that includes parameters, results, and exceptions.

## 6. Data Contract
### Record Types Involved
- Any record type supported by `NetsuiteToolkit.loadRecord` (provided via request)

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Request is empty or missing required keys.
- Record type is invalid.
- Internal ID does not exist.
- Load fails due to permissions; error appears in response.
- Toolkit throws an exception; response still returns formatted error.

## 8. Implementation Notes (Optional)
- Relies on `NetsuiteToolkit.loadRecord` and `NetsuiteToolkit.formatReply`.
- One load call per record; governance usage scales with request size.

## 9. Acceptance Criteria
- Given a valid request array, when the RESTlet runs, then all specified records are loaded.
- Given individual failures, when the RESTlet runs, then failures are returned in the formatted reply without stopping other loads.
- Given missing or invalid parameters, when the RESTlet runs, then exceptions are returned in the response.
- Given a request, when the RESTlet runs, then the response structure matches other RESTlet helpers.

## 10. Testing Notes
- Load a single record with valid type and internal ID.
- Load multiple records in one request.
- Request is empty or missing required keys.
- Record type is invalid.
- Internal ID does not exist.
- Load fails due to permissions; error appears in response.
- Toolkit throws an exception; response still returns formatted error.

## 11. Deployment Notes
- Upload `load.js`.
- Ensure the RESTlet deployment calls `loadPostHandler`.
- Verify load operations in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should load requests be limited to an allowlist of record types?
- Should responses redact sensitive fields for certain record types?
- Risk: Sensitive data exposure via load (Mitigation: Restrict RESTlet role permissions)
- Risk: Large batch loads consume governance (Mitigation: Enforce batch limits per request)

---
