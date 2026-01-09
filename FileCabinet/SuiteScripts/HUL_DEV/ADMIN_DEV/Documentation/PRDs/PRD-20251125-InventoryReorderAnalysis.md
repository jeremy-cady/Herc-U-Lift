# PRD: Inventory Reorder Analysis

**PRD ID:** PRD-20251125-InventoryReorderAnalysis
**Created:** November 25, 2025
**Author:** Claude Code (Reverse-engineered from existing script)
**Status:** UAT (User Acceptance Testing) - Full Mitsubishi Category
**Related Scripts:**
- `MapReduce/hul_mr_inventory_reorder_analysis.js`

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that analyzes all inventory items across locations and generates reorder recommendations based on stock levels, sales velocity, reorder points, and vendor lead times. The script produces a CSV report and sends email alerts to the purchasing team.

**What problem does it solve?**
- Automates daily inventory analysis across thousands of items
- Identifies items that need reordering before stockouts occur
- Calculates recommended order quantities based on preferred stock levels
- Groups recommendations by vendor for efficient PO creation
- Provides urgency-based prioritization (Critical, High, Medium, Low)

**Primary Goal:**
Enable the Purchasing team to proactively manage inventory replenishment with automated daily analysis and actionable recommendations.

---

## 2. Current State Analysis

### What Works

1. **Multi-Location Inventory (MLI)** - Script queries location-specific inventory using:
   - `locationquantityavailable`
   - `locationquantityonhand`
   - `locationquantityonorder`
   - `locationquantitycommitted`
   - `locationquantitybackordered`
   - `locationreorderpoint`
   - `locationpreferredstocklevel`

2. **Sales Velocity Calculation** - Calculates 30-day and 90-day sales velocity from Sales Orders

3. **Vendor Integration** - Retrieves preferred vendor, vendor cost, and lead time

4. **Reorder Logic** - Recommends reorder when:
   - Quantity Available < Reorder Point AND recent sales velocity > 0
   - Has backorders
   - Will stockout within vendor lead time

5. **Output** - Generates CSV file and sends email with urgency summary

### Known Issues

1. **Central/Warehouse Location Data Missing** - ✅ RESOLVED
   - Central locations (IDs 2-15) are properly captured via `inventoryitemlocations` subrecord
   - Verified working in single-item tests

2. **Test Mode Filter Active** - ⚠️ INTENTIONAL FOR TESTING
   - Currently filtered to: Mitsubishi category (internal ID = 1) + 500 item limit
   - **ACTION NEEDED:** Remove category filter and item limit before production deployment

3. **Sales Velocity Only Uses Sales Orders** - ⏳ NOT STARTED
   - Currently only queries `SalesOrd` transaction type
   - Should also include Item Fulfillments for actual shipment data
   - **ACTION NEEDED:** Add Item Fulfillment (`ItemShip`) to velocity calculation

4. **Hardcoded Values** - ✅ RESOLVED
   - Folder ID now uses script parameter `custscript_reorder_folder`
   - Email sender now uses script parameter `custscript_reorder_sender`

---

## 3. Goals

1. **Accurate Inventory Data** - Retrieve inventory data for ALL locations including Central/warehouse
2. **Reliable Velocity** - Calculate sales velocity from both Sales Orders and Item Fulfillments
3. **Actionable Output** - Provide clear reorder recommendations grouped by vendor
4. **Configurable** - Allow purchasing team to configure recipients, thresholds, and folder locations
5. **Daily Automation** - Run automatically at 2:00 AM Central Time so report is ready when team arrives

---

## 4. User Stories

1. **As a** Purchasing Manager, **I want to** receive a daily email with items needing reorder **so that** I can prioritize my purchasing activities.

2. **As a** Purchasing Agent, **I want to** see items grouped by vendor **so that** I can efficiently create purchase orders.

3. **As a** Warehouse Manager, **I want to** see Central warehouse inventory levels **so that** I know what needs to be replenished at the main location.

4. **As a** Purchasing Manager, **I want to** see urgency levels (Critical, High, Medium, Low) **so that** I can focus on the most urgent items first.

5. **As an** Administrator, **I want to** configure email recipients and thresholds **so that** the system can be adjusted without code changes.

---

## 5. Functional Requirements

### Current Functionality

1. **Item Selection Criteria:**
   - Type = Inventory Part (`InvtPart`)
   - Active items only (`isinactive = 'F'`)

