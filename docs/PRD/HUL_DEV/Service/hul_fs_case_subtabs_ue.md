# hul_fs_case_subtabs_ue

User Event that adds an “Open Cases” tab/subtab and injects the related-cases UI for Field Service cases on create.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_ue.ts`

## Trigger
- `beforeLoad` on CREATE only.

## Key IDs / Assets
- Tab IDs: `custpage_open_cases_tab` / `custpage_open_cases_subtab`.
- Suitelet: `customscript4392` / `customdeploy1`.
- Hidden Suitelet URL field: `custpage_oc_sl_url`.
- HTML container field: `custpage_oc_container`.
- SweetAlert2 media URL (inline loader).

## Behavior
- On CREATE, adds the Open Cases tab and subtab.
- Resolves the Suitelet URL and stores it in a hidden field.
- Renders an inline HTML card that hosts the related-cases table and styling.
- Injects inline client bootstrap JS that:
  - Loads SweetAlert2 on demand.
  - Reads customer and asset fields, calls the Suitelet, and renders a table.
  - Shows a one-time modal when related cases are found.
  - Watches field changes and waits for the container to appear before initializing.
