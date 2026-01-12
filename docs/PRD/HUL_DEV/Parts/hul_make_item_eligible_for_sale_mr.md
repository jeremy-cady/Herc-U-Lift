# hul_make_item_eligible_for_sale_mr

Map/Reduce script that sets `custitem_hul_eligible_for_sale` to true on inventory items that are currently ineligible.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_make_item_eligible_for_sale_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** Searches inventory items where `custitem_hul_eligible_for_sale` is `F`.
- **map:** Writes item internal IDs to reduce.
- **reduce:** Sets `custitem_hul_eligible_for_sale` to `T` via `record.submitFields`.
- **summarize:** no active logic (placeholder).

## Notes
- Uses a paged search to avoid the 4,000 result limit.
- Ignores item name in reduce; only ID is used.