2. **Reorder Logic:**
   - Reorder if: `QuantityAvailable <= ReorderPoint` AND `30-day velocity > 0`
   - Reorder if: `QuantityBackordered > 0`
   - Reorder if: `DaysUntilStockout < VendorLeadTime` AND `30-day velocity > 0`

3. **Recommended Order Quantity:**
   ```
   Target = PreferredStockLevel OR (ReorderPoint * 2) OR (AvgDailyUsage * (LeadTime + 30))
   NetAvailable = QtyAvailable + QtyOnOrder - QtyBackordered
   RecommendedQty = MAX(0, Target - NetAvailable)
   ```

4. **Urgency Levels:**
   - **CRITICAL:** Has backorders
   - **HIGH:** Days until stockout < 7
   - **MEDIUM:** Days until stockout < 14
   - **LOW:** Other items needing reorder

5. **Output:**
   - CSV file saved to File Cabinet
   - Email sent with summary and CSV attachment

### Required Enhancements

1. **Central Location Inventory:**
   - [ ] Research NetSuite's MLI data model for Central/warehouse inventory
   - [ ] Update query to include Central location inventory data
   - [ ] Verify all location types (Central, Van) are captured

2. **Sales Velocity Enhancement:**
   - [ ] Add Item Fulfillment (`ItemShip`) to velocity query
   - [ ] Consider weighting recent fulfillments more heavily

3. **Configuration:**
   - [ ] Remove hardcoded test filter
   - [ ] Add script parameter for folder ID
   - [ ] Add script parameter for sender employee ID

---

## 6. Non-Goals (Out of Scope)

**This feature will NOT:**

- Automatically create Purchase Orders (recommendations only)
- Manage vendor relationships or pricing negotiations
- Handle serialized/lot-tracked inventory analysis
- Predict future demand beyond historical velocity

---

## 7. Design Considerations

### Multi-Location Inventory Architecture

**NetSuite MLI Data Model:**
- Location-specific inventory is stored on item records via `inventoryitemlocations` subrecord
- The search columns `locationquantity*` retrieve location-specific values
- When querying with `inventorylocation` column, results are duplicated per location

**Potential Central Location Issue:**
- Central/warehouse may not have an `inventorylocation` value (null)
- Or Central inventory may be on the base item record fields (`quantityavailable`, `quantityonhand`)
- Need to test: Does `inventorylocation` include Central, or is Central a separate record?

### Location Hierarchy

HUL uses a custom field `HUL LOCATION TYPE` to distinguish location types:

**Central Locations (Warehouses):**
| Internal ID | Name | Responsibility Center Code |
|-------------|------|---------------------------|
| 3 | Grand Rapids | 3 |
| 4 | Des Moines | 5 |
| 5 | Boscobel | 12 |
| 6 | Fargo | 6 |
| 7 | Maple Plain | 1 |
| 8 | Minot | 11 |
| 9 | Prairie du Chien | 13 |
| 10 | Sioux Falls | 2 |
| 11 | St. Cloud | 4 |
| 12 | Williston | 8 |
| 13 | Wisconsin | 7 |
| 14 | New Berlin | 10 |
| 15 | Lease company | 9 |
| 2 | Defective | - |

**Van Locations (Mobile/Field):**
- Internal IDs start at 102+
- Linked to parent Central via the `parent` field on the location record (more reliable than Responsibility Center Code)
- Example: Van 19 (ID 102) → parent field points to Grand Rapids (ID 3)

| Location Type | Custom Field Value | Description |
|---------------|-------------------|-------------|
| Central | `HUL LOCATION TYPE` = "Central" | Main warehouses |
| Van | `HUL LOCATION TYPE` = "Van" | Mobile/field technician locations |

**Investigation Needed:**
- Verify the script's `inventorylocation` column returns Central locations
- Check if Central location IDs (3-15) appear in current output
- If not, may need to query inventory differently for Central vs Van

### Email Content

**Current Summary:**
- Total Items Needing Attention
- Critical Items (red)
- High Priority (orange)
- Medium Priority (yellow)
- Low Priority
- Total Recommended Order Value

---

## 8. Technical Considerations

### NetSuite Components

**Record Types:**
- `item` (type: InvtPart) - Inventory items
- `transaction` (type: SalesOrd, ItemShip) - Sales velocity source
- `vendor` - Vendor lead time lookup

