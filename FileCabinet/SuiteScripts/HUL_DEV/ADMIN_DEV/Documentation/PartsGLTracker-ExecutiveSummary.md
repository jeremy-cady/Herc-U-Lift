# Parts G/L Tracker
## Executive Summary for Management

**Date:** December 2025
**Prepared by:** Thomas Showalter
**Focus:** Service (W) and Parts Sales (PS) Orders

---

## What Is It?

The Parts G/L Tracker is a visual tool built into NetSuite that provides instant visibility into where costs sit in our accounting system. It tracks **all line item types** - inventory parts, labor/service, and charges - from the moment they're sold through to final COGS recognition, automatically flagging items that have deviated from the expected path.

**Bottom Line:** What previously required hours of manual spreadsheet research can now be done in seconds.

---

## The Business Problem We're Solving

### The Accounting Lifecycle

When we create a Service or Parts Sales order, different line types follow different accounting paths:

**Inventory Parts:**
```
Sales Order → Item Fulfillment → Parts WIP → Invoice → COGS
```

**Labor/Resource Items (Travel Time, Service Labor):**
```
Sales Order → Time Entry → Labor WIP → Invoice → Service COGS
```

**Charge Items (Shop Supplies, Misc Charges):**
```
Sales Order → Invoice → Revenue (no cost tracking)
```

### Where Problems Occur

Several scenarios cause costs to end up in the wrong accounts:

1. **Returns Before Invoicing** - When a customer returns parts before we invoice them, the standard system incorrectly credits COGS instead of Parts WIP
2. **Missing Journal Entries** - Sometimes the WIP-to-COGS journal entry doesn't get created
3. **Timing Mismatches** - Costs and revenues end up in different periods
4. **Labor Cost Variances** - Time entry hours don't match expected COGS amounts

### The Impact

- **Incorrect Margins** - Gross margin reports show wrong numbers
- **Balance Sheet Errors** - WIP account balances don't reconcile
- **Delayed Month-End Close** - Hours spent hunting for discrepancies
- **Audit Risk** - Unexplained variances in financial statements

---

## What the System Does

### 1. Search & Filter Sales Orders

Search for Service (W) or Parts Sales (PS) orders by date range. The system returns up to 1,000 orders with instant status visibility.

**Filter Options:**
- **Document Type** - W (Service), PS (Parts Sales), R (Rental), S (Equipment)
- **Date Range** - Filter by order date
- **Line Type** - Filter by item type (Inventory, Resource/Labor, Charge, etc.)
- **Customer** - Optional customer filter

### 2. Status-at-a-Glance

Each Sales Order shows a **Line Status** summary with Location and Revenue Stream:

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **Complete** (Green) | All items fully processed through COGS | None |
| **In WIP** (Yellow) | Items fulfilled but not yet invoiced | Normal - monitor aging |
| **Issue** (Red) | Problem detected - costs may be misallocated | Investigate and correct |
| **Pending** (Gray) | Not yet fulfilled/recorded | None |

### 3. All Line Types Tracked

The system now tracks **every line type** on a Sales Order:

| Line Type | What's Tracked | Cost Source |
|-----------|---------------|-------------|
| **Inventory Parts** | Item Fulfillment → WIP JE → Invoice → COGS JE | IF GL posting (COGS debit) |
| **Resource (Labor)** | Time Entry → Invoice → COGS JE | Hours × Employee Labor Rate |
| **Charge Items** | Invoice only | N/A (no cost) |
| **Other Types** | Invoice status | N/A |

### 4. Time Entry Tracking for Labor

**New Feature:** Resource items (Travel Time, Service Labor) are now fully tracked:

- **Time Entry Link** - See which Time Entry record is linked to each labor line
- **Calculated Cost** - Hours × Employee's labor cost rate
- **COGS JE Verification** - System verifies the COGS journal entry matches the calculated cost
- **Status Tracking** - Complete when Time Entry exists AND COGS JE is posted

**Example:** A Service Labor line shows:
- Time Entry: TE-12345 (3.0 hours)
- Cost: $136.62 (3.0 hrs × $45.54/hr)
- COGS JE: JE161814 - Verified ✓

### 5. Expected Margin (Before Invoicing)

**New Feature:** See expected margin BEFORE the invoice is created:

| Column | Formula | Purpose |
|--------|---------|---------|
| **Exp Margin** | (SO Amount - Cost) / SO Amount | Catch pricing issues early |
| **Margin** | (Invoice - COGS JE) / Invoice | Final margin after invoicing |

**Color Coding:**
- **Green (≥30%)** - Healthy margin
- **Yellow (15-29%)** - Moderate margin - review
- **Red (<15%)** - Low margin - investigate

**Planned Maintenance Orders:**
For PM orders, the Expected Margin on the PM line automatically aggregates all labor costs:
- PM Expected Margin = (PM Revenue - Total Labor Costs) / PM Revenue
- Individual labor lines show "→ PM" to indicate their cost rolls up to the PM line

### 6. Deep-Dive Investigation

