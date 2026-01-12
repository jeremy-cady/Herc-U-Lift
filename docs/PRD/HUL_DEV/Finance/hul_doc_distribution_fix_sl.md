# hul_doc_distribution_fix_sl

Suitelet that lists Document Distribution records with contact/customer email context, applies filtering, and supports session hide, persistent dismiss, and customer email updates.

## Script Info
- Type: Suitelet
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_doc_distribution_fix_sl.ts`
- Client script: `hul_doc_distribution_cs.js`

## Purpose
- Surface Document Distribution records where emails/domains do not align with contact or customer data.
- Allow users to:
  - Hide rows for the current session.
  - Persistently dismiss rows.
  - Apply a selected email to the customer record.

## Data Source
- Uses SuiteQL (paged) to join:
  - Document Distribution custom record
  - Contacts and their customers
  - Optional customer specified on the Document Distribution record

## UI Elements
- Suitelet form titled "Document Distribution – Contacts & Customers (Compacted)".
- Sublist `custpage_results` with:
  - Action checkboxes: `hide_line`, `dismiss`, `apply_email`
  - Document Distribution metadata and link
  - Contact and customer identifiers/emails
  - Hidden target fields for update actions
- Summary fields showing raw vs filtered counts and current page size.
- Help block describing behavior and navigation.

## Filtering Rules (rowPassesFilter)
A row is excluded when any of the following is true:
- It was hidden in this session (hidden IDs list).
- It was previously dismissed (persisted flag on the DD record).
- Any DD email domain matches the customer domain.
- Contact email matches customer email exactly.
- Contact and customer domains match and DD email shares that domain.
- DD customer email matches any DD email (for DD-linked customer).
- All of DD emails, contact email, and customer email are blank.

## Actions on Submit
- **Hide (session):** stores DD record IDs in a hidden CSV field.
- **Dismiss (persist):** sets `custrecord_doc_distribution_dismissed` to `true` on the DD record.
- **Apply to Customer:** updates `customer.email` with a selected target email, skipping if no change.

## Email Selection Logic
When applying to customer, the Suitelet picks a target email using:
1. DD email matching customer email (no change).
2. DD email matching customer domain.
3. Contact email present in DD email list.
4. First DD email as a fallback.

## Pagination
- Uses SuiteQL paging with a page size of 1000.
- Counts filtered rows separately and rebuilds filtered pages on demand.
- Supports page navigation via a dropdown with `custpage_fpage`.

## Error Handling
- Wraps `onRequest` in try/catch.
- Displays an error form with the message if a failure occurs.
