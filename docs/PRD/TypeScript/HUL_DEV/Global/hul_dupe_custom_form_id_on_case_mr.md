# hul_dupe_custom_form_id_on_case_mr

Map/Reduce script that re-saves selected Support Case records to trigger a User Event that populates missing custom form IDs.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** Searches active Support Cases where `custevent_hul_custom_form_id` is empty, filtered by case type and department lists.
- **map:** Writes case IDs forward to reduce.
- **reduce:** Loads each case and saves it, which triggers the related User Event script.
- **summarize:** Logs map/reduce errors and counts processed cases.

## Search Filters
- Active cases only (`isinactive = F`)
- `custevent_hul_custom_form_id` is empty
- Case types: `1,2,3,4,5,6,7,8,9,10,11,12,13,14,15`
- Case departments: `34,28,18,23,4,37,36,35,3`

## Notes
- The script does not set the custom form ID directly; it relies on the User Event logic triggered by `save()`.
- Error handling is via `log.error` in map/reduce/summarize.
