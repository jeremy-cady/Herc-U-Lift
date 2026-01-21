# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoTemporaryItem
title: Sales Order Temporary Item Handling
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - vendor
  - purchaseorder
  - item

---

## 1. Overview
Generates and validates temporary item codes on sales orders and estimates, and initiates vendor/PO preparation when required.

---

## 2. Business Goal
Ensure temporary item lines are complete and traceable, and kick off PO creation workflows consistently.

---

## 3. User Story
As a sales or purchasing user, when I add temporary item lines to a transaction, I want required details enforced and codes generated so that temporary items can be tracked and PO creation can be initiated.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | custcol_sna_hul_temp_item_code, custcol_sna_hul_createpo | create/copy | Clear temp item code and create PO flag on all item lines. |
| beforeLoad | custcol_sna_hul_cust_createpo | view | Populate PO link HTML when createpo is Drop Ship and POVendor is present. |
| beforeSubmit | custcol_sna_hul_temp_item_code, custcol_sna_hul_itemcategory | temp item line | Generate temp item codes using category/prefix mapping and saved search index. |
| beforeSubmit | temp item fields | temp item line | Validate required temp item fields; block save with UI error when missing. |
| beforeSubmit | vendor fields | temp item line | Create or assign vendor details when vendor info is provided. |
| afterSubmit | custcol_sna_hul_temp_item_code | temp item line missing code | Backfill temp codes for missing lines after submit. |
| afterSubmit | custcol_sna_hul_createpo | createpo set and vendor data exists | Trigger PO creation via Suitelet. |

---

## 5. Functional Requirements
- On create/copy, clear temporary item code and create-PO flag fields on all item lines.
- On view, populate the customer-facing create-PO field with Drop Ship/Spec Ord PO links when applicable.
- Generate temporary item codes using category/prefix mapping and the latest index from `customsearch_sna_hul_tempcode_index`.
- Validate required temporary item fields and block UI save with a clear error if missing.
- When vendor details are provided, set or create vendor information for the temporary item line.
- After submit, backfill missing temporary item codes and invoke the PO-creation Suitelet when create-PO is set.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Estimate
- Vendor
- Purchase Order
- Item

### Fields Referenced
- Item line | custcol_sna_hul_temp_item_code | Temporary item code
- Item line | custcol_sna_hul_createpo | Create PO indicator (script)
- Item line | custcol_sna_hul_cust_createpo | PO link HTML
- Item line | custcol_sna_hul_itemcategory | Item category
- Item line | custcol_sna_hul_item_vendor | Temporary vendor
- Item line | custcol_sna_hul_vendor_name | Vendor name
- Item line | custcol_sna_hul_vendor_item_code | Vendor item code
- Item line | custcol_sna_hul_temp_porate | Temporary PO rate
- Item line | custcol_sna_hul_estimated_po_rate | Estimated PO rate
- Item line | custcol_sna_hul_company_or_indv | Vendor is person flag
- Item line | custcol_sna_hul_vendor_phone_no | Vendor phone
- Item line | custcol_sna_hul_vendor_city | Vendor city
- Item line | custcol_sna_hul_vendor_state | Vendor state
- Item line | custcol_sna_hul_vendor_country | Vendor country
- Item line | custcol_sna_hul_vendor_zipcode | Vendor zip
- Item line | custcol_sna_hul_vendor_address1 | Vendor address 1
- Item line | custcol_sna_hul_vendor_address2 | Vendor address 2
- Item line | custcol_sna_hul_vendor_sub | Vendor subsidiary
- Item line | custcol_sna_linked_po | Linked PO
- Item line | custcol_sna_hul_ship_meth_vendor | Vendor ship method

Schemas (if known):
- Saved search | customsearch_sna_hul_tempcode_index | Latest temp code index per category/prefix
- Suitelet | customscript_sna_hul_sl_so_tempitem | PO creation endpoint

---

## 7. Validation & Edge Cases
- Missing required temporary item fields block UI save with an error message.
- If temporary item codes are missing after submit, the script backfills them.
- PO creation is delegated to a Suitelet; failures should not prevent save.

---

## 8. Implementation Notes (Optional)
- Uses saved search `customsearch_sna_hul_tempcode_index` to resolve the latest index per category/prefix.
- Invokes Suitelet `customscript_sna_hul_sl_so_tempitem` for PO creation.
- Governance considerations: record loads and searches per transaction; HTTPS call for Suitelet.

---

## 9. Acceptance Criteria
- Given a sales order or estimate with temporary item lines, when the record is saved, then each temp line has a unique code using the configured prefix and sequence.
- Given a temporary item line with missing required fields, when a user saves in the UI, then the save is blocked with a clear error message.
- Given create-PO is set and vendor data exists, when the record is saved, then the PO creation Suitelet is invoked.

---

## 10. Testing Notes
- Create or copy a transaction and verify temp item codes and create-PO flags are cleared.
- Save with missing temporary item fields and confirm the UI error.
- Save with create-PO set and vendor details; confirm Suitelet invocation and links on view.

---

## 11. Deployment Notes
- Ensure saved search `customsearch_sna_hul_tempcode_index` is available.
- Suitelet `customscript_sna_hul_sl_so_tempitem` must be deployed and active.
- Deploy the user event to Sales Order and Estimate records.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Confirm the exact required field list for temporary items.

---
