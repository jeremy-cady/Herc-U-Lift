# hul_fsa_maint_data_nightly_ss

Scheduled script that runs a SuiteQL maintenance data query and logs the result rows (no record updates).

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fsa_maint_data_nightly_ss.ts`

## Input
- SuiteQL query that joins:
  - Recent completed tasks.
  - Upcoming tasks per project.
  - Support cases with revenue streams 263/18/19.
  - Equipment assets and related objects.
  - Latest hour meter readings per object.
  - Maintenance records tied to tasks.

## Behavior
- `execute`:
  - Runs the SuiteQL query with paging.
  - Logs each row from the results.
  - Builds a `resultsArray` of raw rows (not persisted or returned).

## Notes
- The `MaintenanceDataObject` interface is defined but not currently used to map results.
