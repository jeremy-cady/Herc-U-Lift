# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-NetsuiteToolkit
title: NetSuite RESTlet Toolkit Library
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record types accessed by callers of the library

---

## 1. Overview
A shared library that wraps SuiteScript 1.0 APIs and provides helper utilities for RESTlet handlers, including record operations, reply formatting, and sublist processing.

## 2. Business Goal
Standardizes common NetSuite operations and response formatting across RESTlet scripts.

## 3. User Story
As a developer, when I build RESTlet scripts, I want shared helper methods, so that RESTlet scripts stay consistent.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | Provide helper functions for record operations and reply formatting |

## 5. Functional Requirements
- The system must expose helper functions that wrap `nlapiCreateRecord` as `createRecord`, `nlapiLoadRecord` as `loadRecord`, `nlapiDeleteRecord` as `deleteRecord`, `nlapiTransformRecord` as `transformRecord`, and `nlapiSubmitRecord` as `submitRecord`.
- The system must expose record field helpers for setting field values and line item values.
- The system must expose sublist helpers for insert, update, and remove operations.
- The system must expose search helpers for filters, columns, and search execution.
- The system must format replies with `params`, `result`, `success`, and `exception` (when present).
- The system must format exceptions with `message` and `trace` (stack trace when available).
- The system must provide a `RecordProcessor.updateLiterals` helper for setting multiple fields.
- The system must provide a `SublistProcessor` class that supports create, update, and excise operations.
- The system must throw standardized errors for malformed sublist data or unmatched line items.

## 6. Data Contract
### Record Types Involved
- Any record types accessed by callers of the library

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Attempt to match a line item with no match; expect `UnableToMatch`.
- Provide malformed sublist data; expect `MalformedData` (thrown by caller).
- `formatException` fails to get a stack trace; returns message in `trace`.

## 8. Implementation Notes (Optional)
- Built on SuiteScript 1.0 APIs (`nlapi*`).
- Assumes line item indexing starts at 1 for sublist operations.

## 9. Acceptance Criteria
- Given wrapped API helpers are used, when they execute, then they return the same results as their NetSuite equivalents.
- Given an error occurs, when `formatReply` runs, then it includes `success` and `exception`.
- Given `RecordProcessor.updateLiterals` is used, when it runs, then it updates all provided fields.
- Given `SublistProcessor` is used, when it runs, then it can create, update, and remove line items.
- Given a sublist matching failure, when it occurs, then the standardized `UnableToMatch` error is returned.

## 10. Testing Notes
- Use each wrapper to create, load, and delete a record.
- Format a successful reply with `formatReply`.
- Use `SublistProcessor` to add and update a line item.
- Attempt to match a line item with no match; expect `UnableToMatch`.
- Provide malformed sublist data; expect `MalformedData` (thrown by caller).
- `formatException` fails to get a stack trace; returns message in `trace`.

## 11. Deployment Notes
- Upload `netsuite_toolkit.js`.
- Ensure dependent RESTlet scripts reference the library.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the library enforce stricter input validation for sublist operations?
- Should helper functions include logging for audit purposes?
- Risk: Misuse of helper functions causes unintended edits (Mitigation: Document usage patterns and add validation)
- Risk: High governance usage from batch operations (Mitigation: Monitor usage and enforce batch limits)

---
