# PRD: NetSuite RESTlet Toolkit Library

**PRD ID:** PRD-UNKNOWN-NetsuiteToolkit
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/RESTlet Script/netsuite_toolkit.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared library that wraps SuiteScript 1.0 APIs and provides helper utilities for RESTlet handlers, including record operations, reply formatting, and sublist processing.

**What problem does it solve?**
Standardizes common NetSuite operations and response formatting across RESTlet scripts.

**Primary Goal:**
Provide reusable helper functions for record access, sublist manipulation, and response formatting.

---

## 2. Goals

1. Wrap common SuiteScript APIs for create, load, delete, transform, and submit.
2. Provide consistent response formatting and exception handling.
3. Provide helper utilities for record field and sublist operations.

---

## 3. User Stories

1. **As a** developer, **I want** shared helper methods **so that** RESTlet scripts stay consistent.
2. **As an** integration, **I want** standardized reply formats **so that** responses are predictable.
3. **As an** admin, **I want** sublist utilities **so that** bulk line item changes are easier to implement.

---

## 4. Functional Requirements

### Core Functionality

1. The system must expose helper functions that wrap:
   - `nlapiCreateRecord` as `createRecord`
   - `nlapiLoadRecord` as `loadRecord`
   - `nlapiDeleteRecord` as `deleteRecord`
   - `nlapiTransformRecord` as `transformRecord`
   - `nlapiSubmitRecord` as `submitRecord`
2. The system must expose record field helpers for setting field values and line item values.
3. The system must expose sublist helpers for insert, update, and remove operations.
4. The system must expose search helpers for filters, columns, and search execution.
5. The system must format replies with `params`, `result`, `success`, and `exception` (when present).
6. The system must format exceptions with `message` and `trace` (stack trace when available).
7. The system must provide a `RecordProcessor.updateLiterals` helper for setting multiple fields.
8. The system must provide a `SublistProcessor` class that supports create, update, and excise operations.
9. The system must throw standardized errors for malformed sublist data or unmatched line items.

### Acceptance Criteria

- [ ] Wrapped API helpers return the same results as their NetSuite equivalents.
- [ ] `formatReply` includes `success` and `exception` when errors occur.
- [ ] `RecordProcessor.updateLiterals` updates all provided fields.
- [ ] `SublistProcessor` can create, update, and remove line items.
- [ ] Sublist matching failures return the standardized `UnableToMatch` error.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace NetSuite role permissions or governance limits.
- Provide UI elements or client-side helpers.
- Validate business rules beyond helper-level checks.

---

## 6. Design Considerations

### User Interface
- None (server-side library).

### User Experience
- Scripts using the library return consistent responses and share common utility behavior.

### Design References
- RESTlet helpers in `FileCabinet/SuiteScripts/RESTlet Script`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record types accessed by callers of the library.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Used by RESTlet helpers
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None (library only).

**Saved Searches:**
- Uses `nlapiSearchRecord` for search helpers.

### Integration Points
- RESTlet scripts that consume `NetsuiteToolkit`.

### Data Requirements

**Data Volume:**
- Dependent on callers (library does not batch by itself).

**Data Sources:**
- NetSuite records, sublists, and searches accessed by callers.

**Data Retention:**
- No data retained by the library.

### Technical Constraints
- Built on SuiteScript 1.0 APIs (`nlapi*`).
- Assumes line item indexing starts at 1 for sublist operations.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Used by RESTlet helpers such as load, delete, transform, and upsert.

### Governance Considerations
- Governance usage depends on caller operations (load, search, submit, etc.).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- RESTlet scripts reuse common helpers without duplicated logic.
- Responses are consistently formatted across endpoints.

**How we'll measure:**
- Review RESTlet responses for consistent `formatReply` output.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| netsuite_toolkit.js | Library | Shared RESTlet helper functions | Implemented |

### Development Approach

**Phase 1:** Core wrappers
- [x] Wrap create/load/delete/transform/submit APIs.

**Phase 2:** Utilities
- [x] Add formatting helpers and sublist processors.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Use each wrapper to create, load, and delete a record.
2. Format a successful reply with `formatReply`.
3. Use `SublistProcessor` to add and update a line item.

**Edge Cases:**
1. Attempt to match a line item with no match; expect `UnableToMatch`.
2. Provide malformed sublist data; expect `MalformedData` (thrown by caller).

**Error Handling:**
1. `formatException` fails to get a stack trace; returns message in `trace`.

### Test Data Requirements
- Records with sublists for create/update/remove tests.

### Sandbox Setup
- NetSuite role with permissions for the target record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- RESTlet execution role using the library.

**Permissions required:**
- Based on underlying record operations invoked by callers.

### Data Security
- The library does not store data; it only passes through record operations.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `netsuite_toolkit.js`.
2. Ensure dependent RESTlet scripts reference the library.

### Post-Deployment

- [ ] Verify RESTlet endpoints function with the shared toolkit.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Revert RESTlet scripts to prior helper functions or redeploy previous library version.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the library enforce stricter input validation for sublist operations?
- [ ] Should helper functions include logging for audit purposes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Misuse of helper functions causes unintended edits | Med | Med | Document usage patterns and add validation |
| High governance usage from batch operations | Med | Med | Monitor usage and enforce batch limits |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 API reference
- RESTlet best practices

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
