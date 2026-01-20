# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SavedSearchRESTlet
title: RESTlet Saved Search Batch Fetch
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/saved_search.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - The record type referenced by `record_type` in the request

---

## 1. Overview
A RESTlet helper that executes a saved search in batches using internal ID paging and returns aggregated results.

## 2. Business Goal
Allows external systems to retrieve large saved search result sets in manageable batches while avoiding NetSuite's 1000-row limit.

## 3. User Story
As an integration, when I need to page through saved search results, I want to page through saved search results, so that I can retrieve large datasets.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_type`, `search_id`, `lower_bound`, `batch_size` | Request provided | Execute saved search in batches and return formatted reply |

## 5. Functional Requirements
- The system must accept `record_type`, `search_id`, `lower_bound`, and `batch_size` from the request.
- The system must round `batch_size` up to the nearest multiple of 1000.
- The system must create a search filter for `internalidnumber` greater than the current lower bound.
- The system must sort search results by `internalid` ascending.
- The system must iterate search requests in blocks of up to 1000 records.
- The system must update the lower bound to the last record ID after each block.
- The system must stop when fewer than 1000 records are returned or when batch size is met.
- The system must accumulate all result rows in a single response list.
- The system must return a formatted reply using `NetsuiteToolkit.formatReply`.

## 6. Data Contract
### Record Types Involved
- The record type referenced by `record_type` in the request

### Fields Referenced
- `internalidnumber`
- `internalid`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Batch size not divisible by 1000; verify rounding behavior.
- Lower bound excludes all results; return empty list.
- Saved search ID is invalid.
- Search execution throws an exception; reply contains formatted error.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 search API; each search call returns up to 1000 rows.
- Lower bound paging depends on `internalid` ordering.

## 9. Acceptance Criteria
- Given a request, when the RESTlet runs, then results are returned in batches until completion conditions are met.
- Given a `batch_size`, when the RESTlet runs, then `batch_size` is normalized to a multiple of 1000.
- Given an error during search, when the RESTlet runs, then a formatted error is returned.
- Given a request, when the RESTlet runs, then returned results include all records up to the batch size or end of data.

## 10. Testing Notes
- Execute a saved search with fewer than 1000 results.
- Execute a saved search with more than 1000 results and verify paging.
- Batch size not divisible by 1000; verify rounding behavior.
- Lower bound excludes all results; return empty list.
- Saved search ID is invalid.
- Search execution throws an exception; reply contains formatted error.

## 11. Deployment Notes
- Upload `saved_search.js`.
- Ensure the RESTlet deployment calls `savedSearchPostHandler`.
- Validate saved search pagination in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the handler enforce a maximum batch size?
- Should it support additional filters beyond internal ID paging?
- Risk: Large batches consume governance (Mitigation: Limit batch size and monitor usage)
- Risk: Lower bound paging skips records with non-linear IDs (Mitigation: Document internal ID ordering assumption)

---
