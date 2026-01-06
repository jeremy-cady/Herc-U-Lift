/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * Purpose: Nightly job to uncheck "Do Not Sync to Versapay" on today's Invoices
 *          when the Revenue Stream is in the external list; emails a summary.
 */

import * as query from 'N/query';
import * as record from 'N/record';
import * as log from 'N/log';
import * as email from 'N/email';
import * as runtime from 'N/runtime';

const FIELD_DO_NOT_SYNC = 'custbody_versapay_do_not_sync';

// External revenue stream values → uncheck when matched
const revStreamExternalValues: number[] = [
    1, 3, 4, 5, 6, 7, 8, 18, 19, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
    117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 203, 204, 205, 206,
    207, 208, 209, 263, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421,
    422, 423, 424, 425, 441
];

const revStreamExternalSet = new Set<number>(revStreamExternalValues);

// Today's invoices by CREATEDDATE (UTC day window using TRUNC(CURRENT_DATE))
const INVOICES_TODAY_SQL = `
    SELECT
        t.id,
        t.createddate,
        t.cseg_sna_revenue_st AS revstream,
        t.custbody_versapay_do_not_sync AS donotsync
    FROM
        transaction t
    WHERE
        t.type = 'CustInvc'
        AND t.createddate >= TRUNC(CURRENT_DATE)
        AND t.createddate < TRUNC(CURRENT_DATE) + 1
    ORDER BY
        t.id ASC
`;

function run(): void {
    const changed: number[] = [];
    const skipped: number[] = [];
    const noRevStream: number[] = [];
    const errors: { id: number; message: string }[] = [];

    try {
        log.audit('Versapay Daily Uncheck', 'Querying today\'s Invoices by createddate…');

        const rs = query.runSuiteQL({ query: INVOICES_TODAY_SQL });
        const rows = rs.asMappedResults() as Array<{
            id: string;
            createddate: string;
            revstream: string | number | null;
            donotsync: string | boolean | null;
        }>;

        log.audit('Versapay Daily Uncheck', `Found ${rows.length} invoice(s) created today`);

        for (const row of rows) {
            const id = Number(row.id);
            const revNum = toNumberOrNull(row.revstream);

            if (revNum === null) {
                noRevStream.push(id);
                continue;
            }

            if (revStreamExternalSet.has(revNum)) {
                try {
                    record.submitFields({
                        type: record.Type.INVOICE,
                        id,
                        values: { [FIELD_DO_NOT_SYNC]: false },
                        options: { enableSourcing: false, ignoreMandatoryFields: true }
                    });
                    changed.push(id);
                } catch (e: any) {
                    errors.push({ id, message: e?.message || String(e) });
                    log.error('SubmitFields failed', `Invoice ${id}: ${e?.message || e}`);
                }
            } else {
                skipped.push(id);
            }
        }

        const user = runtime.getCurrentUser();
        const recipientId = user.id;
        const subject = `Versapay Daily Uncheck: ${changed.length} updated, ${skipped.length} skipped`;
        const body = buildEmailBody(changed, skipped, noRevStream, errors);

        try {
            email.send({
                author: recipientId,
                recipients: [recipientId],
                subject,
                body
            });
            log.audit('Summary email sent', subject);
        } catch (e: any) {
            log.error('Email send failed', e?.message || String(e));
        }

        log.audit('Versapay Daily Uncheck complete', JSON.stringify({
            updated: changed.length,
            skipped: skipped.length,
            noRevStream: noRevStream.length,
            errors: errors.length
        }));
    } catch (e: any) {
        log.error('Fatal error', e?.message || String(e));
        throw e;
    }
}

function toNumberOrNull(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

function buildEmailBody(
    changed: number[],
    skipped: number[],
    noRevStream: number[],
    errors: { id: number; message: string }[]
): string {
    return [
        'Versapay Daily Uncheck Results',
        '',
        `Updated (set Do Not Sync = false): ${changed.length}`,
        changed.length ? changed.join(', ') : '(none)',
        '',
        `Skipped (revstream not in external list): ${skipped.length}`,
        skipped.length ? skipped.join(', ') : '(none)',
        '',
        `No Revenue Stream value: ${noRevStream.length}`,
        noRevStream.length ? noRevStream.join(', ') : '(none)',
        '',
        `Errors: ${errors.length}`,
        ...errors.map((e) => `#${e.id}: ${e.message}`)
    ].join('\n');
}

export = { execute: run };
