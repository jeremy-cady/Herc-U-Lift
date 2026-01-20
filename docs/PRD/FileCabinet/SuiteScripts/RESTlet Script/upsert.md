# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpsertRESTlet
title: RESTlet Upsert Records Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/upsert.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record types provided by `record_type` in the request

---

## 1. Overview
A RESTlet helper that creates or updates records based on the presence of an internal ID, applying literal fields and sublist updates.

## 2. Business Goal
Provides a single API entry point for both create and update operations with consistent request formatting.

## 3. User Story
As an integration, when I need to upsert records, I want to upsert records, so that I can create or update data in one call.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_data` | Request contains upsert requests | Create or update records and return formatted replies |

## 5. Functional Requirements
- The system must accept `record_data` in the request, containing one or more upsert requests.
- Each upsert request must include `record_type` and optional `internalid`.
- The system must load existing records when `internalid` is provided; otherwise it must create a new record.
- The system must apply literal field updates via `NetsuiteToolkit.RecordProcessor.updateLiterals`.
- The system must apply sublist updates via `NetsuiteToolkit.SublistProcessor`.
- The system must submit the record using `NetsuiteToolkit.submitRecord` and capture the resulting ID.
- The system must return a formatted reply for each request and a batch-level reply for the full payload.

## 6. Data Contract
### Record Types Involved
- Any record types provided by `record_type` in the request

### Fields Referenced
- `internalid`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Invalid record type.
- Invalid sublist data causing sublist processor errors.
- Submit fails due to permissions; reply includes formatted error.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 APIs.
- Assumes sublist data is well-formed for `SublistProcessor`.

## 9. Acceptance Criteria
- Given an upsert request with `internalid`, when the RESTlet runs, then the record is updated and returns the same ID.
- Given an upsert request without `internalid`, when the RESTlet runs, then the record is created and returns a new ID.
- Given literal fields and sublist updates, when the RESTlet runs, then they are applied to the record.
- Given an error, when the RESTlet runs, then it is returned without crashing the RESTlet.

## 10. Testing Notes
- Upsert an existing record by internal ID.
- Create a new record without internal ID.
- Invalid record type.
- Invalid sublist data causing sublist processor errors.
- Submit fails due to permissions; reply includes formatted error.

## 11. Deployment Notes
- Upload `upsert.js`.
- Ensure the RESTlet deployment calls `upsertPostHandler`.
- Validate upsert operations in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should upserts be limited to an allowlist of record types?
- Should the handler validate mandatory fields before submit?
- Risk: Upserting invalid data causes record errors (Mitigation: Validate input or surface field errors)
- Risk: Large upsert batches consume governance (Mitigation: Enforce batch limits per request)

---