**Script Type:**
- Map/Reduce - Required for >5000 item processing

**Script Stages:**

| Stage | Purpose | Governance |
|-------|---------|------------|
| getInputData | Search all active inventory items | Low |
| map | Process each item, calculate velocity and recommendations | Medium-High (searches per item) |
| reduce | Group items by vendor | Low |
| summarize | Generate CSV, send email | Low |

### Script Parameters (Current)

| Parameter ID | Type | Description |
|--------------|------|-------------|
| `custscript_reorder_email_recipient` | Email | Recipient for daily report |

### Script Parameters (Proposed Additions)

| Parameter ID | Type | Description |
|--------------|------|-------------|
| `custscript_reorder_sender` | List/Record (Employee) | Email sender |
| `custscript_reorder_folder` | Integer | File Cabinet folder ID for CSV |
| `custscript_reorder_include_zero_velocity` | Checkbox | Include items with no recent sales |

### Governance Considerations

**Current Architecture (After Fixes):**
- `getPreferredVendor()` - 1 search per item
- `getLocationInventory()` - 1 search per item
- `calculateSalesVelocity()` - 1 search per item (moved OUTSIDE location loop)
- **Total: 3 searches per item = 30 governance units per map invocation**

**Issues Fixed:**
- ✅ `SSS_USAGE_LIMIT_EXCEEDED` - Was caused by calling `calculateSalesVelocity()` inside the forEach loop for each location. An item with 136 locations was running 136+ searches in a single map invocation. Fixed by moving velocity calculation outside the loop (item-level, not location-level).

**Potential Future Optimizations:**
- Batch vendor lookups in getInputData
- Use saved search with summary for velocity (if possible)
- Consider caching vendor lead times

---

## 9. Success Metrics

**We will consider this feature successful when:**

- All locations (Central + Van) show accurate inventory data
- Purchasing team receives daily email before start of business (script runs 2:00 AM Central)
- Backorder items are always flagged as CRITICAL
- CSV file contains all relevant data for PO creation
- No governance errors on 5000+ item runs

---

## 10. Implementation Plan

### Phase 1: Investigation & Fixes

| Task | Status |
|------|--------|
| Research Central location inventory in NetSuite MLI | ✅ Complete |
| Test current query output for location coverage | ✅ Complete - Central locations confirmed in MLI |
| Remove test filter (line 40) | ✅ Complete - Now uses Item Category filter |
| Document findings on Central location data | ✅ Complete - Location Hierarchy documented |
| Fix SSS_SEARCH_TIMEOUT error | ✅ Complete - Two-stage query architecture |

### Phase 2: Enhancements

| Task | Status |
|------|--------|
| Update query to include Central location inventory | ✅ Complete - Shows all locations for items needing reorder |
| Add Item Fulfillment to sales velocity calculation | Not Started |
| Add script parameters for folder, sender | ✅ Complete - custscript_reorder_folder, custscript_reorder_sender |
| Update email to use employee sender (not -5) | ✅ Complete - Uses sender parameter |
| Create "Inventory Reports" folder | ✅ Complete - Folder ID 5746560 (sandbox) |

### Phase 3: Testing & Deployment

| Task | Status |
|------|--------|
| Single item test (91B6100912) | ✅ Complete - No errors, item didn't need reorder (313 units available) |
| Single item test (9110600200 U-CLAMP) | ✅ Complete - Script ran successfully, item appeared in CSV |
| Fix SSS_USAGE_LIMIT_EXCEEDED governance error | ✅ Complete - Moved velocity calc outside location loop |
| Test with 500 item limit (Mitsubishi category) | ✅ Complete - No items needed reorder in first 500 |
| Fix SSS_SEARCH_FOR_EACH_LIMIT_EXCEEDED error | ✅ Complete - Return search object directly for Map/Reduce pagination |
| Test with full Mitsubishi category (5,852 items) | **UAT IN PROGRESS** |
| Test with full item set (remove category filter) | Not Started |
| Verify all locations appear in output | Not Started |
| Configure production email recipients | Not Started |
| Schedule daily deployment (2:00 AM Central) | Not Started |

---

## 11. Testing Requirements

### Test Scenarios

