/* eslint-disable max-len */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Suitelet: Document Distribution – Contacts & Customers (Compacted, Persistent Dismiss + Session Hide)
 */
define(["require", "exports", "N/ui/serverWidget", "N/query", "N/record"], function (require, exports, serverWidget, query, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    const PAGE_SIZE = 1000;
    const RECTYPE_ID = 158; // For building the "Open" link
    const DD_RECORD_TYPE = 'customrecord_sna_hul_doc_distribution';
    const DISMISSED_FIELD_ID = 'custrecord_doc_distribution_dismissed';
    const SQL = `
SELECT
	dd.id AS doc_dis_id,
	dd.isinactive AS doc_dis_inactive,
	dd.custrecord_doc_distribution_email_check AS doc_dis_email_check,
	dd.custrecord_doc_distribution_emailaddress AS doc_dis_email,

	c.id AS contact_id,
	c.entityid AS contact_name,
	c.email AS contact_email,

	cust.id AS contact_customer_id,
	cust.entityid AS contact_customer_name,
	cust.email AS contact_customer_email,

	dd.custrecord_doc_distribution_customer AS dd_customer_id,
	cust_dd.entityid AS dd_customer_name,
	cust_dd.email AS dd_customer_email,

	CASE WHEN dd.custrecord_doc_distribution_customer IS NOT NULL THEN cust_dd.id ELSE cust.id END AS customer_id,
	CASE WHEN dd.custrecord_doc_distribution_customer IS NOT NULL THEN cust_dd.entityid ELSE cust.entityid END AS customer_name,
	CASE WHEN dd.custrecord_doc_distribution_customer IS NOT NULL THEN cust_dd.email ELSE cust.email END AS customer_email,

	dd.${DISMISSED_FIELD_ID} AS dd_dismissed
FROM ${DD_RECORD_TYPE} dd
LEFT JOIN MAP_customrecord_sna_hul_doc_distribution_custrecord_doc_distribution_contact m
	ON m.mapone = dd.id
LEFT JOIN contact c
	ON c.id = m.maptwo
LEFT JOIN customer cust
	ON cust.id = c.company
LEFT JOIN customer cust_dd
	ON cust_dd.id = dd.custrecord_doc_distribution_customer
ORDER BY dd.id ASC, c.entityid ASC
`;
    function addColumns(sub) {
        sub.addField({ id: 'row_num', type: serverWidget.FieldType.INTEGER, label: '#' });
        sub.addField({ id: 'hide_line', type: serverWidget.FieldType.CHECKBOX, label: 'Hide (session)' });
        sub.addField({ id: 'dismiss', type: serverWidget.FieldType.CHECKBOX, label: 'Dismiss (persist)' });
        sub.addField({ id: 'apply_email', type: serverWidget.FieldType.CHECKBOX, label: 'Apply to Customer' });
        sub.addField({ id: 'doc_dis_id', type: serverWidget.FieldType.TEXT, label: 'Doc Dist ID' });
        const linkField = sub.addField({ id: 'doc_dis_link', type: serverWidget.FieldType.URL, label: 'Open' });
        linkField.linkText = 'Open';
        sub.addField({ id: 'doc_dis_inactive', type: serverWidget.FieldType.TEXT, label: 'Doc Dist Inactive' });
        sub.addField({ id: 'doc_dis_email_check', type: serverWidget.FieldType.TEXT, label: 'Use Override Email?' });
        sub.addField({ id: 'doc_dis_email', type: serverWidget.FieldType.TEXT, label: 'Doc Dist Email (raw)' });
        sub.addField({ id: 'contact_id', type: serverWidget.FieldType.TEXT, label: 'Contact ID' });
        sub.addField({ id: 'contact_name', type: serverWidget.FieldType.TEXT, label: 'Contact Name' });
        sub.addField({ id: 'contact_email', type: serverWidget.FieldType.TEXT, label: 'Contact Email' });
        sub.addField({ id: 'customer_id', type: serverWidget.FieldType.TEXT, label: 'Customer ID' });
        sub.addField({ id: 'customer_name', type: serverWidget.FieldType.TEXT, label: 'Customer Name' });
        sub.addField({ id: 'customer_email', type: serverWidget.FieldType.TEXT, label: 'Customer Email' });
        const fldTC = sub.addField({ id: 'target_customer_id', type: serverWidget.FieldType.TEXT, label: 'Target Cust ID' });
        fldTC.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        const fldTE = sub.addField({ id: 'target_email', type: serverWidget.FieldType.TEXT, label: 'Target Email' });
        fldTE.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
    }
    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function normEmail(v) {
        return (v ?? '').toString().trim().toLowerCase();
    }
    function parseEmails(v) {
        const s = (v ?? '').toString();
        const matches = s.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
        if (!matches)
            return [];
        const uniq = new Set();
        for (const m of matches)
            uniq.add(m.trim().toLowerCase());
        return Array.from(uniq);
    }
    function domainOf(normalizedEmail) {
        const at = normalizedEmail.lastIndexOf('@');
        return at >= 0 ? normalizedEmail.substring(at + 1) : '';
    }
    function domainsOfEmails(emails) {
        const s = new Set();
        for (const e of emails) {
            const d = domainOf(e);
            if (d)
                s.add(d);
        }
        return s;
    }
    function pickEmailForCustomer(ddEmails, customerEmail, contactEmail) {
        if (ddEmails.length === 0)
            return '';
        if (customerEmail && ddEmails.includes(customerEmail))
            return '';
        const custDom = domainOf(customerEmail);
        if (custDom) {
            const m = ddEmails.find((e) => domainOf(e) === custDom);
            if (m)
                return m;
        }
        if (contactEmail && ddEmails.includes(contactEmail))
            return contactEmail;
        return ddEmails[0];
    }
    function rowPassesFilter(r, hidden) {
        const ddEmails = parseEmails(r['doc_dis_email']);
        const ddDomains = domainsOfEmails(ddEmails);
        const contactEmail = normEmail(r['contact_email']);
        const customerEmail = normEmail(r['customer_email']);
        const contactDomain = domainOf(contactEmail);
        const customerDomain = domainOf(customerEmail);
        const ddCustomerId = (r['dd_customer_id'] ?? '').toString();
        const ddCustomerEmail = normEmail(r['dd_customer_email']);
        const docId = (r['doc_dis_id'] ?? '').toString();
        if (docId && hidden.has(docId))
            return false;
        const ddDismissedVal = (r['dd_dismissed'] ?? '').toString().toUpperCase();
        if (ddDismissedVal === 'T' || ddDismissedVal === 'TRUE' || ddDismissedVal === '1')
            return false;
        // Doc vs Customer domain (exclude if ANY DD email shares customer domain)
        if (customerDomain && ddDomains.has(customerDomain))
            return false;
        // Contact vs Customer exact match
        if (contactEmail && customerEmail && contactEmail === customerEmail)
            return false;
        // Explicit "all three domains match"
        if (contactDomain && customerDomain && contactDomain === customerDomain && ddDomains.has(customerDomain)) {
            return false;
        }
        // DD-linked customer exact match
        if (ddCustomerId && ddCustomerEmail && ddEmails.length > 0) {
            if (ddEmails.includes(ddCustomerEmail))
                return false;
        }
        // All blank
        if (ddEmails.length === 0 && !contactEmail && !customerEmail)
            return false;
        return true;
    }
    function onRequest(ctx) {
        try {
            const req = ctx.request;
            const res = ctx.response;
            // Read requested page from either the dropdown field or a URL param; default to page 1
            const fpageFromField = req.parameters.custpage_fpage;
            const fpageFromUrl = req.parameters.fpage;
            const fpageParam = fpageFromField || fpageFromUrl;
            const requestedIndex = Math.max(0, isFinite(+fpageParam) ? parseInt(fpageParam, 10) - 1 : 0);
            // Hidden ids persisted in a hidden textarea (session-level)
            let hiddenIds = new Set();
            const hiddenCsv = req.parameters.custpage_hidden;
            if (hiddenCsv) {
                for (const part of hiddenCsv.split(',')) {
                    const v = part.trim();
                    if (v)
                        hiddenIds.add(v);
                }
            }
            const updateSummary = [];
            let updated = 0;
            let skipped = 0;
            let failed = 0;
            let dismissedPersisted = 0;
            let dismissFailed = 0;
            // Handle POST actions (hide/dismiss/apply)
            if (req.method === 'POST') {
                const lineCount = req.getLineCount
                    ? req.getLineCount({ group: 'custpage_results' })
                    : 0;
                const clearHidden = req.parameters.custpage_clear_hidden === 'T';
                if (clearHidden)
                    hiddenIds = new Set();
                for (let i = 0; i < lineCount; i += 1) {
                    const hide = req.getSublistValue
                        ? req.getSublistValue({ group: 'custpage_results', name: 'hide_line', line: i })
                        : 'F';
                    if (hide === 'T') {
                        const ddId = req.getSublistValue({ group: 'custpage_results', name: 'doc_dis_id', line: i });
                        if (ddId)
                            hiddenIds.add(ddId);
                    }
                    const dis = req.getSublistValue
                        ? req.getSublistValue({ group: 'custpage_results', name: 'dismiss', line: i })
                        : 'F';
                    if (dis === 'T') {
                        const ddId = req.getSublistValue({ group: 'custpage_results', name: 'doc_dis_id', line: i });
                        if (ddId) {
                            try {
                                record.submitFields({
                                    type: DD_RECORD_TYPE,
                                    id: parseInt(ddId, 10),
                                    values: { [DISMISSED_FIELD_ID]: true },
                                    options: { enableSourcing: false, ignoreMandatoryFields: true }
                                });
                                dismissedPersisted += 1;
                            }
                            catch (err) {
                                dismissFailed += 1;
                                updateSummary.push(`FAILED dismiss DD ${ddId}: ${err.message}`);
                            }
                        }
                    }
                    const apply = req.getSublistValue
                        ? req.getSublistValue({ group: 'custpage_results', name: 'apply_email', line: i })
                        : 'F';
                    if (apply === 'T') {
                        const custId = req.getSublistValue({ group: 'custpage_results', name: 'target_customer_id', line: i });
                        const targetEmail = req.getSublistValue({ group: 'custpage_results', name: 'target_email', line: i });
                        const currentEmail = normEmail(req.getSublistValue({ group: 'custpage_results', name: 'customer_email', line: i }));
                        const docId = req.getSublistValue({ group: 'custpage_results', name: 'doc_dis_id', line: i });
                        if (!custId || !targetEmail) {
                            skipped += 1;
                            updateSummary.push(`Skipped (missing target): DD ${docId || '?'} → cust ${custId || '?'} target "${targetEmail || ''}"`);
                            continue;
                        }
                        if (normEmail(targetEmail) === currentEmail) {
                            skipped += 1;
                            updateSummary.push(`Skipped (no change): DD ${docId} → cust ${custId} already "${targetEmail}"`);
                            continue;
                        }
                        try {
                            record.submitFields({
                                type: record.Type.CUSTOMER,
                                id: parseInt(custId, 10),
                                values: { email: targetEmail },
                                options: { enableSourcing: false, ignoreMandatoryFields: true }
                            });
                            updated += 1;
                            updateSummary.push(`Updated: cust ${custId} email ← "${targetEmail}" (DD ${docId})`);
                        }
                        catch (err) {
                            failed += 1;
                            updateSummary.push(`FAILED: cust ${custId} ← "${targetEmail}" (DD ${docId}) :: ${err.message}`);
                        }
                    }
                }
            }
            const form = serverWidget.createForm({ title: 'Document Distribution – Contacts & Customers (Compacted)' });
            // attach client script (update the path to where you save the file)
            form.clientScriptModulePath = './hul_doc_distribution_cs.js';
            form.addSubmitButton({ label: 'Apply / Refresh' });
            // Persist **hidden** ids (CSV, session-level)
            const fldHidden = form.addField({
                id: 'custpage_hidden',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Hidden IDs (session)'
            });
            fldHidden.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            fldHidden.defaultValue = Array.from(hiddenIds).join(',');
            // Clear hidden toggle (reflect submitted value)
            const clearHiddenChecked = req.parameters.custpage_clear_hidden === 'T';
            form.addField({
                id: 'custpage_clear_hidden',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Clear Hidden on Submit'
            }).defaultValue = clearHiddenChecked ? 'T' : 'F';
            // If any updates were processed, show a summary
            if (req.method === 'POST' && (updated || skipped || failed || dismissedPersisted || dismissFailed || updateSummary.length)) {
                const summary = form.addField({
                    id: 'custpage_update_summary',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Update Summary'
                });
                summary.defaultValue = `
                <div style="font-size:12px;margin:8px 0;">
                  <div><b>Customer Email Updates:</b> Updated ${updated}, Skipped ${skipped}, Failed ${failed}</div>
                  <div><b>Dismiss persisted:</b> ${dismissedPersisted}, <b>Dismiss failed:</b> ${dismissFailed}</div>
                  <div style="margin-top:4px;white-space:pre-wrap;">${escapeHtml(updateSummary.join('\n'))}</div>
                </div>`;
            }
            // --- Query & build the filtered view ---
            const paged = query.runSuiteQLPaged({ query: SQL, pageSize: PAGE_SIZE });
            const rawTotalPages = paged.pageRanges.length;
            // Sublist
            const sub = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'Results'
            });
            addColumns(sub);
            // Walk raw pages and compact into filtered pages (count all, render just current page)
            let filteredTotalRows = 0;
            let displayed = 0;
            // We'll use requestedIndex for rendering; it will be clamped later when we show the dropdown
            const filteredStartRow = requestedIndex * PAGE_SIZE;
            for (let rawPageIdx = 0; rawPageIdx < rawTotalPages; rawPageIdx += 1) {
                const page = paged.fetch({ index: rawPageIdx });
                const rows = page.data.asMappedResults();
                for (const r of rows) {
                    if (!rowPassesFilter(r, hiddenIds))
                        continue;
                    // Count every passing row
                    filteredTotalRows += 1;
                    // Only render rows that fall into the current filtered page window
                    if (filteredTotalRows <= filteredStartRow)
                        continue;
                    if (displayed >= PAGE_SIZE)
                        continue;
                    const get = (k) => (r[k] ?? '').toString();
                    // Row number: sequential per visible page (restarts at 1)
                    const rowNumber = displayed + 1;
                    sub.setSublistValue({ id: 'row_num', line: displayed, value: String(rowNumber) });
                    // Doc Dist ID + link
                    const idVal = get('doc_dis_id');
                    sub.setSublistValue({ id: 'doc_dis_id', line: displayed, value: idVal });
                    if (idVal) {
                        const url = `/app/common/custom/custrecordentry.nl?rectype=${RECTYPE_ID}&id=${idVal}`;
                        sub.setSublistValue({ id: 'doc_dis_link', line: displayed, value: url });
                    }
                    // Default action checkboxes
                    sub.setSublistValue({ id: 'hide_line', line: displayed, value: 'F' });
                    sub.setSublistValue({ id: 'dismiss', line: displayed, value: 'F' });
                    sub.setSublistValue({ id: 'apply_email', line: displayed, value: 'F' });
                    // Visible data
                    sub.setSublistValue({ id: 'doc_dis_inactive', line: displayed, value: get('doc_dis_inactive') });
                    sub.setSublistValue({ id: 'doc_dis_email_check', line: displayed, value: get('doc_dis_email_check') });
                    const rawDdEmails = get('doc_dis_email');
                    if (rawDdEmails)
                        sub.setSublistValue({ id: 'doc_dis_email', line: displayed, value: rawDdEmails });
                    const contactId = get('contact_id');
                    if (contactId)
                        sub.setSublistValue({ id: 'contact_id', line: displayed, value: contactId });
                    const contactName = get('contact_name');
                    if (contactName)
                        sub.setSublistValue({ id: 'contact_name', line: displayed, value: contactName });
                    const contactEmail = get('contact_email');
                    if (contactEmail)
                        sub.setSublistValue({ id: 'contact_email', line: displayed, value: contactEmail });
                    const customerId = get('customer_id');
                    if (customerId)
                        sub.setSublistValue({ id: 'customer_id', line: displayed, value: customerId });
                    const customerName = get('customer_name');
                    if (customerName)
                        sub.setSublistValue({ id: 'customer_name', line: displayed, value: customerName });
                    const customerEmail = get('customer_email');
                    if (customerEmail)
                        sub.setSublistValue({ id: 'customer_email', line: displayed, value: customerEmail });
                    // Targets for Apply-to-Customer
                    const ddEmails = parseEmails(rawDdEmails);
                    const targetCustomerId = get('dd_customer_id') || customerId;
                    const chosen = pickEmailForCustomer(ddEmails, normEmail(customerEmail), normEmail(contactEmail));
                    if (targetCustomerId)
                        sub.setSublistValue({ id: 'target_customer_id', line: displayed, value: targetCustomerId });
                    if (chosen)
                        sub.setSublistValue({ id: 'target_email', line: displayed, value: chosen });
                    displayed += 1;
                }
            }
            // True filtered pages from the full filtered count
            const filteredTotalPages = Math.max(1, Math.ceil(filteredTotalRows / PAGE_SIZE));
            // --- Navigation: Page selector for the FILTERED result set ---
            const fldFPage = form.addField({
                id: 'custpage_fpage',
                type: serverWidget.FieldType.SELECT,
                label: 'Go to page'
            });
            // Populate 1..filteredTotalPages
            for (let p = 1; p <= filteredTotalPages; p += 1) {
                fldFPage.addSelectOption({ value: String(p), text: `Page ${p} of ${filteredTotalPages}` });
            }
            // Clamp the requested page to the valid range for defaulting
            const safePage = Math.min(Math.max(1, requestedIndex + 1), filteredTotalPages);
            fldFPage.defaultValue = String(safePage);
            // Summary – raw dataset (pre-filter)
            form.addField({ id: 'custpage_total_rows_raw', type: serverWidget.FieldType.INTEGER, label: 'Total Rows (raw SQL)' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
                .defaultValue = String(paged.count);
            form.addField({ id: 'custpage_total_pages_raw', type: serverWidget.FieldType.INTEGER, label: 'Total Pages (raw SQL)' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
                .defaultValue = String(Math.max(1, rawTotalPages));
            // Summary – filtered/compacted view
            form.addField({ id: 'custpage_filtered_rows', type: serverWidget.FieldType.INTEGER, label: 'Filtered Total Rows' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
                .defaultValue = String(filteredTotalRows);
            form.addField({ id: 'custpage_filtered_pages', type: serverWidget.FieldType.INTEGER, label: 'Filtered Total Pages' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
                .defaultValue = String(filteredTotalPages);
            // Helpful: how many rows are shown right now
            form.addField({ id: 'custpage_displayed_rows', type: serverWidget.FieldType.INTEGER, label: 'Rows on this page' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
                .defaultValue = String(displayed);
            const help = form.addField({
                id: 'custpage_help',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Help'
            });
            help.defaultValue = `
            <div style="font-size:12px;color:#666;margin-top:8px;">
                <b>#</b> shows the row number for the current visible page (after filtering).<br/>
                Use <b>Go to page</b> to jump around the filtered result set, then click <b>Apply / Refresh</b>.<br/>
                <b>Customer shown</b> = DD's Customer if present; otherwise the Contact's Customer.<br/>
                <b>Hide (session)</b> hides a row in this Suitelet session only. Use "Clear Hidden on Submit" to undo.<br/>
                <b>Dismiss (persist)</b> writes a flag on the DD record; the row won't reappear until that field is cleared.
            </div>`;
            res.writePage(form);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            const form = serverWidget.createForm({ title: 'Document Distribution – Error' });
            const msg = form.addField({ id: 'custpage_err', type: serverWidget.FieldType.INLINEHTML, label: 'Error' });
            msg.defaultValue = `<div style="color:#b00;white-space:pre-wrap;">${escapeHtml(message)}</div>`;
            ctx.response.writePage(form);
        }
    }
    exports.onRequest = onRequest;
});