Click any Sales Order number (now a clickable link) to see:
- Every line item with its current status and type
- Complete G/L account trail (which accounts, what amounts)
- Verification that WIP amounts match COGS amounts
- Links to all related transactions (IF, Time Entry, Invoice, JE, RA)
- Timeline view showing the accounting flow

### 7. Identify Exact Correction Needed

The system shows you:
- Which account has the incorrect balance
- The exact dollar amount
- Which transactions are involved

This tells you exactly what correcting journal entry to create.

---

## Daily Operational Process

### Morning Review Workflow (10-15 minutes)

**Step 1:** Access Parts G/L Tracker
- From any Sales Order: Click "Track Parts G/L" button
- Or: Navigate directly to the Suitelet

**Step 2:** Set Your Filters
- Document Type: **W - Service** or **PS - Parts Sales**
- Date From / Date To: Previous day or week
- Line Type: All (or filter to specific types)
- Click Search

**Step 3:** Scan the Results
- Look for orders showing **Issues** (red indicators)
- Note the counts: "3/5 Complete, 2 Issues" means 2 lines need attention
- Check **Exp Margin** column for any red (low margin) items

**Step 4:** Investigate Issues
- Click "Track" on any order with issues
- Review which lines are flagged
- Check the G/L account trail to understand what happened

**Step 5:** Create Corrections
- Based on what the system shows, create a correcting Journal Entry
- The system displays exact accounts and amounts needed

**Step 6:** Verify
- Re-run the tracker after posting corrections
- Status should change to Complete

---

## Value Delivered

### Comprehensive Coverage
- **All Item Types** - Parts, Labor, Charges - everything on the order
- **Time Entry Integration** - Labor costs tracked through Time Entry records
- **1,000+ Orders** - Review at scale, not just sampling

### Speed
- **Before:** Hours of manual research per issue
- **After:** Seconds to identify and understand any problem

### Proactive Detection
- **Expected Margin** - Catch pricing/cost issues BEFORE invoicing
- **Daily Monitoring** - Find issues before month-end close
- **PM Cost Aggregation** - See total labor cost on PM orders instantly

### Accuracy
- System matches transactions by Item Fulfillment number
- Handles serialized items correctly (matches by serial, not just item)
- Automatic verification of WIP-to-COGS amounts
- Time Entry cost verification (hours × rate = COGS JE amount)

### Audit Trail
- Full G/L account entries visible for each transaction
- See exactly which accounts were debited/credited
- Complete documentation for auditors
- Clickable links to all source records

---

## Current Limitations

**What the system does NOT do (yet):**

| Limitation | Workaround |
|------------|------------|
| **View-Only** - Identifies issues but doesn't auto-create corrections | User creates correcting JE manually based on system findings |
| **Forward Tracking Only** - Must start from Sales Order | Can't start investigation from a Return Authorization or Invoice |
| **No Automated Alerts** - Doesn't email when issues detected | Must run the tracker manually to check for issues |
| **Average Cost Items** - Cannot trace exact procurement source | Procurement source only shown for serialized/lot items or special orders |

---

## Future Roadmap

Planned enhancements based on user feedback:

1. **Automated Correction Suggestions** - System generates the correcting JE for approval
2. **Email Alerts** - Automatic notification when issues are detected
3. **Bidirectional Tracking** - Start from any record (RA, Invoice, PO)
4. **WIP Aging Reports** - Identify items sitting in WIP too long
5. **Dashboard Integration** - Add to existing operational dashboards
6. **RA Item Receipt Tracking** - Track return receipts through GL (partially implemented)

---

## Quick Reference

### Document Type Prefixes
| Prefix | Type |
|--------|------|
| W | Service |
| PS | Parts Sales |
| R | Rental |
| S | Equipment |

### Line Types
| Type | Description | Cost Tracking |
|------|-------------|---------------|
| Item (1) | Inventory parts | IF → WIP → COGS |
| Resource (2) | Labor (Travel, Service) | Time Entry → COGS |
| Charge (3) | Shop supplies, misc | None (revenue only) |
| Purchase (4) | Drop ship items | PO → IF → WIP → COGS |

### Status Colors
| Color | Status | Meaning |
|-------|--------|---------|
| Green | Complete | Fully processed, no action needed |
| Yellow | In WIP | Awaiting invoice - normal |
| Red | Issue | Problem detected - investigate |
| Gray | Pending | Not yet fulfilled |

### Expected Margin Colors
| Color | Margin | Meaning |
|-------|--------|---------|
| Green | ≥ 30% | Healthy margin |
| Yellow | 15-29% | Moderate - review if unexpected |
| Red | < 15% | Low margin - investigate |

### Key G/L Accounts
| Account | Purpose |
|---------|---------|
| 13235 | Inventory - Parts Inventory |
| 13840 | Parts WIP (Work in Progress) |
| 13830 | Labor WIP (Work in Progress) |
| 54030 | COGS - Parts |
| 54010 | COGS - Service Labor |
| 44030 | Parts Sales Revenue |

### Access
- **From Sales Order:** Click "Track Parts G/L" button (appears on Service SO forms)
- **Direct Access:** Customization > Scripting > Scripts > Parts G/L Tracker

---

## Questions?

Contact Thomas Showalter for training or support.
