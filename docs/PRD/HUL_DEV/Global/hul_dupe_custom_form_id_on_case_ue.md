# hul_dupe_custom_form_id_on_case_ue

User Event script that copies the Case form ID into a custom field on create and edit.

## Script Info
- Type: User Event (beforeSubmit)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.ts`

## Trigger
- Runs on `CREATE` and `EDIT`.

## Behavior
- Reads the Case `customform` value.
- Writes the value to `custevent_hul_custom_form_id`.
- Logs the current and copied form ID.

## Notes
- Designed to support other processes that need to reference the Case form ID via a custom field.

## Error Handling
- Wraps logic in try/catch and logs errors with `log.error`.
