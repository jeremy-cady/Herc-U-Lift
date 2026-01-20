# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TransformRESTlet
title: RESTlet Record Transformation Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/transform.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any source/result record types supported by `nlapiTransformRecord`

---

## 1. Overview
A RESTlet helper that transforms NetSuite records (e.g., source to result type), applies field and sublist updates, and submits the transformed record.

## 2. Business Goal
Enables external systems to perform record transformations with controlled field and sublist updates via a single RESTlet call.

## 3. User Story
As an integration, when I need to transform records and apply updates, I want to transform records and apply updates, so that I can automate record conversions.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_data` | Request contains transform requests | Transform records, apply updates, and return formatted replies |

## 5. Functional Requirements
- The system must accept `record_data` in the request, containing one or more transform requests.
- Each transform request must include `internalid`, `source_type`, `result_type`, and optional update data.
- The system must throw an error when `internalid` is missing.
- The system must call `NetsuiteToolkit.transformRecord` to transform the source record.
- The system must apply literal field updates via `NetsuiteToolkit.RecordProcessor.updateLiterals`.
- The system must apply sublist updates via `NetsuiteToolkit.SublistProcessor`.
- The system must submit the transformed record using `NetsuiteToolkit.submitRecord` and capture the new ID.
- The system must return a formatted reply for each request and a batch-level reply for the full payload.

## 6. Data Contract
### Record Types Involved
- Any source/result record types supported by `nlapiTransformRecord`

### Fields Referenced
- `internalid`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing `internalid` in a request.
- Invalid source or result record type.
- Transform fails; response includes formatted error.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 APIs.
- Requires `internalid` for each transform request.

## 9. Acceptance Criteria
- Given a valid transform request, when the RESTlet runs, then a new record ID is returned.
- Given a missing `internalid`, when the RESTlet runs, then the standardized error is returned.
- Given literal fields and sublist updates, when the RESTlet runs, then they are applied to the transformed record.
- Given an error, when the RESTlet runs, then it is returned without crashing the RESTlet.

## 10. Testing Notes
- Transform a record with valid `internalid`, `source_type`, and `result_type`.
- Apply literal fields and sublist updates in the transform request.
- Missing `internalid` in a request.
- Invalid source or result record type.
- Transform fails; response includes formatted error.

## 11. Deployment Notes
- Upload `transform.js`.
- Ensure the RESTlet deployment calls `transformPostHandler`.
- Validate transform operations in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should transform requests be limited to an allowlist of record types?
- Should the handler support partial failures in batch requests?
- Risk: Typos in handler prevent execution (`replyList` vs `reply_list` and `transformRecord` vs `transformRecords`) (Mitigation: Fix handler method names and reply list reference)
- Risk: Large transform batches consume governance (Mitigation: Enforce batch limits per request)

---
