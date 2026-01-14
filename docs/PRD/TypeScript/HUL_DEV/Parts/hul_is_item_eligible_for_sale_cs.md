# hul_is_item_eligible_for_sale_cs

Client Script that blocks adding ineligible inventory items and prompts the user with an alternate part suggestion.

## Script Info
- Type: Client Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.ts`
- Dependency: `SuiteScripts/HUL_DEV/Global/hul_swal`

## Trigger
- `pageInit` (preloads SweetAlert).
- `validateLine` on the `item` sublist.

## Behavior
- On line validation:
  - Gets the current line item ID and item type.
  - If item type is `InvtPart`, queries eligibility:
    - `custitem_hul_eligible_for_sale`
    - `custitem_hul_alt_part`
  - If not eligible:
    - Looks up the alternate part name.
    - Shows `partsIsEligibleSwalMessage(altPartName)`.
    - Returns `false` to block the line.

## Data Sources
- `item` table via SuiteQL.

## Notes
- If eligible, validation returns `true`.
- Errors are logged to console and default to allowing the line.
