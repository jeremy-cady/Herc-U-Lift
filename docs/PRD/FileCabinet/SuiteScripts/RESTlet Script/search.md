# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SearchRESTlet
title: RESTlet Advanced Search Helper
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/search.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - The record type referenced by `record_type` in the request

---

## 1. Overview
A RESTlet helper that executes dynamic NetSuite searches with custom filters, columns, and advanced options, returning paged results.

## 2. Business Goal
Provides a flexible API to run parameterized searches and retrieve large result sets with pagination beyond the 1000-row limit.

## 3. User Story
As an integration, when I need to run dynamic searches, I want to run dynamic searches, so that I can query data flexibly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST | `record_type`, `batch_size`, `lower_bound`, `search_filters`, `search_columns`, `advanced_options` | Request provided | Execute dynamic search and return formatted results |

## 5. Functional Requirements
- The system must accept `record_type`, `batch_size`, `lower_bound`, `search_filters`, `search_columns`, and optional `advanced_options`.
- The system must round `batch_size` up to the nearest multiple of 1000.
- The system must build search filters from request data unless `advanced_options.useFilterExpressions` is true.
- The system must support SQL formula filters via `formula` parameters.
- The system must append a lower bound filter on `internalidnumber` greater than the current lower bound.
- The system must build search columns from request data and append a sort column on `internalid` ascending.
- The system must execute searches in 1000-row blocks until the batch size is met or no more results remain.
- The system must update the lower bound using the last record ID from each results block.
- The system must optionally group joined columns into nested objects when `advanced_options.groupJoins` is true.
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
- `batch_size` not divisible by 1000; verify rounding.
- `useFilterExpressions` true with custom filter expressions.
- Missing or invalid filter/column fields.
- Search throws an exception; reply includes formatted error.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 search APIs.
- Filter expressions bypass lower bound filter generation.
- Grouped join output reshapes search results into nested objects.

## 9. Acceptance Criteria
- Given a request, when the RESTlet runs, then searches return results in batches until completion conditions are met.
- Given filters and columns are provided, when the RESTlet runs, then they are generated from request parameters unless filter expressions are used.
- Given SQL formula filters are provided, when the RESTlet runs, then they are applied.
- Given `groupJoins` is enabled, when the RESTlet runs, then joined columns are grouped into nested join objects.
- Given an error during search, when the RESTlet runs, then a formatted error is returned.

## 10. Testing Notes
- Execute a search with basic filters and columns.
- Execute a search with more than 1000 results to validate paging.
- Execute a search with `groupJoins` enabled.
- `batch_size` not divisible by 1000; verify rounding.
- `useFilterExpressions` true with custom filter expressions.
- Missing or invalid filter/column fields.
- Search throws an exception; reply includes formatted error.

## 11. Deployment Notes
- Upload `search.js`.
- Ensure the RESTlet deployment calls `searchPostHandler`.
- Validate search execution and response structure.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should filter expressions also support lower bound paging?
- Should groupJoins be enabled by default for joined searches?
- Risk: Filter expressions bypass lower bound paging (Mitigation: Document usage and enforce limits)
- Risk: Large searches consume governance (Mitigation: Limit batch size per request)

---