1. **Single Item Test** - Run with test filter to verify logic
2. **Multi-Location Item** - Item exists in Central AND Van locations
3. **Central Only Item** - Item only in Central warehouse
4. **Van Only Item** - Item only in Van location
5. **No Location Item** - Item with no location assignment
6. **High Volume Test** - Run without filter on full inventory

### Test Data Requirements

- At least 5 items across different locations
- At least 1 item with backorders
- At least 1 item below reorder point
- At least 1 item with no recent sales (zero velocity)

---

## 12. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing Manager
- Purchasing Agent
- Administrator

**Permissions required:**
- View Inventory Items
- View Transactions (Sales Orders, Item Fulfillments)
- View Vendors
- Access File Cabinet (for CSV)

---

## 13. Open Questions

- [x] How does NetSuite store Central/warehouse inventory in MLI? **Answer: Central locations (IDs 2-15) are stored in `inventoryitemlocations` subrecord same as Van locations. Verified working.**
- [x] What is the internal ID for the Central location in your NetSuite account? **Answer: Central locations have IDs 2-15 (see Location Hierarchy section)**
- [x] Are there any items that should be excluded from analysis (e.g., discontinued, special order)? **Answer: No exclusions needed at this time**
- [ ] Should velocity include Item Receipts (for items that are also sold to customers)?
- [x] What time should the daily script run? **Answer: 2:00 AM Central Time**

---

## 14. Known Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Search timeout on large item counts | High | High | Two-stage query architecture | ✅ Mitigated |
| Governance limits (SSS_USAGE_LIMIT_EXCEEDED) | High | High | Moved velocity calc outside location loop | ✅ Mitigated |
| Central location data not captured | High | High | Research MLI, update query | ✅ Resolved |
| Email delivery failures | Low | Medium | Log attempts, add CC recipients | Open |
| Slow runtime (hours) | Medium | Medium | Item limit for testing; estimated 15-45 min for full category | In Progress |

---

## 15. References

### NetSuite Documentation
- [Multi-Location Inventory](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N557207.html)
- [Map/Reduce Script Type](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387799161.html)
- [Item Search Columns](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3208842.html)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 25, 2025 | Claude Code | 1.0 | Initial PRD - reverse-engineered from existing script |
| Nov 25, 2025 | Claude Code | 1.1 | Added Location Hierarchy documentation (Central IDs 2-15, Van IDs 102+) |
| Nov 25, 2025 | Claude Code | 1.2 | Updated architecture to show ALL locations for items needing reorder; Added Central Summary |
| Nov 26, 2025 | Claude Code | 1.3 | Implemented two-stage query architecture to fix SSS_SEARCH_TIMEOUT error; getInputData now returns unique items only, map stage queries locations per item |
| Nov 28, 2025 | Claude Code | 1.4 | Fixed SSS_USAGE_LIMIT_EXCEEDED governance error by moving calculateSalesVelocity() outside location forEach loop; Added TEST_LIMIT parameter for controlled testing; Successfully tested single items (91B6100912, 9110600200) |
| Nov 28, 2025 | Claude Code | 1.5 | Fixed SSS_SEARCH_FOR_EACH_LIMIT_EXCEEDED error by returning search object directly (Map/Reduce handles pagination); Removed TEST_LIMIT; Moved to UAT with full Mitsubishi category (5,852 items) |

---

## 16. Resume Notes (For Next Session)

**Last Working State:** UAT - Running full Mitsubishi category (5,852 items)

**What Changed (Nov 28, 2025):**
1. Fixed `SSS_USAGE_LIMIT_EXCEEDED` error - Moved `calculateSalesVelocity()` outside forEach loop
2. Fixed `SSS_SEARCH_FOR_EACH_LIMIT_EXCEEDED` error - Return search object directly instead of using `.each()` (Map/Reduce handles pagination automatically)
3. Removed TEST_LIMIT - now processing all items in category
4. Successfully tested with single items before scaling up

**Current Test Filters:**
- Category: Mitsubishi (custitem_sna_hul_itemcategory = 1)
- No item limit - processing all 5,852 items

**Next Steps:**
1. Review UAT results from full Mitsubishi category run
2. Verify CSV output and email delivery
3. Remove category filter for full inventory run
4. Configure production email recipients
5. Schedule daily deployment (2:00 AM Central)

**Files Modified:**
- `MapReduce/hul_mr_inventory_reorder_analysis.js` - Production-ready for category test
